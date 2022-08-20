
C =
{
    HAULING_EFFECTIVE_POWER:50/10,
    ACCEPTABLE_LIFE_LEFT:100
}

let G =
{
    SpawnQueue: {},
    QueuedCreeps: {}
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
    
    if(colony.dediUpgrade)
    {
        target = 1;
    }

    if(room.storage && room.storage.store.getUsedCapacity(RESOURCE_ENERGY) > COLONY_EXTRA_WORKER_THRESHOLD && !colony.needMoreHaulers)
    {
        target++;
    }
    
    colony.targetWorkers = target;
    if(room.storage.store.getUsedCapacity(RESOURCE_ENERGY) > COLONY_WORKER_FREE_FOR_ALL_ENERGY_THRESHOLD && !colony.needMoreHaulers)
    {
        target += 50;
    }

    if(!Performance.Decisions.Enabled("normal_mode"))
    {
        target = 1;
    }

    colony.targetWorkers = target;

    if (count < target && (room.storage.store.getUsedCapacity(RESOURCE_ENERGY) < SPAWNING_ENERGY_PANIC_AMOUNT || (colony.haulerpool.length != 0 && colony.workerpool.length < 3)))
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
    let parts = 0;
    let listData = {threshold: 40, validCreeps: 0}; 
    for(let creep of Helpers.Creep.List(colony.haulerpool,listData))
    {
        if(creep.ticksToLive > C.ACCEPTABLE_LIFE_LEFT)
        {
            parts += creep.getActiveBodyparts(CARRY);
        }
    }
    if(listData.hasSpawning)
    {
        return;
    }
    
    let toTransfer = _.sum(colony.income) + _.sum(colony.expenses); // + tranfer for extra stuff
    let target = Math.ceil(toTransfer / C.HAULING_EFFECTIVE_POWER);
    if(IS_SEASONAL)
    {
        target *= 2;
    }
    colony.targetHaulers = (target / HAULER_PARTS_AT_LEVEL[colony.level]).toFixed(2);

    colony.needMoreHaulers = parts < target;

    if (parts < target && (room.storage.store.getUsedCapacity(RESOURCE_ENERGY) > SPAWNING_ENERGY_PANIC_AMOUNT || parts == 0))
    {
        let body = BODIES.LV1_HAULER;
        let prio = SPAWN_PRIORITY_GENERIC;

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
        
        if(listData.hasQueued)
        {
            if(listData.validCreeps > 0 && !listData.hasSpawning)
            {
                if(listData.highestPrio == SPAWN_PRIORITY_VITAL)
                    return;

                prio = SPAWN_PRIORITY_VITAL;
                body = BODIES.LV1_HAULER;
            }
            else
            {
                return;
            }
        }


        Colony.Modules.Spawning.QueueSpawn(colony, body, ROLE_HAULER, colony.haulerpool, prio);
    }
}

module.exports.Update=function(colony)
{
    SpawnHaulers(colony);
    SpawnWorkers(colony);
}


let lower_bound = function(array, value) 
{
    var low = 0,
        high = array.length;

    while (low < high) {
        var mid = (low + high) >>> 1;
        if (array[mid].prio > value.prio) low = mid + 1;
        else high = mid;
    }
    return low;
}

module.exports.AddDummySpawningCreeps=function()
{
    G.queuedCreeps = {};
    for(let queue of Object.values(G.SpawnQueue))
    {
        for(let c of queue)
        {
            G.queuedCreeps[c.name] = c.prio + 1;
        }
    }
}

module.exports.QueueSpawn = function(colony, body, role, list, priority = 0)
{
    let roomName = colony.pos.roomName;
    if(!G.SpawnQueue[roomName]) { G.SpawnQueue[roomName] = []; }

    let queue = G.SpawnQueue[roomName];
    
    let toAdd = {
        body:body,
        name:(SHARD_CREEP_NAME_PREFIXES[Game.shard.name] || '?') + (ROLE_PREFIXES[role] || '?') + Memory.creepid,
        prio: priority
    };
    Memory.creepid++;
    let index = lower_bound(queue,toAdd);
    queue.splice(index, 0, toAdd);

    G.queuedCreeps[toAdd.name] = toAdd.prio + 1;
    list.push(toAdd.name);
}

