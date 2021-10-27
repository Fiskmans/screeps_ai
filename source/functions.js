relativePoly=function(x, y, arr)
{
    var out = []
    for (var i = 0; i < arr.length; i++) {
        out[i] = []
        out[i].push(arr[i][0] + x)
        out[i].push(arr[i][1] + y)
    }
    return out
}

FindWorthWhileReactions=function()
{
    let worthy = {};
    for(let result in REVERSED_REACTIONS)
    {
        let gain = globalPrices.prices[ORDER_BUY][result];
        let losses = [globalPrices.prices[ORDER_SELL][REVERSED_REACTIONS[result][0]],
                    globalPrices.prices[ORDER_SELL][REVERSED_REACTIONS[result][1]]]
        if (gain && losses[0] && losses[1]) 
        {
            if (gain.price > losses[0].price + losses[1].price) 
            {
                worthy[result] = gain.price / (losses[0].price + losses[1].price)
            }
        }
    }
    return worthy;
}


TrackCPU=function(current,level)
{
    if(!level) { level = 0 }
    
    if(typeof(Memory.performance) === 'undefined') { Memory.performance = [] }
    if(Memory.performance.length <= level) { Memory.performance.push({at:0,data:[]}); console.log("Expanded performance list")}
    if(Memory.performance[level].data.unshift(current) > DATA_POINTS_PER_SEGMENT) { Memory.performance[level].data.pop() }
    Memory.performance[level].at++;
    if (Memory.performance[level].at > DATA_POINTS_PER_SEGMENT) 
    {
        TrackCPU(_.sum(Memory.performance[level].data)/DATA_POINTS_PER_SEGMENT,level+1);
        Memory.performance[level].at = 0;
    }
}

/**
 * A linear interpolator for hex colors.
 *
 * Based on:
 * https://gist.github.com/rosszurowski/67f04465c424a9bc0dae
 *
 * @param {Number} a  (hex color start val)
 * @param {Number} b  (hex color end val)
 * @param {Number} amount  (the amount to fade from a to b)
 *
 * @example
 * // returns 0x7f7f7f
 * lerpColor(0x000000, 0xffffff, 0.5)
 *
 * @returns {Number}
 */
lerpColor=function(a, b, amount) {
    const ar = a >> 16,
          ag = a >> 8 & 0xff,
          ab = a & 0xff,

          br = b >> 16,
          bg = b >> 8 & 0xff,
          bb = b & 0xff,

          rr = ar + amount * (br - ar),
          rg = ag + amount * (bg - ag),
          rb = ab + amount * (bb - ab);

    return (rr << 16) + (rg << 8) + (rb | 0);
};

FlagSwitch=function(flagname)
{
    return !Game.flags[flagname] || Game.flags[flagname].color != COLOR_RED;
}

RestartScouting=function()
{
    console.log("Restarting scouting efforts");
    Memory.colonies.forEach((c) => {
        let room = Game.rooms[c.pos.roomName];
        if (room) {
            Scan(room)
        }
    })
}

