
module.exports.SpawnCreep=function(colonyOrRoomName,list,body,role,options)
{
    if(!options) {options = {}}
    _.defaults(options,
        {
            allowShards:false,
            allowNearby:false,
            nearbyRange:20,
            nearbyBody:[]
        });

    let roomName = false;
    if(typeof(colonyOrRoomName) === 'string')
    {
        roomName = colonyOrRoomName;
    }
    else
    {
        roomName = colonyOrRoomName.pos.roomName;
    }
    
    let room = Game.rooms[roomName];

    let cost = Helpers.Resources.BodyCost(body);
    if((!room || room.energyCapacityAvailable < cost))
    {
        if(options.allowNearby)
        {
            let closest =  options.nearbyRange + 1;
            for(let c of Object.values(Memory.colonies))
            {
                let d = Game.map.getRoomLinearDistance(roomName,c.pos.roomName);
                if(d <= options.nearbyRange)
                {
                    if(d < closest)
                    {
                        closest = d;
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
                        }
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

    if(!room || cost > room.energyAvailable)
    {
        return ERR_NOT_ENOUGH_ENERGY;
    }
    
    for(let spawn of room.Structures(STRUCTURE_SPAWN))
    {
        if(!spawn.spawning)
        {
            let name = (SHARD_CREEP_NAME_PREFIXES[Game.shard.name] || '?' ) + (ROLE_PREFIXES[role] || '?') + Memory.creepid;
            if(spawn.spawnCreep(body,name,{memory:{home:roomName}}) == OK)
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


module.exports.MaintainWorkers=function(colony,list,amount)
{
    if(typeof(amount) !== 'number')
    {
        amount = amount ? 1 : 0;
    }
    while(list.length > amount)
    {
        colony.workerpool.push(list.shift());
    }
    while(list.length < amount && colony.workerpool.length > 0)
    {
        list.push(colony.workerpool.shift());
    }

    return Helpers.Creep.List(list);
}

module.exports.Roster=function(colony,tag,amount)
{
    if(!colony.workerRoster) { colony.workerRoster = {}; }
    if(!colony.workerRoster[tag])
    {
        colony.workerRoster[tag] = [];
    }
    return this.MaintainWorkers(colony,colony.workerRoster[tag],amount);
}

module.exports.ReduceLayout=function(layout)
{
    let out = "";
    let exists = [];
    for(let i = 0; i < layout.length;i += 3)
    {
        let part = layout.substring(i,i+3);
        if(!exists.includes(part))
        {
            exists.push(part);
            out += part;
        }
    }
    return out;
}

module.exports.ReduceSubLayouts=function(colony)
{
    for(let tag in colony.subLayouts)
    {
        colony.subLayouts[tag] = this.ReduceLayout(colony.subLayouts[tag]);
    }
}

module.exports.IncrementExpense=function(colony,tag,amount)
{
    if(!colony.expenses[tag]) { colony.expenses[tag] = 0; }
    colony.expenses[tag] += amount;
}

module.exports.DecrementExpense=function(colony,tag,amount)
{
    if(!colony.expenses[tag]) { colony.expenses[tag] = 0; }
    colony.expenses[tag] -= amount;
}

module.exports.SetExpense=function(colony,tag,amount)
{
    colony.expenses[tag] = amount;
}

module.exports.IncrementIncome=function(colony,tag,amount)
{
    if(!colony.income[tag]) { colony.income[tag] = 0; }
    colony.income[tag] += amount;
}

module.exports.DecrementIncome=function(colony,tag,amount)
{
    if(!colony.income[tag]) { colony.income[tag] = 0; }
    colony.income[tag] -= amount;
}

module.exports.SetIncome=function(colony,tag,amount)
{
    colony.income[tag] = amount;
}