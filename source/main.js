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
    Empire.Expansion.StartInitialColony();
    
    Colony.Dispatcher.DispatchAll();
    PowerCreeps();
    
    worldVisuals();
    ConsoleHelperUpdate();
    
    if(IS_PERSISTENT || IS_PTR)
    {
        InterShard.Transport.FlushScreeponauts();
        InterShard.Transport.FindOrphans();
        InterShard.Transport.FillRequests();
    }

    if(IS_SEASONAL)
    {
        Seasonal.Empire.Update();
    }
        
    
    TrackCPU(Game.cpu.getUsed() / Game.cpu.limit);
    if (Game.cpu.bucket > 1000 && Game.cpu.getUsed() < Game.cpu.limit) 
    {
        Scouting();
        deleteAllDead();
        Helpers.Spawn.CleanMemory();
          
        
        if(IS_PERSISTENT || IS_PTR)
        {
            InterShard.Transport.ActivateDeadShards();
        }
    }
    
    applyFlags();
    Market.Prices.Update();
    Empire.Scouting.Update();
    Empire.Expansion.Update();
    Empire.DumbShit.Buzz();
    Helpers.Spawn.Track();
    
    UpdateGrafanaStats();
    
    if(IS_PERSISTENT && Game.cpu.bucket > 9900 && Game.shard.name == "shard2")
    {
        Game.cpu.generatePixel();
    }

    if(IS_PERSISTENT || IS_PTR)
    {
        InterShard.Pulse.Pulse();
        InterShard.Memory.Commit();
    }
    Performance.Profiler.Update();
    Performance.Decisions.UpdateAverage();
}

Memory.recompiles = (Memory.recompiles || 0) + 1;

Performance.Profiler.Register("main",module.exports);
require('PerformanceProfilerRegistry')

console.log("Recompile successfull in: " + (Game.cpu.getUsed() - start).toFixed(2) + " cpu");