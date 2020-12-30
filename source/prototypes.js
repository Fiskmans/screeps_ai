/**
 * Returns a number whose value is limited to the given range.
 *
 * Example: limit the output of this computation to between 0 and 255
 * (x * 255).clamp(0, 255)
 *
 * @param {Number} min The lower boundary of the output range
 * @param {Number} max The upper boundary of the output range
 * @returns A number in the range [min, max]
 * @type Number
 */
Number.prototype.clamp = function(min, max) 
{
    return Math.min(Math.max(this, min), max);
};

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

RoomPosition.prototype.offset=function(x,y)
{
    return new RoomPosition(this.x+x,this.y+y,this.roomName);
}

REFILLPRIORITY = 
{
    [STRUCTURE_TOWER]:0,
    [STRUCTURE_SPAWN]:50,
    [STRUCTURE_EXTENSION]:55,
    [STRUCTURE_LAB]:100,
    [STRUCTURE_TERMINAL]:150,
    [STRUCTURE_STORAGE]:450
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

Room.prototype.refillable=function()
{
    let all = [];
    
    this.findAllStructures();
    all = _.filter(this._structures[STRUCTURE_EXTENSION].concat(this._structures[STRUCTURE_SPAWN].concat(this._structures[STRUCTURE_LAB])),
    (s) => 
    {
        return s.store.getFreeCapacity(RESOURCE_ENERGY) > 0; 
    });
    all = all.concat(_.filter(this._structures[STRUCTURE_TOWER],(s)=>
    {
        return s.store.getFreeCapacity(RESOURCE_ENERGY) > 400;
    }))
    all = all.concat(_.filter(this._structures[STRUCTURE_POWER_SPAWN],(s)=>
    {
        return s.store.getFreeCapacity(RESOURCE_ENERGY) > 1000;
    }))
    
    return all;
}

Room.prototype.findAllStructures=function()
{
    if(!this._structures)
    {
        this._structures = {};
        Object.keys(CONSTRUCTION_COST).forEach((s) => this._structures[s] = [])
        this._structures[STRUCTURE_CONTROLLER] = []
        this._structures[STRUCTURE_INVADER_CORE] = []
        this._structures[STRUCTURE_POWER_BANK] = []
        this._structures[STRUCTURE_KEEPER_LAIR] = []
        this._structures[STRUCTURE_PORTAL] = []
        
        this.find(FIND_STRUCTURES).forEach((s) => {
                this._structures[s.structureType].push(s)
        })
    }
}

Room.prototype.Structures=function(type)
{
    this.findAllStructures();
    return this._structures[type];
}

Room.prototype.hostiles=function()
{
    if(!this._hostiles)
    {
        this._hostiles = [];
        this._hostiles = this.find(FIND_HOSTILE_CREEPS);
        if(this.controller && !this.controller.my)
        {
            this._hostiles = this._hostiles.concat(this.find(FIND_STRUCTURES,
                {   filter:(s) => 
                    {
                        return !s.my && 
                        s.structureType != STRUCTURE_CONTROLLER && 
                        s.structureType != STRUCTURE_ROAD && 
                        s.structureType != STRUCTURE_CONTAINER &&
                        s.hits > 0
                    }
                }));
        }
    }
    return this._hostiles;
}

Room.prototype.PopulateShorthands=function()
{
    this.findAllStructures();
    let ShorthandFirstOfType=function(type,room,alias) { if(room._structures[type] && room._structures[type].length > 0) {room[alias] = room._structures[type][0]} }
    let ShorthandType=function(type,room,alias) { room[alias] = room._structures[type] }

    ShorthandFirstOfType(STRUCTURE_FACTORY,this,"factory");
    ShorthandFirstOfType(STRUCTURE_NUKER,this,"nuker");
    ShorthandFirstOfType(STRUCTURE_OBSERVER,this,"observer");
    ShorthandFirstOfType(STRUCTURE_EXTRACTOR,this,"extractor");
    ShorthandFirstOfType(STRUCTURE_INVADER_CORE,this,"invaderCore");
    ShorthandFirstOfType(STRUCTURE_POWER_BANK,this,"powerBank");
    ShorthandFirstOfType(STRUCTURE_POWER_SPAWN,this,"powerSpawn");
    if(!this.storage) { ShorthandFirstOfType(STRUCTURE_CONTAINER,this,"storage") }

    ShorthandType(STRUCTURE_CONTAINER,this,"containers");
    ShorthandType(STRUCTURE_ROAD,this,"roads");
    ShorthandType(STRUCTURE_TOWER,this,"towers");
    ShorthandType(STRUCTURE_SPAWN,this,"spawns");
}

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

RoomVisual.prototype.blocked = function(list,options)
{
    for(var key in list)
    {
        var pos = list[key]
        this.rect(pos.x-0.5,pos.y-0.5,1,1,options)
    }
}

RoomVisual.prototype.body=function(x,y,body,opt = {})
{
    _.defaults(opt,{scale:1,loopafter:-1,rectopts:{},edge:0.1})
    var dx = 0;
    var dy = 0;
    var w = 1
    var dist = 0.4*opt.scale;
    if (opt.loopafter > 0) {
        this.rect(x-dist/2-opt.edge,y-dist/2-opt.edge,dist*opt.loopafter + dist/2+opt.edge,dist*50/opt.loopafter + dist/2+opt.edge,opt.rectopts);
    }
    for(var part in body)
    {
        this.symbol(this,x+dx,y+dy,body[part])
        dx += dist
        if(w == opt.loopafter)
        {
            w = 0
            dx = 0
            dy += dist
        }
        w += 1
    }
    return this
}

RoomVisual.prototype.recipe=function(x,y,type,opt = {},angleRange = [0,6.28])
{
    _.defaults(opt,{scale:1,alpha:1,radius:1.6,fanning:1.4,scalePerLevel:1})
    let origScale = opt.scale;
    this.symbol(x,y,type,opt);
    opt.scale *= opt.scalePerLevel
    if(RESOURCES_BASIC.includes(type)) { return; }
    let ingredients = {};
    let amount = 1;
    //this.line(x,y,x+Math.cos(angleRange[0])*opt.radius*0.2,y+Math.sin(angleRange[0])*opt.radius*0.2,{color:"#00FF00"})
    //this.line(x,y,x+Math.cos(angleRange[1])*opt.radius*0.2,y+Math.sin(angleRange[1])*opt.radius*0.2,{color:"#FF0000"})
    if(COMMODITIES[type] && type != RESOURCE_GHODIUM)
    {
        amount = COMMODITIES[type].amount
        for(let r in COMMODITIES[type].components)
        {
            ingredients[r] = COMMODITIES[type].components[r];
        }
    }
    else if(REVERSED_REACTIONS[type])
    {
        ingredients[REVERSED_REACTIONS[type][0]] = 1;
        ingredients[REVERSED_REACTIONS[type][1]] = 1;
    }
    let slots = [];
    let count = Object.keys(ingredients).length;
    for(let i = 0;i < count; i++)
    {
        let angle = (i+0.5)/count * (angleRange[1] - angleRange[0]) + angleRange[0];
        slots.push({angle:angle})
    }
    for(let i = 0;i < count;i++)
    {
        let localradius = ingredients[Object.keys(ingredients)[i]] > 1 ? 2 : 1
        slots[i].pos=[x+Math.cos(slots[i].angle)*opt.radius*localradius,y+Math.sin(slots[i].angle)*opt.radius*localradius]
        let min = angleRange[0];
        let max = angleRange[1];
        if(i != 0)
        {
            min = (slots[i].angle + slots[i-1].angle)/2
        }
        if(i != count-1)
        {
            max = (slots[i].angle + slots[i+1].angle)/2
        }
        
        let middle = (min + max)/2;
        min = (min-middle)*opt.fanning+middle
        max = (max-middle)*opt.fanning+middle

        slots[i].angleRange = [min,max];
    }

    let current = 0;
    for(let r in ingredients)
    {
        this.recipe(slots[current].pos[0],slots[current].pos[1],r,opt,slots[current].angleRange);
        let start = [x,y]
        let end = [slots[current].pos[0],slots[current].pos[1]]
        let delta = [end[0] - start[0],end[1]-start[1]]

        let localradius = ingredients[r] > 1 ? 2 : 1
        let length = opt.radius * localradius;
        let normalized = [delta[0]/length,delta[1]/length]

        let innerRadius = 0.6;
        let arrowStart = [start[0] + normalized[0]*innerRadius*opt.scale,start[1] + normalized[1]*innerRadius*opt.scale]
        let arrowEnd = [end[0] - normalized[0]*innerRadius*opt.scale,end[1] - normalized[1]*innerRadius*opt.scale]
        this.line(arrowStart[0],arrowStart[1],arrowEnd[0],arrowEnd[1],{opacity:opt.alpha})
        if(ingredients[r] > 1)
        {
            let textPos = [(end[0]+start[0])/2,(end[1]+start[1])/2]
            let label = "x" + ingredients[r]

            let w = (label.length * 0.2+0.2)*opt.scale;
            let h = 0.5*opt.scale;
            this.rect(textPos[0]-w/2,textPos[1]-h/2+0.05*opt.scale,w,h,{fill:"#454545",opacity:0.9*opt.alpha});
            this.text(label,textPos[0],textPos[1]+0.2*opt.scale,{font:0.4*opt.scale})
        }

        current++;
    }
    if(amount > 1)
    {
        let textPos = [x,y+0.6*opt.scale]
        let label = "x" + amount

        let w = (label.length * 0.2+0.2)*opt.scale;
        let h = 0.5*opt.scale;
        this.rect(textPos[0]-w/2,textPos[1]-h/2+0.05*opt.scale,w,h,{fill:"#454545",opacity:0.9*opt.alpha});
        this.text(label,textPos[0],textPos[1]+0.2*opt.scale,{font:0.4*opt.scale})
    }
    opt.scale = origScale;
}

RoomVisual.prototype.graph=function(x,y,width,height,data,opt = {})
{
    _.defaults(opt,{cliptops:false,top:false,bottom:false,left:false,right:false});
    let path = []
    if (!data instanceof Array) 
    {
        console.log("RoomVisual.graph() takes an array as a forth argument");
    }
    let barSpacing = width/(data.length-1)
    if (opt.cliptops) 
    {
        for (var i = 0; i < data.length; i++) 
        {
            path.push([x+width - i * barSpacing,y+height-height*Math.min(1,data[i])]);
        }
    }
    else
    {
        for (var i = 0; i < data.length; i++) 
        {
            path.push([x+width - i* barSpacing,y+height-height*data[i]]);
        }
    }
    this.poly(path,opt)
    if (opt.top) 
    {
        this.line(x,y,x+width,y,opt.top);
    }
    if (opt.bottom) 
    {
        this.line(x,y+height,x+width,y+height,opt.bottom);
    }
    if (opt.left) 
    {
        if (opt.right.type == "edge") 
        {
            this.line(_.last(path)[0],_.last(path)[1],x,y+height,opt.left);
        }
        else
        {
            this.line(x,y,x,y+height,opt.left);
        }
    }
    if (opt.right) 
    {
        if (opt.right.type == "edge") 
        {
            this.line(path[0][0],path[0][1],x+width,y+height,opt.right);
        }
        else
        {
            this.line(x+width,y,x+width,y+height,opt.right);
        }
    }
}

RoomVisual.prototype.stock=function(x,y,obj,opt = {})
{
    _.defaults(opt,{scale:1,nox:false,offsetx:0.25,buffer:0,name:obj.structureType,noName:false})
    if(opt.noName)
    {
        delete opt.name;
    }
    let inv = obj.store;
    if(inv)
    {
        let has = {}
        
        RESOURCES_ALL.forEach((r) =>
        {
            let amount = inv.getUsedCapacity(r);
            if (amount > 0) 
            {
                has[r] = amount
            }
        })
        
        if(opt.name)
        {
            this.text(opt.name,x-0.3*opt.scale,y + 0.15*opt.scale,{font:0.7*opt.scale,align:"left"})
        }
        this.text(inv.getUsedCapacity() + "/" + inv.getCapacity(),x-0.3*opt.scale,y + (opt.name ? 1.15 : 0.15)*opt.scale,{font:0.7*opt.scale,align:"left"})
        this.rect(x-0.45,y-0.45,(6+opt.offsetx+opt.buffer)*opt.scale,Math.ceil((Object.keys(has).length+(opt.name ? 2 : 1))*opt.scale + 0.1),{fill:"#C4C4C4",stroke:"#000000"})
        y = y+opt.scale * (opt.name ? 2 : 1)
        for(let type in has)
        {
            this.symbol(x+(opt.offsetx*opt.scale),y,type,opt)
            this.text((!opt.nox ? " x" : "") + has[type],x+(0.9 + opt.offsetx)*opt.scale,y + 0.15*opt.scale,{font:0.7*opt.scale,align:"left"})
            y = y+opt.scale
        }
    }
    else
    {
        this.rect(x-0.45,y-0.45,3.6,1,{fill:"#C4C4C4",stroke:"#000000"})
        this.text("No Inventory",x-0.3*opt.scale,y + 0.15*opt.scale,{font:0.7*opt.scale,align:"left"})
    }
    return this
}

RoomVisual.prototype.plan=function(_x,_y,plan,opt = {})
{
    _.defaults(opt,{scale:1,alpha:0.5})
    if(_x && _y && plan)
    {
        for(var y=0;y<plan.length;y++)
        {
            for(var x=0;x<plan[y].length;x++)
            {
                if(plan[y][x])
                {
                    this.symbol(_x+x*opt.scale,_y+y*opt.scale,plan[y][x],opt)
                }
            }
        }
    }
    else
    {
        console.log("Missing arguments in plan")
        console.log("x:" + _x)
        console.log("y:" + _y)
        console.log("plan:" + plan)
    }
    return this
}


RoomVisual.prototype.layout=function(buildings,opt = {})
{
    _.defaults(opt,{scale:1,alpha:0.5});
    for(let b of buildings)
    {
        let isThere = false;
        for(let s of b.pos.lookFor(LOOK_STRUCTURES))
        {
            if(s.structureType == b.structure)
            {
                isThere = true;
                break;
            }
        } 
        if(!isThere)
        {
            this.symbol(b.pos.x,b.pos.y, b.structure ,opt);
        }
    }
}

RoomVisual.prototype.DrawMatrix=function(matrix)
{
    for(let y = 0;y < 50; y++)
    {
        for(let x = 0;x < 50; x++)
        {
            this.rect(x-0.5,y-0.5,1,1,{fill:"#" + lerpColor(0x00FF00, 0xff0000, (matrix.get(x,y)/255).clamp(0,1))})
        }
    }
    return this
}


RoomVisual.prototype.fluid=function(x,y,type,opt = {})
{
    _.defaults(opt,{scale:1,alpha:1})
    this.circle(x,y,{radius:0.15*opt.scale,fill:ResourceColors[type][0],opacity:opt.alpha})
}

RoomVisual.prototype.mineral=function(x,y,type,opt = {})
{
    _.defaults(opt,{scale:1,alpha:1})
    this.circle(x,y,{radius:0.35*opt.scale,fill:ResourceColors[type][1],stroke:ResourceColors[type][0],opacity:opt.alpha,strokeWidth:0.06*opt.scale})
    this.text(type,x,y+0.15*opt.scale,{color:ResourceColors[type][0],font:"bold "+(0.45*opt.scale)+" arial",opacity:opt.alpha})
}

RoomVisual.prototype.compound=function(x,y,type,opt = {})
{
    _.defaults(opt,{scale:1,alpha:1})
    let w = (0.26 + type.length * 0.26) * opt.scale
    let h = 0.7*opt.scale
    this.rect(x-w/2,y-h/2,w,h,{fill:ResourceColors[type][0],opacity:opt.alpha})
    this.text(type.replace("2", '₂'),x,y+0.17*opt.scale,{color:ResourceColors[type][1],font:"bold "+(0.45*opt.scale)+" arial",opacity:opt.alpha})
}

RoomVisual.prototype.unique=function(x,y,type,opt={})
{
    _.defaults(opt,{scale:1,alpha:1})
    if(RESOURCE_UNIQUE_ICONS[type])
    {
        this.DrawSvg(x,y,RESOURCE_UNIQUE_ICONS[type],opt);
    }
    else
    {
        this.text("?",x,y-0.3,{font:0.5});
        this.text(type,x,y+0.5,{font:0.3});
    }
}

RoomVisual.prototype.bar=function(x,y,type,opt = {})
{
    _.defaults(opt,{scale:1,alpha:1})
    const letter = 
    {
        [RESOURCE_OXIDANT]:         'O',
        [RESOURCE_REDUCTANT]:       'H',
        [RESOURCE_ZYNTHIUM_BAR]:    'Z',
        [RESOURCE_LEMERGIUM_BAR]:   'L',
        [RESOURCE_UTRIUM_BAR]:      'U',
        [RESOURCE_KEANIUM_BAR]:     'K',
        [RESOURCE_PURIFIER]:        'X',
        [RESOURCE_GHODIUM_MELT]:    'G',
    }
    let outer = 
    [
        [-0.45,-0.25],
        [-0.45,-0.35],
        [-0.4,-0.4],
        [-0.25,-0.4],
        [-0.2,-0.35],
        [-0.2,-0.25],

        [0.2,-0.25],
        [0.2,-0.35],
        [0.25,-0.4],
        [0.4,-0.4],
        [0.45,-0.35],
        [0.45,-0.25],

        [0.45,0.25],
        [0.45,0.35],
        [0.4,0.4],
        [0.25,0.4],
        [0.2,0.35],
        [0.2,0.25],
        
        [-0.2,0.25],
        [-0.2,0.35],
        [-0.25,0.4],
        [-0.4,0.4],
        [-0.45,0.35],
        [-0.45,0.25]
    ];

    let inner = 
    [
        [-0.45,-0.25],

        [-0.2,-0.25],
        [-0.2,-0.35],
        [-0.15,-0.4],
        [0.15,-0.4],
        [0.2,-0.35],
        [0.2,-0.25],
        
        [0.45,-0.25],

        [0.45,0.25],

        [0.2,0.25],
        [0.2,0.35],
        [0.15,0.4],
        [-0.15,0.4],
        [-0.2,0.35],
        [-0.2,0.25],

        [-0.45,0.25]
    ];

    this.poly(outer.map(p => [ p[0]*opt.scale + x, p[1]*opt.scale + y ]), {
        fill: ResourceColors[type][1],
        stroke: "#00000000",
        strokeWidth: 0,
        opacity: opt.alpha
    });
    
    this.poly(inner.map(p => [ p[0]*opt.scale + x, p[1]*opt.scale + y ]), {
        fill: ResourceColors[type][0],
        stroke: "#00000000",
        strokeWidth: 0,
        opacity: opt.alpha
    });

    this.text(letter[type],x,y+0.17*opt.scale,{color:ResourceColors[type][1],font:"bold "+(0.45*opt.scale)+" arial",opacity:opt.alpha})
}

function calculateFactoryLevelGapsPoly() {
    let x = -0.08;
    let y = -0.52;
    let result = [];
  
    let gapAngle = 16 * (Math.PI / 180);
    let c1 = Math.cos(gapAngle);
    let s1 = Math.sin(gapAngle);
  
    let angle = 72 * (Math.PI / 180);
    let c2 = Math.cos(angle);
    let s2 = Math.sin(angle);
  
    for (let i = 0; i < 5; ++i) {
      result.push([0.0, 0.0]);
      result.push([x, y]);
      result.push([x * c1 - y * s1, x * s1 + y * c1]);
      let tmpX = x * c2 - y * s2;
      y = x * s2 + y * c2;
      x = tmpX;
    }
    return result;
}
const factoryLevelGaps = calculateFactoryLevelGapsPoly();

RoomVisual.prototype.symbol=function(x,y,symbol,opt = {})
{
    _.defaults(opt,{scale:1,alpha:1})
    switch(symbol)
    {
        case RESOURCE_ENERGY:
        case RESOURCE_POWER:
            this.fluid(x,y,symbol,opt);
            break
        case RESOURCE_HYDROGEN:
        case RESOURCE_OXYGEN:
        case RESOURCE_UTRIUM:
        case RESOURCE_LEMERGIUM:
        case RESOURCE_KEANIUM:
        case RESOURCE_CATALYST:
        case RESOURCE_ZYNTHIUM:
            this.mineral(x,y,symbol,opt)
            break
        case RESOURCE_GHODIUM:
        case RESOURCE_HYDROXIDE:
        case RESOURCE_ZYNTHIUM_KEANITE:
        case RESOURCE_UTRIUM_LEMERGITE:
        case RESOURCE_UTRIUM_HYDRIDE:
        case RESOURCE_UTRIUM_OXIDE:
        case RESOURCE_KEANIUM_HYDRIDE:
        case RESOURCE_KEANIUM_OXIDE:
        case RESOURCE_LEMERGIUM_HYDRIDE:
        case RESOURCE_LEMERGIUM_OXIDE:
        case RESOURCE_ZYNTHIUM_HYDRIDE:
        case RESOURCE_ZYNTHIUM_OXIDE:
        case RESOURCE_GHODIUM_HYDRIDE:
        case RESOURCE_GHODIUM_OXIDE:
        case RESOURCE_UTRIUM_ACID:
        case RESOURCE_UTRIUM_ALKALIDE:
        case RESOURCE_KEANIUM_ACID:
        case RESOURCE_KEANIUM_ALKALIDE:
        case RESOURCE_LEMERGIUM_ACID:
        case RESOURCE_LEMERGIUM_ALKALIDE:
        case RESOURCE_ZYNTHIUM_ACID:
        case RESOURCE_ZYNTHIUM_ALKALIDE:
        case RESOURCE_GHODIUM_ACID:
        case RESOURCE_GHODIUM_ALKALIDE:
        case RESOURCE_CATALYZED_UTRIUM_ACID:
        case RESOURCE_CATALYZED_UTRIUM_ALKALIDE:
        case RESOURCE_CATALYZED_KEANIUM_ACID:
        case RESOURCE_CATALYZED_KEANIUM_ALKALIDE:
        case RESOURCE_CATALYZED_LEMERGIUM_ACID:
        case RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE:
        case RESOURCE_CATALYZED_ZYNTHIUM_ACID:
        case RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE:
        case RESOURCE_CATALYZED_GHODIUM_ACID:
        case RESOURCE_CATALYZED_GHODIUM_ALKALIDE:
            this.compound(x,y,symbol,opt);
            break
        case RESOURCE_UTRIUM_BAR:
        case RESOURCE_LEMERGIUM_BAR:
        case RESOURCE_ZYNTHIUM_BAR:
        case RESOURCE_KEANIUM_BAR:
        case RESOURCE_GHODIUM_MELT:
        case RESOURCE_OXIDANT:
        case RESOURCE_REDUCTANT:
        case RESOURCE_PURIFIER:
            this.bar(x,y,symbol,opt);
            break;
        case RESOURCE_SILICON:
        case RESOURCE_ALLOY:
        case RESOURCE_TUBE:
        case RESOURCE_FIXTURES:
        case RESOURCE_FRAME:
        case RESOURCE_HYDRAULICS:
        case RESOURCE_MACHINE:
            
        case RESOURCE_METAL:
        case RESOURCE_WIRE:
        case RESOURCE_SWITCH:
        case RESOURCE_TRANSISTOR:
        case RESOURCE_MICROCHIP:
        case RESOURCE_CIRCUIT:
        case RESOURCE_DEVICE:

        case RESOURCE_BIOMASS:
        case RESOURCE_CELL:
        case RESOURCE_PHLEGM:
        case RESOURCE_TISSUE:
        case RESOURCE_MUSCLE:
        case RESOURCE_ORGANOID:
        case RESOURCE_ORGANISM:
            
        case RESOURCE_MIST:
        case RESOURCE_CONDENSATE:
        case RESOURCE_CONCENTRATE:
        case RESOURCE_EXTRACT:
        case RESOURCE_SPIRIT:
        case RESOURCE_EMANATION:
        case RESOURCE_ESSENCE:

        case RESOURCE_OPS:
        case RESOURCE_BATTERY:
        case RESOURCE_COMPOSITE:
        case RESOURCE_CRYSTAL:
        case RESOURCE_LIQUID:

            this.unique(x,y,symbol,opt);
            break;


        //Structures ═══════════════════════════════════════════════════════════════════════════════════════════════════
        case STRUCTURE_FACTORY: 
        {
            const outline = [
              [-0.68, -0.11],
              [-0.84, -0.18],
              [-0.84, -0.32],
              [-0.44, -0.44],
              [-0.32, -0.84],
              [-0.18, -0.84],
              [-0.11, -0.68],
              
              [0.11, -0.68],
              [0.18, -0.84],
              [0.32, -0.84],
              [0.44, -0.44],
              [0.84, -0.32],
              [0.84, -0.18],
              [0.68, -0.11],
              
              [0.68, 0.11],
              [0.84, 0.18],
              [0.84, 0.32],
              [0.44, 0.44],
              [0.32, 0.84],
              [0.18, 0.84],
              [0.11, 0.68],
              
              [-0.11, 0.68],
              [-0.18, 0.84],
              [-0.32, 0.84],
              [-0.44, 0.44],
              [-0.84, 0.32],
              [-0.84, 0.18],
              [-0.68, 0.11]
            ];
            this.poly(outline.map(p => [ p[0]*opt.scale + x, p[1]*opt.scale + y ]), {
              fill: null,
              stroke: colors.outline,
              strokeWidth: 0.05*opt.scale,
              opacity: opt.alpha
            });
            // outer circle
            this.circle(x, y, {
              radius: 0.65*opt.scale,
              fill: '#232323',
              strokeWidth: 0.035*opt.scale,
              stroke: '#140a0a',
              opacity: opt.alpha
            });
            const spikes = [
              [-0.4, -0.1],
              [-0.8, -0.2],
              [-0.8, -0.3],
              [-0.4, -0.4],
              [-0.3, -0.8],
              [-0.2, -0.8],
              [-0.1, -0.4],
      
              [0.1, -0.4],
              [0.2, -0.8],
              [0.3, -0.8],
              [0.4, -0.4],
              [0.8, -0.3],
              [0.8, -0.2],
              [0.4, -0.1],
      
              [0.4, 0.1],
              [0.8, 0.2],
              [0.8, 0.3],
              [0.4, 0.4],
              [0.3, 0.8],
              [0.2, 0.8],
              [0.1, 0.4],
      
              [-0.1, 0.4],
              [-0.2, 0.8],
              [-0.3, 0.8],
              [-0.4, 0.4],
              [-0.8, 0.3],
              [-0.8, 0.2],
              [-0.4, 0.1]
            ];
            this.poly(spikes.map(p => [ p[0]*opt.scale + x, p[1]*opt.scale + y ]), {
              fill: colors.gray,
              stroke: '#140a0a',
              strokeWidth: 0.04*opt.scale,
              opacity: opt.alpha
            });
            // factory level circle
            this.circle(x, y, {
              radius: 0.54*opt.scale,
              fill: '#302a2a',
              strokeWidth: 0.04*opt.scale,
              stroke: '#140a0a',
              opacity: opt.alpha
            });
            this.poly(factoryLevelGaps.map(p => [ p[0]*opt.scale + x, p[1]*opt.scale + y ]), {
              fill: '#140a0a',
              stroke: null,
              opacity: opt.alpha
            });
            // inner black circle
            this.circle(x, y, {
              radius: 0.42*opt.scale,
              fill: '#140a0a',
              opacity: opt.alpha
            });
            this.rect(x - 0.24*opt.scale, y - 0.24*opt.scale, 0.48*opt.scale, 0.48*opt.scale, {
              fill: '#3f3f3f',
              opacity: opt.alpha
            });
            break;
        }
        case STRUCTURE_EXTENSION:
			this.circle(x, y, {
				radius     : 0.5*opt.scale,
				fill       : "#0d120e",
				stroke     : "#789d7b",
				strokeWidth: 0.05*opt.scale,
				opacity    : opt.alpha
			});
			this.circle(x, y, {
				radius : 0.35*opt.scale,
				fill   : "#747474",
				opacity: opt.alpha
			});
			break;
		case STRUCTURE_SPAWN:
			this.circle(x, y, {
				radius     : 0.65*opt.scale,
				fill       : "#0d120e",
				stroke     : '#CCCCCC',
				strokeWidth: 0.10*opt.scale,
				opacity    : opt.alpha
			});
			this.circle(x, y, {
				radius : 0.40*opt.scale,
				fill   : "#dec75f",
				opacity: opt.alpha
			});

			break;
		case STRUCTURE_POWER_SPAWN:
			this.circle(x, y, {
				radius     : 0.65*opt.scale,
				fill       : "#0d120e",
				stroke     : "#ff1930",
				strokeWidth: 0.10,
				opacity    : opt.alpha
			});
			this.circle(x, y, {
				radius : 0.40*opt.scale,
				fill   : "#dec75f",
				opacity: opt.alpha
			});
			break;
		case STRUCTURE_LINK: {
			// let osize = 0.3;
			// let isize = 0.2;
			let outer = [
				[0.0, -0.5*opt.scale],
				[0.4*opt.scale, 0.0],
				[0.0, 0.5*opt.scale],
				[-0.4*opt.scale, 0.0]
			];
			let inner = [
				[0.0, -0.3*opt.scale],
				[0.25*opt.scale, 0.0],
				[0.0, 0.3*opt.scale],
				[-0.25*opt.scale, 0.0]
			];
			outer = relativePoly(x, y, outer);
			inner = relativePoly(x, y, inner);
			outer.push(outer[0]);
			inner.push(inner[0]);
			this.poly(outer, {
				fill       : "#0d120e",
				stroke     : "#789d7b",
				strokeWidth: 0.05*opt.scale,
				opacity    : opt.alpha
			});
			this.poly(inner, {
				fill   : "#747474",
				stroke : false,
				opacity: opt.alpha
			});
			break;
		}
		case STRUCTURE_TERMINAL: {
			let outer = [
				[0.0, -0.8*opt.scale],
				[0.55*opt.scale, -0.55*opt.scale],
				[0.8*opt.scale, 0.0],
				[0.55*opt.scale, 0.55*opt.scale],
				[0.0, 0.8*opt.scale],
				[-0.55*opt.scale, 0.55*opt.scale],
				[-0.8*opt.scale, 0.0],
				[-0.55*opt.scale, -0.55*opt.scale],
			];
			let inner = [
				[0.0, -0.65*opt.scale],
				[0.45*opt.scale, -0.45*opt.scale],
				[0.65*opt.scale, 0.0],
				[0.45*opt.scale, 0.45*opt.scale],
				[0.0, 0.65*opt.scale],
				[-0.45*opt.scale, 0.45*opt.scale],
				[-0.65*opt.scale, 0.0],
				[-0.45*opt.scale, -0.45*opt.scale],
			];
			outer = relativePoly(x, y, outer);
			inner = relativePoly(x, y, inner);
			outer.push(outer[0]);
			inner.push(inner[0]);
			this.poly(outer, {
				fill       : "#0d120e",
				stroke     : "#789d7b",
				strokeWidth: 0.05*opt.scale,
				opacity    : opt.alpha
			});
			this.poly(inner, {
				fill   : "#444444",
				stroke : false,
				opacity: opt.alpha
			});
			this.rect(x - 0.45*opt.scale, y - 0.45*opt.scale, 0.9*opt.scale, 0.9*opt.scale, {
				fill       : "#747474",
				stroke     : "#0d120e",
				strokeWidth: 0.1*opt.scale,
				opacity    : opt.alpha
			});
			break;
		}
		case STRUCTURE_LAB:
			this.circle(x, y - 0.025*opt.scale, {
				radius     : 0.55*opt.scale,
				fill       : "#0d120e",
				stroke     : "#789d7b",
				strokeWidth: 0.05*opt.scale,
				opacity    : opt.alpha
			});
			this.circle(x, y - 0.025*opt.scale, {
				radius : 0.40*opt.scale,
				fill   : "#747474",
				opacity: opt.alpha
			});
			this.rect(x - 0.45*opt.scale, y + 0.3*opt.scale, 0.9*opt.scale, 0.25*opt.scale, {
				fill   : "#0d120e",
				stroke : false,
				opacity: opt.alpha
			});
		{
			let box = [
				[-0.45*opt.scale, 0.3*opt.scale],
				[-0.45*opt.scale, 0.55*opt.scale],
				[0.45*opt.scale, 0.55*opt.scale],
				[0.45*opt.scale, 0.3*opt.scale],
			];
			box = relativePoly(x, y, box);
			this.poly(box, {
				stroke     : "#789d7b",
				strokeWidth: 0.05*opt.scale,
				opacity    : opt.alpha
			});
		}
			break;
		case STRUCTURE_TOWER:
			this.circle(x, y, {
				radius     : 0.6*opt.scale,
				fill       : "#0d120e",
				stroke     : "#789d7b",
				strokeWidth: 0.05*opt.scale,
				opacity    : opt.alpha
			});
			this.rect(x - 0.4*opt.scale, y - 0.3*opt.scale, 0.8*opt.scale, 0.6*opt.scale, {
				fill   : "#747474",
				opacity: opt.alpha
			});
			this.rect(x - 0.2*opt.scale, y - 0.9*opt.scale, 0.4*opt.scale, 0.5*opt.scale, {
				fill       : "#444444",
				stroke     : "#0d120e",
				strokeWidth: 0.07*opt.scale,
				opacity    : opt.alpha
			});
			break;
		case STRUCTURE_ROAD:
			this.circle(x, y, {
				radius : 0.175*opt.scale,
				fill   : "#7d7d7d",
				stroke : false,
				opacity: opt.alpha
			});
			if (!this.roads) this.roads = [];
			this.roads.push([x, y]);
			break;
		case STRUCTURE_RAMPART:
			this.circle(x, y, {
				radius     : 0.65*opt.scale,
				fill       : '#434C43',
				stroke     : '#5D735F',
				strokeWidth: 0.10,
				opacity    : opt.alpha
			});
			break;
		case STRUCTURE_WALL:
			this.circle(x, y, {
				radius     : 0.40*opt.scale,
				fill       : "#0d120e",
				stroke     : "#444444",
				strokeWidth: 0.05*opt.scale,
				opacity    : opt.alpha
			});
			break;
		case STRUCTURE_STORAGE:
			let storageOutline = relativePoly(x, y, [
				[-0.45*opt.scale, -0.55*opt.scale],
				[0, -0.65*opt.scale],
				[0.45*opt.scale, -0.55*opt.scale],
				[0.55*opt.scale, 0],
				[0.45*opt.scale, 0.55*opt.scale],
				[0, 0.65*opt.scale],
				[-0.45*opt.scale, 0.55*opt.scale],
				[-0.55*opt.scale, 0],
				[-0.45*opt.scale, -0.55*opt.scale],
			]);
			this.poly(storageOutline, {
				stroke     : "#789d7b",
				strokeWidth: 0.05*opt.scale,
				fill       : "#0d120e",
				opacity    : opt.alpha
			});
			this.rect(x - 0.35*opt.scale, y - 0.45*opt.scale, 0.7*opt.scale, 0.9*opt.scale, {
				fill   : "#dec75f",
				opacity: opt.alpha,
			});
			break;
		case STRUCTURE_OBSERVER:
			this.circle(x, y, {
				fill       : "#0d120e",
				radius     : 0.45*opt.scale,
				stroke     : "#789d7b",
				strokeWidth: 0.05*opt.scale,
				opacity    : opt.alpha
			});
			this.circle(x + 0.225*opt.scale, y, {
				fill   : "#789d7b",
				radius : 0.20*opt.scale,
				opacity: opt.alpha
			});
			break;
		case STRUCTURE_NUKER:
			let outline = [
				[0, -1*opt.scale],
				[-0.47*opt.scale, 0.2*opt.scale],
				[-0.5*opt.scale, 0.5*opt.scale],
				[0.5*opt.scale, 0.5*opt.scale],
				[0.47*opt.scale, 0.2*opt.scale],
				[0, -1*opt.scale],
			];
			outline = relativePoly(x, y, outline);
			this.poly(outline, {
				stroke     : "#789d7b",
				strokeWidth: 0.05*opt.scale,
				fill       : "#0d120e",
				opacity    : opt.alpha
			});
			let inline = [
    				[0, -.80*opt.scale],
    				[-0.40*opt.scale, 0.2*opt.scale],
    				[0.40*opt.scale, 0.2*opt.scale],
    				[0, -.80*opt.scale],
    			];
    			inline = relativePoly(x, y, inline);
    			this.poly(inline, {
    				stroke     : "#789d7b",
    				strokeWidth: 0.01,
    				fill       : "#747474",
    				opacity    : opt.alpha
    			});
    			break;
    		case STRUCTURE_CONTAINER:
    			this.rect(x - 0.225*opt.scale, y - 0.3*opt.scale, 0.45*opt.scale, 0.6*opt.scale, {
    				fill       : "#F6DD69",
    				opacity    : opt.alpha,
    				stroke     : "#0d120e",
    				strokeWidth: 0.10*opt.scale,
    			});
    			break;
			//BodyParts ═══════════════════════════════════════════════════════════════════════════════════════════════════
			case MOVE:
			case WORK:
			case CARRY:
			case ATTACK:
			case RANGED_ATTACK:
			case TOUGH:
			case HEAL:
			case CLAIM:
			    var c = "#FFFFFF"
			    switch(symbol)
			    {
			        case MOVE:
			            c = "#a9b7c6";
			            break;
        			case WORK:
			            c = "#ffe56d";
			            break;
        			case CARRY:
			            c = "#777777 ";
			            break;
        			case ATTACK:
			            c = "#f93739";
			            break;
        			case RANGED_ATTACK:
			            c = "#5d8096"; 
			            break;
        			case TOUGH:
			            c = "#fff2ca";
			            break;
        			case HEAL:
			            c = "#65f04a";
			            break;
        			case CLAIM:
			            c = "#b99cee";
			            break;
			    }
			    this.circle(x,y,{radius:0.15*opt.scale,fill:c})
			    break;
			
                
            default:
                this.text(symbol,x,y+0.2*opt.scale)
                break
        }
        
        return this
    }
    
const dirs = [
[],
[0, -1],
[1, -1],
[1, 0],
[1, 1],
[0, 1],
[-1, 1],
[-1, 0],
[-1, -1]
];
RoomVisual.prototype.connectRoads = function (opts = {}) {
	_.defaults(opts, {opacity: 0.5});
	let color = opts.color || "#7d7d7d";
	if (!this.roads) return this;
	// this.text(this.roads.map(r=>r.join(',')).join(' '),25,23)
	this.roads.forEach((r) => {
		// this.text(`${r[0]},${r[1]}`,r[0],r[1],{ size: 0.2 })
		for (let i = 1; i <= 4; i++) {
			let d = dirs[i];
			let c = [r[0] + d[0], r[1] + d[1]];
			let rd = _.some(this.roads, r => r[0] == c[0] && r[1] == c[1]);
			// this.text(`${c[0]},${c[1]}`,c[0],c[1],{ size: 0.2, color: rd?'green':'red' })
			if (rd) {
				this.line(r[0], r[1], c[0], c[1], {
					color  : color,
					width  : 0.35,
					opacity: opts.opacity
				});
			}
		}
	});

	return this;
};

RoomVisual.prototype.DrawMapSegment=function(pos)
{
    let flags = Game.flags
    
    let segment = pos.segx + "," + pos.segy;
    if (Memory.map && Memory.map[segment] && Memory.map[segment].lastseen) 
    {
        let lastseen = Memory.map[segment].lastseen;
        let owner = false;
        if (Memory.map[segment] && (!flags["owner"] || flags["owner"].color != COLOR_RED)) 
        {
            owner = Memory.map[segment].owner;
        }
        let floodfill = false
        if ((!flags["floodfill"] || flags["floodfill"].color != COLOR_RED)) 
        {
            floodfill = true;
        }
        let sources = false
        if (Memory.map[segment] && (!flags["sources"] || flags["sources"].color != COLOR_RED)) 
        {
            sources = Memory.map[segment].sources
        }
        let minerals = false
        if (Memory.map[segment] && (!flags["minerals"] || flags["minerals"].color != COLOR_RED)) 
        {
            minerals = Memory.map[segment].minerals
        }
        let density = false
        if (Memory.map[segment]) 
        {
            density = Memory.map[segment].mineralDensity
        }
        let nogo = false
        if (Memory.map[segment] && (!flags["nogo"] || flags["nogo"].color != COLOR_RED))
        {
            nogo = Memory.map[segment].nogo
        }
        for (var i = 0; i < 100; i++) 
        {
            let gx = pos.x + i%10;
            let gy = pos.y - Math.floor(i/10) + 10;
            
            this.rect(gx-0.45,gy-0.45,0.9,0.9,{opacity:lastseen[i]/30 + 0.05,fill:(owner ? OWNER_COLOR[owner[i]] : "#FFFFFF")})
            if ((!flags["walls"] || flags["walls"].color != COLOR_RED)) 
            {
                let exits = Game.map.describeExits(RoomNameFromPos([i%10 + pos.segx*10,Math.floor(i/10) + pos.segy*10]));
                if (!exits[TOP]) 
                {
                    this.line(gx-0.5,gy-0.5,gx+0.5,gy-0.5,{color:"#000000",opacity:1})
                    this.line(gx-0.5,gy-0.5,gx+0.5,gy-0.5,{color:"#FFFFFF",opacity:1,lineStyle:"dashed"})
                }
                if (!exits[LEFT]) 
                {
                    this.line(gx-0.5,gy-0.5,gx-0.5,gy+0.5,{color:"#000000",opacity:1})
                    this.line(gx-0.5,gy-0.5,gx-0.5,gy+0.5,{color:"#FFFFFF",opacity:1,lineStyle:"dashed"})
                }
            }
            if (floodfill) 
            {
                let rp = [pos.segx*10+i%10,pos.segy*10+Math.floor(i/10)];
                //logObject(rp)
                let center = GetMapData(RoomNameFromPos(rp),"floodfill")
                let left = GetMapData(RoomNameFromPos([rp[0]-1,rp[1]]),"floodfill");
                let up = GetMapData(RoomNameFromPos([rp[0],rp[1]-1]),"floodfill");
                if (center != left) 
                {
                    this.line(gx-0.5,gy-0.5,gx-0.5,gy+0.5,{color:"#FFFFFF",opacity:0.7,width:0.05});
                }
                if (center != up) 
                {
                    this.line(gx-0.5,gy+0.5,gx+0.5,gy+0.5,{color:"#FFFFFF",opacity:0.7,width:0.05})
                }
            }
            if (sources) 
            {
                if (sources[i] > 0) 
                {
                    this.symbol(gx-0.35,gy-0.35,RESOURCE_ENERGY,{scale:0.5});
                    this.text("x" + sources[i], gx-0.27,gy-0.27,{font:0.2,align:"left"})
                }
            }
            if(minerals)
            {
                if(minerals[i] != ' ')
                {
                    this.symbol(gx+0.3,gy-0.3,minerals[i],{scale:0.18 + (density ? 0.04*density[i] : 0.08)});
                }
            }
            
            if(nogo)
            {
                if(nogo[i] != ' ')
                {
                    this.line(gx-0.5,gy-0.5,gx+0.5,gy+0.5)
                    this.line(gx-0.5,gy+0.5,gx+0.5,gy-0.5)
                }
            }
        }
    }
    return this;
}

RoomVisual.prototype.Timer=function(x,y,current,max,opt)
{
    _.defaults(opt,{scale:1,alpha:1,color:"#c5c5c5"})
    this.circle(x,y,{radius:opt.scale,fill:"#00000000",stroke:opt.color,strokeWidth:0.1*opt.scale});
    let poly = [];
    poly.push([x,y])
    for(let i = 0;i < 6.28;i+=0.1)
    {
        poly.push([x+Math.sin(i) * opt.scale,y-Math.cos(i) * opt.scale]);
        if(i/6.28 > current/max)
        {
            break;
        }
    }
    poly.push([x,y])
    this.poly(poly,{fill:opt.color});
}

String.prototype.hashCode = function() {
    var hash = 0, i, chr;
    if (this.length === 0) return hash;
    for (i = 0; i < this.length; i++) {
      chr   = this.charCodeAt(i);
      hash  = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  };

