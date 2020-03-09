require('requires')
const profiler = require('profiler');

marketTracking = profiler.registerFN(marketTracking);
worldVisuals = profiler.registerFN(worldVisuals);
checkSomePlanned = profiler.registerFN(checkSomePlanned);
Scouting = profiler.registerFN(Scouting);
colonyMain = profiler.registerFN(colonyMain);
DoWars = profiler.registerFN(DoWars);
colonyStart = profiler.registerFN(colonyStart);

maintainColony = profiler.registerFN(maintainColony);
colonyHighways = profiler.registerFN(colonyHighways);
colonyMiningSpots = profiler.registerFN(colonyMiningSpots);
drawColony = profiler.registerFN(drawColony);
DeSerializeMemory = profiler.registerFN(DeSerializeMemory);
<<<<<<< HEAD
=======
PowerCreeps = profiler.registerFN(PowerCreeps);
>>>>>>> f835072b0fe4d40a512fe0a69c5bbea8979b2dcf

profiler.enable();
module.exports.loop = function()
{
//test 5
  profiler.wrap(function() {


    DeSerializeMemory();
    defaultMemory()
<<<<<<< HEAD
    applyFlags()
    
    colonyMain()
=======
    applyFlags();
    
    colonyMain();
    PowerCreeps();
>>>>>>> f835072b0fe4d40a512fe0a69c5bbea8979b2dcf
    
    DoWars();
    
    worldVisuals()
    
    TrackCPU(Game.cpu.getUsed() / Game.cpu.limit);
    if (Game.cpu.bucket > 1000 && Game.cpu.getUsed() < Game.cpu.limit) 
    {
        Scouting();
        deleteAllDead()
        checkSomePlanned(500)
        analyzeQueue()
        
        marketTracking()
        UpdateGrafanaStats();
    }
})
    
        
}
