

colonyDismantle=function(colony)
{
    if(!colony.dimantlers) {colony.dimantlers = []}
    if(!colony.disTargets) {colony.disTargets = []}

    for(let creep of Colony.Helpers.MaintainWorkers(colony.dimantlers,colony.disTargets.length > 0 ? 1 : 0))
    {
        let target = Game.getObjectById(colony.disTargets[0])
        if (target) 
        {
            if(target.my && target instanceof Structure)
            {
                target.destroy();
            }

            if (creep) 
            {
                creep.dismantleLoop(target)
            }
        }
        else
        {
            colony.disTargets.shift();
        }
    }
}

colonyConstruct=function(colony)
{
    if (typeof colony.constructionsite === "string") 
    {
        let construction = Game.constructionSites[colony.constructionsite]
        if (!construction) 
        {
            delete colony.constructionsite
        }
        else
        {
            colony.workerpool.forEach((c) => 
            {
                let creep = Game.creeps[c];
                if (creep) 
                {
                    creep.updateHarvestState()
                    if (creep.memory.harvesting) 
                    {
                        if(creep.pos.roomName != colony.pos.roomName && creep.room.sources.length == 0)
                        {
                            creep.travelTo(new RoomPosition(colony.pos.x,colony.pos.y,colony.pos.roomName));   
                        }
                        else
                        {
                            creep.dumbHarvest()
                        }
                    }
                    else
                    {
                        let code;
                        if (construction instanceof Structure) 
                        {
                            code = creep.do("repair",construction)
                            if (construction.hits == construction.hitsMax) 
                            {    
                                delete colony.constructionsite
                            }
                        }
                        else
                        {
                            code = creep.do("build",construction)
                        }
                        
                        if (code == ERR_NOT_IN_RANGE) 
                        {
                            creep.travelTo(construction)
                        }
                    }
                }
            })
        }
    }
    else
    {
        let sites = Game.rooms[colony.constructionsite.roomName].lookForAt(LOOK_CONSTRUCTION_SITES,colony.constructionsite.x,colony.constructionsite.y)
        if(sites.length > 0)
        {
            colony.constructionsite = sites[0].id
        }
        else
        {
            delete colony.constructionsite;
        }
    }
}

colonyMiningSpots=function(colony)
{
    for(let i in colony.miningSpots)
    {
        let spot = colony.miningSpots[i];
        let room = Game.rooms[spot.myPosition.roomName];
        if (!spot.layout) 
        {
            if (room) 
            {
                spot.layout = [];
                for (var c = 0; c < 3; c++) 
                {
                    spot.layout.push([]);
                    for (var j = 0; j < 3; j++) {
                        spot.layout[c].push();
                    }
                }
            
                let list = room.lookForAt(LOOK_MINERALS,spot.myPosition.x,spot.myPosition.y);
                if (list.length > 0) 
                {
                    spot.layout[1][1] = STRUCTURE_EXTRACTOR;
                }
                
                let pathToColony = PathFinder.search(new RoomPosition(spot.myPosition.x,spot.myPosition.y,spot.myPosition.roomName),new RoomPosition(colony.pos.x,colony.pos.y,colony.pos.roomName))
                if(!pathToColony.incomplete)
                {
                    spot.digPos = pathToColony.path[0];
                    let ofx = spot.digPos.x - spot.myPosition.x + 1;
                    let ofy = spot.digPos.y - spot.myPosition.y + 1;
                    
                    spot.layout[ofy][ofx] = STRUCTURE_CONTAINER
                }
            }
        }
        else
        {
            if(spot.type && spot.type == 'source' && spot.myPosition.roomName == colony.pos.roomName && room && room.controller && room.controller.level >= 6)
            {
                if (!spot.linkPosition) 
                {
                    //let terrain = new Room.Terrain(spot.myPosition.roomName)
                    //for (var at = 0; at < 9; at++) 
                    //{
                    //    let x = at%3;
                    //    let y = Math.floor(at/3);
                    //    if (!spot.layout[y][x]) 
                    //    {
                    //        let apos = new RoomPosition(spot.myPosition.x + x-1, spot.myPosition.y + y-1,spot.myPosition.roomName) 
                    //        if (apos.isNearTo(spot.digPos.x,spot.digPos.y) && terrain.get(apos.x,apos.y) != TERRAIN_MASK_WALL) 
                    //        {
                    //            spot.linkPosition = apos;
                    //            spot.layout[y][x] = STRUCTURE_LINK;
                    //            break;
                    //        }
                    //    }
                    //}
                }
                else if (!spot.link) 
                {
                    let result = room.lookAt(spot.linkPosition.x,spot.linkPosition.y);
                    result.forEach((r) =>{
                        if (r.type == 'structure' && r.structure instanceof StructureLink) 
                        {
                            console.log("miningspot found link with id: " + r.structure.id)
                            spot.link = r.structure.id;
                        }
                    })
                }
            }
        }
    }
}