Scouting=function()
{
    if (!Memory.scouts) 
    {
        Memory.scouts = []
    }
    if (!Memory.activescouts) 
    {
        Memory.activescouts = []
    }
    if(!Memory.scouting)
    {
        Memory.scouting = {};
    }
    if(!Memory.map)
    {
        Memory.map = {};
    }
    
    if(Game.time % MAP_DECAY_TIME == 0)
    {
        DecayMap();
        RestartScouting();
    }
    
    let currentlyActiveScouts = 0;
    for (let roomname in Memory.scouting)
    {
        if (Memory.scouting[roomname]) 
        {
            currentlyActiveScouts++;
            let creep = Game.creeps[Memory.scouting[roomname]];
            if (creep) 
            {
                creep.notifyWhenAttacked(false);
                let room = Game.rooms[roomname];
                if(GetMapData(creep.room.name,"lastseen") != 9)
                {
                    Scan(creep.room);
                }
                if (room) 
                {
                    let res = creep.signController(room.controller,QUIPS[Game.time%QUIPS.length]);
                    if (res == ERR_NOT_IN_RANGE) 
                    {
                        creep.say('⛳')
                        creep.travelTo(room.controller,{offRoad:true,ignoreRoads:true})
                    }
                    else if(res == OK || res == ERR_INVALID_TARGET)
                    {
                        Memory.scouts.push(Memory.scouting[roomname]);
                        delete Memory.scouting[roomname]
                    }
                }
                else
                {
                    creep.say('🗺️')
                    if(creep.travelTo(new RoomPosition(25,25,roomname),{offRoad:true,ignoreRoads:true,allowHostile:true}) == ERR_NO_PATH)
                    {
                        Memory.scouts.push(Memory.scouting[roomname]);
                        delete Memory.scouting[roomname]
                    }
                }
            }
            else
            {
                console.log("Giving up on scouting " + roomname + " as creep " + Memory.scouting[roomname] + " died");
                Memory.scouting[roomname] = false;
                delete Memory.scouting[roomname]
            }
        }
    }
    for(let roomname in Memory.scouting)
    {
        if (!Memory.scouting[roomname]) 
        {
            if (Memory.scouts.length < 1) 
            {
                if (currentlyActiveScouts < MAX_ACTIVE_SCOUTS) 
                {
                    let closest = FindClosestColony(roomname);
                    let room = Game.rooms[closest.pos.roomName];
                    if(room)
                    {
                        spawnRoleIntoList(room,Memory.scouts,ROLE_SCOUT);
                    }
                }
            }
            else
            {
                while(Memory.scouts.length > 0)
                {
                    let name = Memory.scouts.shift();
                    let creep = Game.creeps[name];
                    if (creep) 
                    {
                        Memory.scouting[roomname] = name;
                        break;
                    }
                    
                }
            }
        }
    }
}

DecayMap=function()
{
    let decayedSegments = [];
    for(let segment in Memory.map)
    {
        if(Memory.map[segment].lastseen)
        {

            let decayed = true;
            result = ""
            for (var i = 0; i < 100; i++) 
            {
                let at = Memory.map[segment].lastseen[i];
                if(at > 0)
                {
                    decayed = false;
                    at = at-1;
                }
                result = result + at;
            }
            if (decayed) 
            {
                decayedSegments.push(segment);
            }
            Memory.map[segment].lastseen = result
        }
    }
    decayedSegments.forEach((d)=>
    {
        delete Memory.map[d].lastseen;
    })
	for(let segment in Memory.map)
	{
		delete Memory.map[segment].floodfill;
	}
    
    if(Memory.map.powerbanks)
    {
        let now = Game.time;
        for(let roomname in Memory.map.powerbanks)
        {
            if(now > Memory.map.powerbanks[roomname].livesUntil)
            {
                delete Memory.map.powerbanks[roomname];
            }
        }
    }

    console.log("Decaying map data");
}

