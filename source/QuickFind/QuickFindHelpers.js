

module.exports.Line=function(start,end)
{
    let xIsMajorAxis = Math.abs(start.x - end.x) > Math.abs(start.y - end.y);

    let flip = false;
    if(xIsMajorAxis)
    {
        if(end.x < start.x)
        {
            flip = true;
        }
    }
    else
    {
        if(end.y < start.y)
        {
            flip = true;
        }
    }

    if(flip)
    {
        let tmp = start;
        start = end;
        end = tmp;
    }
    let out = [];
    if(xIsMajorAxis)
    {
        for(let x = start.x + 1;x < end.x;x++)
        {
            let xx = x;
            let yy = Math.round((x-start.x)/(end.x-start.x) * (end.y-start.y)) + start.y;

            out.push(new RoomPosition(xx,
                yy, 
                start.roomName));
        }
    }
    else
    {
        for(let y = start.y + 1;y < end.y;y++)
        {
            let xx = Math.round((y-start.y)/(end.y-start.y) * (end.x-start.x)) + start.x;
            let yy = y;

            out.push(new RoomPosition(xx,
                yy, 
                start.roomName));
        }
    }
    if(flip)
    {
        out.reverse();
    }
    return out;
}

module.exports.IsReachable=function(from,to)
{
    let path = this.Line(from,to);
    let terrain = new Room.Terrain(from.roomName);
    for(let p of path)
    {
        if(terrain.get(p.x,p.y) == TERRAIN_MASK_WALL)
        {
            return false;
        }
    }

    return true;
}