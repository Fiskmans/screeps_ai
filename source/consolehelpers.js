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