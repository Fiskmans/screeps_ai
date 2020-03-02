colonyRetargetFactory=function(room,colony)
{
    
}

ColonyWorkerBehaviour=function(colony)
{
    if(!colony.constructionsite || Game.rooms[colony.pos.roomName].controller.ticksToDowngrade < 1000)
    {
        ColonyIdleWorkers(colony)
        ColonyFindBuildingWork(colony)
    }
    else
    {
        colonyConstruct(colony)
    }
}

ColonyIdleWorkers=function(colony)
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

ColonyRespawnWorkers=function(colony)
{
    
    let target = TARGET_WORKER_COUNT[colony.level]
    let count = colony.workerpool.length + colony.refillers.length;
    colony.miningSpots.forEach((m) => {if(m.worker) {count++ }})
    colony.highways.forEach((m) => {if(m.worker) {count++ }})

    let vis = new RoomVisual(colony.pos.roomName);
    vis.text(count + " / " + target,25,3);

    if (count < target)
    {
        spawnRoleIntoList(Game.rooms[colony.pos.roomName],colony.workerpool,ROLE_WORKER)
        if (Game.rooms[colony.pos.roomName].spawns.length == 0) 
        {
            let closest = FindClosestColony(colony.pos.roomName);
            if (closest && closest.workerpool.length > 1) 
            {
                colony.workerpool.push(closest.workerpool.shift())
                console.log(colony.pos.roomName + " stole a worker from " + closest.pos.roomName)
            }
            else
            {
                //Panic
            }
        }
    }
}

BasicHaulersAndMiners=function(colony)
{
    let room = Game.rooms[colony.pos.roomName]
    if (room && room.storage) 
    {
        if(!colony.haulerpool) {colony.haulerpool = []}
        let limit = 2;
        limit += Math.max(0,colony.miningSpots.length-3);
        if (colony.haulerpool.length < limit) 
        {
            spawnRoleIntoList(Game.rooms[colony.pos.roomName],colony.haulerpool,ROLE_HAULER)
        }
        Scavange(colony)
        MaintainMiningSpots(colony)
    }
}

FindRecLink=function(colony)
{
    if (!colony.recievelink) 
    {
        let room = Game.rooms[colony.pos.roomName]
        let result = room.lookAt(colony.pos.x + 6,colony.pos.y + 5)
        result.forEach((r) => {
            if (r.type == 'structure' && r.structure instanceof StructureLink) 
            {
                console.log("colony found rec link with id: " +  r.structure.id);
                colony.recievelink = r.structure.id;
            }
        })
    }
}

StartMining=function(colony)
{
    if (colony.miningSpots && colony.miningSpots.length == 0) 
    {
        let room = Game.rooms[colony.pos.roomName];
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
    let room = Game.rooms[colony.pos.roomName];
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
    let room = Game.rooms[colony.pos.roomName];
    var missing = findMissing(colony.pos.x,colony.pos.y,colony.pos.roomName,layout.structures[room.controller.level])
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
        else if(err = ERR_RCL_NOT_ENOUGH)
        {
            if(colony.disTargets.length == 0)
            {
                let wrong = ColonyFindMisplaced(colony,prio.struct,layout.structures[room.controller.level]);
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
        else
        {
            console.log("Could not create constructionsite got unkown error: " + err);
        }
    }
}

ColonyRetargetSelling=function(colony)
{
    if(Game.time % COLONY_RETARGET_SELLING_INTERVAL != 0) { return; }
    if(!colony.selling) {colony.selling = []};
    let room = Game.rooms[colony.pos.roomName];
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
        return false;
    })
}

ColonyRetargetFactory=function(colony)
{
    if(Game.time % COLONY_RETARGET_FACTORY_INTERVAL != 0) { return; }
    let room = Game.rooms[colony.pos.roomName];
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
                    if(creep.transfer(target,res) == ERR_NOT_IN_RANGE)
                    {
                        creep.travelTo(target)
                    }
                }
                else
                {
                    let res = Object.keys(missing)[0];
                    creep.say("⬇️ "+ res + " ⬇️");
                    if(creep.withdraw(source, res) == ERR_NOT_IN_RANGE)
                    {
                        creep.travelTo(source)
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
                console.log("Sold " + amount + " " + res + " from " + colony.pos.roomName + " for " + order.price + " credits/unit total <font color=\"green\">" + (amount * order.price) + "<font>");
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
    let room = Game.rooms[colony.pos.roomName]
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
    let room = Game.rooms[colony.pos.roomName];
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
    let room = Game.rooms[colony.pos.roomName];
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