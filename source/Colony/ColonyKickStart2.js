

let C =
{
    UNDER_ATTACK: 'attack',
    HAS_CORE: 'core',
    SAFE: 'safe',

    SPAWN_PRIORITY_NORMAL:1,
    SPAWN_PRIORITY_PANIC:2,

    CLAIMER_COST:650
}

let TickData =
{
    spawnRequests:[],
    spawnCapacity:0
}

let ResetTickData = function()
{
    TickData.spawnRequests = [];
    TickData.spawnCapacity = 0;
}

let SpawnLocal=function(body,list,prio)
{
    if(Helpers.Creep.BodyCost(body) <= TickData.spawnCapacity)
    {
        TickData.spawnRequests.push({body:body,list:list,prio:prio});
    }
}

let SpawnFromQueue=function(colony)
{
    let best = false;
    let highestPrio = 0;
    for(let e of TickData.spawnRequests)
    {
        if(e.prio > highestPrio)
        {
            highestPrio = e.prio;
            best = e;
        }
    }

    if(best)
    {
        console.log(JSON.stringify(best));
        Colony.Helpers.SpawnCreep(colony,best.list,best.body);
    }
}

module.exports.Main=function(colony)
{
    ResetTickData();
    let room = Game.rooms[colony.pos.roomName];
    if(room)
    {
        TickData.spawnCapacity = room.energyCapacityAvailable;
    }

    this.Setup(colony);

    RemoveDoneRequests(colony);
    if(!this.InvaderDeterent(colony))
    {
        this.PanicFilling(colony);
        this.Claim(colony);
        this.Reserve(colony);
        this.Mine(colony);
        this.Hauling(colony);
        this.RemoteMining(colony);
        this.Develop(colony);
        this.Roads(colony);
        this.Terminate(colony);
        this.ExpandMining(colony);
        this.Defend(colony);
        this.FulfillRequests(colony);
    }

    SpawnFromQueue(colony);
}

module.exports.Setup=function(colony)
{
    if(!colony.upgradePos)
    {
        colony.upgradePos = FindUpgradePosition(colony);
    }
    if(!colony.kickStart)
    {
        colony.kickStart = 
        {
            miners:[],
            workers:[],
            remotes:[],
            claimers:[],
            scouts:[],
            defenders:[],
            destroyers:[],
            miningContainers:[],
            miningThoughput:0,
            checkedRooms:{},
            remoteSites:{},
            remoteState:{}
        }
    }
    if(!colony.kickStart.panicFillers)
    {
        colony.kickStart.panicFillers = [];
    }
}

module.exports.PanicFilling=function(colony)
{
    let needPanicFillers = true;
    if(Helpers.Creep.List(colony.kickStart.miners).length > 0 &&
    Helpers.Creep.List(colony.haulerpool).length > 0)
    {
        needPanicFillers = false;
    }

    if(Helpers.Creep.List(colony.kickStart.panicFillers).length > 1)
    {
        needPanicFillers = false;
    }
    let room = Game.rooms[colony.pos.roomName];
    if(!room)
    {
        return;
    }

    let fill=function(creep)
    {
        let fillable = room.Structures(STRUCTURE_SPAWN).concat(room.Structures(STRUCTURE_EXTENSION))
        fillable = _.filter(fillable,(f) => f.store.getFreeCapacity(RESOURCE_ENERGY) > 0)

        let closest = creep.pos.findClosestByRange(fillable);

        switch(creep.transfer(closest,RESOURCE_ENERGY))
        {
            case OK:
                return true;
            case ERR_NOT_IN_RANGE:
                creep.travelTo(closest);
                break;
        }

        return false;
    }

    let harvest = function(creep)
    {
        let target = false;
        let cs = [];
        for(let c of room.Structures(STRUCTURE_CONTAINER))
        {
            if(c.store.getUsedCapacity(RESOURCE_ENERGY) > 0)
            {
                cs.push(c);
            }
        }
        target = creep.pos.findClosestByRange(cs);

        if(!target)
        {
            let crs = [];
            for(let miner of Helpers.Creep.List(colony.kickStart.miners))
            {
                if(!creep.spawning && creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0)
                {
                    crs.push(miner)
                }
            }
            target = creep.pos.findClosestByRange(crs);
        }

        if(!target)
        {
            let rs = [];
            for(let r of room.find(FIND_DROPPED_RESOURCES))
            {
                if(r.resourceType == RESOURCE_ENERGY && r.pos.getRangeTo(creep.pos) * 2 < r.amount)
                {
                    rs.push(r);
                }
            }
            target = creep.pos.findClosestByRange(rs);
        }

        if(!target)
        {
            let ss = room.find(FIND_SOURCES_ACTIVE);
            target = creep.pos.findClosestByRange(ss);
        }


        let added = 0;
        if(target instanceof Resource)
        {
            switch(creep.pickup(target))
            {
                case OK:
                    added += target.amount;
                    break;
                case ERR_NOT_IN_RANGE:
                    creep.travelTo(target);
                    break;
            }
        }
        if(added == 0)
        {
            for(let r of room.find(FIND_DROPPED_RESOURCES))
            {
                if(creep.pos.isNearTo(r.pos) && r.resourceType == RESOURCE_ENERGY)
                {
                    if(creep.pickup(r) == OK)
                    {
                        added += r.amount;
                    }
                }
            }

            if(target instanceof StructureContainer)
            {
                switch(creep.withdraw(target,RESOURCE_ENERGY))
                {
                    case OK:
                        added += target.store.getUsedCapacity(RESOURCE_ENERGY);
                        break;
                    case ERR_NOT_IN_RANGE:
                        creep.travelTo(target);
                        break;
                }
            }

            if(target instanceof Source)
            {
                switch(creep.harvest(target))
                {
                    case OK:
                        added += creep.getActiveBodyparts(WORK) * HARVEST_POWER;
                        break;
                    case ERR_NOT_IN_RANGE:
                        creep.travelTo(target);
                        break;
                }
            }
        }

        return added > creep.store.getFreeCapacity(RESOURCE_ENERGY);
    }

    for(let creep of Helpers.Creep.List(colony.kickStart.panicFillers))
    {
        if(creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0)
        {
            if(fill(creep))
            {
                harvest(creep);
            }
        }
        else
        {
            if(harvest(creep))
            {
                fill(creep);
            }
        }
    }

    if(needPanicFillers)
    {
        let body = [MOVE,CARRY,WORK];
        SpawnLocal(body,colony.kickStart.panicFillers,C.SPAWN_PRIORITY_PANIC);
    }
}

