
let C = 
{
    MAX_DISTANCE_FROM_EXISTING          :7,

    EVALUATION_STAGE_REQUESTED          :'Requested',
    EVALUATION_STAGE_SPACE_CHECK        :'Space_Check',
    EVALUATION_STAGE_ENERGY_CHECK       :'Energy_Check',
    EVALUATION_STAGE_CONTROLLER_CHECK   :'Controller_Check',
    EVALUATION_STAGE_MINERAL_CHECK      :'Mineral_Check',
    EVALUATION_STAGE_REMOTE_CHECK       :'Remote_Check',
    EVALUATION_STAGE_FAILED             :'Failed',
    EVALUATION_STAGE_DONE               :'Done',

    SCORE_WEIGHTS:
    {
        ['Space_Check']      :5,
        ['Energy_Check']     :3,
        ['Controller_Check'] :1,
        ['Mineral_Check']    :1,
        ['Remote_Check']     :20
    }
}

let GeneratePositions = function(roomName)
{
    let out = "";
    let terrain = new Room.Terrain(roomName)
    for(let x = 7;x < 43; x++)
    {
        for(let y = 7;y < 43; y++)
        {
            if(terrain.get(x,y) != TERRAIN_MASK_WALL)
            {
                out += COMPACT_NUMBER.Encode[x] + COMPACT_NUMBER.Encode[y];
            }
        }
    }
    return out;
}

let UnPackPositions = function(positions,roomName)
{
    let out = [];
    for(let i = 0; i < positions.length-1;i+=2)
    {
        out.push(new RoomPosition(
            COMPACT_NUMBER.Decode[positions.charAt(i)],
            COMPACT_NUMBER.Decode[positions.charAt(i+1)],
            roomName
        ))
    }
    return out;
}

let TotalScoreOf = function(blob,i)
{
    let totalScore = 0;
    for(let step in blob.score)
    {
        let score = blob.score[step];
        if(score.length > i)
        {
            totalScore += COMPACT_NUMBER.Decode[score.charAt(i)] * C.SCORE_WEIGHTS[step];
        }
    }
    return totalScore;
}

let ProcessRequest = function(roomName, dataBlob)
{
    dataBlob.positions = GeneratePositions(roomName);
    dataBlob.stage = C.EVALUATION_STAGE_SPACE_CHECK;
}

let ProcessSpaceCheck = function(roomName, dataBlob)
{
    let positions = UnPackPositions(dataBlob.positions,roomName);
    if(!dataBlob.score) { dataBlob.score = {}}
    if(!dataBlob.score[C.EVALUATION_STAGE_SPACE_CHECK])
    {
        dataBlob.score[C.EVALUATION_STAGE_SPACE_CHECK] = "";
    }

    const size = 6;
    const absoluteMax = (size*2+1) * (size*2+1) + size*8 - 8;

    while(dataBlob.score[C.EVALUATION_STAGE_SPACE_CHECK].length < positions.length)
    {
        let p = positions[dataBlob.score[C.EVALUATION_STAGE_SPACE_CHECK].length];
        let score = 0;
        let penalty = 0;
        for(let dx = -size; dx <= size;dx ++)
        {
            for(let dy = -size; dy <= size;dy ++)
            {
                let p2 = p.offset(dx,dy);
                if(p2 && QuickFind.Helpers.IsReachable(p,p2))
                {
                    score++;
                    
                    if(Math.abs(Math.abs(dx) - Math.abs(dy)) == 2 || (Math.abs(dx) + Math.abs(dy)) <= 2)
                    {
                        score++;
                    }
                }
                else
                {
                    if(Math.abs(Math.abs(dx) - Math.abs(dy)) == 2)
                    {
                        penalty++;
                    }
                    if((Math.abs(dx) + Math.abs(dy)) <= 3)
                    {
                        penalty++;
                    }
                    if((Math.abs(dx) + Math.abs(dy)) <= 2)
                    {
                        penalty++;
                    }
                    if((Math.abs(dx) + Math.abs(dy)) <= 1)
                    {
                        penalty++;
                    }
                }
            }
        }
        let result = Math.ceil(score / absoluteMax * 50) - 1;
        result = (result - penalty).clamp(0,49)
        if(_.isUndefined(COMPACT_NUMBER.Encode[result]))
        {
            console.log(result);
        }
        dataBlob.score[C.EVALUATION_STAGE_SPACE_CHECK] += COMPACT_NUMBER.Encode[result];

        if(Game.cpu.getUsed() / Game.cpu.limit > 0.7)
        {
            break;
        }
    }

    if(dataBlob.score[C.EVALUATION_STAGE_SPACE_CHECK].length == positions.length)
    {
        dataBlob.stage = C.EVALUATION_STAGE_ENERGY_CHECK;
    }

}

