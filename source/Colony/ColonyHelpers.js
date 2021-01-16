

module.exports.SpawnCreep=function(colony,list,body,role,options)
{
    if(!options) {options = {}}
    _.defaults(options,
        {
            allowShards:false,
            allowNearby:false,
            nearbyRange:20,
            nearbyBody:[]
        });

    let room = Game.rooms[colony.pos.roomName];
    let cost = Helpers.Resources.BodyCost(body);
    if((!room || room.energyCapacityAvailable < cost))
    {
        if(options.allowNearby)
        {
            for(let c of Object.values(Memory.colonies))
            {
                if(Game.map.getRoomLinearDistance(colony.pos.roomName,c.pos.roomName) <= options.nearbyRange)
                {
                    let r2 = Game.rooms[c.pos.roomName]
                    if(r2 && r2.energyCapacityAvailable >= cost)
                    {
                        room = r2;
                        for(let b of options.nearbyBody)
                        {
                            let bcost = Helpers.Resources.BodyCost(b);
                            if(bcost <= r2.energyCapacityAvailable)
                            {
                                cost = bcost;
                                body = b;
                            }
                        }
                        break;
                    }
                }
            }
        }
    }

    if((!room || room.energyCapacityAvailable < cost))
    {
        if(options.allowShards)
        {
            if(InterShard.Transport.Adopt(list,role))
            {
                return OK;
            }
            InterShard.Transport.Request(role);
            return ERR_NOT_ENOUGH_ENERGY;
        }
    }

    if(cost > room.energyAvailable)
    {
        return ERR_NOT_ENOUGH_ENERGY;
    }
    
    for(let spawn of room.Structures(STRUCTURE_SPAWN))
    {
        if(!spawn.spawning)
        {
            let name = (SHARD_CREEP_NAME_PREFIXES[Game.shard.name] || '?' ) + (ROLE_PREFIXES[role] || '?') + Memory.creepid;
            if(spawn.spawnCreep(body,name,{memory:{home:colony.pos.roomName}}) == OK)
            {
                spawn.spawning = true;
                list.push(name);
                if(options.extraList)
                {
                    options.extraList.push(name);
                }
                Memory.creepid += 1;

                return OK;
            }
        }
    }
}