Scan=function(room)
{
    if(room.portals.length > 0)
    {
        for(let portal of room.portals)
        {
            let shard    = Game.shard.name;
            let destRoom = false;  
            if(portal.destination instanceof RoomPosition)
            {
                destRoom = portal.destination.roomName;
            }
            else
            {
                shard = portal.destination.shard;
                destRoom = portal.destination.room;
            }

            if(!Memory.portals[shard]) { Memory.portals[shard] = {} };
            
            Memory.portals[shard][room.name] = 
            { 
                target:destRoom,
                pos:portal.pos 
            };
        }
    }
    else
    {
        let again = true;
        while(again)
        {
            again = false;
            for(let shardName in Memory.portals)
            {
                if(Memory.portals[shardName][room.name])
                {
                    delete Memory.portals[shardName][room.name];
                }
                if(Object.keys(Memory.portals[shardName]).length == 0)
                {
                    delete Memory.portals[shardName];
                    again = true;
                    break;
                }
            }
        }
    }

    SetMapData(room.name,"lastseen",'9');
    if (room.controller) 
    {
        if (room.controller.my) 
        {
            SetMapData(room.name,"owner",OWNER_ME);
        }
        else
        {
            if(room.controller.level == 0)
            {
                SetMapData(room.name,"owner",OWNER_UNOWNED);
            }
            else
            {
                SetMapData(room.name,"owner",OWNER_ENEMY);
                if(room.find(FIND_HOSTILE_STRUCTURES,{filter:(s) => {return s.structureType == STRUCTURE_TOWER}}))
                {
                    room.memory.avoid = 1;
                }
            }
        }
    }
    else
    {
        let isSK = false;
        room.find(FIND_HOSTILE_STRUCTURES).forEach((s) =>
        {
            if (s instanceof StructureKeeperLair) 
            {
                isSK = true;
            }
        })
        if (isSK) 
        {
            SetMapData(room.name,"owner",OWNER_KEEPER);
            room.memory.avoid = 1;
        }
        else
        {
            SetMapData(room.name,"owner",OWNER_CORRIDOR);
        }
    }
    
    if (typeof(Memory.scouting[room.name]) !== 'undefined' && !Memory.scouting[room.name]) 
    {
        delete Memory.scouting[room.name];
    }
    
    if(GetMapData(room.name,"floodfill") == ' ')
    {
        SetMapData(room.name,"floodfill",'X');
    }
    let exits = Game.map.describeExits(room.name);
    //ALL_DIRECTIONS.forEach((d) => 
    //{
    //    if (exits[d] && GetMapData(exits[d],"floodfill") == ' ' && GetMapData(exits[d],"nogo") == ' ') 
    //    {
    //        Memory.scouting[exits[d]] = false;
    //        SetMapData(exits[d],"floodfill",'X');
    //    }
    //})
    SetMapData(room.name,"sources",room.find(FIND_SOURCES).length);
    let minerals = room.find(FIND_MINERALS);
    if (minerals.length > 0) 
    {
        SetMapData(room.name,"minerals",minerals[0].mineralType);
        SetMapData(room.name,"mineralDensity",minerals[0].density);
    }

    let pbanks = room.find(FIND_HOSTILE_STRUCTURES,{filter:(s) => {return s.structureType == STRUCTURE_POWER_BANK}});
    if(pbanks.length > 0)
    {
        if(!Memory.map.powerbanks) {Memory.map.powerbanks = {}}
        if(!Memory.map.powerbanks[room.name])
        {
            let bank = pbanks[0];
            Memory.map.powerbanks[room.name]=
            {
                amount: bank.power,
                livesUntil: Game.time+bank.ticksToDecay,
                pos: bank.pos
            }
        }
    }

}

SetMapData=function(roomName,dataName,char)
{
    let [x,y] = PosFromRoomName(roomName);
    let segment = Math.floor(x/10) + "," + Math.floor(y/10)
    let index = (x%10) + Math.floor(y%10)*10;
    if(!Memory.map[segment])
    {
        Memory.map[segment] = {}
    }
    let dataobject = Memory.map[segment][dataName];
    if (!dataobject) 
    {
        dataobject = " ".repeat(10*10);
    }
    Memory.map[segment][dataName] = setCharAt(dataobject,index,char);
}

GetMapData=function(roomName,dataName)
{
    let [x,y] = PosFromRoomName(roomName);
    let segment = Math.floor(x/10) + "," + Math.floor(y/10)
    let index = (x%10) + Math.floor(y%10)*10;
    if(!Memory.map[segment])
    {
        Memory.map[segment] = {}
    }
    let dataobject = Memory.map[segment][dataName];
    if (!dataobject)
    {
        return ' ';
    }
    return dataobject[index];
}

RoomNameFromPos=function(coords)
{
    const [x, y] = coords;
    const [absX, absY] = coords.map(n => Math.abs(n));
    return (x < 0 ? 'W' + (absX - 1) : 'E' + absX) + (y < 0 ? 'S' + (absY - 1) : 'N' + absY)
}

const roomNameRegExp = /^([WE])(\d+)([NS])(\d+)$/;

PosFromRoomName=function(roomName)
{
    try
    {
        const [, we, lon, ns, lat] = roomNameRegExp.exec(roomName);
        return [
            we === 'W' ? -lon - 1 : +lon,
            ns === 'S' ? -lat - 1 : +lat
        ];
    }
    catch (e)
    {
        console.log(roomName + " failed the regex");
        return[0,0]
    }
}

