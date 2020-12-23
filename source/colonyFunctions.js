
colonyRetargetFactory=function(room,colony)
{
    
}

ColonyWorkerBehaviour=function(colony)
{
    if(!colony.constructionsite || colony.refreshDowngrade)
    {
        ColonyIdleWorkers(colony)
        ColonyFindBuildingWork(colony)
        if (Cache.rooms[colony.pos.roomName].controller.ticksToDowngrade > CONTROLLER_MAX_DOWNGRADE)
        {
            delete colony.refreshDowngrade
        }
    }
    else
    {
        colonyConstruct(colony)
        if (Cache.rooms[colony.pos.roomName].controller.ticksToDowngrade < CONTROLLER_MIN_DOWNGRADE)
        {
            colony.refreshDowngrade = true
        }
    }
}



ColonyIdleWorkers=function(colony)
{
    if(colony.sendLink && colony.upgradeLink)
    {
        ColonyUpgradeLinked(colony);
    }
    else
    {
        ColonyIdleWorkersDumb(colony);
    }
}

ColonyIdleWorkersDumb=function(colony)
{
    for(var key in colony.workerpool)
    {
        let creep = Game.creeps[colony.workerpool[key]];
        if(creep)
        {
            if (creep.pos.roomName != colony.pos.roomName) 
            {
                creep.travelTo(new RoomPosition(colony.pos.x,colony.pos.y,colony.pos.roomName))
            }
            else
            {
                creep.dumbUpgradeLoop()
            }
        }
    }
}

ColonyUpgradeLinked=function(colony)
{
    if(!colony.upgradeLink)
    {
        return;
    }

    let link = Game.getObjectById(colony.upgradeLink)
    if(!link || !(link instanceof StructureLink))
    {
        delete colony.upgradeLink;
        return;
    }

    let sendLink = Game.getObjectById(colony.sendLink);
    if(!sendLink)
    {
        delete colony.sendLink;
        return;
    }

    RequestResource(colony,colony.sendLink,RESOURCE_ENERGY,600);

    if(link.store.getUsedCapacity(RESOURCE_ENERGY) < 200)
    {
        sendLink.transferEnergy(link);
    }


    for(var key in colony.workerpool)
    {
        let creep = Game.creeps[colony.workerpool[key]];
        if(creep)
        {
            if (creep.pos.roomName != colony.pos.roomName) 
            {
                creep.travelTo(new RoomPosition(colony.pos.x,colony.pos.y,colony.pos.roomName))
            }
            else
            {
                creep.smarterUpgradeLoop(link);
            }
        }
    }
}

ColonyRespawnWorkers=function(colony)
{
    if(!colony.workerpool) {colony.workerpool = []};
    if(!colony.workersensus) {colony.workersensus = []};
    deleteDead(colony.workersensus);
    
    let target = TARGET_WORKER_COUNT[colony.level];
    let count = colony.workersensus.length;

    let vis = new RoomVisual(colony.pos.roomName);
    vis.text(count + " / " + target,25,3);

    if (count < target)
    {
        spawnRoleIntoList(Cache.rooms[colony.pos.roomName],colony.workerpool,ROLE_WORKER,{},colony.workersensus);
        if (Cache.rooms[colony.pos.roomName].spawns.length == 0) 
        {
            let closest = FindClosestColony(colony.pos.roomName);
            if (closest && closest.workerpool.length > 1) 
            {
                let stolen = closest.workerpool.shift();
                if(stolen)
                {
                    colony.workerpool.push(stolen);
                    colony.workersensus.push(stolen);
                    closest.workersensus = _.remove(closest.workersensus, function(c) {
                        return c == stolen;
                    });
                    
                    console.log(colony.pos.roomName + " stole a worker from " + closest.pos.roomName)
                }
            }
            else
            {
                //Panic
            }
        }
    }
}

ColonyMining=function(colony)
{
    let room = Cache.rooms[colony.pos.roomName]
    if (room && room.storage) 
    {
        if(!colony.haulerpool) {colony.haulerpool = []}
        if(!colony.haulersensus) {colony.haulersensus = []}
        deleteDead(colony.haulersensus);
        let limit = 2;
        limit += Math.max(0,colony.miningSpots.length-3);
        if(colony.level > 6)
        {
            limit /= 2;
        }
        if (colony.haulersensus.length < limit) 
        {
            spawnRoleIntoList(Cache.rooms[colony.pos.roomName],colony.haulerpool,ROLE_HAULER,{},colony.haulersensus)
        }
        MaintainMiningSpots(colony)
    }
}

FindLinkInColonyLayout=function(colony,blackList)
{
    let room = Cache.rooms[colony.pos.roomName]
    if(colony.layout)
    {
        let buildings = DeserializeLayout(colony.layout,colony.pos.roomName);
        for(let b of buildings)
        {
            if(b.structure == STRUCTURE_LINK)
            {
                for(let s of b.pos.lookFor(LOOK_STRUCTURES))
                {
                    if(s.structureType == STRUCTURE_LINK && !blackList.includes(s.id))
                    {
                        console.log("found link: " + s);
                        return s.id;
                    }
                }
            }
        }
    }
    else
    {
        let result = room.lookAt(colony.pos.x + 6,colony.pos.y + 5)
        for(let r of result)
        {
            if (r.type == 'structure' && r.structure instanceof StructureLink) 
            {
                return r.structure.id;
            }
        }
    }
    return false;
}

FindColonyLinks=function(colony)
{
    let blacklist = [];
    if(colony.sendLink)
    {
        blacklist.push(colony.sendLink);
    }
    if(colony.recievelink)
    {
        blacklist.push(colony.recievelink);
    }

    if (!colony.sendLink) 
    {
        let id = FindLinkInColonyLayout(colony,blacklist);
        if(id)
        {
            colony.sendLink = id;
            console.log("colony " + colony.pos.roomName + " found rec link with id: " + id);
        }
    }
    if (!colony.recievelink) 
    {
        let id = FindLinkInColonyLayout(colony,blacklist);
        if(id)
        {
            colony.recievelink = id;
            console.log("colony " + colony.pos.roomName + " found rec link with id: " + id);
        }
    }
}

