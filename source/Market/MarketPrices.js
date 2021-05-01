
let RefreshPrices = function()
{
    let prices = Market._prices;
    let market = Game.market;
    let orders = market.getAllOrders();
    let now = Game.time;
    
    for(let i in orders)
    {
        let order = orders[i];
        if (order.type == ORDER_BUY) 
        {
            if(!prices[ORDER_BUY][order.resourceType])
            {
                prices[ORDER_BUY][order.resourceType] = {}
                prices[ORDER_BUY][order.resourceType].price = order.price;
                prices[ORDER_BUY][order.resourceType].time = now;
                prices[ORDER_BUY][order.resourceType].id = order.id;
                prices[ORDER_BUY][order.resourceType].room = order.roomName;
            }
            else if ((Game.time - prices[ORDER_BUY][order.resourceType].time) > MARKET_STALE_PRICE_THRESHOLD || prices[ORDER_BUY][order.resourceType].price < order.price) 
            {
                prices[ORDER_BUY][order.resourceType].price = order.price;
                prices[ORDER_BUY][order.resourceType].time = now;
                prices[ORDER_BUY][order.resourceType].id = order.id;
                prices[ORDER_BUY][order.resourceType].room = order.roomName;
            }
        }
        else
        {
            if(!prices[ORDER_SELL][order.resourceType])
            {
                prices[ORDER_SELL][order.resourceType] = {}
                prices[ORDER_SELL][order.resourceType].price = order.price;
                prices[ORDER_SELL][order.resourceType].time = now;
                prices[ORDER_SELL][order.resourceType].id = order.id;
                prices[ORDER_SELL][order.resourceType].room = order.roomName;
            }
            else if ((Game.time - prices[ORDER_SELL][order.resourceType].time) > MARKET_STALE_PRICE_THRESHOLD || prices[ORDER_SELL][order.resourceType].price > order.price) 
            {
                prices[ORDER_SELL][order.resourceType].price = order.price;
                prices[ORDER_SELL][order.resourceType].time = now;
                prices[ORDER_SELL][order.resourceType].id = order.id;
                prices[ORDER_SELL][order.resourceType].room = order.roomName;
            }
        }
    }

    prices.lastupdate = Game.time;
}

module.exports.Update=function()
{
    let prices = Market._prices;
    if(Game.time - prices.lastupdate > MARKET_PRICE_REFRESH_INTERVAL)
    {
        Performance.Decisions.Run("prices",RefreshPrices);
    }
}

module.exports.BuyEnergy=function(roomName)
{
    let price = Market._prices[ORDER_SELL][RESOURCE_ENERGY];
    if(!price || Game.time - price.time > MARKET_STALE_PRICE_THRESHOLD)
    {
        return false;
    }
    let totalAmount = 1000.0 / Game.market.calcTransactionCost(1000, roomName, price.room);
    return price.price * totalAmount;
}

module.exports.ToBuy=function(resource,roomName)
{
    if(resource == RESOURCE_ENERGY)
    {
        return this.BuyEnergy(roomName);
    }
    let price = Market._prices[ORDER_SELL][resource];
    let energyPrice = this.ToBuy(RESOURCE_ENERGY,roomName);
    if(!energyPrice || !price || Game.time - price.time > MARKET_STALE_PRICE_THRESHOLD)
    {
        return false;
    }
    let energyAmount = 0;
    energyAmount = Game.market.calcTransactionCost(1000, roomName, price.room) / 1000.0;
    return price.price + energyAmount * energyAmount;
}

module.exports.ToSell=function(resource,roomName)
{
    let price = Market._prices[ORDER_BUY][resource];
    let energyPrice = this.ToBuy(RESOURCE_ENERGY,roomName);
    if(!energyPrice || !price || Game.time - price.time > MARKET_STALE_PRICE_THRESHOLD)
    {
        return false;
    }
    let energyAmount = 0;
    energyAmount = Game.market.calcTransactionCost(1000, roomName, price.room) / 1000.0;
    return price.price - energyAmount * energyAmount;
}