SegAndIndexFromPos=function(coords)
{
    return [
        (Math.floor(coords[0]/10) + "," + Math.floor(coords[1]/10)),
        ((coords[0]%10) + (coords[1]%10)*10)
    ]
}

setCharAt=function(str,index,chr) {
    if(index > str.length-1) return str;
    return str.substr(0,index) + chr + str.substr(index+1);
}

GetRoomDiamondDistance=function(roomName1,roomName2)
{
    let [x1,y1] = PosFromRoomName(roomName1);
    let [x2,y2] = PosFromRoomName(roomName2);
    return Math.abs(x1-x2) + Math.abs(y1-y2)
}

DefendColony=function(colony)
{
    let room = Game.rooms[colony.pos.roomName]
    if (!room) 
    {
        return;
    }
    targets = room.find(FIND_HOSTILE_CREEPS,{filter:(t)=>
    {
        if((t instanceof Creep))
        {
            if(t.pos.inRangeTo(colony.pos.x,colony.pos.y,colony.level*2+3))
            {
                return true;
            }
            if (t.getActiveBodyparts(WORK) + t.getActiveBodyparts(ATTACK) + t.getActiveBodyparts(RANGED_ATTACK) > 0) 
            {
                return true
            }
        }
        else
        {
            return true
        }
        return false;
    }});
    
    if(targets.length > 0)
    {
        let c = targets[Math.floor(Math.random() * targets.length)];
        for(let t of room.towers)
        {
            if(c.hits <= 0)
            {
                break;
            }
            t.attack(c);
            c.hits -= Helpers.Tower.Effectivness((c.pos.getRangeTo(t.pos),TOWER_ACTION_HEAL));
        }
    }
    else
    {
        for(let c of room.find(FIND_MY_CREEPS))
        {
            if(c.hits < c.hitsMax)
            {
                for(let t of room.towers)
                {
                    if(c.hits >= c.hitsMax)
                    {
                        break;
                    }
                    t.heal(c);
                    c.hits += Helpers.Tower.Effectivness((c.pos.getRangeTo(t.pos),TOWER_ACTION_HEAL));
                }
                break;
            }
        }
    }
}

FireTurrets=function(targets,turrets)
{
    turrets.forEach((t) => {t.attack(targets[0])});
}

FindClosestColony=function(roomName,includeSelf,atleastLevel)
{
	if(!atleastLevel) {atleastLevel = 0}
    closest = false;
    let val = 200;
    Memory.colonies.forEach((c) =>
    {
        if (includeSelf || c.pos.roomName != roomName && c.level >= atleastLevel) 
        {
            if (!closest) 
            {
                closest = c;
            }
            else
            {
                let val2 = Game.map.getRoomLinearDistance(c.pos.roomName,roomName);
                if (val2 < val) {
                    closest = c;
                    val = val2;
                }
            }
        }
    })
    return closest;
}

PerformAttacks=function(colony)
{
    if (colony.attackers) {
        deleteDead(colony.attackers);
    }
    if(colony.attacking)
    {
        if(!colony.attackers) {colony.attackers = []};
        colony.attackers.forEach((name) => 
        {
            let creep = Game.creeps[name];
            if (creep) 
            {
                creep.say("Attacking")
                let room = Game.rooms[colony.attacking];
                if(room)
                {
                    let targets = room.hostiles();
                    if (targets.length == 0) 
                    {
                        delete colony.attacking;
                        return;
                    }
                    if (!room.controller.my) 
                    {
                        targets = targets.concat(room.find(FIND_CONSTRUCTION_SITES))    
                    }
                    targets = _.filter(targets,(f) => {return !f.my})
                    targets = _.sortBy(targets, (t) => creep.pos.getRangeTo(t))
                    let target = targets[0];
                    for(let spawn of room.Structures(STRUCTURE_SPAWN))
                    {
                        if(!spawn.my && !PathFinder.search(creep.pos,spawn,{maxOps:200}).incomplete)
                        {
                            target = spawn;
                            break;
                        }
                    }

                    if (target.structureType == STRUCTURE_CONTROLLER) 
                    {
                        if (targets.length == 1) 
                        {
                            delete colony.attacking;
                            return;
                        }
                        target = targets[1];
                    }
                    if (target.structureType == STRUCTURE_CONTROLLER && targets.length == 1) 
                    {
                        delete colony.attacking;
                        return;
                    }
                    if(creep.do('attack',target) != OK)
                    {
                        creep.travelTo(target);
                    }
                }
                else
                {
                    creep.travelTo(new RoomPosition(25,25,colony.attacking));
                }
            }
        })
        if (colony.attackers.length < 3) 
        {
            let room = Game.rooms[colony.pos.roomName];
            if (room) {
                spawnRoleIntoList(room,colony.attackers,ROLE_ATTACKER);
            }
        }
    }
    else
    {
        delete colony.attacker; 
        colony.attacking = false;
    }
}