StartMining=function(colony)
{
    if (colony.miningSpots && colony.miningSpots.length == 0) 
    {
        let room = Cache.rooms[colony.pos.roomName];
        if (room) 
        {
            let sources = room.find(FIND_SOURCES).concat(room.find(FIND_MINERALS))
            sources.forEach((s) =>
            {
                AddMiningSpot(colony,new MiningSpot(s.pos));
            })
        }
    }
}

ColonyFindMisplaced=function(colony,structureType,layout)
{
    let room = Cache.rooms[colony.pos.roomName];
    if(room)
    {
        let all = room.find(FIND_STRUCTURES,{filter:(s) =>
        {
            return s.structureType == structureType;
        }});

        if(!layout) { return; }
        var wrong = false;
        all.forEach((s) =>
        {
            if(!wrong) 
            {
                let dx = s.pos.x - colony.pos.x;
                let dy = s.pos.y - colony.pos.y;
                if(dx < 0 ||dy < 0 ||dy >= layout.length || dx >= layout[dy].length || layout[dy][dx] != structureType)
                {
                    wrong = s;
                }
            }
        })
        if(wrong)
        {
            console.log("Found misplaced " + structureType + " at " + wrong.pos.x + " " + wrong.pos.y + " " + wrong.pos.roomName);
        }
        return wrong;
    }
}

ColonyFindBuildingWork=function(colony)
{
    if(Game.time != COLONY_CHECK_BUILDINGS_INTERVAL)
    {
        //return;
    }

    if(Memory.mainColony == colony.pos.roomName)
    {
        let room = Cache.rooms[colony.pos.roomName];
        if(room)
        {
            ColonyBuildStatic(colony,layout.structures[room.controller.level])
        }
    }
    else
    {
        ColonyBuildDynamic(colony);
    }
}

ColonyBuildStatic=function(colony,plan)
{
    let room = Cache.rooms[colony.pos.roomName];
    var missing = findMissing(colony.pos.x,colony.pos.y,colony.pos.roomName,plan)
    var prio = Priorotized(colony.pos.x,colony.pos.y,colony.pos.roomName,missing)
    if (prio) 
    {
        if (room.controller && room.controller.level > 5 && room.storage && room.storage.store.getUsedCapacity(RESOURCE_ENERGY) < CONSTRUCTION_COST[prio.struct] && Prioroties[prio.struct] > 5) 
        {
            return;
        }
        let err = prio.pos.createConstructionSite(prio.struct);
        if (err == OK)
        {
            console.log("Starting work on " + prio.struct + " at " + prio.pos.x + " " + prio.pos.y + " " + prio.pos.roomName)
            colony.constructionsite = prio.pos
        }
        else if(err == ERR_RCL_NOT_ENOUGH)
        {
            if(colony.disTargets.length == 0)
            {
                let wrong = ColonyFindMisplaced(colony,prio.struct,plan);
                if(wrong) 
                {
                    colony.disTargets.push(wrong.id);
                }
                else
                {
                    console.log("Could not find a wrongly placed structure but RLC is still to low for " + colony.pos.roomName + " [" + prio.struct + "]");
                }
                
            }
        }
        else if (err == ERR_INVALID_TARGET)
        {
            prio.pos.look().forEach((thing) =>
            {
                if(thing.type == 'structure')
                {
                    colony.disTargets.push(thing.structure.id);
                }
            });
        }
        else
        {
            console.log("Could not create constructionsite got unkown error: " + err);
        }
    }
}

DeserializeLayout=function(layoutString,roomName)
{
    let layout = [];
    for(let i = 0; i < layoutString.length - 2; i += 3)
    {
        let building = layoutString.charAt(i);
        let x = layoutString.charAt(i+1);
        let y = layoutString.charAt(i+2);

        layout.push({structure:CHAR_STRUCTURE[building],pos:new RoomPosition(BAKED_COORD["Decode"][x], BAKED_COORD["Decode"][y], roomName)});
    }
    return layout;
}

SerializeLayout=function(layout)
{
    let result = "";
    layout.forEach((b) =>
    {
        result += STRUCTURE_CHAR[b.structure] + BAKED_COORD["Encode"][b.pos.x] + BAKED_COORD["Encode"][b.pos.y];
    })
    return result;
}

BuildMissing=function(colony,buildings,tracker)
{
    let room = Game.rooms[colony.pos.roomName];
    if(!room)
    {
        return;
    }

    for(let b of buildings)
    {
        if(tracker && tracker[b.structure]) { tracker[b.structure] -= 1; } 
        let structsAt = b.pos.lookFor(LOOK_STRUCTURES);
        let isThere = false;
        structsAt.forEach((s) =>
        {
            if(s.structureType==b.structure)
            {
                isThere = true;
            }
        })
        if(!isThere)
        {
            StartBuilding(colony,room,b);
            return true;
        }
    };

    return false;
}

ColonyBuildDynamic=function(colony)
{
    let room = Cache.rooms[colony.pos.roomName];
    if(!room)
    {
        return;
    }

    if(!colony.layout) { colony.layout = ""; }

    let buildings = DeserializeLayout(colony.layout,colony.pos.roomName);
    let unplaced = JSON.parse(JSON.stringify(colonyBuildingsPerLevel[colony.level]))

    if(BuildMissing(colony,buildings,unplaced))
    {
        return;
    }

    for(let k in unplaced)
    {        
        if(unplaced[k] > 0)
        {
            SetupMatrix(buildings)
            let building = PlanBuilding(colony,buildings,k,colony.pos);
            if(building)
            {
                console.log("Planning a " + building.structure + " at x: " + building.pos.x + " y: " + building.pos.y + " in " + building.pos.roomName)
                buildings.push(building);
            }
            else
            {
                Game.notify("Colony in " + colony.pos.roomName + "Cant find a place to place it's next building");
            }

            colony.layout = SerializeLayout(buildings);
            return;
        }
    };

    if(colony.subLayouts)
    {

        for(let layout of Object.values(colony.subLayouts))
        {
            let buildings2 = DeserializeLayout(layout,colony.pos.roomName);
            if(BuildMissing(colony,buildings2))
            {
                return;
            }
        }
    }
}

