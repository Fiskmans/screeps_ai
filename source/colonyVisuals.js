drawColony=function(colony,vis)
{

    let room = Game.rooms[colony.pos.roomName];
    if (room && Memory.rooms && Memory.rooms[room.name] && (Game.time - Memory.rooms[room.name].lastViewed < 10)) 
    {
        if(!vis) {vis = new RoomVisual(colony.pos.roomName)}
        //vis.blocked(getBlocked(colony.pos.x,colony.pos.y,colony.pos.roomName,layout.structures[7]),{fill:"#FF0000"})
        let missing = findMissing(colony.pos.x,colony.pos.y,colony.pos.roomName, layout.structures[Game.rooms[colony.pos.roomName].controller.level])
        if (missing) {
            vis.plan(colony.pos.x,colony.pos.y,missing)
            let prio = Priorotized(colony.pos.x,colony.pos.y,colony.pos.roomName,missing)
            if (prio && prio.pos) {
                vis.circle(prio.pos.x,prio.pos.y,{fill:"#00FF00",opacity:0.2,radius:0.8})
            }
        }
        
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
        for(let h in colony.highways)
        {
            let highway = colony.highways[h]
            for(let p in highway.path)
            {
                let pos = highway.path[p]
                if (_.last(visuals).roomName != pos.roomName) 
                {
                    visuals.push(new RoomVisual(pos.roomName))
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
            vis.stock(colony.pos.x + 12,colony.pos.y+2,room.storage,{scale:0.7})
        }
        if(room.terminal)
        {
            vis.stock(colony.pos.x - 5.4,colony.pos.y+2,room.terminal,{scale:0.7})
        }
        let amount = room.energyAvailable / room.energyCapacityAvailable;
        vis.rect(colony.pos.x-0.5,colony.pos.y-2.5,11*amount,1,{fill:"#FFFF00",stroke:"#00000000",opacity:0.6,strokeWidth:0.05})
        vis.rect(colony.pos.x-0.5,colony.pos.y-2.5,11,1,{fill:"#00000000",stroke:"#FFFFFF",opacity:1,strokeWidth:0.05})
        vis.text((room.energyAvailable + "/" + room.energyCapacityAvailable),colony.pos.x+0.5,colony.pos.y-2.8,{align:"left"})
        vis.symbol(colony.pos.x,colony.pos.y-3,RESOURCE_ENERGY,{scale:2})
    }
}