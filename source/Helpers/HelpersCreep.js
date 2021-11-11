

module.exports.List=function(list, options)
{
    let out = [];
    for(let i = list.length - 1; i >= 0;i--)
    {
        if(options)
        {
            if(Colony.Modules.Spawning.IsQueued(list[i], options))
            {
                options.hasQueued = true;
                options.validCreeps++;
                continue;
            }
        }
        else if(Colony.Modules.Spawning.IsQueued(list[i]))
        {
            continue;
        }
        let creep = Game.creeps[list[i]];
        if(creep)
        {
            if(options)
            {
                if(creep.spawning)
                {
                    options.hasSpawning = true;
                    options.validCreeps++;
                    continue;
                }
                if(creep.ticksToLive > options.threshold)
                {
                    options.validCreeps++;
                }
            }
            out.push(creep);
        }
        else
        {
            list.splice(i, 1);
        }
    }
    return out;
}

module.exports.BodyCost=function(body)
{
    let total = 0;
    for(let b of body)
    {
        total += BODYPART_COST[b];
    }
    return total;
}