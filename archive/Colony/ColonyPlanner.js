
let C =
{
    BUILDINGS_AT_LEVEL:
    {
        0: {},
        1: {
            [STRUCTURE_SPAWN]: 1
        },
        2: {
            [STRUCTURE_SPAWN]: 1,
            [STRUCTURE_EXTENSION]: 5
        },
        3: {
            [STRUCTURE_SPAWN]: 1,
            [STRUCTURE_TOWER]: 1,
            [STRUCTURE_EXTENSION]: 10
        },
        4: {
            [STRUCTURE_SPAWN]: 1,
            [STRUCTURE_TOWER]: 1,
            [STRUCTURE_EXTENSION]: 20,
            [STRUCTURE_STORAGE]: 1
        },
        5: {
            [STRUCTURE_SPAWN]: 1,
            [STRUCTURE_TOWER]: 2,
            [STRUCTURE_EXTENSION]: 30,
            [STRUCTURE_STORAGE]: 1,
            [STRUCTURE_LINK]: 1
        },
        6: {
            [STRUCTURE_SPAWN]: 1,
            [STRUCTURE_TOWER]: 2,
            [STRUCTURE_EXTENSION]: 40,
            [STRUCTURE_STORAGE]: 1,
            [STRUCTURE_TERMINAL]: 1,
            [STRUCTURE_LINK]: 1
        },
        7: {
            [STRUCTURE_SPAWN]: 2,
            [STRUCTURE_TOWER]: 3,
            [STRUCTURE_EXTENSION]: 50,
            [STRUCTURE_STORAGE]: 1,
            [STRUCTURE_TERMINAL]: 1,
            [STRUCTURE_FACTORY]: 1,
            [STRUCTURE_LINK]: 2
        },
        8: {
            [STRUCTURE_SPAWN]: 3,
            [STRUCTURE_TOWER]: 6,
            [STRUCTURE_EXTENSION]: 60,
            [STRUCTURE_STORAGE]: 1,
            [STRUCTURE_TERMINAL]: 1,
            [STRUCTURE_FACTORY]: 1,
            [STRUCTURE_POWER_SPAWN]: 1,
            [STRUCTURE_LINK]: 2
        }
    }
}

module.exports.BuildPlannerAllPlanned=function(roomName)
{
    if(!this.stashedPlanned)
    {
        this.stashedPlanned = {};
    }
    if(this.stashedPlanned[roomName])
    {
        if(Game.time - this.stashedPlanned[roomName].at < STALE_PLANNER_COSTMATRIX_THRESHOLD)
        {
            return this.stashedPlanned[roomName].value;
        }
        else
        {
            delete this.stashedPlanned[roomName].value;
        }
    }

    let matrix = new PathFinder.CostMatrix();

    let terrain = new Room.Terrain(roomName);

    for(let x = 0;x < 50;x++)
    {
        for(let y = 0;y < 50;y++)
        {
            let t = terrain.get(x,y);
            if(t == TERRAIN_MASK_SWAMP)
            {
                matrix.set(x,y,0);
            }
            if(t == 0)
            {
                matrix.set(x,y,0);
            }
            if(t == TERRAIN_MASK_WALL)
            {
                matrix.set(x,y,256);
            }
        }
    }

    for(let colony of Memory.colonies)
    {
        if(colony.pos.roomName == roomName)
        {
            let buildings = DeserializeLayout(colony.layout,roomName);
            for(let b of buildings)
            {
                matrix.set(b.pos.x,b.pos.y,255);
            }
            if(colony.subLayouts)
            {
                for(let layout of Object.values(colony.subLayouts))
                {
                    let buildings = DeserializeLayout(layout,roomName);
                    for(let b of buildings)
                    {
                        matrix.set(b.pos.x,b.pos.y,255);
                    }
                }
            }
        }
    }

    this.stashedPlanned[roomName] = {at:Game.time,value:matrix};
    return matrix;
}