PlanBuilding=function(colony,alreadyPresent, type, centerPos)
{
    let TURN_MAP =
    {
        [RIGHT]: TOP,
        [TOP]: LEFT,
        [LEFT]: BOTTOM,
        [BOTTOM]: RIGHT
    }
    
    let terrain = new Room.Terrain(centerPos.roomName);  

    let left = 1;
    let depth = 1;
    let direction = RIGHT;

    let x = centerPos.x;
    let y = centerPos.y;

    while(depth < 25)
    {
        if(x > 0 || x < 49)
        {
            if(y > 0 || y < 49)
            {
                if(!IsTaken(alreadyPresent,x,y,true))
                {
                    let dx = Math.abs(x - centerPos.x);
                    let dy = Math.abs(y - centerPos.y);
                    if(IsAllowedByReservation(x - centerPos.x,y - centerPos.y,type))
                    {
                        if(Math.abs(dx - dy) != 2 && dx + dy != 2)
                        {
                            console.log("tesing d: " + dx + " " + dy);
                            if(IsValidSpot(colony,terrain,alreadyPresent,x,y,centerPos))
                            {
                                return {structure:type,pos:new RoomPosition(x, y, centerPos.roomName)};
                            }
                        }
                        else if(terrain.get(x,y) != TERRAIN_MASK_WALL)
                        {
                            return {structure:STRUCTURE_ROAD,pos:new RoomPosition(x, y, centerPos.roomName)};
                        }
                    }
                }
            }
        }

        x += offsets.x[direction];
        y += offsets.y[direction];
        left -= 1;
        if(left <= 0)
        {
            direction = TURN_MAP[direction];
            left = depth;
            if(direction == TOP || direction == BOTTOM)
            {
                depth += 1;
            }
        }
    }
    return false;
}

IsAllowedByReservation=function(x,y,structure)
{
    at = (reservedDynamicLayout[x] || {})[y];
    if(!at)
    {
        console.log(x + " " + y + " is free");
        return true;
    }
    if(at == structure)
    {
        console.log(x + " " + y + " is allowed for: " + at);
        return true;
    }
    console.log(x + " " + y + " is reserved for: " + at);
    return false;
}

let BuildingPlannerPathingMatrix = false;
SetupMatrix=function(buildings)
{
    BuildingPlannerPathingMatrix = new PathFinder.CostMatrix();

    for(let y = 0; y < 50;y++)
    {
        for(let x = 0; x < 50;x++)
        {
            BuildingPlannerPathingMatrix.set(x,y,1000);
        }
    }

    buildings.forEach((b) => 
    {
        if (b.structure == STRUCTURE_ROAD)
        {
            BuildingPlannerPathingMatrix.set(b.pos.x,b.pos.y,1);
        }
    })
}

BuildingPathingMap=function(roomName)
{
    if(BuildingPlannerPathingMatrix)
    {
        return BuildingPlannerPathingMatrix;
    }
    
    var matrix = new PathFinder.CostMatrix();
    for(let y = 0; y < 50;y++)
    {
        for(let x = 0; x < 50;x++)
        {
            matrix.set(x,y,1000);
        }
    }
    return matrix
}

IsTaken=function(buildings,x,y,countRoads)
{
    let isTaken = false;
    buildings.forEach((b) =>
    {
        if((countRoads || b.structure != STRUCTURE_ROAD) && b.pos.x == x && b.pos.y == y)
        {
            isTaken = true;
        }
    })
    return isTaken;
}

IsValidSpot=function(colony,terrain,buildings,x,y,centerPos)
{
    if(buildings.length > 0)
    {
        var pathToCore = PathFinder.search(centerPos,[{pos:new RoomPosition(x,y,centerPos.roomName),range:1}],{roomCallback:BuildingPathingMap,swampCost:1,plainCost:1,ignoreCreeps:true})
        if (pathToCore.incomplete)
        {
            console.log("position would be inaccessible x:" + x + " y:" + y)
            return false;
        }
    }

    if(terrain.get(x,y) == TERRAIN_MASK_WALL)
    {
        return false;
    }

    let blocks = false;

    ALL_DIRECTIONS.forEach((d) =>
    {
        if (blocks)
        {
            return;
        }

        let _x = x + offsets.x[d];
        let _y = y + offsets.y[d];
        if(IsTaken(buildings,_x,_y,true))
        {
            var pathToCore2 = PathFinder.search(centerPos,[{pos:new RoomPosition(_x,_y,centerPos.roomName),range:1}],{roomCallback:BuildingPathingMap,swampCost:1,plainCost:1,ignoreCreeps:true})
            if (pathToCore2.incomplete) 
            {
                console.log("would block building at x:" + _x + " y:" + _y)
                blocks = true;
            }
        }
    })
    
    for(let highway of colony.highways)
    {
        if(highway.path)
        {
            for(let p of highway.path)
            {
                if(p.x == x && p.y == y && p.roomName == centerPos.roomName)
                {
                    return false;
                }
            }
        }
    }



    console.log("x: " + x + " y: " + y + " blocks: " + blocks);
    return !blocks;
}

FindMissplaced=function(colony,room,type)
{
    if(!colony.layout)
    {
        return;
    }

    let buildings = DeserializeLayout(colony.layout,colony.pos.roomName);
    if(colony.subLayouts)
    {
        for(let layout of Object.values(colony.subLayouts))
        {
            buildings = buildings.concat(DeserializeLayout(layout,colony.pos.roomName))
        }
    }

    buildings = _.filter(buildings,(s) => { return s.structure == type});

    let ofType = room.Structures(type);

    for(let b of ofType)
    {
        let allowed = false;
        for(let s of buildings)
        {
            if(s.pos.x == b.pos.x && s.pos.y == b.pos.y)
            {
                allowed = true;
                break;
            }
        }
        if(!allowed && !colony.disTargets.includes(b.id))
        {
            colony.disTargets.push(b.id);
            break;
        }
    }

}