PrettySerialize=function(obj,ignoreFalse,depth)
{
    if(!depth){depth = 0}
    message = ""
    for(var key in obj)
    {
        if(obj[key] instanceof Array)
        {
            message += ("| ".repeat(depth) + key + ":[\n")
            message += PrettySerialize(obj[key],ignoreFalse,depth+1)
            message += ("| ".repeat(depth) + "]\n")
        }
        else if(obj[key] instanceof Object)
        {
            message += ("| ".repeat(depth) + key + ":{\n")
            message += PrettySerialize(obj[key],ignoreFalse,depth+1)
            message += ("| ".repeat(depth) + "}\n")
        }
        else if(obj[key] instanceof Function)
        {
            //noop
        }
        else
        {
            if(!ignoreFalse || obj[key])
            {
                message += ("| ".repeat(depth) + key + ": " + obj[key] + "\n")
            }
        }
    }
    return message
}

logObject=function(obj,ignoreFalse)
{
    console.log(PrettySerialize(obj,ignoreFalse,0))
}

deleteDead=function(list)
{
    for(var i = 0;i < list.length; i++)
    {
        if (!Game.creeps[list[i]]) 
        {
            list.splice(i,1);
        }
    }
}

deleteAllDead=function()
{
    for(var key in Memory.creeps)
    {
        if (!Game.creeps[key]) 
        {
            delete Memory.creeps[key]
        }
    }
}

spawnRoleIntoList=function(room,list,role,options={},additionalList)
{
    if (typeof(room) === 'string') {
        room = Game.rooms[room];
        if (!room) {
            return;
        }
    }
    let minWorth = room.energyCapacityAvailable * 0.1; //wont create creep with a body thats much lower than current max i.e no [work carry move] when the cap is 6000
    
    if (list.length < 1) {
        minWorth = 0; // we need more creeps to function override the cap
    }
    let body = false;
    for(let build of BODIES[role])
    {
        if (build.cost >= minWorth && build.cost <= room.energyAvailable) 
        {
            body = build.body;
        }
    }
    if(!body)
    {
        let last = _.last(BODIES[role]);
        if(last.cost <= room.energyAvailable)
        {
            body = last.body;
        }
    }
    let code = ERR_BUSY;
    if (body) 
    {
        room.spawns.forEach((s) => {
            if (!s.spawning) 
            {
                if (code != ERR_BUSY) 
                {
                    return;
                }
                if (!options.memory) 
                {
                    options.memory = {};   
                }
                options.memory.home = room.name;
                let name = (SHARD_CREEP_NAME_PREFIXES[Game.shard.name] || '?' ) + (ROLE_PREFIXES[role] || '?') + Memory.creepid;
                code = s.spawnCreep(body,name,options);
                if (code == OK) {
                    list.push(name);
                    if(additionalList)
                    {
                        additionalList.push(name);
                    }
                    s.spawning = true;
                    Memory.creepid += 1;
                }
            }
        })
        //all spawns busy
        return ERR_BUSY
    }
    else
    {
        return ERR_NOT_ENOUGH_ENERGY;
    }
    
}