let ProcessEnergyCheck = function(roomName,blob)
{
    let room = Game.rooms[roomName];
    if(!room)
    {
        Empire.Scouting.WantsVision(roomName);
        return;
    }

    let sources = room.find(FIND_SOURCES);

    if(!blob.score[C.EVALUATION_STAGE_ENERGY_CHECK])
    {
        blob.score[C.EVALUATION_STAGE_ENERGY_CHECK] = "";
    }

    const optimal = 8;
    const tooFar = 32;

    let positions = UnPackPositions(blob.positions,roomName);
    while(blob.score[C.EVALUATION_STAGE_ENERGY_CHECK].length < positions.length)
    {
        let p = positions[blob.score[C.EVALUATION_STAGE_ENERGY_CHECK].length];

        let score = 0;
        for(let s of sources)
        {
            let pathResult = PathFinder.search(s.pos,[{pos:p,range:1}]);
            if(pathResult.incomplete)
            {
                continue;
            }

            let d = pathResult.path.length;
            if(d > optimal)
            {
                score += lerp(25,0,((d-optimal)/tooFar).clamp(0,1));
            }
            else
            {
                score += lerp(0,25,(d/optimal).clamp(0,1));
            }
        }

        let result = Math.round(score).clamp(0,49);
        blob.score[C.EVALUATION_STAGE_ENERGY_CHECK] += COMPACT_NUMBER.Encode[result];
        if(Game.cpu.getUsed() / Game.cpu.limit > 0.7)
        {
            break;
        }
    }

    if(blob.score[C.EVALUATION_STAGE_ENERGY_CHECK].length == positions.length)
    {
        blob.stage = C.EVALUATION_STAGE_CONTROLLER_CHECK;
    }
}

let ProcessControllerCheck = function(roomName,blob)
{
    let room = Game.rooms[roomName];
    if(!room)
    {
        Empire.Scouting.WantsVision(roomName);
        return;
    }

    if(!blob.score[C.EVALUATION_STAGE_CONTROLLER_CHECK])
    {
        blob.score[C.EVALUATION_STAGE_CONTROLLER_CHECK] = "";
    }

    const optimal = 10;
    const tooFar = 32;

    if(!room.controller)
    {
        blob.stage = C.EVALUATION_STAGE_FAILED;
        return;
    }
    if(room.controller.owned)
    {
        blob.stage = C.EVALUATION_STAGE_FAILED;
        return;
    }
    if(room.controller.resevation && room.controller.resevation.username != INVADER_USERNAME)
    {
        blob.stage = C.EVALUATION_STAGE_FAILED;
        return;
    }

    let positions = UnPackPositions(blob.positions,roomName);
    while(blob.score[C.EVALUATION_STAGE_CONTROLLER_CHECK].length < positions.length)
    {
        let p = positions[blob.score[C.EVALUATION_STAGE_CONTROLLER_CHECK].length];

        let score = 0;
        let pathResult = PathFinder.search(room.controller.pos,[{pos:p,range:1}]);
        if(pathResult.incomplete)
        {
            break;
        }

        let d = pathResult.path.length;

        if(d > optimal)
        {
            score += lerp(50,0,((d-optimal)/tooFar).clamp(0,1));
        }
        else
        {
            score += lerp(0,50,(d/optimal).clamp(0,1));
        }

        let result = Math.round(score).clamp(0,49);
        blob.score[C.EVALUATION_STAGE_CONTROLLER_CHECK] += COMPACT_NUMBER.Encode[result];
        if(Game.cpu.getUsed() / Game.cpu.limit > 0.7)
        {
            break;
        }
    }

    if(blob.score[C.EVALUATION_STAGE_CONTROLLER_CHECK].length == positions.length)
    {
        blob.stage = C.EVALUATION_STAGE_MINERAL_CHECK;
    }
}