StartBuilding=function(colony,room,building)
{
    if (room.controller && room.controller.level > 5 && room.storage && room.storage.store.getUsedCapacity(RESOURCE_ENERGY) < CONSTRUCTION_COST[building]) 
    {
        return;
    }
    let err = building.pos.createConstructionSite(building.structure);

    
    if (err == OK)
    {
        console.log("Starting work on " + building.structure + " at " + building.pos.x + " " + building.pos.y + " " + building.pos.roomName)
        colony.constructionsite = building.pos
    }
    else if(err == ERR_RCL_NOT_ENOUGH)
    {
        FindMissplaced(colony,room,building.structure);
    }
    else if (err == ERR_INVALID_TARGET)
    {
        building.pos.lookFor(LOOK_STRUCTURES).forEach((s) =>
        {
            if(OBSTACLE_OBJECT_TYPES.includes(s.structureType) && !colony.disTargets.includes(s.id))
            {
                colony.disTargets.push(s.id);
            }
        });
    }
    else
    {
        console.log("Could not create constructionsite got unkown error: " + err);
    }
}


ColonyRetargetSelling=function(colony)
{
    if(Game.time % COLONY_RETARGET_SELLING_INTERVAL != 0) { return; }
    if(!colony.selling) {colony.selling = []};
    let room = Cache.rooms[colony.pos.roomName];
    if(!room) { return; }
    let terminal = room.terminal;
    if(!terminal) { return; }
    let storage = room.storage;
    let has = [];
    if(terminal)
    {
        has = ExtractContentOfStore(terminal.store)
    }
    if(storage)
    {
        has = _.union(has,ExtractContentOfStore(storage.store));
    }
    if(!globalPrices) { return; }
    let prices = globalPrices.prices;
    if(!prices) { return; }
    colony.selling = _.filter(has,(r) =>
    {
        if( (r != RESOURCE_ENERGY && storage.store.getUsedCapacity(r) > RESOURCE_SELLING_LIMIT) || 
            (r == RESOURCE_ENERGY && storage.store.getUsedCapacity(RESOURCE_ENERGY) > ENERGY_SELLING_ENERGY_LIMIT))
        {

            if(prices[ORDER_BUY][r]) 
            {
                if(MinimumSellingPrice[r])
                {
                    if(prices[ORDER_BUY][r].price > MinimumSellingPrice[r])
                    {
                        return true;
                    }
                }
                else
                {
                    Game.notify(r + " has no minimum sell price but could be sold");
                    MinimumSellingPrice[r] = ALWAYSPROFITABLE
                }
            }
        }
        return false;
    })
}

ColonyRetargetFactory=function(colony)
{
    if(Game.time % COLONY_RETARGET_FACTORY_INTERVAL != 0) { return; }
    let room = Cache.rooms[colony.pos.roomName];
    if(!room || !room.factory) { return; }
    let level = room.factory.level || 0;
    let possabilities = FindWorthWhileCommodities();
    let best = false;
    for(let r in possabilities)
    {
        if((!possabilities[r].level || 0 <= level) && r != RESOURCE_ENERGY)
        {
            if(!best || possabilities[r].gain > possabilities[best].gain)
            {
                best = r;
            }
        }
    }
    if(!best) {  delete colony.crafting; return; }
    colony.crafting = best;
}

ColonyRestock=function(colony,stockto,target,rolename,source)
{
    if(!colony.restockers) {colony.restockers = {}};
    let missing = {}
    let store = target.store;
    for(let res in stockto)
    {
        if(store.getUsedCapacity(res) < stockto[res] && source.store.getUsedCapacity(res) > 0)
        {
            missing[res] = stockto[res] - store.getUsedCapacity(res);
        }
    }
    if(colony.restockers[rolename])
    {
        var creep = Game.creeps[colony.restockers[rolename]];
    }
    if(Object.keys(missing).length > 0 || (creep && creep.store.getUsedCapacity() > 0))
    {
        if(colony.restockers[rolename])
        {
            if(creep)
            {
                if(creep.store.getUsedCapacity() > 0)
                {
                    let res = ExtractContentOfStore(creep.store)[0];
                    creep.say("⬆️ "+ res + " ⬆️");
                    if(target.store.getFreeCapacity(res) < 10)
                    {
                        if(creep.transfer(source,res) == ERR_NOT_IN_RANGE)
                        {
                            creep.travelTo(source)
                        }
                    }
                    else
                    {
                        if(creep.transfer(target,res) == ERR_NOT_IN_RANGE)
                        {
                            creep.travelTo(target)
                        }
                    }
                }
                else
                {
                    let res = Object.keys(missing)[0];
                    let amount = Math.min(creep.store.getFreeCapacity(res),store.getUsedCapacity(res));
                    let result = creep.withdraw(source, res, amount);
                    if(result == ERR_NOT_IN_RANGE)
                    {
                        creep.say("⬇️ "+ res + " ⬇️");
                        creep.travelTo(source)
                    }
                    else if (result == ERR_FULL)
                    {
                        console.log("failed to withdraw " + amount + " " + res + " from " + source + " Err: " + result);
                    }
                }
            }
            else
            {
                delete colony.restockers[rolename]
            }
        }
        else
        {
            colony.restockers[rolename] = colony.haulerpool.shift();
        }
    }
    else
    {
        if(colony.restockers[rolename])
        {
            colony.haulerpool.push(colony.restockers[rolename]);
            delete colony.restockers[rolename];
        }
    }
}

ColonySelling=function(colony,terminal)
{
    if(terminal.cooldown > 0) { return; }
    if(!colony.selling) { return; }
    if(!globalPrices) { return; }
    let prices = globalPrices.prices;
    if(!prices) { return; }
    for(let i in colony.selling)
    {
        let res = colony.selling[i];
        if(prices[ORDER_BUY][res] && prices[ORDER_BUY][res].price > MinimumSellingPrice[res])
        {
            let order = Game.market.getOrderById(prices[ORDER_BUY][res].id);
            if(!order) { break; }
            let amount = Math.min(order.amount,terminal.store.getUsedCapacity(res));
            if(!amount) { break; }
            if(res == RESOURCE_ENERGY) { amount = amount/2; }
            amount = Math.floor(amount);
            if(!amount) { break; }
            let energyamount = Game.market.calcTransactionCost(amount,colony.pos.roomName,order.roomName)
            if(terminal.store.getUsedCapacity(RESOURCE_ENERGY) < energyamount) { return; }

            let err = Game.market.deal(order.id,amount,colony.pos.roomName);
            if(err == OK)
            {   
                terminal.cooldown = 11;
                console.log(("Sold ".padEnd(10)) + (amount + " " + res).padEnd(20) + " from " + colony.pos.roomName + (" for " + order.price + " credits/unit").padEnd(26) + " total <font color=\"green\">" + (amount * order.price) + "<font>");
                order.amount -= amount;
            }
            else
            {
                console.log(amount)
                console.log("Tried to sell " + res + " from " + colony.pos.roomName + " but got error: " + err);
            }
            break;
        }
    }
}

