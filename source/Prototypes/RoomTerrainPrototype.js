
Room.Terrain.prototype.isSpaceEmpty=function(_x,_y,w,h)
{
    for (var x = _x; x < w+_x; x++) {
        for (var y = _y; y < h+_y; y++) {
            if (this.get(x,y) == TERRAIN_MASK_WALL || x > 49 || y > 49) 
            {
                return false
            }
        }
    }
    return true
}

Room.Terrain.prototype.findExits=function(side,roomName)
{
    var exits = []
    if (!side || side == FIND_EXIT_TOP) 
    {
        for (var i = 0; i < 50; i++) {
            if (this.get(i,0) != TERRAIN_MASK_WALL) {
                exits.push(new RoomPosition(i,0,roomName))
            }
        }
    }
    if (!side || side == FIND_EXIT_LEFT) 
    {
        for (var i = 0; i < 50; i++) {
            if (this.get(49,i) != TERRAIN_MASK_WALL) {
                exits.push(new RoomPosition(0,i,roomName))
            }
        }
    }
    if (!side || side == FIND_EXIT_BOTTOM) 
    {
        for (var i = 0; i < 50; i++) {
            if (this.get(0,i) != TERRAIN_MASK_WALL) {
                exits.push(new RoomPosition(49,i,roomName))
            }
        }
    }
    if (!side || side == FIND_EXIT_RIGHT) 
    {
        for (var i = 0; i < 50; i++) {
            if (this.get(i,49) != TERRAIN_MASK_WALL) {
                exits.push(new RoomPosition(i,49,roomName))
            }
        }
    }
    return exits
}