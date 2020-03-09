UpdateGrafanaStats=function()
{
    Memory.stats["game.time"] = Game.time;
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
<<<<<<< HEAD
=======
    Memory.stats['gpl.progress'] = Game.gpl.progress;
    Memory.stats['gpl.progressTotal'] = Game.gpl.progressTotal;
    Memory.stats['gpl.level'] = Game.gpl.level;
>>>>>>> f835072b0fe4d40a512fe0a69c5bbea8979b2dcf
    
    Memory.stats['colonies.count'] = Memory.colonies.length;
    Memory.stats['scouting.targets'] = Object.keys(Memory.scouting).length;
    
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

        let mineral = room.find(FIND_MINERALS)[0];
        if (mineral) {
          Memory.stats['rooms.' + roomName + '.mineral.type.' + mineral.mineralType] = 1;
        }
        
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
    Memory.stats['cpu.getUsed'] = Game.cpu.getUsed()
  }