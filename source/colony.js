

colonyDismantle=function(colony)
{
    if(!colony.dimantlers) {colony.dimantlers = []}
    if(!colony.disTargets) {colony.disTargets = []}

    let target = Game.getObjectById(colony.disTargets[0])
    if (target) 
    {
        if(target.my && target instanceof Structure)
        {
            target.destroy();
            return;
        }
    }
    else if(colony.disTargets.length > 0)
    {
        colony.disTargets.shift();
        return;
    }

    for(let creep of Colony.Helpers.MaintainWorkers(colony,colony.dimantlers,!!target))
    {
        creep.say("💣");
        if (target) 
        {
            creep.dismantleLoop(target)
        }
    }
}

colonyConstruct=function(colony)
{
    if (typeof colony.constructionsite === "string") 
    {
        let construction = Game.constructionSites[colony.constructionsite]
        if (!construction) 
        {
            delete colony.constructionsite
        }
        else
        {
            colony.workerpool.forEach((c) => 
            {
                let creep = Game.creeps[c];
                if (creep) 
                {
                    creep.updateHarvestState()
                    if (creep.memory.harvesting) 
                    {
                        if(creep.pos.roomName != colony.pos.roomName && creep.room.sources.length == 0)
                        {
                            creep.travelTo(new RoomPosition(colony.pos.x,colony.pos.y,colony.pos.roomName));   
                        }
                        else
                        {
                            creep.dumbHarvest()
                        }
                    }
                    else
                    {
                        let code;
                        if (construction instanceof Structure) 
                        {
                            code = creep.do("repair",construction)
                            if (construction.hits == construction.hitsMax) 
                            {    
                                delete colony.constructionsite
                            }
                        }
                        else
                        {
                            code = creep.do("build",construction)
                        }
                        
                        if (code == ERR_NOT_IN_RANGE) 
                        {
                            creep.travelTo(construction)
                        }
                    }
                }
            })
        }
    }
    else
    {
        let sites = Game.rooms[colony.constructionsite.roomName].lookForAt(LOOK_CONSTRUCTION_SITES,colony.constructionsite.x,colony.constructionsite.y)
        if(sites.length > 0)
        {
            colony.constructionsite = sites[0].id
        }
        else
        {
            delete colony.constructionsite;
        }
    }
}