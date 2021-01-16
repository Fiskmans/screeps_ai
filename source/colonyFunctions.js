

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

    RequestResource(colony,colony.sendLink,RESOURCE_ENERGY,600,REQUEST_PRIORITY_PROGRESS);

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
    let room = Game.rooms[colony.pos.roomName];
    if(!colony.workerpool) {colony.workerpool = []};
    if(!colony.workersensus) {colony.workersensus = []};
    deleteDead(colony.workersensus);
    
    let target = TARGET_WORKER_COUNT[colony.level];
    let count = colony.workersensus.length;

    if(room.storage && room.storage.store.getUsedCapacity(RESOURCE_ENERGY) > COLONY_EXTRA_WORKER_THRESHOLD)
    {
        target++;
    }

    let vis = new RoomVisual(colony.pos.roomName);
    vis.text(count + " / " + target,25,3);

    if (count < target)
    {
        let list = [];
        if(!InterShard.Transport.Adopt(list,ROLE_WORKER))
        {
            spawnRoleIntoList(room,colony.workerpool,ROLE_WORKER,{},colony.workersensus);
            if (room.spawns.length == 0) 
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
                    InterShard.Transport.Request(ROLE_WORKER);
                }
            }
        }
        else
        {
            colony.workersensus = colony.workersensus.concat(list);
            colony.workerpool = colony.workerpool.concat(list);
        }
    }
}

ColonyMining=function(colony)
{
    let room = Game.rooms[colony.pos.roomName]
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
            spawnRoleIntoList(Game.rooms[colony.pos.roomName],colony.haulerpool,ROLE_HAULER,{},colony.haulersensus)
        }
        MaintainMiningSpots(colony)
    }
}

