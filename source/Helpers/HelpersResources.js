

module.exports.FindAll=function(room,allResouces)
{
    let sumStore = function(store)
    {
        for(let r of ExtractContentOfStore(store))
        {
            if(!allResouces[r]) { allResouces[r] = 0; }
            allResouces[r] += store[r];
        }
    }

    for(let lab of room.Structures(STRUCTURE_LAB))
    {
        sumStore(lab.store);
    }
    if(room.storage)
    {
        sumStore(room.storage.store);
    }
    if(room.terminal)
    {
        sumStore(room.terminal.store);
    }
    if(room.factory)
    {
        sumStore(room.factory.store);
    }
    for(let creep of room.find(FIND_MY_CREEPS))
    {
        sumStore(creep.store);
    }
}