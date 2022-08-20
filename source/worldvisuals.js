let LastTickBucket = 0;

let visuals = 
{
    expansionPlanner:function()
    {
        
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
    },
    map:function()
    {
        if (Game.flags["LocalCluster"] && Game.flags["LocalCluster"].color != COLOR_RED && Memory.rooms[Game.flags["LocalCluster"].pos.roomName] && Helpers.Externals.IsRoomVisible(Game.flags["LocalCluster"].pos.roomName))
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
    },
    cpu:function()
    {
        if (Game.flags["CPU"] && Game.flags["CPU"].color != COLOR_RED && Helpers.Externals.IsRoomVisible(Game.flags["CPU"].pos.roomName)) 
        {
            //Preperations
            let barpos = {x:Game.flags["CPU"].pos.x+0.5,y:Game.flags["CPU"].pos.y-0.5};
            let vis = Game.flags["CPU"].room ? Game.flags["CPU"].room.visual : new RoomVisual(Game.flags["CPU"].pos.roomName);
            
            if (Memory.performance) 
            {
                let spacing = 2.8;
                for (var i = 0; i < Memory.performance.length; i++) 
                {
                    vis.graph(barpos.x,barpos.y + 5 + spacing*i,10,2,Memory.performance[i].data,
                            {strokeWidth:0.01,opacity:1,cliptops:false,
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
    },
    recipe:function()
    {
        if(Game.flags["Recipe"] && Game.flags["Recipe"].color != COLOR_RED)
        {
            let pos = {x:Game.flags["Recipe"].pos.x,y:Game.flags["Recipe"].pos.y-4};
            let vis = Game.flags["Recipe"].room && Game.flags["Recipe"].room.visual ? Game.flags["Recipe"].room.visual : new RoomVisual(Game.flags["Recipe"].room.name);
            if(Game.flags["Recipe"].memory)
            {
                vis.recipe(pos.x,pos.y,Game.flags["Recipe"].memory[Game.time%Game.flags["Recipe"].memory.length],{radius:1.6})
            }
        }
    },
    resourceDemo:function()
    {
        /*
        if(Game.flags["ResourceDemo"] && Game.flags["ResourceDemo"].color != COLOR_RED)
        {
            let pos = {x:Game.flags["ResourceDemo"].pos.x+1,y:Game.flags["ResourceDemo"].pos.y+1};
            let vis = Game.flags["ResourceDemo"].room && Game.flags["ResourceDemo"].room.visual ? Game.flags["ResourceDemo"].room.visual : new RoomVisual(Game.flags["ResourceDemo"].pos.roomName);
            
            RESOURCES_ALL.forEach((r) =>
            {
                vis.symbol(pos.x,pos.y,r,{scale:1});
                pos.x += 2;
                if(pos.x > 48)
                {
                    pos.x = Game.flags["ResourceDemo"].pos.x+1;
                    pos.y += 2;
                }
            })
        }*/
        if(Game.flags["Test"] && Game.flags["Test"].color != COLOR_RED)
        {
            let pos = {x:Game.flags["Test"].pos.x+1,y:Game.flags["Test"].pos.y+1};
            let vis = Game.flags["Test"].room && Game.flags["Test"].room.visual ? Game.flags["Test"].room.visual : new RoomVisual(Game.flags["Test"].pos.roomName);
            
            [RESOURCE_SYMBOL_TAW].forEach((r) =>
            {
                vis.symbol(pos.x,pos.y,r,{scale:1});
                pos.x += 2;
                if(pos.x > 48)
                {
                    pos.x = Game.flags["Test"].pos.x+1;
                    pos.y += 2;
                }
            })
        }
    },
    testLab:function()
    {
        if(Game.flags["TestLab"] && Game.flags["TestLab"].color != COLOR_RED)
        {
            if(Game.cpu.bucket < 1000)
            {
                Game.flags["TestLab"].setColor(COLOR_RED);
            }

            let pos = Game.flags["TestLab"].pos;
            let vis = new RoomVisual(pos.roomName);

            //vis.CostMatrix(pos.roomName,Colony.Planner.BuildPlannerAllPlanned(pos.roomName));

            vis.layout(Colony.Planner.InstaniateLayout(pos,labSateliteLayout));
            for(let x = -1; x < 2; x++)
            {
                for(let y = -1; y < 2; y++)
                {
                    let pos2 = pos.offset(x,y);
                    if(Colony.Planner.CanLayoutFit(pos2,labSateliteLayout))
                    {
                        vis.circle(pos2,{fill:"#00FF00"});
                    }
                    else
                    {
                        vis.circle(pos2,{fill:"#FF0000"});
                    }
                }   
            }
        }
    },
    damage:function()
    {
        if(Game.flags["Damage"] && Game.flags["Damage"].color != COLOR_RED)
        {
            let pos = Game.flags["Damage"].pos;

            if(!Helpers.Externals.IsRoomVisible(pos.roomName))
            {
                return;
            }

            let room = Game.rooms[pos.roomName];
            if(room)
            {
                let vis = room.visual || new RoomVisual(pos.roomName);

                let options = {};
                if(Game.flags["FakeCreep"])
                {
                    options.creeps = [{
                        id:"a",
                        body:[
                            {
                                hits:50,
                                type:ATTACK,
                                boost:RESOURCE_UTRIUM_HYDRIDE
                            }
                        ],
                        pos:Game.flags["FakeCreep"].pos
                    }]
                }
                
                for(let obj of Combat.Calculator.Damage(room,DAMAGE_TYPE_FRIENDLY,pos,options).dealers)
                {
                    vis.line(obj.pos,pos,{width:0.01,opacity:1,color:"#AAFFAA"});
                }
                for(let obj of Combat.Calculator.Damage(room,DAMAGE_TYPE_ENEMY,pos,options).dealers)
                {
                    vis.line(obj.pos,pos,{width:0.01,opacity:1,color:"#FFAAAA"});
                }

                const range = 4;
                for(let x = pos.x - range; x <= pos.x + range; x++)
                {
                    if(x < 0 || x > 49)
                    {
                        continue;
                    }
                    for(let y = pos.y - range; y <= pos.y + range; y++)
                    {
                        if(y < 0 || y > 49)
                        {
                            continue;
                        }
                        vis.text(Combat.Calculator.Damage(room,DAMAGE_TYPE_ENEMY,x,y,options).damage,
                            x-0.05,
                            y-0.1, 
                            {
                                font:0.15,
                                align:'right',
                                color:'#FFAAAA'
                            }
                        );
                        vis.text('⚔️',
                            x-0.04,
                            y-0.1, 
                            {
                                font:0.15,
                                align:'middle',
                                color:'#FFAAAA'
                            }
                        );
                        
                        vis.text(Combat.Calculator.Damage(room,DAMAGE_TYPE_FRIENDLY,x,y,options).damage,
                            x+0.185,
                            y-0.1, 
                            {
                                font:0.15,
                                align:'left',
                                color:'#AAFFAA'
                            }
                        );

                        vis.text(Combat.Calculator.Heal(room,HEAL_TYPE_ENEMY,x,y,options).heal,
                            x-0.05,
                            y+0.1, 
                            {
                                font:0.15,
                                align:'right',
                                color:'#FFAAAA'
                            }
                        );
                        vis.text('🚑',
                            x-0.04,
                            y+0.1, 
                            {
                                font:0.15,
                                align:'middle',
                                color:'#FFAAAA'
                            }
                        );
                        
                        vis.text(Combat.Calculator.Heal(room,HEAL_TYPE_FRIENDLY,x,y,options).heal,
                            x+0.185,
                            y+0.1, 
                            {
                                font:0.15,
                                align:'left',
                                color:'#AAFFAA'
                            }
                        );

                        //vis.circle(x,y)
                    }
                }

            }
        }
    },
    hud:function()
    {
        if(!Memory.lastViewed)
        {
            return;
        }
        if(!Memory.lastViewed.room || !Memory.lastViewed.at)
        {
            return;
        }

        let vis = new RoomVisual(Memory.lastViewed.room);
        let delta = Game.time - Memory.lastViewed.at;

        vis.text("lastViewed",0,0,{align:"left"});
        vis.text(delta + " ticks ago",0,1,{align:"left"});

        if(delta > 5)
        {
            return;
        }
        Performance.Decisions.Draw(vis);
        Empire.Expansion.Draw(Memory.lastViewed.room);

    },
    QRCode:function()
    {
        let flag = Game.flags["QR"];
        if(flag && flag.color != COLOR_RED)
        {
            if(Helpers.Externals.IsRoomVisible(flag.pos.roomName))
            {
                let vis = new RoomVisual(flag.pos.roomName);
                for(let y in RICK_QR_CODE)
                {
                    for(let x = 0; x < RICK_QR_CODE[y].length; x++)
                    {
                        if(RICK_QR_CODE[y].charAt(x) == '1')
                        {
                            vis.symbol(
                                flag.pos.x + x, 
                                flag.pos.y - -y,
                                STRUCTURE_WALL,
                                {scale:1.2})
                        }
                        else
                        {
                            vis.symbol(
                                flag.pos.x + x, 
                                flag.pos.y - -y,
                                STRUCTURE_RAMPART)
                        }
                    }
                }
            }
        }
    },
    cat:function()
    {
        let flag = Game.flags["cat"];
        if(flag && flag.color != COLOR_RED)
        {
            let vis = new RoomVisual(flag.pos.roomName);
            vis.DrawSvg(flag.pos.x,flag.pos.y,SVG.cat,{scale:1,alpha:1})
        }
    }
}

worldVisuals=function()
{
    visuals.expansionPlanner();
    visuals.map();
    visuals.cpu();
    visuals.recipe();
    visuals.resourceDemo();
    visuals.damage();
    visuals.hud();
    visuals.QRCode();
    visuals.cat();

    Combat.Battle.DoUI();
    
    if(Game.flags["Start"] && Game.flags["End"])
    {
        let vis = new RoomVisual(Game.flags["Start"].pos.roomName);
        vis.poly(
            QuickFind.Helpers.Line(Game.flags["Start"].pos,Game.flags["End"].pos),
            {
                stroke:QuickFind.Helpers.IsReachable(Game.flags["Start"].pos,Game.flags["End"].pos) ?
                        "#00FF00" :
                        "#FF0000"
            }
            );
    }
}
