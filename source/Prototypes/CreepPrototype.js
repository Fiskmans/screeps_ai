Creep.prototype.do=function(action,target,...args)
{
    if (typeof(target) === "string") 
    {
        target = Game.getObjectById(target);
    }
    let err;
    if(action == CREEP_WITHDRAW && target instanceof Creep)
    {
        err = target[CREEP_TRANSFER](this,...args);
    }
    else
    {
        err = this[action](target,...args);
    }
    
    if(err == ERR_NOT_IN_RANGE)
    {
        this.travelTo(target,{range:1})
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

Creep.prototype.OverWorked = function()
{
    return this.memory._workQueue && this.memory._workQueue.length > 12;
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

Creep.prototype._workPossible=function(work)
{
    let target;
    switch(work.action)
    {
        case CREEP_TRANSFER:
            if(this.store.getUsedCapacity(work.arg1) == 0)
            {
                return false;
            }
            target = Game.getObjectById(work.target);
            if(!target || !target.store || target.store.getFreeCapacity(work.arg1) == 0)
            {
                return false;
            }
            break;
        case CREEP_WITHDRAW:
            if(this.store.getFreeCapacity(work.arg1) == 0)
            {
                return false;
            }
            target = Game.getObjectById(work.target);
            if(!target || !target.store || target.store.getUsedCapacity(work.arg1) == 0)
            {
                return false;
            }
            break;
        case CREEP_REPAIR:
            target = Game.getObjectById(work.target);
            if(!target || target.hits == target.hitsMax)
            {
                return false;
            }
            break;
    }

    return true;
}

Creep.prototype.DoWork=function()
{
    if(this.spawning || !this.HasWork())
    {
        return false;
    }

    while(!this._workPossible(this.memory._workQueue[0]))
    {
        this.memory._workQueue.shift();
        if(this.memory._workQueue.length == 0)
        {
            return false;
        }
    }

    let res = this._execWork(this.memory._workQueue[0]);
    let dequeu = false;
    switch(res)
    {
        default: // any error
        case OK:
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
                this.travelTo(nextTarget,{range:1});
            }
        }
        return !this.HasWork();
    }
}

Creep.prototype.DrawWork=function(vis,opt)
{
    let options = opt || {};
    _.defaults(options,{radius:0.4,strokeStart:0x77CC77,strokeEnd:0xCC7777,baseRoom:this.pos.roomName});
    if(!this.HasWork())
    {
        return;
    }
    

    let [bx,by] = PosFromRoomName(options.baseRoom);
    let lx = this.pos.x;
    let ly = this.pos.y;
    let [tx,ty] = PosFromRoomName(this.pos.roomName);
    lx += (tx - bx) * ROOM_WIDTH;
    ly -= (ty - by) * ROOM_HEIGHT;

    let stroke = "#" + options.strokeStart.toString(16);

    vis.circle(lx,ly,{radius:options.radius,fill:"#00000000",stroke:stroke,strokewidth:0.1,opacity:0.8});

    let lastAction = false;
    let lastTarget = false;
    let repeatCount = 1;

    for(let i in this.memory._workQueue)
    {
        let work = this.memory._workQueue[i];
        if(lastAction == work.action && lastTarget == work.target)
        {
            repeatCount++;
            continue;
        }
        lastAction = work.action;
        lastTarget = work.target;
        if(repeatCount > 1)
        {
            vis.text("x"+repeatCount, lx,ly+0.1,{align:'left',font:0.27});
            repeatCount = 1;
        }

        stroke = "#" + lerpColor(options.strokeStart,options.strokeEnd,(i - -1)/this.memory._workQueue.length).toString(16);

        let obj = Game.getObjectById(work.target)
        if(!obj)
        {
            vis.line(lx + 0.5,ly + 0.5,lx - 0.5,ly - 0.5,{color:"#FF0000"});
            vis.line(lx - 0.5,ly + 0.5,lx + 0.5,ly - 0.5,{color:"#FF0000"});
            break;
        }
        vis.circle(obj.pos,{radius:options.radius,fill:"#00000000",stroke:stroke,strokewidth:0.1,opacity:0.8});

        let ox = obj.pos.x;
        let oy = obj.pos.y;
        let [orx,ory] = PosFromRoomName(obj.pos.roomName);
        ox += (orx - bx) * ROOM_WIDTH;
        oy -= (ory - by) * ROOM_HEIGHT;

        let dx = lx - ox;
        let dy = ly - oy;

        let len = Math.sqrt(dx*dx+dy*dy);

        dx /= len;
        dy /= len;

        vis.line(   lx - dx * options.radius,ly - dy * options.radius,
                    ox + dx * options.radius,oy + dy * options.radius,
                    {color:stroke,width:0.05,opacity:0.9});

        vis.text(CREEP_ACTION_ICON[work.action], ox, oy + 0.1, {align:'right',font:0.27})
        
        switch(work.action)
        {
            case CREEP_WITHDRAW:
            case CREEP_TRANSFER:
                vis.symbol(ox+0.2,oy,work.arg1,{scale:0.4});
                break;
        }

        lx = ox;
        ly = oy;
    }
    if(repeatCount > 1)
    {
        vis.text("x"+repeatCount, lx,ly+0.1,{align:'left',font:0.27});
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
    case CREEP_BUILD:
        fakeStores[this.id].Remove(RESOURCE_ENERGY,this.getActiveBodyparts(WORK) * BUILD_POWER);
        break;
    case CREEP_REPAIR:
        fakeStores[this.id].Remove(RESOURCE_ENERGY,this.getActiveBodyparts(WORK) * REPAIR_POWER * REPAIR_COST);
        break;
    case CREEP_UPGRADE_CONTROLLER:
        fakeStores[this.id].Remove(RESOURCE_ENERGY,this.getActiveBodyparts(WORK) * UPGRADE_CONTROLLER_POWER);
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
        if(!this.HasAtleast1TickWorthOfWork())
        {
            if(link.store.getUsedCapacity(RESOURCE_ENERGY) > 0)
            {
                this.EnqueueWork({
                    action:CREEP_WITHDRAW,
                    target:link.id,
                    arg1:RESOURCE_ENERGY
                });
            }
            else
            {
                for(let r of this.room.find(FIND_DROPPED_RESOURCES))
                {
                    if(r.resourceType == RESOURCE_ENERGY)
                    {
                        this.EnqueueWork({
                            action:CREEP_PICKUP,
                            target:r.id
                        });
                        break;
                    }
                }
            }
        }
        if(this.HasWork())
        {
            this.DoWork();
        }
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
    let room = Game.rooms[roomName];
    if(room)
    {
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

Creep.prototype.GoToRoom=function(roomName)
{
    this.travelTo(new RoomPosition(25,25,roomName),{range:20,preferHighway:true});
}

Creep.prototype.OpportuneRenew=function()
{
    if(this.pos.x < 4 || this.pos.x > 45 || this.pos.y < 4 || this.pos.y > 45)
    {
        return;
    }
    if(this.room.energyAvailable > 300 && this.ticksToLive < 1000)
    {
        for(let s of this.room.lookForAtArea(LOOK_STRUCTURES,this.pos.y-1,this.pos.x-1,this.pos.y+1,this.pos.x+1,true))
        {
            if(s[LOOK_STRUCTURES].structureType == STRUCTURE_SPAWN && s[LOOK_STRUCTURES].my && !s[LOOK_STRUCTURES].spawning)
            {
                this.say("Renewed");
                s[LOOK_STRUCTURES].renewCreep(this);
                s[LOOK_STRUCTURES].spawning = true;
            }
        }
    }
}