
module.exports.Generate=function(pos)
{
    if(!Memory.colonies) {Memory.colonies = []}

    for(let c of Memory.colonies)
    {
        if(c.pos.roomName == pos.roomName)
        {
            Helpers.Externals.Notify("Relocating colony at " + c.pos + " to " + pos);
            c.pos = pos;
            return;
        }
    }
    Memory.colonies.push(
        {
            pos : pos,
            constructionsite : false,
            workerpool : [],
            lastmaintained : 0,
            income:{},
            expenses:{},
            workerRoster:{},
            subLayouts:{},
            layout:""
        });

    Helpers.Externals.Notify("Starting a new colony at " + pos);
}