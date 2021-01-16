

module.exports.Main=function(colony)
{
    if(!colony.workersensus)
    {
        colony.workersensus = [];
    }
    if(!colony.kickStart)
    {
        colony.kickStart = 
        {
            miners:[],
            workers:[],
            claimers:[],
            scouts:[],
            miningThoughput:0,
            checkedRooms:{}
        }
    }



    RemoveDoneRequests(colony);
    if(!this.InvaderDeterent(colony))
    {
        this.Claim(colony);
        this.Mine(colony);
        this.Develop(colony);
        this.Roads(colony);
        this.Terminate(colony);
        this.ExpandMining(colony)
    }
}

module.exports.AddSources=function(colony,room)
{
    let spots = colony.kickStart.miningSpots;
    let terrain = new Room.Terrain(room.name);
    for(let source of room.sources)
    {
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
    this.AddSources(colony,room);
}

module.exports.ExpandMining=function(colony)
{
    return;
    if(colony.level < 2)
    {
        return;
    }
    if(!colony.kickStart.checkedRooms) { colony.kickStart.checkedRooms = {}}
    let status = colony.kickStart.checkedRooms;
    let wantMoreScouts = false;
    let list = colony.kickStart.scouts;
    deleteDead(list);
    for(let r2 of Object.values(Game.map.describeExits(colony.pos.roomName)))
    {
        let room = Game.rooms[r2];
        if(!status[r2])
        {
            if(room)
            {
                this.ConsiderRoom(colony,room);
                status[r2] = true;
                continue;
            }
            let onTheWay = false;
            for(let c of list)
            {
                let creep = Game.creeps[c];
                if(_.isUndefined(creep.memory.target))
                {
                    creep.memory.target = r2;
                    onTheWay = true;
                    break;
                }
                else if(creep.memory.target = r2)
                {
                    onTheWay = true;
                    break;
                }
            }
            if(!onTheWay)
            {
                wantMoreScouts = true;
            }
        }
    }

    for(let c of list)
    {
        let creep = Game.creeps[c];
        if(creep.memory.target)
        {
            creep.GoToRoom(creep.memory.target);
            if(creep.room.name == creep.memory.target)
            {
                delete creep.memory.target;
            }
        }
    }

    if(wantMoreScouts)
    {
        Colony.Helpers.SpawnCreep(
            colony,
            list,
            BODIES.SCOUT,
            ROLE_SCOUT
        )
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
        tower.attack(invader);
        shutdown = false;
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
        console.log("shutting down")
        for(let spawn of room.Structures(STRUCTURE_SPAWN))
        {
            if (spawn.spawning)
            {
                for(let c of room.find(FIND_MY_CREEPS))
                {
                    c.suicide();
                }
                return;
            }
        }
        Colony.Helpers.SpawnCreep(colony, colony.kickStart.workers,[WORK,CARRY,MOVE],ROLE_WORKER,{allowShards:true});
    }
}

let GenerateRoad=function(colony,target)
{
    let res = PathFinder.search(
        new RoomPosition(colony.pos.x,colony.pos.y,colony.pos.roomName),
        [{pos:target,range:1}],
        {
            roomCallback:Colony.Planner.MatrixRoadPreferFuture
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
            Colony.Planner.InvalidatePathMatrixes();
            colony.subLayouts["kickstart_roads"] += res
            colony.kickStart.roads += 1;
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
            Colony.Planner.InvalidatePathMatrixes();
            colony.subLayouts["kickstart_roads"] += res
            colony.kickStart.roads += 1;
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
                creep.do('claimController',room.controller);
            }
            else
            {
                creep.do('attackController',room.controller);
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
            for(let part of creep.body)
            {
                if(part.type == WORK)
                {
                    throughPuts[spot.id] += HARVEST_POWER;
                }
            }
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
                        for(let part of creep.body)
                        {
                            if(part.type == WORK)
                            {
                                throughPuts[spots[i].id] += HARVEST_POWER;
                            }
                        }
                        break;
                    }
                }
            }
        }
        if(!_.isUndefined(creep.memory.miningIndex))
        {
            let spot = spots[creep.memory.miningIndex];
            if(creep.pos.x != spot.pos.x || creep.pos.y != spot.pos.y)
            {
                creep.travelTo(new RoomPosition(spot.pos.x,spot.pos.y,spot.pos.roomName));
            }
            else
            {
                creep.harvest(Game.getObjectById(spot.id));
                let limit = creep.store.getCapacity(RESOURCE_ENERGY)/3;
                for(let r of creep.pos.lookFor(LOOK_RESOURCES))
                {
                    creep.pickup(r);
                    break;
                }
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

                RequestEmptying(colony,creep.id,RESOURCE_ENERGY,limit,REQUEST_PRIORITY_FUNCTION);
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
                body = [MOVE,WORK,WORK,WORK,WORK,CARRY,CARRY];
            }
            if(room.energyCapacityAvailable > 750)
            {
                body = [MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY];
            }
        }

        Colony.Helpers.SpawnCreep(colony,list,body,ROLE_WORKER);
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
    if(room.find(FIND_HOSTILE_CREEPS).length > 0)
    {
        return;
    }
    
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

