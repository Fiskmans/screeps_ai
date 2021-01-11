
module.exports.Setup = function(colony)
{
    let room = Game.rooms[colony.pos.roomName];

    if(Game.time % LAB_REBUILD_STATUS_INTERVAL != 0)
    {
        return;
    }

    for(let lab of room.Structures(STRUCTURE_LAB))
    {
        lab.memory.inRange = [];
        let around = room.lookForAtArea(LOOK_STRUCTURES,lab.pos.y-2,lab.pos.x-2,lab.pos.y+2,lab.pos.x+2,true);
        for(let other of around)
        {
            if(other.structure && other.structure.structureType == STRUCTURE_LAB && other.structure.id != lab.id)
            {
                lab.memory.inRange.push(other.structure.id);
            }
        }
    }
}

module.exports.Run = function(colony)
{
    let room = Game.rooms[colony.pos.roomName];

    let labs = room.Structures(STRUCTURE_LAB);
    for(let lab of labs)
    {
        if(!lab.memory.task)
        {
            if(lab.mineralType)
            {
                RequestEmptying(colony,lab.id,lab.mineralType,1,REQUEST_PRIORITY_AUXILIARY);
            }
            continue;
        }
        
        let task = lab.memory.task;
        if(task.action == LAB_ACTION_HOLD)
        {
            if(lab.mineralType && lab.mineralType != task.resource)
            {
                RequestEmptying(colony,lab.id,lab.mineralType,1,REQUEST_PRIORITY_AUXILIARY);
            }
            else
            {
                RequestResource(colony,lab.id,task.resource,LAB_STOCK_RESOURCE_AMOUNT,REQUEST_PRIORITY_AUXILIARY);
            }

        }
        else
        {
            if(lab.mineralType && lab.mineralType != task.resource)
            {
                RequestEmptying(colony,lab.id,lab.mineralType,1,REQUEST_PRIORITY_AUXILIARY);
            }
            else
            {
                RequestEmptying(colony,lab.id,task.resource,LAB_REMOVE_RESOURCE_AMOUNT,REQUEST_PRIORITY_AUXILIARY);
            }

            let result = false;
            let lab1 = Game.getObjectById(task.lab1);
            let lab2 = Game.getObjectById(task.lab2);
            if(!lab1 || !lab2)
            {
                delete lab.memory.task;
                continue;
            }
            if(!lab1.mineralType || !lab2.mineralType)
            {
                continue;
            }

            if(REACTIONS[lab1.mineralType])
            {
                result = REACTIONS[lab1.mineralType][lab2.mineralType] || false;
            }
            if(!result || result != task.resource)
            {
                continue;
            }

            lab.runReaction(lab1,lab2);
        }
    }
}

let RemoveTasks = function(room,allResouces)
{
    for(let lab of room.Structures(STRUCTURE_LAB))
    {
        let task = lab.memory.task;
        if(task 
            && task.action == LAB_ACTION_REACT 
            &&  (allResouces[task.resource] > LAB_PRODUCTION_CAP
                || allResouces[REVERSED_REACTIONS[task.resource][0]] < LAB_USABLE_AMOUNT_THRESHOLD
                || allResouces[REVERSED_REACTIONS[task.resource][1]] < LAB_USABLE_AMOUNT_THRESHOLD))
        {
            delete lab.memory.task;
        }
    }

    for(let lab of room.Structures(STRUCTURE_LAB))
    {
        let task = lab.memory.task;
        if(task && task.action == LAB_ACTION_HOLD)
        {
            let isUsed = false;
            for(let otherLab of room.Structures(STRUCTURE_LAB))
            {
                let otherTask = otherLab.memory.task;
                if(otherTask && otherTask.action == LAB_ACTION_REACT && (otherTask.lab1 == lab.id || otherTask.lab2 == lab.id))
                {
                    isUsed = true;
                    break;
                }
            }
            if(!isUsed)
            {
                delete lab.memory.task;
            }
        }
    }
    
    for(let lab of room.Structures(STRUCTURE_LAB))
    {
        if(!lab.memory.task)
        {
            return true;
        }
    }
    return false;
}

