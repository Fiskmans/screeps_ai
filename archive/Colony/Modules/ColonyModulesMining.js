

let C =
{
    TAG                     :"local_mining",

    MINING_TYPE_SOURCE      :"Source",
    MINING_TYPE_MINERAL     :"Mineral",

    SOURCE_OUTPUT: SOURCE_ENERGY_CAPACITY/ENERGY_REGEN_TIME,

    LINK_STATE_HAS          :"has",
    LINK_STATE_NO_SPACE     :"no-space",

    EMPTY_TARGET            : 500
}

let Setup = function(colony)
{
    let blob = 
    {
        sites:[]
    };
    let room = Game.rooms[colony.pos.roomName];
    if(!room)
    {
        console.log("mining setup failed on no vision");
        return false;
    }
    if(colony.subLayouts["local_mining"])
    {
        delete colony.subLayouts["local_mining"];
    }
    let vis = new RoomVisual(colony.pos.roomName);

    let buildings = [];
    for(let source of room.find(FIND_SOURCES))
    {
        let site = {};

        site.id = source.id;
        site.type = C.MINING_TYPE_SOURCE;

        let pathResult = PathFinder.search(
            source.pos,
            {
                pos:new RoomPosition(colony.pos.x,colony.pos.y,colony.pos.roomName),
                range:1
            },
            {
                roomCallback:Colony.Planner.MatrixRoadPreferFuture
            });

        if(pathResult.incomplete)
        {
            vis.poly(pathResult.path,{stroke:"#FF0000"});
            console.log("mining setup failed on incomplete path to " + source.pos);
            return false;
        }
        vis.poly(pathResult.path,{stroke:"#00FF00"});

        site.pos = pathResult.path.shift();

        buildings.push({pos:site.pos,structure:STRUCTURE_CONTAINER});
        for(let p of pathResult.path)
        {
            buildings.push({pos:p,structure:STRUCTURE_ROAD});
        }

        blob.sites.push(site);
    }

    for(let mineral of room.find(FIND_MINERALS))
    {
        let site = {};

        site.id = mineral.id;
        site.type = C.MINING_TYPE_MINERAL;

        let pathResult = PathFinder.search(
            mineral.pos,
            {
                pos:new RoomPosition(colony.pos.x,colony.pos.y,colony.pos.roomName),
                range:1
            },
            {
                roomCallback:Colony.Planner.MatrixRoadPreferFuture
            });

        if(pathResult.incomplete)
        {
            vis.poly(pathResult.path,{stroke:"#FF0000"});
            console.log("mining setup failed on incomplete path to " + mineral.pos);
            return false;
        }
        vis.poly(pathResult.path,{stroke:"#00FF00"});

        site.pos = pathResult.path.shift();

        buildings.push({pos:site.pos,structure:STRUCTURE_CONTAINER});
        for(let p of pathResult.path)
        {
            buildings.push({pos:p,structure:STRUCTURE_ROAD});
        }

        blob.sites.push(site);
    }

    colony.mining = blob;
    if(colony.subLayouts["kickstart_roads"])
    {
        delete colony.subLayouts["kickstart_roads"];
    }
    colony.subLayouts["local_mining"] = SerializeLayout(buildings);
    return true;
}

let RetireMiners=function(colony,blob)
{
    if(blob.miner)
    {
        let creep = Game.creeps[blob.miner];
        if(creep)
        {
            creep.Retire(colony.pos.roomName);
        }
        else
        {
            delete blob.miner;
        }
    }
    if(blob.nextMiner)
    {
        let creep = Game.creeps[blob.nextMiner];
        if(creep)
        {
            creep.Retire(colony.pos.roomName);
        }
        else
        {
            delete blob.nextMiner;
        }
    }
}

let CreepActions=function(colony,blob,target)
{
    if(blob.miner)
    {
        let creep = Game.creeps[blob.miner];
        if(creep)
        {
            let targetPos = new RoomPosition(blob.pos.x,blob.pos.y,blob.pos.roomName);
            let range = targetPos.getRangeTo(creep.pos);
            if(range > 0)
            {
                creep.travelTo(targetPos);
            }
            creep[CREEP_HARVEST](target);
            if(blob.link == C.LINK_STATE_HAS && blob.linkId && creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0 && creep.store.getFreeCapacity(RESOURCE_ENERGY) < creep.getActiveBodyparts(WORK) * HARVEST_POWER * 2)
            {
                creep[CREEP_TRANSFER](Game.getObjectById(blob.linkId),RESOURCE_ENERGY);
            }

            if(creep.ticksToLive <= 1)
            {
                delete blob.miner;
            }
        }
        else
        {
            delete blob.miner;
        }
    }
    if(blob.nextMiner)
    {
        let creep = Game.creeps[blob.nextMiner];
        if(creep)
        {
            let targetPos = new RoomPosition(blob.pos.x,blob.pos.y,blob.pos.roomName);
            creep.travelTo(targetPos,{ range:blob.miner ? 1 : 0})
            let range = targetPos.getRangeTo(creep.pos);
            if(range < 2 && !creep.memory.readyIn)
            {
                creep.memory.readyIn = 1500 - creep.ticksToLive  + creep.body.length * 3;
            }

            if(!blob.miner && range <= 1)
            {
                blob.miner = blob.nextMiner;
                delete blob.nextMiner;
            }
        }
        else
        {
            delete blob.nextMiner;
        }
    }
}