ColonyMerchant=function(colony)
{
    let room = Cache.rooms[colony.pos.roomName]
    if(!room) { return; }
    if(!colony.selling) { return; }
    let target = {};
    target[RESOURCE_ENERGY] = MARKETING_STOCK_ENERGY;
    colony.selling.forEach((r) =>
    {
        if(r != RESOURCE_ENERGY)
        {
            target[r] = MARGETING_STOCK_OTHER;
        }
    });
    let terminal = room.terminal;
    let storage = room.storage;
    if(!terminal) { return; }
    if(!storage) { return; }
    if(storage.store.getUsedCapacity(RESOURCE_ENERGY) < MARKETING_ENERGY_LOWER_LIMIT) { target = {} }
    ColonyRestock(colony,target,terminal,"store->terminal",storage);
    ColonySelling(colony,terminal)
}

ColonyDismantleAll=function(colony)
{
    if (colony._discheck) 
    {
        return;
    }
    let room = Cache.rooms[colony.pos.roomName];
    if(!room || !room.storage || room.storage.structureType != STRUCTURE_STORAGE) { return; }
    let all = room.find(FIND_HOSTILE_STRUCTURES);
    all.forEach((s) =>
    {
        colony.disTargets.push(s.id);
    })
    colony._discheck = 1;
}
ColonyCollect=function(colony,source,target,type,rolename)
{
    if(!colony.collecters) {colony.collecters = {}};
    if(colony.collecters[rolename])
    {
        var creep = Game.creeps[colony.collecters[rolename]];
    }
    if(type && source.store.getUsedCapacity(type) > 0 || (creep && creep.store.getUsedCapacity() > 0))
    {
        if(colony.collecters[rolename])
        {
            if(creep)
            {
                if(creep.store.getUsedCapacity() > 0)
                {
                    let res = ExtractContentOfStore(creep.store)[0];
                    creep.say("⬆️ "+ res + " ⬆️");
                    if(creep.transfer(target,res) == ERR_NOT_IN_RANGE)
                    {
                        creep.travelTo(target)
                    }
                }
                else
                {
                    creep.say("⬇️ " + type + " ⬇️");
                    if(creep.withdraw(source, type) == ERR_NOT_IN_RANGE)
                    {
                        creep.travelTo(source)
                    }
                }
            }
            else
            {
                delete colony.collecters[rolename]
            }
        }
        else
        {
            colony.collecters[rolename] = colony.haulerpool.shift();
        }
    }
    else
    {
        if(colony.collecters[rolename])
        {
            colony.haulerpool.push(colony.collecters[rolename]);
            delete colony.collecters[rolename];
        }
    }
}

ColonyCrafting=function(colony)
{
    let room = Cache.rooms[colony.pos.roomName];
    if(!room || !room.factory) { return; }
    if(room.storage)
    {
        ColonyCollect(colony,room.factory,room.storage,colony.crafting,"factory->store");
    }
    if(!colony.crafting) { return; }
    let wants = {};
    for(let res in COMMODITIES[colony.crafting].components)
    {
        wants[res] = COMMODITIES[colony.crafting].components[res] * FACTORY_NUMBER_OF_CRAFTS_TO_STOCK
    }
    if(room.storage)
    {
        if(wants[RESOURCE_ENERGY] && room.storage.store.getUsedCapacity(RESOURCE_ENERGY) < FACTORY_ENERGY_TO_LEAVE_IN_STORAGE)
        {
            delete wants[RESOURCE_ENERGY];
        }
        ColonyRestock(colony,wants,room.factory,"store->factory",room.storage);
        ColonyCollect(colony,room.factory,room.storage,colony.crafting,"factory->store");
    }
    if(room.terminal)
    {
        delete wants[RESOURCE_ENERGY];
        ColonyRestock(colony,wants,room.factory,"terminal->factory",room.terminal);

        ImportResources(room.terminal,Object.keys(wants));
    }

    let err = room.factory.produce(colony.crafting);

}

