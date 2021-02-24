
module.exports.Generate=function(pos)
{
    if(!Memory.colonies) {Memory.colonies = []}
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
}