
module.exports.Update=function(colony)
{
    if(!colony.looting) { return; }

    let room = Game.rooms[colony.looting];
    if(!room) { Empire.Scouting.WantsVision(colony.looting); return; }

    if(!colony.looter) 
    {  
        let list = [];
        Colony.Helpers.SpawnCreep(
            colony,
            list,
            BODIES.LV4_HAULER,
            ROLE_HAULER);
        colony.looter = list.shift();    
    }

    let colonyRoom = Game.rooms[colony.pos.roomName];
    if(!colonyRoom.storage) { return; }

    let targets = room.find(FIND_STRUCTURES,{filter: (s) => { return ENEMY_STRUCTURES_WITH_LOOT.includes(s.structureType) && colony.disTargets.indexOf(s.id) === -1 && s.store.getUsedCapacity() > 0; }});

    if(targets.length == 0)
    {
        if(colony.looter)
        {
            console.log("Looting done in " + colony.looting);
            colony.haulerpool.push(colony.looter);
            colony.haulersensus.push(colony.looter);
            delete colony.looter; 
            delete colony.looting;
            return;
        }
    }

    if(colony.looter)
    {
        let creep = Game.creeps[colony.looter];
        if(!creep) { delete colony.looter; return; }

        if (creep.store.getUsedCapacity() > 0)
        {
            creep.say('💰');
            creep.do(CREEP_TRANSFER,colonyRoom.storage,Object.keys(creep.store)[0]);
        }
        else
        {
            creep.say('🏴‍☠️');
            creep.do(CREEP_WITHDRAW,targets[0],Object.keys(targets[0].store)[0]);
        }
    }
}