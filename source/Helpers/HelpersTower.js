

let C =
{
    BASE_EFFECT:
    {
        [TOWER_ACTION_ATTACK]:TOWER_POWER_ATTACK,
        [TOWER_ACTION_HEAL]:TOWER_POWER_HEAL,
        [TOWER_ACTION_REPAIR]:TOWER_POWER_REPAIR
    }
}


module.exports.Effectivness=function(distance,actionType)
{
    return Math.round(
        lerp(
            C.BASE_EFFECT[actionType],
            C.BASE_EFFECT[actionType] * (1-TOWER_FALLOFF), 
            (distance - TOWER_OPTIMAL_RANGE)/(TOWER_FALLOFF_RANGE-TOWER_OPTIMAL_RANGE).clamp(0,1)
            )
        )
}