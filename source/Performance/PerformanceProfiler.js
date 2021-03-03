
// string.padEnd(x) exists

module.exports._mappings = []
module.exports._enabled = false;
let _stack = [];

let Push=function(functionName)
{
    if(!Memory.profiler.data) { Memory.profiler.data = {children:{}}}
    
    let target = false;
    if(_stack.length == 0 || Memory.profiler.options.flat)
    {
        if(Memory.profiler.options.filter)
        {
            let filter = Memory.profiler.options.filter;
            if(filter instanceof Array)
            {
                if(!filter.includes(functionName))
                {
                    return;
                }
            }
            else if(functionName != filter)
            {
                return;
            }
        }
        target = Memory.profiler.data;
    }
    else
    {
        target = _.last(_stack).target;
    } 

    if(!target.children[functionName]) 
    { 
        target.children[functionName] = 
        {
            CPU:0,
            count:0,
            name:functionName,
            children:{}
        }
        if(Memory.profiler.options.intents)
        {
            target.children[functionName].intents = 0;
        }
    }

    target = target.children[functionName];

    let entry = 
    {
        cpuTime:Game.cpu.getUsed(),
        target:target
    };

    if(Memory.profiler.options.intents)
    {
        entry.intentTime = Performance.Intents.GetUsed();
    }

    _stack.push(entry);
}

let Pop=function()
{
    if(_stack.length == 0) // guard agains main.loop() being popped while still running on the last tick
    {
        return;
    }

    let entry = _stack.pop();
    let target = entry.target;
    let deltaCPU = Game.cpu.getUsed() - entry.cpuTime;

    target.CPU += deltaCPU;
    target.count += 1;

    if(Memory.profiler.options.intents)
    {
        let deltaInents = Performance.Intents.GetUsed() - entry.intentTime;
        target.intents += deltaInents;
    }
}

let HookAll=function(profiler)
{
    console.log('hooking: ' + Object.keys(profiler._mappings).length + " functions");
    for(let mapping of profiler._mappings)
    {
        let object = mapping.obj;
        let functionName = mapping.funcName;
        let objName = mapping.objName;

        if(!object["cpu_" + functionName])
        {
            object["cpu_" + functionName] = object[functionName];
            object[functionName] = 
            function(...args)
            {
                Push(objName + "." + functionName);
                let ret = object["cpu_" + functionName].call(this,...args);
                Pop();
                return ret; 
            }
        }
    }
}

let UnHookAll=function(profiler)
{
    console.log('unhooking: ' + Object.keys(profiler._mappings).length + " functions");
    for(let mapping of profiler._mappings)
    {
        let object = mapping.obj;
        let functionName = mapping.funcName;

        if(object["cpu_" + functionName])
        {
            object[functionName] = object["cpu_" + functionName];
            delete object["cpu_" + functionName];
        }
    }
}

const nameColoumnWidth          = 48;
const tickColumnWidth           = 16;
const totalColumnWidth          = 16;
const averageColumWidth         = 16;
const parentPercentColumWidth   = 16;
const totalPercentColumWidth    = 16;
const intentsColumWidth         = 16;
const intentsEfficiencyColumn   = 16;

const pageSize                  = 20;

