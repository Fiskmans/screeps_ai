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
}