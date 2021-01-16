checkAllPlanned=function()
{
    
    if(!Memory.data) {Memory.data = {}}
    if(!Memory.data.pexpansions) { Memory.data.pexpansions = []}
    checkSomePlanned(Memory.data.pexpansions.length)
}

analyzeQueue=function()
{
    if(!Memory.data) {Memory.data = {}}
    if(!Memory.data.pexpansions) { Memory.data.pexpansions = []}
    if (Memory.data.pexpansions.length < 500) {
        if (Memory.data.panalyze && Memory.data.panalyze.length > 0) {
            analyzeRoom(Memory.data.panalyze[0])
            Memory.data.panalyze.shift()
        }
    }
}

checkSomePlanned=function(amount)
{
    
    if(!Memory.data) {Memory.data = {}}
    if(!Memory.data.pexpansions) { Memory.data.pexpansions = []}
    var levels= {red:0,yellow:0,green:0}
    for(var i = 0; i < Math.min(Memory.data.pexpansions.length,amount);i++)
    {
        var pexpansion = Memory.data.pexpansions[i]
        switch(pexpansion.checklevel)
        {
            case 1:
                if(!new Room.Terrain(pexpansion.roomName).isSpaceEmpty(pexpansion.x,pexpansion.y,11,12))
                {
                    pexpansion.checklevel = 0
                }
                else
                {
                    levels.red += 1
                }
                break;
            case 2:
                break;
            case 3:
                amount += 1
                break;
        }
        
        if(pexpansion.checklevel < 3 && pexpansion.checklevel != 0)
        {
            pexpansion.checklevel += 1
        }
    }
    var failed = 0
    for (var i = Math.min(Memory.data.pexpansions.length-1,amount); i >= 0; i--) 
    {
        if (Memory.data.pexpansions[i].checklevel == 0) 
        {
            Memory.data.pexpansions.splice(i,1)
            failed += 1
        }
    }
    for (var i = Math.min(Memory.data.pexpansions.length-1,amount); i >= 0; i--) 
    {
        if (Memory.data.pexpansions[i].checklevel == 3) 
        {
            if(!Memory.data.posexpansions) { Memory.data.posexpansions = []}
            Memory.data.posexpansions.push(Memory.data.pexpansions[i])
            Memory.data.pexpansions.splice(i,1)
        }
        
    }
    if(levels.red)
    {
        console.log(levels.red + " planned sites have enough space, " + failed + " didn't make the cut")
    }
}
