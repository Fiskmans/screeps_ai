TickRepeat=function(stringToEval,times)
{
    Memory.console.jobs.push({ticksleft:times,code:stringToEval});
}

ConsoleHelperUpdate=function()
{
    for(let i in Memory.console.jobs)
    {
        try
        {
            eval(Memory.console.jobs[i].code)
        }
        catch
        {
            Memory.console.jobs.splice(i,1);
            break;
        }
        Memory.console.jobs[i].ticksleft--;
        if(Memory.console.jobs[i].ticksleft <= 0)
        {
            Memory.console.jobs.splice(i,1);
            break;
        }
    }
}

let _Delete=function(object,path,total)
{
    if(path && path.length > 0)
    {
        let segments = path.split(".");
        if(segments.length > 0)
        {
            let sub = segments.shift();
            if(segments.length > 0)
            {
                let p = segments.join(".");
                if(sub == "*")
                {
                    for(let i in object)
                    {
                        _Delete(object[i],p,total);
                    }
                }
                else
                {
                    if(!_.isUndefined(object[sub]))
                    {
                        _Delete(object[sub],p,total);
                    }
                }
            }
            else
            {
                if(sub == "*")
                {
                    for(let i in object)
                    {
                        delete object[i];
                        total.val++;
                    }
                }
                else
                {
                    if(!_.isUndefined(object[sub]))
                    {
                        delete object[sub];
                        total.val++;
                    }
                }
            }
        }
    }
}


let _stashed;

Delete=function(object,path)
{
    let total = {val:0};
    stashed = JSON.stringify(object);
    _Delete(object,path,total);
    console.log(total.val + " items deleted, restore by calling Restore(obj)");
}

Restore=function(object)
{
    if(_stashed)
    {
        let obj = JSON.parse(_stashed); 
        for(let i in object)
        {
            delete object[i];
        }
        for(let i in obj)
        {
            object[i] = obj[i];
        }
    }
    else
    {
        console.log("Restore failed there is nothing stashed");
    }
}