module.exports.Reserve=function(colony)
{
    let list = colony.kickStart.claimers;
    deleteDead(list)
    for(let cname of list)
    {
        let creep = Game.creeps[cname];
        if(creep.memory.target)
        {
            if(creep.memory.target == creep.room.name)
            {
                if(!creep.room.controller.reservation || creep.room.controller.reservation.username == MY_USERNAME)
                {
                    creep.do(CREEP_RESERVE_CONTROLLER,creep.room.controller);
                }
                else
                {
                    creep.do(CREEP_ATTACK_CONTROLLER,creep.room.controller);
                }
            }
            else
            {
                creep.GoToRoom(creep.memory.target);
            }
        }
    }
    let needMoreClaimers = false;
    for(let source of Object.values(colony.kickStart.remoteSites))
    {
        let r = Game.rooms[source.room];
        if(!r || !r.controller.reservation || r.controller.reservation.username == MY_USERNAME || r.controller.reservation.ticksToEnd < 2000)
        {
            let found = false;
            for(let cname of list)
            {
                let creep = Game.creeps[cname];
                if(!creep.memory.target)
                {
                    creep.memory.target = source.room;
                }
                if(creep.memory.target == source.room)
                {
                    found = true;
                    break;
                }
            }
            if(!found)
            {
                needMoreClaimers = true;
            }
        }
    }
    if(needMoreClaimers)
    {
        let body = BODIES.LV3_CLAIMER;
        let room = Game.rooms[colony.pos.roomName];
        if(room && room.energyCapacityAvailable >= C.CLAIMER_COST)
        {
            SpawnLocal(body,list,C.SPAWN_PRIORITY_NORMAL);
        }
    }
}

module.exports.Defend=function(colony)
{
    deleteDead(colony.kickStart.destroyers);
    deleteDead(colony.kickStart.defenders);
    for(let cname of colony.kickStart.defenders)
    {
        let creep = Game.creeps[cname];
        if(creep.memory.target)
        {
            if(creep.room.name == creep.memory.target)
            {
                let target = false;
                for(let c of creep.room.find(FIND_CREEPS))
                {
                    if(c.my && c.hits < c.maxHits)
                    {
                        target = c;
                        break;
                    }
                }
                for(let s of creep.room.find(FIND_HOSTILE_STRUCTURES,{filter:(s) => { return !ENEMY_STRUCTURES_WITH_LOOT.includes(s.structureType); }}))
                {
                    target = s;
                    break;
                }
                for(let c of creep.room.find(FIND_HOSTILE_CREEPS))
                {
                    target = s;
                    break;
                }

                if(target)
                {
                    if(target.my)
                    {
                        let len = creep.pos.getRangeTo(target.pos);
                        if(len > 1)
                        {
                            creep.travelTo(target);
                            if(let < 4)
                            {
                                creep[CREEP_RANGED_HEAL](target);
                            }
                        }
                        else
                        {
                            creep[CREEP_HEAL](target);
                        }
                    }
                    else if(target instanceof Creep)
                    {
                        creep.travelTo(target,{range:3,flee:true});
                        let len = creep.pos.getRangeTo(target.pos);
                        if(len < 4)
                        {
                            if(len == 1)
                            {
                                creep[CREEP_RANGED_MASS_ATTACK]();
                            }
                            else
                            {
                                creep[CREEP_RANGED_ATTACK](target);
                            }
                        }
                        creep[CREEP_HEAL](creep);
                    }
                    else
                    {
                        creep.travelTo(target,{range:1});
                        let len = creep.pos.getRangeTo(target.pos);
                        if(len < 4)
                        {
                            if(len == 1)
                            {
                                creep[CREEP_RANGED_MASS_ATTACK]();
                            }
                            else
                            {
                                creep[CREEP_RANGED_ATTACK](target);
                            }
                        }
                        if(creep.hits < creep.maxHits)
                        {
                            creep[CREEP_HEAL](creep);
                        }
                    }
                }
                else
                {
                    delete creep.memory.target;
                }
            }
            else
            {
                creep.GoToRoom(creep.memory.target)
            }
        }
    }
    for(let cname of colony.kickStart.destroyers)
    {
        let creep = Game.creeps[cname];
        if(creep.memory.target)
        {
            if(creep.room.name == creep.memory.target)
            {
                let target = false;
                for(let s of creep.room.find(FIND_HOSTILE_STRUCTURES,{filter:(s) => { return !ENEMY_STRUCTURES_WITH_LOOT.includes(s.structureType); }}))
                {
                    target = s;
                    break;
                }

                if(target)
                {
                    creep.do(CREEP_ATTACK,target);
                }
                else
                {
                    delete creep.memory.target;
                }
            }
            else
            {
                creep.GoToRoom(creep.memory.target)
            }
        }
    }
}


module.exports.EnqueueRemoteHaulingWork=function(colony,creep,fakeStores,source)
{
    if(fakeStores[creep.id].Get(RESOURCE_ENERGY) < fakeStores[creep.id].GetCapacity(RESOURCE_ENERGY))
    {
        creep.say("more");
        for(let mName of source.miners)
        {
            let miner = Game.creeps[mName];
            if(fakeStores[miner.id].Get(RESOURCE_ENERGY) > 0)
            {
                let work = 
                {
                    action:CREEP_WITHDRAW,
                    target:miner.id,
                    arg1:RESOURCE_ENERGY
                }
                creep.EnqueueWork(work);
                creep.SimulateWorkUnit(work,fakeStores);
                break;
            }
        }
        
        if(fakeStores[creep.id].Get(RESOURCE_ENERGY) < fakeStores[creep.id].GetCapacity(RESOURCE_ENERGY))
        {
            let ro = Game.rooms[source.room];
            if(ro)
            {
                for(let r of ro.find(FIND_DROPPED_RESOURCES))
                {
                    if(r.resourceType == RESOURCE_ENERGY)
                    {
                        let work = 
                        {
                            action:CREEP_PICKUP,
                            target:r.id
                        }
                        creep.EnqueueWork(work);
                        creep.SimulateWorkUnit(work,fakeStores);
                        break;
                    }
                }
            }
        }
    }
    else
    {
        creep.say(source.containerID);
        if(source.containerId && fakeStores[source.containerId ]&& fakeStores[source.containerId].total < CONTAINER_CAPACITY)
        {
            let work = 
            {
                action:CREEP_TRANSFER,
                target:source.containerId,
                arg1:RESOURCE_ENERGY
            }
            creep.EnqueueWork(work);
            creep.SimulateWorkUnit(work,fakeStores);
        }
        if(fakeStores[creep.id].Get(RESOURCE_ENERGY) == fakeStores[creep.id].GetCapacity(RESOURCE_ENERGY))
        {
            let room = Game.rooms[colony.pos.roomName];
            if(room)
            {
                let c = creep.pos.findClosestByRange(FIND_STRUCTURES,{filter:(s) =>
                {
                    return s.structureType == STRUCTURE_CONTAINER && 
                        fakeStores[s.id].total < CONTAINER_CAPACITY;
                }});
                if(c)
                {
                    let work = 
                    {
                        action:CREEP_TRANSFER,
                        target:c.id,
                        arg1:RESOURCE_ENERGY
                    }
                    creep.EnqueueWork(work);
                    creep.SimulateWorkUnit(work,fakeStores);
                }
            }
        }
    }
}

