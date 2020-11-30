defaultMemory=function()
{
    if(!Memory.creepid){Memory.creepid = 0}
    if(!Memory.data){Memory.data = {}}
    if(!Memory.stats){Memory.stats = {}}
    if(!Memory.rooms){Memory.rooms = {}}
    if(!Memory.mainColony) { if(Memory.colonies.length > 0) {Memory.mainColony = Memory.colonies[0].pos.roomName} }
}