let SpawnCreeps = function(colony,blob)
{
    let needMiner = false;
    if(!blob.miner)
    {
        needMiner = true;
    }
    else
    {
        let creep = Game.creeps[blob.miner];
        if(!creep)
        {
            needMiner = true;
        }
        else if(!(creep.ticksToLive >= creep.memory.readyIn - 2))
        {
            needMiner = true;
        }
    }
    if(blob.nextMiner && Game.creeps[blob.nextMiner])
    {
        needMiner = false;
    }

    if(needMiner)
    {
        let room = Game.rooms[colony.pos.roomName];
        let body = [];

        if(blob.type == C.MINING_TYPE_SOURCE)
        {
            body = BODIES.LOCAL_MINER;
            if(blob.link == C.LINK_STATE_HAS)
            {
                body = BODIES.LOCAL_LINKED_MINER;
            }
            if(!Performance.Decisions.Enabled("normal_mode"))
            {
                body = BODIES.LOW_CPU_MINER;
            }
        }
        else
        {
            body = BODIES.LOCAL_MINERAL_MINER;
            
            if(!Performance.Decisions.Enabled("normal_mode"))
            {
                return;
            }
        }
        let dummyList = [];
        if(room.energyCapacityAvailable <= ENERGY_CAPACITY_AT_LEVEL[3] || (room.energyAvailable <= ENERGY_CAPACITY_AT_LEVEL[3] && (!room.storage ||  room.storage.store.getUsedCapacity(RESOURCE_ENERGY) <= ENERGY_CAPACITY_AT_LEVEL[3])))
        {
            body = [WORK,WORK,MOVE,MOVE];
        }

        if(Colony.Helpers.SpawnCreep(colony,dummyList,body,ROLE_MINER) == OK)
        {
            blob.nextMiner = dummyList.shift();
        }
    }
}

let RefreshIncome=function(colony)
{
    if(Game.time % REFRESH_INCOME_INTERVAL == 0)
    {
        Colony.Helpers.SetIncome(colony,'local_mining',0);
        for(let site of colony.mining.sites)
        {
            if(site.type != C.MINING_TYPE_MINERAL)
            {
                Colony.Helpers.IncrementIncome(colony,'local_mining',10);
            }
        }
        Colony.Helpers.SetExpense(colony,'local_mining',0);
        for(let site of colony.mining.sites)
        {
            if(site.type == C.MINING_TYPE_MINERAL)
            {
                let obj = Game.getObjectById(site.id)
                if(obj && obj.mineralAmount > 0)
                {
                    Colony.Helpers.IncrementExpense(colony,'local_mining',Helpers.Creep.BodyCost(BODIES.LOCAL_MINERAL_MINER)/1450);
                }
            }
            else
            {
                Colony.Helpers.IncrementExpense(colony,'local_mining',Helpers.Creep.BodyCost(BODIES.LOCAL_MINER)/1450);
            }
        }
    }
}

let Empty = function(colony,blob)
{
    if(!blob.containterId)
    {
        for(let s of new RoomPosition(blob.pos.x,blob.pos.y,blob.pos.roomName).lookFor(LOOK_STRUCTURES))
        {
            if(s.structureType == STRUCTURE_CONTAINER)
            {
                blob.containterId = s.id;
            }
        }
    }
    if(!blob.containterId)
    {
        return;
    }
    let container = Game.getObjectById(blob.containterId);
    if(!container)
    {
        delete blob.containterId;
        return;
    }
    for(let res of ExtractContentOfStore(container.store))
    {
        RequestEmptying(colony,blob.containterId,res,res == RESOURCE_ENERGY ? C.EMPTY_TARGET : 1,REQUEST_PRIORITY_FUNCTION);
    }

}

