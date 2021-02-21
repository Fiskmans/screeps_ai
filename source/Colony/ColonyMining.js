

let C =
{
    TAG                     :"local_mining",

    MINING_TYPE_SOURCE      :"Source",
    MINING_TYPE_MINERAL     :"Mineral",

    SOURCE_OUTPUT: SOURCE_ENERGY_CAPACITY/ENERGY_REGEN_TIME
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
        return false;
    }
    let terrain = new Room.Terrain(colony.pos.roomName);
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

        let body = blob.type == C.MINING_TYPE_SOURCE ? BODIES.LOCAL_MINER : BODIES.LOCAL_MINERAL_MINER;
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
    CreepActions(colony,blob,target);
    SpawnCreeps(colony,blob);
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
}