ColonyCollectPower=function(colony)
{
    if(colony.expedition)
    {
        let exp = colony.expedition
        if(Game.time > exp.endDate)
        {
            delete colony.expedition;
            return;
        }

        if(!exp.attackers) {exp.attackers = []}
        if(!exp.healers) {exp.healers = []}
        if(!exp.haulers) {exp.haulers = []}
        if(!exp.finishingUp)
        {
            let carryCapacity = 0;
            deleteDead(exp.attackers);
            deleteDead(exp.healers);
            deleteDead(exp.haulers);
            
            let target = Game.getObjectById(exp.target);
            let room = Cache.rooms[exp.targetRoom];
            let origRoom = Cache.rooms[colony.pos.roomName];
            if(origRoom && origRoom.observer)
            {
                origRoom.observer.observeRoom(exp.targetRoom);
            }

            let pickups = room ? room.lookForAt(LOOK_RESOURCES,exp.pos.x,exp.pos.y) : [];
            let pickup = false;
            if(pickups.length > 0)
            {
                pickup = pickups[0];
            }
            let ruins = room ? room.lookForAt(LOOK_RUINS,exp.pos.x,exp.pos.y) : [];
            let ruin = false;
            if(ruins.length > 0)
            {
                ruin = ruins[0];
            }

            exp.haulers.forEach((name) =>
            {
                let creep = Game.creeps[name];
                creep.wa
                carryCapacity += creep.store.getFreeCapacity();
                if(target)
                {
                    if(Math.max(Math.abs(creep.pos.x-target.pos.x),Math.abs(creep.pos.y-target.pos.y)) > 2 || creep.pos.roomName != target.pos.roomName)
                    {
                        creep.travelTo(new RoomPosition(exp.pos.x,exp.pos.y,exp.pos.roomName),{preferHighway:true});
                    }
                }
                else
                {
                    if(creep.store.getUsedCapacity() == 0)
                    {
                        if(ruin)
                        {
                            let err = creep.withdraw(ruin,ExtractContentOfStore(ruin.store)[0]);
                            switch(err)
                            {
                            case ERR_NOT_IN_RANGE:
                                creep.travelTo(ruin);
                                break;
                            case OK:
                                creep.travelTo(new RoomPosition(colony.pos.x,colony.pos.y,colony.pos.roomName));
                                break;
                            }
                        }
                        if(pickup)
                        {
                            let err = creep.pickup(pickup);
                            switch(err)
                            {
                            case ERR_NOT_IN_RANGE:
                                creep.travelTo(pickup);
                                break;
                            case OK:
                                creep.travelTo(new RoomPosition(colony.pos.x,colony.pos.y,colony.pos.roomName));
                                break;
                            }
                        }
                    }
                    else
                    {
                        creep.travelTo(new RoomPosition(colony.pos.x,colony.pos.y,colony.pos.roomName));
                    }
                }

            })

            let limit = Math.min(exp.slots,3);
            if(target)
            {
                limit = Math.min(limit,target.hits/500000);
            }
            if(room && !target)
            {
                limit = 0;
            }
            let attackindex = 0;
            exp.attackers.forEach((name) =>
            {
                let creep = Game.creeps[name];
                if(attackindex > limit)
                {
                    creep.Retire(colony.pos.roomName);
                }
                else
                {
                    creep.travelTo(new RoomPosition(exp.pos.x,exp.pos.y,exp.pos.roomName),{preferHighway:true});
                    if(target && (target.hits > 2500 || carryCapacity > exp.amount || target.Decay < 50))
                    {
                        creep.attack(target);
                    }
                }
                attackindex++;
            })
            
            let count = 0;
            exp.healers.forEach((name) =>
            {
                let creep = Game.creeps[name];
                if(count < limit && exp.attackers.length <= count)
                {
                    creep.Retire(colony.pos.roomName);
                }
                else
                {
                    if(exp.attackers.length <= count && (!target || (Math.max(Math.abs(creep.pos.x-target.pos.x),Math.abs(creep.pos.y-target.pos.y)) > 2 || creep.pos.roomName != target.pos.roomName)))
                    {
                        creep.travelTo(new RoomPosition(exp.pos.x,exp.pos.y,exp.pos.roomName),{preferHighway:true});
                    }
                    else
                    {
                        let targetname = exp.attackers[count];
                        count++;
                        let targetCreep = Game.creeps[targetname]
                        if(targetCreep)
                        {
                            let err = creep.heal(targetCreep);
                            if(err == ERR_NOT_IN_RANGE)
                            {
                                creep.travelTo(targetCreep);
                            }
                        }
                    }
                }
                })

            if(exp.healers.length < Math.min(exp.attackers.length,limit))
            {
                spawnRoleIntoList(Cache.rooms[colony.pos.roomName],exp.healers,ROLE_BANK_HEALER);
            }
            if(exp.attackers.length < limit && exp.attackers.length <= exp.healers.length)
            {
                spawnRoleIntoList(Cache.rooms[colony.pos.roomName],exp.attackers,ROLE_BANK_ATTACKER);
            }
            if(((target && target.hits < 200000) ||ruin ||pickup) && carryCapacity < exp.amount)
            {
                for(let i = colony.haulerpool.length -1;i >= 0;i--)
                {
                    let name = colony.haulerpool[i];
                    let creep = Game.creeps[name];
                    if(creep.ticksToLive > 800 && creep.store.getUsedCapacity() == 0)
                    {
                        exp.haulers.push(name);
                        colony.haulerpool.splice(i,1);
                    }
                }
                spawnRoleIntoList(Cache.rooms[colony.pos.roomName],exp.haulers,ROLE_HAULER,{},colony.haulersensus);
            }
            let threatend = false;
            room.find(FIND_TOMBSTONES).forEach((t) => {
                if(t.store.getUsedCapacity(RESOURCE_ENERGY) > 100)
                {
                    threatend = true;
                }
            })
            let inDanger = false;
            if(threatend)
            {
                room.find(FIND_CREEPS).forEach((c) =>
                {
                    if (!c.my)
                    {
                        inDanger = true;
                    }
                })
            }
            if(inDanger || (room && !(pickup || ruin || target)))
            {
                exp.finishingUp = true;
            }
        }
        else
        {    
            deleteDead(exp.attackers);
            deleteDead(exp.healers);
            deleteDead(exp.haulers);
            exp.attackers.forEach((name) =>
            {
                let creep = Game.creeps[name];
                creep.Retire(colony.pos.roomName);
            })
            exp.healers.forEach((name) =>
            {
                let creep = Game.creeps[name];
                creep.Retire(colony.pos.roomName);
            })
            exp.haulers.forEach((name) => 
            {
                colony.haulerpool.push(name)
            })
            exp.haulers = [];
            if(exp.attackers.length == 0 && exp.healers.length == 0 && exp.haulers.length == 0)
            {
                delete colony.expedition;
            }
        }
    }
}

ColonyProcessPower=function(colony)
{
    let room = Cache.rooms[colony.pos.roomName];
    if(!room) { return; }
    if(!room.powerSpawn) { return; }
    if(!room.storage) { return; }
    let target = {[RESOURCE_POWER]:0};
    if(room.powerSpawn.store.getFreeCapacity(RESOURCE_POWER) > 80)
    {
        target[RESOURCE_POWER] = 100;
    }
    ColonyRestock(colony,target,room.powerSpawn,"storage->powerSpawn",room.storage);
    if(room.storage.store.getUsedCapacity(RESOURCE_ENERGY) < POWER_PROCESS_ENERGY_LIMIT) { return; }
    room.powerSpawn.processPower();

}

