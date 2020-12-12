Highway = function(start,end)
{
    if(start instanceof RoomPosition && end instanceof RoomPosition)
    {
        this.start = start
        this.end = end
    }
    this.path = []
    this.lastmaintained = 0;
}
Highway.prototype.dopath=function()
{
    doPath(this)
}
Highway.prototype.maintain=function(colony)
{
    maintain(this,colony)
}


MiningSpot = function(position)
{
    if (position instanceof RoomPosition) 
    {
        this.myPosition = position;
    }
    else
    {
        this.myPosition = new RoomPosition( position.myPosition.x,position.myPosition.y,position.myPosition.roomName);
    }
}

Colony = function(_x,_y,roomName)
{  
    if (_x instanceof RoomPosition) 
    {
        this.pos = _x
    }
    else
    {
        this.pos = new RoomPosition(_x,_y,roomName)
    }
    
    this.highways = []
    this.miningSpots = []
    this.constructionsite = false
    this.workerpool = []
    this.lastmaintained = 0
}

