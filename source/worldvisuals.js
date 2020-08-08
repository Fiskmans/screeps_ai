let LastTickBucket = 0;

worldVisuals=function()
{
    if (Game.flags["Colony"])
    {
        var vis = new RoomVisual(Game.flags["Colony"].pos.roomName)
        //vis.blocked(getBlocked(Game.flags["Colony"].pos.x,Game.flags["Colony"].pos.y,Game.flags["Colony"].pos.roomName,layout.structures[7]),{fill:"#FF0000"})
        var missing = findMissing(Game.flags["Colony"].pos.x,Game.flags["Colony"].pos.y,Game.flags["Colony"].pos.roomName, layout.structures[8])
        if (missing) {
            vis.plan(Game.flags["Colony"].pos.x,Game.flags["Colony"].pos.y,missing,{alpha:1,scale:0.5 + Game.time%100/200})
        }
        vis.connectRoads()
    }
    var rooms = {}
    if (Memory.data && Memory.data.pexpansions) {
        for(var key in Memory.data.pexpansions)
        {
            rooms[Memory.data.pexpansions[key].roomName] = true
        }
    }
    if (Memory.data && Memory.data.posexpansions) {
        for(var key in Memory.data.posexpansions)
        {
            rooms[Memory.data.posexpansions[key].roomName] = true
        }
    }
    for (var key in rooms) 
    {
        drawRoom(key)
    }
    if (Game.flags["LocalCluster"] && Game.flags["LocalCluster"].color != COLOR_RED && Memory.rooms[Game.flags["LocalCluster"].pos.roomName] && (Game.time - Memory.rooms[Game.flags["LocalCluster"].pos.roomName].lastViewed < 10))
    {
        let pos = Game.flags["LocalCluster"].pos;
        let room = Game.rooms[pos.roomName];
        if (room) 
        {
            let vis = room.visual;
            if (!vis) {
                vis = new RoomVisual(room.name)
            }
            vis.poly([[pos.x+1.5,pos.y+2.5],[pos.x+11.5,pos.y+2.5],[pos.x+11.5,pos.y+12.5],[pos.x+1.5,pos.y+12.5],[pos.x+1.5,pos.y+2.5]],{strokeWidth:0.01,lineStyle:"dashed"});
            let [rx,ry] = PosFromRoomName(room.name);
            let segx = Math.floor(rx/10)
            let segy = Math.floor(ry/10)
            vis.DrawMapSegment({x:pos.x+2,y:pos.y+2,segx:segx,segy:segy});
            
            if (Game.flags["Left"] && Game.flags["Left"].color != COLOR_RED) 
            {
                vis.DrawMapSegment({x:pos.x-8,y:pos.y+2,segx:segx-1,segy:segy});
            }
            if (Game.flags["Up"]&& Game.flags["Up"].color != COLOR_RED) 
            {
                vis.DrawMapSegment({x:pos.x+2,y:pos.y-8,segx:segx,segy:segy+1});
            }
            if (Game.flags["Right"]&& Game.flags["Right"].color != COLOR_RED) 
            {
                vis.DrawMapSegment({x:pos.x+12,y:pos.y+2,segx:segx+1,segy:segy});
            }
            if (Game.flags["Down"]&& Game.flags["Down"].color != COLOR_RED) 
            {
                vis.DrawMapSegment({x:pos.x+2,y:pos.y+12,segx:segx,segy:segy-1});
            }
            if (Game.flags["wars"]&& Game.flags["wars"].color != COLOR_RED) 
            {
                if (Memory.wars) 
                {
                    for(let name in Memory.wars)
                    {
                        if (Memory.wars[name].battlefronts) 
                        {
                            for(let roomname in Memory.wars[name].battlefronts)
                            {
                                let [sx,sy] = PosFromRoomName(roomname)
                                let sdx = sx - segx * 10;
                                let sdy = sy - segy * 10;
                                let [vsx,vsy] = [pos.x + 2 + sdx,pos.y + 12-sdy+0.3]
                                vis.text("💀",vsx,vsy);
                                let front = Memory.wars[name].battlefronts[roomname];
                                if (front.path) 
                                {
                                    for(let from in front.path)
                                    {
                                        let to = front.path[from];
                                        let [fx,fy] = PosFromRoomName(from)
                                        let fdx = fx - segx * 10;
                                        let fdy = fy - segy * 10;
                                        let [vfx,vfy] = [pos.x + 2 + fdx,pos.y + 12-fdy]
                                        let [tx,ty] = PosFromRoomName(to)
                                        let tdx = tx - segx * 10;
                                        let tdy = ty - segy * 10;
                                        let [vtx,vty] = [pos.x + 2 + tdx,pos.y + 12-tdy]
                                        vis.line(vfx,vfy,vtx,vty);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            
            for(let name in Memory.scouting)
            {
                let [sx,sy] = PosFromRoomName(name)
                let sdx = sx - segx * 10;
                let sdy = sy - segy * 10;
                let [vsx,vsy] = [pos.x + 2 + sdx,pos.y + 12-sdy]
                vis.circle(vsx,vsy);
                if (Memory.scouting[name]) 
                {
                    let creep = Game.creeps[Memory.scouting[name]];
                    if (creep) 
                    {
                        let [cx,cy] = PosFromRoomName(creep.pos.roomName)
                        let cdx = cx - segx * 10;
                        let cdy = cy - segy * 10;
                        let [vcx,vcy] = [pos.x + 2 + cdx - 0.5 + creep.pos.x/50,pos.y + 12-cdy - 0.5 + creep.pos.y/50]
                        vis.circle(vcx,vcy,{radius:0.1});
                        vis.line(vcx,vcy,
                                vsx,vsy,{lineStyle:"dotted"});
                    }
                }
            }
            if(Memory.map && Memory.map.powerbanks)
            {
                for(let name in Memory.map.powerbanks)
                {
                    let bank = Memory.map.powerbanks[name];
                    let [px,py] = PosFromRoomName(name)
                    let pdx = px - segx * 10;
                    let pdy = py - segy * 10;
                    let [vpx,vpy] = [pos.x + 2 + pdx,pos.y + 12-pdy]
                    vis.symbol(vpx-0.35,vpy+0.35,RESOURCE_POWER,{scale:0.5});
                    vis.text("x" + bank.amount, vpx-0.25,vpy+0.40,{font:0.2,align:"left"})
                    vis.text(bank.livesUntil - Game.time, vpx-0.25,vpy+0.20,{font:0.2,align:"left"})
                }
            }
        }
    }
    
    if (Game.flags["CPU"] && Game.flags["CPU"].color != COLOR_RED) 
    {
        //Preperations
        let barpos = {x:Game.flags["CPU"].pos.x+0.5,y:Game.flags["CPU"].pos.y-0.5};
        let vis = Game.flags["CPU"].room ? Game.flags["CPU"].room.visual : new RoomVisual(Game.flags["CPU"].room.name);
        
        if (Memory.performance) 
        {
            let spacing = 2.8;
            for (var i = 0; i < Memory.performance.length; i++) 
            {
                vis.graph(barpos.x,barpos.y + 5 + spacing*i,10,2,Memory.performance[i].data,
                        {strokeWidth:0.05,opacity:1,cliptops:false,
                            top:{width:0.05,opacity:1,lineStyle:"dotted"},
                            bottom:{width:0.05,opacity:1},
                            left:{width:0.05,opacity:1,type:"edge"},
                            right:{width:0.05,opacity:1,type:"edge"}
                        }
                    );
                let at = 10-10*(Memory.performance[i].at / DATA_POINTS_PER_SEGMENT);
                vis.line(barpos.x+at,barpos.y + 6.5 + spacing*i,barpos.x+at,barpos.y+7 + spacing*i,{width:0.02,opacity:1})
            }
        }
        let cpuusage = Game.cpu.getUsed() / Game.cpu.tickLimit*10;
        let limit = Game.cpu.limit/Game.cpu.tickLimit *10;
        let bucket = Game.cpu.bucket / 10000*10
        let bucketDelta = bucket - LastTickBucket;
        LastTickBucket = bucket;
        let maxUsage = (Game.cpu.tickLimit-Game.cpu.limit) / 10000 * 10
        
        //Drawing
        vis.rect(barpos.x,barpos.y,cpuusage,1,{fill:"#00FF00FF",stroke:"#00000000",opacity:1})
        vis.rect(barpos.x,barpos.y+2,bucket,1,{fill:"#00FF00FF",stroke:"#00000000",opacity:1})
        
        if(!Memory.onPhone)
        {
            //Borders
            vis.rect(barpos.x,barpos.y+2,10,1,{fill:"#00000000",stroke:"#FFFFFF",opacity:1,strokeWidth:0.05})
            vis.rect(barpos.x,barpos.y,10,1,{fill:"#00000000",stroke:"#FFFFFF",opacity:1,strokeWidth:0.05})
            vis.line(barpos.x+limit,barpos.y,barpos.x+limit,barpos.y+1,{color:"#FFFFFF",opacity:1,width:0.05})
            vis.line(barpos.x,barpos.y+2,barpos.x+limit,barpos.y+1,{color:"#FFFFFF",opacity:1,width:0.05})
            vis.line(barpos.x+maxUsage,barpos.y+2,barpos.x+10,barpos.y+1,{color:"#FFFFFF",opacity:1,width:0.05})
            vis.line(barpos.x+maxUsage,barpos.y+2,barpos.x+maxUsage,barpos.y+3,{color:"#FFFFFF",opacity:1,width:0.05})
            vis.text((bucket).toFixed(3) + "k/10k",barpos.x+9.85,barpos.y+2.85,{align:"right"})
            vis.text((bucketDelta > 0 ? "+" : "") + (bucketDelta).toFixed(4) + "k",barpos.x+10.20,barpos.y+2.85,{align:"left",color:((bucketDelta > 0 ? "#88FF88" : "#FF8888"))});
        } 
    }

    if(Game.flags["Recipe"] && Game.flags["Recipe"].color != COLOR_RED)
    {
        let pos = {x:Game.flags["Recipe"].pos.x,y:Game.flags["Recipe"].pos.y-4};
        let vis = Game.flags["Recipe"].room && Game.flags["Recipe"].room.visual ? Game.flags["Recipe"].room.visual : new RoomVisual(Game.flags["Recipe"].room.name);
        if(Game.flags["Recipe"].memory)
        {
            vis.recipe(pos.x,pos.y,Game.flags["Recipe"].memory[Game.time%Game.flags["Recipe"].memory.length],{radius:1.6})
        }
    }

    if(Game.flags["ResourceDemo"] && Game.flags["ResourceDemo"].color != COLOR_RED)
    {
        let pos = {x:Game.flags["ResourceDemo"].pos.x+1,y:Game.flags["ResourceDemo"].pos.y+1};
        let vis = Game.flags["ResourceDemo"].room && Game.flags["ResourceDemo"].room.visual ? Game.flags["ResourceDemo"].room.visual : new RoomVisual(Game.flags["ResourceDemo"].pos.roomName);
        
        RESOURCES_ALL.forEach((r) =>
        {
            vis.symbol(pos.x,pos.y,r,{scale:1.2});
            pos.x += 2;
            if(pos.x > 48)
            {
                pos.x = Game.flags["ResourceDemo"].pos.x+1;
                pos.y += 2;
            }
        })
    }
    if(Game.flags["point1"] && Game.flags["point2"] && Game.flags["point3"] && Game.flags["point1"])
    {
        let vis = Game.flags["point1"].room && Game.flags["point1"].room.visual ? Game.flags["point1"].room.visual : new RoomVisual(Game.flags["point1"].pos.roomNname);
        let points = [
            [Game.flags["point1"].pos.x,Game.flags["point1"].pos.y],
            [Game.flags["point2"].pos.x,Game.flags["point2"].pos.y],
            [Game.flags["point3"].pos.x,Game.flags["point3"].pos.y],
            [Game.flags["point4"].pos.x,Game.flags["point4"].pos.y]
        ]
        vis.poly(points)
        vis.poly(BezierFragment(16,points))
    }
    
    
    DrawWars();
}
