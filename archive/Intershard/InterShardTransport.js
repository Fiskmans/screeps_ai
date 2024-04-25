module.exports.SendScoutToShard=function(shardName)
{
    if(!Memory.interShard.to[shardName]) { Memory.interShard.to[shardName] = [] }
    if(!Memory.portals[shardName] || Object.keys(Memory.portals[shardName]).length == 0) { return; }

    let portal = Object.values(Memory.portals[shardName])[0]
    let portalRoom = portal.pos.roomName;


    let list = Memory.interShard.to[shardName];
    if(list.length == 0)
    {
        let col = FindClosestColony(portalRoom);
        spawnRoleIntoList(col.pos.roomName,list,ROLE_SCOUT);
    }
}

module.exports.ActivateDeadShards=function()
{
    for(let shardName in Memory.portals)
    {
        if(!InterShard.Pulse.IsActive(shardName))
        {
            this.SendScoutToShard(shardName);
        }
    }
}

module.exports.FlushScreeponauts=function()
{
    for(let shard in Memory.interShard.to)
    {
        if(!Memory.interShard.to[shard]) { Memory.interShard.to[shard] = [] }
        if(!Memory.portals[shard] || Object.keys(Memory.portals[shard]).length == 0) { return; }
    
        let portal = Object.values(Memory.portals[shard])[0]

        let list = Memory.interShard.to[shard];

        deleteDead(list);
        
        for(let creepName of list)
        {
            let creep = Game.creeps[creepName];
            creep.travelTo(new RoomPosition(portal.pos.x,portal.pos.y,portal.pos.roomName));
        }
    }
}

module.exports.FindOrphans=function()
{
    let shardNumber = SHARD_CREEP_NAME_PREFIXES[Game.shard.name];
    for(let creepName in Game.creeps)
    {
        if(creepName.length > 2 && creepName.charAt(SHARD_PREFIX_INDEX) != shardNumber)
        {
            let creep = Game.creeps[creepName];
            if(!creep.memory.home)
            {
                creep.memory.home = creep.room.name;
                let role = creepName.charAt(ROLE_PREFIX_INDEX);
                console.log("found a " + role + " orphan");
                if(!Memory.orphans[role]) { Memory.orphans[role] = [] }
                Memory.orphans[role].push(creepName);
                
                let mem = InterShard.Memory.Get();
                if(mem.needs)
                {
                    mem.needs = _.filter(mem.needs,(r) => { return ROLE_PREFIXES[r] != role});
                }

            }
        }
    }
}

module.exports.Adopt=function(list,role)
{
    let shortRole = ROLE_PREFIXES[role];
    if(!Memory.orphans[shortRole]) { return; }

    if(Memory.orphans[shortRole].length > 0)
    {
        console.log("Adopted a wee little baby: " + role);
        list.push(Memory.orphans[shortRole].shift());
        return true;
    }
    return false;
}

module.exports.FillRequests=function()
{
    for(let shard in Memory.interShard.to)
    {
        if(shard == Game.shard.name)
        {
            continue;
        }
        let mem = InterShard.Memory.GetRemote(shard);
        if(mem.needs)
        {
            for(let role of mem.needs)
            {
                if(!Memory.interShard.to[shard]) { Memory.interShard.to[shard] = [] }
                if(!Memory.portals[shard] || Object.keys(Memory.portals[shard]).length == 0) { return; }
                
                let portal = Object.values(Memory.portals[shard])[0]
                
                let list = Memory.interShard.to[shard];
                
                let onTheWay = false;
                for(let creepName of list)
                {
                    if(creepName.length > ROLE_PREFIX_INDEX && creepName.charAt(ROLE_PREFIX_INDEX) == ROLE_PREFIXES[role])
                    {
                        onTheWay = true;
                    }
                }
                if(!onTheWay)
                {
                    console.log(role);
                    let col = FindClosestColony(portal.pos.roomName);
                    spawnRoleIntoList(col.pos.roomName,list,role);
                }
            }

        }
    }
}

module.exports.Request=function(role)
{
   let mem = InterShard.Memory.Get();
   if(!mem.needs) { mem.needs = [] };
   if(!mem.needs.includes(role)) { mem.needs.push(role) }
}