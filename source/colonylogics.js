colonyLogic=
{
    0:function(colony)
    {
        Colony.Planner.Expand(colony);
        colonize(colony);
    },
    //level 1
    1:function(colony)
    {
        Colony.Planner.Expand(colony);
        GuardSpawningColony(colony);
        ColonyRespawnWorkers(colony);
        colonyDumbRefill(colony);
        Colony.Modules.BasicWorkers(colony);
        PerformAttacks(colony);
        Colony.Modules.MaintainHighways(colony);
        colonyMiningSpots(colony);
    },
    //level 2
    2:function(colony)
    {
        this[1](colony);
        StartMining(colony);
        ColonyMining(colony);
        ColonyHauling(colony);
        digAllMines(colony);
        ColonyEmptyMines(colony);
        colonyDismantle(colony);
        maintainColony(colony);
    },
    //level 3
    3:function(colony)
    {
        DefendColony(colony);
        this[2](colony)
        maintainall(colony)
    },
    //level 4
    4:function(colony)
    {
        this[3](colony)
        ColonyDismantleAll(colony);
        ColonyBuildRamparts(colony);
        ColonyRequestRefill(colony);
    },
    //level 5
    5:function(colony)
    {
        this[4](colony)
        FindColonyLinks(colony)
        ColonyMaintainUpgradeSite(colony)
    },
    //level 6
    6:function(colony)
    {
        this[5](colony)
        ColonyMerchant(colony);
        ColonyTerminalTraffic(colony);

        Colony.Planner.PlanLabs(colony);

        Colony.Production.Lab.Setup(colony);
        Colony.Production.Lab.Plan(colony);
        Colony.Production.Lab.Run(colony);

        Market.Decisions.Selling(colony);
    },
    //level 7
    7:function(colony)
    {
        this[6](colony)
        ColonyCrafting(colony);
    },
    //level 8
    8:function(colony)
    {
        Colony.Planner.Expand(colony);
        DefendColony(colony);
        GuardSpawningColony(colony)
        ColonyRespawnWorkers(colony);
        colonyDumbRefill(colony);
        Colony.Modules.BasicWorkers(colony);
        PerformAttacks(colony);
        StartMining(colony)
        ColonyMining(colony)
        ColonyHauling(colony)
        digAllMines(colony);
        ColonyEmptyMines(colony);
        colonyDismantle(colony)
        FindColonyLinks(colony)
        ColonyMaintainUpgradeSite(colony)
        ColonyMerchant(colony);
        ColonyTerminalTraffic(colony);
        ColonyCrafting(colony);
        maintainall(colony)
        maintainColony(colony)
        ColonyDismantleAll(colony);
        ColonyBuildRamparts(colony);
        ColonyLookForPower(colony);
        ColonyCollectPower(colony);
        ColonyProcessPower(colony);
        Colony.Modules.MaintainHighways(colony);
        colonyMiningSpots(colony);
    }
}