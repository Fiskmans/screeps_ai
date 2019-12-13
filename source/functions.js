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

FindWorthWhileReselling=function()
{
    let worthy = {};
    let prices = globalPrices.prices;
    RESOURCES_ALL.forEach((r) =>
    {
        if(prices[ORDER_BUY][r] && prices[ORDER_SELL][r])
        {
            let gain = prices[ORDER_BUY][r].price / prices[ORDER_SELL][r].price
            if (gain > 1)
            {
                worthy[r] = gain;
            }
        }
    })
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

FindWorthWhileCommodities=function()
{
    let worthy = {};
    for(let result in COMMODITIES)
    {
        let gain = globalPrices.prices[ORDER_BUY][result];
        let losses = 0;
        let canBuyAll = true;
        for(let input in COMMODITIES[result].components)
        {
            let loss = globalPrices.prices[ORDER_SELL][input]
            if (loss) 
            {
                losses += loss.price * COMMODITIES[result].components[input];
            }
            else
            {
                canBuyAll = false;
                break;
            }
        }
        //console.log("[" + result + "] Gain: " + (gain ? gain.price * COMMODITIES[result].amount : "N/A") + " loss: " + losses + " canbuyall: " + canBuyAll)
        if (gain && losses && canBuyAll) 
        {
            if (gain.price * COMMODITIES[result].amount > losses) 
            {
                worthy[result] = {gain:(gain.price * COMMODITIES[result].amount) / losses,level:COMMODITIES[result].level}
            }
        }
    }
    return worthy;
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
                        creep.notifyWhenAttacked(false);
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
        delete Memory.mapd[d].lastseen;
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
	console.log("Scaned: " + room.name);
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
    ALL_DIRECTIONS.forEach((d) => 
    {
        if (exits[d] && GetMapData(exits[d],"floodfill") == ' ' && GetMapData(exits[d],"nogo") == ' ') 
        {
            Memory.scouting[exits[d]] = false;
            SetMapData(exits[d],"floodfill",'X');
        }
    })
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

DefendColony=function(colony)
{
    let room = Game.rooms[colony.pos.roomName]
    if (room) {
        let targets = room.hostiles();
        targets = _.filter(targets,(t)=>
        {
            if((t instanceof Creep))
            {
                //if (t.getActiveBodyparts(WORK) + t.getActiveBodyparts(ATTACK) + getActiveBodyparts(RANGED_ATTACK) > 0) 
                //{
                //    return true
                //}
            }
            else
            {
                return true
            }
            return true;
        })
        
        let turrets = room.turrets();
        
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
        if(globalPrices.prices[ORDER_SELL][RESOURCE_ENERGY])
        {
            let usedEnergy = Game.market.calcTransactionCost(1000,order.roomName,Memory.colonies[0].pos.roomName)/1000
            let energyPrice = usedEnergy*globalPrices.prices[ORDER_SELL][RESOURCE_ENERGY].price
            if(order.type == ORDER_BUY)
            {
                energyPrice = -energyPrice;
            }
            order.price = order.price + energyPrice
        }
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
                globalPrices.prices[ORDER_SELL][order.resourceType].Id = order.id
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
    if (colony.claimer[0]) {
        let creep = Game.creeps[colony.claimer[0]]
        if (creep) 
        {
            let room = Game.rooms[colony.pos.roomName]
            if (room) 
            {
                switch(creep.do('claimController',room.controller))
                {
                    case ERR_NOT_IN_RANGE:
                        creep.do('travelTo',room.controller);
                        break;
                    default:
                        creep.do('reserveController',room.controller)
                        creep.say('error: ' + creep.do('claimController',room.controller))
                        break;
                }
            }
            else
            {
                creep.travelTo(new RoomPosition(25,25,colony.pos.roomName),{allowHostile:true})
            }
        }
        else
        {
            colony.claimer.shift();
        }
    }
    else
    {
        let closest = FindClosestColony(colony.pos.roomName);
        
        if (closest) {
            let room = Game.rooms[closest.pos.roomName];
            if (room) 
            {
                console.log(room.name + " is seeding colony " + colony.pos.roomName);
                spawnRoleIntoList(room,colony.claimer,ROLE_CLAIMER);
            }
            else
            {
                Game.notify("No vision on seedling colony for " + colony.pos.roomName);
            }
        }
    }
}

FindClosestColony=function(roomName,includeSelf,atleastLevel)
{
	if(!atleastLevel) {atleastLevel = 0}
    closest = false;
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
                if (Game.map.getRoomLinearDistance(c.pos.roomName,roomName) < Game.map.getRoomLinearDistance(closest.pos.roomName,roomName)) {
                    closest = c;
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
                else
                {
                    if (miningSpot.target) 
                    {
                        let mineral = Game.getObjectById(miningSpot.target)
                        if (mineral && mineral.mineralAmount == 0) 
                        {
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
                        creep.do('travelTo',new RoomPosition(miningSpot.digPos.x,miningSpot.digPos.y,miningSpot.digPos.roomName))
                    }
                }
                else
                {
                    creep.do('travelTo',new RoomPosition(25,25,miningSpot.myPosition.roomName))
                }
                
                if (colony.pos.roomName == miningSpot.myPosition.roomName || Game.time % 2 == 0) 
                {
                    let result = creep.do('harvest',miningSpot.target);
                    switch(result)
                    {
                        case ERR_NOT_IN_RANGE:
                            delete miningSpot.target;
                            break;
                        case ERR_INVALID_TARGET:
                            let room = Game.rooms[miningSpot.myPosition.roomName];
                            if (room || miningSpot.target == 'invalid') 
                            {
                                creep.say("forgot");
                                delete miningSpot.target;
                            }
                            break;
                    }
                    if (miningSpot.link) 
                    {
                        if (Game.time % MINE_LINK_TRANSFERRATE == 0) 
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
                            if (Game.time % MINE_LINK_TRANSFERRATE == 2) 
                            {
                                let target =  Game.getObjectById(colony.recievelink)
                                if (target) 
                                {
                                    let link = Game.getObjectById(miningSpot.link)
                                    if (link) 
                                    {
                                        link.transferEnergy(target)
                                    }
                                    else
                                    {
                                        delete miningSpot.link
                                    }
                                }
                                else
                                {
                                    delete colony.recievelink
                                }
                            }
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
        if (needReplacement) {
            let room = Game.rooms[colony.pos.roomName]
            if (room) 
            {
                if (miningSpot.type == 'source') 
                {
                    if (miningSpot.link) 
                    {
                        spawnRoleIntoList(room,miningSpot.miners,ROLE_LINKEDMINER)
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

applyFlags=function()
{
    if (Game.time % 7 != 0) 
    {
        return;
    }
    let flags = Game.flags;
    if (flags["HaltWars"]) 
    {
        if (Memory.wars) 
        {
            for(let name in Memory.wars)
            {
                for(let roomname in Memory.wars[name].battlefronts)
                {
                    Memory.wars[name].battlefronts[roomname].halt = 1
                }
            }
        }
        flags["HaltWars"].remove()
    }
    if (flags["ResumeWars"]) 
    {
        if (Memory.wars) 
        {
            for(let name in Memory.wars)
            {
                for(let roomname in Memory.wars[name].battlefronts)
                {
                    if (Memory.wars[name].battlefronts[roomname].halt) {
                        delete Memory.wars[name].battlefronts[roomname].halt
                    }
                }
            }
        }
        flags["ResumeWars"].remove()
    }
    if (flags["StartColony"]) 
    {
        let startcolony = flags["StartColony"];
        addColony(startcolony.pos)
        startcolony.remove();
    }
    if (flags["Mine"]) 
    {
        let colony = FindClosestColony(flags["Mine"].pos.roomName,true)
        if (colony) 
        {
            let room = Game.rooms[colony.pos.roomName];
            if (room) 
            {
                if (flags["Mine"].room && !flags["StartRoad"] && !flags["EndRoad"]) 
                {
                    AddMiningSpot(colony,new MiningSpot(flags["Mine"].pos));
                    flags["Mine"].room.createFlag(flags["Mine"].pos,"EndRoad");
                    room.createFlag(colony.pos.x+5,colony.pos.y+5,"StartRoad");
                    flags["Mine"].remove();
                }
            }
            else
            {
                if (!Memory.scouting[flags["Mine"].pos.roomName]) 
                {
                    Memory.scouting[flags["Mine"].pos.roomName] = false;
                }
                
            }
        }
    }
    if (flags["Discard"]) 
    {
        let pos = flags["Discard"].pos;
        
        Memory.data.posexpansions = _.filter(Memory.data.posexpansions, (e) => {
            return e.roomName != pos.roomName || Math.abs(pos.x - e.x) > 3 || Math.abs(pos.y - e.y) > 3;
        })
        flags["Discard"].remove();
    }
    if(flags["Analyze"])
    {
        let flag = flags["Analyze"]
        analyzeRoom(flag.pos.roomName);
        flag.remove();
    }
    if(flags["Scout"])
    {
        let roomName = "";
        if (flags["LocalCluster"]) 
        {
            let lx = flags["LocalCluster"].pos.x;
            let ly = flags["LocalCluster"].pos.y;
            let sx = flags["Scout"].pos.x;
            let sy = flags["Scout"].pos.y;
            let dx = sx - lx - 2;
            let dy = 10 - (sy - ly - 2);
            if (dx < 0 || dx > 9 ||dy < 0 || dy > 9) 
            {
                roomName = flags["Scout"].pos.roomName;
            }
            else
            {   
                let [segx,segy] = PosFromRoomName(flags["Scout"].pos.roomName);
                let resx = Math.floor(segx/10)*10 + dx;
                let resy = Math.floor(segy/10)*10 + dy;
                roomName = RoomNameFromPos([resx,resy]);
            }
        }
        else
        {
            roomName = flags["Scout"].pos.roomName;
        }
        if (!Memory.scouting[roomName]) {
            Memory.scouting[roomName] = false;
        }
        
        flags["Scout"].remove();
    }
    
    if(flags["MarkAsOwned"])
    {
        let roomName = "";
        if (flags["LocalCluster"]) 
        {
            let lx = flags["LocalCluster"].pos.x;
            let ly = flags["LocalCluster"].pos.y;
            let sx = flags["MarkAsOwned"].pos.x;
            let sy = flags["MarkAsOwned"].pos.y;
            let dx = sx - lx - 2;
            let dy = 10 - (sy - ly - 2);
            if (dx < 0 || dx > 9 ||dy < 0 || dy > 9) 
            {
                roomName = flags["MarkAsOwned"].pos.roomName;
            }
            else
            {   
                let [segx,segy] = PosFromRoomName(flags["MarkAsOwned"].pos.roomName);
                let resx = Math.floor(segx/10)*10 + dx;
                let resy = Math.floor(segy/10)*10 + dy;
                roomName = RoomNameFromPos([resx,resy]);
            }
        }
        else
        {
            roomName = flags["MarkAsOwned"].pos.roomName;
        }
        if (!Memory.rooms[roomName]) 
        {
            Memory.rooms[roomName] = {}
        }
        Memory.rooms[roomName].avoid = 1;
        
        SetMapData(roomName,"nogo","X");
        flags["MarkAsOwned"].remove();
    }
    
    if(flags["StartRoad"] && flags["EndRoad"])
    {
        let startflag = flags["StartRoad"];
        let endflag = flags["EndRoad"];
        
        if (startflag.color != COLOR_RED && endflag.color != COLOR_RED) 
        {
            let startpos = startflag.pos;
            let endpos = endflag.pos;
            let col = false;
            
            for(let id in Memory.colonies)
            {
                let colony = Memory.colonies[id];
                if (startpos.roomName == colony.pos.roomName) 
                {
                    col = colony;
                    break;
                }
            }
            if (col) 
            {
                col.highways.push(new Highway(startpos,endpos));
                startflag.remove();
                endflag.remove();
            }
            else
            {
                startflag.setColor(COLOR_RED);
                endflag.setColor(COLOR_RED);
            }
        }
    }
    
    if(flags["StartAttack"],flags["Attack"])
    {
        let startflag = flags["StartAttack"];
        let endflag = flags["Attack"];
        
        if (startflag.color != COLOR_RED && endflag.color != COLOR_RED) 
        {
            let startpos = startflag.pos;
            let endpos = endflag.pos;
            let col = false;
            
            for(let id in Memory.colonies)
            {
                let colony = Memory.colonies[id];
                if (startpos.roomName == colony.pos.roomName) 
                {
                    col = colony;
                    break;
                }
            }
            if (col) 
            {
                col.attacking = endflag.pos.roomName;
                endflag.remove();
            }
            else
            {
                startflag.setColor(COLOR_RED);
                endflag.setColor(COLOR_RED);
            }
        }
    }
    
    if(flags["Abandon"])
    {
        for (var i = 0; i < Memory.colonies.length; i++) {
            let roomname = Memory.colonies[i].pos.roomName
            if (roomname == flags["Abandon"].pos.roomName) 
            {
                let room = Game.rooms[roomname];
                if(room)
                {
                    let buildings = room.find(FIND_MY_STRUCTURES);
                    if (buildings.length > 0) {
                        buildings.forEach((s) =>
                        {
                            if (s.structureType == STRUCTURE_CONTROLLER) 
                            {
                                s.unclaim();
                            } 
                            else 
                            {
                                s.destroy();
                            }
                        })
                    }
                    else
                    {
                        let creeps = room.find(FIND_MY_CREEPS);
                        if (creeps.length > 0) 
                        {
                            let closest = FindClosestColony(roomname,false);
                            if (closest) 
                            {
                                creeps.forEach((c) =>
                                {
                                    if (c.getActiveBodyparts(MOVE) > 0) 
                                    {
                                        if (c.getActiveBodyparts(CARRY) > 0) 
                                        {
                                            if (c.getActiveBodyparts(WORK) > 0) 
                                            {
                                                closest.workerpool.push(c.name);
                                            }
                                            else
                                            {
                                                closest.haulerpool.push(c.name);
                                            }
                                        }
                                    }
                                })    
                            }
                        }
                        else
                        {
                            Memory.colonies.splice(i,1)
                            flags["Abandon"].remove();
                        }
                    }
                }
                break;
            }
        }
    }
    
    if(Memory.wars)
    {
        for(let name in Memory.wars)
        {
            if (flags[name]) 
            {
                if(!Memory.wars.battlefronts) { Memory.wars.battlefronts = {}}
                let roomname = flags[name].pos.roomName;
                if (!Memory.wars[name].battlefronts[roomname]) 
                {
                    Memory.wars[name].battlefronts[roomname] = {};
                }
                flags[name].remove()
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
    
    Memory.colonies.push(new Colony(x,y,roomName))
    
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

logObject=function(obj,depth)
{
    if(!depth){depth = 0}
    message = ""
    for(var key in obj)
    {
        if(obj[key] instanceof Array)
        {
            message += ("| ".repeat(depth) + key + ":[\n")
            message += logObject(obj[key],depth+1)
            message += ("| ".repeat(depth) + "]\n")
        }
        else if(obj[key] instanceof Object)
        {
            message += ("| ".repeat(depth) + key + ":{\n")
            message += logObject(obj[key],depth+1)
            message += ("| ".repeat(depth) + "}\n")
        }
        else
        {
            message += ("| ".repeat(depth) + key + ": " + obj[key] + "\n")
        }
    }
    if(depth == 0)
    {
        console.log(message)
    }
    else
    {
        return message
    }
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
spawnRoleIntoList=function(room,list,role,options={})
{
    if (typeof(room) == 'string') {
        room = Game.rooms[room];
        if (!room) {
            return;
        }
    }
    
    
    let worth = room.energyCapacityAvailable * 0.1; //wont create creep with a body thats much lower than current max i.e no [work carry move] when the cap is 6000
    
    if (list.length < 1) {
        worth = 0; // we need more creeps to function override the cap
    }
    let body = false;
    for(let build of BODIES[role])
    {
        if (build.cost >= worth && build.cost <= room.energyAvailable) 
        {
            body = build.body;
        }
    }
    let code = ERR_BUSY;
    if (body) {
        room.spawns().forEach((s) => {
            if (!s.spawning) 
            {
                if (code != ERR_BUSY) 
                {
                    return;
                }
                code = s.spawnCreep(body,Memory.creepid,options);
                if (code == OK) {
                    list.push(Memory.creepid);
                    if (room.name == "E13N25")
                    {
                        console.log("spawning: " + role + " tick:" + Game.time);
                        console.log(list);
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

dopath=function(Highway,blocked)
{
    if (Highway.start && Highway.end) 
    {
        var start = new RoomPosition(Highway.start.x,Highway.start.y,Highway.start.roomName)
        var end = new RoomPosition(Highway.end.x,Highway.end.y,Highway.end.roomName)
        
        var room = Game.rooms[start.roomName]
        if (room) 
        {
            var ret = PathFinder.search(start,[{pos:end,range:1}],{roomCallback:makeTerrainMap,swampCost:1,plainCost:1,ignoreCreeps:true})
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

makeTerrainMap=function(roomName)
{
    var matrix = new PathFinder.CostMatrix();
    for(var key in Memory.colonies)
    {
        var pos = Memory.colonies[key].pos
        if (pos.roomName == roomName) 
        {
            var blocked = getBlocked(pos.x,pos.y,roomName,layout.structures[8])
            for(var b in blocked)
            {
                var bpos = blocked[b]
                matrix.set(bpos.x,bpos.y,255);
            }
        }
    }
    return matrix
}

maintainall=function(colony)
{
    for(let highway of colony.highways)
    {
        maintain(highway,colony)
    }
}

maintainColony=function(colony)
{
    if (Game.time - colony.lastmaintained > COLONY_MAINTAIN_INTERVAL) 
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
                    
                    let pos = {x:colony.pos.x + dx,y:colony.pos.y + dy,roomName:colony.pos.roomName}
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
                                    let stored = 0;
                                    let cost = CONSTRUCTION_COST[wantedstruct]
                                    if (room.storage) 
                                    {
                                        stored = room.storage.store.getUsedCapacity(RESOURCE_ENERGY)
                                    }
                                    
                                    
                                    if (cost > stored) 
                                    {
                                        console.log("waiting to build " + wantedstruct + " until enough is stored")
                                        colony.at++;
                                        return;
                                    }
                                    console.log("started building " + wantedstruct + " at " + pos.x + " " + pos.y + " " + pos.roomName);
                                    console.log("cost: " + cost)
                                    console.log("stored: " +  stored)
                                    new RoomPosition(pos.x,pos.y,pos.roomName).createConstructionSite(wantedstruct)
                                }
                            }
                        }
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
                }
                creep.updateHarvestState()
            }
            else
            {
                colony.worker = false
            }
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
        colony.miningSpots.push(miningspot);
        let center = new RoomPosition(colony.pos.x+5,colony.pos.y+5,colony.pos.roomName);
        let way = new Highway(center, miningspot.myPosition);
        colony.highways.push(way);
    }
}

Scavange=function(colony)
{
    let room = Game.rooms[colony.pos.roomName];
    if (room) {
        let storage = room.storage;
        
        if (storage && storage.store.getFreeCapacity() > 200) {
            let things = room.find(FIND_TOMBSTONES).concat(room.find(FIND_RUINS)).concat(room.containers());
            
            colony.miningSpots.forEach((m) =>
            {
                if (m.status > 500 && m.digPos) 
                {
                    let room = Game.rooms[m.digPos.roomName];
                    if (room) 
                    {
                        room.lookAt(m.digPos.x,m.digPos.y).forEach((t) => {
                            if (t.structure && t.structure.structureType == STRUCTURE_CONTAINER) 
                            {
                                things.push(t.structure);
                            }
                        })
                    }
                }
            })
            things = _.filter(things,(s) =>
            {
                if (s.id == storage.id) 
                {
                    return false;
                }
                return (((s instanceof Ruin) || (s instanceof Tombstone)) && s.store.getUsedCapacity() > 0) || s.store.getUsedCapacity() > 500;
            })
            
            if (colony.recievelink) 
            {
                let link = Game.getObjectById(colony.recievelink);
                if (link) 
                {
                    if (link.store.getUsedCapacity(RESOURCE_ENERGY) > 100) 
                    {
                        things.push(link);
                    }
                }
                else
                {
                    delete colony.recievelink;
                }
            }
            
            things = things.concat(room.find(FIND_DROPPED_RESOURCES))
            
            if (things.length > 0) 
            {
                for(let index in colony.haulerpool)
                {
                    creep = Game.creeps[colony.haulerpool[index]];
                    if (creep.store.getUsedCapacity() > 0) 
                    {
                        let res = false;
                        for(let i in RESOURCES_ALL)
                        {
                            if (creep.store.getUsedCapacity(RESOURCES_ALL[i]) > 0) 
                            {
                                res = RESOURCES_ALL[i];
                                break;
                            }
                        }
                        let err = creep.transfer(storage,res);
                        if (err == ERR_NOT_IN_RANGE) {
                            creep.travelTo(storage);
                        }
                        creep.say("dumping")
                    }
                    else
                    {
                        
                        let target = false;
                        if(index < things.length)
                        {
                            target = things[index]
                        }
                        else
                        {
                            target = things[0]
                        }
                        
                        let err = false;
                        if (target) 
                        {
                            let res = false;
                            for(let i in RESOURCES_ALL)
                            {
                                if (!target.store) 
                                {
                                    res = RESOURCE_ENERGY;
                                    break
                                }
                                if (target.store.getUsedCapacity(RESOURCES_ALL[i]) > 0) 
                                {
                                    res = RESOURCES_ALL[i];
                                    break;
                                }
                            }
                            err = creep.withdraw(target,res);
                            if (err == ERR_INVALID_TARGET) 
                            {
                                err = creep.pickup(target);
                            }
                            if (err == ERR_NOT_IN_RANGE) {
                                creep.travelTo(target);
                            }
                        }
                        creep.say("hunting")
                    }
                }
            }
            else
            {
                for(let index in colony.haulerpool)
                {
                    let creep = Game.creeps[colony.haulerpool[index]];
                    if (creep) 
                    {
                        creep.say("Moving out of the way")
                        creep.travelTo(new RoomPosition(colony.pos.x,colony.pos.y,colony.pos.roomName))
                    }
                }
            }
        }
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
    
    let roads = room.roads();
    for(let i in roads)
    {
        delta -= roads[i].hitsMax/ROAD_DECAY_TIME/50/10;
    }
}