FindLinkInColonyLayout=function(colony,blackList)
{
    let room = Game.rooms[colony.pos.roomName]
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
        for(let r of room.lookAt(colony.pos.x + 6,colony.pos.y + 5))
        {
            if (r.type == 'structure' && r.structure instanceof StructureLink && !blackList.includes(r.structure.id)) 
            {
                return r.structure.id;
            }
        }
        for(let r of room.lookAt(colony.pos.x + 4,colony.pos.y + 5))
        {
            if (r.type == 'structure' && r.structure instanceof StructureLink && !blackList.includes(r.structure.id)) 
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

    if(colony.recievelink && colony.sendLink)
    {
        if(colony.recievelink == colony.sendLink)
        {
            delete colony.recievelink;
        }
    }

    if (!colony.sendLink) 
    {
        if(colony.recievelink)
        {
            colony.sendLink = colony.recievelink;
            delete colony.recievelink;
        }
        else
        {
            let id = FindLinkInColonyLayout(colony,blacklist);
            if(id)
            {
                colony.sendLink = id;
                console.log("colony " + colony.pos.roomName + " found send link with id: " + id);
            }
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
    if(Game.time % COLONY_CHECK_BUILDINGS_INTERVAL != 0)
    {
        return;
    }

    if(Game.shard.name == "shard3" && Memory.mainColony == colony.pos.roomName)
    {
        let room = Game.rooms[colony.pos.roomName];
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
    let room = Game.rooms[colony.pos.roomName];
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
    for(let b of layout)
    {
        result +=   
        STRUCTURE_CHAR[b.structure] + 
        BAKED_COORD["Encode"][b.pos.x] + 
        BAKED_COORD["Encode"][b.pos.y];
    }
    return result;
}

BuildMissing=function(colony,buildings)
{
    let room = Game.rooms[colony.pos.roomName];
    if(!room)
    {
        return;
    }

    for(let b of buildings)
    {
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
    let room = Game.rooms[colony.pos.roomName];
    if(!room)
    {
        return;
    }

    if(!colony.layout) { colony.layout = ""; }

    let mainBuildings = DeserializeLayout(colony.layout,colony.pos.roomName);

    if(BuildMissing(colony,mainBuildings))
    {
        return;
    }

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

    MultiRequestResource(colony,target,terminal.id,REQUEST_PRIORITY_AUXILIARY)

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

ColonyCrafting=function(colony)
{
    let room = Game.rooms[colony.pos.roomName];
    if(!room || !room.factory) { return; }
    if(!colony.crafting) { return; }

    RequestEmptying(colony,room.factory.id,colony.crafting,1,REQUEST_PRIORITY_AUXILIARY);

    let wants = {};
    for(let res in COMMODITIES[colony.crafting].components)
    {
        wants[res] = COMMODITIES[colony.crafting].components[res] * FACTORY_NUMBER_OF_CRAFTS_TO_STOCK
    }
    if(room.storage)
    {
        if(wants[RESOURCE_ENERGY] && wants[RESOURCE_ENERGY] > 0 && room.storage.store.getUsedCapacity(RESOURCE_ENERGY) < FACTORY_ENERGY_TO_LEAVE_IN_STORAGE)
        {
            delete wants[RESOURCE_ENERGY];
        }
        MultiRequestResource(colony,wants,room.factory.id,REQUEST_PRIORITY_AUXILIARY);
    }
    
    room.factory.produce(colony.crafting);
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
            let room = Game.rooms[exp.targetRoom];
            let origRoom = Game.rooms[colony.pos.roomName];
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
                spawnRoleIntoList(Game.rooms[colony.pos.roomName],exp.healers,ROLE_BANK_HEALER);
            }
            if(exp.attackers.length < limit && exp.attackers.length <= exp.healers.length)
            {
                spawnRoleIntoList(Game.rooms[colony.pos.roomName],exp.attackers,ROLE_BANK_ATTACKER);
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
                spawnRoleIntoList(Game.rooms[colony.pos.roomName],exp.haulers,ROLE_HAULER,{},colony.haulersensus);
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
    let room = Game.rooms[colony.pos.roomName];
    if(!room) { return; }
    if(!room.storage) { return; }

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

FindUpgradeLink=function(buildings)
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

    if(colony.upgradeLink)
    {
        return;
    }
    
    let buildings = DeserializeLayout(colony.subLayouts["upgradeSite"],colony.pos.roomName);
    let expectedPos = FindUpgradeLink(buildings);
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

let EnqueueWork = function(colony)
{
    let room = Game.rooms[colony.pos.roomName];
    for(let creepName of colony.haulerpool)
    {
        let creep = Game.creeps[creepName];
        if(!creep.HasAtleast1TickWorthOfWork())
        {
            let predicted = {};
            MakeFakeStores(colony,predicted);
            for(let creepName of colony.haulerpool)
            {
                Game.creeps[creepName].SimulateWork(predicted);
            }
            for(let creepName of colony.haulerpool)
            {
                let creep = Game.creeps[creepName];
                if(!creep.HasAtleast1TickWorthOfWork())
                {
                    EnqueueToRequests(colony,room.storage.id,creep,predicted);
                }
                if(!creep.HasAtleast1TickWorthOfWork())
                {
                    EnqueueFromRequests(colony,room.storage.id,creep,predicted);
                }
    
                if(creep.memory._workQueue && creep.memory._workQueue.length > 200)
                {
                    console.log("infloop detected");
                    delete creep.memory._workQueue;
                }
            }
            break;
        }
    }
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
    deleteDead(colony.haulerpool);
    EnqueueWork(colony);    

    for(let creepName of colony.haulerpool)
    {
        let creep = Game.creeps[creepName];
        if(creep.HasWork())
        {
            creep.DoWork();
        }
    }
}
    
ColonyRequestRefill=function(colony)
{
    if(Game.time % REFILL_CHECK_INTERVAL == 0)
    {
        return;
    }

    let room = Game.rooms[colony.pos.roomName];
    let perExt = colony.level < 7 ? 50 : (colony.level == 7 ? 100 : 200);
    for(let ext of room.Structures(STRUCTURE_EXTENSION))
    {
        RequestResource(colony,ext.id,RESOURCE_ENERGY,perExt,REQUEST_PRIORITY_FUNCTION);
    }
    for(let tower of room.Structures(STRUCTURE_TOWER))
    {
        RequestResource(colony,tower.id,RESOURCE_ENERGY,TOWER_REFILL_THRESHOLD,REQUEST_PRIORITY_FUNCTION);
    }
    for(let tower of room.Structures(STRUCTURE_SPAWN))
    {
        RequestResource(colony,tower.id,RESOURCE_ENERGY,300,REQUEST_PRIORITY_FUNCTION);
    }
    if(room.powerSpawn)
    {
        RequestResource(colony,room.powerSpawn.id,RESOURCE_ENERGY,4000,REQUEST_PRIORITY_AUXILIARY)
        RequestResource(colony,room.powerSpawn.id,RESOURCE_POWER,80,REQUEST_PRIORITY_AUXILIARY)
    }

}


ColonyEmptyMines=function(colony)
{
    if(colony.recievelink)
    {
        RequestEmptying(colony,colony.recievelink,RESOURCE_ENERGY,100,REQUEST_PRIORITY_FUNCTION);
    }

    for(let spot of colony.miningSpots)
    {
        if(!spot.container && spot.digPos)
        {
            for(let t of new RoomPosition(spot.digPos.x,spot.digPos.y,spot.digPos.roomName).lookFor(LOOK_STRUCTURES))
            {
                if(t.structureType == STRUCTURE_CONTAINER)
                {
                    spot.container = t.id;
                    break;
                }
            }
        }
        
        if(spot.container)
        {
            let obj = Game.getObjectById(spot.container);
            if(obj)
            {
                let resources = ExtractContentOfStore(obj.store);
                if(resources.length == 0)
                {
                    //Noop
                } 
                else if(resources.length == 1)
                {
                    RequestEmptying(colony,spot.container,resources[0],MINING_CONTAINER_EMPTY_THRESHOLD,REQUEST_PRIORITY_FUNCTION);
                }   
                else
                {
                    for(let r of resources)
                    {
                        RequestEmptying(colony,spot.container,r,1,REQUEST_PRIORITY_PROGRESS);
                    }
                }
            }
            else
            {
                delete spot.container;
            }
        }
    }
}

ColonyTerminalTraffic=function(colony)
{
    let room = Game.rooms[colony.pos.roomName];
    if(!room) { return; }
    if(!room.storage) { return; }
    if(!room.terminal) { return; }
    
    RequestEmptying(colony,room.terminal.id,RESOURCE_ENERGY,TERMINAL_ENERGY_MAX,REQUEST_PRIORITY_AUXILIARY);
    RequestResource(colony,room.terminal.id,RESOURCE_ENERGY,TERMINAL_ENERGY_MIN,REQUEST_PRIORITY_AUXILIARY);

    let surplus = [];
    for(let res of ExtractContentOfStore(room.storage.store))
    {
        let amount   = room.storage.store[res]  || 0;
            amount  += room.terminal.store[res] || 0;
        for(let creep of room.find(FIND_MY_CREEPS))
        {
            amount += creep.store[res]  || 0 
        }

        if(res != RESOURCE_ENERGY && amount > COLONY_SURPLUS_THRESHOLD)
        {
            surplus.push(res);
        }
    }

    for(let res of ExtractContentOfStore(room.terminal.store))
    {
        if(res != RESOURCE_ENERGY && !surplus.includes(res))
        {
            RequestEmptying(colony,room.terminal.id,res,1,REQUEST_PRIORITY_AUXILIARY);
        }
    }

    for(let res of surplus)
    {
        RequestResource(colony,room.terminal.id,res,TERMINAL_EXPORT_AMOUNT,REQUEST_PRIORITY_AUXILIARY);

        if(!room.terminal.cooldown)
        {
            for(let col of Memory.colonies)
            {
                if(col.pos.roomName != colony.pos.roomName)
                {
                    let otherRoom = Game.rooms[col.pos.roomName];
                    if(!otherRoom) { break; }
                    if(!otherRoom.storage) { break; }
                    if(!otherRoom.terminal) { break; }

                    let amount   = room.storage.store[res]  || 0;
                        amount  += room.terminal.store[res] || 0;
                    for(let creep of room.find(FIND_MY_CREEPS))
                    {
                        amount += creep.store[res]  || 0 
                    }

                    let otherAmount   = otherRoom.storage.store[res]  || 0;
                        otherAmount  += otherRoom.terminal.store[res] || 0;
                    for(let creep of otherRoom.find(FIND_MY_CREEPS))
                    {
                        amount += creep.store[res]  || 0 
                    }
            
                    if(otherAmount < COLONY_PUSH_RESOURCE_THRESHOLD)
                    {
                        if(room.terminal.store[res] > 0 && room.terminal.store[RESOURCE_ENERGY] > 0)
                        {
                            let amountToSend = Math.min(room.terminal.store[res],
                                room.terminal.store[RESOURCE_ENERGY],
                                COLONY_PUSH_RESOURCE_THRESHOLD - otherAmount,
                                amount - COLONY_SURPLUS_THRESHOLD);
                            room.terminal.send(res,amountToSend,col.pos.roomName);
                        }
                    }
                }
            }
        }
    }
}