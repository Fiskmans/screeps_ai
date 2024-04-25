console.log("Recompiling...");
let start = Game.cpu.getUsed();

require('requires')

module.exports.loop = function()
{
    defaultMemory();
    Performance.Intents.Reset();
    
    for(let room of Object.values(Game.rooms))
    {
        room.PopulateShorthands();
    }
    
    
    Colony.Dispatcher.DispatchAll();
    PowerCreeps();
    
    worldVisuals();
    ConsoleHelperUpdate();
    
    InterShard.Transport.FlushScreeponauts();
    InterShard.Transport.FindOrphans();
    InterShard.Transport.FillRequests();
    
    
    TrackCPU(Game.cpu.getUsed() / Game.cpu.limit);
    if (Game.cpu.bucket > 1000 && Game.cpu.getUsed() < Game.cpu.limit) 
    {
        Scouting();
        deleteAllDead();
        Helpers.Spawn.CleanMemory();
          
        
        InterShard.Transport.ActivateDeadShards();
    }
    
    applyFlags();
    Market.Prices.Update();
    Empire.Scouting.Update();
    Empire.Expansion.Update();
    Empire.DumbShit.Buzz();
    Helpers.Spawn.Track();
    
    UpdateGrafanaStats();
    
    if(Game.cpu.bucket > 9900 && Game.shard.name == "shard2")
    {
        Game.cpu.generatePixel();
    }

    InterShard.Pulse.Pulse();
    InterShard.Memory.Commit();
    Performance.Profiler.Update();
    Performance.Decisions.UpdateAverage();
}


Performance.Profiler.Register("main",module.exports);
require('PerformanceProfilerRegistry')

console.log("Recompile successfull in: " + (Game.cpu.getUsed() - start).toFixed(2) + " cpu");