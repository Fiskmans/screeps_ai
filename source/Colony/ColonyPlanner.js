

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
    if(Game.shard.name == "shard3" && roomName == Memory.mainColony)
    {
        for(let x = 0;x < 50;x++)
        {
            for(let y = 0;y < 50;y++)
            {
                matrix.set(x,y,256);
            }
        }
        return matrix;
    }

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
            if(colony.layout)
            {
                let buildings = DeserializeLayout(colony.layout,roomName);
                for(let b of buildings)
                {
                    matrix.set(b.pos.x,b.pos.y,255);
                }
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
            if(colony.highways)
            {
                for(let highway of colony.highways)
                {
                    if(highway.path)
                    {
                        for(let p of highway.path)
                        {
                            if(p.roomName == roomName)
                            {
                                matrix.set(p.x,p.y,255);
                            }
                        }
                    }
                }
            }
        }
    }

    this.stashedPlanned[roomName] = {at:Game.time,value:matrix};
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
            val += BAKED_COORD.Encode[x] + BAKED_COORD.Encode[y];
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
    if(colony.layout)
    {
        let i = 0;
        while(i < colony.layout.length)
        {
            left[CHAR_STRUCTURE[colony.layout.charAt(i)]]--;
            i += 3;
        }
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
        let x = BAKED_COORD.Decode[stash.queue.charAt(0)];
        let y = BAKED_COORD.Decode[stash.queue.charAt(1)];

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

module.exports.Waiting=function(colony,tag,layout)
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
            this.Waiting(colony,tag,layout,1);
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
