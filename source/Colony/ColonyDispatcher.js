

module.exports.DispatchAll=function()
{
    if(!Memory.colonies) {Memory.colonies = []}
    let count = 0;
    for(let colony of Object.values(Memory.colonies))
    {
        count++;
        if(count > Game.gcl.level)
        {
            break;
        }
        this.Dispatch(colony)
    }
}

module.exports.Dispatch=function(colony)
{
    deleteDead(colony.workerpool)


    let room = Game.rooms[colony.pos.roomName]
    if (room && room.controller.my && room.controller.level != 0) 
    {
        colony.level = room.controller.level;
    }
    else
    {
        colony.level = 0;
    }
    if(IS_FISK_SERVER && colony.level < RCL_MAX)
    {
        Colony.KickStart2.Main(colony);
    }
    else
    {
        Colony.Planner.Expand(colony);
        if(!room || !room.storage || !room.storage.my || !room.storage.isActive())
        {
            Colony.KickStart.Main(colony);
        }
        else
        {
            if(colony.kickStart)
            {
                delete colony.kickStart;
            }
            colonyLogic[colony.level](colony);
        }
    }
    
    Colony.Modules.Misc.CompactifyLayout(colony);
    drawColony(colony)
}