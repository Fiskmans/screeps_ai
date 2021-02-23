

module.exports._conditions = 
{
    "prices":
    {
        enabled: false,
        threshold: 0.9
    },
    "planner":
    {
        enabled: false,
        threshold: 0.8
    },
    "expansion":
    {
        enabled: false,
        threshold: 0.5
    },
    "buzz":
    {
        enabled: true,
        threshold: 0.99
    },
    "scouting":
    {
        enabled: false,
        threshold: 0.40
    },
    "remote_mining":
    {
        enabled: false,
        threshold: 0.40
    },
    "svg_streaming":
    {
        enabled: false,
        threshold: 0.90
    },
    "normal_mode":
    {
        enabled: true,
        threshold: 0.90
    }
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
        return false;
    }

    let conditions = Performance.Decisions._conditions;
    let cpu = (Memory.performancedecisions.average/Game.cpu.limit);
    if(conditions[tag].enabled)
    {
        if(cpu > conditions[tag].threshold)
        {
            if(!conditions[tag].disable || conditions[tag].disable())
            {
                conditions[tag].enabled = false;
            }
        }
    }
    else
    {
        if(cpu < conditions[tag].threshold)
        {
            if(!conditions[tag].enable || conditions[tag].enable())
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
        let ret = code(...args);
        let condition = Performance.Decisions._conditions[tag];

        if(!condition.estimate)
        {
            condition.estimate = 
            {
                time:0,
                sampleCount:0
            }
        }

        condition.estimate.time = lerp(
            Game.cpu.getUsed()-before,
            condition.estimate.time,
            condition.estimate.sampleCount/(condition.estimate.sampleCount+1));
        condition.estimate.sampleCount += 1;

        return ret;
    }

    return false;
}

module.exports.Draw=function(vis)
{
    vis.rect(43,-0.3,6.3,1.8+Object.keys(Performance.Decisions._conditions).length * 0.5,{stroke:"#FFFFFF",fill:"#00000",strokeWidth:0.02});
    if(Memory.performancedecisions && Memory.performancedecisions.average)
    {
        let cpu = Memory.performancedecisions.average;
        let limit = Game.cpu.limit;
        let percent = cpu/limit;

        vis.text("Performance",43.1,0.2,{align:"left",font:0.5});

        vis.text(cpu.toFixed(2).padStart(6).padEnd(7) + "/" + 
                limit.toFixed(2).padStart(6).padEnd(7) + " cpu" ,
                43.1,
                0.7,
                {
                    align:"left",
                    font:0.4
                });

        vis.text((percent * 100.0).toFixed(2) + "%",
                49.2,
                0.7,
                {
                    align:"right",
                    font:0.4,
                    color:"#" + lerpColor(0x55FF55,0xFF5555,percent.clamp(0,1)).toString(16)
                });

        vis.text("Subsystems",43.1,1.3,{align:"left",font:0.5});
        y = 1.8;
        for(let tag in Performance.Decisions._conditions)
        {
            vis.text(tag,43.1,y,{align:"left",font:0.4});

            let on = Performance.Decisions._conditions[tag].enabled;
            vis.text(
                on ? "true" : "false",
                46.5,
                y,
                {
                    font:0.4,
                    color: on ? "#AAFFAA" : "#FFAAAA"
                }
            )
            vis.text(
                (Performance.Decisions._conditions[tag].threshold * 100).toFixed(0) + "%",
                49.2,
                y,
                {
                    align:"right",
                    font:0.4,
                    color: Performance.Decisions._conditions[tag].threshold > percent ? "#AAFFAA" : "#FFAAAA"
                }
            )

            y += 0.5;
        }
    }
}