
REFILLPRIORITY = 
{
    [STRUCTURE_TOWER]:0,
    [STRUCTURE_SPAWN]:50,
    [STRUCTURE_EXTENSION]:55,
    [STRUCTURE_LAB]:100,
    [STRUCTURE_TERMINAL]:150,
    [STRUCTURE_STORAGE]:450
}



Room.prototype.refillable=function()
{
    let all = [];
    
    this.findAllStructures();
    all = _.filter(this._structures[STRUCTURE_EXTENSION].concat(this._structures[STRUCTURE_SPAWN].concat(this._structures[STRUCTURE_LAB])),
    (s) => 
    {
        return s.store.getFreeCapacity(RESOURCE_ENERGY) > 0; 
    });
    all = all.concat(_.filter(this._structures[STRUCTURE_TOWER],(s)=>
    {
        return s.store.getFreeCapacity(RESOURCE_ENERGY) > 400;
    }))
    all = all.concat(_.filter(this._structures[STRUCTURE_POWER_SPAWN],(s)=>
    {
        return s.store.getFreeCapacity(RESOURCE_ENERGY) > 1000;
    }))
    
    return all;
}


Room.prototype.hostiles=function()
{
    if(!this._hostiles)
    {
        this._hostiles = [];
        this._hostiles = this.find(FIND_HOSTILE_CREEPS);
        if(this.controller && !this.controller.my)
        {
            this._hostiles = this._hostiles.concat(this.find(FIND_STRUCTURES,
                {   filter:(s) => 
                    {
                        return !s.my 
                            && s.structureType != STRUCTURE_CONTROLLER 
                            && s.structureType != STRUCTURE_ROAD 
                            && s.structureType != STRUCTURE_CONTAINER 
                            && s.hits > 0;
                    }
                }));
        }
    }
    return this._hostiles;
}

Room.prototype.findAllStructures=function()
{
    if(!this._structures)
    {
        this._structures = {};
        Object.keys(CONSTRUCTION_COST).forEach((s) => this._structures[s] = [])
        this._structures[STRUCTURE_CONTROLLER] = []
        this._structures[STRUCTURE_INVADER_CORE] = []
        this._structures[STRUCTURE_POWER_BANK] = []
        this._structures[STRUCTURE_KEEPER_LAIR] = []
        this._structures[STRUCTURE_PORTAL] = []
        
        this.find(FIND_STRUCTURES).forEach((s) => {
                this._structures[s.structureType].push(s)
        })
    }
}

Room.prototype.Structures=function(type)
{
    this.findAllStructures();
    return this._structures[type];
}

Room.prototype.PopulateShorthands=function()
{
    this.findAllStructures();

    let ShorthandFirstOfType    =   function(type,room,alias) { if(room._structures[type] && room._structures[type].length > 0) {room[alias] = room._structures[type][0]} }
    let ShorthandType           =   function(type,room,alias) { room[alias] = room._structures[type] }

    ShorthandFirstOfType(STRUCTURE_FACTORY,this,"factory");
    ShorthandFirstOfType(STRUCTURE_NUKER,this,"nuker");
    ShorthandFirstOfType(STRUCTURE_OBSERVER,this,"observer");
    ShorthandFirstOfType(STRUCTURE_EXTRACTOR,this,"extractor");
    ShorthandFirstOfType(STRUCTURE_INVADER_CORE,this,"invaderCore");
    ShorthandFirstOfType(STRUCTURE_POWER_BANK,this,"powerBank");
    ShorthandFirstOfType(STRUCTURE_POWER_SPAWN,this,"powerSpawn");

    ShorthandType(STRUCTURE_CONTAINER,this,"containers");
    ShorthandType(STRUCTURE_ROAD,this,"roads");
    ShorthandType(STRUCTURE_TOWER,this,"towers");
    ShorthandType(STRUCTURE_SPAWN,this,"spawns");
    ShorthandType(STRUCTURE_PORTAL,this,"portals");

    this["sources"] = this.find(FIND_SOURCES);
}