Unplan=function(flag)
{
    let pos = flag.pos;
    for (let colony of Memory.colonies) 
    {
        if(colony.pos.roomName == pos.roomName && colony.layout)
        {
            let buildings = DeserializeLayout(colony.layout,pos.roomName);
            for(let i = 0;i < buildings.length;i++)
            {
                if(buildings[i].pos.x == pos.x && buildings[i].pos.y == pos.y)
                {
                    buildings.splice(i,1);
                    break;
                }
            }
            colony.layout = SerializeLayout(buildings);
            flag.remove();
            break;
        }
    }
}


StartColony=function(flag)
{
    Colony.Starter.Generate(flag.pos);
    flag.remove();
}

AbandonRoad=function(flag)
{
    
    let pos = flag.pos;
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
        });
    flag.remove()
}

RemoveMine=function(flag)
{
    let pos = flag.pos;
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
        flag.remove()
}

Mine=function(flag)
{
    let colony = FindClosestColony(flag.pos.roomName,true)
    if (colony) 
    {
        let room = flag.room;
        if (room) 
        {
            AddMiningSpot(colony,new MiningSpot(flag.pos));
            flag.remove();
        }
        else
        {
            if (!Memory.scouting[flag.pos.roomName]) 
            {
                console.log("scouting " + flag.pos.roomName + " to start mining");
                Memory.scouting[flag.pos.roomName] = false;
            }
            
        }
    }
    else
    {
        console.log("Could not find colony for mine flag")
    }
}

Discard=function(flag)
{
    
    let pos = flag.pos;
        
    Memory.data.posexpansions = _.filter(Memory.data.posexpansions, (e) => {
        return e.roomName != pos.roomName || Math.abs(pos.x - e.x) > 3 || Math.abs(pos.y - e.y) > 3;
    })
    flag.remove();
}

Analyze=function(flag)
{
    analyzeRoom(flag.pos.roomName);
    flag.remove();
}

Scout=function(flag)
{
    let roomName = "";
    let flags = Game.flags;
    if (flags["LocalCluster"]) 
    {
        let lx = flags["LocalCluster"].pos.x;
        let ly = flags["LocalCluster"].pos.y;
        let sx = flag.pos.x;
        let sy = flag.pos.y;
        let dx = sx - lx - 2;
        let dy = 10 - (sy - ly - 2);
        if (dx < 0 || dx > 9 ||dy < 0 || dy > 9) 
        {
            roomName = flag.pos.roomName;
        }
        else
        {   
            let [segx,segy] = PosFromRoomName(flag.pos.roomName);
            let resx = Math.floor(segx/10)*10 + dx;
            let resy = Math.floor(segy/10)*10 + dy;
            roomName = RoomNameFromPos([resx,resy]);
        }
    }
    else
    {
        roomName = flag.pos.roomName;
    }
    if (!Memory.scouting[roomName]) {
        Memory.scouting[roomName] = false;
    }
    
    flag.remove();
}

MarkAsOwned=function(flag)
{
    let roomName = "";
    if (flags["LocalCluster"]) 
    {
        let lx = flags["LocalCluster"].pos.x;
        let ly = flags["LocalCluster"].pos.y;
        let sx = flag.pos.x;
        let sy = flag.pos.y;
        let dx = sx - lx - 2;
        let dy = 10 - (sy - ly - 2);
        if (dx < 0 || dx > 9 ||dy < 0 || dy > 9) 
        {
            roomName = flag.pos.roomName;
        }
        else
        {   
            let [segx,segy] = PosFromRoomName(flag.pos.roomName);
            let resx = Math.floor(segx/10)*10 + dx;
            let resy = Math.floor(segy/10)*10 + dy;
            roomName = RoomNameFromPos([resx,resy]);
        }
    }
    else
    {
        roomName = flag.pos.roomName;
    }
    if (!Memory.rooms[roomName]) 
    {
        Memory.rooms[roomName] = {}
    }
    Memory.rooms[roomName].avoid = 1;
    
    SetMapData(roomName,"nogo","X");
    flag.remove();
}

Abandon=function(flag)
{

    for (var i = 0; i < Memory.colonies.length; i++) {
        let roomname = Memory.colonies[i].pos.roomName
        if (roomname == flag.pos.roomName) 
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
                                            if(closest.haulerpool)
                                            {
                                                closest.haulerpool.push(c.name);
                                            }
                                        }
                                    }
                                }
                            })    
                        }
                    }
                    console.log("Unclaiming room")
                    room.controller.unclaim();
                    Memory.colonies.splice(i,1)
                    flag.remove();
                }
            }
            break;
        }
    }
}

Disassemble=function(flag)
{
    let room = Game.rooms[flag.pos.roomName];
    if(room)
    {
        let colony = FindClosestColony(flag.pos.roomName,true,0);
        let stuff = flag.pos.lookFor(LOOK_STRUCTURES);
        stuff.forEach((s) => {
            colony.disTargets.push(s.id);
            console.log("Disassembling " + s.id);
        })
        flag.remove();
    }
}

Unplan=function(flag)
{
    let pos = flag.pos;
    Memory.colonies.forEach((c) => 
    {
        if(c.pos.roomName == pos.roomName && c.layout)
        {
            let buildings = DeserializeLayout(c.layout,pos.roomName);

            for(let i in buildings)
            {
                let b = buildings[i];
                if(b.pos.x == pos.x && b.pos.y == pos.y)
                {
                    ///pos.lookFor(LOOK_STRUCTURES).forEach((s) => { if(s.my && s.structureType == b.structure) { s.destroy() }})
                    console.log("Unplanning a " + b.structure + " at " + pos.x + " " + pos.y);
                    buildings.splice(i,1);
                }
            }

            c.layout = SerializeLayout(buildings);
        }
    })
    flag.remove();
}

FlagFunctions["Mine"] = Mine;
FlagFunctions["Scout"] = Scout;
FlagFunctions["Unplan"] = Unplan;
FlagFunctions["Abandon"] = Abandon;
FlagFunctions["Discard"] = Discard;
FlagFunctions["Analyze"] = Analyze;
FlagFunctions["RemoveMine"] = RemoveMine;
FlagFunctions["Disassemble"] = Disassemble;
FlagFunctions["StartColony"] = StartColony;
FlagFunctions["AbandonRoad"] = AbandonRoad;
FlagFunctions["MarkAsOwned"] = MarkAsOwned;

applyFlags=function()
{
    if (Game.time % 3 != 0) 
    {
        return;
    }
    let flags = Game.flags;

    for(let flagname in FlagFunctions)
    {
        if(flags[flagname])
        {
            FlagFunctions[flagname](flags[flagname]);
        }
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
}