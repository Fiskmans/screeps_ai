module.exports.IsRoomVisible=function(roomName)
{
    if(IS_FISK_SERVER)
    {
        return true;
    }

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