module.exports.IsRoomVisible=function(roomName)
{
    return Memory.lastViewed && Memory.lastViewed.room == roomName && (Game.time - Memory.lastViewed.at < 5);
}

module.exports.Notify=function(message,isError)
{
    Game.notify(message);
    if(isError)
    {
        console.log("<font color=\"red\">" + message + "</font>");
    }
    else
    {
        console.log(message);
    }
}