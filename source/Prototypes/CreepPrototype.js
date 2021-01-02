Creep.prototype.do=function(action,target,arg1,arg2,arg3)
{
    if (typeof(target) === "string") 
    {
        target = Game.getObjectById(target);
    }
    let err = this[action](target,arg1,arg2,arg3);
    if(err == ERR_NOT_IN_RANGE)
    {
        this.travelTo(target)
    }
    return err;
}
Creep.prototype.LeaveEdge=function()
{
    if (this.pos.x < 2) { this.travelTo(new RoomPosition(25,25,this.room.name,{ignoreCreeps:false})); }
    if (this.pos.x > 46) { this.travelTo(new RoomPosition(25,25,this.room.name,{ignoreCreeps:false})); }
    if (this.pos.y < 2) { this.travelTo(new RoomPosition(25,25,this.room.name,{ignoreCreeps:false})); }
    if (this.pos.y > 47) { this.travelTo(new RoomPosition(25,25,this.room.name,{ignoreCreeps:false})); }
}

Creep.prototype.dumbHarvest=function()
{
    if (this.room.storage && this.room.storage.store.getUsedCapacity(RESOURCE_ENERGY) > this.store.getCapacity(RESOURCE_ENERGY))
    {
        this.say("🧱")
        let err = this.withdraw(this.room.storage,RESOURCE_ENERGY);
        if (err == ERR_NOT_IN_RANGE) {
            this.travelTo(this.room.storage);
            return
        }
        else if(err == ERR_FULL)
        {
            if(this.store.getUsedCapacity(RESOURCE_ENERGY) < 50)
            {
                err = this.transfer(this.room.storage,ExtractContentOfStore(this.store)[0]);
            }
        }
        else if(err == OK)
        {
            return
        }
    }
    
    let resourses = this.room.find(FIND_DROPPED_RESOURCES,{filter:(r) => {return r.resourceType == RESOURCE_ENERGY}});
    if (resourses.length > 0) 
    {
        let target = this.pos.findClosestByPath(resourses);
        if (this.pickup(target) == ERR_NOT_IN_RANGE)
        {
            this.travelTo(target)
        }
        return;
    }
    
    this.say("🧱")
    var source = this.pos.findClosestByPath(FIND_SOURCES_ACTIVE)
    if(this.harvest(source) == ERR_NOT_IN_RANGE)
    {
        this.travelTo(source)
    }
}
Creep.prototype.dumbUpgrade=function()
{
    this.say("🔧")
    if(this.upgradeController(this.room.controller) == ERR_NOT_IN_RANGE)
    {
        this.travelTo(this.room.controller)
    }
}
Creep.prototype.scavenge = function()
{
    
}

Creep.prototype.dumbBuild=function()
{
    this.say("🏗️")
    if(this.build(this.room.find(FIND_MY_CONSTRUCTION_SITES)[0]) == ERR_NOT_IN_RANGE)
    {
        this.travelTo(this.room.find(FIND_MY_CONSTRUCTION_SITES)[0])
    }
}

Creep.prototype.HasWork=function()
{
    return this.memory._workQueue && this.memory._workQueue.length > 0;
}

Creep.prototype.HasAtleast1TickWorthOfWork=function()
{
    return this.memory._workQueue && this.memory._workQueue.length > 1;
}

Creep.prototype.EnqueueWork=function(work)
{
    if(!this.memory._workQueue) { this.memory._workQueue = [] };
    this.memory._workQueue.push(work);
}

Creep.prototype._execWork=function(work)
{
    return this.do(work.action,work.target,work.arg1,work.arg2);
}

Creep.prototype.DoWork=function()
{
    if(this.spawning || !this.HasWork())
    {
        return;
    }

    let res = this._execWork(this.memory._workQueue[0]);
    let dequeu = false;
    switch(res)
    {
        case OK:
        default: // any error
            dequeu = true;
            break;

        case ERR_NOT_IN_RANGE:
            break;
    }
    if(dequeu)
    {
        this.memory._workQueue.shift();
        if(this.HasWork())
        {
            let nextTarget = Game.getObjectById(this.memory._workQueue[0].target);
            if(nextTarget && nextTarget.pos.getRangeTo(this.pos) > 1)
            {
                this.travelTo(nextTarget);
            }
        }
    }
}