module.exports.RemoteMining=function(colony)
{
    let room = Game.rooms[colony.pos.roomName];
    if(!room)
    {
        return;
    }

    let wantsMoreDefenders = false;
    let wantsMoreDestroyers = false;

    for(let source of Object.values(colony.kickStart.remoteSites))
    {
        if(!source.enabled)
        {
            continue;
        }
        if(!source.containerId && source.containerPos)
        {
            for(let s of room.lookForAt(LOOK_STRUCTURES,source.containerPos.x,source.containerPos.y))
            {
                if(s.structureType == STRUCTURE_CONTAINER)
                {
                    source.containerId = s.id;
                    break;
                }
            }
        }

        let mroom = Game.rooms[source.room];
        if(mroom)
        {
            colony.kickStart.remoteState[source.room] = C.SAFE;
            for(let c of mroom.find(FIND_HOSTILE_STRUCTURES))
            {
                if(c.owner.username == INVADER_USERNAME)
                {
                    colony.kickStart.remoteState[source.room] = C.HAS_CORE;
                }
            }
            for(let c of mroom.find(FIND_HOSTILE_CREEPS))
            {
                if(c.owner.username == INVADER_USERNAME)
                {
                    colony.kickStart.remoteState[source.room] = C.UNDER_ATTACK;
                }
            }
        }
        if(colony.kickStart.remoteState[source.room] == C.UNDER_ATTACK)
        {
            let found = false;
            deleteDead(colony.kickStart.defenders);
            for(let dname of colony.kickStart.defenders)
            {
                let creep = Game.creeps[dname]
                if(_.isUndefined(creep.memory.target))
                {
                    console.log("Added: " + creep.name + " to the defence of " + source.room);
                    creep.memory.target = source.room;
                }
                if(creep.memory.target == source.room)
                {
                    found = true;
                    break;
                }
            }
            if(!found)
            {
                wantsMoreDefenders = true;
            }
        }
        if(colony.kickStart.remoteState[source.room] == C.HAS_CORE)
        {
            let found = 0;
            deleteDead(colony.kickStart.destroyers);
            for(let dname of colony.kickStart.destroyers)
            {
                let creep = Game.creeps[dname]
                if(_.isUndefined(creep.memory.target))
                {
                    console.log("Added: " + creep.name + " to the destruction of " + source.room);
                    creep.memory.target = source.room;
                }
                if(creep.memory.target == source.room)
                {
                    found += 1;
                }
            }
            if(found < 2)
            {
                wantsMoreDestroyers = true;
            }
        }

        deleteDead(source.haulers);
        deleteDead(source.miners);

        if(colony.kickStart.remoteState[source.room] == C.UNDER_ATTACK)
        {
            for(let cname of source.miners.concat(source.haulers))
            {
                let creep = Game.creeps[cname];
                if(creep.room.name == source.room)
                {
                    creep.travelTo(creep.pos.findClosestByPath(creep.room.find(FIND_EXIT)));
                }
                else
                {
                    creep.GoToRoom(creep.room.name);
                }
            }
            continue;
        }
        let sourceEnergy = (SOURCE_ENERGY_CAPACITY/ENERGY_REGEN_TIME);
        if(colony.level < 3)
        {
            sourceEnergy /= 2;
        }

        let fakeStores = {};


        let generated = 0;
        for(let mname of source.miners)
        {
            let creep = Game.creeps[mname];
            fakeStores[creep.id] = new FakeStore(creep.store);
            for(let res of creep.pos.lookFor(LOOK_RESOURCES))
            {
                fakeStores[creep.id].content[res.resourceType] += res.amount;
                creep.say(fakeStores[creep.id].Get(res.resourceType));
            }

            generated += creep.getActiveBodyparts(WORK) * HARVEST_POWER;
        }

        generated = Math.min(generated,sourceEnergy);

        this.GenerateFakeStores(colony,fakeStores);

        let hauled = 0;
        for(let cname of source.haulers)
        {
            let creep = Game.creeps[cname];
            hauled += creep.getActiveBodyparts(CARRY)*50/(source.distance*2);
            if(!creep.HasAtleast1TickWorthOfWork())
            {
                this.EnqueueRemoteHaulingWork(colony,creep,fakeStores,source);
            }

            if(creep.HasWork())
            {
                creep.DoWork();
            }
        }
        colony.kickStart.miningThoughput += Math.min(hauled,sourceEnergy)
        for(let mname of source.miners)
        {
            let creep = Game.creeps[mname];
            if(_.isUndefined(creep.memory.index))
            {
                for(let i in source.spots)
                {
                    let taken = false;
                    for(let omname of source.miners)
                    {
                        let otherMiner = Game.creeps[omname];
                        if(otherMiner.memory.index === i)
                        {
                            taken = true;
                            break;
                        }
                    }
                    if(!taken)
                    {
                        creep.memory.index = i;
                        break;
                    }
                }
                if(_.isUndefined(creep.memory.index))
                {
                    continue;
                }
            }

            let spot = source.spots[creep.memory.index];
            if(!spot)
            {
                delete creep.memory.index;
            }
            if(creep.pos.x != spot.pos.x || creep.pos.y != spot.pos.y)
            {
                creep.travelTo(new RoomPosition(spot.pos.x,spot.pos.y,spot.pos.roomName));
            }
            else
            {
                creep.harvest(Game.getObjectById(spot.id));
                for(let r of creep.pos.lookFor(LOOK_RESOURCES))
                {
                    creep.pickup(r);
                    break;
                }
            }
        }


        if(colony.haulerpool.length == 0)
        {
            continue;
        }

        if(colony.kickStart.remoteState[source.room] != C.SAFE)
        {
            continue;
        }

        if(hauled < generated && room.energyCapacityAvailable >= ENERGY_CAPACITY_AT_LEVEL[2])
        {
            let body = BODIES.LV2_HAULER;
            if(room.energyCapacityAvailable >= ENERGY_CAPACITY_AT_LEVEL[3])
            {
                body = BODIES.LV3_HAULER;
            }
            if(room.energyCapacityAvailable >= ENERGY_CAPACITY_AT_LEVEL[4])
            {
                body = BODIES.LV4_HAULER;
            }
            SpawnLocal(body,source.haulers,C.SPAWN_PRIORITY_NORMAL);
        }
        if(generated < sourceEnergy && source.miners.length < source.spots.length && room.energyCapacityAvailable >= ENERGY_CAPACITY_AT_LEVEL[2])
        {
            let body = BODIES.LV2_REMOTE_MINER;
            if(room.energyCapacityAvailable >= ENERGY_CAPACITY_AT_LEVEL[3])
            {
                body = BODIES.LV3_REMOTE_MINER;
            }
            if(room.energyCapacityAvailable >= ENERGY_CAPACITY_AT_LEVEL[4])
            {
                body = BODIES.LV4_REMOTE_MINER;
            }
            SpawnLocal(body,source.miners,C.SPAWN_PRIORITY_NORMAL);
        }
    }

    if(wantsMoreDefenders)
    {
        let body = BODIES.LV3_REMOTE_DEFENDER;
        if(room.energyCapacityAvailable >= ENERGY_CAPACITY_AT_LEVEL[4])
        {
            body = BODIES.LV4_REMOTE_DEFENDER;
        }
        SpawnLocal(body,colony.kickStart.defenders,C.SPAWN_PRIORITY_NORMAL);
    }
    if(wantsMoreDestroyers)
    {
        let body = BODIES.LV3_CORE_POPPER;
        if(room.energyCapacityAvailable >= ENERGY_CAPACITY_AT_LEVEL[4])
        {
            body = BODIES.LV4_CORE_POPPER;
        }
        SpawnLocal(body,colony.kickStart.destroyers,C.SPAWN_PRIORITY_NORMAL);
    }
}