let Mine=function(colony,blob)
{
    let room = Game.rooms[colony.pos.roomName];
    if(!room)
    {
        return;
    }
    let target = Game.getObjectById(blob.id);
    if(blob.type == C.MINING_TYPE_MINERAL)
    {
        if(target.mineralAmount == 0)
        {
            RetireMiners(colony,blob);
            return;
        }
    }
    if(blob.link == C.LINK_STATE_HAS && !blob.linkId)
    {
        for(let s of room.lookForAt(LOOK_STRUCTURES,blob.linkPos.x,blob.linkPos.y))
        {
            if(s.structureType == STRUCTURE_LINK)
            {
                blob.linkId = s.id;
                break;
            }
        }
    }
    CreepActions(colony,blob,target);
    SpawnCreeps(colony,blob);
    Empty(colony,blob);
}

let AddLinks = function(colony,blob)
{
    if(!blob.linkCount)
    {
        blob.linkCount = 0;
    }
    if(blob.linkCount == 2)
    {
        return;
    }
    let available = Colony.Planner.BuildingsAvailable(colony,STRUCTURE_LINK);
    if(available > blob.linkCount)
    {
        let furthest = false;
        let distance = 0;
        let colonyPos = new RoomPosition(colony.pos.x,colony.pos.y,colony.pos.roomName);
        for(let site of blob.sites)
        {
            if(site.link || site.type == C.MINING_TYPE_MINERAL)
            {
                continue;
            }
            let pos = new RoomPosition(site.pos.x,site.pos.y,site.pos.roomName);
            let d = pos.getRangeTo(colonyPos);
            if(d > distance)
            {
                furthest = site;
                distance = d;
            }
        }

        if(furthest)
        {
            let pos = new RoomPosition(furthest.pos.x,furthest.pos.y,furthest.pos.roomName);
            let buildings = [];

            buildings = DeserializeLayout(colony.layout,colony.pos.roomName);

            for(let layout of Object.values(colony.subLayouts))
            {
                buildings = buildings.concat(DeserializeLayout(layout,colony.pos.roomName));
            }
            let terrain = new Room.Terrain(colony.pos.roomName);
            let closest = false;
            let distance = Infinity;
            for(let dir of ALL_DIRECTIONS)
            {
                let p = pos.offsetDirection(dir);
                if(terrain.get(p.x,p.y) != TERRAIN_MASK_WALL)
                {
                    let d = p.getRangeTo(colonyPos);
                    if(d < distance)
                    {
                        let busy = false;
                        for(let b of buildings)
                        {
                            if(b.pos.x == p.x && b.pos.y == p.y)
                            {
                                busy = true;
                                break;
                            }
                        }
                        if(busy)
                        {
                            continue;
                        }

                        distance = d;
                        closest = p;
                    }
                }
            }
            if(closest)
            {
                furthest.link = C.LINK_STATE_HAS;
                furthest.linkPos = closest;
                colony.subLayouts["local_mining"] += SerializeLayout([{
                    pos:closest,
                    structure:STRUCTURE_LINK
                }])
                blob.linkCount++;
            }
            else
            {
                site.link = C.LINK_STATE_NO_SPACE;
                Helpers.External.Notify("No link could be added around " + pos + " as there is no space",true);
            }
        }
    }
}

let LinkTransfer = function(colony,blob)
{
    let target = false;
    if(colony.recievelink)
    {
        let l = Game.getObjectById(colony.recievelink);
        if(l)
        {
            if(l.store.getFreeCapacity(RESOURCE_ENERGY) > 200)
            {
                target = l;
            }
        }
        else
        {
            delete colony.recievelink;
        }
    }
    if(!target && colony.upgradeLink)
    {
        let l = Game.getObjectById(colony.upgradeLink);
        if(l)
        {
            if(l.store.getFreeCapacity(RESOURCE_ENERGY) > 200)
            {
                target = l;
            }
        }
        else
        {
            delete colony.upgradeLink;
        }
    }
    if(!target && colony.sendLink)
    {
        let l = Game.getObjectById(colony.sendLink);
        if(l)
        {
            if(l.store.getFreeCapacity(RESOURCE_ENERGY) > 200)
            {
                target = l;
            }
        }
        else
        {
            delete colony.sendLink;
        }
    }
    if(target)
    {

        for(let site of blob.sites)
        {
            if(site.link == C.LINK_STATE_HAS && site.linkId)
            {
                let link = Game.getObjectById(site.linkId);
                if(!link)
                {
                    delete site.linkId;
                    continue;
                }
                
                link.TransferOptimal(target);
            }
        }
    }   
}

module.exports.Update=function(colony)
{
    if(!colony.mining)
    {
        if(!Setup(colony))
        {
            return;
        }
    }
    for(let site of colony.mining.sites)
    {
        Mine(colony,site);
    }
    RefreshIncome(colony);
    AddLinks(colony,colony.mining);
    LinkTransfer(colony,colony.mining);
    
    if(colony.recievelink)
    {
        RequestEmptying(colony,colony.recievelink,RESOURCE_ENERGY,1,REQUEST_PRIORITY_FUNCTION);
    }
}