let PlanTasks = function(room,allResouces)
{
    let resources = Object.keys(allResouces);
    let make = false;

    for(let index1 = 0; index1 < resources.length-1 && !make;index1++)
    {
        let res1 = resources[index1];
        for(let index2 = index1+1; index2 < resources.length && !make;index2++)
        {
            let res2 = resources[index2];

            if(allResouces[res1] > LAB_USABLE_AMOUNT_THRESHOLD && allResouces[res2] > LAB_USABLE_AMOUNT_THRESHOLD)
            {
                if(REACTIONS[res1])
                {
                    let result = REACTIONS[res1][res2];
                    if(result && (!allResouces[result] || allResouces[result] < LAB_PRODUCTION_CAP))
                    {
                        make = result;
                    }
                }
            }
        }
    }
    if(make)
    {
        let resource = make;
        let crossSections = {};
        let labs = room.Structures(STRUCTURE_LAB);
        for(let index1 = 0; index1 < labs.length-1;index1++)
        {
            let lab1 = labs[index1];
            let task1 = lab1.memory.task;
            if(task1)
            {
                if(task1.action != LAB_ACTION_HOLD)
                {
                    continue;
                }
                if(task1.resource != REVERSED_REACTIONS[resource][0] 
                && task1.resource != REVERSED_REACTIONS[resource][1])
                {
                    continue;
                }
            }
            for(let index2 = index1+1; index2 < labs.length;index2++)
            {
                if(index1 != index2)
                {
                    let lab2 = labs[index2];

                    let task2 = lab2.memory.task;
                    if(task2)
                    {
                        if(task2.action != LAB_ACTION_HOLD)
                        {
                            continue;
                        }
                        if(task2.resource != REVERSED_REACTIONS[resource][0] 
                        && task2.resource != REVERSED_REACTIONS[resource][1])
                        {
                            continue;
                        }
                        if(task1.resource == task2.resource)
                        {
                            continue;
                        }
                    }

                    if(!lab1.memory.inRange || !lab2.memory.inRange)
                    {
                        continue;
                    }

                    crossSections[index1 * labs.length + index2] = {section:[],lab1:lab1.id,lab2:lab2.id};
                    let crossSection = crossSections[index1 * labs.length + index2].section;

                    for(let nearby of lab1.memory.inRange)
                    {
                        let lab3 = Game.getObjectById(nearby);
                        if(!lab3)
                        {
                            continue;
                        }
                        let task3 = lab3.memory.task;
                        if(task3)
                        {
                            if(task3.action != LAB_ACTION_HOLD || task3.resource != resource)
                            {
                                continue;
                            }
                        }

                        if(nearby != lab2.id && lab2.memory.inRange.includes(nearby))
                        {
                            crossSection.push(nearby);
                        }
                    }
                }
            }
        }

        let bestSection = false;
        for(let section of Object.values(crossSections))
        {
            if((!bestSection && section.section.length > 0) || (bestSection && section.section.length > bestSection.section.length))
            {
                bestSection = section;
            }
        }
        if(bestSection)
        {
            let lab1 = Game.getObjectById(bestSection.lab1);
            let lab2 = Game.getObjectById(bestSection.lab2);
            let task1 = lab1.memory.task;
            let task2 = lab2.memory.task;

            if(task1 && task1.resource != REVERSED_REACTIONS[make][0])
            {
                let tmp = lab1;
                lab1 = lab2;
                lab2 = tmp;

                tmp = task1;
                task1 = task2;
                task2 = tmp;
            }
            else if(task2 && task2.resource != REVERSED_REACTIONS[make][1])
            {
                let tmp = lab1;
                lab1 = lab2;
                lab2 = tmp;

                tmp = task1;
                task1 = task2;
                task2 = tmp;
            }

            if(!task1)
            {
                lab1.memory.task = 
                {
                    action:LAB_ACTION_HOLD,
                    resource:REVERSED_REACTIONS[make][0]
                }
            }
            if(!task2)
            {
                lab2.memory.task = 
                {
                    action:LAB_ACTION_HOLD,
                    resource:REVERSED_REACTIONS[make][1]
                }
            }

            for(let labID of bestSection.section)
            {
                let lab3 = Game.getObjectById(labID);
                lab3.memory.task = 
                {
                    action:LAB_ACTION_REACT,
                    resource:make,
                    lab1:lab1.id,
                    lab2:lab2.id
                }
            }
        }
        if(room.name == "W27S43")
        {
            console.log("making: " + make);
            logObject(bestSection);
        }
    }
}

module.exports.Plan=function(colony)
{
    let room = Game.rooms[colony.pos.roomName];

    let allResouces = {};

    Helpers.Resources.FindAll(room,allResouces);
    if(RemoveTasks(room,allResouces))
    {
        PlanTasks(room,allResouces);
    }
}