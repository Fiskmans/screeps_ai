colonyRetargetFactory=function(room,colony)
{
    
}

ColonyWorkerBehaviour=function(colony)
{
    if(!colony.constructionsite || Game.rooms[colony.pos.roomName].controller.ticksToDowngrade < 1000)
    {
        ColonyIdleWorkers(colony)
        ColonyFindBuildingWork(colony)
    }
    else
    {
        colonyConstruct(colony)
    }
}

ColonyIdleWorkers=function(colony)
{
    for(var key in colony.workerpool)
    {
        let creep = Game.creeps[colony.workerpool[key]];
        if(creep)
        {
            if (creep.pos.roomName != colony.pos.roomName) 
            {
                creep.travelTo(new RoomPosition(25,25,colony.pos.roomName))
            }
            else
            {
                creep.dumbUpgradeLoop()
            }
        }
    }
}

ColonyRespawnWorkers=function(colony)
{
    
    let target = TARGET_WORKER_COUNT
    if (colony.level < 4)
    {
        target = target * (4 - colony.level) 
    }
    
    if (colony.workerpool.length < target)
    {
        spawnRoleIntoList(Game.rooms[colony.pos.roomName],colony.workerpool,ROLE_WORKER)
        if (Game.rooms[colony.pos.roomName].spawns().length == 0) 
        {
            let closest = FindClosestColony(colony.pos.roomName);
            if (closest && closest.workerpool.length > 1) 
            {
                colony.workerpool.push(closest.workerpool.shift())
                console.log(colony.pos.roomName + " stole a worker from " + closest.pos.roomName)
            }
            else
            {
                //Panic
            }
        }
    }
}

SetupLowTierStorage=function(colony)
{
    let room = Game.rooms[colony.pos.roomName]
    if (!room.storage) 
    {
        room.storage = room.containers()[0];
    }
}

BasicHaulersAndMiners=function(colony)
{
    let room = Game.rooms[colony.pos.roomName]
    if (room && room.storage) 
    {
        if(!colony.haulerpool) {colony.haulerpool = []}
        if (colony.haulerpool.length < 2) 
        {
            spawnRoleIntoList(Game.rooms[colony.pos.roomName],colony.haulerpool,ROLE_HAULER)
        }
        Scavange(colony)
        MaintainMiningSpots(colony)
    }
}

FindRecLink=function(colony)
{
    if (!colony.recievelink) 
    {
        let room = Game.rooms[colony.pos.roomName]
        let result = room.lookAt(colony.pos.x + 6,colony.pos.y + 5)
        result.forEach((r) => {
            if (r.type == 'structure' && r.structure instanceof StructureLink) 
            {
                console.log("colony found rec link with id: " +  r.structure.id);
                colony.recievelink = r.structure.id;
            }
        })
    }
}

StartMining=function(colony)
{
    if (colony.miningSpots && colony.miningSpots.length == 0) 
    {
        let room = Game.rooms[colony.pos.roomName];
        if (room) 
        {
            let sources = room.find(FIND_SOURCES).concat(room.find(FIND_MINERALS))
            sources.forEach((s) =>
            {
                AddMiningSpot(colony,new MiningSpot(s.pos));
            })
        }
    }
}

ColonyFindBuildingWork=function(colony)
{
    let room = Game.rooms[colony.pos.roomName];
    var missing = findMissing(colony.pos.x,colony.pos.y,colony.pos.roomName,layout.structures[room.controller.level])
    var prio = Priorotized(colony.pos.x,colony.pos.y,colony.pos.roomName,missing)
    if (prio) 
    {
        if (room.controller && room.controller.level > 5 && room.storage && room.storage.store.getUsedCapacity(RESOURCE_ENERGY) > CONSTRUCTION_COST[prio.struct] && Prioroties[prio.struct] > 5) 
        {
            return;
        }
        if (prio.pos.createConstructionSite(prio.struct) == OK)
        {
            colony.constructionsite = prio.pos
        }
    }
}