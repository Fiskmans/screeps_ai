
let C =
{
    STALE_REQUEST: 10,


    SCOUTING_STATE_REQUEST: 'req',
    SCOUTING_STATE_IN_PROGRESS: 'progress'
}


module.exports.WantsVision = function(roomName)
{
    if(!Memory.empire.scouting.rooms[roomName] || Game.time - Memory.empire.scouting.rooms[roomName].requestedAt > C.STALE_REQUEST)
    {
        Memory.empire.scouting.rooms[roomName] =
        {
            state:C.SCOUTING_STATE_REQUEST,
            requestedAt: Game.time
        }
    }
    else 
    {
        Memory.empire.scouting.rooms[roomName].requestedAt = Game.time;
    }
}

let FetchScout = function(roomName,blob)
{
    if(Memory.empire.scouting.idleScouts.length > 0)
    {
        blob.scout = Memory.empire.scouting.idleScouts.shift();
    }
    else
    {
        Colony.Helpers.SpawnCreep(
            roomName,
            Memory.empire.scouting.idleScouts, 
            [MOVE],
            ROLE_SCOUT,
            {
                allowNearby:true,
                nearbyRange:10,
                nearbyBody:[[MOVE]]
            });
    }
}

let ReturnScout = function(roomName,blob)
{
    Memory.empire.scouting.idleScouts.push(blob.scout);
    delete blob.scout;
}

let Update = function()
{
    let items = [];
    for(let roomName in Memory.empire.scouting.rooms)
    {
        items.push(roomName);

        let blob = Memory.empire.scouting.rooms[roomName];

        if(Game.time - blob.requestedAt < C.STALE_REQUEST)
        {
            if(blob.scout)
            {
                let creep = Game.creeps[blob.scout];
                if(creep)
                {
                    creep.GoToRoom(roomName);
                }
                else
                {
                    delete blob.scout;
                }
            }
            else
            {
                FetchScout(roomName, blob);
            }
        }
    }
    for(let roomName of items)
    {
        let blob = Memory.empire.scouting.rooms[roomName];
        
        if(Game.time - blob.requestedAt > C.STALE_REQUEST)
        {
            if(blob.scout)
            {  
                ReturnScout(roomName,blob);
            }
            delete Memory.empire.scouting.rooms[roomName];
        }
    }
}

module.exports.Update = function()
{
    Performance.Decisions.Run("scouting",Update);
}