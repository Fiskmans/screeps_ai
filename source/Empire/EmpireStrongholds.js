let C = 
{
    STRONGHOLD_STATE_UNKNOWN    :"unkown",
    STRONGHOLD_STATE_EXIST      :"exist",
    STRONGHOLD_STATE_SETUP      :"setup"
}

module.exports.Update = function()
{

}

module.exports.RegisterStrongHold=function(evidenceRoom)
{
    let entry = false;
    try
    {
        const [, we, lon, ns, lat] = ROOM_NAME_REGEX.exec(roomName);
        let sectorLon = lon/10;
        let sectorLat = lat/10;

        let sector = sectorLon + "," + sectorLat;

        quadrant = we + ns;
        if(!Memory.empire.quadrants[quadrant][sector])
        {
            Memory.empire.quadrants[quadrant][sector] = 
            {
                lastUpdate:0,
                state:C.STRONGHOLD_STATE_UNKNOWN
            };
        }
        entry = Memory.empire.quadrants[quadrant][sector];
    }
    catch
    {
        Helpers.Externals.Notify(roomName + " failed roomName regex",true);
        return false
    }


    if(entry.state == C.STRONGHOLD_STATE_UNKNOWN)
    {
        
    }
}