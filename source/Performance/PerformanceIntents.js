

module.exports._intentCost = 0;
module.exports._mappings = []
module.exports._enabled = false;

module.exports.Reset=function()
{
    this._intentCost = 0;
}

module.exports.Add=function()
{
    this._intentCost += INTENT_CPU_COST;
}

module.exports.GetUsed=function()
{
    return this._intentCost;
}

module.exports.GetUsedCPU=function()
{
    return Game.cpu.getUsed() - this.GetUsed();
}

let HookAll=function(intents)
{
    for(let mapping of intents._mappings)
    {
        let object = mapping.obj;
        let functionName = mapping.funcName;

        if(!object["base_" + functionName])
        {
            object["base_" + functionName] = object[functionName];
            object[functionName] = 
            function(...args)
            {
                let ret = object["base_" + functionName].call(this,...args);
                if(ret == OK)
                {
                    intents.Add();
                }
                return ret; 
            }   
        }   
    }
}

let UnHookAll=function(intents)
{
    for(let mapping of intents._mappings)
    {
        let object = mapping.obj;
        let functionName = mapping.funcName;

        if(object["base_" + functionName])
        {
            object[functionName] = object["base_" + functionName];
            delete object["base_" + functionName];
        }   
    }
}

module.exports.HookIntentGenerator=function(object,functionName)
{
    for(let mapping of this._mappings)
    {
        if(mapping.obj === object && mapping.funcName == functionName)
        {
            console.log("Double mapping intent function: " + functionName);
            return;
        }
    }
    this._mappings.push({obj:object,funcName:functionName});
}

module.exports.Enable=function()
{
    HookAll(this);
    this._enabled = true;
}

module.exports.Disable=function()
{
    UnHookAll(this);
    this._enabled = false;
}

module.exports.IsEnabled=function()
{
    return this._enabled;
}