module.exports.AddSources=function(colony,room)
{
    let spots = colony.kickStart.miningSpots;
    let terrain = new Room.Terrain(room.name);
    for(let source of room.sources)
    {
        let sourceSpots = [];
        for(let dir of ALL_DIRECTIONS)
        {
            let pos = source.pos.offsetDirection(dir);
            if(pos && terrain.get(pos.x,pos.y) != TERRAIN_MASK_WALL)
            {
                spots.push(
                    {
                        pos:pos,
                        id:source.id
                    });
                sourceSpots.push(
                    {
                        pos:pos,
                        score:0
                    });
            }
        }
        for(let p of spots)
        {
            for(let p2 of sourceSpots)
            {
                p2.score += p.pos.getRangeTo(p2.pos) < 2
                ? 1 
                : 0;
            }
        }
        sourceSpots = _.sortBy(sourceSpots,(s) => s.score);
        colony.kickStart.miningContainers.push(sourceSpots[0]);

        console.log("Added source: " + source.id + " to colony kickstart: " + colony.pos.roomName);
    }
}

module.exports.ConsiderRoom=function(colony,room)
{
    if(!room.controller)
    {
        return;
    }
    if(room.controller.level != 0)
    {
        return;
    }
    if(room.controller.reservation)
    {
        return;
    }

    let terrain = new Room.Terrain(room.name);
    for(let source of room.sources)
    {
        let pathResult = PathFinder.search(new RoomPosition(colony.pos.x,colony.pos.y,colony.pos.roomName),[{pos:source.pos,range:1}]);
        if(pathResult.incomplete)
        {
            continue;
        }


        colony.kickStart.remoteSites[source.id] = 
        {
            spots:[],
            miners:[],
            haulers:[],
            distance:pathResult.path.length,
            room:room.name
        };
        let spots = colony.kickStart.remoteSites[source.id].spots;
        for(let dir of ALL_DIRECTIONS)
        {
            let pos = source.pos.offsetDirection(dir);
            if(pos && terrain.get(pos.x,pos.y) != TERRAIN_MASK_WALL)
            {
                spots.push(
                    {
                        pos:pos,
                        id:source.id
                    });
            }
        }
        console.log("Added source: " + source.id + " to colony kickstart remotes: " + colony.pos.roomName);
    }
}

module.exports.ExpandMining=function(colony)
{
    if(colony.level < 2 || colony.kickStart.workers.length > 3)
    {
        return;
    }
    let status = colony.kickStart.checkedRooms;
    let list = colony.kickStart.scouts;
    deleteDead(list);
    for(let r2 of Object.values(Game.map.describeExits(colony.pos.roomName)))
    {
        if(!status[r2])
        {
            let room = Game.rooms[r2];
            if(room)
            {
                this.ConsiderRoom(colony,room);
                status[r2] = true;
                continue;
            }
            Empire.Scouting.WantsVision(r2);
        }
    }
    for(let source of Object.values(colony.kickStart.remoteSites))
    {
        if(source.enabled)
        {
            if(!source.containerPos)
            {
                let pathResult = PathFinder.search(
                    new RoomPosition(colony.pos.x,colony.pos.y,colony.pos.roomName),
                    [{pos:new RoomPosition(source.spots[0].pos.x,source.spots[0].pos.y,source.spots[0].pos.roomName),range:1}]);

                if(!pathResult.incomplete)
                {
                    let path = pathResult.path;
                    path.reverse();
                    for(let p of path)
                    {
                        if(p.roomName == colony.pos.roomName)
                        {
                            if(p.x < 46 && p.x > 5 && p.y < 46 && p.y > 5)
                            {
                                source.containerPos = p;
                                console.log("adding a container to " + p)
                                break;
                            }
                        }
                    }
                }
                else
                {
                    console.log("Incomplete");
                }
                for(let source2  of Object.values(colony.kickStart.remoteSites))
                {
                    if(source2.room == source.room)
                    {
                        source2.containerPos = source.containerPos;
                    }
                }
            }
        }
    }

    if(Object.values(Game.map.describeExits(colony.pos.roomName)).length == Object.values(colony.kickStart.checkedRooms).length)
    {
        if(!colony.kickStart.hasDecidedRemotes)
        {
            let byRoom = {};
            for(let source of Object.values(colony.kickStart.remoteSites))
            {
                source.enabled = false;
                let score = 1/source.distance;
                if(!byRoom[source.room])
                {
                    byRoom[source.room] = score
                }
                else
                {
                    byRoom[source.room] += score
                }
            }

            let sorted = _.sortBy(Object.keys(byRoom),(r) => -byRoom[r]);
            let distance = 0;
            for(let r of sorted)
            {
                for(let source of Object.values(colony.kickStart.remoteSites))
                {
                    if(source.room == r)
                    {
                        source.enabled = true; 
                        distance += source.distance;
                    }
                }
                if(distance > 150)
                {
                    break;
                }
            }

            colony.kickStart.hasDecidedRemotes = true;
        }
    }
}