Creep.prototype.DrawWork=function(vis,opt)
{
    let options = opt || {};
    _.defaults(options,{radius:0.4,strokeStart:0x77CC77,strokeEnd:0xCC7777});
    if(!this.HasWork())
    {
        return;
    }

    let lastPos = this.pos;
    let stroke = "#" + options.strokeStart.toString(16);

    vis.circle(lastPos,{radius:options.radius,fill:"#00000000",stroke:stroke,strokewidth:0.1,opacity:0.8});

    for(let i in this.memory._workQueue)
    {
        let work = this.memory._workQueue[i];
        stroke = "#" + lerpColor(options.strokeStart,options.strokeEnd,(i - -1)/this.memory._workQueue.length).toString(16);

        let obj = Game.getObjectById(work.target)
        if(!obj)
        {
            vis.line(lastPos.x + 0.5,lastPos.y + 0.5,lastPos.x - 0.5,lastPos.y - 0.5,{stroke:"#FF0000"});
            vis.line(lastPos.x + 0.5,lastPos.y - 0.5,lastPos.x + 0.5,lastPos.y - 0.5,{stroke:"#FF0000"});
            break;
        }
        vis.circle(obj.pos,{radius:options.radius,fill:"#00000000",stroke:stroke,strokewidth:0.1,opacity:0.8});

        //vis.text(stroke,obj.pos);

        let dx = lastPos.x - obj.pos.x;
        let dy = lastPos.y - obj.pos.y;

        let len = Math.sqrt(dx*dx+dy*dy);

        dx /= len;
        dy /= len;

        vis.line(   lastPos.x - dx * options.radius,lastPos.y - dy * options.radius,
                    obj.pos.x + dx * options.radius,obj.pos.y + dy * options.radius,
                    {color:stroke,width:0.05,opacity:0.9});

        vis.text(CREEP_ACTION_ICON[work.action], obj.pos.x, obj.pos.y + 0.1, {align:'right',font:0.27})
        
        switch(work.action)
        {
            case CREEP_WITHDRAW:
            case CREEP_TRANSFER:
                vis.symbol(obj.pos.x+0.2,obj.pos.y,work.arg1,{scale:0.4});
                break;
        }

        lastPos = obj.pos;
    }

}

Creep.prototype.SimulateWorkUnit=function(workUnit,fakeStores)
{
    switch(workUnit.action)
    {
    case CREEP_WITHDRAW:
        if(fakeStores[workUnit.target])
        {
            fakeStores[this.id].Withdraw(fakeStores[workUnit.target],workUnit.arg1,workUnit.arg2);
        }
        break;
    case CREEP_TRANSFER:
        if(fakeStores[workUnit.target])
        {
            fakeStores[this.id].Transfer(fakeStores[workUnit.target],workUnit.arg1,workUnit.arg2);
        }
        break;
    }
}

Creep.prototype.SimulateWork=function(fakeStores)
{
    if(!this.HasWork())
    {
        return;
    }

    for(let work of this.memory._workQueue)
    {
        this.SimulateWorkUnit(work,fakeStores);
    }
}

Creep.prototype.dumbRefill=function()
{
    let target = false
    targets = _.sortBy( this.room.refillable(),(s) => { return this.pos.getRangeTo(s) + REFILLPRIORITY[s.structureType];});
    
    if (targets.length > 0) 
    {
        this.say(targets.length)
        target = targets[0];
    }
    else
    {
        this.say("No target")
    }
    if(target && (this.transfer(target,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE))
    {
        this.travelTo(target)
    }
}

Creep.prototype.dumbUpgradeLoop=function()
{
    this.updateHarvestState()
    if (this.memory.harvesting) {
        this.dumbHarvest()
    }
    else
    {
        this.dumbUpgrade()
    }
}

Creep.prototype.smarterUpgradeLoop=function(link)
{
    this.updateHarvestState()
    if (this.memory.harvesting) {
        this.do('withdraw',link,RESOURCE_ENERGY);
    }
    else
    {
        this.dumbUpgrade()
    }
}

Creep.prototype.dumbRefillLoop=function()
{
    this.updateHarvestState()
    if (this.memory.harvesting) {
        this.dumbHarvest()
    }
    else
    {
        this.dumbRefill()
    }
}

Creep.prototype.dismantleLoop=function(target)
{
    this.updateHarvestState()
    if (this.memory.harvesting) 
    {
        this.dumbDismantle(target)
    }
    else
    {
        if(this.room.refillable.length == 0)
        {
            if(this.room.storage)
            {
                if(this.room.storage.store.getFreeCapacity() > 0)
                {
                    let err = this.transfer(this.room.storage,ExtractContentOfStore(this.store)[0]);
                    if(err == ERR_NOT_IN_RANGE)
                    {
                        this.travelTo(this.room.storage);
                    }
                }
                else
                {
                    this.drop(ExtractContentOfStore(this.store)[0]);
                }
            }
            else
            {
                this.drop(ExtractContentOfStore(this.store)[0]);
            }
        }
        else
        {
            this.dumbRefill();
        }
    }
}

Creep.prototype.dumbDismantle = function(target)
{
    this.say("dismant")
    if (this.dismantle(target) == ERR_NOT_IN_RANGE) 
    {
        this.say("dismant m")
        this.travelTo(target);
    }
}

Creep.prototype.dumbBuildLoop=function()
{
    this.updateHarvestState()
    if (this.memory.harvesting) {
        this.dumbHarvest()
    }
    else
    {
        this.dumbBuild()
    }
}
Creep.prototype.updateHarvestState=function()
{
    if(this.store.getFreeCapacity() == 0)
    {
        this.memory.harvesting = false
    }
    if(this.store.getUsedCapacity(RESOURCE_ENERGY) == 0)
    {
        this.memory.harvesting = true
    }
}

Creep.prototype.Retire = function(roomName)
{
    let spawn = false;
    let room = Cache.rooms[roomName];
    if(room)
    {
        room.PopulateShorthands();
        if(room.spawns.length > 0)
        {
            spawn = room.spawns[0];
        }
    }
    if(spawn)
    {
        let res = spawn.recycleCreep(this);
        if(res == ERR_NOT_IN_RANGE)
        {
            this.travelTo(spawn);
        }
    }
    else
    {
        this.say("bad retirement: " + roomName);
    }
}