RoomPosition.prototype.offset=function(x,y)
{
    let rx = this.x - -x;
    let ry = this.y - -y;
    if(rx < 0 || rx > 49 || ry < 0 || ry > 49)
    {
        return false;
    }

    return new RoomPosition(rx,ry,this.roomName);
}

RoomPosition.prototype.offsetDirection=function(dir)
{
    return this.offset(DIRECTION_OFFSET[dir][0],DIRECTION_OFFSET[dir][1]);
}

RoomPosition.prototype.Around=function()
{
    let out = [];
    for(let dir of ALL_DIRECTIONS)
    {
        let pos = this.offsetDirection(dir);
        if(pos)
        {
            out.push(pos)
        }
    }
    return out;
}