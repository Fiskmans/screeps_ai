

ColonyIdleWorkers=function(colony)
{
    if(colony.level == 8 && !Performance.Decisions.Enabled("normal_mode"))
    {
        ColonyControllerKeepAlive(colony);
        return;
    }
    if(colony.sendLink && colony.upgradeLink)
    {
        ColonyUpgradeLinked(colony);
    }
    else
    {
        ColonyIdleWorkersDumb(colony);
    }
}

ColonyControllerKeepAlive=function(colony)
{
    let room = Game.rooms[colony.pos.roomName];
    if(room.controller.ticksToDowngrade < CONTROLLER_DOWNGRADE[colony.level] - CONTROLLER_DOWNGRADE_RESTORE)
    {
        if(colony.sendLink && colony.upgradeLink)
        {
            ColonyUpgradeLinked(colony);
        }
        else
        {
            ColonyIdleWorkersDumb(colony);
        }
    }
}

ColonyIdleWorkersDumb=function(colony)
{
    for(var creep of Helpers.Creep.List(colony.workerpool))
    {
        if (creep.pos.roomName != colony.pos.roomName) 
        {
            creep.GoToRoom(colony.pos.roomName);
        }
        else
        {
            creep.dumbUpgradeLoop()
        }
    }
}

ColonyUpgradeLinked=function(colony)
{
    if(!colony.upgradeLink)
    {
        return;
    }

    let link = Game.getObjectById(colony.upgradeLink)
    if(!link || !(link instanceof StructureLink))
    {
        delete colony.upgradeLink;
        return;
    }

    let sendLink = Game.getObjectById(colony.sendLink);
    if(!sendLink)
    {
        delete colony.sendLink;
        return;
    }

    RequestResource(colony,colony.sendLink,RESOURCE_ENERGY,LINK_CAPACITY,REQUEST_PRIORITY_PROGRESS);

    if(link.store.getUsedCapacity(RESOURCE_ENERGY) < 200)
    {
        sendLink.transferEnergy(link);
    }


    for(var creep of Helpers.Creep.List(colony.workerpool))
    {
        if (creep.pos.roomName != colony.pos.roomName) 
        {
            creep.GoToRoom(colony.pos.roomName);
        }
        else
        {
            creep.smarterUpgradeLoop(link);
        }
    }
}

FindLinkInColonyLayout=function(colony,blackList)
{
    let buildings = DeserializeLayout(colony.layout,colony.pos.roomName);
    for(let b of buildings)
    {
        if(b.structure == STRUCTURE_LINK)
        {
            for(let s of b.pos.lookFor(LOOK_STRUCTURES))
            {
                if(s.structureType == STRUCTURE_LINK && !blackList.includes(s.id))
                {
                    console.log("found link: " + s);
                    return s.id;
                }
            }
        }
    }
    return false;
}

FindColonyLinks=function(colony)
{
    let blacklist = [];
    if(colony.sendLink)
    {
        blacklist.push(colony.sendLink);
    }
    if(colony.recievelink)
    {
        blacklist.push(colony.recievelink);
    }

    if(colony.recievelink && colony.sendLink)
    {
        if(colony.recievelink == colony.sendLink)
        {
            delete colony.recievelink;
        }
    }

    if (!colony.sendLink) 
    {
        if(colony.recievelink)
        {
            colony.sendLink = colony.recievelink;
            delete colony.recievelink;
        }
        else
        {
            let id = FindLinkInColonyLayout(colony,blacklist);
            if(id)
            {
                colony.sendLink = id;
                console.log("colony " + colony.pos.roomName + " found send link with id: " + id);
            }
        }
    }
    if (!colony.recievelink) 
    {
        let id = FindLinkInColonyLayout(colony,blacklist);
        if(id)
        {
            colony.recievelink = id;
            console.log("colony " + colony.pos.roomName + " found rec link with id: " + id);
        }
    }
}

