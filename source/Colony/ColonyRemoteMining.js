

let C =
{
    TAG                     :"remote_mining",

    MINING_TYPE_SOURCE      :"Source",
    MINING_TYPE_SK          :"SK",
    MINING_TYPE_MINERAL     :"Mineral",

    BODIES:
    {
        ["Source"]          :BODIES.SOURCE_REMOTE_MINER,
        ["SK"]              :BODIES.SK_REMOTE_MINER,
        ["Mineral"]         :BODIES.MINERAL_REMOTE_MINER
    },

    OUTPUT:
    {
        ["Source"]          :10,
        ["SK"]              :14,
        ["Mineral"]         :40
    },

    STATE_UNCHECKED         :"unchecked",
    STATE_SETUP             :"setup",
    STATE_MINE              :"Mine",
    STATE_BUILD             :"Build",
    STATE_WAIT_LV7          :"Wait_lv7",
    STATE_PAUSED            :"Paused",

    MINER_SPAWN_GRACE_PERIOD:10,
    REBUILD_INTERVAL:       1000
}


let Check = function(colony,roomName,blob)
{
    let room = Game.rooms[roomName];
    if(!room)
    {
        Empire.Scouting.WantsVision(roomName);
        return;
    }

    blob.sources = [];
    for(let s of room.find(FIND_SOURCES))
    {
        blob.sources.push(
            {
                id:s.id,
                pos:s.pos,
                type:room.controller ? C.MINING_TYPE_SOURCE : C.MINING_TYPE_SK
            }
        )
    }
    if(!room.controller)
    {
        for(let m of room.find(FIND_MINERALS))
        {
            blob.sources.push(
                {
                    id:m.id,
                    pos:m.pos,
                    type:C.MINING_TYPE_MINERAL
                }
            )
        }
    }
            
    blob.state = C.STATE_SETUP;
}

let Setup=function(colony,roomName,blob)
{
    let vis = new RoomVisual(roomName);
    if(_.isUndefined(blob.layout))
    {
        blob.layout = "";
    }
    if(_.isUndefined(colony.subLayouts["Remote_Roads"]))
    {
        colony.subLayouts["Remote_Roads"] = "";
    }

    let newStructures = [];

    if(!blob.income) { blob.income = 0; }
    if(!blob.expense) { blob.expense = 0; }

    for(let s of blob.sources)
    {
        if(s.setup)
        {
            continue;
        }

        if(s.type == C.MINING_TYPE_SK)
        {
            blob.isSK = true;
        }


        let pathResult = PathFinder.search(
            new RoomPosition(s.pos.x,s.pos.y,s.pos.roomName),
            [{pos:new RoomPosition(colony.pos.x,colony.pos.y,colony.pos.roomName),range:1}],
            {
                roomCallback:Colony.Planner.MatrixRoadPreferFuture
            }
        )
        if(pathResult.incomplete)
        {
            vis.poly(pathResult.path,{stroke:"#FF0000"});
        }
        else
        {
            s.pos = pathResult.path.shift();
            newStructures.push({
                structure:STRUCTURE_CONTAINER,
                pos:s.pos
            })

            vis.circle(s.pos,{fill:"#00FF00"});
            for(let p of pathResult.path)
            {
                if(p.x == 0 || p.x == 49 || p.y == 0 || p.y == 49)
                {
                    continue;
                }

                if(p.roomName == roomName)
                {
                    newStructures.push({
                        structure:STRUCTURE_ROAD,
                        pos:p
                    })
                }
                else if(p.roomName == colony.pos.roomName)
                {
                    colony.subLayouts["Remote_Roads"] += SerializeLayout([{structure:STRUCTURE_ROAD,pos:p}]);
                }
                else
                {
                    for(let c of Memory.colonies)
                    {
                        if(c.remotes[p.roomName])
                        {
                            if(_.isUndefined(c.remotes[p.roomName].layout))
                            {
                                c.remotes[p.roomName].layout = "";
                            }
                            c.remotes[p.roomName].layout += SerializeLayout([{structure:STRUCTURE_ROAD,pos:p}]);
                        }
                    }
                }
            }
            vis.poly(pathResult.path,{stroke:"#00FF00"});


            if(s.type != C.MINING_TYPE_MINERAL)
            {
                Colony.Helpers.IncrementIncome(colony,C.TAG,C.OUTPUT[s.type]);
            }



            s.distance = pathResult.path.length;
            s.miners = [];
            s.hauler = [];

            let partsNeeded = s.distance/50 * 2 * C.OUTPUT[s.type] + 3;
            blob.expense += partsNeeded * BODYPART_COST[CARRY] / (CREEP_LIFE_TIME - s.distance);
            blob.expense += partsNeeded / 2 * BODYPART_COST[MOVE] / (CREEP_LIFE_TIME - s.distance);
            switch(s.type)
            {
                case C.MINING_TYPE_SOURCE:
                    blob.expense += Helpers.Creep.BodyCost(BODIES.SOURCE_REMOTE_MINER) / (CREEP_LIFE_TIME - s.distance);
                    break;
                case C.MINING_TYPE_MINERAL:
                    blob.expense += Helpers.Creep.BodyCost(BODIES.MINERAL_REMOTE_MINER) / (CREEP_LIFE_TIME - s.distance);
                    break;
                case C.MINING_TYPE_SK:
                    blob.expense += Helpers.Creep.BodyCost(BODIES.SK_REMOTE_MINER) / (CREEP_LIFE_TIME - s.distance);
                    break;
            }

            if(s.type != C.MINING_TYPE_MINERAL)
            {
                blob.income += C.OUTPUT[s.type];
            }

            s.setup = true;
        }
    }
    if(newStructures.length > 0)
    {
        blob.layout += SerializeLayout(newStructures);
    }

    for(let s of blob.sources)
    {
        if(!s.setup)
        {
            return;
        }
    }

    blob.expense += Helpers.Creep.BodyCost([MOVE,CLAIM]) / (CREEP_CLAIM_LIFE_TIME - 50);
    blob.defenders = [];
    blob.builders = [];
    blob.claimers = [];
    blob.state = C.STATE_MINE;

    Colony.Helpers.IncrementIncome(colony,C.TAG,blob.income);
    Colony.Helpers.IncrementExpense(colony,C.TAG,blob.expense);
}

