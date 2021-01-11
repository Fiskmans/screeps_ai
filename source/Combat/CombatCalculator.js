

module.exports.Damage=function(room,damageType,_x,_y,options)
{
    let pos; 
    if(_x instanceof RoomPosition)
    {
        pos = _x;
        options = _y;
    }
    else
    {
        pos = room.getPositionAt(_x,_y);
    }

    if(!options) { options = {}; }
    _.defaults(options,{blacklist:[]});

    let damage = 0;
    let myState = false;
    let dealers = [];
    if(damageType == DAMAGE_TYPE_FRIENDLY)
    {
        myState = true;
    }

    for(let tower of options.towers || room.Structures(STRUCTURE_TOWER))
    {
        if(tower.my == myState && tower.store.getUsedCapacity(RESOURCE_ENERGY) > TOWER_ENERGY_COST * 3 && !options.blacklist.includes(tower.id))
        {
            dealers.push(tower);

            let range = tower.pos.getRangeTo(pos);
            damage += Math.round(lerp(TOWER_POWER_ATTACK,TOWER_POWER_ATTACK*(1-TOWER_FALLOFF), ((range - TOWER_OPTIMAL_RANGE)/(TOWER_FALLOFF_RANGE-TOWER_OPTIMAL_RANGE)).clamp(0,1)));
        }
    }

    for(let creep of options.creep || room.find(FIND_CREEPS))
    {
        if(options.blacklist.includes(creep.id))
        {
            continue;
        }

        let range = creep.pos.getRangeTo(pos)
        let can = false;
        if(creep.my == myState && range < 4)
        {
            let attackDamage = 0;
            
            for(let part of creep.body)
            {
                if(part.hits == 0)
                {
                    continue;
                }

                if(range < 2 && part.type == ATTACK)
                {
                    let boost = 1;
                    if(part.boost)
                    {
                        boost = BOOSTS[ATTACK][part.boost].attack;
                    }
                    attackDamage += ATTACK_POWER * boost;
                    can = true;
                }
                else if(part.type == RANGED_ATTACK)
                {
                    let boost = 1;
                    if(part.boost)
                    {
                        boost = BOOSTS[RANGED_ATTACK][part.boost].rangedAttack;
                    }
                    attackDamage += RANGED_ATTACK_POWER * boost;
                    can = true;
                }
            }

            if(can)
            {
                dealers.push(creep);
            }
            damage += attackDamage
        }
    }

    return {damage:damage,dealers:dealers};
}

module.exports.Heal=function(room,healType,_x,_y,options)
{
    let pos; 
    if(_x instanceof RoomPosition)
    {
        pos = _x;
        options = _y;
    }
    else
    {
        pos = room.getPositionAt(_x,_y);
    }
    if(!options) { options = {}; }
    _.defaults(options,{blacklist:[]});

    let heal = 0;
    let myState = false;
    let dealers = [];
    if(healType == HEAL_TYPE_FRIENDLY)
    {
        myState = true;
    }

    for(let tower of options.towers || room.Structures(STRUCTURE_TOWER))
    {
        if(tower.my == myState && tower.store.getUsedCapacity(RESOURCE_ENERGY) > TOWER_ENERGY_COST * 3 && !options.blacklist.includes(tower.id))
        {
            dealers.push(tower);

            let range = tower.pos.getRangeTo(pos);
            heal += Math.round(lerp(TOWER_POWER_HEAL,TOWER_POWER_HEAL*(1-TOWER_FALLOFF), ((range - TOWER_OPTIMAL_RANGE)/(TOWER_FALLOFF_RANGE-TOWER_OPTIMAL_RANGE)).clamp(0,1)));
        }
    }
    

    for(let creep of options.creep || room.find(FIND_CREEPS))
    {
        if(options.blacklist.includes(creep.id))
        {
            continue;
        }

        let range = creep.pos.getRangeTo(pos)
        let can = false;
        if(creep.my == myState && range < 4)
        {
            let healAmount = 0;
            
            for(let part of creep.body)
            {
                if(part.hits == 0)
                {
                    continue;
                }

                if(part.type == HEAL)
                {

                    if(range < 2)
                    {
                        let boost = 1;
                        if(part.boost)
                        {
                            boost = BOOSTS[HEAL][part.boost].attack;
                        }
                        healAmount += HEAL_POWER * boost;
                        can = true;
                    }
                    else
                    {
                        let boost = 1;
                        if(part.boost)
                        {
                            boost = BOOSTS[HEAL][part.boost].rangedHeal;
                        }
                        healAmount += RANGED_HEAL_POWER * boost;
                        can = true;
                    }
                }
            }

            if(can)
            {
                dealers.push(creep);
            }
            heal += healAmount
        }
    }

    return {heal:heal,dealers:dealers};
}