let ProcessMineralCheck = function(roomName,blob)
{
    let room = Game.rooms[roomName];
    if(!room)
    {
        Empire.Scouting.WantsVision(roomName);
        return;
    }

    if(!blob.score[C.EVALUATION_STAGE_MINERAL_CHECK])
    {
        blob.score[C.EVALUATION_STAGE_MINERAL_CHECK] = "";
    }

    const optimal = 8;
    const tooFar = 100;

    let t = room.find(FIND_MINERALS)[0];
    if(!t)
    {
        Game.notify("Empire expansion is evaluating a room without minerals");
        return;
    }
    let positions = UnPackPositions(blob.positions,roomName);
    while(blob.score[C.EVALUATION_STAGE_MINERAL_CHECK].length < positions.length)
    {
        let p = positions[blob.score[C.EVALUATION_STAGE_MINERAL_CHECK].length];

        let score = 0;
        let pathResult = PathFinder.search(t.pos,[{pos:p,range:1}]);
        if(pathResult.incomplete)
        {
            break;
        }

        let d = pathResult.path.length;

        if(d > optimal)
        {
            score += lerp(50,0,((d-optimal)/tooFar).clamp(0,1));
        }
        else
        {
            score += lerp(0,50,(d/optimal).clamp(0,1));
        }

        let result = Math.round(score).clamp(0,49);
        blob.score[C.EVALUATION_STAGE_MINERAL_CHECK] += COMPACT_NUMBER.Encode[result];
        if(Game.cpu.getUsed() / Game.cpu.limit > 0.7)
        {
            break;
        }
    }

    if(blob.score[C.EVALUATION_STAGE_MINERAL_CHECK].length == positions.length)
    {
        blob.stage = C.EVALUATION_STAGE_REMOTE_CHECK;
    }
}

let ScoutRemotes = function(roomName,blob)
{
    if(!blob.remotesSeen)
    {
        blob.remotesSeen = [];
    }
    if(!blob.remoteSources)
    {
        blob.remoteSources = [];
    }

    for(let nextRoom of Object.values(Game.map.describeExits(roomName)))
    {
        if(blob.remotesSeen.includes(nextRoom))
        {
            continue;
        }

        let tooClose = false;
        for(let exit of Object.values(Game.map.describeExits(nextRoom)))
        {
            if(tooClose)
            {
                break;
            }

            for(let c of Object.values(Memory.colonies))
            {
                if(c.pos.roomName == exit)
                {
                    tooClose = true;
                }
            }
        }
        if(tooClose)
        {
            blob.stage = C.EVALUATION_STAGE_FAILED;
            return;
        }
            
        let room = Game.rooms[nextRoom];
        if(!room)
        {
            Empire.Scouting.WantsVision(nextRoom);
        }
        else
        {
            if(room.controller)
            {
                if(room.controller.owned)
                {
                    blob.remotesSeen.push(nextRoom);
                    blob.stage = C.EVALUATION_STAGE_FAILED;
                    return;
                }
                if(room.controller.resevation && room.controller.resevation.username != INVADER_USERNAME)
                {
                    blob.remotesSeen.push(nextRoom);
                    blob.stage = C.EVALUATION_STAGE_FAILED;
                    return;
                }
            }
            for(let s of room.find(FIND_SOURCES))
            {
                blob.remoteSources.push(
                    {
                        pos:s.pos,
                        mult:room.controller ? 1 : 4/3
                    }
                )
            }
            blob.remotesSeen.push(nextRoom);
        }
        return;
    }

    blob.remotesAllFound = true;
}

