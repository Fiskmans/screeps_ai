
let C =
{
    DECODER_REQUEST_AMOUNT      : 1000,
    CHECK_INTERVAL              : 500,

    FREE_SPACE_TO_LEAVE         : 50000
}

module.exports.IsAlly = function(userName)
{
    return ["Eiskalt","Mirroar","reggaremuffin","Meridon","SirFrump","rysade","likeafox","Geir1983"].includes(userName);
}

module.exports.CheckForSymbols=function()
{
    if(Game.flags["S"])
    {
        if(!Memory.seasonal.rooms[Game.flags["S"].pos.roomName]) {Memory.seasonal.rooms[Game.flags["S"].pos.roomName] = {}}
        Game.flags["S"].remove();
    }

    for(let roomName in Memory.seasonal.rooms)
    {
        let rData = Memory.seasonal.rooms[roomName];
        if(Game.time - (rData.checked || 0 ) > C.CHECK_INTERVAL)
        {
            let room = Game.rooms[roomName];
            if(!room)
            {
                Empire.Scouting.WantsVision(roomName);
                continue;
            }

            let closest = Colony.Helpers.FindClosest(roomName);
            if(!closest)
            {
                Helpers.External.Notify("No colonies exist",true);
                return;
            }

            let has = false;
            for(let s of room.find(FIND_SYMBOL_CONTAINERS))
            {
                has = true;
                if(s.store.getUsedCapacity(s.resourceType) > 0)
                {
                    if(!rData.creep && closest.haulerpool.length > 1)
                    {
                        rData.creep = closest.haulerpool.shift();
                    }
                }
                else
                {
                    if(rData.creep)
                    {
                        closest.haulerpool.push(rData.creep);
                        delete rData.creep;
                    }
                    rData.checked = Game.time;
                }
                if(rData.creep)
                {
                    let creep = Game.creeps[rData.creep];
                    if(!creep)
                    {
                        delete rData.creep;
                        continue;
                    }
                    let colRoom = Game.rooms[closest.pos.roomName];
                    if(!colRoom || !colRoom.storage)
                    {
                        continue;
                    }
                    if(!colRoom.storage || colRoom.storage.store.getFreeCapacity() < C.FREE_SPACE_TO_LEAVE)
                    {
                        if(rData.creep)
                        {
                            closest.haulerpool.push(rData.creep);
                            delete rData.creep;
                        }
                        rData.checked = Game.time;
                        continue;
                    }
                    if(creep.store.getUsedCapacity() > 0)
                    {
                        creep.say("d");
                        creep.do("transfer",colRoom.storage,Object.keys(creep.store)[0]);
                    }
                    else
                    {
                        creep.say("p");
                        creep.do("withdraw",s,s.resourceType);
                    }
                }
            }
            if(!has)
            {
                if(rData.creep)
                {
                    closest.haulerpool.push(rData.creep);
                    delete rData.creep;
                }
                rData.checked = Game.time;
            }
        }
    }
}

module.exports.DecoderRequests=function()
{
    //decoders don't have a store :thinking:
}

module.exports.Update = function()
{
    this.CheckForSymbols();
    this.DecoderRequests();
}