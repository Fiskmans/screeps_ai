

GrafanaDeadRoom=function(colony,roomName)
{
  let roomStat = {};
  
  Memory.stats["rooms"].dead[roomName] = roomStat;
}

GrafanaMaxRoom=function(colony,roomName,room)
{
  let roomStat = {};

  roomStat['spawn.energy'] = room.energyAvailable
  roomStat['spawn.energyTotal'] = room.energyCapacityAvailable
  
  if(room.storage){
    let store = room.storage.store;
    roomStat['storage.energy'] = store.getUsedCapacity(RESOURCE_ENERGY);
    roomStat['storage.other'] = store.getUsedCapacity() - store.getUsedCapacity(RESOURCE_ENERGY);
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

    maxHits = colony.layout.length / 3 * (RAMPARTS_HITS_TO_IGNORE[colony.level] || 1);

    roomStat['rampartshits'] = hits;
    roomStat['rampartshitsmax'] = maxHits;
  }
  Memory.stats["rooms"].max[roomName] = roomStat;

  for(let event of room.getEventLog())
  {
    if(event.event == EVENT_UPGRADE_CONTROLLER)
    {
      colony.gcl_contribution = (colony.gcl_contribution || 0) + event.data.amount;
    }
  }
  roomStat["gcl_contribution"] = colony.gcl_contribution;
}

GrafanaGrowingRoom=function(colony,roomName,room)
{
  let roomStat = {};
  roomStat['rcl.level'] = room.controller.level
  roomStat['rcl.progress'] = room.controller.progress
  roomStat['rcl.progressTotal'] = room.controller.progressTotal
  
  roomStat['spawn.energy'] = room.energyAvailable
  roomStat['spawn.energyTotal'] = room.energyCapacityAvailable
  
  if(room.storage){
    let store = room.storage.store;
    roomStat['storage.energy'] = store.getUsedCapacity(RESOURCE_ENERGY);
    roomStat['storage.other'] = store.getUsedCapacity() - store.getUsedCapacity(RESOURCE_ENERGY);
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

    maxHits = colony.layout.length / 3 * (RAMPARTS_HITS_TO_IGNORE[colony.level] || 1);

    roomStat['rampartshits'] = hits;
    roomStat['rampartshitsmax'] = maxHits;
  }
  Memory.stats["rooms"].growing[roomName] = roomStat;
}

GrafanaRoom=function(colony,roomName)
{
  let room = Game.rooms[roomName];

  if(!room || !(room.controller && room.controller.my))
  {
    GrafanaDeadRoom(colony,roomName);
    return;
  }

  if(room.storage){
    let store = room.storage.store;
    Object.keys(store).forEach((r) =>
    {
      let amount = store.getUsedCapacity(r)
      if(amount > 0)  
      {
        if(!Memory.stats['store'][r]) {Memory.stats['store'][r] = 0};
        Memory.stats['store'][r] += amount;
      }
    })
  }
  if(room.terminal){
    let store = room.terminal.store;
    Object.keys(store).forEach((r) =>
    {
      let amount = store.getUsedCapacity(r)
      if(amount > 0)  
      {
        if(!Memory.stats['store'][r]) {Memory.stats['store'][r] = 0};
        Memory.stats['store'][r] += amount;
      }
    })
  }
  if(room.factory){
    let store = room.factory.store;
    Object.keys(store).forEach((r) =>
    {
      let amount = store.getUsedCapacity(r)
      if(amount > 0)  
      {
        if(!Memory.stats['store'][r]) {Memory.stats['store'][r] = 0};
        Memory.stats['store'][r] += amount;
      }
    })
  }

  if(room.controller.level < 8)
  {
    GrafanaGrowingRoom(colony,roomName,room);
    return;
  }

  GrafanaMaxRoom(colony,roomName,room);
}

GrafanaRooms=function()
{
  Memory.stats['rooms'] = {max:{},growing:{},dead:{}};
  Memory.stats['store'] = {};

  for(let colony of Object.values(Memory.colonies))
  {
    GrafanaRoom(colony,colony.pos.roomName);
  };
}

UpdateGrafanaStats=function()
{
    Memory.stats["game.time"] = Game.time;
    Memory.stats["game.recompiles"] = Memory.recompiles;
    Memory.stats["game.resources"] = {};
    for(let r in Game.resources)
    {
      Memory.stats["game.resources"][r] = Game.resources[r];
    } 
    Memory.stats["game.time"] = Game.time;
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
    
    Memory.stats['creep.count'] = Object.keys(Game.creeps).length;

    GrafanaRooms();
    Memory.stats['cpu.getUsed'] = Game.cpu.getUsed();
  }

  GrafanaSold=function(resource,amount,costPerUnit)
  {
    if(!Memory.stats) { Memory.stats = {}; }
    if(!Memory.stats.market) { Memory.stats.market = {}; }
    if(!Memory.stats.market.sold ) { Memory.stats.market.sold = {}; }
    if(!Memory.stats.market.earned ) { Memory.stats.market.earned = {}; }

    if(!Memory.stats.market.sold[resource]) { Memory.stats.market.sold[resource] = 0; }
    if(!Memory.stats.market.earned[resource]) { Memory.stats.market.earned[resource] = 0; }

    Memory.stats.market.sold[resource] += amount;
    Memory.stats.market.earned[resource] += amount * costPerUnit;
  }