module.exports.MatrixRoadPreferFuture=function(roomName)
{
    let matrix = new PathFinder.CostMatrix();

    let terrain = new Room.Terrain(roomName);

    for(let x = 0;x < 50;x++)
    {
        for(let y = 0;y < 50;y++)
        {
            let t = terrain.get(x,y);
            if(t == TERRAIN_MASK_SWAMP)
            {
                matrix.set(x,y,5);
            }
            if(t == 0)
            {
                matrix.set(x,y,2);
            }
            if(t == TERRAIN_MASK_WALL)
            {
                matrix.set(x,y,256);
            }
        }
    }

    for(let colony of Memory.colonies)
    {
        if(colony.pos.roomName == roomName)
        {
            for(let d = -5;d < 5;d++)
            {
                let p = 
                [
                    {
                        x:colony.pos.x+1+d,
                        y:colony.pos.y+1-d
                    },
                    {
                        x:colony.pos.x-1+d,
                        y:colony.pos.y-1-d
                    },
                    {
                        x:colony.pos.x-1+d,
                        y:colony.pos.y+1+d
                    },
                    {
                        x:colony.pos.x+1+d,
                        y:colony.pos.y-1+d
                    }
                ]
                for(let p1 of p)
                {
                    if(!(p1.x <= 0 || p1.x >= 49 || p1.y <= 0 || p1.y >= 49))
                    {
                        if(matrix.get(p1.x,p1.y) < 100)
                        {
                            matrix.set(p1.x,p1.y,1);
                        }
                    }
                }
            }
            let buildings = DeserializeLayout(colony.layout,roomName);
            for(let b of buildings)
            {
                matrix.set(b.pos.x,b.pos.y,b.structure == STRUCTURE_ROAD ? 1 : 255);
            }
            if(colony.subLayouts)
            {
                for(let layout of Object.values(colony.subLayouts))
                {
                    let buildings = DeserializeLayout(layout,roomName);
                    for(let b of buildings)
                    {
                        matrix.set(b.pos.x,b.pos.y,b.structure == STRUCTURE_ROAD ? 1 : 255);
                    }
                }
            }
        }
        if(colony.remotes)
        {
            let blob = colony.remotes[roomName];
            if(blob)
            {
                if(blob.layout)
                {
                    let buildings = DeserializeLayout(blob.layout,roomName);
                    for(let b of buildings)
                    {
                        if(b.structure == STRUCTURE_ROAD)
                        {
                            matrix.set(b.pos.x,b.pos.y,1);
                        }
                    }
                }
            }
        }
    }

    return matrix;
}

module.exports.InstaniateLayout=function(center,layout)
{
    let buildings = [];
    for(let dx in layout)
    {
        for(let dy in layout[dx])
        {
            let b = layout[dx][dy];
            let x = dx - -center.x;
            let y = dy - -center.y;
            if(x < 1 || x > 48)
            {
                return false;
            }
            if(y < 1 || y > 48)
            {
                return false;
            }

            buildings.push({
                pos:center.offset(dx,dy),
                structure:b
            })
        }
    }
    return buildings;
}

module.exports.CanLayoutFit=function(center,layout)
{
    let buildings = this.InstaniateLayout(center,layout);
    if(!buildings)
    {
        return false;
    }

    let terrain = new Room.Terrain(center.roomName);
    let matrix = this.BuildPlannerAllPlanned(center.roomName);

    for(let b of buildings)
    {
        if(b.pos.getRangeTo(colony.pos.x,colony.pos.y) < 3)
        {
            return false;
        }
        if(terrain.get(b.pos.x,b.pos.y) == TERRAIN_MASK_WALL)
        {
            return false;
        }
        if(matrix.get(b.pos.x,b.pos.y) != 0)
        {
            return false;
        }
    }

    return true;
}

module.exports.BlankQueue = function()
{
    let val = "";
    for(let x = 1;x < 49;x++)
    {
        for(let y = 1;y < 49;y++)
        {
            val += COMPACT_NUMBER.Encode[x] + COMPACT_NUMBER.Encode[y];
        }
    }
    return val;
}

module.exports.ScoreLayoutPosition = function(colony,pos,layout)
{
    let score = 1;
    score += 50 - pos.getRangeTo(colony.pos.x,colony.pos.y);

    let room = Game.rooms[colony.pos.roomName];
    let busy = room.find(FIND_SOURCES).concat(room.find(FIND_SOURCES));
    busy.push(room.controller);

    for(let t of busy)
    {
        score += t.pos.getRangeTo(pos)/20;
    }

    return score;
}

