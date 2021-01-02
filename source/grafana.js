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
    Memory.stats['gpl.progress'] = Game.gpl.progress;
    Memory.stats['gpl.progressTotal'] = Game.gpl.progressTotal;
    Memory.stats['gpl.level'] = Game.gpl.level;
    
    Memory.stats['colonies.count'] = Memory.colonies.length;
    Memory.stats['scouting.targets'] = Object.keys(Memory.scouting).length;
    
    Memory.stats['store'] = {};
    _.forEach(Memory.colonies, function(colony){

      let roomName = colony.pos.roomName;
      let room = Game.rooms[roomName]
      
      if(!room)
      {
        return;
      }


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
        {
          let hits = 0;
          let maxHits = 0;
          room.find(FIND_MY_STRUCTURES,{filter:(s) => {return s.structureType == STRUCTURE_RAMPART}}).forEach(
            (s) =>
            {
              hits += s.hits;
            }
          )
          if(colony.layout)
          {
            maxHits = colony.layout.length / 3 * (RAMPARTS_HITS_TO_IGNORE[colony.level] || 1);
          }
          else
          {
            maxHits = layout.rampartCount[colony.level] * (RAMPARTS_HITS_TO_IGNORE[colony.level] || 1);
          }

          Memory.stats['rooms.' + roomName + '.rampartshits'] = hits;
          Memory.stats['rooms.' + roomName + '.rampartshitsmax'] = maxHits;
        }
          
      }
    })
    Memory.stats['cpu.getUsed'] = Game.cpu.getUsed()
  }