module.exports.Terminate=function(colony)
{
    let room = Game.rooms[colony.pos.roomName];
    if(!room)
    {
        return;
    }

    let lost = false;
    for(let event of room.getEventLog())
    {
        if(event.event == EVENT_ATTACK)
        {
            let attacker = Game.getObjectById(event.objectId);
            if(!attacker)
            {
                continue;
            }
            if(attacker.my || attacker.owner.username == 'Invader')
            {
                continue;
            }
            if(room.Structures(STRUCTURE_TOWER).length == 0)
            {
                lost = true;
            }
        }
    }

    if(lost && !Game.flags["Abandon"])
    {
        Game.notify("Lost a colony in room: " + colony.pos.roomName);
        room.createFlag(25,25,"Abandon");
    }
}

module.exports.InvaderDeterent = function(colony)
{
    let room = Game.rooms[colony.pos.roomName];
    if(!room)
    {
        return;
    }


    let shutdown = false;
    let invader = false;
    for(let c of room.find(FIND_HOSTILE_CREEPS))
    {
        if(c.owner.username == 'Invader')
        {
            invader = c;
        }
    }

    for(let tower of room.Structures(STRUCTURE_TOWER))
    {
        RequestResource(colony,tower.id,RESOURCE_ENERGY,600,REQUEST_PRIORITY_TIMED);
    }
    if(invader)
    {
        shutdown = true;
        for(let tower of room.Structures(STRUCTURE_TOWER))
        {
            tower.attack(invader);
            shutdown = false;
        }
    }

    if(shutdown)
    {
    }
}

let GenerateRoad=function(colony,target)
{
    let res = PathFinder.search(
        new RoomPosition(colony.pos.x,colony.pos.y,colony.pos.roomName),
        [{pos:target,range:1}],
        {
            roomCallback:Colony.Planner.PFCostMatrixRoadCallback
        });
    if(res.incomplete)
    {
        return false;
    }
    let b = [];
    for(let p of res.path)
    {
        b.push(
            {
                structure:STRUCTURE_ROAD,
                pos:p
            })
    }
    return SerializeLayout(b);
}

module.exports.Roads=function(colony)
{
    let room = Game.rooms[colony.pos.roomName];
    if(!room)
    {
        return;
    }
    if(!colony.subLayouts)
    {
        colony.subLayouts = {};
    }
    if(_.isUndefined(colony.subLayouts["kickstart_roads"]))
    {
        colony.subLayouts["kickstart_roads"] = "";
    }
    if(_.isUndefined(colony.kickStart.roads))
    {
        colony.kickStart.roads = 0;
    }
    if(colony.kickStart.roads < 1)
    {
        let res = GenerateRoad(colony,room.controller.pos);
        if(res)
        {
            colony.subLayouts["kickstart_roads"] += res
            colony.kickStart.roads += 1;
            Colony.Helpers.ReduceSubLayouts(colony);
        }
    }
    else if(colony.kickStart.miningSpots && colony.kickStart.roads < 1 + colony.kickStart.miningSpots.length)
    {
        let point = colony.kickStart.miningSpots[colony.kickStart.roads-1].pos;
        if(point.roomName != colony.pos.roomName)
        {
            colony.kickStart.roads += 1;
            return;
        }
        let targetpos = new RoomPosition(point.x,point.y,point.roomName);
        let res = GenerateRoad(colony,targetpos);
        if(res)
        {
            colony.subLayouts["kickstart_roads"] += res
            colony.kickStart.roads += 1;
            Colony.Helpers.ReduceSubLayouts(colony);
        }
    }
}

module.exports.Claim=function(colony)
{
    let room = Game.rooms[colony.pos.roomName];
    if(room && room.controller.my)
    {
        return;
    }
    let list = colony.kickStart.claimers;
    deleteDead(list);
    if(list.length == 0)
    {
        Colony.Helpers.SpawnCreep(
            colony,
            list,
            BODIES.BASIC_CLAIMER,
            ROLE_CLAIMER,
            {
                allowShards:true,
                allowNearby:true,
                nearbyRange:10
            });
    }

    for(let creepName of list)
    {
        let creep = Game.creeps[creepName];
        if(!room)
        {
            creep.travelTo(new RoomPosition(colony.pos.x,colony.pos.y,colony.pos.roomName));
        }
        else
        {
            if(!room.controller.owner)
            {
                if(creep.do(CCREEP_CLAIM_CONTROLLER,room.controller) == OK)
                {
                    creep.signController(room.controller,"Colony started at: " + Game.time);
                }
            }
            else
            {
                creep.do(CREEP_ATTACK_CONTROLLER,room.controller);
            }
        }
    }
}

