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
PowerCreeps = profiler.registerFN(PowerCreeps);

profiler.enable();
module.exports.loop = function()
{
//test 5
  profiler.wrap(function() {


    DeSerializeMemory();
    defaultMemory()
    applyFlags();
    
    colonyMain();
    PowerCreeps();
    
    DoWars();
    
    worldVisuals()
    
    TrackCPU(Game.cpu.getUsed() / Game.cpu.limit);
    if (Game.cpu.bucket > 1000 && Game.cpu.getUsed() < Game.cpu.limit) 
    {
      //Scouting();
      deleteAllDead()
      checkSomePlanned(500)
      analyzeQueue()
        
      marketTracking()
    }
    UpdateGrafanaStats();

    if(Game.cpu.bucket > 9900)
    {
      Game.cpu.generatePixel();
    }
})
    
        
}