ColonyBuildRamparts=function(colony)
{
    let room = Game.rooms[colony.pos.roomName];
    if(!room)
    {
        return;
    }

    if(!room.storage)
    {
        return;
    }
        
    let store = room.storage.store;

    let hasBetterThingsToDo = colony.constructionsite || false;
    if(!hasBetterThingsToDo && colony.refreshDowngrade)
    {
        hasBetterThingsToDo = true;
    }

    if(!colony.rampartbuilders) { colony.rampartbuilders = []; }

    if(colony.buildRamparts && !hasBetterThingsToDo)
    {
        if(!colony.rampartbuilders) {colony.rampartbuilders = []}
        if(store.getUsedCapacity(RESOURCE_ENERGY) < RAMPART_DEACTIVATE_LIMIT)
        {
            colony.workerpool.concat(colony.rampartbuilders);
            colony.rampartbuilders = [];
            delete colony.buildRamparts;
        }
        if(colony.rapartTarget && colony.workerpool.length > 1 && colony.workerpool[0])
        {
            colony.rampartbuilders.push(colony.workerpool.shift());
        }
        if(colony.workerpool.length == 0 && colony.rampartbuilders.length > 0)
        {
            colony.workerpool.push(colony.rampartbuilders.shift());
        }
        if(!colony.rapartTarget)
        {
            colony.rapartTarget = ColonyFindMostDamagedRampart(colony,room);
        }
        deleteDead(colony.rampartbuilders);

        let target = Game.getObjectById(colony.rapartTarget);

        colony.rampartbuilders.forEach((c) =>
        {
            let creep = Game.creeps[c];

            creep.updateHarvestState()
            if (creep.memory.harvesting) 
            {
                creep.dumbHarvest()
            }
            else
            {
                if(target)
                {
                    if(target instanceof StructureRampart)
                    {
                        creep.do('repair',target);
                    }
                    else
                    {
                        creep.do('build',target);
                    }
                }
            }
        })

        if(!target || Game.time % RAMPART_RETARGET_INTERVAL == 0)
        {
            delete colony.rapartTarget;
        }
    }
    else
    {
        if(store.getUsedCapacity(RESOURCE_ENERGY) > RAMPART_ACTIVATE_LIMIT)
        {
            colony.rampartbuilders = [];
            colony.buildRamparts = 1;
        }
        if(colony.workerpool.length == 0 && colony.rampartbuilders.length > 0)
        {
            colony.workerpool.push(colony.rampartbuilders.shift());
        }
    }
}

ColonyFindMostDamagedRampart=function(colony,room)
{
    let cramparts = room.find(FIND_MY_CONSTRUCTION_SITES,{filter:((o) => { return o.structureType == STRUCTURE_RAMPART; })});
    if(cramparts.length > 0)
    {
        return cramparts[0].id;
    }

    let ramparts = room.find(FIND_MY_STRUCTURES,{filter:((o) => { return o.structureType == STRUCTURE_RAMPART; })});
    let minhits = RAMPARTS_HITS_TO_IGNORE[colony.level];
    let lowest = false; 
    ramparts.forEach((o) =>
    {
        if(o.hits < minhits)
        {
            minhits = o.hits;
            lowest = o.id;
        }
    })
    if(lowest && minhits < RAMPART_HITS_BEFORE_NEXT_CONSTRUCTION)
    {
        return lowest;
    }

    if(colony.layout)
    {
        let buildings = DeserializeLayout(colony.layout,room.name);
        for(let i in buildings)
        {
            let b = buildings[i];
            let hasRampart = false;
            b.pos.lookFor(LOOK_STRUCTURES).forEach((s) =>
            {
                if(s.structureType == STRUCTURE_RAMPART)
                {
                    hasRampart = true;
                }
            })
            if(!hasRampart)
            {
                b.pos.createConstructionSite(STRUCTURE_RAMPART);
                break;
            }
        }
    }
    else
    {
        let done = false;
        for(let x = 0; x < 11; x++)
        {
            if(done)
            {
                break;
            }
            for(let y = 0; y < 12; y++)
            {
                if(done)
                {
                    break;
                }
                if(layout.structures[colony.level][y][x])
                {
                    let pos = new RoomPosition(x+colony.pos.x,y+colony.pos.y,colony.pos.roomName);
                    let hasRampart = false;
                    pos.lookFor(LOOK_STRUCTURES).forEach((s) =>
                    {
                        if(s.structureType == STRUCTURE_RAMPART)
                        {
                            hasRampart = true;
                        }
                    })
                    if(!hasRampart)
                    {
                        pos.createConstructionSite(STRUCTURE_RAMPART);
                        done = true;
                        break;
                    }
                }
            }
        }
    }

    return lowest;
}

FindUpgradePosition=function(colony)
{
    let room = Game.rooms[colony.pos.roomName];
    if(!room)
    {
        return;
    }

    let vis = new RoomVisual(colony.pos.roomName);

    let start = new RoomPosition(colony.pos.x + guaranteedEmpty.x,colony.pos.y + guaranteedEmpty.y,colony.pos.roomName);
    let target = room.controller.pos;

    vis.circle(start,{radius:0.4,fill:"#FF5555",opacity:1})
    vis.rect(target.x-3.5,target.y-3.5,7,7,{opacity:0.3,fill:"#AAAAAA"});

    let path = PathFinder.search(
        start,
        [{pos:target,range:3}],
        {roomCallback:avoidColonyLayout})

    if(path.incomplete)
    {
       return; 
    }

    let pos = _.last(path.path);
    vis.poly(path.path,{stroke:"#AAFFAA"});
    vis.circle(pos,{radius:0.4,fill:"#AAFFAA"})

    return pos;
}

FincUpgradeLink=function(buildings)
{
    for(let b of buildings)
    {
        if(b.structure == STRUCTURE_LINK)
        {
            return b.pos;
        }
    }
    return false;
}

