

module.exports.BasicWorkers=function(colony)
{
    if(!colony.constructionsite || colony.refreshDowngrade)
    {
        ColonyIdleWorkers(colony)
        ColonyFindBuildingWork(colony)
        if (Game.rooms[colony.pos.roomName].controller.ticksToDowngrade > CONTROLLER_MAX_DOWNGRADE)
        {
            delete colony.refreshDowngrade
        }
    }
    else
    {
        colonyConstruct(colony)
        if (Game.rooms[colony.pos.roomName].controller.ticksToDowngrade < CONTROLLER_MIN_DOWNGRADE)
        {
            colony.refreshDowngrade = true
        }
    }
}

module.exports.MaintainHighways=function(colony)
{
    for(var key in colony.highways)
    {
        dopath(colony.highways[key])
        maintain(colony.highways[key],colony)
    }
}

let _RemoteMining = function(colony)
{
    Colony.RemoteMining.Run(colony);
}

module.exports.RemoteMining=function(colony)
{
    Performance.Decisions.Run("remote_mining",_RemoteMining,colony);
}