module.exports.StampLayout=function(colony,tag,buildings)
{
    let left = {};
    for(let key in CONTROLLER_STRUCTURES)
    {
        left[key] = CONTROLLER_STRUCTURES[key][colony.level];
    }
    let i = 0;
    while(i < colony.layout.length)
    {
        left[CHAR_STRUCTURE[colony.layout.charAt(i)]]--;
        i += 3;
    }
    if(colony.subLayouts)
    {
        for(let name of Object.keys(colony.subLayouts))
        {
            if(name != tag)
            {
                let layout = colony.subLayouts[name];
                let i = 0;
                while(i < layout.length)
                {
                    left[CHAR_STRUCTURE[layout.charAt(i)]]--;
                    i += 3;
                }
            }
        }
    }

    let stamped = [];
    for(let b of buildings)
    {
        if(left[b.structure] > 0)
        {
            left[b.structure]--;
            stamped.push(b);
        }
    }
    colony.subLayouts[tag] = SerializeLayout(stamped);
    return stamped.length == buildings.length;
}

module.exports.Place=function(colony,tag,layout,allowance)
{
    let startCPU = Game.cpu.getUsed();
    let stash = colony.planner[tag];

    if(!stash.bestScore) { stash.bestScore = 1; }

    while(Game.cpu.getUsed() - startCPU < allowance)
    {
        if(stash.queue.length < 2)
        {
            break;
        }
        let x = COMPACT_NUMBER.Decode[stash.queue.charAt(0)];
        let y = COMPACT_NUMBER.Decode[stash.queue.charAt(1)];

        let pos = new RoomPosition(x,y,colony.pos.roomName);

        stash.queue = stash.queue.substring(2);

        if(this.CanLayoutFit(pos,layout))
        {
            let score = this.ScoreLayoutPosition(colony,pos,layout);
            if(score > stash.bestScore)
            {
                stash.bestPos = pos;
                stash.bestScore = score;
            }
        }
    }
    if(!stash.queue || stash.queue.length < 2)
    {
        if(stash.bestPos)
        {
            let buildings = this.InstaniateLayout(new RoomPosition(stash.bestPos.x,stash.bestPos.y,stash.bestPos.roomName),layout);
            if(this.StampLayout(colony,tag,buildings))
            {
                colony.planner[tag] = 
                {
                    stage:PLANNER_STAGE_DONE
                }
            }
            else
            {
                colony.planner[tag] = 
                {
                    stage:PLANNER_STAGE_WAITING,
                    level:colony.level,
                    wanted:SerializeLayout(buildings)
                }
            }
        }
        else
        {
            colony.planner[tag] = 
            {
                stage:PLANNER_STAGE_FAILED
            }
        }
    }
}

module.exports.Waiting=function(colony,tag)
{
    if(colony.planner[tag].level < colony.level)
    {
        let buildings = DeserializeLayout(colony.planner[tag].wanted,colony.pos.roomName);
        if(this.StampLayout(colony,tag,buildings))
        {
            colony.planner[tag] = 
            {
                stage:PLANNER_STAGE_DONE
            }
        }
        else
        {
            colony.planner[tag] = 
            {
                stage:PLANNER_STAGE_WAITING,
                level:colony.level,
                wanted:SerializeLayout(buildings)
            }
        }
    }
}

module.exports.PlanLayout=function(colony,tag,layout)
{
    if(!colony.mainPlanner)
    {
        return;
    }
    if(colony.mainPlanner.stage == PLANNER_STAGE_PLACE)
    {
        return;
    }
    if(colony.mainPlanner.stage == PLANNER_STAGE_WAITING && colony.mainPlanner.level < colony.level)
    {
        return;
    }

    if(!colony.planner) { colony.planner = {}; }

    if(!colony.planner[tag])
    {
        colony.planner[tag] = 
        {
            stage:PLANNER_STAGE_PLACE,
            queue:this.BlankQueue()
        }
    }

    switch(colony.planner[tag].stage)
    {
        case PLANNER_STAGE_PLACE:
            this.Place(colony,tag,layout,1);
            break;
        case PLANNER_STAGE_WAITING:
            this.Waiting(colony,tag,);
            break;
    }
}