ColonyFindMisplaced=function(colony,structureType,layout)
{
    let room = Game.rooms[colony.pos.roomName];
    if(room)
    {
        let all = room.find(FIND_STRUCTURES,{filter:(s) =>
        {
            return s.structureType == structureType;
        }});

        if(!layout) { return; }
        var wrong = false;
        all.forEach((s) =>
        {
            if(!wrong) 
            {
                let dx = s.pos.x - colony.pos.x;
                let dy = s.pos.y - colony.pos.y;
                if(dx < 0 ||dy < 0 ||dy >= layout.length || dx >= layout[dy].length || layout[dy][dx] != structureType)
                {
                    wrong = s;
                }
            }
        })
        if(wrong)
        {
            console.log("Found misplaced " + structureType + " at " + wrong.pos.x + " " + wrong.pos.y + " " + wrong.pos.roomName);
        }
        return wrong;
    }
}

ColonyFindBuildingWork=function(colony)
{
    if(Game.time % COLONY_CHECK_BUILDINGS_INTERVAL != 0)
    {
        return;
    }

    ColonyBuildDynamic(colony);
}

DeserializeLayout=function(layoutString,roomName)
{
    let layout = [];
    for(let i = 0; i < layoutString.length - 2; i += 3)
    {
        let building = layoutString.charAt(i);
        let x = layoutString.charAt(i+1);
        let y = layoutString.charAt(i+2);

        layout.push({structure:CHAR_STRUCTURE[building],pos:new RoomPosition(COMPACT_NUMBER["Decode"][x], COMPACT_NUMBER["Decode"][y], roomName)});
    }
    return layout;
}

SerializeLayout=function(layout)
{
    let result = "";
    for(let b of layout)
    {
        result +=   
        STRUCTURE_CHAR[b.structure] + 
        COMPACT_NUMBER["Encode"][b.pos.x] + 
        COMPACT_NUMBER["Encode"][b.pos.y];
    }
    return result;
}

BuildMissing=function(colony,buildings)
{
    let room = Game.rooms[colony.pos.roomName];
    if(!room)
    {
        return;
    }

    for(let b of buildings)
    {
        let structsAt = b.pos.lookFor(LOOK_STRUCTURES);
        let isThere = false;
        structsAt.forEach((s) =>
        {
            if(s.structureType==b.structure)
            {
                isThere = true;
            }
        })
        if(!isThere)
        {
            StartBuilding(colony,room,b);
            return true;
        }
    };

    return false;
}

ColonyBuildDynamic=function(colony)
{
    let room = Game.rooms[colony.pos.roomName];
    if(!room)
    {
        return;
    }

    let mainBuildings = DeserializeLayout(colony.layout,colony.pos.roomName);

    if(BuildMissing(colony,mainBuildings))
    {
        return;
    }

    if(colony.subLayouts)
    {
        for(let layout of Object.values(colony.subLayouts))
        {
            let buildings2 = DeserializeLayout(layout,colony.pos.roomName);
            if(BuildMissing(colony,buildings2))
            {
                return;
            }
        }
    }
}

FindMissplaced=function(colony,room,type)
{
    let buildings = DeserializeLayout(colony.layout,colony.pos.roomName);
    if(colony.subLayouts)
    {
        for(let layout of Object.values(colony.subLayouts))
        {
            buildings = buildings.concat(DeserializeLayout(layout,colony.pos.roomName))
        }
    }

    buildings = _.filter(buildings,(s) => { return s.structure == type});

    let ofType = room.Structures(type);

    for(let b of ofType)
    {
        let allowed = false;
        for(let s of buildings)
        {
            if(s.pos.x == b.pos.x && s.pos.y == b.pos.y)
            {
                allowed = true;
                break;
            }
        }
        if(!allowed && !colony.disTargets.includes(b.id))
        {
            colony.disTargets.push(b.id);
            break;
        }
    }

}

StartBuilding=function(colony,room,building)
{
    if (room.controller && room.controller.level > 5 && room.storage && room.storage.store.getUsedCapacity(RESOURCE_ENERGY) < CONSTRUCTION_COST[building]) 
    {
        return;
    }
    let err = building.pos.createConstructionSite(building.structure);

    
    if (err == OK)
    {
        console.log("Starting work on " + building.structure + " at " + building.pos.x + " " + building.pos.y + " " + building.pos.roomName)
        colony.constructionsite = building.pos
    }
    else if(err == ERR_RCL_NOT_ENOUGH)
    {
        FindMissplaced(colony,room,building.structure);
    }
    else if (err == ERR_INVALID_TARGET)
    {
        building.pos.lookFor(LOOK_STRUCTURES).forEach((s) =>
        {
            if(OBSTACLE_OBJECT_TYPES.includes(s.structureType) && !colony.disTargets.includes(s.id))
            {
                colony.disTargets.push(s.id);
            }
        });
    }
    else
    {
        console.log("Could not create constructionsite got unkown error: " + err);
    }
}

