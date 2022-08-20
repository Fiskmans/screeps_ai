const C = {
    STATE_NEW               :"new",
    STATE_COLLECTING        :"collecting",

    HEALER                  :
    {
        BODY                    :[MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL],
        RESOURCES               :{
            [RESOURCE_ENERGY]                           : 11500,
            [RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE]      : 300,
            [RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE]     : 1200
        }
    },

    ATTACKER                :
    {
        BODY                    :[MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK],
        RESOURCES               :{
            [RESOURCE_ENERGY]                           : 6000,
            [RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE]      : 300,
            [RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE]     : 1200
        }
    },

    BATTLE_MAX_SQUADS       : 10,

    BATTLE_RESOURCES        :{
        [RESOURCE_ENERGY]                           : 11500 * 10    + 6000 * 10,
        [RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE]      : 300 * 10      + 300 * 10,
        [RESOURCE_CATALYZED_ZYNTHIUM_ACID]          : 900 * 10,
        [RESOURCE_CATALYZED_KEANIUM_ALKALIDE]       : 300 * 10,
        [RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE]     : 1200 * 10
    },

    VICTORY_TARGETS         :[STRUCTURE_SPAWN, STRUCTURE_TOWER]
};


let FindSponsor = function(roomName, battle)
{
    if(battle.sponsor) { return true; }

    let closest = false;
    let distance = 1e10;
    for(let colony of Object.values(Memory.colonies))
    {
        if(colony.level != RCL_MAX) { continue; }
        let dist = Game.map.getRoomLinearDistance(roomName, colony.pos.roomName);
        if(dist < distance)
        {
            distance = dist;
            closest = colony.pos.roomName;
        }
    }
    if(closest)
    {
        battle.sponsor = closest;
    }

    return !!battle.sponsor;
}

let AllocateResources = function(battle)
{
    if(!battle.resourceAllocation)
    {
        battle.resourceAllocation = Storage.Reservations.Allocate(C.BATTLE_RESOURCES, battle.sponsor);
    }

    return !!battle.resourceAllocation;
}

module.exports.StartBattle = function(roomName)
{
    Memory.battles[roomName] = 
    {
        state:C.STATE_NEW,
        started:Game.time,
        lastStateChange:Game.time
    }
}

module.exports.NewBattle = function(roomName, battle)
{
    console.log("new battle");

    if(!FindSponsor(roomName, battle)) { return;}
    if(!AllocateResources(battle)) { return; }

    battle.state = C.STATE_COLLECTING;
}

module.exports.RunAll = function()
{
    for(let roomName in Memory.battles)
    {
        module.exports.Run(roomName, Memory.battles[roomName]);
    }
}

module.exports.Run = function(roomName, battle)
{
    switch(battle.state)
    {
        case C.STATE_NEW:
            module.exports.NewBattle(roomName, battle);
            break;
    }
}

module.exports.BattleVisuals = function(roomName, battle)
{
    let vis = new RoomVisual(roomName);
    let reservation = Memory.storage.reservations[battle.resourceAllocation];
    vis.text(JSON.stringify(reservation),25,25);
}

module.exports.DoUI = function()
{
    for(let roomName in Memory.battles)
    {
        if(Helpers.Externals.IsRoomVisible(roomName))
        {
            module.exports.BattleVisuals(roomName, Memory.battles[roomName]);
        }
    }
}