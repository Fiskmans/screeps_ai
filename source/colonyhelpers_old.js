MultiRequestResource=function(colony,amounts,objId,priority)
{
    for(let r of Object.keys(amounts))
    {
        RequestResource(colony,objId,r,amounts[r],priority);
    }
}

RequestResource=function(colony,objectId,type,wantedAmount,priority)
{
    if(!wantedAmount || wantedAmount < 1 || !type)
    {
        Helpers.Externals.Notify("Bad call to RequestResource: " + wantedAmount + " " + type,true);
        return;
    }

    let pri = priority || 0;

    let req = {
        id:objectId,
        resource:type,
        targetAmount:wantedAmount,
        at:Game.time,
        prio:pri,
        action:REQUEST_ACTION_FILL
    };   

    let obj = Game.getObjectById(objectId);
    if(!obj)
    {
        return;
    }
    if(!obj.store || obj.store.getUsedCapacity(type) >= wantedAmount)
    {
        return;
    }
    if(!colony.requests) { colony.requests = [] };
    for(let i in colony.requests)
    {
        let r = colony.requests[i];
        if(r.id == req.id && r.resource == req.resource)
        {
            colony.requests[i] = req;
            return;
        }
    }
    colony.requests.push(req);
}

RequestEmptying=function(colony,objectId,type,wantedAmount,priority)
{
    if(!wantedAmount || wantedAmount < 1)
    {
        console.log("Bad call to RequestEmptying");
        Game.notify("Bad call to RequestEmptying");
        return;
    }
    let pri = priority || 0;

    let req = {
        id:objectId,
        resource:type,
        targetAmount:wantedAmount,
        at:Game.time,
        prio:pri,
        action:REQUEST_ACTION_EMPTY};   

    let obj = Game.getObjectById(objectId);
    if(!obj)
    {
        return;
    }
    if(!obj.store || obj.store.getUsedCapacity(type) < wantedAmount)
    {
        return;
    }

    if(!colony.requests) { colony.requests = [] };
    for(let i in colony.requests)
    {
        let r = colony.requests[i];
        if(r.id == req.id && r.resource == req.resource)
        {
            colony.requests[i] = req;
            return;
        }
    }
    colony.requests.push(req);
}

RemoveDoneRequests=function(colony)
{
    if(!colony.requests)
    {
        return;
    }

    for(let i = colony.requests.length-1;i >= 0; i--)
    {
        let active = true;
        let req = colony.requests[i];
        if(Game.time - req.at > STALE_REQUEST_THRESHOLD || !req.resource)
        {
            active = false;
        }
        else
        {
            let obj = Game.getObjectById(req.id)
            if(!obj)
            {
                active = false;
            }
            else
            {
                if(!obj.store)
                {
                    active = false;
                }
                else
                {
                    if(req.action == REQUEST_ACTION_EMPTY)
                    {
                        if(obj.store.getUsedCapacity(req.resource) < req.targetAmount)
                        {
                            active = false;
                        }
                    }
                    else
                    {
                        if(obj.store.getUsedCapacity(req.resource) >= req.targetAmount)
                        {
                            active = false;
                        }    
                    }
                }
            }
        }

        if(!active)
        {
            colony.requests.splice(i,1);
        }
    }
}

ColonyFindUnfilledToRequest=function(colony,fakeStores,pos,storageid,ofType)
{
    if(!colony.requests)
    {
        return false;
    }

    let highestPrio = 0;
    let filtered = [];
    for(let req of colony.requests)
    {
        if(req.action == REQUEST_ACTION_FILL)
        {
            if(!ofType || req.resource == ofType)
            {
                if(fakeStores[req.id].Get(req.resource) < req.targetAmount)
                {
                    if(storageid && fakeStores[storageid].Get(req.resource) == 0)
                    {
                        continue;
                    }
                    if(req.prio > highestPrio)
                    {
                        filtered = [];
                        highestPrio = req.prio;
                    }
                    
                    if(req.prio == highestPrio)
                    {
                        filtered.push(req);
                    }
                }
            }
        }
    }
    if(filtered.length == 0)
    {
        return false;
    }


    let closest = false;
    let dist = 51;
    for(let req of filtered)
    {
        let obj = Game.getObjectById(req.id);
        if(obj)
        {
            let d = obj.pos.getRangeTo(pos);
            if(d < dist || !closest)
            {
                dist = d;
                closest = req;
            }
        }
    }
    return closest;
}

ColonyFindUnfilledFromRequest=function(colony,fakeStores,pos)
{
    if(!colony.requests)
    {
        return false;
    }

    let highestPrio = 0;;
    let filtered = [];
    for(let req of colony.requests)
    {
        if(req.action == REQUEST_ACTION_EMPTY)
        {
            if(Game.shard.name == "shard2" && !fakeStores[req.id])
            {
                console.log("no store for: " + req.id);
            }
            if(fakeStores[req.id] && fakeStores[req.id].Get(req.resource) >= req.targetAmount)
            {
                if(req.prio > highestPrio)
                {
                    filtered = [];
                    highestPrio = req.prio;
                }
                    
                if(req.prio == highestPrio)
                {
                    filtered.push(req);
                }
            }
        }
    }
    if(filtered.length == 0)
    {
        return false;
    }


    let closest = false;
    let dist = 51;
    for(let req of filtered)
    {
        let obj = Game.getObjectById(req.id);
        if(obj)
        {
            let d = obj.pos.getRangeTo(pos);
            if(d < dist || !closest)
            {
                dist = d;
                closest = req;
            }
        }
    }
    return closest;
}

