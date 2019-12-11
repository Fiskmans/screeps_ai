require('requires')
const profiler = require('profiler');

marketTracking = profiler.registerFN(marketTracking);
worldVisuals = profiler.registerFN(worldVisuals);
checkSomePlanned = profiler.registerFN(checkSomePlanned);
Scouting = profiler.registerFN(Scouting);
colonyMain = profiler.registerFN(colonyMain);
DoWars = profiler.registerFN(DoWars);

profiler.enable();
module.exports.loop = function()
{
//test 5
    defaultMemory()
    applyFlags()
        
    colonyMain()
        
    DoWars();
        
    worldVisuals()
        
    if (Game.cpu.bucket > 1000 && Game.cpu.getUsed() < Game.cpu.limit) 
    {
        Scouting();
        deleteAllDead()
        checkSomePlanned(500)
        analyzeQueue()
            
        marketTracking()
        FindWorthWhileReactions()
    }
        
        
}