let GenerateRapport=function(object,rows,indentString,extraIndent,childIndent,parentCPU,totalCPU)
{
    let indent = (indentString || "") ;
    if(Memory.profiler.options.filterOutput)
    {
        if ((  object.CPU < Memory.profiler.options.filterOutput.total 
            || (object.CPU/object.count) < Memory.profiler.options.filterOutput.average))
        {
            let row = "|" + (indent + (extraIndent || "") + "...").padEnd(nameColoumnWidth) + "|";
            row += " ".padStart(tickColumnWidth) + "|";
            row += (" ").padStart(totalColumnWidth) + "|";
            row += (" ").padStart(averageColumWidth) + "|";
            row += (" ").padStart(parentPercentColumWidth) + "|";
            row += (" ").padStart(totalPercentColumWidth) + "|";
            if(Memory.profiler.options.intents)
            {
                row += (" ").padStart(intentsColumWidth) + "|";
                row += (" ").padStart(intentsColumWidth) + "|";
            }
            rows.push(row);
            return;
        }
    }

    let cpu = object.CPU - (Memory.profiler.options.intents ? object.intents : 0);
    let average = cpu / object.count;
    let parentPercent = (cpu / parentCPU) * 100;
    let rootCPU = totalCPU || cpu;
    let totalPercent = (cpu / rootCPU) * 100;

    let row = "|" + (indent + (extraIndent || "") + object.name).padEnd(nameColoumnWidth) + "|";
    row += ((" " + object.count).padStart(6) + "/" + Memory.profiler.length + " ").padStart(tickColumnWidth) + "|";
    row += (cpu.toFixed(3) + " ").padStart(totalColumnWidth) + "|";
    row += (average.toFixed(3) + " ").padStart(averageColumWidth) + "|";
    row += (isNaN(parentPercent) ? "------- " : (" " + parentPercent.toFixed(1) + "% ")).padStart(parentPercentColumWidth) + "|";
    row += ((" " + totalPercent.toFixed(1) + "% ")).padStart(totalPercentColumWidth) + "|";
    if(Memory.profiler.options.intents)
    {
        row += (object.intents.toFixed(1) + " ").padStart(intentsColumWidth) + "|";
        row += (object.intents > 0 ? (object.intents/object.CPU * 100).toFixed(1) + "% " : "").padStart(intentsColumWidth) + "|";
    }

    rows.push(row);

    let keys = Object.keys(object.children);
    for(let i in keys)
    {
        let obj = object.children[keys[i]];
        if(i < keys.length - 1)
        {
            GenerateRapport(obj,rows,indent + (childIndent || ""), "|-", "| ", cpu, rootCPU);
        }
        else
        {
            GenerateRapport(obj,rows,indent + (childIndent || ""), "\\-", "  ", cpu, rootCPU);
        }
    }
}

let PrintPage=function()
{
    rapport = Memory.profilerResult.titleBar;
    let page = Memory.profilerResult.pages[Memory.profilerResult.currentPage];
    if(!page || !page[0])
    {
        console.log("Unable to print page " + Memory.profilerResult.currentPage + " of " + Memory.profilerResult.pages.length);
        return;
    }

    for(let row of Memory.profilerResult.pages[Memory.profilerResult.currentPage])
    {
        rapport += "\n" + row;
    }
    rapport += "\n" + Memory.profilerResult.footer;
    let nav = "\n";
    let navBar = false;
    
    let navleft = "| ";
    let navRight = " |";
    if(Memory.profilerResult.currentPage > 0)
    {
        navleft += (Memory.profilerResult.currentPage-1);
        navBar = true;
    } 
    if(Memory.profilerResult.currentPage < Memory.profilerResult.pages.length-1)
    {
        navRight = (Memory.profilerResult.currentPage+1) + navRight;
        navBar = true;
    }
    if(navBar)
    {
        nav += navleft.padEnd(Memory.profilerResult.footer.length - navRight.length) + navRight;
        rapport += nav;
        rapport += "\n" + Memory.profilerResult.footer;
    }

    console.log(rapport);
}

