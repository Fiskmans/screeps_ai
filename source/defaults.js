defaultMemory=function()
{
    if(!Memory.lastViewed) {Memory.lastViewed = {}}

    if(!Memory.creepid){Memory.creepid = 0}
    if(!Memory.data){Memory.data = {}}
    if(!Memory.stats){Memory.stats = {}}
    if(!Memory.rooms){Memory.rooms = {}}
    if(!Memory.mainColony) { if(Memory.colonies.length > 0) {Memory.mainColony = Memory.colonies[0].pos.roomName} }
    if(!Memory.boostedSource) {Memory.boostedSource = {}}

    if(!Memory.console) {Memory.console = {};}
    if(!Memory.console.jobs) {Memory.console.jobs = [];}
    if(!Memory.portals) { Memory.portals = {} }
    if(!Memory.interShard) { Memory.interShard = { to:{} } }
    if(!Memory.orphans) { Memory.orphans = {} }
}