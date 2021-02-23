colonyLogic=
{
    //level 4
    4:function(colony)
    {
        DefendColony(colony);
        Colony.Planner.Expand(colony);
        Colony.Modules.Spawning.Update(colony);
        Colony.Modules.Misc.BasicWorkers(colony);
        PerformAttacks(colony);
        Colony.Modules.Misc.RepairDecay(colony);
        ColonyHauling(colony);
        colonyDismantle(colony);
        maintainColony(colony);
        ColonyDismantleAll(colony);
        ColonyBuildRamparts(colony);
        ColonyRequestRefill(colony);
        Colony.Modules.RemoteMining.Update(colony);
        Colony.Modules.Mining.Update(colony);
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
        this[7](colony)
        ColonyLookForPower(colony);
        ColonyCollectPower(colony);
        ColonyProcessPower(colony);
    }
}