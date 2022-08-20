

module.exports.List=function(list)
{
    let out = [];
    for(let i = list.length - 1; i >= 0;i--)
    {
        let creep = Game.creeps[list[i]];
        if(creep)
        {
            out.push(creep);
        }
        else
        {
            list.splice(i,1);
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