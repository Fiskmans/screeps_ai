Creep.prototype.do=function(action,target)
{
    if (typeof(target) === "string") 
    {
        target = Game.getObjectById(target);
    }
    return this[action](target);
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
        this.say("smarter H")
        let err = this.withdraw(this.room.storage,RESOURCE_ENERGY);
        if (err == ERR_NOT_IN_RANGE) {
            this.travelTo(this.room.storage);
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
    
    this.say("dumb H")
    var source = this.pos.findClosestByPath(FIND_SOURCES_ACTIVE)
    if(this.harvest(source) == ERR_NOT_IN_RANGE)
    {
        this.travelTo(source)
    }
}
Creep.prototype.dumbUpgrade=function()
{
    this.say("dumb U")
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
    this.say("dumb B")
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

Creep.prototype.dumbRefill=function()
{
    let target = false
    targets = _.sortBy( this.room.refillable(),(s) => { return this.pos.getRangeTo(s) + REFILLPRIORITY[s.structureType];});
    this.say(targets.length)
    if (targets.length > 0) 
    {
        target = targets[0];
    }
    if(target && (this.transfer(target,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE))
    {
        this.travelTo(target)
    }
}

Creep.prototype.dumbUpgradeLoop=function()
{
    if (this.memory.harvesting) {
        this.dumbHarvest()
    }
    else
    {
        this.dumbUpgrade()
    }
    this.updateHarvestState()
}
Creep.prototype.dumbRefillLoop=function()
{
    if (this.memory.harvesting) {
        this.dumbHarvest()
    }
    else
    {
        this.dumbRefill()
    }
    this.updateHarvestState()
}

Creep.prototype.dismantleLoop=function(target)
{
    if (this.memory.harvesting) 
    {
        this.dumbDismantle(target)
    }
    else
    {
        this.dumbRefill()
    }
    this.updateHarvestState()
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
    if (this.memory.harvesting) {
        this.dumbHarvest()
    }
    else
    {
        this.dumbBuild()
    }
    this.updateHarvestState()
}
Creep.prototype.updateHarvestState=function()
{
    if(this.carry.energy == this.carryCapacity)
    {
        this.memory.harvesting = false
    }
    if(this.carry.energy == 0)
    {
        this.memory.harvesting = true
    }
}

Room.prototype.refillable=function()
{
    let all = [];
    
    this.findAllStructures();
    all = _.filter(this._structures[STRUCTURE_TOWER].concat(this._structures[STRUCTURE_EXTENSION].concat(this._structures[STRUCTURE_SPAWN].concat(this._structures[STRUCTURE_LAB]))),
    (s) => 
    {
        return s.store[RESOURCE_ENERGY] < s.store.getCapacity(RESOURCE_ENERGY); 
    });
    all = all.concat(_.filter(this._structures[STRUCTURE_TERMINAL], (s) =>
    {
        return s.store[RESOURCE_ENERGY] < s.store.getCapacity() / 5;
    }));
    all = all.concat(_.filter(this._structures[STRUCTURE_STORAGE], (s) =>
    {
        return false;//s.store[RESOURCE_ENERGY] < s.store.getCapacity() /5*4;
    }));
    
    return all;
}

Room.prototype.spawns=function()
{
    this.findAllStructures();
    return this._structures[STRUCTURE_SPAWN];
}

Room.prototype.turrets=function()
{
    this.findAllStructures();
    return this._structures[STRUCTURE_TOWER];
}

Room.prototype.roads=function()
{
    this.findAllStructures();
    return this._structures[STRUCTURE_ROAD];
}

Room.prototype.containers=function()
{
    this.findAllStructures();
    return this._structures[STRUCTURE_CONTAINER];
}

Room.prototype.findAllStructures=function()
{
    if(!this._structures)
    {
        this._structures = {};
        Object.keys(CONSTRUCTION_COST).forEach((s) => this._structures[s] = [])
        this._structures[STRUCTURE_CONTROLLER] = []
        this._structures[STRUCTURE_INVADER_CORE] = []
        
        this.find(FIND_STRUCTURES).forEach((s) => {
                this._structures[s.structureType].push(s)
        })
    }
}

Room.prototype.hostiles=function()
{
    if(!this._hostiles)
    {
        this._hostiles = [];
        this._hostiles = _.filter(this.find(FIND_HOSTILE_CREEPS),(c) => {
            return true;
        })
        this._hostiles = this._hostiles.concat(this.find(FIND_HOSTILE_STRUCTURES))
    }
    return this._hostiles;
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
        this.line(x,y,x,y+height,opt.left);
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
    _.defaults(opt,{scale:1,nox:false,offsetx:0.25,buffer:0})
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
        
        this.text(inv.getUsedCapacity() + "/" + inv.getCapacity(),x-0.3*opt.scale,y + 0.15*opt.scale,{font:0.7*opt.scale,align:"left"})
        this.rect(x-0.45,y-0.45,(6+opt.offsetx+opt.buffer)*opt.scale,(Object.keys(has).length+1)*opt.scale + 0.1,{fill:"#C4C4C4",stroke:"#000000"})
        y = y+opt.scale
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

RoomVisual.prototype.plan=function(_x,_y,plan)
{
    if(_x && _y && plan)
    {
        for(var y=0;y<plan.length;y++)
        {
            for(var x=0;x<plan[y].length;x++)
            {
                if(plan[y][x])
                {
                    this.symbol(_x+x,_y+y,plan[y][x],{alpha:0.5})
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

RoomVisual.prototype.symbol=function(x,y,symbol,opt = {})
{
    _.defaults(opt,{scale:1,alpha:1})
    switch(symbol)
    {
        case RESOURCE_ENERGY:
            this.circle(x,y,{radius:0.15*opt.scale,fill:"#F6DD69",opacity:1,opacity:opt.alpha})
            break
        case RESOURCE_POWER:
            this.circle(x,y,{radius:0.15*opt.scale,fill:"#ff1930",opacity:1,opacity:opt.alpha})
            break
        case RESOURCE_HYDROGEN:
            this.circle(x,y,{radius:0.35*opt.scale,fill:"#4C4C4C",stroke:"#CDCDCD",opacity:opt.alpha,strokeWidth:0.06*opt.scale})
            this.text("H",x,y+0.15*opt.scale,{color:"#B4B4B4",font:0.5*opt.scale,opacity:opt.alpha})
            break
        case RESOURCE_OXYGEN:
            this.circle(x,y,{radius:0.35*opt.scale,fill:"#4C4C4C",stroke:"#CDCDCD",opacity:opt.alpha,strokeWidth:0.06*opt.scale})
            this.text("O",x,y+0.17*opt.scale,{color:"#B4B4B4",font:0.5*opt.scale,opacity:opt.alpha})
            break
        case RESOURCE_UTRIUM:
            this.circle(x,y,{radius:0.35*opt.scale,fill:"#006181",stroke:"#50d7f9",opacity:opt.alpha,strokeWidth:0.06*opt.scale})
            this.text("U",x,y+0.17*opt.scale,{color:"#50d7f9",font:0.5*opt.scale,opacity:opt.alpha})
            break
        case RESOURCE_LEMERGIUM:
            this.circle(x,y,{radius:0.35*opt.scale,fill:"#236144",stroke:"#00f4a2",opacity:opt.alpha,strokeWidth:0.06*opt.scale})
            this.text("L",x,y+0.17*opt.scale,{color:"#00f4a2",font:0.5*opt.scale,opacity:opt.alpha})
            break
        case RESOURCE_KEANIUM:
            this.circle(x,y,{radius:0.35*opt.scale,fill:"#371383",stroke:"#a071ff",opacity:opt.alpha,strokeWidth:0.06*opt.scale})
            this.text("K",x,y+0.17*opt.scale,{color:"#a071ff",font:0.5*opt.scale,opacity:opt.alpha})
            break
        case RESOURCE_CATALYST:
            this.circle(x,y,{radius:0.35*opt.scale,fill:"#592121",stroke:"#ff7b7b",opacity:opt.alpha,strokeWidth:0.06*opt.scale})
            this.text("X",x,y+0.17*opt.scale,{color:"#ff7b7b",font:0.5*opt.scale,opacity:opt.alpha})
            break
        case RESOURCE_ZYNTHIUM:
            this.circle(x,y,{radius:0.35*opt.scale,fill:"#5d4c2e",stroke:"#fdd388",opacity:opt.alpha,strokeWidth:0.06*opt.scale})
            this.text("Z",x,y+0.17*opt.scale,{color:"#fdd388",font:0.5*opt.scale,opacity:opt.alpha})
            break
        case RESOURCE_GHODIUM:
            w = 0.7*opt.scale
            h = 0.7*opt.scale
            this.rect(x-w/2,y-h/2,w,h,{fill:"#FFFFFF",opacity:opt.alpha})
            this.text("G",x,y+0.17*opt.scale,{color:"#666666",font:0.5*opt.scale,opacity:opt.alpha})
            break
        case RESOURCE_HYDROXIDE:
            w = 0.9625*opt.scale
            h = 0.7*opt.scale
            this.rect(x-w/2,y-h/2,w,h,{fill:"#b4b4b4",opacity:opt.alpha})
            this.text("OH",x,y+0.17*opt.scale,{color:"#666666",font:0.5*opt.scale,opacity:opt.alpha})
            break
        case RESOURCE_ZYNTHIUM_KEANITE:
            w = 0.9625*opt.scale
            h = 0.7*opt.scale
            this.rect(x-w/2,y-h/2,w,h,{fill:"#b4b4b4",opacity:opt.alpha})
            this.text("ZK",x,y+0.17*opt.scale,{color:"#666666",font:0.5*opt.scale,opacity:opt.alpha})
            break
        case RESOURCE_UTRIUM_LEMERGITE:
            w = 0.9625*opt.scale
            h = 0.7*opt.scale
            this.rect(x-w/2,y-h/2,w,h,{fill:"#b4b4b4",opacity:opt.alpha})
            this.text("UL",x,y+0.17*opt.scale,{color:"#666666",font:0.5*opt.scale,opacity:opt.alpha})
            break
            
        case RESOURCE_UTRIUM_HYDRIDE:
            w = 0.9625*opt.scale
            h = 0.7*opt.scale
            this.rect(x-w/2,y-h/2,w,h,{fill:"#50d7f9",opacity:opt.alpha})
            this.text("UH",x,y+0.17*opt.scale,{color:"#006181",font:0.5*opt.scale,opacity:opt.alpha})
            break
        case RESOURCE_UTRIUM_OXIDE:
            w = 0.9625*opt.scale
            h = 0.7*opt.scale
            this.rect(x-w/2,y-h/2,w,h,{fill:"#50d7f9",opacity:opt.alpha})
            this.text("UO",x,y+0.17*opt.scale,{color:"#006181",font:0.5*opt.scale,opacity:opt.alpha})
            break
        case RESOURCE_KEANIUM_HYDRIDE:
            w = 0.9625*opt.scale
            h = 0.7*opt.scale
            this.rect(x-w/2,y-h/2,w,h,{fill:"#a071ff",opacity:opt.alpha})
            this.text("KH",x,y+0.17*opt.scale,{color:"#371383",font:0.5*opt.scale,opacity:opt.alpha})
            break
        case RESOURCE_KEANIUM_OXIDE:
            w = 0.9625*opt.scale
            h = 0.7*opt.scale
            this.rect(x-w/2,y-h/2,w,h,{fill:"#a071ff",opacity:opt.alpha})
            this.text("KO",x,y+0.17*opt.scale,{color:"#371383",font:0.5*opt.scale,opacity:opt.alpha})
            break
        case RESOURCE_LEMERGIUM_HYDRIDE:
            w = 0.9625*opt.scale
            h = 0.7*opt.scale
            this.rect(x-w/2,y-h/2,w,h,{fill:"#00f4a2",opacity:opt.alpha})
            this.text("LH",x,y+0.17*opt.scale,{color:"#236144",font:0.5*opt.scale,opacity:opt.alpha})
            break
        case RESOURCE_LEMERGIUM_OXIDE:
            w = 0.9625*opt.scale
            h = 0.7*opt.scale
            this.rect(x-w/2,y-h/2,w,h,{fill:"#00f4a2",opacity:opt.alpha})
            this.text("LO",x,y+0.17*opt.scale,{color:"#236144",font:0.5*opt.scale,opacity:opt.alpha})
            break
        case RESOURCE_ZYNTHIUM_HYDRIDE:
            w = 0.9625*opt.scale
            h = 0.7*opt.scale
            this.rect(x-w/2,y-h/2,w,h,{fill:"#fdd388",opacity:opt.alpha})
            this.text("ZH",x,y+0.17*opt.scale,{color:"#5d4c2e",font:0.5*opt.scale,opacity:opt.alpha})
            break
        case RESOURCE_ZYNTHIUM_OXIDE:
            w = 0.9625*opt.scale
            h = 0.7*opt.scale
            this.rect(x-w/2,y-h/2,w,h,{fill:"#fdd388",opacity:opt.alpha})
            this.text("ZO",x,y+0.17*opt.scale,{color:"#5d4c2e",font:0.5*opt.scale,opacity:opt.alpha})
            break
        case RESOURCE_GHODIUM_HYDRIDE:
            w = 0.9625*opt.scale
            h = 0.7*opt.scale
            this.rect(x-w/2,y-h/2,w,h,{fill:"#FFFFFF",opacity:opt.alpha})
            this.text("GH",x,y+0.17*opt.scale,{color:"#666666",font:0.5*opt.scale,opacity:opt.alpha})
            break
        case RESOURCE_GHODIUM_OXIDE:
            w = 0.9625*opt.scale
            h = 0.7*opt.scale
            this.rect(x-w/2,y-h/2,w,h,{fill:"#FFFFFF",opacity:opt.alpha})
            this.text("GO",x,y+0.17*opt.scale,{color:"#666666",font:0.5*opt.scale,opacity:opt.alpha})
            break
            
        case RESOURCE_UTRIUM_ACID:
            w = 1.5*opt.scale
            h = 0.7*opt.scale
            this.rect(x-w/2,y-h/2,w,h,{fill:"#50d7f9",opacity:opt.alpha})
            this.text("UH2O",x,y+0.17*opt.scale,{color:"#006181",font:0.5*opt.scale,opacity:opt.alpha})
            break
        case RESOURCE_UTRIUM_ALKALIDE:
            w = 1.5*opt.scale
            h = 0.7*opt.scale
            this.rect(x-w/2,y-h/2,w,h,{fill:"#50d7f9",opacity:opt.alpha})
            this.text("UHO2",x,y+0.17*opt.scale,{color:"#006181",font:0.5*opt.scale,opacity:opt.alpha})
            break
        case RESOURCE_KEANIUM_ACID:
            w = 1.5*opt.scale
            h = 0.7*opt.scale
            this.rect(x-w/2,y-h/2,w,h,{fill:"#a071ff",opacity:opt.alpha})
            this.text("KH2O",x,y+0.17*opt.scale,{color:"#371383",font:0.5*opt.scale,opacity:opt.alpha})
            break
        case RESOURCE_KEANIUM_ALKALIDE:
            w = 1.5*opt.scale
            h = 0.7*opt.scale
            this.rect(x-w/2,y-h/2,w,h,{fill:"#a071ff",opacity:opt.alpha})
            this.text("KHO2",x,y+0.17*opt.scale,{color:"#371383",font:0.5*opt.scale,opacity:opt.alpha})
            break
        case RESOURCE_LEMERGIUM_ACID:
            w = 1.5*opt.scale
            h = 0.7*opt.scale
            this.rect(x-w/2,y-h/2,w,h,{fill:"#00f4a2",opacity:opt.alpha})
            this.text("LH2O",x,y+0.17*opt.scale,{color:"#236144",font:0.5*opt.scale,opacity:opt.alpha})
            break
        case RESOURCE_LEMERGIUM_ALKALIDE:
            w = 1.5*opt.scale
            h = 0.7*opt.scale
            this.rect(x-w/2,y-h/2,w,h,{fill:"#00f4a2",opacity:opt.alpha})
            this.text("LHO2",x,y+0.17*opt.scale,{color:"#236144",font:0.5*opt.scale,opacity:opt.alpha})
            break
        case RESOURCE_ZYNTHIUM_ACID:
            w = 1.5*opt.scale
            h = 0.7*opt.scale
            this.rect(x-w/2,y-h/2,w,h,{fill:"#fdd388",opacity:opt.alpha})
            this.text("ZH2O",x,y+0.17*opt.scale,{color:"#5d4c2e",font:0.5*opt.scale,opacity:opt.alpha})
            break
        case RESOURCE_ZYNTHIUM_ALKALIDE:
            w = 1.5*opt.scale
            h = 0.7*opt.scale
            this.rect(x-w/2,y-h/2,w,h,{fill:"#fdd388",opacity:opt.alpha})
            this.text("ZHO2",x,y+0.17*opt.scale,{color:"#5d4c2e",font:0.5*opt.scale,opacity:opt.alpha})
            break
        case RESOURCE_GHODIUM_ACID:
            w = 1.5*opt.scale
            h = 0.7*opt.scale
            this.rect(x-w/2,y-h/2,w,h,{fill:"#FFFFFF",opacity:opt.alpha})
            this.text("GH2O",x,y+0.17*opt.scale,{color:"#666666",font:0.5*opt.scale,opacity:opt.alpha})
            break
        case RESOURCE_GHODIUM_ALKALIDE:
            w = 1.5*opt.scale
            h = 0.7*opt.scale
            this.rect(x-w/2,y-h/2,w,h,{fill:"#FFFFFF",opacity:opt.alpha})
            this.text("GHO2",x,y+0.17*opt.scale,{color:"#666666",font:0.5*opt.scale,opacity:opt.alpha})
            break
            
        case RESOURCE_CATALYZED_UTRIUM_ACID:
            w = 1.8*opt.scale
            h = 0.7*opt.scale
            this.rect(x-w/2,y-h/2,w,h,{fill:"#50d7f9",opacity:opt.alpha})
            this.text("XUH2O",x,y+0.17*opt.scale,{color:"#006181",font:0.5*opt.scale,opacity:opt.alpha})
            break
        case RESOURCE_CATALYZED_UTRIUM_ALKALIDE:
            w = 1.8*opt.scale
            h = 0.7*opt.scale
            this.rect(x-w/2,y-h/2,w,h,{fill:"#50d7f9",opacity:opt.alpha})
            this.text("XUHO2",x,y+0.17*opt.scale,{color:"#006181",font:0.5*opt.scale,opacity:opt.alpha})
            break
        case RESOURCE_CATALYZED_KEANIUM_ACID:
            w = 1.8*opt.scale
            h = 0.7*opt.scale
            this.rect(x-w/2,y-h/2,w,h,{fill:"#a071ff",opacity:opt.alpha})
            this.text("XKH2O",x,y+0.17*opt.scale,{color:"#371383",font:0.5*opt.scale,opacity:opt.alpha})
            break
        case RESOURCE_CATALYZED_KEANIUM_ALKALIDE:
            w = 1.8*opt.scale
            h = 0.7*opt.scale
            this.rect(x-w/2,y-h/2,w,h,{fill:"#a071ff",opacity:opt.alpha})
            this.text("XKHO2",x,y+0.17*opt.scale,{color:"#371383",font:0.5*opt.scale,opacity:opt.alpha})
            break
        case RESOURCE_CATALYZED_LEMERGIUM_ACID:
            w = 1.8*opt.scale
            h = 0.7*opt.scale
            this.rect(x-w/2,y-h/2,w,h,{fill:"#00f4a2",opacity:opt.alpha})
            this.text("XLH2O",x,y+0.17*opt.scale,{color:"#236144",font:0.5*opt.scale,opacity:opt.alpha})
            break
        case RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE:
            w = 1.8*opt.scale
            h = 0.7*opt.scale
            this.rect(x-w/2,y-h/2,w,h,{fill:"#00f4a2",opacity:opt.alpha})
            this.text("XLHO2",x,y+0.17*opt.scale,{color:"#236144",font:0.5*opt.scale,opacity:opt.alpha})
            break
        case RESOURCE_CATALYZED_ZYNTHIUM_ACID:
            w = 1.8*opt.scale
            h = 0.7*opt.scale
            this.rect(x-w/2,y-h/2,w,h,{fill:"#fdd388",opacity:opt.alpha})
            this.text("XZH2O",x,y+0.17*opt.scale,{color:"#5d4c2e",font:0.5*opt.scale,opacity:opt.alpha})
            break
        case RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE:
            w = 1.8*opt.scale
            h = 0.7*opt.scale
            this.rect(x-w/2,y-h/2,w,h,{fill:"#fdd388",opacity:opt.alpha})
            this.text("XZHO2",x,y+0.17*opt.scale,{color:"#5d4c2e",font:0.5*opt.scale,opacity:opt.alpha})
            break
        case RESOURCE_CATALYZED_GHODIUM_ACID:
            w = 1.8*opt.scale
            h = 0.7*opt.scale
            this.rect(x-w/2,y-h/2,w,h,{fill:"#FFFFFF",opacity:opt.alpha})
            this.text("XGH2O",x,y+0.17*opt.scale,{color:"#666666",font:0.5*opt.scale,opacity:opt.alpha})
            break
        case RESOURCE_CATALYZED_GHODIUM_ALKALIDE:
            w = 1.8*opt.scale
            h = 0.7*opt.scale
            this.rect(x-w/2,y-h/2,w,h,{fill:"#FFFFFF",opacity:opt.alpha})
            this.text("XGHO2",x,y+0.17*opt.scale,{color:"#666666",font:0.5*opt.scale,opacity:opt.alpha})
            break
		//Structures ═══════════════════════════════════════════════════════════════════════════════════════════════════
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
				[-0.45, -0.55],
				[0, -0.65],
				[0.45, -0.55],
				[0.55, 0],
				[0.45, 0.55],
				[0, 0.65],
				[-0.45, 0.55],
				[-0.55, 0],
				[-0.45, -0.55],
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
        if (Memory.map[segment] && (!flags["floodfill"] || flags["floodfill"].color != COLOR_RED)) 
        {
            floodfill = Memory.map[segment].floodfill
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
                if (floodfill[i] != floodfill[i-1] && i > 1) 
                {
                    this.line(gx-0.5,gy-0.5,gx-0.5,gy+0.5,{color:"#FFFFFF",opacity:0.7,width:0.05});
                }
                if (floodfill[i] != floodfill[i-10] && i > 10) 
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