let HaulSource = function(colony,roomName,blob,s)
{
    let colonyRoom = Game.rooms[colony.pos.roomName];
    if(!colonyRoom ||! colonyRoom.storage)
    {
        return;   
    }

    if(s.storageId)
    {
        if(!Game.getObjectById(s.storageId))
        {
            delete s.storageId;
        }
    }
    if(!s.storageId)
    {
        if(Game.rooms[roomName])
        {
            for(let c of new RoomPosition(s.pos.x,s.pos.y,s.pos.roomName).lookFor(LOOK_STRUCTURES))
            {
                if(c.structureType == STRUCTURE_CONTAINER)
                {
                    s.storageId = c.id;
                    break;
                }
            }
        }
    }
    
    if(!s.storageId)
    {
        return;
    }


    let partsNeeded = s.distance/50 * 2 * C.OUTPUT[s.type];

    for(let creep of Helpers.Creep.List(s.hauler))
    {
        partsNeeded -= creep.getActiveBodyparts(CARRY);
        if(!creep.HasAtleast1TickWorthOfWork())
        {
            creep.EnqueueWork({
                action:CREEP_TRANSFER,
                target:colonyRoom.storage.id,
                arg1:RESOURCE_ENERGY
            })
            creep.EnqueueWork({
                action:CREEP_WITHDRAW,
                target:s.storageId,
                arg1:RESOURCE_ENERGY
            })
        }
        
        if(creep.HasWork())
        {
            creep.DoWork();
        }

        creep.OpportuneRenew();
    }

    if(partsNeeded > 0)
    {
        let body = BODIES.LV3_REMOTE_HAULER;
        if(colonyRoom.energyCapacityAvailable >= ENERGY_CAPACITY_AT_LEVEL[4] 
            && partsNeeded > REMOTE_HAULER_CARRY_PARTS_AT_LEVEL[3])
        {
            body = BODIES.LV4_REMOTE_HAULER;
        }
        if(colonyRoom.energyCapacityAvailable >= ENERGY_CAPACITY_AT_LEVEL[5] 
            && partsNeeded > REMOTE_HAULER_CARRY_PARTS_AT_LEVEL[4])
        {
            body = BODIES.LV5_REMOTE_HAULER;
        }
        if(colonyRoom.energyCapacityAvailable >= ENERGY_CAPACITY_AT_LEVEL[6] 
            && partsNeeded > REMOTE_HAULER_CARRY_PARTS_AT_LEVEL[5])
        {
            body = BODIES.LV6_REMOTE_HAULER;
        }
        if(colonyRoom.energyCapacityAvailable >= ENERGY_CAPACITY_AT_LEVEL[7] 
            && partsNeeded > REMOTE_HAULER_CARRY_PARTS_AT_LEVEL[6])
        {
            body = BODIES.LV7_REMOTE_HAULER;
        }

        Colony.Helpers.SpawnCreep(colony,s.hauler,body,ROLE_HAULER);
    }

}

