
let _remoteModified = false;
let _memory = false;

module.exports.Get = function()
{
    if(!_remoteModified)
    {
        _remoteModified = true;
        try
        {
            _memory = JSON.parse(InterShardMemory.getLocal());
            if(!_memory)
            {
                _memory = {};
            }
        }
        catch (e)
        {
            _memory = {};
        }
    }
    return _memory;
}

module.exports.Commit = function()
{
    if(_remoteModified)
    {
        try
        {
            InterShardMemory.setLocal(JSON.stringify(_memory));
        }
        catch (e)
        {
            Game.notify("Intershard Memory commit error (likely stack overflow)");
            console.log("Intershard Memory commit error (likely stack overflow)");
        }
        _remoteModified = false;
    }
}

module.exports.GetRemote = function(shardName)
{
    let mem = InterShardMemory.getRemote(shardName);
    if(!mem)
    {
        return {};
    }
    try
    {
        return JSON.parse(mem);
    }
    catch (e)
    {
        return {}
    }
}