ColonyLookForPower = function(colony)
{
    let room = Game.rooms[colony.pos.roomName];
    if(!room) { return; }
    if(!room.observer) { return; }
    if(colony.expedition) { return; }
    if(!room.storage) { return; }
    if(room.storage.store.getUsedCapacity(RESOURCE_ENERGY) < POWER_SEARCHING_ENERGY_LIMIT) { return; }

    if(!PowerPatrols[colony.pos.roomName])
    {
        PowerPatrols[colony.pos.roomName] = AllCorridorsWithinRange(colony.pos.roomName,7);
    }
    if(!colony.corridorIndex)
    {
        colony.corridorIndex = 0;
    }

    let list = PowerPatrols[colony.pos.roomName];
    if(!list || list.length < 1) { return; }
    colony.corridorIndex = colony.corridorIndex % list.length;
    let vRoom = Game.rooms[list[colony.corridorIndex]];
    if(vRoom)
    {
        if(vRoom.powerBank)
        {
            let timeLeft = vRoom.powerBank.ticksToDecay;
            let quality = (vRoom.powerBank.power - POWER_BANK_CAPACITY_MIN) / (POWER_BANK_CAPACITY_MAX - POWER_BANK_CAPACITY_MIN)
            let distance = GetRoomDiamondDistance(colony.pos.roomName,vRoom.name);
            let slots = 0;
            let pos = vRoom.powerBank.pos;
            let terrain = vRoom.getTerrain();
            ALL_DIRECTIONS.forEach((d) =>
            {
                if(terrain.get(pos.x + DIRECTION_OFFSET[d][0],pos.y + DIRECTION_OFFSET[d][1]) != TERRAIN_MASK_WALL)
                {
                    slots++;
                }
            })
            let attractivness = 1;
            attractivness *= slots > 2 ? 1.2 : slots < 2 ? 0 : 1; // 0 : 1 : 1.2
            attractivness *= quality; // 0 -> 2?
            attractivness *= timeLeft < 3000 ? 0 : (timeLeft - 3000) / 1000; // 0 -> 1.5 
            attractivness *= distance == 1 ? 5 : (10-distance) / 10 + 0.5;

            vRoom.find(FIND_CREEPS).forEach((c) =>{
                if(!c.my)
                {
                    attractivness = 0;
                }
            })

            console.log("Found Power in " + vRoom.name + " time left: " + timeLeft + " quality: " + quality + " distance: " + distance + " slots: " + slots + " attractiveness: " + attractivness);
            if(attractivness > 0.5)
            {
                let busy = false; 
                Memory.colonies.forEach((c) => {
                    if(c.expedition && c.expedition.targetRoom == vRoom.name)
                    {
                        busy = true;
                    }
                })
                if(!busy)
                {
                    colony.expedition = {}
                    let exp = colony.expedition;
                    exp.targetRoom = vRoom.name;
                    exp.target = vRoom.powerBank.id;
                    exp.endDate = Game.time + timeLeft;
                    exp.amount = vRoom.powerBank.power;
                    exp.slots = slots;
                    exp.pos = pos;
                    console.log(vRoom.name + " is attractive enough, starting expedition");
                }
            }
        }
    }

    room.observer.observeRoom(list[(colony.corridorIndex+1) % list.length]);
    colony.corridorIndex++;
}