let MineSource = function(colony,roomName,blob,s)
{
    let needReplacementMiner = true;
    for(let creep of Helpers.Creep.List(s.miners))
    {
        if(creep.ticksToLive > creep.body.length + s.distance - C.MINER_SPAWN_GRACE_PERIOD || creep.spawning)
        {
            needReplacementMiner = false;
        }
        
        if(creep.pos.x != s.pos.x || creep.pos.y != s.pos.y || creep.pos.roomName != s.pos.roomName)
        {
            creep.travelTo(new RoomPosition(s.pos.x,s.pos.y,s.pos.roomName));
        }
        else
        {
            if(s.storageId)
            {
                let container = Game.getObjectById(s.storageId);
                if(container && container.hits < container.hitsMax && (container.hits < 10000 || (
                    container.store.getUsedCapacity(RESOURCE_ENERGY) == CONTAINER_CAPACITY) &&
                    creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0))
                {
                    creep.repair(container);
                    continue;
                }
            }
            else if(creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0)
            {
                for(let cSite of creep.pos.lookFor(LOOK_CONSTRUCTION_SITES))
                {
                    creep.build(cSite);
                    continue;
                }
            }
            creep.harvest(Game.getObjectById(s.id));
        }
    }
    

    if(needReplacementMiner)
    {
        Colony.Helpers.SpawnCreep(colony,s.miners,C.BODIES[s.type], ROLE_MINER);
    }
    HaulSource(colony,roomName,blob,s);
}

let Reserve=function(colony,roomName,blob)
{
    let room = Game.rooms[roomName];
    if(!room)
    {
        return;
    }
    let needReserver = true;
    if(room.controller.reservation && room.controller.reservation.username == MY_USERNAME && room.controller.reservation.ticksToEnd > 2000)
    {
        needReserver = false;
    }

    for(let creep of Helpers.Creep.List(blob.claimers))
    {
        needReserver = false;
        if(room.controller.reservation && room.controller.reservation.username != MY_USERNAME)
        {
            creep.do(CREEP_ATTACK_CONTROLLER,room.controller);
        }
        else
        {
            creep.do(CREEP_RESERVE_CONTROLLER,room.controller);
        }

        if(Game.time % SIGN_CONTROLLER_INTERVAL == 0)
        {
            creep[CREEP_SIGN_CONTROLLER](room.controller,REMOTE_MINING_SIGN);
        }
    }
    let colonyRoom = Game.rooms[colony.pos.roomName];
    
    if(needReserver && colonyRoom)
    {
        let body = BODIES.LV3_CLAIMER;
        if(colonyRoom.energyCapacityAvailable >= ENERGY_CAPACITY_AT_LEVEL[4])
        {
            body = BODIES.LV4_CLAIMER;
        }
        if(colonyRoom.energyCapacityAvailable >= ENERGY_CAPACITY_AT_LEVEL[6])
        {
            body = BODIES.LV6_CLAIMER;
        }
        if(colonyRoom.energyCapacityAvailable >= ENERGY_CAPACITY_AT_LEVEL[7])
        {
            body = BODIES.LV7_CLAIMER;
        }
        Colony.Helpers.SpawnCreep(colony,blob.claimers,body,ROLE_CLAIMER);
    }
}

