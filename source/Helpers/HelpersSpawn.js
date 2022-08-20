
let C =
{
    SAMPLE_PERIOD: 1500
}

module.exports.CleanMemory=function()
{
    if(!Memory.spawns)
    {
        return;
    }

    for(let name in Memory.spawns)
    {
        if(!Game.spawns[name])
        {
            delete Memory.spawns[name];
        }
    }
}

module.exports.Track=function()
{
    for(let s of Object.values(Game.spawns))
    {
        let oldCount = s.memory.count || 0;
        let newCount = oldCount + 1;
        let oldAverage = s.memory.average || 0;

        s.memory.average = lerp(
            s.spawning ? 1 : 0,
            oldAverage,
            oldCount/newCount
        )
        s.memory.count = Math.min(newCount,C.SAMPLE_PERIOD);
    }
}