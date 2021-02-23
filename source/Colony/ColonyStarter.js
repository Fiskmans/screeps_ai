
module.exports.Generate=function(pos)
{
    if(!Memory.colonies) {Memory.colonies = []}
    Memory.colonies.push(
        {
            pos : pos,
            highways : [],
            constructionsite : false,
            workerpool : [],
            lastmaintained : 0,
            income:{},
            expenses:{},
            workerRoster:{}
        });
}