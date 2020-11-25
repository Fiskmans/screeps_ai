
applyFlags=function()
{
    if (Game.time % 7 != 0) 
    {
        return;
    }
    let flags = Game.flags;
    if (flags["HaltWars"]) 
    {
        if (Memory.wars) 
        {
            for(let name in Memory.wars)
            {
                for(let roomname in Memory.wars[name].battlefronts)
                {
                    Memory.wars[name].battlefronts[roomname].halt = 1
                }
            }
        }
        flags["HaltWars"].remove()
    }
    if (flags["ResumeWars"]) 
    {
        if (Memory.wars) 
        {
            for(let name in Memory.wars)
            {
                for(let roomname in Memory.wars[name].battlefronts)
                {
                    if (Memory.wars[name].battlefronts[roomname].halt) {
                        delete Memory.wars[name].battlefronts[roomname].halt
                    }
                }
            }
        }
        flags["ResumeWars"].remove()
    }
    if (flags["StartColony"]) 
    {
        let startcolony = flags["StartColony"];
        addColony(startcolony.pos)
        startcolony.remove();
    }

    if(flags["AbandonRoad"])
    {
        let pos = flags["AbandonRoad"].pos;
        Memory.colonies.forEach(colony => 
            {
                for(let wayIndex in colony.highways)
                {
                    for(let pathIndex in colony.highways[wayIndex].path)
                    {
                        let pos2 = new RoomPosition(colony.highways[wayIndex].path[pathIndex].x,colony.highways[wayIndex].path[pathIndex].y,colony.highways[wayIndex].path[pathIndex].roomName);
                        if (pos.x == pos2.x && pos.y == pos2.y && pos.roomName == pos2.roomName) 
                        {
                            console.log("removing road number " + wayIndex + " from " + colony.pos.roomName);
                            colony.highways.splice(wayIndex,1);
                            break;
                        }
                    }
                }
            })
        flags["AbandonRoad"].remove()
    }
    if(flags["RemoveMine"])
    {
        let pos = flags["RemoveMine"].pos;
        Memory.colonies.forEach(colony => 
            {
                for(let index in colony.miningSpots)
                {
                    let pos2 = new RoomPosition(colony.miningSpots[index].myPosition.x,colony.miningSpots[index].myPosition.y,colony.miningSpots[index].myPosition.roomName);
                    if (pos.x == pos2.x && pos.y == pos2.y && pos.roomName == pos2.roomName) 
                    {
                        console.log("removing mine number " + index + " from " + colony.pos.roomName);
                        colony.miningSpots.splice(index,1);
                        break;
                    }
                }
            })
        flags["RemoveMine"].remove()
    }
    if (flags["Mine"]) 
    {
        let colony = FindClosestColony(flags["Mine"].pos.roomName,true)
        if (colony) 
        {
            let room = flags["Mine"].room;
            if (room) 
            {
                if (flags["Mine"].room && !flags["StartRoad"] && !flags["EndRoad"]) 
                {
                    AddMiningSpot(colony,new MiningSpot(flags["Mine"].pos));
                    room.createFlag(flags["Mine"].pos,"EndRoad");
                    Game.rooms[colony.pos.roomName].createFlag(colony.pos.x+5,colony.pos.y+5,"StartRoad");
                    flags["Mine"].remove();
                }
                else
                {
                    console.log("start/endroad flags are busy");
                }
            }
            else
            {
                if (!Memory.scouting[flags["Mine"].pos.roomName]) 
                {
                    console.log("scouting " + flags["Mine"].pos.roomName + " to start mining");
                    Memory.scouting[flags["Mine"].pos.roomName] = false;
                }
                
            }
        }
        else
        {
            console.log("Could not find colony for mine flag")
        }
    }
    if (flags["Discard"]) 
    {
        let pos = flags["Discard"].pos;
        
        Memory.data.posexpansions = _.filter(Memory.data.posexpansions, (e) => {
            return e.roomName != pos.roomName || Math.abs(pos.x - e.x) > 3 || Math.abs(pos.y - e.y) > 3;
        })
        flags["Discard"].remove();
    }
    if(flags["Analyze"])
    {
        let flag = flags["Analyze"]
        analyzeRoom(flag.pos.roomName);
        flag.remove();
    }
    if(flags["Scout"])
    {
        let roomName = "";
        if (flags["LocalCluster"]) 
        {
            let lx = flags["LocalCluster"].pos.x;
            let ly = flags["LocalCluster"].pos.y;
            let sx = flags["Scout"].pos.x;
            let sy = flags["Scout"].pos.y;
            let dx = sx - lx - 2;
            let dy = 10 - (sy - ly - 2);
            if (dx < 0 || dx > 9 ||dy < 0 || dy > 9) 
            {
                roomName = flags["Scout"].pos.roomName;
            }
            else
            {   
                let [segx,segy] = PosFromRoomName(flags["Scout"].pos.roomName);
                let resx = Math.floor(segx/10)*10 + dx;
                let resy = Math.floor(segy/10)*10 + dy;
                roomName = RoomNameFromPos([resx,resy]);
            }
        }
        else
        {
            roomName = flags["Scout"].pos.roomName;
        }
        if (!Memory.scouting[roomName]) {
            Memory.scouting[roomName] = false;
        }
        
        flags["Scout"].remove();
    }
    
    if(flags["MarkAsOwned"])
    {
        let roomName = "";
        if (flags["LocalCluster"]) 
        {
            let lx = flags["LocalCluster"].pos.x;
            let ly = flags["LocalCluster"].pos.y;
            let sx = flags["MarkAsOwned"].pos.x;
            let sy = flags["MarkAsOwned"].pos.y;
            let dx = sx - lx - 2;
            let dy = 10 - (sy - ly - 2);
            if (dx < 0 || dx > 9 ||dy < 0 || dy > 9) 
            {
                roomName = flags["MarkAsOwned"].pos.roomName;
            }
            else
            {   
                let [segx,segy] = PosFromRoomName(flags["MarkAsOwned"].pos.roomName);
                let resx = Math.floor(segx/10)*10 + dx;
                let resy = Math.floor(segy/10)*10 + dy;
                roomName = RoomNameFromPos([resx,resy]);
            }
        }
        else
        {
            roomName = flags["MarkAsOwned"].pos.roomName;
        }
        if (!Memory.rooms[roomName]) 
        {
            Memory.rooms[roomName] = {}
        }
        Memory.rooms[roomName].avoid = 1;
        
        SetMapData(roomName,"nogo","X");
        flags["MarkAsOwned"].remove();
    }
    
    if(flags["StartRoad"] && flags["EndRoad"])
    {
        let startflag = flags["StartRoad"];
        let endflag = flags["EndRoad"];
        
        if (startflag.color != COLOR_RED && endflag.color != COLOR_RED) 
        {
            let startpos = startflag.pos;
            let endpos = endflag.pos;
            let col = false;
            
            for(let id in Memory.colonies)
            {
                let colony = Memory.colonies[id];
                if (startpos.roomName == colony.pos.roomName) 
                {
                    col = colony;
                    break;
                }
            }
            if (col) 
            {
                col.highways.push(new Highway(startpos,endpos));
                startflag.remove();
                endflag.remove();
            }
            else
            {
                startflag.setColor(COLOR_RED);
                endflag.setColor(COLOR_RED);
            }
        }
    }
    
    if(flags["StartAttack"],flags["Attack"])
    {
        let startflag = flags["StartAttack"];
        let endflag = flags["Attack"];
        
        if (startflag.color != COLOR_RED && endflag.color != COLOR_RED) 
        {
            let startpos = startflag.pos;
            let endpos = endflag.pos;
            let col = false;
            
            for(let id in Memory.colonies)
            {
                let colony = Memory.colonies[id];
                if (startpos.roomName == colony.pos.roomName) 
                {
                    col = colony;
                    break;
                }
            }
            if (col) 
            {
                col.attacking = endflag.pos.roomName;
                endflag.remove();
            }
            else
            {
                startflag.setColor(COLOR_RED);
                endflag.setColor(COLOR_RED);
            }
        }
    }
    
    if(flags["Abandon"])
    {
        for (var i = 0; i < Memory.colonies.length; i++) {
            let roomname = Memory.colonies[i].pos.roomName
            if (roomname == flags["Abandon"].pos.roomName) 
            {
                let room = Game.rooms[roomname];
                if(room)
                {
                    let buildings = room.find(FIND_MY_STRUCTURES,{filter: (s) => s.structureType != STRUCTURE_CONTROLLER});
                    if (buildings.length > 0) {
                        console.log("Removing buildings")
                        buildings.forEach((s) =>
                        {
                            s.destroy();
                        })
                    }
                    else
                    {
                        let creeps = room.find(FIND_MY_CREEPS);
                        if (creeps.length > 0) 
                        {
                            console.log("Orphaning creeps")
                            let closest = FindClosestColony(roomname,false);
                            if (closest) 
                            {
                                creeps.forEach((c) =>
                                {
                                    if (c.getActiveBodyparts(MOVE) > 0) 
                                    {
                                        if (c.getActiveBodyparts(CARRY) > 0) 
                                        {
                                            if (c.getActiveBodyparts(WORK) > 0) 
                                            {
                                                closest.workerpool.push(c.name);
                                            }
                                            else
                                            {
                                                closest.haulerpool.push(c.name);
                                            }
                                        }
                                    }
                                })    
                            }
                        }
                        console.log("Unclaiming room")
                        room.controller.unclaim();
                        Memory.colonies.splice(i,1)
                        flags["Abandon"].remove();
                    }
                }
                break;
            }
        }
    }
    
    if(Memory.wars)
    {
        for(let name in Memory.wars)
        {
            if (flags[name]) 
            {
                if(!Memory.wars.battlefronts) { Memory.wars.battlefronts = {}}
                let roomname = flags[name].pos.roomName;
                if (!Memory.wars[name].battlefronts[roomname]) 
                {
                    Memory.wars[name].battlefronts[roomname] = {};
                }
                flags[name].remove()
            }
        }
    }
}