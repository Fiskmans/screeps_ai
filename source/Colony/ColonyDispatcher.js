

module.exports.DispatchAll=function()
{
    if(!Memory.colonies) {Memory.colonies = []}
    for(let colony of Object.values(Memory.colonies))
    {
        this.Dispatch(colony)
    }
}

module.exports.Dispatch=function(colony)
{
    deleteDead(colony.workerpool)
    if (colony.haulerpool) 
    {
        deleteDead(colony.haulerpool)
    }

    Colony.Planner.Expand(colony);

    let room = Game.rooms[colony.pos.roomName]
    if (room && room.controller.my && room.controller.level != 0) 
    {
        colony.level = room.controller.level;
    }
    else
    {
        colony.level = 0;
    }
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
    
    Colony.Modules.Misc.CompactifyLayout(colony);
    drawColony(colony)
}