grafanaGlobals = {}

UpdateGrafanaStats=function()
{
    if(Memory.stats.tick+1 != Game.time)
    {
        console.log("skipped tick")
    }
    Memory.stats.tick = Game.time;
    Memory.stats.bucket = Game.cpu.bucket;
    Memory.stats.credits = Game.market.credits;
    if(globalPrices && globalPrices.prices && globalPrices.prices[ORDER_SELL] && globalPrices[ORDER_SELL][SUBSCRIPTION_TOKEN])
    {
        Memory.stats.tokenPrice = globalPrices[ORDER_SELL][SUBSCRIPTION_TOKEN].price;
    }
    Memory.stats.gclProgress = Game.gcl.progress;
    if(!grafanaGlobals.gclLog){ grafanaGlobals.gclLog = []};
    grafanaGlobals.gclLog.push(Game.gcl.progress);
    let delta = [];
    let last = grafanaGlobals.gclLog[0];
    for (let index = 1; index < grafanaGlobals.gclLog.length; index++) 
    {
        delta.push(grafanaGlobals.gclLog[index]-last);
        last = grafanaGlobals.gclLog[index];
        if(grafanaGlobals.gclLog.length > 256) {grafanaGlobals.gclLog.shift()}
    }
    if(delta.length > 0)
    {
        let d = _.sum(delta)/delta.length;
        let left = Game.gcl.progressTotal - Game.gcl.progress;
        Memory.stats.ticksTogclLevel = left/d;
    }
}