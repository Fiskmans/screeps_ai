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
    this.content = {};
    for(let r of Object.keys(store))
    {
        this.content[r] = store[r] || 0;
        this.total += this.content[r];
        this.capacity[r] = store.getCapacity(r) || 0;
    }
    this.original = store;
}

FakeStore.prototype.Get=function(type)
{
    return this.content[type] || 0;
}

FakeStore.prototype.GetCapacity=function(type)
{
    return this.capacity[type] || this.original.getCapacity(type) || 0;
}

FakeStore.prototype.Withdraw=function(other,type,amount)
{
    if(!other)
    {
        console.log("invalid other");
        return;
    }
    let am = amount || Math.min(other.Get(type),Math.max(this.GetCapacity(type)-this.total,0));
    this.total += am;
    if(!this.content[type]) { this.content[type] = 0; }
    this.content[type] += am;
    other.total -= am;
    other.content[type] -= am;
}

FakeStore.prototype.Transfer=function(other,type,amount)
{
    if(!other)
    {
        console.log("invalid other");
        return;
    }
    let am = amount || Math.min(this.Get(type),Math.max(other.GetCapacity(type)-other.total,0));
    other.total += am;
    if(!other.content[type]) { other.content[type] = 0; }
    other.content[type] += am;
    this.total -= am;
    this.content[type] -= am;
}

FakeStore.prototype.Remove=function(res,amount)
{
    if(this.content[res])
    {
        let am = Math.min(this.Get(res),amount);
        this.content[res] -= am;
        this.total -= am;
    }
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