module.exports.ProcessSpawnQueue = function(colony)
{
    let roomName = colony.pos.roomName;
    if(!G.SpawnQueue[roomName]) { G.SpawnQueue[roomName] = []; }

    let queue = G.SpawnQueue[roomName];
    if (queue.length == 0) { return; }
    
    let room = Game.rooms[roomName];
    if(!room) { return; }

    for(let spawn of room.spawns)
    {
        if(spawn.spawning) { continue; }

        let toSpawn = queue[0];

        let code = spawn.spawnCreep(toSpawn.body,toSpawn.name);

        if(code != OK) { return; }

        queue.shift();

        return;
    } 
}

let visualizeCompactBody=function(vis, x, y, body, predicate)
{
    let bodyCount = _.countBy(body, predicate);
    let bodyx = x;
    for(let part in bodyCount)
    {
        vis.symbol(bodyx, y- 0.1, part, { scale: 0.7});
        if(bodyCount[part] > 1)
        {
            vis.text("x" + bodyCount[part],bodyx+0.14,y,{font:0.2, align:"left"});
            bodyx += 0.24 + ("x" + bodyCount[part]).length * 0.14;
        }
        else
        {
            bodyx += 0.24;
        }
    }
}

module.exports.Visuals=function(colony, room, vis, x, y)
{
    vis.rect(
        x-0.45,
        y-0.45,
        4.4,
        6,
        {
            fill:"#C4C4C4",
            stroke:"#000000"
        });

    let ox = x;
    let oy = y;
    vis.text("Spawning", x-0.3, y+ 0.15, {font: 0.7, align: "left"})
    y += 0.8;
    x -= 0.3;
    for(let spawn of room.spawns)
    {
        vis.text(spawn.name + ":", x + 1.5,y, { font:0.3, align: "right"});
        if(spawn.spawning)
        {
            visualizeCompactBody(vis, x + 1.65, y, Game.creeps[spawn.spawning.name].body, 'type');

            let progress = ((spawn.spawning.needTime - spawn.spawning.remainingTime) / spawn.spawning.needTime)
            if(progress < 1)
            {
                vis.rect(x, y+0.1, progress * 4, 0.2, {fill: "#FFFF00", opacity: 0.5, opacity: 1});
                vis.rect(x,y+0.1,4,0.2,{stroke:"#ffffff",fill: "#00000000", strokeWidth: 0.02, opacity: 1})
            }
            else
            {
                vis.rect(x,y+0.1,4,0.2,{stroke:"#ffffff",fill: "#FF0000", strokeWidth: 0.02, opacity: 1})
            }
        }
        else
        {
            vis.text("Idle", x + 1.6,y, { font:0.3, align: "left"});
            vis.rect(x,y+0.1,4,0.2,{stroke:"#ffffff",fill: "#00FF00", strokeWidth: 0.02, opacity: 1})
        }
        y += 0.6;
    }

    vis.line(x-0.1,y-0.2,x+4.2,y-0.2, {width: 0.02,opcaity:1});

    let queue = G.SpawnQueue[colony.pos.roomName];
    if(!queue) { return; }
    vis.text("Queue", x-0.07, y+0.15, { align:"left", font:0.3 });
    y += 0.5;
    let prio = 100;
    for(let queued of queue)
    {
        if(queued.prio < prio)
        {
            vis.text("Prio: " + queued.prio, x, y, { align:"left", font:0.3 });
            prio = queued.prio;
            y += 0.3;
        }
        vis.text(Helpers.Resources.BodyCost(queued.body) + ": ",x+1.3,y - 0.1,{font:0.2, align:"right"});
        visualizeCompactBody(vis, x + 1.5, y- 0.1, queued.body);
        y += 0.3;
    }
}

module.exports.IsQueued = function(name, options)
{
    if(options && G.queuedCreeps[name])
    {
        options.highestPrio = Math.max((options.highestPrio || 0), G.queuedCreeps[name] - 1)
        return true;
    }
    return G.queuedCreeps[name];
}