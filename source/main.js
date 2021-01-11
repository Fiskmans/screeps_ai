require('requires')

module.exports.loop = function()
{
    Performance.Intents.Reset();
    Performance.Profiler.Update();
    
    for(let room of Object.values(Game.rooms))
    {
        room.PopulateShorthands();
    }
    
    DeSerializeMemory();
    defaultMemory();
    applyFlags();
    
    colonyMain();
    PowerCreeps();
    
    DoWars();
    
    worldVisuals();
    ConsoleHelperUpdate();
    
    InterShard.Transport.FlushScreeponauts();
    InterShard.Transport.FindOrphans();
    InterShard.Transport.FillRequests();
    
    
    TrackCPU(Game.cpu.getUsed() / Game.cpu.limit);
    if (Game.cpu.bucket > 1000 && Game.cpu.getUsed() < Game.cpu.limit) 
    {
        Scouting();
        deleteAllDead()
        checkSomePlanned(500)
        analyzeQueue()
          
        marketTracking()
        
        InterShard.Transport.ActivateDeadShards();
    }
    
    Market.Prices.Update();
    
    UpdateGrafanaStats();
    
    if(Game.cpu.bucket > 9900 && Game.shard.name == "shard2")
    {
        Game.cpu.generatePixel();
    }
    
    InterShard.Pulse.Pulse();
    InterShard.Memory.Commit();
}
