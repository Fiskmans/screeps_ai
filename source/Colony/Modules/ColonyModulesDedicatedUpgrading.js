
const C = {
    PREMPTIVE_SPAWN_WINDOW: 70,
    ENABLE_THRESHOLD:       150000,
    DISABLE_THRESHOLD:      40000,
    PICKUP_THRESHOLD:       31
}

let Setup = function(colony)
{
    if(colony.dediUpgradePos) { return true; }
    if(!colony.upgradeLink) { return false; }

    let link = Game.getObjectById(colony.upgradeLink);
    
    if(!link) { return false; }

    for(let pos of link.pos.Around())
    {
        if(!pos.inRangeTo(Game.rooms[pos.roomName].controller.pos, 3)) { continue; }   
        if(!Colony.Planner.IsTileFree(colony,pos)) { continue; }

        colony.dediUpgradePos = pos;
        return true;
    }

    console.log("Colony in room: " + colony.pos.roomName + " cant find empty spot around link for dedicated upgrading");
    return false;
}


module.exports.Run = function(colony)
{
    let room = Game.rooms[colony.pos.roomName];
    if(room && room.storage)
    {
        if(colony.dediUpgrade)
        {
            if(room.storage.store.getUsedCapacity(RESOURCE_ENERGY) < C.DISABLE_THRESHOLD)
            {
                colony.dediUpgrade = false;
            }
        } 
        else
        {
            if(room.storage.store.getUsedCapacity(RESOURCE_ENERGY) > C.ENABLE_THRESHOLD)
            {
                colony.dediUpgrade = true;
            }
        }
    }

    if(!Setup(colony)) { return; };

    if(!colony.dediUpgrade) { return; }
    if(!colony.dediUpgraders) { colony.dediUpgraders = []; }

    if(!colony.upgradeLink) { colony.dediUpgrade = false; return; }

    let link = Game.getObjectById(colony.upgradeLink);
    
    if(!link) { colony.dediUpgrade = false; return; }

    let listData = {threshold: C.PREMPTIVE_SPAWN_WINDOW, validCreeps: 0}
    for(let creep of Helpers.Creep.List(colony.dediUpgraders,listData))
    {
        if(creep.pos.x != colony.dediUpgradePos.x || creep.pos.y != colony.dediUpgradePos.y || creep.pos.roomName != colony.dediUpgradePos.roomName)
        { 
            creep.travelTo(new RoomPosition(colony.dediUpgradePos.x,colony.dediUpgradePos.y,colony.dediUpgradePos.roomName));
        }

        if(creep.room.controller)
        {   
            creep.upgradeController(creep.room.controller);
        }

        if(creep.store.getUsedCapacity(RESOURCE_ENERGY) < C.PICKUP_THRESHOLD)
        {
            let link = Game.getObjectById(colony.upgradeLink);
            if(!link) { colony.dediUpgrade = false; return; }
            creep.withdraw(link, RESOURCE_ENERGY);
        }
    }

    if (listData.validCreeps == 0)
    {
        Colony.Modules.Spawning.QueueSpawn(colony,BODIES.DEDICATED_UPGRADER,ROLE_UPGRADER,colony.dediUpgraders);
    }
}