let Attack = function(colony,roomName,blob)
{

    if(!blob.attackers) { blob.attackers = []}
    let needAttacker = false;
    if(blob.hasInvader)
    {
        needAttacker = true;
    }
    let room = Game.rooms[roomName];
    if(room)
    {
        let target = _.find(room.find(FIND_HOSTILE_CREEPS),(s) => { return s.getActiveBodyparts(ATTACK) > 0 || s.getActiveBodyparts(RANGED_ATTACK) > 0; })
        
        if(target)
        {
            for(let creep of Helpers.Creep.List(blob.attackers))
            {
                needAttacker = false;
                if(creep.pos.lookFor(LOOK_STRUCTURES).length > 0)
                {
                    creep.do(CREEP_ATTACK,target);
                }
                else
                {
                    creep[CREEP_HEAL](creep);
                    creep.travelTo(target);
                }
            }
        }
        else
        {
            let target = room.find(FIND_HOSTILE_CREEPS)[0];
            if(target)
            {
                for(let creep of Helpers.Creep.List(blob.attackers))
                {
                    needAttacker = false;
                    if(!creep.pos.isNearTo(target) && creep.getActiveBodyparts(ATTACK) > 0)
                    {
                        creep.heal(creep);
                        creep.travelTo(target);
                    }
                    else
                    {
                        creep[CREEP_ATTACK](target);
                        creep.travelTo(target);
                    }
                }
            }
            else
            {
                let targets = room.find(FIND_MY_CREEPS,{filter:(c) => { return c.hits < c.hitsMax; }});
                if(targets.length > 0)
                {
                    for(let creep of Helpers.Creep.List(blob.attackers))
                    {
                        needAttacker = false;
                        target = creep.pos.findClosestByRange(targets) || targets[0];
                        if(creep.pos.inRangeTo(target,1))
                        {
                            creep[CREEP_HEAL](target);
                            creep.travelTo(target.pos);
                        }
                        else
                        {
                            creep.travelTo(target.pos);
                            if(creep.pos.inRangeTo(target,3))
                            {
                                creep[CREEP_RANGED_HEAL](target);
                            }
                        }
                    }
                }
                else
                {
                    for(let creep of Helpers.Creep.List(blob.attackers))
                    {
                        creep.Retire(colony.pos.roomName);
                    }
                }
            }
        }
    }
    else
    {
        for(let creep of Helpers.Creep.List(blob.attackers))
        {
            needAttacker = false;
            creep.GoToRoom(roomName);
        }
    }
    if(needAttacker)
    {
        let colonyRoom = Game.rooms[colony.pos.roomName];
        if(colonyRoom)
        {
            let body = BODIES.LV3_REMOTE_ATTACKER;
            if(colonyRoom.energyCapacityAvailable >= ENERGY_CAPACITY_AT_LEVEL[4])
            {
                body = BODIES.LV4_REMOTE_ATTACKER;
            }
            Colony.Helpers.SpawnCreep(colony,blob.attackers,body,ROLE_ATTACKER);
        }
    }
}

let Defend = function(colony,roomName,blob)
{
    if(!blob.defenders) { blob.defenders = []}
    let needPopper = false;
    if(blob.hasCore)
    {
        needPopper = true;
    }
    let room = Game.rooms[roomName];
    if(room)
    {
        let target = _.find(room.find(FIND_HOSTILE_STRUCTURES),(s) => { return !ENEMY_STRUCTURES_WITH_LOOT.includes(s.structureType); })
        if(target)
        {
            for(let creep of Helpers.Creep.List(blob.defenders))
            {
                needPopper = false;
                creep.do(CREEP_ATTACK,target);
            }
        }
        else
        {
            for(let creep of Helpers.Creep.List(blob.defenders))
            {
                needPopper = false;
                creep.Retire(colony.pos.roomName);
            }
        }
    }
    else
    {
        for(let creep of Helpers.Creep.List(blob.defenders))
        {
            needPopper = false;
            creep.GoToRoom(roomName);
        }
    }


    if(needPopper)
    {
        let colonyRoom = Game.rooms[colony.pos.roomName];
        if(colonyRoom)
        {
            let body = BODIES.LV3_REMOTE_DEFENDER;
            Colony.Helpers.SpawnCreep(colony,blob.defenders,body,ROLE_ATTACKER);
        }
    }
}

