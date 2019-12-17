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
        SetupLowTierStorage(colony)
        this[1](colony)
        StartMining(colony)
        BasicHaulersAndMiners(colony)
        digAllMines(colony);
        colonyDismantle(colony)
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
            console.log("Worth it to buy and resell:");
            logObject(worth);
        } 
        if(Game.time % COLONY_RETARGET_COLOY_SELLING_INTERVAL == 1)
        {
            let room = Game.rooms[colony.pos.roomName];
            if(room && room.terminal)
            {
                ColonyRetargetSelling(colony);
            }
        }
        ColonyMerchant(colony);
    },
    //level 7
    7:function(colony)
    {
        this[6](colony)
        
        let room = Game.rooms[colony.pos.roomName];
        if (room)
        {
            if (!colony.crafting) {colony.crafting = {}}
            if (true) 
            {
                
            }
        }
    },
    //level 8
    8:function(colony)
    {
        this[7](colony)
    }
}