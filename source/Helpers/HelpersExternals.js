module.exports.IsRoomVisible=function(roomName)
{
    return Memory.lastViewed && Memory.lastViewed.room == roomName && (Game.time - Memory.lastViewed.at < 5);
}