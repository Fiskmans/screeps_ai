
RequestResource=function(colony,objectId,type,wantedAmount,priority)
{
    if(!wantedAmount || wantedAmount < 1)
    {
        console.log("Bad call to RequestResource");
        Game.notify("Bad call to RequestResource");
        return;
    }

    let pri = priority || 0;

    let req = {id:objectId,resource:type,targetAmount:wantedAmount,at:Game.time,prio:pri};   

    let obj = Game.getObjectById(objectId);
    if(!obj)
    {
        return;
    }
    if(!obj.store || obj.store.getUsedCapacity(type) >= wantedAmount)
    {
        return;
    }

    if(!colony.requests) { colony.requests = {to:[],from:[]} };
    for(let i in colony.requests.to)
    {
        let r = colony.requests.to[i];
        if(r.id == req.id && r.resource == req.resource)
        {
            colony.requests.to[i] = req;
            return;
        }
    }
    colony.requests.to.push(req);
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

    let req = {id:objectId,resource:type,targetAmount:wantedAmount,at:Game.time,prio:pri};   

    let obj = Game.getObjectById(objectId);
    if(!obj)
    {
        return;
    }
    if(!obj.store || obj.store.getUsedCapacity(type) < wantedAmount)
    {
        return;
    }

    if(!colony.requests) { colony.requests = {to:[],from:[]} };
    for(let i in colony.requests.from)
    {
        let r = colony.requests.from[i];
        if(r.id == req.id && r.resource == req.resource)
        {
            colony.requests.from[i] = req;
            return;
        }
    }
    colony.requests.from.push(req);
}

RemoveDoneRequests=function(colony)
{
    if(!colony.requests)
    {
        return;
    }

    for(let i = colony.requests.to.length-1;i >= 0; i--)
    {
        let active = true;
        let req = colony.requests.to[i];
        if(Game.time - req.at > STALE_REQUEST_THRESHOLD)
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
                    if(obj.store.getUsedCapacity(req.resource) > req.targetAmount)
                    {
                        active = false;
                    }
                }
            }
        }

        if(!active)
        {
            colony.requests.to.splice(i,1);
        }
    }
    for(let i = colony.requests.from.length-1;i >= 0; i--)
    {
        let active = true;
        let req = colony.requests.from[i];
        if(Game.time - req.at > STALE_REQUEST_THRESHOLD)
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
                    if(obj.store.getUsedCapacity(req.resource) <= req.targetAmount)
                    {
                        active = false;
                    }
                }
            }
        }

        if(!active)
        {
            colony.requests.from.splice(i,1);
        }
    }
}

ColonyFindUnfilledToRequest=function(colony,fakeStores,pos,ofType)
{
    if(!colony.requests)
    {
        return false;
    }

    let highestPrio = 0;;
    let filtered = [];
    for(let req of colony.requests.to)
    {
        if(!ofType || req.resource == ofType)
        {
            if(fakeStores[req.id].Get(req.resource) < req.targetAmount)
            {
                if(req.prio > highestPrio)
                {
                    filtered = [];
                    highestPrio = req.prio;
                }
                filtered.push(req);
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
            if(d < dist)
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
    for(let req of colony.requests.from)
    {
        if(fakeStores[req.id] && fakeStores[req.id].Get(req.resource) >= req.targetAmount)
        {
            if(req.prio > highestPrio)
            {
                filtered = [];
                highestPrio = req.prio;
            }
            filtered.push(req);
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
            if(d < dist)
            {
                dist = d;
                closest = req;
            }
        }
    }
    return closest;
}

MakeFakeStores=function(colony,outObj)
{
    let room = Game.rooms[colony.pos.roomName];

    for(let creepName of colony.requestFillers)
    {
        let creep = Game.creeps[creepName];
        outObj[creep.id] = new FakeStore(creep.store);
    }
    for(let req of colony.requests.to)
    {
        let obj = Game.getObjectById(req.id);
        outObj[req.id] = new FakeStore(obj.store);
    }
    for(let req of colony.requests.from)
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
    let req = ColonyFindUnfilledToRequest(colony,predicted,creep.pos);
    if(req)
    {
        if(predicted[creep.id].total > predicted[creep.id].Get(req.resource))
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
        if(predicted[creep.id].Get(req.resource) < req.targetAmount - predicted[req.id].Get(req.resource))
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
        if(predicted[storageId].Get(req.resource) > 0)
        {
            let work = {action:CREEP_TRANSFER,target:req.id,arg1:req.resource};
            creep.EnqueueWork(work);
            creep.SimulateWorkUnit(work,predicted);
            
            let lastTarget = Game.getObjectById(req.id);
            let req2 = ColonyFindUnfilledToRequest(colony,predicted,lastTarget.pos,req.resource);
            
            while(req2 && predicted[creep.id].Get(req2.resource) > 0)
            {
                let work = {action:CREEP_TRANSFER,target:req2.id,arg1:req2.resource};
                creep.EnqueueWork(work);
                creep.SimulateWorkUnit(work,predicted);
                
                lastTarget = Game.getObjectById(req2.id);
                req2 = ColonyFindUnfilledToRequest(colony,predicted,lastTarget.pos,req2.resource);
            }
        }
    }
}

EnqueueFromRequests=function(colony,storageId,creep,predicted)
{
    let req = ColonyFindUnfilledFromRequest(colony,predicted,creep.pos);
    if(req)
    {
        if(predicted[creep.id].GetCapacity(req.resource) - predicted[creep.id].total < req.targetAmount)
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
        }
    }
}
