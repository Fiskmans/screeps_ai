

module.exports._conditions = 
{
    "prices":
    {
        enabled: false,
        enableOnAverage: 0.9,

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
        enableOnAverage: 0.8,

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
    },
    "expansion":
    {
        enabled: false,
        average: 0.9,
        enableOnAverage: 0.7,

        enableOn: 0.99,
        enable:function()
        {
            return true;
        },
        disableOn:0.89,
        disable:function()
        {
            return true;
        },
        estimate:{time:0,sampleCount:0.0}
    },
}

module.exports.UpdateAverage=function()
{
    if(!Memory.performance)
    {
        Memory.performance = 
        {
            average:Game.cpu.limit,
            count:1
        };
    }

    Memory.performancedecisions.average = lerp(
        Game.cpu.getUsed(),
        Memory.performancedecisions.average,
        Memory.performancedecisions.count/(Memory.performancedecisions.count+1)
    );
    Memory.performancedecisions.count++;
    if(Memory.performancedecisions.count > CPU_MEASURE_RANGE)
    {
        Memory.performancedecisions.count = CPU_MEASURE_RANGE;
    }

}

module.exports.Enabled=function(tag)
{
    if(!Memory.performancedecisions)
    {
        Memory.performancedecisions = 
        {
            average:Game.cpu.limit,
            count:1
        };
    }

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
        if(conditions[tag].enableOnAverage > (Memory.performancedecisions.average/Game.cpu.limit) && bucket > conditions[tag].enableOn)
        {
            if(conditions[tag].enable())
            {
                conditions[tag].enabled = true;
            }
        }
    }

    return conditions[tag].enabled;
}

module.exports.Run=function(tag,code,...args)
{
    if(Performance.Decisions.Enabled(tag))
    {
        let before = Game.cpu.getUsed();
        code(...args);
        let condition = Performance.Decisions._conditions[tag];
        condition.estimate.time = lerp(
            Game.cpu.getUsed()-before,
            condition.estimate.time,
            condition.estimate.sampleCount/(condition.estimate.sampleCount+1));
        condition.estimate.sampleCount += 1;
    }
}