MakeFakeStores=function(colony,creepList,outObj)
{
    let room = Game.rooms[colony.pos.roomName];

    for(let creep of creepList)
    {
        outObj[creep.id] = new FakeStore(creep.store);
    }
    for(let req of colony.requests)
    {
        let obj = Game.getObjectById(req.id);
        outObj[req.id] = new FakeStore(obj.store);
    }
    if(room.storage)
    {
        outObj[room.storage.id] = new FakeStore(room.storage.store);
    }
}

EnqueueToRequests=function(colony,storageId,creep,predicted)
{
    let storage = Game.getObjectById(storageId);
    let req = ColonyFindUnfilledToRequest(colony,predicted,storage ? storage.pos : creep.pos,storageId);
    if(req)
    {
        if(storageId && predicted[creep.id].GetCapacity(req.resource) - predicted[creep.id].total < req.targetAmount - predicted[req.id].Get(req.resource))
        {
            for(let r of Object.keys(predicted[creep.id].content))
            {
                if(r != req.resource && predicted[creep.id].Get(r) > 0)
                {
                    let work = {action:CREEP_TRANSFER,target:storageId,arg1:r};
                    creep.EnqueueWork(work);
                    creep.SimulateWorkUnit(work,predicted);
                }
            }
        }
        if(storageId && predicted[creep.id].Get(req.resource) < req.targetAmount - predicted[req.id].Get(req.resource))
        {
            if(predicted[creep.id].GetCapacity(req.resource) - predicted[creep.id].Get(req.resource) > 49)
            {
                if(predicted[storageId].Get(req.resource) > 0)
                {
                    let work = {action:CREEP_WITHDRAW,target:storageId,arg1:req.resource};
                    creep.EnqueueWork(work);
                    creep.SimulateWorkUnit(work,predicted);
                }
            }
        }
        if(predicted[creep.id].Get(req.resource) > 0)
        {
            let lastamount = predicted[creep.id].Get(req.resource)
            let work = {action:CREEP_TRANSFER,target:req.id,arg1:req.resource};
            creep.EnqueueWork(work);
            creep.SimulateWorkUnit(work,predicted);
            
            let lastTarget = Game.getObjectById(req.id);
            let req2 = ColonyFindUnfilledToRequest(colony,predicted,lastTarget.pos,storageId,req.resource);
            
            while(req2 && predicted[creep.id].Get(req2.resource) > 0)
            {
                if(predicted[creep.id].Get(req.resource) == lastamount)
                {
                    console.log("followup bug detected: " + predicted[creep.id].Get(req2.resource));
                    break;
                }
                lastamount = predicted[creep.id].Get(req.resource);


                let work = {action:CREEP_TRANSFER,target:req2.id,arg1:req2.resource};
                creep.EnqueueWork(work);
                creep.SimulateWorkUnit(work,predicted);
                
                lastTarget = Game.getObjectById(req2.id);
                req2 = ColonyFindUnfilledToRequest(colony,predicted,lastTarget.pos,storageId,req2.resource);

                if(creep.OverWorked())
                {
                    break;
                }
            }
        }
    }
}

EnqueueFromRequests=function(colony,storageId,creep,predicted)
{
    if(creep.spawning)
    {
        return;
    }

    let req = ColonyFindUnfilledFromRequest(colony,predicted,creep.pos);
    if(req)
    {
        if(storageId && predicted[creep.id].total > 0)
        {
            for(let r of Object.keys(predicted[creep.id].content))
            {
                if(predicted[creep.id].Get(r) > 0)
                {
                    let work = {action:CREEP_TRANSFER,target:storageId,arg1:r};
                    creep.EnqueueWork(work);
                    creep.SimulateWorkUnit(work,predicted);
                }
            }
        }
        if(predicted[creep.id].total < creep.carry.getCapacity(RESOURCE_ENERGY))
        {
            let work = {action:CREEP_WITHDRAW,target:req.id,arg1:req.resource};
            creep.EnqueueWork(work);
            creep.SimulateWorkUnit(work,predicted);
    
            let lastTarget = Game.getObjectById(req.id);
            let req2 = ColonyFindUnfilledFromRequest(colony,predicted,lastTarget.pos);
    
            while(req2 && predicted[creep.id].GetCapacity(req.resource) - predicted[creep.id].total > 0)
            {
                let work = {action:CREEP_WITHDRAW,target:req2.id,arg1:req2.resource};
                creep.EnqueueWork(work);
                creep.SimulateWorkUnit(work,predicted);
                
                lastTarget = Game.getObjectById(req2.id);
                req2 = ColonyFindUnfilledFromRequest(colony,predicted,lastTarget.pos);
    
                if(creep.OverWorked())
                {
                    break;
                }
            }
        }
    }
}
