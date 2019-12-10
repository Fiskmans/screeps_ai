StartWar = function(playerName)
{
    if(!Memory.wars) { Memory.wars = {} }
    Memory.wars[playerName] = {};
}
DoWars=function()
{
    if(Memory.wars)
    {
        for(let name in Memory.wars)
        {
            DoWar(name,Memory.wars[name]);
        }
    }
}

SetWarRoomData=function(roomposition,object,dataName,char)
{
    if(!object[dataName])
    {
        object[dataName] = " ".repeat(50*50);
    }
    let index = (roomposition.x%10) + Math.floor(roomposition.y/50)*50;
    object[dataName] = setCharAt(object[dataName],index,char);
}

GetWarRoomData=function(roomposition,object,dataName)
{
    if(!object[dataName])
    {
        return ' ';
    }
    let index = (roomposition.x%10) + Math.floor(roomposition.y/50)*50;
    return object[dataName][index];
}
warstages = 
{
    [WARSTAGE_INTEL]:function(playername,war)
    {
        
    },
    [WARSTAGE_DRAIN]:function(playername,war)
    {
        
    },
    [WARSTAGE_HERASS]:function(playername,war)
    {
        
    },
    [WARSTAGE_ATTACK]:function(playername,war)
    {
        
    },
    [WARSTAGE_BLOCK]:function(playername,war)
    {
        
    }
}

collectIntel=function(room,battlefront)
{
    console.log("collecting intel on: " + room.name)
    
    if (!battlefront.intel) { battlefront.intel = {} }
    let towers = room.find(FIND_HOSTILE_STRUCTURES,{filter:(s) => {return s.structureType == STRUCTURE_TOWER && s.store.getUsedCapacity(RESOURCE_ENERGY) > 10}})
    let meleecreeps = room.find(FIND_HOSTILE_CREEPS,{filter:(c) => { return c.getActiveBodyparts(ATTACK) > 0 }})
    let rangedcreeps = room.find(FIND_HOSTILE_CREEPS,{filter:(c) => { return c.getActiveBodyparts(RANGED_ATTACK) > 0 }})
    
    console.log("found " + towers.length + " operating towers");
    let dangers = [];
    towers.forEach((t) =>
    {
        dangers.push({pos:t.pos,range:21})
    })
    meleecreeps.forEach((c) =>
    {
        dangers.push({pos:c.pos,range:2})
    })
    rangedcreeps.forEach((c) =>
    {
        dangers.push({pos:c.pos,range:7})
    })
    
    logObject(dangers);
    
    let dangerHeatMap = "";
    for (var y = 0; y < 50; y++) 
    {
        for (var x = 0; x < 50; x++) 
        {
            let max = 0;
            dangers.forEach((d) =>
            {
                max = Math.max(max,d.range - Math.max(Math.abs(d.pos.x-x),Math.abs(d.pos.y-y)));
            })
            dangerHeatMap += String.fromCharCode(65 + max); 
        }   
    }
    
    battlefront.intel.dangerMap = dangerHeatMap;
    FindPriorityTargets(room,battlefront);
}

FindPriorityTargets=function(room,battlefront)
{
    console.log("looking for new targets for: " + room.name);
    let towers = room.find(FIND_HOSTILE_STRUCTURES,{filter:(s) => {return s.structureType == STRUCTURE_TOWER}})
    let prio = false;
    if (towers.length > 0) 
    {
        prio = towers[0];
    }
    else
    {
        let spawns =  room.find(FIND_HOSTILE_STRUCTURES,{filter:(s) => {return s.structureType == STRUCTURE_SPAWN}})
        if (spawns.length > 0) 
        {
            prio = spawns[0];
        }
    }
    if (prio) 
    {
        battlefront.maintarget = {pos:{x:prio.pos.x,y:prio.pos.y,roomName:prio.pos.roomName},id:prio.id};
    }
    console.log("Maintaget:  ");
    logObject(battlefront.maintarget);
    
    let secondary = [];
    
    [FIND_EXIT_TOP,FIND_EXIT_LEFT,FIND_EXIT_RIGHT,FIND_EXIT_BOTTOM].forEach((d) => 
    {
        let entry = room.find(d)[0];
        if (entry) 
        {
            let target = new RoomPosition(battlefront.maintarget.pos.x,battlefront.maintarget.pos.y,battlefront.maintarget.pos.roomName)
            let path = room.findPath(entry,target);
            let canReach = false;
            if( !path.length || !target.isEqualTo(path[path.length - 1]) )
            {
                canReach = true;
            }
            if (canReach) 
            {
                let closest = entry.findClosestByPath(room.hostiles());
                if (closest) 
                {
                    secondary.push({pos:closest.pos,id:closest.id})
                }
            }
            else
            {
                console.log(d + " can reach main target");
            }
        }
    })
    battlefront.secondary = secondary;
    console.log("secondary:  ");
    logObject(battlefront.secondary);
}