FindOrCreateUpgradeLink=function(colony)
{
    if(!colony.upgradePos)
    {
        return;
    }

    if(!colony.subLayouts) 
    { 
        return; 
    }

    if(typeof colony.subLayouts["upgradeSite"] === 'undefined') 
    { 
        return; 
    }

    let buildings = DeserializeLayout(colony.subLayouts["upgradeSite"],colony.pos.roomName);

    let expectedPos = FincUpgradeLink(buildings);
    if(expectedPos)
    {
        for(let o of expectedPos.lookFor(LOOK_STRUCTURES))
        {
            if(o.structureType == STRUCTURE_LINK)
            {
                colony.upgradeLink = o.id;
                return;
            }
        }
        return;
    }

    let vis = new RoomVisual(colony.pos.roomName);

    let center = new RoomPosition(colony.upgradePos.x,colony.upgradePos.y,colony.upgradePos.roomName);
    let target = new RoomPosition(colony.pos.x + guaranteedEmpty.x,colony.pos.y + guaranteedEmpty.y,colony.pos.roomName);

    vis.circle(target,{radius:0.4,fill:"#AAFFAA"})

    let terrain = new Room.Terrain(colony.pos.roomName);

    for(let dir of ALL_DIRECTIONS)
    {
        let start = new RoomPosition(center.x + DIRECTION_OFFSET[dir][0],center.y + DIRECTION_OFFSET[dir][1],center.roomName)
        if(start.x < 2 || start.x > 47)
        {
            vis.circle(start,{fill:"#FFFF00"})
            continue;
        }
        if(start.y < 2 || start.y > 47)
        {
            vis.circle(start,{fill:"#FFFF00"})
            continue;
        }
        if(terrain.get(start.x,start.y) == TERRAIN_MASK_WALL)
        {
            vis.circle(start,{fill:"#FF0000"})
            continue;
        }

        vis.circle(start,{fill:"#00FF00"})

        buildings.push({structure:STRUCTURE_LINK,pos:start});

        colony.subLayouts["upgradeSite"] = SerializeLayout(buildings);

        break;
    }


}

ColonyMaintainUpgradeSite=function(colony)
{
    if(colony.level < 5)
    {
        return;
    }

    if(!colony.upgradePos)
    {
        colony.upgradePos = FindUpgradePosition(colony);
    }

    if(!colony.subLayouts) { colony.subLayouts = {}}
    if(!colony.subLayouts["upgradeSite"]) { colony.subLayouts["upgradeSite"] = "" }
    
    if(!colony.upgradeLink)
    {
        FindOrCreateUpgradeLink(colony);
    }
}

ColonyHauling=function(colony)
{
    let room = Game.rooms[colony.pos.roomName];
    if(!room || !room.storage)
    {
        return;
    }
    Scavange(colony);
    ColonyFulfillRequests(colony);
}

ColonyFulfillRequests=function(colony)
{    
    let room = Game.rooms[colony.pos.roomName];
    if(!room)
    {
        return;
    }

    if(!colony.requests)
    {
        return;
    }
    
    RemoveDoneRequests(colony);

    if(colony.requests.to.length == 0)
    {
        if(colony.requestFillers && colony.requestFillers.length > 0)
        {
            colony.haulerpool = colony.haulerpool.concat(colony.requestFillers);
            colony.requestFillers = [];
        }
        return;
    }

    if(!colony.requestFillers) { colony.requestFillers = [] } 
    if(colony.requestFillers.length < 1 && colony.haulerpool.length > 0)
    {
        colony.requestFillers.push(colony.haulerpool.shift());
    }
    deleteDead(colony.requestFillers);

    let predicted = {};
    
    for(let creepName of colony.requestFillers)
    {
        let creep = Game.creeps[creepName];
        predicted[creep.id] = new FakeStore(creep.store);
    }
    for(let req of colony.requests.to)
    {
        let obj = Game.getObjectById(req.id);
        predicted[req.id] = new FakeStore(obj.store);
    }
    if(room.storage)
    {
        predicted[room.storage.id] = new FakeStore(room.storage.store);
    }

    for(let creepName of colony.requestFillers)
    {
        Game.creeps[creepName].SimulateWork(predicted);
    }

    for(let creepName of colony.requestFillers)
    {
        let creep = Game.creeps[creepName];
        if(creep.HasWork())
        {
            creep.DoWork();
        }
        else
        {
            let req = ColonyFindUnfilledToRequest(colony,predicted,creep.pos);
            if(req)
            {
                if(predicted[creep.id].total > predicted[creep.id][req.resource])
                {
                    for(let r of RESOURCES_ALL)
                    {
                        let work = {action:CREEP_TRANSFER,target:creep.room.storage.id,arg1:r};
                        creep.EnqueueWork(work);
                        creep.SimulateWorkUnit(work,predicted);
                    }
                }
                if(predicted[creep.id][req.resource] < req.targetAmount - predicted[req.id][req.resource])
                {
                    if(predicted[creep.id].capacity[req.resource] - predicted[creep.id][req.resource] > 49)
                    {
                        if(predicted[room.storage.id][req.resource] > 0)
                        {
                            let work = {action:CREEP_WITHDRAW,target:creep.room.storage.id,arg1:req.resource};
                            creep.EnqueueWork(work);
                            creep.SimulateWorkUnit(work,predicted);
                        }
                    }
                }
                let work = {action:CREEP_TRANSFER,target:req.id,arg1:req.resource};
                creep.EnqueueWork(work);
                creep.SimulateWorkUnit(work,predicted);

                let lastTarget = Game.getObjectById(req.id);
                let req2 = ColonyFindUnfilledToRequest(colony,predicted,lastTarget.pos,req.resource);

                while(req2 && predicted[creep.id][req.resource] > 0)
                {
                    let work = {action:CREEP_TRANSFER,target:req2.id,arg1:req2.resource};
                    creep.EnqueueWork(work);
                    creep.SimulateWorkUnit(work,predicted);

                    lastTarget = Game.getObjectById(req2.id);
                    req2 = ColonyFindUnfilledToRequest(colony,predicted,lastTarget.pos,req2.resource);
                }
            }
        }
    }
}
    
ColonyRequestRefill=function(colony)
{
    let room = Game.rooms[colony.pos.roomName];
    let perExt = colony.level < 7 ? 50 : (colony.level == 7 ? 100 : 200);
    for(let ext of room.Structures(STRUCTURE_EXTENSION))
    {
        RequestResource(colony,ext.id,RESOURCE_ENERGY,perExt);
    }
    for(let tower of room.Structures(STRUCTURE_TOWER))
    {
        RequestResource(colony,tower.id,RESOURCE_ENERGY,TOWER_REFILL_THRESHOLD);
    }
    for(let tower of room.Structures(STRUCTURE_SPAWN))
    {
        RequestResource(colony,tower.id,RESOURCE_ENERGY,300);
    }
}