module.exports.AllowBuildingAtPosition=function(colony,pos,structure)
{
    if(!colony.planner)
    {
        return true;
    }
    for(let stash of Object.values(colony.planner))
    {
        if(stash.stage == PLANNER_STAGE_WAITING)
        {
            let buildings = DeserializeLayout(stash.wanted,pos.roomName);
            for(let b of buildings)
            {
                if(b.pos.isEqualTo(pos))
                {
                    return false;
                }
            }
        }
    }
    return true;
}

module.exports.PlanLabs = function(colony)
{
    this.PlanLayout(colony,"labs",labSateliteLayout);
}

let ExpandColony=function(colony)
{
    if(!colony.level)
    {
        return;
    }
    
    let mainBuildings = DeserializeLayout(colony.layout,colony.pos.roomName);
    let buildings = [].concat(mainBuildings);
    let unplaced = JSON.parse(JSON.stringify(C.BUILDINGS_AT_LEVEL[colony.level]))

    for(let building of mainBuildings)
    {
        if(unplaced[building.structure])
        {
            unplaced[building.structure] -= 1;
        }
    }

    if(colony.subLayouts)
    {
        for(let layout of Object.values(colony.subLayouts))
        {
            buildings = buildings.concat(DeserializeLayout(layout,colony.pos.roomName));
        }
    }
    ResetMatrix();
    let done = true;
    for(let k in unplaced)
    {        
        while(unplaced[k] > 0)
        {
            SetupMatrix(buildings)
            let building = PlanBuilding(colony,buildings,k,colony.pos);
            if(building)
            {
                mainBuildings.push(building);
                buildings.push(building);
                SetupMatrix([building]);
                if(unplaced[building.structure])
                {
                    unplaced[building.structure] -= 1;
                }
            }
            else
            {
                console.log("Colony in " + colony.pos.roomName + "Cant find a place to place it's next building")
                Game.notify("Colony in " + colony.pos.roomName + "Cant find a place to place it's next building");
                colony.mainPlanner = 
                {
                    stage:PLANNER_STAGE_FAILED
                }
                return;
            }
        }
        if(unplaced[k] > 0)
        {
            done = false;
        }
    }


    colony.layout = SerializeLayout(mainBuildings);

    if(!done)
    {   
        console.log("Planner is waiting for next tick to continue in room: " + colony.pos.roomName);
    }
    else
    {
        if(colony.level == RCL_MAX)
        {
            console.log("Planner is done in room: " + colony.pos.roomName);
            colony.mainPlanner = 
            {
                stage:PLANNER_STAGE_DONE
            }
        }
        else
        {
            console.log("Planner waiting for level " + (colony.level + 1) + " to continue in room: " + colony.pos.roomName);
            colony.mainPlanner = 
            {
                stage:PLANNER_STAGE_WAITING,
                level:colony.level
            }
        }
    }
}

PlanBuilding=function(colony,alreadyPresent, type, centerPos)
{
    let TURN_MAP =
    {
        [RIGHT]: TOP,
        [TOP]: LEFT,
        [LEFT]: BOTTOM,
        [BOTTOM]: RIGHT
    }
    
    let terrain = new Room.Terrain(centerPos.roomName);  

    let left = 1;
    let depth = 1;
    let direction = RIGHT;

    let x = centerPos.x;
    let y = centerPos.y;

    while(depth < 25)
    {
        if(x > 0 || x < 49)
        {
            if(y > 0 || y < 49)
            {
                if(!IsTaken(alreadyPresent,x,y,true))
                {
                    let dx = Math.abs(x - centerPos.x);
                    let dy = Math.abs(y - centerPos.y);
                    if(IsAllowedByReservation(x - centerPos.x,y - centerPos.y,type))
                    {
                        if(Colony.Planner.AllowBuildingAtPosition(colony,new RoomPosition(x,y,centerPos.roomName),type))
                        {
                            if(Math.abs(dx - dy) != 2 && dx + dy != 2)
                            {
                                if(IsValidSpot(colony,terrain,alreadyPresent,x,y,centerPos))
                                {
                                    return {structure:type,pos:new RoomPosition(x, y, centerPos.roomName)};
                                }
                            }
                            else if(terrain.get(x,y) != TERRAIN_MASK_WALL)
                            {
                                return {structure:STRUCTURE_ROAD,pos:new RoomPosition(x, y, centerPos.roomName)};
                            }
                        }
                    }
                }
            }
        }

        x += offsets.x[direction];
        y += offsets.y[direction];
        left -= 1;
        if(left <= 0)
        {
            direction = TURN_MAP[direction];
            left = depth;
            if(direction == TOP || direction == BOTTOM)
            {
                depth += 1;
            }
        }
    }
    return false;
}