GenerateFlowMap=function(targetroom,object,stopat)
{
    let queue = [];
    object[targetroom] = targetroom;
    for(let roomname in object)
    {
        let neighbors = Object.values(Game.map.describeExits(roomname));
        neighbors.forEach((n) => 
        {
            queue.push({to:roomname,from:n,huer:Game.market.calcTransactionCost(1000,n,stopat)});
        })
    }
    queue = _.sortBy(queue,(q) => {return q.huer});
    while(queue.length > 0)
    {
        let next = queue.shift();
        if (!object[next.from]) 
        {
            object[next.from] = next.to;
            if ([OWNER_UNKNOWN,OWNER_UNOWNED,OWNER_ME,OWNER_CORRIDOR].includes(GetMapData(next.from,"owner"))) 
            {
                let neighbors = Object.values(Game.map.describeExits(next.from));
                neighbors.forEach((n) => 
                {
                    queue.push({to:next.from,from:n,huer:Game.market.calcTransactionCost(1000,n,stopat)});
                })
                queue = _.sortBy(queue,(q) => {return q.huer});
            }
        }
        if(next.from == stopat)
        {
            return;
        }
        
    }
    console.log("Failed to generate flow map from " + stopat + " to " + targetroom);
}

battlefrontstages = 
{
    [WARSTAGE_INTEL]:function(playername,war,battlefront,roomname)
    {
        //console.log("here")
        if(!battlefront.scouts) {battlefront.scouts = [] }
        if (!battlefront.path) { battlefront.path = {} }
        if (battlefront.scouts.length < 2) 
        {
            let closest = FindClosestColony(roomname,false);
            if (closest) 
            {
                let spawnroom = Game.rooms[closest.pos.roomName]
                if (spawnroom) 
                {
                    spawnRoleIntoList(spawnroom,battlefront.scouts,ROLE_SCOUT);
                }
            }
        }
        
        
        deleteDead(battlefront.scouts)
        battlefront.scouts.forEach((name) =>
        {
            let creep = Game.creeps[name];
            if (creep) 
            {
                if (!battlefront.path[creep.pos.roomName]) 
                {
                    GenerateFlowMap(roomname,battlefront.path,creep.pos.roomName);
                }
                creep.travelTo(new RoomPosition(25,25,battlefront.path[creep.pos.roomName],{ignoreRoads:true}))
            }
        })
        
        let room = Game.rooms[roomname];
        if (room) 
        {
            collectIntel(room,battlefront)
            battlefront.stage = WARSTAGE_DRAIN;
        }
    },
    [WARSTAGE_DRAIN]:function(playername,war,battlefront,roomname)
    {
        if(!battlefront.drainers) {battlefront.drainers = [];}
        if (!battlefront.drained) { battlefront.drain = 0; }
        if (!battlefront.wasted) { battlefront.wasted = 0; }
        if (battlefront.drainers.length < 4 && !battlefront.halt) 
        {
            let closest = FindClosestColony(roomname,false);
            if (closest) 
            {
                let spawnroom = Game.rooms[closest.pos.roomName]
                if (spawnroom) 
                {
                    if(OK == spawnRoleIntoList(spawnroom,battlefront.drainers,ROLE_ENERGY_DRAIN))
                    {
                        let name = battlefront.drainers[battlefront.drainers.length - 1];
                    }
                }
            }
        }
        let room = Game.rooms[roomname];
        let towercount = 0;
        if (room) 
        {
            towercount = room.find(FIND_HOSTILE_STRUCTURES,{filter:(s) => {return s.structureType == STRUCTURE_TOWER && s.store.getUsedCapacity(RESOURCE_ENERGY) > 10}}).length
        }
        let inroom = false;
        deleteDead(battlefront.drainers)
        battlefront.drainers.forEach((name) =>
        {
            let creep = Game.creeps[name];
            if (creep) 
            {
                if (!creep.memory.registered) 
                {
                    creep.memory.registered = 1;
                    creep.body.forEach((p) =>
                    {
                        battlefront.wasted += BODYPART_COST[p.type];
                    })
                }
                if (creep.hitsMax-creep.hits > 150) 
                {
                    creep.heal(creep);
                    if (creep.pos.roomName == roomname) 
                    {
                        inroom = true;
                        creep.say("Run");
                        creep.travelTo(creep.pos.findClosestByPath(creep.room.find(FIND_EXIT)))
                    }
                    else
                    {
                        creep.LeaveEdge();
                        battlefront.drainers.forEach((oname) =>
                        {
                            let other = Game.creeps[oname];
                            if (Math.abs(creep.pos.x - 25) > Math.abs(creep.pos.y-25)) 
                            {
                                if (other.pos.y == creep.pos.y) 
                                {
                                    if (other.name > creep.name) 
                                    {
                                        creep.move(TOP);
                                    }
                                }
                            }
                            else
                            {
                                if (other.pos.x == creep.pos.x) 
                                {
                                    if (other.name > creep.name) 
                                    {
                                        creep.move(LEFT);
                                    }
                                }
                            }
                        })
                    }
                }
                else
                {
                    if (creep.pos.roomName == roomname) 
                    {
                        inroom = true;
                        battlefront.drainers.forEach((oname) =>
                        {
                            let other = Game.creeps[oname];
                            if (other.pos.y == creep.pos.y) 
                            {
                                if (other.name > creep.name) 
                                {
                                    creep.move(TOP);
                                }
                            }
                            if (other.pos.x == creep.pos.x) 
                            {
                                if (other.name > creep.name) 
                                {
                                    creep.move(LEFT);
                                }
                            }
                        })
                        creep.LeaveEdge();
                        let targets = creep.room.find(FIND_MY_CREEPS,{filter:(t) => {return t.hits < t.hitsMax}});
                        if (targets.length > 0) 
                        {
                            creep.say("❤ friend")
                            let dist = Math.max(Math.abs(targets[0].pos.x - creep.pos.x),Math.abs(targets[0].pos.y - creep.pos.y))
                            if (dist < 4) 
                            {
                                creep.rangedHeal(targets[0]);
                                creep.travelTo(targets[0])
                            }
                            else if(dist < 2)
                            {
                                creep.heal(targets[0]);
                            }
                            else
                            {
                                creep.travelTo(targets[0])
                            }
                        }
                    }
                    else
                    {
                        let targets = creep.room.find(FIND_MY_CREEPS,{filter:(t) => {return t.hits < t.hitsMax}});
                        if (targets.length > 0) 
                        {
                            creep.say("healing friend")
                            let dist = Math.max(Math.abs(targets[0].pos.x - creep.pos.x),Math.abs(targets[0].pos.y - creep.pos.y))
                            if (dist < 4 && dist > 1) 
                            {
                                creep.rangedHeal(targets[0]);
                                creep.travelTo(targets[0])
                            }
                            else if(dist < 2)
                            {
                                creep.heal(targets[0]);
                            }
                            else
                            {
                                creep.travelTo(targets[0])
                            }
                        }
                        else
                        {
                            if (!battlefront.path[creep.pos.roomName]) 
                            {
                                GenerateFlowMap(roomname,battlefront.path,creep.pos.roomName);
                            }
                            creep.travelTo(new RoomPosition(25,25,battlefront.path[creep.pos.roomName],{ignoreRoads:true}))
                        }
                    }
                }
            }
        })
        if (inroom) 
        {
            battlefront.drained += 10 * towercount;
        }
        if (room && towercount == 0) 
        {
            battlefront.stage = WARSTAGE_ATTACK;
        }
    },
    [WARSTAGE_HERASS]:function(playername,war,battlefront,roomname)
    {
        
    },
    [WARSTAGE_ATTACK]:function(playername,war,battlefront,roomname)
    {
        let room = Game.rooms[roomname];
        let towercount = 0;
        if (room) 
        {
            towercount = room.find(FIND_HOSTILE_STRUCTURES,{filter:(s) => {return s.structureType == STRUCTURE_TOWER && s.store.getUsedCapacity(RESOURCE_ENERGY) > 10}}).length
        }
        this[WARSTAGE_DRAIN](playername,war,battlefront,roomname)
        if (Game.time % 7 == 0) 
        {
            if (room) 
            {
                FindPriorityTargets(room,battlefront)
            }
        }
        
        if (!battlefront.dismantlers) 
        {
            battlefront.dismantlers = []
        }
        if (battlefront.dismantlers.length < 2 && !battlefront.halt) 
        {
            let closest = FindClosestColony(roomname,false);
            if (closest) 
            {
                let spawnroom = Game.rooms[closest.pos.roomName]
                if (spawnroom) 
                {
                    spawnRoleIntoList(spawnroom,battlefront.dismantlers,ROLE_DISMANTLER)
                }
            }
        }
        deleteDead(battlefront.dismantlers)
        battlefront.dismantlers.forEach((name) =>
        {
            let creep = Game.creeps[name]
            if (creep) 
            {
                if (!creep.memory.registered) 
                {
                    creep.memory.registered = 1;
                    creep.body.forEach((p) =>
                    {
                        battlefront.wasted += BODYPART_COST[p.type];
                    })
                }
                if ((creep.hitsMax - creep.hits < 150 || towercount == 0) && room) 
                {
                    if (creep.pos.roomName != roomname) 
                    {
                        if (creep.hitsMax == creep.hits) 
                        {
                            if (!battlefront.path[creep.pos.roomName]) 
                            {
                                GenerateFlowMap(roomname,battlefront.path,creep.pos.roomName);
                            }
                            creep.travelTo(new RoomPosition(25,25,battlefront.path[creep.pos.roomName],{ignoreRoads:true}))
                        }
                        else
                        {
                            creep.LeaveEdge();
                        }
                    }
                    else
                    {
                        if (battlefront.maintarget) 
                        {
                            let prio = Game.getObjectById(battlefront.maintarget.id)
                            if (prio && creep.pos.inRangeTo(battlefront.maintarget.pos.x,battlefront.maintarget.pos.y))
                            {
                                creep.say("main")
                                creep.dismantle(prio);
                            }
                            else
                            {
                                
                                let target = new RoomPosition(battlefront.maintarget.pos.x,battlefront.maintarget.pos.y,battlefront.maintarget.pos.roomName)
                                let path = room.findPath(creep.pos,target);
                                let canReach = false;
                                if( !path.length || !target.isEqualTo(path[path.length - 1]) )
                                {
                                    canReach = true;
                                }
                                if (canReach)
                                {
                                    creep.say("main")
                                    let obj = Game.getObjectById(battlefront.maintarget.id)
                                    if (obj) 
                                    {
                                        creep.dismantle(obj);
                                    }
                                }
                                else
                                {
                                    if (battlefront.secondary) 
                                    {
                                        battlefront.secondary.forEach((t) =>
                                        {
                                            if(!creep.hasActed)
                                            {
                                                let target = Game.getObjectById(t.id)
                                                if (prio && creep.pos.inRangeTo(t.pos.x,t.pos.y))
                                                {
                                                    creep.dismantle(target);
                                                }
                                                else
                                                {
                                                    if (creep.travelTo(new RoomPosition(t.pos.x,t.pos.y,t.pos.roomName)) == ERR_NO_PATH)
                                                    {
                                                        creep.say("secondary")
                                                        creep.hasActed = true;
                                                    }
                                                }
                                            }
                                        })
                                    }
                                }
                            }
                            
                        }
                    }
                }
                else
                {
                    if (creep.pos.roomName == roomname) 
                    {
                        creep.say("running");
                        creep.travelTo(creep.pos.findClosestByPath(creep.room.find(FIND_EXIT)));
                    }
                    else
                    {
                        creep.LeaveEdge();
                    }
                }
                
            }
        })
    },
    [WARSTAGE_BLOCK]:function(playername,war,battlefront,roomname)
    {
        
    }
}

DoWar=function(playername,war)
{
    if(!war.battlefronts) { war.battlefronts = {}}
    if(!war.stage) {war.stage = WARSTAGE_INTEL}
    for(let roomname in war.battlefronts)
    {
        let battlefront = war.battlefronts[roomname];
        if(!battlefront.stage)
        {
            battlefront.stage = WARSTAGE_INTEL
        }
        battlefrontstages[battlefront.stage](playername,war,battlefront,roomname);
    }
}


