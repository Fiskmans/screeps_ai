require('requires')
const profiler = require('profiler');

marketTracking                = profiler.registerFN(marketTracking);
worldVisuals                  = profiler.registerFN(worldVisuals);
checkSomePlanned              = profiler.registerFN(checkSomePlanned);
Scouting                      = profiler.registerFN(Scouting);
colonyMain                    = profiler.registerFN(colonyMain);
DoWars                        = profiler.registerFN(DoWars);
colonyStart                   = profiler.registerFN(colonyStart);

maintainColony                = profiler.registerFN(maintainColony);
colonyHighways                = profiler.registerFN(colonyHighways);
colonyMiningSpots             = profiler.registerFN(colonyMiningSpots);
drawColony                    = profiler.registerFN(drawColony);
DeSerializeMemory             = profiler.registerFN(DeSerializeMemory);
PowerCreeps                   = profiler.registerFN(PowerCreeps);
ColonyFulfillRequests         = profiler.registerFN(ColonyFulfillRequests);
ColonyRequestRefill           = profiler.registerFN(ColonyRequestRefill);
ColonyFindUnfilledToRequest   = profiler.registerFN(ColonyFindUnfilledToRequest);
RemoveDoneRequests            = profiler.registerFN(RemoveDoneRequests);
deleteDead                    = profiler.registerFN(deleteDead);
MakeFakeStores                = profiler.registerFN(MakeFakeStores);

profiler.registerClass(FakeStore, 'FakeStore');
profiler.registerClass(Store, 'Store');

profiler.enable();
module.exports.loop = function()
{
  profiler.wrap(function() {

    CacheTick();

    DeSerializeMemory();
    defaultMemory();
    applyFlags();
    
    colonyMain();
    PowerCreeps();
    
    DoWars();
    
    worldVisuals();
    ConsoleHelperUpdate();
    
    TrackCPU(Game.cpu.getUsed() / Game.cpu.limit);
    if (Game.cpu.bucket > 1000 && Game.cpu.getUsed() < Game.cpu.limit) 
    {
      Scouting();
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
