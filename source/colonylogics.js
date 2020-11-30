colonyLogic=
{
    0:function(colony)
    {
       colonize(colony);
    },
    //level 1
    1:function(colony)
    {
        GuardSpawningColony(colony)
        ColonyRespawnWorkers(colony);
        colonyDumbRefill(colony);
        ColonyWorkerBehaviour(colony);
        PerformAttacks(colony);
    },
    //level 2
    2:function(colony)
    {
        this[1](colony)
        StartMining(colony)
        BasicHaulersAndMiners(colony)
        digAllMines(colony);
        colonyDismantle(colony)
        maintainColony(colony)
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
    },
    //level 5
    5:function(colony)
    {
        this[4](colony)
    },
    //level 6
    6:function(colony)
    {
        this[5](colony)
        FindRecLink(colony)
        let worth = FindWorthWhileReselling();
        if(worth.length > 0)
        {
            Game.notify("Worth it to buy and resell:\n\n" + PrettySerialize(worth));
        } 
        ColonyRetargetSelling(colony);
        ColonyMerchant(colony);
    },
    //level 7
    7:function(colony)
    {
        this[6](colony)
        ColonyRetargetFactory(colony);
        ColonyCrafting(colony);
    },
    //level 8
    8:function(colony)
    {
        DefendColony(colony);
        GuardSpawningColony(colony)
        ColonyRespawnWorkers(colony);
        colonyDumbRefill(colony);
        ColonyWorkerBehaviour(colony);
        PerformAttacks(colony);
        StartMining(colony)
        BasicHaulersAndMiners(colony)
        digAllMines(colony);
        colonyDismantle(colony)
        FindRecLink(colony)
        FindRecLink(colony)
        ColonyRetargetSelling(colony);
        ColonyMerchant(colony);
        ColonyRetargetFactory(colony);
        ColonyCrafting(colony);
        maintainall(colony)
        maintainColony(colony)
        ColonyDismantleAll(colony);
        ColonyLookForPower(colony);
        ColonyCollectPower(colony);
        ColonyProcessPower(colony);
    }
}