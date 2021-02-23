

let creepBlacklist =
[
    'name',
    'body',
    'my',
    'owner',
    'spawning',
    'ticksToLive',
    'carryCapacity',
    'carry',
    'store',
    'fatigue',
    'hits',
    'hitsMax',
    'saying'
]

let structureblackList = 
[
    'energy',
    'energyCapacity',
    'cooldown',
    'mineralAmount',
    'mineralCapacity',
    'mineralType',
    'store',
    'owner',
    'my',
    'hits',
    'hitsMax',
    'structureType'
]

Performance.Profiler.Register("Creep"                       , Creep.prototype,creepBlacklist);
Performance.Profiler.Register("PowerCreep"                  , PowerCreep.prototype,creepBlacklist);

Performance.Profiler.Register("RoomPosition"                , RoomPosition.prototype);
Performance.Profiler.Register("RoomVisual"                  , RoomVisual.prototype);
Performance.Profiler.Register("Room"                        , Room.prototype);
Performance.Profiler.Register("Game"                        , Game);
Performance.Profiler.Register("Labs"                        , StructureLab.prototype,structureblackList);

Performance.Profiler.Register("Market.Decisions"            , require('MarketDecisions'));
Performance.Profiler.Register("Market.Prices"               , require('MarketPrices'));
Performance.Profiler.Register("Colony.Dispatcher"           , require('ColonyDispatcher'));
Performance.Profiler.Register("Colony.Helpers"              , require('ColonyHelpers'));
Performance.Profiler.Register("Colony.KickStart"            , require('ColonyKickStart'));
Performance.Profiler.Register("Colony.Modules"              , require('ColonyModules'));
Performance.Profiler.Register("Colony.Modules.Mining"       , require('ColonyModulesMining'));
Performance.Profiler.Register("Colony.Modules.RemoteMining" , require('ColonyModulesRemoteMining'));
Performance.Profiler.Register("Colony.Planner"              , require('ColonyPlanner'));
Performance.Profiler.Register("Colony.Labs"                 , require('ColonyLabProduction'));
Performance.Profiler.Register("Combat.Calculator"           , require('CombatCalculator'));
Performance.Profiler.Register("Helpers.Resources"           , require('HelpersResources'));
Performance.Profiler.Register("Helpers.Externals"           , require('HelpersExternals'));
Performance.Profiler.Register("InterShard.Memory"           , require('InterShardMemory'));
Performance.Profiler.Register("InterShard.Pulse"            , require('InterShardPulse'));
Performance.Profiler.Register("InterShard.Transport"        , require('InterShardTransport'));