

module.exports.Update=function()
{

}

module.exports.Start=function(time,options)
{
    _.defaults(options,{intents:false});
    Memory.profiler =
    {
        timeLeft:time,
        options:options
    }
}