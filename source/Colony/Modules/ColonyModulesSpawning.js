
C =
{
    HAULING_EFFECTIVE_POWER:50/10,
    ACCEPTABLE_LIFE_LEFT:100
}

let SpawnWorkers = function(colony)
{
    let room = Game.rooms[colony.pos.roomName];
    if(!colony.workerpool) { colony.workerpool = []};
    if(!colony.workersensus) { colony.workersensus = []};
    let count = 0;
    for(let creep of Helpers.Creep.List(colony.workersensus))
    {
        if(creep.ticksToLive > C.ACCEPTABLE_LIFE_LEFT)
        {
            count++;
        }
    }
    
    let target = Math.ceil((_.sum(colony.income) - _.sum(colony.expenses)) / WORKER_PARTS_AT_LEVEL[colony.level]);
    
    if(room.storage && room.storage.store.getUsedCapacity(RESOURCE_ENERGY) > COLONY_EXTRA_WORKER_THRESHOLD)
    {
        target++;
    }
    
    if(!Performance.Decisions.Enabled("normal_mode"))
    {
        target = 1;
    }
    
    colony.targetWorkers = target;
    if(room.storage.store.getUsedCapacity(RESOURCE_ENERGY) > COLONY_WORKER_FREE_FOR_ALL_ENERGY_THRESHOLD)
    {
        target += 50;
        colony.targetWorkers = "♾️";
    }

    if (count < target && (room.storage.store.getUsedCapacity(RESOURCE_ENERGY) < SPAWNING_ENERGY_PANIC_AMOUNT || colony.haulerpool.length != 0))
    {
        let body = BODIES.LV1_WORKER;

        if(room.energyAvailable >= ENERGY_CAPACITY_AT_LEVEL[2])
        {
            body = BODIES.LV2_WORKER;
        }

        if(room.energyAvailable >= ENERGY_CAPACITY_AT_LEVEL[3])
        {
            body = BODIES.LV3_WORKER;
        }
        
        if(room.storage && room.storage.store.getUsedCapacity(RESOURCE_ENERGY) > SPAWNING_ENERGY_PANIC_AMOUNT && colony.haulerpool.length != 0)
        {
            if(room.energyCapacityAvailable >= ENERGY_CAPACITY_AT_LEVEL[4])
            {
                body = BODIES.LV4_WORKER;
            }
            if(room.energyCapacityAvailable >= ENERGY_CAPACITY_AT_LEVEL[5])
            {
                body = BODIES.LV5_WORKER;
            }
            if(room.energyCapacityAvailable >= ENERGY_CAPACITY_AT_LEVEL[6])
            {
                body = BODIES.LV6_WORKER;
            }
            if(room.energyCapacityAvailable >= ENERGY_CAPACITY_AT_LEVEL[7])
            {
                body = BODIES.LV7_WORKER;
            }
        }
        else
        {
            if(room.energyAvailable >= ENERGY_CAPACITY_AT_LEVEL[4])
            {
                body = BODIES.LV4_WORKER;
            }
            if(room.energyAvailable >= ENERGY_CAPACITY_AT_LEVEL[5])
            {
                body = BODIES.LV5_WORKER;
            }
            if(room.energyAvailable >= ENERGY_CAPACITY_AT_LEVEL[6])
            {
                body = BODIES.LV6_WORKER;
            }
            if(room.energyAvailable >= ENERGY_CAPACITY_AT_LEVEL[7])
            {
                body = BODIES.LV7_WORKER;
            }
        }

        Colony.Helpers.SpawnCreep(
            colony,
            colony.workerpool,
            body,
            ROLE_WORKER,
            {
                extraList:colony.workersensus,
                allowShards:true,
                allowNearby:true,
                nearbyRange:20,
                nearbyBody:BODY_GROUPS.WORKERS
            })
    }
}

let SpawnHaulers = function(colony)
{
    let room = Game.rooms[colony.pos.roomName];
    if(!colony.haulerpool) { colony.haulerpool = []};
    if(!colony.haulersensus) { colony.haulersensus = []};
    let parts = 0;
    for(let creep of Helpers.Creep.List(colony.haulersensus))
    {
        if(creep.ticksToLive > C.ACCEPTABLE_LIFE_LEFT)
        {
            parts += creep.getActiveBodyparts(CARRY);
        }
    }
    
    let toTransfer = _.sum(colony.income) + _.sum(colony.expenses); // + tranfer for extra stuff
    let target = Math.ceil(toTransfer / C.HAULING_EFFECTIVE_POWER);
    colony.targetHaulers = (target / HAULER_PARTS_AT_LEVEL[colony.level]).toFixed(2);


    if (parts < target && (room.storage.store.getUsedCapacity(RESOURCE_ENERGY) > SPAWNING_ENERGY_PANIC_AMOUNT || parts == 0))
    {
        let body = BODIES.LV1_HAULER;

        if(room.energyAvailable >= ENERGY_CAPACITY_AT_LEVEL[2])
        {
            body = BODIES.LV2_HAULER;
        }

        if(room.energyAvailable >= ENERGY_CAPACITY_AT_LEVEL[3])
        {
            body = BODIES.LV3_HAULER;
        }
        

        if(room.storage && room.storage.store.getUsedCapacity(RESOURCE_ENERGY) > SPAWNING_ENERGY_PANIC_AMOUNT && parts != 0)
        {
            if(room.energyCapacityAvailable >= ENERGY_CAPACITY_AT_LEVEL[4])
            {
                body = BODIES.LV4_HAULER;
            }
            if(room.energyCapacityAvailable >= ENERGY_CAPACITY_AT_LEVEL[5])
            {
                body = BODIES.LV5_HAULER;
            }
            if(room.energyCapacityAvailable >= ENERGY_CAPACITY_AT_LEVEL[6])
            {
                body = BODIES.LV6_HAULER;
            }
            if(room.energyCapacityAvailable >= ENERGY_CAPACITY_AT_LEVEL[7])
            {
                body = BODIES.LV7_HAULER;
            }
        }
        else
        {
            if(room.energyAvailable >= ENERGY_CAPACITY_AT_LEVEL[4])
            {
                body = BODIES.LV4_HAULER;
            }
            if(room.energyAvailable >= ENERGY_CAPACITY_AT_LEVEL[5])
            {
                body = BODIES.LV5_HAULER;
            }
            if(room.energyAvailable >= ENERGY_CAPACITY_AT_LEVEL[6])
            {
                body = BODIES.LV6_HAULER;
            }
            if(room.energyAvailable >= ENERGY_CAPACITY_AT_LEVEL[7])
            {
                body = BODIES.LV7_HAULER;
            }
        }

        Colony.Helpers.SpawnCreep(
            colony,
            colony.haulerpool,
            body,
            ROLE_HAULER,
            {
                extraList:colony.haulersensus,
                nearbyBody:BODY_GROUPS.HAULERS
            })
    }
}

module.exports.Update=function(colony)
{
    SpawnWorkers(colony);
    SpawnHaulers(colony);
}