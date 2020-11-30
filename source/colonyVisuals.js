drawColony=function(colony,vis)
{
    let room = Game.rooms[colony.pos.roomName];
    if (true) 
    {
        if(!vis) {vis = new RoomVisual(colony.pos.roomName)}

        let pos = colony.pos;
        let center = new RoomPosition(colony.pos.x,colony.pos.y,colony.pos.roomName);

        //if(colony.layout)
        //{
        //    let buildings = DeserializeLayout(colony.layout,colony.pos.roomName);
        //    SetupMatrix(buildings);
//
        //    let mat = BuildingPathingMap(colony.pos.roomName);
        //    if(mat)
        //    {
        //        vis.DrawMatrix(mat);
        //        
        //        var pathToCore = PathFinder.search(new RoomPosition(11,32,center.roomName),[{pos:center,range:0}],{roomCallback:BuildingPathingMap,swampCost:1,plainCost:1,ignoreCreeps:true})
        //        
        //        vis.poly(pathToCore.path,{fill:"#00000000",stroke:"#FF0000"})
        //    }
        //}
        
        
        
        for(let miningSpot in colony.miningSpots)
        {
            let spot = colony.miningSpots[miningSpot];
            let missing = findMissing(spot.myPosition.x - 1, spot.myPosition.y - 1, spot.myPosition.roomName, spot.layout)
            
            let mvis = vis;
            if (colony.pos.roomName != spot.myPosition.roomName) 
            {
                mvis = new RoomVisual(spot.myPosition.roomName);
            }
            if(missing)
            {
                mvis.plan(spot.myPosition.x - 1, spot.myPosition.y - 1, missing)
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
            vis.stock(pos.x + 12,pos.y+2,room.storage,{scale:0.7,name:"Storage"})
        }
        if(room.terminal)
        {
            vis.stock(pos.x - 5.4,pos.y+2,room.terminal,{scale:0.7,name:"Terminal"})
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
            vis.recipe(pos.x - 6,pos.y - 4,colony.crafting,{radius:1.7,scale:0.7,scalePerLevel:1});
        }
        let amount = room.energyAvailable / room.energyCapacityAvailable;
        vis.rect(pos.x-0.5,pos.y-2.5,11*amount,1,{fill:"#FFFF00",stroke:"#00000000",opacity:0.6,strokeWidth:0.05})
        vis.rect(pos.x-0.5,pos.y-2.5,11,1,{fill:"#00000000",stroke:"#FFFFFF",opacity:1,strokeWidth:0.05})
        vis.text((room.energyAvailable + "/" + room.energyCapacityAvailable),pos.x+0.5,pos.y-2.8,{align:"left"})
        vis.symbol(pos.x,pos.y-3,RESOURCE_ENERGY,{scale:2})

        {
            let target = TARGET_WORKER_COUNT[colony.level];
            let count = colony.workersensus.length;
            vis.text("🧱" + count + "/" + target,pos.x-0.5,pos.y-0.75,{align:'left',color:"#FFFFFF"});
        }

        {
            
            let target = 2;
            target += Math.max(0,colony.miningSpots.length-3);
            if(colony.level > 6)
            {
                target /= 2;
            }
            let count = 0;
            if(colony.haulersensus)
            {
                count += colony.haulersensus.length;
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
        
        colony.miningSpots.forEach((spot) =>
        {
            if(spot.type == 'mineral')
            {
                let buildings = room.lookForAt(LOOK_STRUCTURES,spot.myPosition.x,spot.myPosition.y);
                if(buildings)
                {
                    buildings.forEach((s) =>
                    {
                        if(s.structureType == STRUCTURE_EXTRACTOR)
                        {
                            if(s.cooldown > 0)
                            {s
                                vis.Timer(s.pos.x,s.pos.y,s.cooldown,5,{color:"#ffff00",scale:0.5})
                            }
                        }
                    })
                }
            }
            else
            {
                if(spot.link)
                {
                    let l = Game.getObjectById(spot.link)
                    if(l.id != colony.recievelink && spot.time)
                    {
                        vis.Timer(l.pos.x,l.pos.y,spot.time%MINE_LINK_TRANSFERRATE,MINE_LINK_TRANSFERRATE,{color:"#00ff88",scale:0.5});
                        if(recievelink)
                        {
                            vis.line(l.pos.x,l.pos.y,recievelink.pos.x,recievelink.pos.y,{color:"#00ff00"});
                        }
                    }
                }
            }
        })

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
}