let Mine = function(colony,roomName,blob)
{
    if(blob.isSK && colony.level < 7)
    {
        blob.state = C.STATE_WAIT_LV7;
        Colony.Helpers.DecrementIncome(colony,C.TAG,blob.income);
        Colony.Helpers.DecrementExpense(colony,C.TAG,blob.expense);
        return;
    }
    if(!blob.isSK)
    {
        Reserve(colony,roomName,blob);
    }

    for(let s of blob.sources)
    {
        MineSource(colony,roomName,blob,s);
    }

    if(Game.time - (blob.lastBuilt || 0) > C.REBUILD_INTERVAL)
    {
        blob.state = C.STATE_BUILD;
    }

    let room = Game.rooms[roomName];
    if(room)
    {
        blob.hasCore = false;
        for(let s of room.find(FIND_HOSTILE_STRUCTURES))
        {
            if(s.owner.username == INVADER_USERNAME)
            {
                blob.hasCore = true;
                if(blob.isSK)
                {
                    let timer = 0;
                    for(let e of s.effects)
                    {
                        if(e.effect == EFFECT_COLLAPSE_TIMER)
                        {
                            timer = e.ticksRemaining;
                        }
                        else if(e.effect == EFFECT_INVULNERABILITY)
                        {
                            timer = e.ticksRemaining + STRONGHOLD_DECAY_TICKS;
                        }
                    }
                    blob.state = C.STATE_PAUSED;
                    blob.pauseUntil = Game.time + timer * 1.1;
                }
            }
        }

        blob.hasInvader = false;
        for(let c of room.find(FIND_HOSTILE_CREEPS))
        {
            if(c.owner.username == INVADER_USERNAME)
            {
                blob.hasInvader = true;
            }
        }
    }
    Defend(colony,roomName,blob);
    Attack(colony,roomName,blob);
}

let EnqueueBuildWork = function(room, creep, target)
{
    let energy = creep.store.getUsedCapacity(RESOURCE_ENERGY);
    if(energy > 0)
    {
        if(target instanceof Structure)
        {
            let power = creep.getActiveBodyparts(WORK) * REPAIR_POWER;
            let cost = power * REPAIR_COST;
            let work = 
            {
                action:CREEP_REPAIR,
                target:target.id
            }
            let missing = target.hitsMax - target.hits;
            while(energy > 0 && missing > 0 && !creep.OverWorked())
            {
                creep.EnqueueWork(work);
                energy -= cost;
                missing -= power;
            }
        }
        else
        {
            let cost = creep.getActiveBodyparts(WORK) * BUILD_POWER;
            let work = 
            {
                action:CREEP_BUILD,
                target:target.id
            }
            while(energy > 0 && !creep.OverWorked())
            {
                creep.EnqueueWork(work);
                energy -= cost;
            }
        }
    }
    else
    {
        for(let container of _.sortBy(room.Structures(STRUCTURE_CONTAINER), s => { return s.pos.getRangeTo(creep.pos); }))
        {
            if(container.store.getUsedCapacity(RESOURCE_ENERGY) > 0)
            {
                creep.EnqueueWork({action:CREEP_WITHDRAW,target:container.id,arg1:RESOURCE_ENERGY});
                return;
            }
        }
        for(let dropped of _.sortBy(room.find(FIND_DROPPED_RESOURCES),d => { return d.pos.getRangeTo(creep.pos); }))
        {
            if(dropped.resourceType == RESOURCE_ENERGY)
            {
                creep.EnqueueWork({action:CREEP_PICKUP,target:dropped.id});
                return;
            }
        }
    }
}

let PlaceSites = function(colony,roomName,blob)
{
    let room = Game.rooms[roomName];
    if(!room)
    {
        return true;
    }
    if(blob.layout)
    {
        let toIgnore = blob.buildProgress || 0;
        for(let b of DeserializeLayout(blob.layout,roomName))
        {
            if(toIgnore > 0)
            {
                toIgnore--;
                continue;
            }

            let has = false;
            for(let s of b.pos.lookFor(LOOK_STRUCTURES))
            {
                if(s.structureType == b.structure)
                {
                    if(s.hits < s.hitsMax)
                    {
                        return s;
                    }
                    has = true;
                    break;
                }
                else
                {
                    if(OBSTACLE_OBJECT_TYPES.includes(s.structureType))
                    {
                        if(colony.disTargets.indexOf(s.id) === -1) {
                            colony.disTargets.push(s.id);
                        }
                    }
                }
            }
            if(!has)
            {
                for(let s of b.pos.lookFor(LOOK_CONSTRUCTION_SITES))
                {
                    if(s.structureType == b.structure)
                    {
                        return s;
                    }
                }
                b.pos.createConstructionSite(b.structure);
                return true;
            }
            blob.buildProgress++;
        }
    }
    return false;
}

