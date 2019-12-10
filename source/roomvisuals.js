drawRoom=function(roomName)
{
    var vis = new RoomVisual(roomName)
    if(!Memory.data) {Memory.data = {}}
    if(!Memory.data.pexpansions) {Memory.data.pexpansions = []}
    var expansiocolors = ["#000000","#FF0000","#FFFF00","#00FF00"]
    
    for(var key in Memory.data.pexpansions)
    {
        var pexpansion = Memory.data.pexpansions[key]
        if (pexpansion.roomName == roomName) {
            vis.circle(pexpansion.x,pexpansion.y,{fill:expansiocolors[pexpansion.checklevel]})
        }
    }
    for(var key in Memory.data.posexpansions)
    {
        var posexpansion = Memory.data.posexpansions[key]
        if (posexpansion.roomName == roomName) {
            vis.circle(posexpansion.x,posexpansion.y,{fill:_.last(expansiocolors)})
        }
    }
}