avoidColonyLayout=function(roomName)
{
    var matrix = new PathFinder.CostMatrix();
    for(var key in Memory.colonies)
    {
        let col = Memory.colonies[key];
        var pos = col.pos
        if (pos.roomName == roomName) 
        {
            if(col.layout)
            {
                let buildings = DeserializeLayout(col.layout,roomName);
                buildings.forEach((b) =>
                {
                    if(b.structure != STRUCTURE_ROAD && b.structure != STRUCTURE_RAMPART)
                    {
                        matrix.set(b.pos.x,b.pos.y,512);
                    }
                })
            }
        }
    }
    return matrix
}

AllCorridorsWithinRange = function(roomName,range) 
{
    let out = []; 
    for(let x = 0; x < Game.map.getWorldSize()/2;x++) 
    { 
        for(let y = 0; y < Game.map.getWorldSize()/2;y++) 
        {
            if(x % 10 == 0 || y % 10 == 0) 
            {
                if(GetRoomDiamondDistance("E"+x+"N"+y,roomName) < range) 
                {
                    out.push("E"+x+"N"+y);
                };
                if(GetRoomDiamondDistance("E"+x+"S"+y,roomName) < range)
                {
                    out.push("E"+x+"S"+y);
                };
                if(GetRoomDiamondDistance("W"+x+"N"+y,roomName) < range)
                {
                    out.push("W"+x+"N"+y);
                };
                if(GetRoomDiamondDistance("W"+x+"S"+y,roomName) < range)
                {
                    out.push("W"+x+"S"+y);
                }; 
            }
        }
    }; 
    return out; 
};

Scavange=function(colony)
{
    let room = Game.rooms[colony.pos.roomName];
    if(!room)
    {
        return;
    }

    let storage = room.storage;
    
    if (storage && storage.store.getFreeCapacity() > 200) {
        let things = room.find(FIND_TOMBSTONES).concat(room.find(FIND_RUINS));
        
        for(let t of things)
        {
            let resources = ExtractContentOfStore(t.store);
            for(let r of resources)
            {
                RequestEmptying(colony,t.id,r,1,REQUEST_PRIORITY_TIMED);
            }
        }
        
        //things = things.concat(room.find(FIND_DROPPED_RESOURCES)) TODO: Add dropped resource pickup?
    }
    
}

ExtractContentOfStore=function(store)
{
    return Object.keys(store);
}

ImportResources=function(terminal,items)
{
    if(!terminal.room.storage) { return; }
    if(terminal.room.storage.store.getUsedCapacity(RESOURCE_ENERGY) < 500000) { return; }
    if(terminal.cooldown > 0) { return; }
    if(!globalPrices) { return; }
    let prices = globalPrices.prices;
    if(!prices) { return; }
    items.forEach((i) =>
    {
        if(terminal.store.getUsedCapacity(i) < MARKETING_IMPORT_LEVEL)
        {
            if(prices[ORDER_SELL][i])
            {
                let order = Game.market.getOrderById(prices[ORDER_SELL][i].id);
                if(!order) { return; }
                let amount = Math.min(order.amount,MARKETING_IMPORT_LEVEL-terminal.store.getUsedCapacity(i));
                if(!amount) { return; }
                if(i == RESOURCE_ENERGY) { amount = amount/2; }
                amount = Math.floor(amount);
                if(!amount) { return; }
                let energyamount = Game.market.calcTransactionCost(amount,terminal.pos.roomName,order.roomName)
                if(terminal.store.getUsedCapacity(RESOURCE_ENERGY) < energyamount) { return; }

                let err = Game.market.deal(order.id,amount,terminal.pos.roomName);
                if(err == OK)
                {
                    terminal.cooldown = 11;
                    console.log("Imported " + amount + " " + i + " to " + terminal.pos.roomName + " for " + order.price + " credits/unit total <font color=\"red\">" + (amount * order.price) + "<font>");
                    order.amount -= amount;
                }
                else
                {
                    console.log(amount)
                    console.log("Tried to buy " + i + " in " + terminal.pos.roomName + " but got error: " + err);
                }
                return;
            }
        }
    })
}

