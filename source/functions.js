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
    //delete Memory.performance
    
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

EnablePhone=function(state) 
{
  Memory.onPhone = state;
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

DeSerializeMemory=function()
{
    Memory;
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
    const [, we, lon, ns, lat] = roomNameRegExp.exec(roomName);
    return [
        we === 'W' ? -lon - 1 : +lon,
        ns === 'S' ? -lat - 1 : +lat
    ];
}

SegAndIndexFromPos=function(coords)
{
    return [
        (Math.floor(coords[0]/10) + "," + Math.floor(coords[1]/10)),
        ((coords[0]%10) + (coords[1]%10)*10)
    ]
}

Digest=function()
{
    let digest = "";
    digest = digest + "<p>Bucket: " + Game.cpu.bucket + "<p/>";
    digest = digest + "<p>Colonies: " + Memory.colonies.length + "<p/>";
    
    Memory.colonies.forEach((c) =>
    {
        let colony = digestColony(c)
        if((digest + colony).length > 800)
        {
            console.log(digest);
            digest = "";
        }
        digest = digest + "<div>" + colony + "<div/>";
    })
    
    console.log(digest);
    console.log(digest.length);
}

digestColony=function(colony)
{
    let out = "";
    let room = Game.rooms[colony.pos.roomName];
    if (room) 
    {
        let storage = room.storage;
        if (storage) 
        {
            out = out + "<p>Capacity: " + storage.store.getUsedCapacity() + "/" + storage.store.getCapacity() + "<p/>";
            RESOURCES_ALL.forEach((type) =>
            {
                let amount = storage.store.getUsedCapacity(type);
                if (amount > 0) {
                    out = out + "<div style:\"float:left\"><img src=\"https://static.screeps.com/upload/mineral-icons/" + type + ".png\"/><p> " + storage.store.getUsedCapacity(type) + "<p/><div/>";
                }
            })
        }
        else
        {
            out = out + "<p>No storage<p/>";
        }
    }
    else
    {
        out = out + "<h1>No vision on colony<h1/>";
    }
    return out;
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
    if (room) {
        let targets = room.hostiles();

        targets = _.filter(targets,(t)=>
        {
            if((t instanceof Creep))
            {
                if(t.pos.inRangeTo(colony.pos.x+5,colony.pos.y+5,6))
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
        })
        
        let turrets = room.towers;
        
        if(targets.length > 0)
        {
            if (turrets.length > 0) {
                FireTurrets(targets,turrets);
            }
        }
    }
}

FireTurrets=function(targets,turrets)
{
    turrets.forEach((t) => {t.attack(targets[0])});
}

marketTracking=function()
{
    let cpu = Game.cpu;
    if (cpu.bucket < 1000 || Game.time % MARKETPRICE_REFRESSRATE != 0) 
    {
        return;
    }
    if (!globalPrices.prices) {
        globalPrices.prices = {}
    }
    if (!globalPrices.prices[ORDER_BUY]) {
        globalPrices.prices[ORDER_BUY] = {}
    }
    if (!globalPrices.prices[ORDER_SELL]) {
        globalPrices.prices[ORDER_SELL] = {}
    }
    
    let now = Game.time;
    let limit = now - MARKETPRICE_TIMEOUT;
    [ORDER_BUY,ORDER_SELL].forEach((type) =>
    {
        for(let res in globalPrices.prices[type])
        {
            if(globalPrices.prices[type][res].time < limit || !Game.market.getOrderById(globalPrices.prices[type][res].id))
            {
                delete globalPrices.prices[type][res]
            }
        }
    })

    let market = Game.market;
    let orders = market.getAllOrders((o) => 
    {
        return o.amount > 1000;
    });
    
    for(let i in orders)
    {
        let order = orders[i];
        if (order.type == ORDER_BUY) 
        {
            if(!globalPrices.prices[ORDER_BUY][order.resourceType])
            {
                globalPrices.prices[ORDER_BUY][order.resourceType] = {}
            }
            if (!globalPrices.prices[ORDER_BUY][order.resourceType].price || globalPrices.prices[ORDER_BUY][order.resourceType].price < order.price) 
            {
                globalPrices.prices[ORDER_BUY][order.resourceType].price = order.price;
                globalPrices.prices[ORDER_BUY][order.resourceType].time = now;
                globalPrices.prices[ORDER_BUY][order.resourceType].id = order.id
            }
        }
        else
        {
            if(!globalPrices.prices[ORDER_SELL][order.resourceType])
            {
                globalPrices.prices[ORDER_SELL][order.resourceType] = {}
            }
            if (!globalPrices.prices[ORDER_SELL][order.resourceType].price || globalPrices.prices[ORDER_SELL][order.resourceType].price > order.price) 
            {
                globalPrices.prices[ORDER_SELL][order.resourceType].price = order.price;
                globalPrices.prices[ORDER_SELL][order.resourceType].time = now;
                globalPrices.prices[ORDER_SELL][order.resourceType].id = order.id
            }
        }
    }
    
    //console.log(JSON.stringify(orders));
}

fireAllTurrets=function()
{
    _(Game.rooms).filter(r => _.get(r, ['controller', 'my'])
    .forEach(r => {_(r.find(FIND_MY_STRUCTURES))
    .filter('structureType', STRUCTURE_TOWER)
    .shuffle()
    .zip(_(r.find(FIND_HOSTILE_CREEPS)
    .filter(x => {return _.some(x.body, y => [ATTACK, WORK, RANGED_ATTACK, CARRY].includes(y.type));})
    .shuffle().value()))
    .forEach(t => {!_.some(t, x => !x) &&t[0].attack(t[1])})}))
}

colonize=function(colony)
{
    if (!colony.claimer) {
        colony.claimer = [];
    }
    deleteDead(colony.claimer);
    if(colony.colonizeWaitUntil > Game.time)
    {
        colony.claimer.forEach((c) => 
        {
            Game.creeps[c].Retire(Memory.creeps[c].home);
        })
        return;
    }
    if (colony.claimer[0]) {
        let creep = Game.creeps[colony.claimer[0]]
        if (creep) 
        {
            let room = Game.rooms[colony.pos.roomName]
            if (room) 
            {
                if(room.controller.level == 0)
                {
                    creep.do('claimController',room.controller);
                }
                else if (!room.controller.my)
                {
                    if(creep.do('attackController',room.controller) == OK)
                    {
                        colony.colonizeWaitUntil = Game.time + 1000 - creep.body.length*3;
                    }
                }
            }
            else
            {
                creep.travelTo(new RoomPosition(colony.pos.x,colony.pos.y,colony.pos.roomName))
            }
        }
        else
        {
            colony.claimer.shift();
        }
    }
    else
    {
        let closest = FindClosestColony(colony.pos.roomName,false,3);
        
        if (closest) 
        {
            let room = Game.rooms[closest.pos.roomName];
            if (room) 
            {
                if(spawnRoleIntoList(room,colony.claimer,ROLE_CLAIMER) == OK)
                {
                    console.log(room.name + " is seeding colony " + colony.pos.roomName);
                }
            }
            else
            {
                Game.notify("No vision on seedling colony for " + colony.pos.roomName);
            }
        }
        else
        {
            if(!InterShard.Transport.Adopt(colony.claimer,ROLE_CLAIMER))
            {
                InterShard.Transport.Request(ROLE_CLAIMER);
            }
        }
    }
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

pointat=function(roomName,target)
{
    let room = Game.rooms[roomName];
    let vis;
    if(room)
    {
        vis = room.vis;
    }
    if (!vis) 
    {
        vis = new RoomVisual(roomName);
    }
    console.log(vis.roomName)
    if (typeof target == 'string') {
        target = Game.getObjectById(target);
    }
    
    for (var x = 0; x < 50; x=x+4) {
        for (var y = 0; y < 50; y=y+4) {
            vis.line(new RoomPosition(x,y,roomName),target.pos);
        }
    }
    return(target.pos);
}

digAllMines=function(colony)
{
    for(let i in colony.miningSpots)
    {
        digMine(colony,colony.miningSpots[i])
    }
}

digMine=function(colony,miningSpot)
{
    if (miningSpot.target)
    {
        if (miningSpot.type == 'mineral') 
        {
            let room = Game.rooms[miningSpot.myPosition.roomName];
            if (room)
            {
                if(room.controller.level < 6) 
                {
                    return;
                }
                else if(!room.storage || room.storage.store.getFreeCapacity() < 100000)
                {
                    return;
                }
                else
                {
                    if (miningSpot.target) 
                    {
                        let mineral = Game.getObjectById(miningSpot.target)
                        if (mineral && mineral.mineralAmount == 0) 
                        {
                            deleteDead(miningSpot.miners)
                            miningSpot.miners.forEach((name) => {
                                Game.creeps[name].Retire(colony.pos.roomName);
                            })
                            return;
                        }
                    }
                    if (miningSpot.extractor) 
                    {
                        let extractor = Game.getObjectById(miningSpot.extractor);
                        if (extractor) 
                        {
                            if (extractor.cooldown) 
                            {
                                return
                            }
                        }
                        else
                        {
                            delete miningSpot.extractor;
                        }
                    }
                    else
                    {
                        let items = room.lookAt(miningSpot.myPosition.x,miningSpot.myPosition.y);
                        items.forEach((i) => {
                            if (i.structure && i.structure.structureType == STRUCTURE_EXTRACTOR) 
                            {
                                miningSpot.extractor = i.structure.id;
                            }
                        })
                    }
                }
            }
        }
        if(!miningSpot.miners){miningSpot.miners=[]}
        deleteDead(miningSpot.miners)
        let needReplacement = true;
        miningSpot.miners.forEach((name) =>
        {
            let creep = Game.creeps[name]
            if(creep)
            {
                if(creep.ticksToLive > MINER_REPLACEMENT_TIMER || creep.spawning)
                {
                    needReplacement = false;
                }
                if (miningSpot.digPos) 
                {
                    if ((creep.pos.x != miningSpot.digPos.x || creep.pos.y != miningSpot.digPos.y || creep.pos.roomName != miningSpot.digPos.roomName)) 
                    {
                        creep.travelTo(new RoomPosition(miningSpot.digPos.x,miningSpot.digPos.y,miningSpot.digPos.roomName));
                        return;
                    }
                }
                else
                {
                    creep.travelTo(new RoomPosition(25,25,miningSpot.myPosition.roomName))
                    return;
                }
                
                creep.say("⛏️");
                let target = Game.getObjectById(miningSpot.target);
                if(!target)
                {
                    delete miningSpot.target;
                }
                creep.harvest(target);
                if (miningSpot.link) 
                {
                    if (creep.store.getUsedCapacity(RESOURCE_ENERGY) > MINE_LINK_TRANSFERLIMIT) 
                    {
                        let link = Game.getObjectById(miningSpot.link)
                        if (link)
                        {
                            creep.transfer(link,RESOURCE_ENERGY);
                        }
                        else
                        {
                            delete miningSpot.link
                        }
                    }
                    if (colony.recievelink) 
                    {
                        let link = Game.getObjectById(miningSpot.link)
                        if (link) 
                        {
                            if (link.store.getUsedCapacity(RESOURCE_ENERGY) >= MINE_LINK_TRANSFERLIMIT) 
                            {
                                let target = Game.getObjectById(colony.recievelink)
                                if (target) 
                                {
                                    link.transferEnergy(target);
                                }
                                else
                                {
                                    delete colony.recievelink
                                }
                            }
                        }
                        else
                        {
                            delete miningSpot.link
                        }
                    }
                }
                if(Game.time % MINE_STATUS_REFRESHRATE == 0)
                {
                    creep.room.lookAt(creep.pos).forEach((s) => {
                        if (s.type == 'structure' && s.structure.structureType == STRUCTURE_CONTAINER) 
                        {
                            miningSpot.status = s.structure.store.getUsedCapacity();
                        }
                    })
                }
            }
        })
        if (needReplacement) 
        {
            let room = Game.rooms[colony.pos.roomName]
            if (room) 
            {
                if (miningSpot.type == 'source') 
                {
                    if (miningSpot.link) 
                    {
                        let boost = 0;
                        if(Memory.boostedSource[miningSpot.target])
                        {
                            boost = Memory.boostedSource[miningSpot.target];
                        }
                        switch(boost)
                        {
                            case 0:
                                spawnRoleIntoList(room,miningSpot.miners,ROLE_LINKEDMINER)
                                break;
                            case 1:
                                spawnRoleIntoList(room,miningSpot.miners,ROLE_LINKEDMINERBOOST1)
                                break;
                            case 2:
                                spawnRoleIntoList(room,miningSpot.miners,ROLE_LINKEDMINERBOOST2)
                                break;
                            case 3:
                                spawnRoleIntoList(room,miningSpot.miners,ROLE_LINKEDMINERBOOST3)
                                break;
                            case 4:
                                spawnRoleIntoList(room,miningSpot.miners,ROLE_LINKEDMINERBOOST4)
                                break;
                            case 5:
                                spawnRoleIntoList(room,miningSpot.miners,ROLE_LINKEDMINERBOOST5)
                                break;
                        }
                    }
                    else
                    {
                        spawnRoleIntoList(room,miningSpot.miners,ROLE_MINER)
                    }
                }
                else
                {
                    spawnRoleIntoList(room,miningSpot.miners,ROLE_MINERALMINER)
                }
            }
        }
    }
    else
    {
        let room = Game.rooms[miningSpot.myPosition.roomName];
        if (room) 
        {
            let results = room.lookAt(miningSpot.myPosition.x,miningSpot.myPosition.y);
            results.forEach((r) => 
            {
                if (r.type == 'mineral') 
                {
                    miningSpot.target = r.mineral.id;
                    return;
                }
                if (r.type == 'source') 
                {
                    miningSpot.target = r.source.id;
                    return;
                }
            })
            if (!miningSpot.target) 
            {
                miningSpot.target = 'invalid'
            }
        }
    }
}


addColony=function(x,y,roomName)
{
    if(x instanceof RoomPosition) // if firts arg is room position, dig out values
    {
        roomName = x.roomName
        y = x.y
        x = x.x
    }
    
    if(!x || !y || !roomName || !(typeof(x) === 'number') || !(typeof(y) === 'number') || !(typeof(roomName) === 'string'))
    {
        console.log("addcolony called with x: " + x + " y: " + y + " roomName: " + roomName)
        return ERR_INVALID_ARGS
    }
    
    delete Memory.data.pexpansions;
    delete Memory.data.panalyze;
    delete Memory.data.posexpansions;
    
    Memory.colonies.push(new ColonyObject(x,y,roomName))
    
    Game.notify("Adding a new colony to " + roomName + " at " + x + "," + y);
    
    return OK;
}
analyzeRoom=function(roomName)
{
    console.log("Analysing " + roomName)
    var terrain = new Room.Terrain(roomName)
    if(!Memory.data) {Memory.data = {}}
    if(!Memory.data.pexpansions) { Memory.data.pexpansions = []}
    var count = 0
    for (var x = 1; x < 49; x++) {
        for (var y = 1; y < 49; y++) { // all tiles
            if (terrain.get(x,y) != TERRAIN_MASK_WALL) //where not wall 
            {
                Memory.data.pexpansions.push({x:x,y:y,checklevel:1,roomName:roomName});
                count += 1
            }
        }
    }
    return count
}

analyzeRegion=function(_x,_y,w,h)
{
    if(!Memory.data) {Memory.data = {}}
    if(!Memory.data.panalyze) { Memory.data.panalyze = []}
    
    var prehor = "W"
    var prever = "N"
    if (_x < 0) {
        _x = 1-_x
        prehor = "E"
    }
    if(_y < 0)
    {
        _y = 1-_y
        prever = "S"
    }
    for (var x = _x; x < _x+w; x++) {
        for (var y = _y; y < _y+h; y++) {
            Memory.data.panalyze.push(prehor+x+prever+y);
        }
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

spawnUsingFirst=function(spawns,list,body,name,options={})
{
    var spawns = _.filter(spawns,(s) => {return !s.spawning})
    if (spawns.length > 0) {
        options = _.defaults(options,{directions:_.first(spawns).memory.preferredDirections,forcename:false});
        var code = _.first(spawns).spawnCreep(body,name + (options.forcename ? "" : Memory.creepid),options);
        if (code == OK) {
            list.push(name+ (options.forcename ? "" : Memory.creepid));
            Memory.creepid += 1;
        }
        return code
    }
    //all spawns busy
    return ERR_BUSY
}

dopath=function(Highway)
{
    if (Highway.start && Highway.end) 
    {
        var start = new RoomPosition(Highway.start.x,Highway.start.y,Highway.start.roomName)
        var end = new RoomPosition(Highway.end.x,Highway.end.y,Highway.end.roomName)
        
        var room = Game.rooms[start.roomName]
        if (room) 
        {
            var ret = PathFinder.search(start,[{pos:end,range:1}],{roomCallback:avoidColonyLayout,swampCost:1,plainCost:1,ignoreCreeps:true})
            if (!ret.incomplete) {
                Highway.path = Highway.path.concat(ret.path)
                delete Highway.start
                delete Highway.end
            }
            else
            {
                Highway.path = Highway.path.concat(ret.path)
                Highway.path.pop();
                Highway.start = _.last(ret.path)
            }
        }
        //else no vision
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
            if(Game.shard.name == "shard3" && roomName == Memory.mainColony)
            {
                var blocked = getBlocked(pos.x,pos.y,roomName,layout.structures[8])
                for(var b in blocked)
                {
                    var bpos = blocked[b]
                    matrix.set(bpos.x,bpos.y,512);
                }
            }
            else
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
    }
    return matrix
}

maintainall=function(colony)
{
    if(Game.shard.name == "shard3" && Memory.mainColony == colony.pos.roomName)
    {
        for(let highway of colony.highways)
        {
            maintain(highway,colony)
        }
    }
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

maintainColony=function(colony)
{
    if (Game.time - colony.lastmaintained > COLONY_MAINTAIN_INTERVAL) 
    {
        if(Game.shard.name == "shard3" && Memory.mainColony == colony.pos.roomName)
        {   
            MaintainColonystatic(colony);
        }
        else
        {
            MaintainColonydynamic(colony);
        }
    }
}

MaintainColonystatic=function(colony)
{
    let room = Game.rooms[colony.pos.roomName]
    if(!room) 
    {
        Game.notify("No vision on colony " + colony.pos.roomName); 
        return
    }
    if(!colony.at) { colony.at = 0 } //if 'at' doesn't resolve start at 0
    if(!colony.worker) { colony.worker = colony.workerpool.shift() } //if no worker take one from the worker pool
    if(colony.worker) // state can change, cant use an else
    {
        let creep = Game.creeps[colony.worker]
        if(creep)
        {
            if (creep.memory.harvesting) 
            {
                creep.dumbHarvest()
            }
            else
            {
                let dx = colony.at%11
                let dy = Math.floor(colony.at/11)
                if(dy >= layout.structures[room.controller.level].length) //if one past the last reset and reset maintain timer 
                {
                    colony.at = false
                    colony.workerpool.push(colony.worker)
                    colony.worker = false
                    colony.lastmaintained = Game.time
                    return;
                }
                
                let pos = new RoomPosition(colony.pos.x + dx,colony.pos.y + dy,colony.pos.roomName)
                let wantedstruct = layout.structures[room.controller.level][dy][dx]
                if(!wantedstruct) 
                {
                    colony.at += 1
                }
                else
                {
                    if (creep.pos.roomName != pos.roomName || creep.pos.getRangeTo(pos.x,pos.y) > 2) // path to current structure
                    {
                        creep.travelTo(new RoomPosition(pos.x,pos.y,pos.roomName))
                    }
                    let struct = false
                    if (room) {
                        for (let s of pos.lookFor(LOOK_STRUCTURES))
                        {
                            if (s.structureType == wantedstruct) 
                            {
                                struct = s;
                                break;
                            }
                        }
                        if(!struct)
                        {
                            for(let site of pos.lookFor(LOOK_CONSTRUCTION_SITES))
                            {
                                if (site.structureType == wantedstruct) 
                                {
                                    struct = site;
                                    break;
                                }
                            }
                        }
                    }
                    if (struct)
                    {
                        if (struct instanceof Structure) //repair if road build if construction
                        {
                            creep.do("repair",struct)
                            if (struct.hits == struct.hitsMax) //if road and fully healed continue to next roadsegment
                            {    
                                colony.at += 1
                            }
                        }
                        else
                        {
                            creep.do("build",struct)
                        }
                    }
                    else
                    {
                        pos.createConstructionSite(wantedstruct);
                    }
                }
            }
            creep.updateHarvestState()
        }
        else
        {
            colony.worker = false
        }
    }
}

MaintainColonydynamic=function(colony)
{
    let room = Game.rooms[colony.pos.roomName]
    if(!room) 
    {
        Game.notify("No vision on colony " + colony.pos.roomName); 
        return
    }
    if(!colony.at) { colony.at = 0 } //if 'at' doesn't resolve start at 0
    if(!colony.worker) { colony.worker = colony.workerpool.shift() } //if no worker take one from the worker pool
    if(colony.worker) // state can change, cant use an else
    {
        let creep = Game.creeps[colony.worker]
        if(creep)
        {
            if (creep.memory.harvesting) 
            {
                creep.dumbHarvest()
            }
            else
            {
                if(colony.at >= colony.layout.length/3) //if one past the last reset and reset maintain timer 
                {
                    colony.at = false
                    colony.workerpool.push(colony.worker)
                    colony.worker = false
                    colony.lastmaintained = Game.time
                    return;
                }
                let building = colony.layout.charAt(colony.at*3);
                let x = colony.layout.charAt(colony.at*3+1);
                let y = colony.layout.charAt(colony.at*3+2);

                let pos = new RoomPosition(BAKED_COORD["Decode"][x], BAKED_COORD["Decode"][y], colony.pos.roomName);
                let wantedstruct = CHAR_STRUCTURE[building]

                if (creep.pos.roomName != pos.roomName || creep.pos.getRangeTo(pos.x,pos.y) > 2) // path to current structure
                {
                    creep.travelTo(pos)
                }
                let struct = false
                if (room) {
                    for (let s of pos.lookFor(LOOK_STRUCTURES))
                    {
                        if (s.structureType == wantedstruct) 
                        {
                            struct = s;
                            break;
                        }
                    }
                    if(!struct)
                    {
                        for(let site of pos.lookFor(LOOK_CONSTRUCTION_SITES))
                        {
                            if (site.structureType == wantedstruct) 
                            {
                                struct = site;
                                break;
                            }
                        }
                    }
                }
                if (struct)
                {
                    if (struct instanceof Structure) //repair if road build if construction
                    {
                        creep.do("repair",struct)
                        if (struct.hits == struct.hitsMax) //if road and fully healed continue to next roadsegment
                        {    
                            colony.at += 1;
                        }
                    }
                    else
                    {
                        creep.do("build",struct)
                    }
                }
                else
                {
                    pos.createConstructionSite(wantedstruct);
                }
            }
            creep.updateHarvestState()
        }
        else
        {
            colony.worker = false
        }
    }
}

MaintainMiningSpots=function(colony)
{
    colony.miningSpots.forEach((m) => {MaintainMiningSpot(colony,m)});
}

MaintainMiningSpot=function(colony,miningSpot)
{
    if (!miningSpot.lastmaintained || Game.time - miningSpot.lastmaintained > COLONY_MAINTAIN_INTERVAL) 
    {
        let room = Game.rooms[miningSpot.myPosition.roomName]
        if(!room || !miningSpot.layout)
        {
            return
        }
        if(!miningSpot.type)
        {
            let result = room.lookAt(miningSpot.myPosition.x,miningSpot.myPosition.y)
            for(let i in result)
            {
                if (result[i].type == 'mineral') 
                {
                    miningSpot.type = 'mineral';
                }
                if (result[i].type == 'source') 
                {
                    miningSpot.type = 'source';
                }
            }
            console.log("New minging spot is of type: " + miningSpot.type);
        }
        else
        {
            if (miningSpot.type == 'mineral') 
            {
                if (room.controller.level < 6) 
                {
                    if (miningSpot.worker) 
                    {
                        colony.workerpool.push(miningSpot.worker)
                        delete miningSpot.worker;
                    }
                    return;
                }
            }
        }
        
        
        if(!miningSpot.at) { miningSpot.at = {x:0,y:0} } //if 'at' doesn't resolve start at 0
        if(!miningSpot.worker) { miningSpot.worker = colony.workerpool.shift() } //if no worker take one from the worker pool
        if(miningSpot.worker) // state can change, cant use an else
        {
            
            if (miningSpot.at.y >= miningSpot.layout.length) {
                
                miningSpot.at = false
                colony.workerpool.push(miningSpot.worker)
                miningSpot.worker = false
                miningSpot.lastmaintained = Game.time
                return;
            }
            if (miningSpot.at.x >= miningSpot.layout[miningSpot.at.y].length) 
            {
                miningSpot.at.x = 0;
                miningSpot.at.y += 1;
                return;
            }
            
            let creep = Game.creeps[miningSpot.worker]
            if(creep)
            {
                if (creep.memory.harvesting) 
                {
                    creep.dumbHarvest()
                }
                else
                {
                    
                    let pos = {x:miningSpot.myPosition.x + miningSpot.at.x-1,y:miningSpot.myPosition.y + miningSpot.at.y-1,roomName:miningSpot.myPosition.roomName}
                    let wantedstruct;
                    if(miningSpot.layout[miningSpot.at.y])
                    {
                        wantedstruct = miningSpot.layout[miningSpot.at.y][miningSpot.at.x];
                    }
                    if(!wantedstruct) {
                        miningSpot.at.x += 1;
                        return;
                    }
                    
                    if (creep.pos.roomName != pos.roomName || creep.pos.getRangeTo(pos.x,pos.y) > 2) // path to current structure
                    {
                        creep.travelTo(new RoomPosition(pos.x,pos.y,pos.roomName))
                    }
                    let struct = false
                    if (room) {
                        let structures = room.lookForAt(LOOK_STRUCTURES,pos.x,pos.y) //look for structure object
                        for (let s of structures)
                        {
                            if (s.structureType == wantedstruct) 
                            {
                                struct = s;
                                break;
                            }
                        }
                        if (!struct) 
                        {
                            let constructions = room.lookForAt(LOOK_CONSTRUCTION_SITES,pos.x,pos.y) //look for constructionssite
                            for(let c of constructions)
                            {
                                if (c instanceof ConstructionSite) 
                                {
                                    struct = c
                                }
                            }
                    
                            if (!struct) 
                            {
                                let constr = new RoomPosition(pos.x,pos.y,pos.roomName)
                                constr.createConstructionSite(wantedstruct)
                            }
                        }
                    }
                    if (struct instanceof Structure) //repair if road build if construction
                    {
                        creep.do("repair",struct)
                        if (struct.hits == struct.hitsMax) //if road and fully healed continue to next roadsegment
                        {    
                            miningSpot.at.x += 1;
                            return;
                        }
                    }
                    else
                    {
                        creep.do("build",struct)
                    }
                }
                creep.updateHarvestState()
            }
            else
            {
                miningSpot.worker = false
            }
        }
    }
}

maintain=function(Highway,colony)
{
    if (Game.time - Highway.lastmaintained > ROAD_MAINTAIN_INTERVAL) 
    {
        if(!Highway.at) { Highway.at = 0 } //if 'at' doesn't resolve start at 0
        if(!Highway.worker) { Highway.worker = colony.workerpool.shift() } //if no worker steal one from the worker pool
        if(Highway.worker) // state can change, cant use an else
        {
            if(Highway.at >= Highway.path.length) //if one past the last reset and reset maintain timer 
            {
                Highway.at = false
                colony.workerpool.push(Highway.worker)
                Highway.worker = false
                Highway.lastmaintained = Game.time
                return;
            }
            
            let creep = Game.creeps[Highway.worker]
            if(creep)
            {
                if (creep.memory.harvesting) 
                {
                    creep.dumbHarvest()
                }
                else
                {
                    let pos = Highway.path[Highway.at];
                    if (creep.pos.roomName != pos.roomName || creep.pos.getRangeTo(pos.x,pos.y) > 2) // path to current road
                    {
                        creep.travelTo(new RoomPosition(pos.x,pos.y,pos.roomName))
                    }
                    let room = Game.rooms[pos.roomName]
                    let road = false
                    if (room) {
                        let structures = room.lookForAt(LOOK_STRUCTURES,pos.x,pos.y) //look for road object
                        for (let s of structures)
                        {
                            if (s.structureType == STRUCTURE_ROAD) 
                            {
                                road = s;
                                break;
                            }
                        }
                        if (!road) 
                        {
                            let constructions = room.lookForAt(LOOK_CONSTRUCTION_SITES,pos.x,pos.y) //look for constructionssite
                            for(let c of constructions)
                            {
                                if (c instanceof ConstructionSite) 
                                {
                                    road = c
                                }
                            }
                            if (!road) 
                            {
                                let result = new RoomPosition(pos.x,pos.y,pos.roomName).createConstructionSite(STRUCTURE_ROAD);
                                if (result == ERR_INVALID_TARGET) 
                                {
                                    Highway.path.splice(Highway.at,1);
                                }
                            }
                        }
                    }
                    if (road instanceof Structure) //repair if road build if construction
                    {
                        creep.do("repair",road)
                        if (road.hits == road.hitsMax) //if road and fully healed continue to next roadsegment
                        {    
                            Highway.at += 1
                        }
                    }
                    else
                    {
                        creep.do("build",road)
                    }
                }
                creep.updateHarvestState()
            }
            else
            {
                Highway.worker = false // creep's dead or invalid
            }
        }
    }
}

AddMiningSpot=function(colony,miningspot)
{
    if (miningspot) 
    {
        console.log(colony.pos.roommName + " started mining at: " + miningspot.myPosition.roomName);
        if(!colony.miningSpots) { colony.miningSpots = []}
        colony.miningSpots.push(miningspot);
        let center = new RoomPosition(colony.pos.x,colony.pos.y,colony.pos.roomName);
        let way = new Highway(center, miningspot.myPosition);
        if(!colony.highways) { colony.highways = [] }
        colony.highways.push(way);
    }
}

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

TrackAllDelta=function()
{
    for(let i in Memory.colonies)
    {
        TrackDelta(Memory.colonies[i]);
    }
}

CostOfBody=function(body)
{
    let result = 0;
    for(let i in body)
    {
        result += BODYPART_COST[body[i].type];
    }
    return result;
}

TrackDelta=function(colony)
{
    let delta = 0;
    let allCreeps = [];
    allCreeps = allCreeps.concat(colony.workerpool);
    allCreeps = allCreeps.concat(colony.haulerpool);
    
    if (colony.worker) {
        allCreeps.push(colony.worker)
    }
    if (colony.builder) {
        allCreeps.push(colony.builder)
    }
    if (colony.scavenger) {
        allCreeps.push(colony.scavenger)
    }
    
    for(let i in colony.highways)
    {
        if (colony.highways[i].worker) {
            allCreeps.push(colony.highways[i].worker)
        }
    }
    for(let i in allCreeps)
    {
        let creep = Game.creeps[allCreeps[i]];
        if (creep) {
            delta -= CostOfBody(creep.body)/CREEP_LIFE_TIME
        }
    }
    
    let room = Game.rooms[colony.pos.roomName];
    if (room) {
        delta += room.find(FIND_SOURCES).length * 10;
    }
    
    let roads = room.roads;
    for(let i in roads)
    {
        delta -= roads[i].hitsMax/ROAD_DECAY_TIME/50/10;
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
        let targetRoom = Game.rooms[Memory.colonies[0].pos.roomName];
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
                                    case OK:
                                        if(!Memory.boostedSource) { Memory.boostedSource = {}}
                                        Memory.boostedSource[s.id] = matilda.powers[PWR_REGEN_SOURCE].level;
                                        break;
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
            if(Memory.mainColony)
            {
                let room = Game.rooms[Memory.mainColony];
                if(room && room.powerSpawn)
                {
                    matilda.spawn(room.powerSpawn);
                }
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

DoVisuals = function(roomName)
{
    return Memory.lastViewed && Memory.lastViewed.room == roomName && (Game.time - Memory.lastViewed.at < 5);
}