let Finalize=function()
{
    while(_stack.length > 0)
    {
        Pop();
    }
    let header = "|" + " Profiler Done".padEnd(nameColoumnWidth) + "|" ;
    header += (" Ticks: " + (Game.time - Memory.profiler.tickStarted - 1) + "/" + Memory.profiler.length).padEnd(tickColumnWidth) + "|";
    header += " Total cpu".padEnd(totalColumnWidth) + "|";
    header += " Average".padEnd(averageColumWidth) + "|";
    header += " of Parent".padEnd(parentPercentColumWidth) + "|";
    header += " of Total".padEnd(totalPercentColumWidth) + "|";
    if(Memory.profiler.options.intents)
    {
        header += " intents".padEnd(intentsColumWidth) + "|";
        header += " intents eff".padEnd(intentsEfficiencyColumn) + "|";
    }
    
    let seperator = "+" + "-".repeat(nameColoumnWidth) + "+";
    seperator +=   "-".repeat(tickColumnWidth) + "+";
    seperator +=   "-".repeat(totalColumnWidth) + "+";
    seperator +=   "-".repeat(averageColumWidth) + "+";
    seperator +=   "-".repeat(parentPercentColumWidth) + "+";
    seperator +=   "-".repeat(totalPercentColumWidth) + "+";
    if(Memory.profiler.options.intents)
    {
        seperator += "-".repeat(intentsColumWidth) + "+";
        seperator += "-".repeat(intentsEfficiencyColumn) + "+";
    }

    Memory.profilerResult = 
    {
        titleBar:seperator + "\n" + header + "\n" + seperator,
        footer:seperator,
        currentPage:0
    }

    let rows = [];
    
    if(Memory.profiler.data)
    {
        let keys = _.sortBy(Object.keys(Memory.profiler.data.children),(k) => -Memory.profiler.data.children[k].CPU);
        for(let key of keys)
        {
            GenerateRapport(Memory.profiler.data.children[key],rows, " ");
        }
    }
    else
    {
        rows.push("No code registered to the profiler was executed during the interval");
        return;
    }

    console.log("Profiling generated " + rows.length + " rows");
    Memory.profilerResult.pages = _.chunk(rows,pageSize);
    PrintPage();
}

module.exports.NextPage=function()
{
    if(Memory.profilerResult && Memory.profilerResult.pages.length-1 > Memory.profilerResult.currentPage)
    {
        Memory.profilerResult.currentPage += 1;
        PrintPage();
    }
    else
    {
        console.log("there is no next page");
    }
}

module.exports.PreviusPage=function()
{
    if(Memory.profilerResult && Memory.profilerResult.currentPage > 0)
    {
        Memory.profilerResult.currentPage -= 1;
        PrintPage();
    }
    else
    {
        console.log("there is no previus page");
    }
}

module.exports.Register=function(objectName,object,functionName)
{
    if(!functionName || functionName instanceof Array)
    {
        let blacklist = functionName || []
        blacklist.push('constructor');
        for(let name in object)
        {
            try
            {
                if(!blacklist.includes(name) && _.isFunction(object[name]))
                {
                    this.Register(objectName, object,name);
                }
            }
            catch
            {
                console.log("Performance.Profiler: Failed to register function: " + name);
            }
        }
        return;
    }

    for(let mapping of this._mappings)
    {
        if(mapping.obj === object && mapping.funcName == functionName)
        {
            console.log("Double mapping cpu function: " + functionName);
            return;
        }
    }
    this._mappings.push({obj:object,funcName:functionName,objName:objectName});
}

module.exports.Update=function()
{
    if(Memory.profiler)
    {
        let options = Memory.profiler.options;
        if(options.intents && !Performance.Intents.IsEnabled())
        {
            Performance.Intents.Enable();
        }
        if(!this._enabled)
        {
            HookAll(this);
            this._enabled = true;
        }
        if(!Memory.profiler.timeLeft || Memory.profiler.timeLeft < 1)
        {
            Finalize();
            delete Memory.profiler;
            if(this._enabled)
            {
                UnHookAll(this);
                this._enabled = false;
            }
            if(options.intents && Performance.Intents.IsEnabled())
            {
                Performance.Intents.Disable();
            }
            return;
        }
        Memory.profiler.timeLeft -= 1;
    }
}

module.exports.Start=function(time,options)
{
    if(!options) {options = {}}
    _.defaults(options,{intents:false});
    Memory.profiler =
    {
        timeLeft:time,
        tickStarted:Game.time,
        length:time,
        options:options
    }
}