module.exports.Mine=function(colony)
{
    let room = Game.rooms[colony.pos.roomName];
    if(!room)
    {
        return;
    }

    if(!colony.kickStart.miningSpots)
    {
        colony.kickStart.miningSpots = [];
        this.AddSources(colony,room);
    }

    let list = colony.kickStart.miners;
    deleteDead(list);

    let spots = colony.kickStart.miningSpots;
    let throughPuts = {};
    let taken = [];
    for(let spot of spots)
    {
        throughPuts[spot.id] = 0;
        taken.push(false);
    }
    deleteDead(list);
    for(let creepName of list)
    {
        let creep = Game.creeps[creepName]
        if(creep.memory.miningIndex)
        {
            taken[creep.memory.miningIndex] = true;
            let spot = spots[creep.memory.miningIndex];
            throughPuts[spot.id] += creep.getActiveBodyparts(WORK) * HARVEST_POWER;
        }
    }
    for(let creepName of list)
    {
        let creep = Game.creeps[creepName]
        if(_.isUndefined(creep.memory.miningIndex) && creep.pos.roomName == room.name)
        {
            for(let i in spots)
            {
                if(!taken[i])
                {
                    if(throughPuts[spots[i].id] < 10)
                    {
                        creep.memory.miningIndex = i;
                        taken[i] = true;
                        throughPuts[spots[i].id] += creep.getActiveBodyparts(WORK) * HARVEST_POWER;
                        break;
                    }
                }
            }
        }
        if(!_.isUndefined(creep.memory.miningIndex))
        {
            let spot = spots[creep.memory.miningIndex];
            if(creep.pos.x != spot.pos.x || creep.pos.y != spot.pos.y || creep.pos.roomName != spot.pos.roomName)
            {
                creep.travelTo(new RoomPosition(spot.pos.x,spot.pos.y,spot.pos.roomName));
            }
            else
            {
                creep.harvest(Game.getObjectById(spot.id));
                let limit = creep.store.getCapacity(RESOURCE_ENERGY)/5*4;
                for(let r of creep.pos.lookFor(LOOK_RESOURCES))
                {
                    creep.pickup(r);
                    break;
                }

                RequestEmptying(colony,creep.id,RESOURCE_ENERGY,limit,REQUEST_PRIORITY_FUNCTION);
            }
            if(colony.kickStart.length > 0 && creep.store.getUsedCapacity(RESOURCE_ENERGY) >= Math.min(creep.store.getCapacity(RESOURCE_ENERGY),creep.getActiveBodyparts(WORK) * BUILD_POWER))
            {
                for(let s of room.lookForAtArea(
                    LOOK_CONSTRUCTION_SITES,
                    Math.max(2,creep.pos.y-3),
                    Math.max(2,creep.pos.x-3),
                    Math.min(48,creep.pos.y+3),
                    Math.min(48,creep.pos.x+3),
                    true))
                {
                    creep.build(s[LOOK_CONSTRUCTION_SITES]);
                    break;   
                }
            }

            if(creep.store.getUsedCapacity(RESOURCE_ENERGY) > 40)
            {

                for(let s of room.lookForAtArea(
                    LOOK_STRUCTURES,
                    Math.max(2,creep.pos.y-1),
                    Math.max(2,creep.pos.x-1),
                    Math.min(48,creep.pos.y+1),
                    Math.min(48,creep.pos.x+1),
                    true))
                {
                    if(s[LOOK_STRUCTURES].structureType == STRUCTURE_CONTAINER && s[LOOK_STRUCTURES].store.getFreeCapacity(RESOURCE_ENERGY) > 0)
                    {
                        creep.transfer(s[LOOK_STRUCTURES],RESOURCE_ENERGY)
                        break;
                    }
                }
            }
        }
        if(_.isUndefined(creep.memory.miningIndex))
        {
            creep.GoToRoom(room.name);
        }
    }

    let needMoreMiners = false;
    colony.kickStart.miningThoughput = 0;
    for(let id in throughPuts)
    {
        if(throughPuts[id] < (SOURCE_ENERGY_CAPACITY / ENERGY_REGEN_TIME))
        {
            for(let index in taken)
            {
                if(!taken[index] && spots[index].id == id)
                {
                    needMoreMiners  = true;
                }
            }
        }
        colony.kickStart.miningThoughput += Math.min(throughPuts[id],(SOURCE_ENERGY_CAPACITY / ENERGY_REGEN_TIME));
    }

    colony.kickStart.miningSpace = needMoreMiners;
    if(needMoreMiners)
    {
        let body = [WORK,WORK,MOVE,CARRY];
        if(list.length > 0)
        {
            if(room.energyCapacityAvailable > 500)
            {
                body = [MOVE,MOVE,MOVE,WORK,WORK,WORK,CARRY,CARRY];
            }
            if(room.energyCapacityAvailable > 750)
            {
                body = [MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY];
            }
        }
        SpawnLocal(body,list,C.SPAWN_PRIORITY_NORMAL);
    }
    else
    {
        for(let i = list.length - 1; i >= 0;i--)
        {
            let cname = list[i];
            let creep = Game.creeps[cname];
            if(_.isUndefined(creep.memory.miningIndex))
            {
                list.splice(i,1);
                colony.kickStart.workers.push(cname);
            }
        }
    }
}

let StampSites=function(colony,layout,allowed)
{
    let room = Game.rooms[colony.pos.roomName];
    
    let buildings = DeserializeLayout(layout,colony.pos.roomName);
    let structures = room.lookForAtArea(LOOK_STRUCTURES,2,2,48,48);
    let sites = room.lookForAtArea(LOOK_CONSTRUCTION_SITES,2,2,48,48);

    let allBuilt = true;
    for(let b of buildings)
    {
        if(allowed.includes(b.structure))
        {
            let there = false;
            if(structures[b.pos.y] && structures[b.pos.y][b.pos.x])
            {
                for(let building of structures[b.pos.y][b.pos.x])
                {
                    if(building.structureType == b.structure)
                    {
                        there = true;
                        break;
                    }
                }
            }
            if(!there)
            {
                allBuilt = false;
                if(sites[b.pos.y] && sites[b.pos.y][b.pos.x])
                {
                    for(let site of sites[b.pos.y][b.pos.x])
                    {
                        if(site.structureType == b.structure)
                        {
                            there = true;
                            break;
                        }
                    }
                }
            }
            if(!there)
            {
                b.pos.createConstructionSite(b.structure)
            }
        }
    }
    return allBuilt;
}

module.exports.CreateContainersSites=function(colony,onlyMining)
{
    let missing = false;
    let locations = [];
    if(!onlyMining)
    {
        locations.push(new RoomPosition(colony.pos.x,colony.pos.y+1,colony.pos.roomName));
        if(colony.upgradePos)
        {
            locations.push(new RoomPosition(colony.upgradePos.x,colony.upgradePos.y,colony.upgradePos.roomName));
        }
        for(let source of Object.values(colony.kickStart.remoteSites))
        {
            if(source.enabled && source.containerPos)
            {
                locations.push(new RoomPosition(source.containerPos.x,source.containerPos.y,source.containerPos.roomName));
            }
        }
    }

    for(let p of colony.kickStart.miningContainers)
    {
        locations.push(new RoomPosition(p.pos.x,p.pos.y,p.pos.roomName));
    }

    let vis = new RoomVisual(colony.pos.roomName); 
    for(let p of locations)
    {
        let has = false;
        for(let t of p.lookFor(LOOK_STRUCTURES).concat(p.lookFor(LOOK_CONSTRUCTION_SITES)))
        {
            if(t.structureType == STRUCTURE_CONTAINER)
            {
                has = true;
                break;
            }
        }
        if(!has)
        {
            missing = true;
            p.createConstructionSite(STRUCTURE_CONTAINER);
            vis.symbol(p.x,p.y,STRUCTURE_CONTAINER);
        }
    }
    return missing;
}

module.exports.CreateSites=function(colony)
{
    let room = Game.rooms[colony.pos.roomName];
    if(!room)
    {
        return;
    }

    const NEEDED = [
        STRUCTURE_SPAWN,
        STRUCTURE_EXTENSION,
        STRUCTURE_TOWER,
        STRUCTURE_STORAGE
    ];

    if(StampSites(colony,colony.layout,[STRUCTURE_SPAWN]))
    {
        if(StampSites(colony,colony.layout,[STRUCTURE_STORAGE]))
        {
            if(room.Structures(STRUCTURE_SPAWN).length > 0 && this.CreateContainersSites(colony,true))
            {
                return;
            }
            if(StampSites(colony,colony.layout,NEEDED) && colony.level > 1)
            {
                if(this.CreateContainersSites(colony))
                {
                    return;
                }
                const ALLOWED = [
                    STRUCTURE_SPAWN,
                    STRUCTURE_EXTENSION,
                    STRUCTURE_TOWER,
                    STRUCTURE_STORAGE,
                    STRUCTURE_ROAD
                ];

                if(StampSites(colony,colony.layout,ALLOWED))
                {
                    if(!colony.subLayouts) {colony.subLayouts = {}}
                    for(let layout of Object.values(colony.subLayouts))
                    {
                        StampSites(colony,layout,ALLOWED);
                    }
                }
            }
        }
    }
}

