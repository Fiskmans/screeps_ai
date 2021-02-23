
drawColony=function(colony)
{
    if (!(Helpers.Externals.IsRoomVisible(colony.pos.roomName) && Game.cpu.bucket > 500)) 
    {
        return;
    }
    let room = Game.rooms[colony.pos.roomName];
    if(!room)
    {
        return;
    }
    let vis = new RoomVisual(colony.pos.roomName)

    let pos = colony.pos;
    let center = new RoomPosition(colony.pos.x,colony.pos.y,colony.pos.roomName);

    let controllerPercent = room.controller.progress/room.controller.progressTotal;
    vis.text(
        (controllerPercent*100).toFixed(2) + "%",
        room.controller.pos.x + 1.9,
        room.controller.pos.y + 0.8,
        {
            font:0.3,
            color:"#" + lerpColor(0xFFAAAA,0xAAFFAA,controllerPercent).toString(16),
            align:"right"
        });

    let controllerDelta = room.controller.progress - colony.lastProgress || 0;
    vis.text(
        "+" + controllerDelta,
        room.controller.pos.x + 1.9,
        room.controller.pos.y + 0.4,
        {
            font:0.3,
            color:"#" + lerpColor(0xFFAAAA,0xAAFFAA,controllerPercent).toString(16),
            align:"right"
        });

    colony.lastProgress = room.controller.progress;
    if(colony.layout)
    {
        let buildings = DeserializeLayout(colony.layout,colony.pos.roomName);
        
        let minx = 50;
        let miny = 50;
        
        for(let b of buildings)
        {
            minx = Math.min(b.pos.x, minx);
            miny = Math.min(b.pos.y, miny);
        }
        pos = new RoomPosition(minx,miny,colony.pos.roomName);
        
        if(colony.subLayouts)
        {
            for(let layout of Object.values(colony.subLayouts))
            {
                buildings = buildings.concat(DeserializeLayout(layout,colony.pos.roomName));
            }
        }
        
        vis.layout(buildings);
    }
    
    if(colony.requests)
    {
        let counts = {}
        for(let req of colony.requests)
        {
            let obj = Game.getObjectById(req.id);
            if(obj)
            {
                let action = '';
                if(req == REQUEST_ACTION_FILL)
                {
                    action = '⬆️';
                }
                else
                {
                    action = '⬇️';
                }
                let index = counts[obj.id] || 0;
                counts[obj.id] = index + 1;
                vis.text(action,obj.pos.x-0.15,obj.pos.y-0.2 + 0.25*index,{align:'right',font:0.2});
                vis.symbol(obj.pos.x+0.3,obj.pos.y-0.28 + 0.25*index, req.resource,{scale:0.3})
            }
        }
    }

    if(colony.planner)
    {
        for(let tag in colony.planner)
        {
            let stash = colony.planner[tag];
            if(stash.bestPos)
            {
                const tot = (48.0*48.0*2.0);
                vis.text("Planner: " + tag + " " + ((tot - stash.queue.length) / tot * 100.0).toFixed(2) + "%",stash.bestPos.x,stash.bestPos.y-1);
                vis.circle(stash.bestPos.x,stash.bestPos.y,{fill:"#00FF00"})
            }
        }
    }

    for(let lab of room.Structures(STRUCTURE_LAB))
    {
        let task = lab.memory.task;
        if(task)
        {
            vis.symbol(lab.pos.x,lab.pos.y-0.2,task.resource,{scale:0.4});
        }
    }
    
    {
        let index = Memory.colonies.indexOf(colony);
        vis.text("Nr." + index,49,49,{font:2,align:"right"});
    }
    
    if(colony.haulerpool)
    {
        for(let cname of colony.haulerpool)
        {
            Game.creeps[cname].DrawWork(vis,{baseRoom:colony.pos.roomName});
        }
    }
    for(let list of Object.values(colony.workerRoster))
    {
        for(let creep of Helpers.Creep.List(list))
        {
            creep.DrawWork(vis,{baseRoom:colony.pos.roomName});
        }
    }
    if(colony.kickStart)
    {
        for(let cname of colony.kickStart.workers)
        {
            Game.creeps[cname].DrawWork(vis,{baseRoom:colony.pos.roomName});
        }
        for(let cname of colony.kickStart.miners)
        {
            Game.creeps[cname].DrawWork(vis,{baseRoom:colony.pos.roomName});
        }
    }
    
    
    let visuals = []
    visuals.push(vis)
    let roadPanels = [];
    for(let h in colony.highways)
    {
        roadPanels.push([])
        let highway = colony.highways[h]
        for(let p in highway.path)
        {
            let pos = highway.path[p]
            if (_.last(visuals).roomName != pos.roomName) 
            {
                visuals.push(new RoomVisual(pos.roomName))
            }
            else
            {
                if(p < highway.path.length/2)
                {
                    roadPanels[h] = [pos.x,pos.y];
                }
            }
            let roadroom = Game.rooms[pos.roomName];
            let road = false;
            if (roadroom) 
            {
                let structs = roadroom.lookForAt(LOOK_STRUCTURES,pos.x,pos.y)
                for(let s of structs)
                {
                    if (s.structureType == STRUCTURE_ROAD) 
                    {
                        road = true
                        break;
                    }
                }
            }
            
            if (!road) 
            {
                _.last(visuals).symbol(pos.x,pos.y,STRUCTURE_ROAD)
            }
        }
    }
    
    for(var key in visuals)
    {
        visuals[key].connectRoads()
    }
    
    if (room.storage) 
    {
        vis.stock(pos.x + 12,pos.y+2,room.storage,{scale:0.7,name:"Storage",showPrice:true})
    }
    if(room.terminal)
    {
        vis.stock(pos.x - 5.4,pos.y+2,room.terminal,{scale:0.7,name:"Terminal",showPrice:true})
        if(colony.selling.length > 0)
        {
            vis.text("📦",pos.x-5.2,pos.y+1.3);
            let x = pos.x - 4.5
            let y = pos.y + 1.2
            colony.selling.forEach((r) =>
            {
                vis.symbol(x,y,r,{scale:0.5})
                x += 0.5;
            })
        }
        if(room.terminal.cooldown > 0)
        {
            vis.Timer(room.terminal.pos.x,room.terminal.pos.y,room.terminal.cooldown,10,{scale:0.7,color:"#FFFF00"})
        }
    }
    if(room.factory)
    {
        vis.stock(pos.x - 10,pos.y+2,room.factory,{scale:0.7,name:"Factory"})
        if(room.factory.cooldown > 0)
        {
            vis.Timer(room.terminal.pos.x,room.terminal.pos.y,room.factory.cooldown,20,{scale:0.7,color:"#FFFF00"})
        }
    }
    if(colony.crafting)
    {
        //vis.recipe(pos.x - 6,pos.y - 4,colony.crafting,{radius:1.7,scale:0.7,scalePerLevel:1});
    }
    let amount = room.energyAvailable / room.energyCapacityAvailable;
    vis.rect(pos.x-0.5,pos.y-2.5,11*amount,1,{fill:"#FFFF00",stroke:"#00000000",opacity:0.6,strokeWidth:0.05})
    vis.rect(pos.x-0.5,pos.y-2.5,11,1,{fill:"#00000000",stroke:"#FFFFFF",opacity:1,strokeWidth:0.05})
    vis.text((room.energyAvailable + "/" + room.energyCapacityAvailable),pos.x+0.5,pos.y-2.8,{align:"left"})
    vis.symbol(pos.x,pos.y-3,RESOURCE_ENERGY,{scale:2})

    {
        let target = colony.targetWorkers || "?";
        let count = colony.workersensus.length;
        vis.text("🧱" + count + "/" + target,pos.x-0.5,pos.y-0.75,{align:'left',color:"#FFFFFF"});
    }

    {
        
        let target = colony.targetHaulers || "?";
        let count = "?";
        if(colony.haulersensus)
        {
            count = colony.haulersensus.length;
        }
        vis.text(count + "/" + target + "📦",pos.x+10.5,pos.y-0.75,{align:'right',color:"#FFFFFF"});
    }

    let minerals = room.find(FIND_MINERALS);
    if(minerals.length > 0)
    {
        let mineral = minerals[0];
        if(mineral.ticksToRegeneration > 0)
        {
            vis.Timer(mineral.pos.x,mineral.pos.y,mineral.ticksToRegeneration,MINERAL_REGEN_TIME,{color:"#00ff00"});
        }
    }
    let recievelink = false;
    if(colony.recievelink)
    {
        recievelink = Game.getObjectById(colony.recievelink);
    }

    if(colony.expedition)
    {
        let exp = colony.expedition;
        let bank = Game.getObjectById(exp.target);


        vis.text("Expedition",45.5,1.5);
        vis.symbol(43,2,RESOURCE_POWER);
        vis.text("x" + exp.amount,43.5,2.3,{align:"left"})
        vis.text("⚔️x" + exp.attackers.length,42.5,3.5,{align:"left"});
        vis.text("🚑x" + exp.healers.length,42.5,4.5,{align:"left"});
        vis.text("🧺x" + exp.haulers.length,42.5,5.5,{align:"left"});
        vis.text((exp.endDate - Game.time) + " ⏰", 48.5,2.3,{align:"right"});
        vis.text((exp.targetRoom) + " 🗺️", 48.5,4.3,{align:"right"});

        let carryCapacity = 0;
        exp.haulers.forEach((name) =>
        {
            let creep = Game.creeps[name];
            if(creep)
            {
                carryCapacity += creep.store.getFreeCapacity();
            }
        })
        let carryProcent = Math.min(carryCapacity/exp.amount,1);
        vis.rect(44.5,4.7,0.1,1,{ fill:"#000000FF",stroke:"#FFFFFF",strokeWidth:0.03,opacity:1 });
        vis.rect(44.5,4.7,0.1,1*carryProcent,{ fill:"#00FF00",opacity:1 });

        if(bank)
        {
            let state = bank.hits / bank.hitsMax;
            let delta = state - exp.lastKnownState;
            exp.lastKnownState = state;

            let expectedVictory = state/delta;

            let VictoryProcent = (expectedVictory)/5000 + (exp.endDate - Game.time) / 5000;
            vis.text(-Math.ceil(expectedVictory) + " 💣", 48.5,3.2,{align:"right",font:0.3});
            
            vis.rect(45.5,2.5,3,0.1,{ fill:"#000000FF",stroke:"#FFFFFF",strokeWidth:0.03,opacity:1 });
            vis.rect(45.5,2.5,3 * (exp.endDate - Game.time) / 5000,0.1,{ fill:"#FFFF00",opacity:1 });
            vis.line(45.5 + 3 * VictoryProcent,2.5,45.5 + 3 * VictoryProcent,2.6,{width:0.03,color:"#000000",opacity:1});

            vis.rect(45.5,2.65,3,0.1,{ fill:"#000000FF",stroke:"#FFFFFF",strokeWidth:0.03,opacity:1 });
            vis.rect(45.5,2.65,3 * bank.hits / bank.hitsMax,0.1,{ fill:"#FF0000",opacity:1 });
        }
    }
}