let Build = function(colony,roomName,blob)
{
    Mine(colony,roomName,blob);
    let room = Game.rooms[roomName];
    if(room)
    {
        let targetOrWait = PlaceSites(colony,roomName,blob);
        if(typeof targetOrWait === 'boolean')
        {
            if(targetOrWait)
            {
                return;
            }
            colony.workerpool = colony.workerpool.concat(blob.builders);
            blob.builders = [];
            blob.state = C.STATE_MINE;
            blob.lastBuilt = Game.time;
            blob.buildProgress = 0;
            return;
        }
        let hasBuilder = false;
        for(let creep of Helpers.Creep.List(blob.builders))
        {
            hasBuilder = true;
            if(!creep.HasAtleast1TickWorthOfWork())
            {
                EnqueueBuildWork(room, creep, targetOrWait);
            }
            if(creep.HasWork())
            {
                creep.DoWork();
            }
        }
        if(!hasBuilder && colony.workerpool.length > 0)
        {
            blob.builders.push(colony.workerpool.shift());
        }
    }
}

let Pause = function(colony,roomName,blob)
{
    if(Game.time > blob.pauseUntil)
    {
        blob.state = C.STATE_MINE;
    }
}

let Draw=function(colony,roomName,blob)
{
    if(!Helpers.Externals.IsRoomVisible(roomName))
    {
        return;
    }

    let vis = new RoomVisual(roomName);

    if(!blob.builders) {blob.builders = []}
    for(let creep of Helpers.Creep.List(blob.builders))
    {
        creep.DrawWork(vis,{baseRoom:roomName});
    }

    if(blob.layout && Game.rooms[roomName])
    {
        let buildings = DeserializeLayout(blob.layout,roomName);
        vis.layout(buildings);
    }
}

module.exports.Run=function(colony)
{
    if(!colony.remotes)
    {
        colony.remotes = {};
        for(let r of Object.values(Game.map.describeExits(colony.pos.roomName)))
        {
            colony.remotes[r] = 
            {
                state:C.STATE_UNCHECKED
            }
        }
    }
    let active = 0;

    for(let room in colony.remotes)
    {
        let blob = colony.remotes[room];
        switch(blob.state)
        {
            case C.STATE_UNCHECKED:
                Check(colony,room,blob);
                break;
            case C.STATE_SETUP:
                Setup(colony,room,blob);
                break;
            case C.STATE_MINE:
                Mine(colony,room,blob);
                active++;
                break;
            case C.STATE_BUILD:
                Build(colony,room,blob);
                active++;
                break;
            case C.STATE_PAUSED:
                Pause(colony,room,blob);
                active++;
                break;
        }

        Draw(colony,room,blob);
    }

    if(colony.level < 7 && active > 2)
    {
        let active = [];
        for(let room in colony.remotes)
        {
            let blob = colony.remotes[room];
            switch(blob.state)
            {
                case C.STATE_MINE:
                case C.STATE_BUILD:
                case C.STATE_PAUSED:
                    active.push(room);
                    break;
            }
        }

        active = _.sortBy(active,(room) =>
        {
            let score = 0;
            for(let s of colony.remotes[room].sources)
            {
                score += 1/s.distance;
            }
            console.log(room + ": " + score);
            return score;
        }).reverse();

        console.log("sorted: " + JSON.stringify(active))
        while(active.length > 2)
        {
            let r = active.pop();
            colony.remotes[r].state = C.STATE_WAIT_LV7;
            Colony.Helpers.DecrementIncome(colony,C.TAG,colony.remotes[r].income);
            Colony.Helpers.DecrementExpense(colony,C.TAG,colony.remotes[r].expense);
        }
    }
}