ColonySelling=function(colony,terminal)
{
    if(terminal.cooldown > 0) { return; }
    for(let r of (colony.selling || []))
    {
        Market.Actions.Sell(terminal,r);
        break;
    }
}

ColonyMerchant=function(colony)
{
    let room = Game.rooms[colony.pos.roomName]
    if(!room) { return; }
    if(!colony.selling) { return; }
    let target = {};
    target[RESOURCE_ENERGY] = TERMINAL_ENERGY_MIN;
    colony.selling.forEach((r) =>
    {
        if(r != RESOURCE_ENERGY)
        {
            target[r] = TEMRINAL_RESOURCE_MIN;
        }
    });
    let terminal = room.terminal;
    let storage = room.storage;
    if(!terminal) { return; }
    if(!storage) { return; }
    if(storage.store.getUsedCapacity(RESOURCE_ENERGY) < MARKETING_ENERGY_LOWER_LIMIT) { target = {} }

    MultiRequestResource(colony,target,terminal.id,REQUEST_PRIORITY_AUXILIARY)

    ColonySelling(colony,terminal)
}

ColonyDismantleAll=function(colony)
{
    if (colony._discheck) 
    {
        return;
    }
    let room = Game.rooms[colony.pos.roomName];
    if(!room || !room.storage || room.storage.structureType != STRUCTURE_STORAGE) { return; }
    let all = room.find(FIND_HOSTILE_STRUCTURES);
    all.forEach((s) =>
    {
        colony.disTargets.push(s.id);
    })
    colony._discheck = 1;
}

ColonyCrafting=function(colony)
{
    let room = Game.rooms[colony.pos.roomName];
    if(!room || !room.factory) { return; }
    if(!colony.crafting) { return; }

    RequestEmptying(colony,room.factory.id,colony.crafting,1,REQUEST_PRIORITY_AUXILIARY);

    let wants = {};
    for(let res in COMMODITIES[colony.crafting].components)
    {
        wants[res] = COMMODITIES[colony.crafting].components[res] * FACTORY_NUMBER_OF_CRAFTS_TO_STOCK
    }
    if(room.storage)
    {
        if(wants[RESOURCE_ENERGY] && wants[RESOURCE_ENERGY] > 0 && room.storage.store.getUsedCapacity(RESOURCE_ENERGY) < FACTORY_ENERGY_TO_LEAVE_IN_STORAGE)
        {
            delete wants[RESOURCE_ENERGY];
        }
        MultiRequestResource(colony,wants,room.factory.id,REQUEST_PRIORITY_AUXILIARY);
    }
    
    room.factory.produce(colony.crafting);
}

ColonyProcessPower=function(colony)
{
    let room = Game.rooms[colony.pos.roomName];
    if(!room) { return; }
    if(!room.storage) { return; }

    if(room.storage.store.getUsedCapacity(RESOURCE_ENERGY) < POWER_PROCESS_ENERGY_LIMIT) { return; }
    room.powerSpawn.processPower();

}

