grafanaGlobals = {}

UpdateGrafanaStats=function()
{
    if(Memory.stats.tick+1 != Game.time)
    {
        console.log("skipped tick")
    }
    Memory.stats["game.time"] = Game.time;
    Memory.stats['cpu.getUsed'] = Game.cpu.getUsed()
    Memory.stats['cpu.limit'] = Game.cpu.limit
    Memory.stats['cpu.bucket'] = Game.cpu.bucket
    Memory.stats.credits = Game.market.credits;
    if(globalPrices && globalPrices.prices && globalPrices.prices[ORDER_SELL] && globalPrices[ORDER_SELL][SUBSCRIPTION_TOKEN])
    {
        Memory.stats.tokenPrice = globalPrices[ORDER_SELL][SUBSCRIPTION_TOKEN].price;
    }
    Memory.stats['gcl.progress'] = Game.gcl.progress;
    Memory.stats['gcl.progressTotal'] = Game.gcl.progressTotal;
    Memory.stats['gcl.level'] = Game.gcl.level;

    Memory.stats['store'] = {};
    _.forEach(Object.keys(Game.rooms), function(roomName){
        let room = Game.rooms[roomName]
  
        if(room.controller && room.controller.my)
        {
            Memory.stats['rooms.' + roomName + '.rcl.level'] = room.controller.level
            Memory.stats['rooms.' + roomName + '.rcl.progress'] = room.controller.progress
            Memory.stats['rooms.' + roomName + '.rcl.progressTotal'] = room.controller.progressTotal
  
            Memory.stats['rooms.' + roomName + '.spawn.energy'] = room.energyAvailable
            Memory.stats['rooms.' + roomName + '.spawn.energyTotal'] = room.energyCapacityAvailable
  
            if(room.storage){
                let store = room.storage.store;
                Memory.stats['rooms.' + roomName + '.storage.energy'] = store.getUsedCapacity(RESOURCE_ENERGY);
                Memory.stats['rooms.' + roomName + '.storage.other'] = store.getUsedCapacity() - store.getUsedCapacity(RESOURCE_ENERGY);
                RESOURCES_ALL.forEach((r) =>
                {
                    let amount = store.getUsedCapacity(r)
                    if(amount > 0)  
                    {
                        if(!Memory.stats['store'][r]) {Memory.stats['store'][r] = 0};
                        Memory.stats['store'][r] += amount;
                    }
                })
            }
        }
      })
}