module.exports.EnqueueWork=function(colony,room,fakeStores,creep,target,miners)
{
    if(fakeStores[creep.id].Get(RESOURCE_ENERGY) == 0)
    {
        let container = _.sortBy(_.filter(room.Structures(STRUCTURE_CONTAINER),(c) => fakeStores[c.id].Get(RESOURCE_ENERGY) > 0),(c) => c.pos.getRangeTo(creep.pos))[0];
        
        if(container)
        {
            let work = 
            {
                action:CREEP_WITHDRAW,
                target:container.id,
                arg1:RESOURCE_ENERGY
            };
            creep.EnqueueWork(work);
            creep.SimulateWorkUnit(work,fakeStores);
        }
        else
        {
            let req = ColonyFindUnfilledFromRequest(colony,fakeStores,creep.pos);
            if(req && req.resource == RESOURCE_ENERGY)
            {
                let work = 
                {
                    action:CREEP_WITHDRAW,
                    target:req.id,
                    arg1:RESOURCE_ENERGY
                };
                creep.EnqueueWork(work);
                creep.SimulateWorkUnit(work,fakeStores);
            }
            else if(colony.kickStart.miningSpace && miners.length < colony.kickStart.miningSpots.length)
            {
                return true;
            }
        }
    }

    if(target instanceof Structure)
    {
        let power = creep.getActiveBodyparts(WORK) * DISMANTLE_POWER;
        let work = 
        {
            action:CREEP_DISMANTLE,
            target:target.id
        };

        for(let i = 0;i < target.hits && !creep.OverWorked();i += power)
        {
            creep.EnqueueWork(work);
            creep.SimulateWorkUnit(work,fakeStores);
        }
        return;
    }
    
    if(colony.haulerpool.length < 4 && fakeStores[creep.id].Get(RESOURCE_ENERGY) > 0)
    {
        let req = ColonyFindUnfilledToRequest(colony,fakeStores,new RoomPosition(colony.pos.x,colony.pos.y,colony.pos.roomName),false,RESOURCE_ENERGY);
        if(req)
        {
            let work = 
            {
                action:CREEP_TRANSFER,
                target:req.id,
                arg1:RESOURCE_ENERGY
            }
            creep.EnqueueWork(work);
            creep.SimulateWorkUnit(work,fakeStores);
            return;
        }
    }

    let work = 
    {
        action:CREEP_UPGRADE_CONTROLLER,
        target:room.controller.id
    };


    if(room.controller.ticksToDowngrade > 5000 && target instanceof ConstructionSite)
    {
        work =
        {
            action:CREEP_BUILD,
            target:target.id
        };
    }
    for(let s of room.find(FIND_STRUCTURES))
    {
        if(s.hits / s.hitsMax < 0.7)
        {
            let w =
            {
                action:CREEP_REPAIR,
                target:s.id
            };
            let p = REPAIR_POWER;
            for(let i = s.hits; i < s.hitsMax && !creep.OverWorked(); i += p)
            {
                creep.EnqueueWork(w);
                creep.SimulateWorkUnit(w,fakeStores);
            }
            break;
        }
    }

    if(!room.controller.my && !target)
    {
        creep.travelTo(new RoomPosition(colony.pos.x,colony.pos.y,colony.pos.roomName),{range:6});
        return;
    }

    while(fakeStores[creep.id].Get(RESOURCE_ENERGY) > 0 && !creep.OverWorked())
    {
        creep.EnqueueWork(work);
        creep.SimulateWorkUnit(work,fakeStores);
    }

    if(!creep.HasWork())
    {
        return true;
    }
}

module.exports.GenerateFakeStores=function(colony,fakeStores)
{
    let room = Game.rooms[colony.pos.roomName];
    if(!room)
    {
        return;
    }
    let creepPools =
    [
        colony.haulerpool,
        colony.kickStart.miners,
        colony.kickStart.workers,
        colony.kickStart.remotes,
        colony.kickStart.claimers,
        colony.kickStart.scouts,
        colony.kickStart.defenders,
        colony.kickStart.destroyers,
    ]

    for(let source of Object.values(colony.kickStart.remoteSites))
    {
        creepPools.push(source.miners);
        creepPools.push(source.haulers);
    }

    for(let list of creepPools)
    {
        deleteDead(list);
        for(let creepName of list)
        {
            let creep = Game.creeps[creepName];
            fakeStores[creep.id] = new FakeStore(creep.store);
        }
    }

    for(let infra of room.Structures(STRUCTURE_SPAWN)
        .concat(room.Structures(STRUCTURE_EXTENSION))
        .concat(room.Structures(STRUCTURE_TOWER))
        .concat(room.Structures(STRUCTURE_CONTAINER)))
    {
        fakeStores[infra.id] = new FakeStore(infra.store);
    }

    for(let list of creepPools)
    {
        for(let creepName of list)
        {
            Game.creeps[creepName].SimulateWork(fakeStores);
        }
    }
}

module.exports.Develop=function(colony)
{
    let room = Game.rooms[colony.pos.roomName];
    let list = colony.kickStart.workers;
    if(!room)
    {
        deleteDead(list);   
        for(let i = list.length - 1;i >= 0;i--)
        {
            let creep = Game.creeps[list[i]];
            creep.GoToRoom(colony.pos.roomName);
        }
        if(colony.kickStart.claimers.length == 0)
        {
            return;
        }
        let body = BODIES.LV1_WORKER;
        Colony.Helpers.SpawnCreep(
            colony,
            list,
            body,
            ROLE_WORKER,
            {
                allowShards:true,
                allowNearby:true,
                nearbyBody:BODY_GROUPS.WORKERS,
                extraList:colony.workersensus
            });

        return;
    }

    if(Game.time % 5 == 0)
    {
        if(room.find(FIND_HOSTILE_CREEPS).length == 0 || room.Structures(STRUCTURE_TOWER).length > 0)
        {
            this.CreateSites(colony);
        }
    }
    
    deleteDead(list);
    let fakeStores = {};
    let miners = colony.kickStart.miners;

    this.GenerateFakeStores(colony,fakeStores);

    let sites = room.find(FIND_CONSTRUCTION_SITES);
    let target = sites[0];
    for(let b of room.find(FIND_HOSTILE_STRUCTURES))
    {
        target = b;
        break;
    }
    let throughput = 0;
    for(let i = list.length - 1;i >= 0;i--)
    {
        let creepName = list[i];
        let creep = Game.creeps[creepName];
        throughput += creep.getActiveBodyparts(WORK);
        if(!creep.HasAtleast1TickWorthOfWork())
        {
            if(this.EnqueueWork(colony,room,fakeStores,creep,target,miners))
            {
                miners.push(creepName);
                list.splice(i,1);
                continue;
            }
        }

        if(colony.haulerpool.length != 0)
        {
            RequestResource(colony,creep.id,RESOURCE_ENERGY,creep.store.getCapacity(RESOURCE_ENERGY)-20,REQUEST_PRIORITY_AUXILIARY);
        }

        if(creep.HasWork())
        {
            creep.DoWork();
        }
        else if (creep.pos.roomName != room.name)
        {
            creep.GoToRoom(room.name);
        }
    }

    if(sites.length > 0)
    {
        throughput *= (BUILD_POWER/UPGRADE_CONTROLLER_POWER);
    }

    if(throughput < Math.max(colony.kickStart.miningThoughput * 1.5,20))
    {
        let body = BODIES.LV1_WORKER;
        if(room.energyCapacityAvailable >= ENERGY_CAPACITY_AT_LEVEL[2])
        {
            body = BODIES.LV2_WORKER;
        }
        if(room.energyCapacityAvailable >= ENERGY_CAPACITY_AT_LEVEL[3])
        {
            body = BODIES.LV3_WORKER;
        }
        SpawnLocal(body,list,C.SPAWN_PRIORITY_NORMAL);
    }
}