let IsAllowedByReservation=function(x,y,structure)
{
    at = (reservedDynamicLayout[x] || {})[y];
    if(!at)
    {
        return true;
    }
    if(at == structure)
    {
        return true;
    }
    return false;
}

let BuildingPlannerPathingMatrix = false;
let ResetMatrix=function()
{
    BuildingPlannerPathingMatrix = new PathFinder.CostMatrix();
}

let SetupMatrix=function(buildings)
{
    for(let y = 0; y < 50;y++)
    {
        for(let x = 0; x < 50;x++)
        {
            BuildingPlannerPathingMatrix.set(x,y,256);
        }
    }

    buildings.forEach((b) => 
    {
        if (b.structure == STRUCTURE_ROAD)
        {
            BuildingPlannerPathingMatrix.set(b.pos.x,b.pos.y,1);
        }
    })
}

let BuildingPathingMap=function(roomName)
{
    if(BuildingPlannerPathingMatrix)
    {
        return BuildingPlannerPathingMatrix;
    }
    
    var matrix = new PathFinder.CostMatrix();
    for(let y = 0; y < 50;y++)
    {
        for(let x = 0; x < 50;x++)
        {
            matrix.set(x,y,256);
        }
    }
    return matrix
}

let IsTaken=function(buildings,x,y,countRoads)
{
    let isTaken = false;
    buildings.forEach((b) =>
    {
        if((countRoads || b.structure != STRUCTURE_ROAD) && b.pos.x == x && b.pos.y == y)
        {
            isTaken = true;
        }
    })
    return isTaken;
}

let IsValidSpot=function(colony,terrain,buildings,x,y,centerPos)
{
    if(buildings.length > 0)
    {
        var pathToCore = PathFinder.search(centerPos,[{pos:new RoomPosition(x,y,centerPos.roomName),range:1}],{roomCallback:BuildingPathingMap,swampCost:1,plainCost:1,ignoreCreeps:true})
        if (pathToCore.incomplete)
        {
            return false;
        }
    }

    if(terrain.get(x,y) == TERRAIN_MASK_WALL)
    {
        return false;
    }

    let blocks = false;

    ALL_DIRECTIONS.forEach((d) =>
    {
        if (blocks)
        {
            return;
        }

        let _x = x + offsets.x[d];
        let _y = y + offsets.y[d];
        if(IsTaken(buildings,_x,_y,true))
        {
            var pathToCore2 = PathFinder.search(centerPos,[{pos:new RoomPosition(_x,_y,centerPos.roomName),range:1}],{roomCallback:BuildingPathingMap,swampCost:1,plainCost:1,ignoreCreeps:true})
            if (pathToCore2.incomplete) 
            {
                blocks = true;
            }
        }
    })
    
    return !blocks;
}

module.exports.Expand = function(colony)
{
    if(!colony.mainPlanner)
    {
        console.log("setting up mainplanner for: " + colony.pos.roomName);
        colony.mainPlanner =
        {
            stage:PLANNER_STAGE_PLACE
        }
    }

    if(colony.mainPlanner.stage == PLANNER_STAGE_PLACE)
    {
        Performance.Decisions.Run("planner",ExpandColony,colony)
    }
    else if(colony.mainPlanner.stage == PLANNER_STAGE_WAITING 
        && colony.mainPlanner.level < colony.level)
    {
        Performance.Decisions.Run("planner",ExpandColony,colony)
    }
}

module.exports.BuildingsAvailable=function(colony,structure)
{
    let available = CONTROLLER_STRUCTURES[structure][colony.level];
    if(structure == STRUCTURE_LINK)
    {
        available -= 1; //upgrade link
    }
    available -= C.BUILDINGS_AT_LEVEL[colony.level][structure] || 0;
    return available;
}

module.exports.Reset=function(colony)
{
    if(colony.mainPlanner)
    {
        delete colony.mainPlanner
    }
    for(let tag of Object.keys(colony.planner))
    {
        if(colony.subLayouts[tag])
        {
            delete colony.subLayouts[tag];
        }
    }
    colony.layout = "";
    colony.planner = {};

}