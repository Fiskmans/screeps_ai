

module.exports._conditions = 
{
    "prices":
    {
        enabled: false,
        enableOn: 0.4,
        enable:function()
        {
            return true;
        },
        disableOn:0.2,
        disable:function()
        {
            return true;
        },
        estimate:{time:0,sampleCount:0.0}
    },
    "planner":
    {
        enabled: true,
        enableOn: 0.2,
        enable:function()
        {
            return true;
        },
        disableOn:0.01,
        disable:function()
        {
            return true;
        },
        estimate:{time:0,sampleCount:0.0}
    }
}


module.exports.Enabled=function(tag)
{
    let bucket = Game.cpu.bucket / CPU_BUCKET_MAX;
    let conditions = Performance.Decisions._conditions;
    if(conditions[tag].enabled)
    {
        if(bucket < conditions[tag].disableOn)
        {
            if(conditions[tag].disable())
            {
                conditions[tag].enabled = false;
            }
        }
    }
    else
    {
        if(bucket > conditions[tag].enableOn)
        {
            if(conditions[tag].enable())
            {
                conditions[tag].enabled = true;
            }
        }
    }

    return conditions[tag].enabled;
}

module.exports.Run=function(tag,code,arg1,arg2,arg3,arg4,arg5)
{
    if(Performance.Decisions.Enabled(tag))
    {
        let before = Game.cpu.getUsed();
        code(arg1,arg2,arg3,arg4,arg5);
        let condition = Performance.Decisions._conditions[tag];
        condition.estimate.time = lerp(
            Game.cpu.getUsed()-before,
            condition.estimate.time,
            condition.estimate.sampleCount/(condition.estimate.sampleCount+1));
        condition.estimate.sampleCount += 1;
    }
}