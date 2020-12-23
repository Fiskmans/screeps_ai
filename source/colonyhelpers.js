

RequestResource=function(colony,objectId,type,wantedAmount)
{
    let req = {id:objectId,resource:type,targetAmount:wantedAmount,at:Game.time};   

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
                    if(obj.store.getUsedCapacity(req.resource))
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
}

ColonyFindUnfilledToRequest=function(colony,fakeStores,pos,ofType)
{
    if(!colony.requests)
    {
        return false;
    }


    let filtered = [];
    for(let req of colony.requests.to)
    {
        if(!ofType || req.resource == ofType)
        {
            if(fakeStores[req.id][req.resource] < req.targetAmount)
            {
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