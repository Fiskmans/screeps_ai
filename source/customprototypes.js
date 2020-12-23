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


FakeStore = function(store)
{
    this.total = 0;
    this.capacity = {};
    for(let r of RESOURCES_ALL)
    {
        this[r] = store[r] || 0;
        this.total += this[r];
        this.capacity[r] = store.getCapacity(r) || 0;
    }
}

FakeStore.prototype.Withdraw=function(other,type,amount)
{
    if(!other)
    {
        return;
    }
    let am = amount || Math.min(other[type],this.capacity[type]-this.total);
    this.total += am;
    this[type] += am;
    other.total -= am;
    other[type] -= am;
}

FakeStore.prototype.Transfer=function(other,type,amount)
{
    if(!other)
    {
        return;
    }
    let am = amount || Math.min(this[type],other.capacity[type]-other.total);
    other.total += am;
    other[type] += am;
    this.total -= am;
    this[type] -= am;
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