module.exports.CreateSites=function(colony)
{
    let room = Game.rooms[colony.pos.roomName];
    if(!room)
    {
        return;
    }
    if(!colony.layout)
    {
        return;
    }


    const NEEDED = [
        STRUCTURE_SPAWN,
        STRUCTURE_EXTENSION,
        STRUCTURE_TOWER,
        STRUCTURE_STORAGE
    ];

    if(StampSites(colony,colony.layout,NEEDED) && colony.level > 1)
    {
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

module.exports.Develop=function(colony)
{
    let room = Game.rooms[colony.pos.roomName];
    if(!room)
    {
        return;
    }

    if(Game.time % 35 == 0)
    {
        this.CreateSites(colony);
    }

    
    let sites = room.find(FIND_CONSTRUCTION_SITES);
    let list = colony.kickStart.workers;
    deleteDead(list);
    let spawnInfra = room.Structures(STRUCTURE_SPAWN).concat(room.Structures(STRUCTURE_EXTENSION));
    let fakeStores = {};
    let miners = colony.kickStart.miners;
    InterShard.Transport.Adopt(list,ROLE_WORKER);
    
    for(let creepName of list)
    {
        let creep = Game.creeps[creepName];
        fakeStores[creep.id] = new FakeStore(creep.store);
    }
    deleteDead(miners);
    for(let creepName of miners)
    {
        let creep = Game.creeps[creepName];
        fakeStores[creep.id] = new FakeStore(creep.store);
        for(let r of creep.pos.lookFor(LOOK_RESOURCES))
        {
            if(fakeStores[creep.id][r.resourceType])
            {
                fakeStores[creep.id][r.resourceType] += r.amount;
            }
            else
            {
                fakeStores[creep.id][r.resourceType] = r.amount;
            }
            fakeStores[creep.id].total += r.amount;
        }
    }
    for(let infra of spawnInfra)
    {
        RequestResource(colony,infra.id,RESOURCE_ENERGY,infra instanceof StructureSpawn?300:50,REQUEST_PRIORITY_FUNCTION);
        fakeStores[infra.id] = new FakeStore(infra.store);
    }
    for(let tower of room.Structures(STRUCTURE_TOWER))
    {
        fakeStores[tower.id] = new FakeStore(tower.store);
    }

    for(let creepName of list)
    {
        Game.creeps[creepName].SimulateWork(fakeStores);
    }

    let fillReq = ColonyFindUnfilledToRequest(colony,fakeStores,new RoomPosition(colony.pos.x,colony.pos.y,colony.pos.roomName),false,RESOURCE_ENERGY);

    if(fillReq)
    {
        let furthest = 0;
        let furthestCreep = false;
        for(let creepName of list)
        {
            let creep = Game.creeps[creepName];
            if(fakeStores[creep.id].Get(RESOURCE_ENERGY) && !creep.HasWork())
            {
                let dist = room.controller.pos.getRangeTo(creep.pos);
                if(dist > furthest)
                {
                    furthest = dist;
                    furthestCreep = creep;
                }
            }
        }
        if(furthestCreep)
        {
            let work = 
            {
                action:CREEP_TRANSFER,
                target:fillReq.id,
                arg1:RESOURCE_ENERGY
            }
            furthestCreep.EnqueueWork(work);
            furthestCreep.SimulateWorkUnit(work,fakeStores);
        }
    }

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
        let power = 0;
        for(let part of creep.body)
        {
            if(part.type == WORK)
            {
                power += UPGRADE_CONTROLLER_POWER;
            }
        }
        throughput += power;
        if(creep.HasWork())
        {
            if(!creep.DoWork())
            {
                continue;
            }
            if(target instanceof ConstructionSite)
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
                creep.travelTo(target,{range:2});
            }
            else
            {
                creep.do(CREEP_UPGRADE_CONTROLLER,room.controller);
            }
        }
        else
        {
            if(creep.store.getUsedCapacity(RESOURCE_ENERGY) <= power)
            {
                let req = ColonyFindUnfilledFromRequest(colony,fakeStores,creep.pos);
                if (creep.pos.roomName != room.name)
                {
                    creep.GoToRoom(room.name);
                }
                else if(req && req.resource == RESOURCE_ENERGY)
                {
                    let work = 
                    {
                        action:CREEP_WITHDRAW,
                        target:req.id,
                        arg1:RESOURCE_ENERGY
                    };
                    creep.EnqueueWork(work);
                    creep.SimulateWorkUnit(work,fakeStores);

                    creep.DoWork();
                }
                else if(colony.kickStart.miningSpace && miners.length < colony.kickStart.miningSpots.length * 1.5)
                {
                    miners.push(creepName);
                    list.splice(i,1);
                }
                else if(!(target instanceof Structure))
                {
                    for(let source of room.sources)
                    {
                        if(creep.pos.getRangeTo(source.pos) > 8)
                        {
                            creep.travelTo(source.pos,{range:8,maxOps:20})
                        }
                        else
                        {
                            let count = 0;
                            let all = 
                            [
                                creep.pos.offsetDirection(LEFT),
                                creep.pos.offsetDirection(RIGHT),
                                creep.pos.offsetDirection(TOP),
                                creep.pos.offsetDirection(BOTTOM)
                            ]
                            for(let p of all)
                            {
                                if(p)
                                {
                                    count += p.lookFor(LOOK_CREEPS).length;
                                }
                            }

                            if(count >= 2)
                            {
                                creep.move(ALL_DIRECTIONS[Game.time%8]);
                            }
                        }
                        break;
                    }
                }
            }

            if((target instanceof Structure))
            {
                if(creep[CREEP_DISMANTLE](target) == ERR_NOT_IN_RANGE)
                {
                    creep.travelTo(target,{maxOps:20})
                }
            }
            else if(creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0)
            {
                if(target instanceof ConstructionSite)
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
                    creep.travelTo(target,{range:2});
                }
                else
                {
                    if(creep.pos.getRangeTo(room.controller.pos) > 2)
                    {
                        creep.travelTo(room.controller,{range:2,maxOps:20});
                    }
                    if(creep.pos.getRangeTo(room.controller.pos) < 4)
                    {
                        creep[CREEP_UPGRADE_CONTROLLER](room.controller);
                    }
                    
                }
            }
        }
    }

    if(throughput < Math.max(colony.kickStart.miningThoughput * 2,5))
    {
        let found = false;
        deleteDead(miners);
        if(throughput < 6)
        {
            for(let i = miners.length - 1;i >= 0;i--)
            {
                let creepName = miners[i];
                let creep = Game.creeps[creepName];
                if(creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0)
                {
                    list.push(creepName);
                    miners.splice(i,1);
                    
                    if(creep.memory.miningIndex)
                    {
                        delete creep.memory.miningIndex;
                    }
                    found = true;
                    break;
                }
            }
        }
        if(!found)
        {
            let body = BODIES.LV1_WORKER;
            if(room.energyCapacityAvailable > 500)
            {
                body = BODIES.LV2_WORKER;
            }
            if(room.energyCapacityAvailable > 750)
            {
                body = BODIES.LV3_WORKER;
            }

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
        }
    }
}