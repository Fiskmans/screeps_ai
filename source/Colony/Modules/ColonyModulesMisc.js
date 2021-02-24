let C = 
{
    REPAIR_TAG          : "repair",

    REPAIR_INTERVAL     : 2000,
    COMPACTIFY_INTERVAL : 5000
}


module.exports.BasicWorkers=function(colony)
{
    if(!colony.constructionsite || colony.refreshDowngrade)
    {
        ColonyIdleWorkers(colony)
        ColonyFindBuildingWork(colony)
        if (Game.rooms[colony.pos.roomName].controller.ticksToDowngrade > CONTROLLER_MAX_DOWNGRADE)
        {
            delete colony.refreshDowngrade
        }
    }
    else
    {
        colonyConstruct(colony)
        if (Game.rooms[colony.pos.roomName].controller.ticksToDowngrade < CONTROLLER_MIN_DOWNGRADE)
        {
            colony.refreshDowngrade = true
        }
    }
}


let FillRepairQueue=function(colony,room)
{
    let buildings = [];
    colony.repairQueue = [];

    buildings = DeserializeLayout(colony.layout,colony.pos.roomName);

    for(let layout of Object.values(colony.subLayouts))
    {
        buildings = buildings.concat(DeserializeLayout(layout,colony.pos.roomName));
    }

    let there = room.lookForAtArea(LOOK_STRUCTURES,2,2,48,48);
    for(let b of buildings)
    {
        for(let t of (there[b.pos.y] || [])[b.pos.x] || [])
        {
            if(t.structureType == b.structure && t.hits < t.hitsMax)
            {
                colony.repairQueue.push(t.id);
            }
        }
    }
}

module.exports.RepairDecay=function(colony)
{
    if(Game.time - colony.lastRepairPass < C.REPAIR_INTERVAL)
    {
        Colony.Helpers.Roster(colony,C.REPAIR_TAG,0);
        return;
    }

    let room = Game.rooms[colony.pos.roomName];
    if(!room)
    {
        return;
    }
    if((colony.repairQueue || []).length == 0)
    {
        FillRepairQueue(colony,room);
    }
    if(!room.storage || room.storage.store.getUsedCapacity(RESOURCE_ENERGY) < 1000)
    {
        colony.repairQueue = [];
        colony.lastRepairPass = Game.time;
        return;
    }


    for(let creep of Colony.Helpers.Roster(colony,C.REPAIR_TAG,1))
    {
        if(!creep.HasAtleast1TickWorthOfWork())
        {
            let workParts = creep.getActiveBodyparts(WORK);
            if(creep.store.getUsedCapacity(RESOURCE_ENERGY) < REPAIR_POWER * REPAIR_COST * 2 * workParts)
            {
                creep.EnqueueWork(
                    {
                        action:CREEP_WITHDRAW,
                        target:room.storage.id,
                        arg1:RESOURCE_ENERGY
                    });
            }

            let energyLeft = creep.store.getCapacity(RESOURCE_ENERGY);
            for(let i = 0; i < colony.repairQueue.length && energyLeft > 0; i++)
            {
                let obj = Game.getObjectById(colony.repairQueue[i]);
                if(!obj)
                {
                    i--;
                    colony.repairQueue.shift();
                    continue;
                }

                let missing = obj.hitsMax - obj.hits;
                if(missing == 0)
                {
                    i--;
                    colony.repairQueue.shift();
                    continue;
                }

                while(energyLeft > 0 && missing > 0 && !creep.OverWorked())
                {
                    energyLeft -= workParts * REPAIR_POWER * REPAIR_COST;
                    missing -= workParts * REPAIR_POWER;

                    creep.EnqueueWork(
                        {
                            action:CREEP_REPAIR,
                            target:colony.repairQueue[i]
                        });
                }
            }

        }

        if(creep.HasWork())
        {
            creep.DoWork();
        }
    }

    if(colony.repairQueue.length == 0)
    {
        colony.lastRepairPass = Game.time;
    }
}

module.exports.CompactifyLayout=function(colony)
{
    if(Game.time % C.COMPACTIFY_INTERVAL == 0)
    {
        colony.layout = Colony.Helpers.ReduceLayout(colony.layout);
        Colony.Helpers.ReduceSubLayouts(colony);
    }
}