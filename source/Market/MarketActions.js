
module.exports.Sell=function(terminal,resource)
{
    let price = Market._prices[ORDER_BUY][resource];
    if(!price)
    {
        return;
    }

    let order = Game.market.getOrderById(price.id);
    let energyRate = Game.market.calcTransactionCost(10000, terminal.room.name, price.room) / 10000;

    if(!order || Game.time - price.time > MARKET_STALE_PRICE_THRESHOLD)
    {
        return;
    }
    let amount = Math.floor(Math.min(order.amount,terminal.store.getUsedCapacity(resource), terminal.store.getUsedCapacity(RESOURCE_ENERGY) / energyRate - 1));

    if(amount <= 0)
    {
        return;
    }

    let err = Game.market.deal(order.id,amount,terminal.room.name);
    if(err == OK)
    {   
        terminal.cooldown = 11;
        console.log(("Sold ".padEnd(10)) + "<img src='https://static.screeps.com/upload/mineral-icons/" + resource + ".png'/>" + (amount + " ").padEnd(18) + " from " + terminal.room.name + (" for " + order.price + " credits/unit").padEnd(26) + " total <font color=\"green\">" + (amount * order.price) + "<font>");
        order.amount -= amount;
    }
    else
    {
        console.log(amount)
        console.log("Tried to sell " + resource + " from " + terminal.room.name + " but got error: " + err);
    }
}

