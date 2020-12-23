DrawWars=function()
{
    if (Memory.wars) 
    {
        for(let name in Memory.wars)
        {
            DrawWar(Memory.wars[name]);
        }
    }
}
DrawWar=function(war)
{
    if (war.battlefronts) 
    {
        for(let roomname in war.battlefronts)
        {
            DrawBattlefront(roomname,war.battlefronts[roomname]);
        }
    }
}
DrawBattlefront=function(roomname,battlefront)
{
    let room = Cache.rooms[roomname];
    let vis = false;
    if (room) 
    {
        vis = room.visual;
    }
    if (!vis) 
    {
        vis = new RoomVisual(roomname)
    }
    
    let intel = battlefront.intel;
    if (FlagSwitch("dangerMap") && intel) 
    {
        if (intel.dangerMap) 
        {
            for (var y = 0; y < 50; y++) 
            {
                for (var x = 0; x < 50; x++) 
                {
                    let dangerlevel = intel.dangerMap[x+y*50].charCodeAt(0)-65;
                    if (dangerlevel == 0) 
                    {
                        vis.rect(x-0.5,y-0.5,1,1,{fill:"#00FF00",opacity:0.03});
                    }
                    else
                    {
                        vis.rect(x-0.5,y-0.5,1,1,{fill:"#" + lerpColor(0xFFFF00,0xFF0000,dangerlevel/20).toString(16),opacity:0.1});
                    }
                }
            }
        }
    }
    if (battlefront.wasted) 
    {
        vis.symbol(1,1,RESOURCE_ENERGY);
        vis.text("x" + battlefront.wasted,1.2,1.2,{align:"left"});
    }
    if (battlefront.drained) 
    {
        vis.symbol(1,2,RESOURCE_ENERGY);
        vis.text("x" + battlefront.drained,1.2,2.2,{align:"left"});
    }
}