let ProcessRemoteCheck = function(roomName,blob)
{

    if(!blob.remotesAllFound)
    {
        ScoutRemotes(roomName,blob);
        return;
    }

    if(!blob.score[C.EVALUATION_STAGE_REMOTE_CHECK])
    {
        blob.score[C.EVALUATION_STAGE_REMOTE_CHECK] = "";
    }

    const optimal = 10;
    const tooFar = 60;

    let positions = UnPackPositions(blob.positions,roomName);
    while(blob.score[C.EVALUATION_STAGE_REMOTE_CHECK].length < positions.length)
    {
        let p = positions[blob.score[C.EVALUATION_STAGE_REMOTE_CHECK].length];

        let score = 0;
        for(let s of blob.remoteSources)
        {
            let sp = new RoomPosition(s.pos.x,s.pos.y,s.pos.roomName);
            let pathResult = PathFinder.search(sp,[{pos:p,range:1}]);
            if(pathResult.incomplete)
            {
                continue;
            }

            let d = pathResult.path.length;
            if(d > optimal)
            {
                score += lerp(5,0,((d-optimal)/tooFar).clamp(0,1)) * s.mult;
            }
            else
            {
                score += lerp(0,5,(d/optimal).clamp(0,1)) * s.mult;
            }
        }

        let result = Math.round(score).clamp(0,49);
        blob.score[C.EVALUATION_STAGE_REMOTE_CHECK] += COMPACT_NUMBER.Encode[result];
        if(Game.cpu.getUsed() / Game.cpu.limit > 0.7)
        {
            break;
        }
    }

    if(blob.score[C.EVALUATION_STAGE_REMOTE_CHECK].length == positions.length)
    {
        blob.stage = C.EVALUATION_STAGE_DONE;
    }
}

let ProcessDoneCheck = function(roomName,blob)
{
    if(!blob.finalized)
    {
        let positions = UnPackPositions(blob.positions,roomName);

        let bestScore = 0;
        let bestPos = false;
        for(let i in positions)
        {
            let score = TotalScoreOf(blob,i);
            if(score > bestScore)
            {
                bestPos = positions[i];
                bestScore = score;
            }
        }
        Memory.empire.expansion.finalized.push(
            {
                room:roomName,
                pos:bestPos,
                score:bestScore
            }
        )

        for(let room of Object.values(Game.map.describeExits(roomName)))
        {
            for(let c of Object.values(Memory.colonies))
            {
                if(Game.map.getRoomLinearDistance(room,c.pos.roomName) < C.MAX_DISTANCE_FROM_EXISTING)
                {
                    Empire.Expansion.StartEvaluate(room);
                    break;
                }
            }
        }

        blob.finalized = true;
    }
}

let ProcessExpansion = function(roomName)
{
    let blob = Memory.empire.expansion.rooms[roomName];
    switch(blob.stage)
    {
        case C.EVALUATION_STAGE_REQUESTED:
            ProcessRequest(roomName, blob);
            break;
        case C.EVALUATION_STAGE_SPACE_CHECK:
            ProcessSpaceCheck(roomName, blob);
            break;
        case C.EVALUATION_STAGE_ENERGY_CHECK:
            ProcessEnergyCheck(roomName, blob);
            break;
        case C.EVALUATION_STAGE_CONTROLLER_CHECK:
            ProcessControllerCheck(roomName, blob);
            break;
        case C.EVALUATION_STAGE_MINERAL_CHECK:
            ProcessMineralCheck(roomName, blob);
            break;
        case C.EVALUATION_STAGE_REMOTE_CHECK:
            ProcessRemoteCheck(roomName, blob);
            break;
        case C.EVALUATION_STAGE_DONE:
            ProcessDoneCheck(roomName, blob);
            return true;
        case C.EVALUATION_STAGE_FAILED:
            return true;
    }
    return false;
}