ColonyBuildRamparts=function(colony)
{
    let room = Game.rooms[colony.pos.roomName];
    if(!room)
    {
        return;
    }

    if(!room.storage)
    {
        return;
    }
        
    let store = room.storage.store;

    let hasBetterThingsToDo = colony.constructionsite || false;
    if((!hasBetterThingsToDo && colony.refreshDowngrade) || IS_SEASONAL)
    {
        hasBetterThingsToDo = true;
    }

    if(!colony.rampartbuilders) { colony.rampartbuilders = []; }

    if(colony.buildRamparts && !hasBetterThingsToDo)
    {
        Colony.Helpers.MaintainWorkers(colony,colony.rampartbuilders,colony.workersensus.length / 2);


        let target = Game.getObjectById(colony.rapartTarget);
        if(!target || Game.time % RAMPART_RETARGET_INTERVAL == 0)
        {
            delete colony.rapartTarget;
        }

        if(!colony.rapartTarget)
        {
            colony.rapartTarget = ColonyFindMostDamagedRampart(colony,room);
        }
        
        if(!colony.rapartTarget || store.getUsedCapacity(RESOURCE_ENERGY) < RAMPART_DEACTIVATE_LIMIT)
        {
            delete colony.buildRamparts;
            return;
        }

        for(let creep of Helpers.Creep.List(colony.rampartbuilders))
        {
            creep.updateHarvestState()
            if (creep.memory.harvesting) 
            {
                creep.dumbHarvest()
            }
            else
            {
                if(target instanceof StructureRampart)
                {
                    creep.do('repair',target);
                }
                else
                {
                    creep.do('build',target);
                }
            }
        }
    }
    else
    {
        Colony.Helpers.MaintainWorkers(colony,colony.rampartbuilders,0);

        if(Game.time % RAMPART_RETARGET_INTERVAL == 0 && store.getUsedCapacity(RESOURCE_ENERGY) > RAMPART_ACTIVATE_LIMIT && !hasBetterThingsToDo)
        {
            colony.buildRamparts = 1;
        }
    }
}

ColonyFindMostDamagedRampart=function(colony,room)
{
    let cramparts = room.find(FIND_MY_CONSTRUCTION_SITES,{filter:((o) => { return o.structureType == STRUCTURE_RAMPART; })});
    if(cramparts.length > 0)
    {
        return cramparts[0].id;
    }

    let ramparts = room.find(FIND_MY_STRUCTURES,{filter:((o) => { return o.structureType == STRUCTURE_RAMPART; })});
    let minhits = RAMPARTS_HITS_TO_IGNORE[colony.level];
    let lowest = false; 
    ramparts.forEach((o) =>
    {
        if(o.hits < minhits)
        {
            minhits = o.hits;
            lowest = o.id;
        }
    })
    if(lowest && minhits < RAMPART_HITS_BEFORE_NEXT_CONSTRUCTION)
    {
        return lowest;
    }

    let buildings = DeserializeLayout(colony.layout,room.name);
    for(let i in buildings)
    {
        let b = buildings[i];
        let hasRampart = false;
        b.pos.lookFor(LOOK_STRUCTURES).forEach((s) =>
        {
            if(s.structureType == STRUCTURE_RAMPART)
            {
                hasRampart = true;
            }
        })
        if(!hasRampart)
        {
            b.pos.createConstructionSite(STRUCTURE_RAMPART);
            break;
        }
    }

    return lowest;
}

FindUpgradePosition=function(colony)
{
    let room = Game.rooms[colony.pos.roomName];
    if(!room)
    {
        return;
    }

    let vis = new RoomVisual(colony.pos.roomName);

    let start = new RoomPosition(colony.pos.x,colony.pos.y,colony.pos.roomName);
    let target = room.controller.pos;

    vis.circle(start,{radius:0.4,fill:"#FF5555",opacity:1})
    vis.rect(target.x-3.5,target.y-3.5,7,7,{opacity:0.3,fill:"#AAAAAA"});

    let path = PathFinder.search(
        start,
        [{pos:target,range:3}],
        {roomCallback:avoidColonyLayout})

    if(path.incomplete)
    {
       return; 
    }

    let pos = _.last(path.path);
    vis.poly(path.path,{stroke:"#AAFFAA"});
    vis.circle(pos,{radius:0.4,fill:"#AAFFAA"})

    return pos;
}

FindUpgradeLink=function(buildings)
{
    for(let b of buildings)
    {
        if(b.structure == STRUCTURE_LINK)
        {
            return b.pos;
        }
    }
    return false;
}

