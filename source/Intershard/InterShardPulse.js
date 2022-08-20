
module.exports.Pulse=function()
{
    InterShard.Memory.Get().time = Game.time;
}

module.exports.IsActive=function(shardName)
{
    if(!Memory.shards) { Memory.shards = {} };
    if(!Memory.shards[shardName]) { Memory.shards[shardName] = {active:false,lastTime:0,lastChecked:0}}

    let shard = Memory.shards[shardName];

    if(Game.time - shard.lastChecked > SHARD_CHECK_PULSE_INTERVAL)
    {   
        shard.lastChecked = Game.time;

        let memory = InterShard.Memory.GetRemote(shardName);
        if(!memory.time)
        {
            shard.active = false;
        }
        else
        {
            if(memory.time > shard.lastTime)
            {
                shard.lastTime = memory.time;
                shard.active = true;
            }
            else
            {
                shard.active = false;
            }
        }
    }

    return shard.active;
}