module.exports.StartEvaluate=function(roomName)
{
    if(Memory.empire.expansion.rooms[roomName])
    {
        return;
    }
    for(let c of Object.values(Memory.colonies))
    {
        if(c.pos.roomName == roomName)
        {
            return;
        }
    }


    Memory.empire.expansion.rooms[roomName] = 
    {
        stage: C.EVALUATION_STAGE_REQUESTED,
        score: {},
        maxScore: 0
    }
}



module.exports.Update=function()
{
    for(let room in Memory.empire.expansion.rooms)
    {
        if(!Performance.Decisions.Run('expansion',ProcessExpansion,room))
        {
            break;
        }
    }
}

module.exports.Draw=function(roomName)
{
    let blob = Memory.empire.expansion.rooms[roomName];
    if(!blob)
    {
        return;
    }

    let vis = new RoomVisual(roomName);

    vis.rect(0.2,1.2,6.6,4.6,{fill:"#000000",stroke:"#FFFFFF",opcaity:1});

    let font = 0.4;
    let enabled = Performance.Decisions.Enabled("expansion");

    vis.text("Empire Expansion Planner",0.3,1.6,{font:font,align:"left"});
    vis.text("Enabled: " + enabled,0.3,2.1,{font:font,align:"left",color: enabled ? "#AAFFAA" : "#FFAAAA"});
    vis.text("Current stage: " + blob.stage,0.3,2.6,{font:font,align:"left"});

    if(blob.stage == C.EVALUATION_STAGE_FAILED)
    {
        return;
    }
    if(blob.positions)
    {
        let positions = UnPackPositions(blob.positions,roomName);
        for(let i in positions)
        {
            let p = positions[i];
            let score = 0;
            let totalScore = TotalScoreOf(blob,i);
            if(blob.stage == C.EVALUATION_STAGE_DONE)
            {
                score = Math.floor(totalScore/blob.maxScore * 50);
            }
            else if(blob.score[blob.stage] && blob.score[blob.stage].length > i)
            {
                score = COMPACT_NUMBER.Decode[blob.score[blob.stage].charAt(i)];
            }
            if(blob.maxScore < totalScore)
            {
                blob.maxScore = totalScore;
            }

            let radius = lerp(0.1,0.5,totalScore/blob.maxScore);
            let color = "#" + lerpColor(0xFF3333,0x33FF33,score/50).toString(16);
            let stroke = blob.maxScore == totalScore ? "#FFFFFF" : false;
            //vis.text(score,p.x,p.y-0.3,{font:0.3});
            vis.circle(p,{radius:radius,fill:color,stroke,stroke});
        }
    }
}

module.exports.Commit=function()
{
    let bestScore = 0;
    let best = false;
    for(let f of Memory.empire.expansion.finalized)
    {
        if(f.score > bestScore)
        {
            bestScore = f.score;
            best = f;
        }
    }
    if(best)
    {
        Colony.Starter.Generate(new RoomPosition(best.pos.x,best.pos.y,best.pos.roomName));
        Memory.empire.expansion.finalized = [];
        Memory.empire.expansion.rooms = {};
    }
}

module.exports.StartInitialColony=function()
{
    if(Memory.colonies.length == 0 && Object.keys(Game.spawns).length > 0)
    {
        let s = Object.values(Game.spawns)[0];
        Colony.Starter.Generate(s.pos.offsetDirection(LEFT))
    }
}