FindOrCreateUpgradeLink=function(colony)
{
    if(!colony.upgradePos)
    {
        return;
    }

    if(!colony.subLayouts) 
    { 
        return; 
    }

    if(typeof colony.subLayouts["upgradeSite"] === 'undefined') 
    { 
        return; 
    }

    if(colony.upgradeLink)
    {
        return;
    }
    
    let buildings = DeserializeLayout(colony.subLayouts["upgradeSite"],colony.pos.roomName);
    let expectedPos = FindUpgradeLink(buildings);
    if(expectedPos)
    {
        for(let o of expectedPos.lookFor(LOOK_STRUCTURES))
        {
            if(o.structureType == STRUCTURE_LINK)
            {
                colony.upgradeLink = o.id;
                return;
            }
        }
        return;
    }

    let vis = new RoomVisual(colony.pos.roomName);

    let center = new RoomPosition(colony.upgradePos.x,colony.upgradePos.y,colony.upgradePos.roomName);
    let target = new RoomPosition(colony.pos.x,colony.pos.y,colony.pos.roomName);

    vis.circle(target,{radius:0.4,fill:"#AAFFAA"})

    let terrain = new Room.Terrain(colony.pos.roomName);

    for(let dir of ALL_DIRECTIONS)
    {
        let start = new RoomPosition(center.x + DIRECTION_OFFSET[dir][0],center.y + DIRECTION_OFFSET[dir][1],center.roomName)
        if(start.x < 2 || start.x > 47)
        {
            vis.circle(start,{fill:"#FFFF00"})
            continue;
        }
        if(start.y < 2 || start.y > 47)
        {
            vis.circle(start,{fill:"#FFFF00"})
            continue;
        }
        if(terrain.get(start.x,start.y) == TERRAIN_MASK_WALL)
        {
            vis.circle(start,{fill:"#FF0000"})
            continue;
        }

        vis.circle(start,{fill:"#00FF00"})

        buildings.push({structure:STRUCTURE_LINK,pos:start});

        colony.subLayouts["upgradeSite"] = SerializeLayout(buildings);

        break;
    }


}

ColonyMaintainUpgradeSite=function(colony)
{
    if(colony.level < 5)
    {
        return;
    }

    if(!colony.upgradePos)
    {
        colony.upgradePos = FindUpgradePosition(colony);
    }

    if(!colony.subLayouts) { colony.subLayouts = {}}
    if(!colony.subLayouts["upgradeSite"]) { colony.subLayouts["upgradeSite"] = "" }
    
    if(!colony.upgradeLink)
    {
        FindOrCreateUpgradeLink(colony);
    }
}

ColonyHauling=function(colony)
{
    let room = Game.rooms[colony.pos.roomName];
    if(!room || !room.storage)
    {
        return;
    }
    Scavange(colony);
    ColonyFulfillRequests(colony);
}

let EnqueueWork = function(colony)
{
    let room = Game.rooms[colony.pos.roomName];

    let list = Helpers.Creep.List(colony.haulerpool);
    let needUpdate = false;
    for(let creep of list)
    {
        if(!creep.HasAtleast1TickWorthOfWork())
        {
            needUpdate = true;
            break;
        }
    }
    if(!needUpdate)
    {
        return;
    }

    let predicted = {};
    MakeFakeStores(colony, list ,predicted);
    for(let creep of list)
    {
        creep.SimulateWork(predicted);
    }
    for(let creep of list)
    {
        if(!creep.HasAtleast1TickWorthOfWork())
        {
            EnqueueToRequests(colony,room.storage.id,creep,predicted);
        }
        if(!creep.HasAtleast1TickWorthOfWork())
        {
            EnqueueFromRequests(colony,room.storage.id,creep,predicted);
        }

        if(creep.memory._workQueue && creep.memory._workQueue.length > 200)
        {
            console.log("infloop detected");
            delete creep.memory._workQueue;
        }
    }
}

ColonyFulfillRequests=function(colony)
{    
    let room = Game.rooms[colony.pos.roomName];
    if(!room)
    {
        return;
    }

    if(!colony.requests)
    {
        return;
    }
    
    RemoveDoneRequests(colony);
    EnqueueWork(colony);    

    for(let creep of Helpers.Creep.List(colony.haulerpool))
    {
        if(creep.HasWork())
        {
            creep.DoWork();
        }

        if(_.sum(creep.body,b => { return b.type == CARRY ? 1 : 0}) >= HAULER_PARTS_AT_LEVEL[colony.level])
        {
            creep.OpportuneRenew();
        }
    }
}
    
