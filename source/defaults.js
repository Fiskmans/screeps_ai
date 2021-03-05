defaultMemory=function()
{
    if(!Memory.colonies) { Memory.colonies = [] }

    if(!Memory.lastViewed) {Memory.lastViewed = {}}

    if(!Memory.creepid){Memory.creepid = 0}
    if(!Memory.data){Memory.data = {}}
    if(!Memory.stats){Memory.stats = {}}
    if(!Memory.rooms){Memory.rooms = {}}
    if(!Memory.boostedSource) {Memory.boostedSource = {}}

    if(!Memory.console) {Memory.console = {};}
    if(!Memory.console.jobs) {Memory.console.jobs = [];}
    if(!Memory.portals) { Memory.portals = {} }
    
    if(IS_PERSISTENT || IS_PTR)
    {
        if(!Memory.interShard) { Memory.interShard = { to:{} } }
        if(!Memory.orphans) { Memory.orphans = {} }
    }

    if(!Memory.empire) { Memory.empire = {} }

    if(!Memory.empire.scouting) { Memory.empire.scouting = {}; }
    if(!Memory.empire.scouting.idleScouts) { Memory.empire.scouting.idleScouts = []; }
    if(!Memory.empire.scouting.rooms) { Memory.empire.scouting.rooms = {}; }

    if(!Memory.empire.expansion) { Memory.empire.expansion = {}; }
    if(!Memory.empire.expansion.rooms) {Memory.empire.expansion.rooms = {}; }
    if(!Memory.empire.expansion.finalized) {Memory.empire.expansion.finalized = []; }

    if(!Memory.empire.strongholds) 
    { 
        Memory.empire.strongholds = 
        {
            quadrants:
            {
                "WS":{},
                "WN":{},
                "ES":{},
                "EN":{}
            }
        }; 
    }

    
    if(!Memory.performancedecisions)
    {
        Memory.performancedecisions = 
        {
            average:Game.cpu.limit,
            count:1
        };
    }

    if(IS_SEASONAL)
    {
        if(!Memory.seasonal) {Memory.seasonal = {}}
        if(!Memory.seasonal.rooms) {Memory.seasonal.rooms = {}}
    }


}