BezierInterpolate=function(points,part)
{
    while(points.length > 1)
    {
        for(let i = 0;i < points.length - 1;i++)
        {
            points[i][0] = points[i][0]*(1-part) + points[i+1][0] * part
            points[i][1] = points[i][1]*(1-part) + points[i+1][1] * part
        }
        points.pop();
    }
    return points[0];
}

BezierFragment=function(numberOfFragments,points)
{
    let cloneSource = JSON.stringify(points);
    let out = [];
    
    for(let i = 0;i< numberOfFragments;i++)
    {
        out.push(BezierInterpolate(JSON.parse(cloneSource),(i+0.5)/numberOfFragments));
    }
    //out.concat(JSON.parse(cloneSource));
    return out;
}

Power_Matilda=function(matilda)
{
    if(Game.time % 50 == 0)
    {
        matilda.usePower(PWR_GENERATE_OPS);
    }
    if(matilda.store.getFreeCapacity(RESOURCE_OPS) < 50)
    {
        let closest = FindClosestColony(matilda.pos.roomName,true);
        if(closest)
        {
            let targetRoom = Game.rooms[closest.pos.roomName];
            if(targetRoom && targetRoom.controller && targetRoom.controller.my)
            {
                let storage = targetRoom.storage;
                if(storage)
                {
                    let res = matilda.transfer(storage,ExtractContentOfStore(matilda.store)[0]);
                    if(res == ERR_NOT_IN_RANGE)
                    {
                        matilda.travelTo(storage);
                    }
                }
            }
        }
        else
        {
            Game.notify("Matidla is lost");
        }
    }
    else
    {
        if(matilda.ticksToLive < 1000)
        {
            let err = matilda.renew(matilda.room.powerSpawn);
            if(err == ERR_NOT_IN_RANGE)
            {
                matilda.travelTo(matilda.room.powerSpawn);
            }
        }
        else
        {
            let didSomething = false;
            if(matilda.room.controller && matilda.room.controller.my)
            {
                if(matilda.room.controller.isPowerEnabled)
                {
                    let sources = matilda.room.find(FIND_SOURCES);
                    sources.forEach((s) =>
                    {
                        if(!didSomething)
                        {
                            let has = false;
                            let timeLeft = 0;
                            if(s.effects)
                            {
                                s.effects.forEach((e) =>
                                {
                                    if (e.effect == PWR_REGEN_SOURCE)
                                    {
                                        has = true;
                                        timeLeft = e.ticksRemaining;
                                    }
                                });
                            }
                            if(!has || timeLeft < 15)
                            {
                                didSomething = true;
                                matilda.say("Boosting");
                                let err = matilda.usePower(PWR_REGEN_SOURCE,s);
                                switch(err)
                                {
                                    case ERR_TIRED:
                                        matilda.say("Out of sync");
                                        break;
                                    case ERR_NOT_IN_RANGE:
                                        matilda.say("Moving");
                                        matilda.travelTo(s);
                                        break;
                                }
                            }
                        }
                    })
                }
                else
                {
                    matilda.travelTo(matilda.room.controller);
                    matilda.enableRoom(matilda.room.controller);
                    didSomething = true;
                }
            }
            if(!didSomething)
            {
                matilda.say("Idle");

                let target = matilda.room.controller;
                if (Game.flags["Matilda_Idle"])
                {
                    target = Game.flags["Matilda_Idle"];
                }
                if(!matilda.pos.isNearTo(target))
                {
                    matilda.travelTo(target);
                }
            }
        }
    }
}

PowerCreeps=function()
{
    let matilda = Game.powerCreeps["Matilda"];
    if(matilda)
    {
        if(!matilda.shard && Game.flags["Matilda_Idle"])
        {
            let room = Game.rooms[Game.flags["Matilda_Idle"].pos.roomName];
            if(room && room.powerSpawn)
            {
                matilda.spawn(room.powerSpawn);
            }
        }
        if (matilda.shard == Game.shard.name) // dont execute if on another shard ;)
        {
            Power_Matilda(matilda);
        }
    }
}

lerp = function(a,b,c)
{
    return (a*(1-c)) + (b*c);
}