ColonyRequestRefill=function(colony)
{
    if(Game.time % REFILL_CHECK_INTERVAL == 0)
    {
        return;
    }

    let room = Game.rooms[colony.pos.roomName];
    let perExt = colony.level < 7 ? 50 : (colony.level == 7 ? 100 : 200);
    for(let ext of room.Structures(STRUCTURE_EXTENSION))
    {
        RequestResource(colony,ext.id,RESOURCE_ENERGY,perExt,REQUEST_PRIORITY_FUNCTION);
    }
    for(let tower of room.Structures(STRUCTURE_TOWER))
    {
        RequestResource(colony,tower.id,RESOURCE_ENERGY,TOWER_REFILL_THRESHOLD,REQUEST_PRIORITY_FUNCTION);
    }
    for(let tower of room.Structures(STRUCTURE_SPAWN))
    {
        RequestResource(colony,tower.id,RESOURCE_ENERGY,300,REQUEST_PRIORITY_FUNCTION);
    }
    if(room.powerSpawn)
    {
        RequestResource(colony,room.powerSpawn.id,RESOURCE_ENERGY,4000,REQUEST_PRIORITY_AUXILIARY)
        RequestResource(colony,room.powerSpawn.id,RESOURCE_POWER,80,REQUEST_PRIORITY_AUXILIARY)
    }

}

ColonyTerminalTraffic=function(colony)
{
    let room = Game.rooms[colony.pos.roomName];
    if(!room) { return; }
    if(!room.storage) { return; }
    if(!room.terminal) { return; }
    
    RequestEmptying(colony,room.terminal.id,RESOURCE_ENERGY,TERMINAL_ENERGY_MAX,REQUEST_PRIORITY_AUXILIARY);
    RequestResource(colony,room.terminal.id,RESOURCE_ENERGY,TERMINAL_ENERGY_MIN,REQUEST_PRIORITY_AUXILIARY);

    let surplus = [];
    for(let res of ExtractContentOfStore(room.storage.store))
    {
        let amount   = room.storage.store[res]  || 0;
            amount  += room.terminal.store[res] || 0;
        for(let creep of room.find(FIND_MY_CREEPS))
        {
            amount += creep.store[res]  || 0 
        }

        if(res != RESOURCE_ENERGY && amount > COLONY_SURPLUS_THRESHOLD)
        {
            surplus.push(res);
        }
    }

    for(let res of ExtractContentOfStore(room.terminal.store))
    {
        if(res != RESOURCE_ENERGY && !surplus.includes(res))
        {
            RequestEmptying(colony,room.terminal.id,res,1,REQUEST_PRIORITY_AUXILIARY);
        }
    }

    for(let res of surplus)
    {
        RequestResource(colony,room.terminal.id,res,TERMINAL_EXPORT_AMOUNT,REQUEST_PRIORITY_AUXILIARY);

        if(!room.terminal.cooldown)
        {
            for(let col of Memory.colonies)
            {
                if(col.pos.roomName != colony.pos.roomName)
                {
                    let otherRoom = Game.rooms[col.pos.roomName];
                    if(!otherRoom) { break; }
                    if(!otherRoom.storage) { break; }
                    if(!otherRoom.terminal) { break; }

                    let amount   = room.storage.store[res]  || 0;
                        amount  += room.terminal.store[res] || 0;
                    for(let creep of room.find(FIND_MY_CREEPS))
                    {
                        amount += creep.store[res]  || 0 
                    }

                    let otherAmount   = otherRoom.storage.store[res]  || 0;
                        otherAmount  += otherRoom.terminal.store[res] || 0;
                    for(let creep of otherRoom.find(FIND_MY_CREEPS))
                    {
                        amount += creep.store[res]  || 0 
                    }
            
                    if(otherAmount < COLONY_PUSH_RESOURCE_THRESHOLD)
                    {
                        if(room.terminal.store[res] > 0 && room.terminal.store[RESOURCE_ENERGY] > 0)
                        {
                            let amountToSend = Math.min(room.terminal.store[res],
                                room.terminal.store[RESOURCE_ENERGY],
                                COLONY_PUSH_RESOURCE_THRESHOLD - otherAmount,
                                amount - COLONY_SURPLUS_THRESHOLD);
                            room.terminal.send(res,amountToSend,col.pos.roomName);
                        }
                    }
                }
            }
        }
    }
}