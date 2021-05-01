Unplan=function(flag)
{
    let pos = flag.pos;
    for (let colony of Memory.colonies) 
    {
        if(colony.pos.roomName == pos.roomName)
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


Discard=function(flag)
{
    
    let pos = flag.pos;
        
    Memory.data.posexpansions = _.filter(Memory.data.posexpansions, (e) => {
        return e.roomName != pos.roomName || Math.abs(pos.x - e.x) > 3 || Math.abs(pos.y - e.y) > 3;
    })
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
                    for(let s of buildings)
                    {
                        s.notifyWhenAttacked(false);
                        let err = s.destroy();
                        if(err == ERR_BUSY)
                        {
                            Game.notify("Abandoning colony in room " + flag.pos.roomName);

                            console.log("hostile creeps in abandoning colony assuming lost, abandoning");
                            Memory.colonies.splice(i,1);
                            flag.remove();
                            return;
                        }
                        else if(err == ERR_NOT_OWNER)
                        {
                            Game.notify("Abandoning colony in room " + flag.pos.roomName);

                            console.log("not owner if building in colony room, assuming lost, abandoning");
                            Memory.colonies.splice(i,1);
                            flag.remove();
                            return;
                        }
                    }
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
                    Game.notify("Abandoning colony in room " + flag.pos.roomName);

                    console.log("Unclaiming room")
                    room.controller.unclaim();
                    Memory.colonies.splice(i,1);
                    flag.remove();
                }
            }
            else
            {
                Game.notify("Abandoning colony in room " + flag.pos.roomName);

                console.log("No vision on room with colony waiting to be abandoned, abandoning");
                Memory.colonies.splice(i,1);
                flag.remove();
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

EvaluateExpansion=function(flag)
{
    Empire.Expansion.StartEvaluate(flag.pos.roomName);
    flag.remove();
}

FlagFunctions["Scout"] = Scout;
FlagFunctions["Unplan"] = Unplan;
FlagFunctions["Abandon"] = Abandon;
FlagFunctions["Discard"] = Discard;
FlagFunctions["Disassemble"] = Disassemble;
FlagFunctions["StartColony"] = StartColony;
FlagFunctions["MarkAsOwned"] = MarkAsOwned;
FlagFunctions["EvaluateExpansion"] = EvaluateExpansion;

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