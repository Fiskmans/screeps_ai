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
                creep.travelTo(new RoomPosition(25,25,colony.pos.roomName))
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
    
    if (colony.workerpool.length < target)
    {
        spawnRoleIntoList(Game.rooms[colony.pos.roomName],colony.workerpool,ROLE_WORKER)
        if (Game.rooms[colony.pos.roomName].spawns().length == 0) 
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

SetupLowTierStorage=function(colony)
{
    let room = Game.rooms[colony.pos.roomName]
    if (!room.storage) 
    {
        room.storage = room.containers()[0];
    }
}

BasicHaulersAndMiners=function(colony)
{
    let room = Game.rooms[colony.pos.roomName]
    if (room && room.storage) 
    {
        if(!colony.haulerpool) {colony.haulerpool = []}
        if (colony.haulerpool.length < 2) 
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
        if (prio.pos.createConstructionSite(prio.struct) == OK)
        {
            console.log("Starting work on " + prio.struct + " at " + prio.pos.x + " " + prio.pos.y + " " + prio.pos.roomName)
            colony.constructionsite = prio.pos
        }
    }
}

ColonyRetargetSelling=function(colony)
{
    if(!colony.selling) {colony.selling = []};
    let room = Game.rooms[colony.pos.roomName];
    if(!room) { return; }
    let terminal = room.terminal;
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

ColonyRestock=function(colony,stockto,target,rolename,source)
{
    if(!colony.restockers) {colony.restockers = {}};
    let missing = {}
    let store = target.store;
    for(let res in stockto)
    {
        if(store.getUsedCapacity(res) < stockto[res])
        {
            missing[res] = stockto[res] - store.getUsedCapacity(res);
        }
    }
    if(Object.keys(missing).length > 0)
    {
        if(colony.restockers[rolename])
        {
            let creep = Game.creeps[colony.restockers[rolename]];
            if(creep)
            {
                if(creep.store.getUsedCapacity() > 0)
                {
                    let res = false;
                    RESOURCES_ALL.forEach((r) => {if(creep.store.getUsedCapacity(r) > 0) {res = r}}) 
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
        if(prices[ORDER_BUY][res].price > MinimumSellingPrice[res])
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