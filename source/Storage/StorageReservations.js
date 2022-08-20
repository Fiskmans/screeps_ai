const C = {
    STATUS_COLLECTING           :"collecting",
    STATUS_READY                :"ready",
    STATUS_FAILED               :"fail",
    STATUS_SUCCES               :"success"
}

let GenerateId = function()
{
    Memory.storage.reservationId++;
    return "sto_" + Memory.storage.reservationId;
}

module.exports.Allocate = function(wanted, roomName)
{
    let id = GenerateId();
    let obj = 
    {
        wanted: wanted,
        status: C.STATUS_COLLECTING,
        made_at: Game.time,
        room: roomName
    }

    Memory.storage.reservations[id] = obj;

    return id;
}


module.exports.SetUpTick = function()
{
    for(let reservation of Object.values(Memory.storage.reservations))
    {
        switch(reservation.status)
        {
            case C.STATUS_READY:
            case C.STATUS_COLLECTING:
                
                break;
        }
    }
}