module.exports.Hauling=function(colony)
{
    let room = Game.rooms[colony.pos.roomName];
    if(!room)
    {
        return;
    }

    for(let s of room.Structures(STRUCTURE_SPAWN))
    {
        RequestResource(colony,s.id,RESOURCE_ENERGY,300,REQUEST_PRIORITY_FUNCTION);
    }
    for(let s of room.Structures(STRUCTURE_EXTENSION))
    {
        RequestResource(colony,s.id,RESOURCE_ENERGY,50,REQUEST_PRIORITY_FUNCTION);
    }
    for(let s of room.Structures(STRUCTURE_TOWER))
    {
        RequestResource(colony,s.id,RESOURCE_ENERGY,700,REQUEST_PRIORITY_PROGRESS);
    }

    for(let p of colony.kickStart.miningContainers)
    {
        for(let c of room.lookForAt(LOOK_STRUCTURES,p.pos.x,p.pos.y))
        {
            if(c.structureType == STRUCTURE_CONTAINER)
            {
                RequestEmptying(colony,c.id,RESOURCE_ENERGY,50,REQUEST_PRIORITY_FUNCTION);
            }
        }
    }

    if(colony.upgradePos)
    {
        for(let c of room.lookForAt(LOOK_STRUCTURES,colony.upgradePos.x,colony.upgradePos.y))
        {
            if(c.structureType == STRUCTURE_CONTAINER)
            {
                RequestResource(colony,c.id,RESOURCE_ENERGY,1500,REQUEST_PRIORITY_FUNCTION);
            }
        }
    }

    for(let source of Object.values(colony.kickStart.remoteSites))
    {
        if(source.enabled && source.containerPos)
        {
            for(let c of room.lookForAt(LOOK_STRUCTURES,source.containerPos.x,source.containerPos.y))
            {
                if(c.structureType == STRUCTURE_CONTAINER)
                {
                    RequestEmptying(colony,c.id,RESOURCE_ENERGY,50,REQUEST_PRIORITY_FUNCTION);
                }
            }
        }
    }

    for(let c of room.lookForAt(LOOK_STRUCTURES,colony.pos.x,colony.pos.y+1))
    {
        if(c.structureType == STRUCTURE_CONTAINER)
        {
            room.storage = room.storage || c[LOOK_STRUCTURES];
            break;
        }
    }
}

module.exports.EnqueuePickup=function(creep)
{
    if(creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0)
    {
        for(let r of creep.room.find(FIND_DROPPED_RESOURCES))
        {
            let work = 
            {
                action:CREEP_PICKUP,
                target:r.id
            };
            creep.EnqueueWork(work);
        }
    }
}

module.exports.EnqueueHaulerWork = function(colony,containerId)
{
    let room = Game.rooms[colony.pos.roomName];
    let predicted = {};
    this.GenerateFakeStores(colony,predicted);
    for(let creepName of colony.haulerpool)
    {
        let creep = Game.creeps[creepName];
        if(!creep.HasAtleast1TickWorthOfWork())
        {
            for(let creepName of colony.haulerpool)
            {
                let creep = Game.creeps[creepName];
                if(!creep.HasAtleast1TickWorthOfWork())
                {
                    EnqueueToRequests(colony,containerId,creep,predicted);
                }
                if(!creep.HasAtleast1TickWorthOfWork())
                {
                    EnqueueFromRequests(colony,containerId,creep,predicted);
                }
                if(!creep.HasAtleast1TickWorthOfWork())
                {
                    this.EnqueuePickup(creep);
                }
                if(creep.memory._workQueue && creep.memory._workQueue.length > 200)
                {
                    console.log("infloop detected");
                    delete creep.memory._workQueue;
                }
            }
            break;
        }
    }
}

module.exports.FulfillRequests=function(colony)
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

    let storageId = false;
    for(let c of room.lookForAt(LOOK_STRUCTURES,colony.pos.x,colony.pos.y+1))
    {
        if(c.structureType == STRUCTURE_CONTAINER)
        {
            storageId = c.id;
            break;
        }
    }
    
    this.EnqueueHaulerWork(colony,storageId);

    let haulingPower = 0;

    for(let creepName of colony.haulerpool)
    {
        let creep = Game.creeps[creepName];
        haulingPower += creep.getActiveBodyparts(CARRY);
        if(creep.HasWork())
        {
            creep.DoWork();
        }
        else
        {
            creep.say("idle")
            creep.travelTo(new RoomPosition(colony.pos.x,colony.pos.y,colony.pos.roomName),{range:6})
        }
    }

    if(haulingPower < 20 + 10 * Object.keys(colony.kickStart.remoteSites).length * 0.1)
    {
        let body = BODIES.LV1_HAULER;
        if(room.energyCapacityAvailable >= ENERGY_CAPACITY_AT_LEVEL[2])
        {
            body = BODIES.LV2_HAULER;
        }
        if(room.energyCapacityAvailable >= ENERGY_CAPACITY_AT_LEVEL[3])
        {
            body = BODIES.LV3_HAULER;
        }
        if(room.energyCapacityAvailable >= ENERGY_CAPACITY_AT_LEVEL[4])
        {
            body = BODIES.LV4_HAULER;
        }
        SpawnLocal(body,colony.haulerpool,C.SPAWN_PRIORITY_NORMAL);
    }
}