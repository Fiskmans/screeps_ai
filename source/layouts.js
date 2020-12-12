getBlocked=function(_x,_y,roomName,plan)
{
    var blocked = []
    for(var y=0;y<plan.length;y++)
    {
        for(var x=0;x<plan[y].length;x++)
        {
            if(plan[y][x] && plan[y][x] != STRUCTURE_ROAD && plan[y][x] != STRUCTURE_RAMPART)
            {
                blocked.push(new RoomPosition(_x+x,_y+y,roomName))
            }
        }
    }
    return blocked
}

getRoads=function(_x,_y,roomName,plan)
{
    var roads = []
    for(var y=0;y<plan.length;y++)
    {
        for(var x=0;x<plan[y].length;x++)
        {
            if(plan[y][x] && plan[y][x] == STRUCTURE_ROAD)
            {
                roads.push(new RoomPosition(_x+x,_y+y,roomName))
            }
        }
    }
    return roads
}

findMissing=function(_x,_y,roomName,plan)
{
    var room = Game.rooms[roomName];
    if (room) 
    {
        var contains = false
        var structures = room.lookForAtArea(LOOK_STRUCTURES,_y,_x,_y+plan.length,_x+plan[0].length)
        var missing = []
        for (var y = 0; y < plan.length; y++) 
        {
            missing.push([])
            for (var x = 0; x < plan[y].length; x++) 
            {
                if (structures[_y+y][_x+x] && structures[_y+y][_x+x].filter((s) => {return s.structureType == plan[y][x]}).length > 0) 
                {
                    var _p
                    missing[y].push(_p)
                }
                else
                {
                    contains = true;
                    missing[y].push(plan[y][x])
                }
            }
        }
        if (contains) {
            return missing
        }
        else
        {
            return
        }
    }
    else
    {
        return plan
    }
    return -1
}

Priorotized=function(_x,_y,roomName,plan)
{
    var lowestprio = 10000000
    var ret = {}
    for(var y=0;y<plan.length;y++)
    {
        for(var x=0;x<plan[y].length;x++)
        {
            if(Prioroties[plan[y][x]] < lowestprio)
            {
                lowestprio = Prioroties[plan[y][x]]
                ret = {pos:new RoomPosition(_x+x,_y+y,roomName),struct:plan[y][x]}
            }
        }
    }
    if (lowestprio < 10000000) 
    {
        return ret
    }
}

Prioroties = 
{
    [STRUCTURE_SPAWN]:      1,
    [STRUCTURE_TOWER]:      2,
    [STRUCTURE_EXTENSION]:  3,
    [STRUCTURE_STORAGE]:    4,
    [STRUCTURE_CONTAINER]:  5,
    [STRUCTURE_TERMINAL]:   6,
    [STRUCTURE_LINK]:       7,
    [STRUCTURE_LAB]:        8,
    [STRUCTURE_OBSERVER]:   9,
    [STRUCTURE_POWER_SPAWN]:10,
    [STRUCTURE_NUKER]:      11,
    [STRUCTURE_FACTORY]:    12,
    [STRUCTURE_ROAD]:       13,
    [STRUCTURE_WALL]:       14,
    [STRUCTURE_RAMPART]:    15
}

STRUCTURE_CHAR = 
{
    [STRUCTURE_SPAWN]: "a",
    [STRUCTURE_EXTENSION]: "b",
    [STRUCTURE_ROAD]: "c",
    [STRUCTURE_WALL]: "d",
    [STRUCTURE_RAMPART]: "e",
    [STRUCTURE_LINK]: "f",
    [STRUCTURE_STORAGE]: "g",
    [STRUCTURE_TOWER]: "h",
    [STRUCTURE_OBSERVER]: "i",
    [STRUCTURE_POWER_SPAWN]: "j",
    [STRUCTURE_LAB]: "k",
    [STRUCTURE_TERMINAL]: "l",
    [STRUCTURE_CONTAINER]: "m",
    [STRUCTURE_NUKER]: "n",
    [STRUCTURE_FACTORY]: "o"
}

CHAR_STRUCTURE = 
{
    "a": STRUCTURE_SPAWN,
    "b": STRUCTURE_EXTENSION,
    "c": STRUCTURE_ROAD,
    "d": STRUCTURE_WALL,
    "e": STRUCTURE_RAMPART,
    "f": STRUCTURE_LINK,
    "g": STRUCTURE_STORAGE,
    "h": STRUCTURE_TOWER,
    "i": STRUCTURE_OBSERVER,
    "j": STRUCTURE_POWER_SPAWN,
    "k": STRUCTURE_LAB,
    "l": STRUCTURE_TERMINAL,
    "m": STRUCTURE_CONTAINER,
    "n": STRUCTURE_NUKER,
    "o": STRUCTURE_FACTORY         
}

colonyBuildingsPerLevel =
{
    0: {},
    1: {
        [STRUCTURE_SPAWN]: 1
    },
    2: {
        [STRUCTURE_SPAWN]: 1,
        [STRUCTURE_EXTENSION]: 5
    },
    3: {
        [STRUCTURE_SPAWN]: 1,
        [STRUCTURE_TOWER]: 1,
        [STRUCTURE_EXTENSION]: 10
    },
    4: {
        [STRUCTURE_SPAWN]: 1,
        [STRUCTURE_TOWER]: 1,
        [STRUCTURE_EXTENSION]: 20,
        [STRUCTURE_STORAGE]: 1
    },
    5: {
        [STRUCTURE_SPAWN]: 1,
        [STRUCTURE_TOWER]: 2,
        [STRUCTURE_EXTENSION]: 30,
        [STRUCTURE_STORAGE]: 1,
        [STRUCTURE_LINK]: 1
    },
    6: {
        [STRUCTURE_SPAWN]: 1,
        [STRUCTURE_TOWER]: 2,
        [STRUCTURE_EXTENSION]: 40,
        [STRUCTURE_STORAGE]: 1,
        [STRUCTURE_TERMINAL]: 1,
        [STRUCTURE_LINK]: 1
    },
    7: {
        [STRUCTURE_SPAWN]: 2,
        [STRUCTURE_TOWER]: 3,
        [STRUCTURE_EXTENSION]: 50,
        [STRUCTURE_STORAGE]: 1,
        [STRUCTURE_TERMINAL]: 1,
        [STRUCTURE_FACTORY]: 1,
        [STRUCTURE_LINK]: 1
    },
    8: {
        [STRUCTURE_SPAWN]: 3,
        [STRUCTURE_TOWER]: 6,
        [STRUCTURE_EXTENSION]: 60,
        [STRUCTURE_STORAGE]: 1,
        [STRUCTURE_TERMINAL]: 1,
        [STRUCTURE_FACTORY]: 1,
        [STRUCTURE_POWER_SPAWN]: 1,
        [STRUCTURE_LINK]: 1
    }
}

offsets = 
{
    x:
    {
        [TOP_LEFT]:-1,
        [TOP_RIGHT]:1,
        [TOP]:0,
        [LEFT]:-1,
        [BOTTOM_LEFT]:-1,
        [BOTTOM]:0,
        [BOTTOM_RIGHT]:1,
        [RIGHT]:1,
    },
    y:
    {
        [TOP_LEFT]:-1,
        [TOP_RIGHT]:-1,
        [TOP]:-1,
        [LEFT]:0,
        [BOTTOM_LEFT]:1,
        [BOTTOM]:1,
        [BOTTOM_RIGHT]:1,
        [RIGHT]:0,
    }
}

reservedDynamicLayout = 
{
    [-1]: 
    {
        [ 0]:STRUCTURE_LINK
    },
    [ 0]:
    {
        [-1]:STRUCTURE_TERMINAL,
        [ 0]:STRUCTURE_STORAGE,
        [ 1]:STRUCTURE_FACTORY
    },
    [ 1]: 
    {
        [ 0]:STRUCTURE_SPAWN
    }
}


layout = {
    structures:{
    1:[   
        [                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ],
        [                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ],
        [                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ],
        [                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ],
        [                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ],
        [                   ,                   ,                   ,STRUCTURE_SPAWN    ,                   ,                   ,                   ,                   ,                   ,                   ,                   ],
        [                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ],
        [                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ],
        [                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ],
        [                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ],
        [                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ],
        [                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ]
    ],
    2:[   
        [                   ,                   ,                   ,                   ,                   ,STRUCTURE_CONTAINER,                   ,                   ,                   ,                   ,                   ],
        [                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ],
        [                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ],
        [                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ],
        [                   ,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,                   ,                   ,                   ,                   ,                   ,                   ,                   ],
        [                   ,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,STRUCTURE_SPAWN    ,                   ,                   ,                   ,                   ,                   ,                   ,                   ],
        [                   ,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,                   ,                   ,                   ,                   ,                   ,                   ],
        [                   ,                   ,                   ,STRUCTURE_ROAD     ,                   ,                   ,                   ,                   ,                   ,                   ,                   ],
        [                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ],
        [                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ],
        [                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ],
        [                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ]
    ],
    3:[   
        [                   ,                   ,                   ,                   ,                   ,STRUCTURE_CONTAINER,                   ,                   ,                   ,                   ,                   ],
        [                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ],
        [                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ],
        [                   ,                   ,                   ,STRUCTURE_ROAD     ,                   ,                   ,                   ,                   ,                   ,                   ,                   ],
        [                   ,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,                   ,                   ,                   ,                   ,                   ,                   ],
        [                   ,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,STRUCTURE_SPAWN    ,                   ,STRUCTURE_ROAD     ,                   ,                   ,                   ,                   ,                   ],
        [                   ,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,                   ,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,                   ,                   ],
        [                   ,                   ,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,                   ,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,                   ,                   ,                   ],
        [                   ,                   ,STRUCTURE_EXTENSION,                   ,                   ,                   ,                   ,STRUCTURE_TOWER    ,                   ,                   ,                   ],
        [                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ],
        [                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ],
        [                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ]
    ],
    4:[   
        [                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ],
        [                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ],
        [                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ],
        [                   ,                   ,                   ,STRUCTURE_ROAD     ,                   ,STRUCTURE_STORAGE  ,                   ,STRUCTURE_ROAD     ,                   ,                   ,                   ],
        [                   ,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,                   ,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,                   ],
        [                   ,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,STRUCTURE_SPAWN    ,                   ,STRUCTURE_ROAD     ,                   ,                   ,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,                   ],
        [                   ,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,                   ,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,                   ],
        [                   ,                   ,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,                   ,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,                   ,                   ],
        [                   ,                   ,STRUCTURE_EXTENSION,                   ,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,STRUCTURE_TOWER    ,STRUCTURE_EXTENSION,                   ,                   ],
        [                   ,                   ,                   ,STRUCTURE_EXTENSION,                   ,STRUCTURE_EXTENSION,                   ,STRUCTURE_EXTENSION,                   ,                   ,                   ],
        [                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ],
        [                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ,                   ]
    ],
    5:[   
        [                   ,                   ,                   ,                   ,STRUCTURE_ROAD     ,                   ,STRUCTURE_ROAD     ,                   ,                   ,                   ,                   ],
        [                   ,STRUCTURE_ROAD     ,                   ,                   ,                   ,STRUCTURE_ROAD     ,                   ,                   ,                   ,STRUCTURE_ROAD     ,                   ],
        [STRUCTURE_ROAD     ,                   ,                   ,                   ,STRUCTURE_ROAD     ,                   ,STRUCTURE_ROAD     ,                   ,                   ,                   ,STRUCTURE_ROAD     ],
        [                   ,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,                   ,STRUCTURE_STORAGE  ,                   ,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,                   ],
        [                   ,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,                   ,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,                   ],
        [STRUCTURE_TOWER    ,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,STRUCTURE_SPAWN    ,                   ,STRUCTURE_ROAD     ,STRUCTURE_LINK     ,                   ,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,                   ],
        [STRUCTURE_EXTENSION,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,                   ,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,STRUCTURE_EXTENSION],
        [STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,                   ,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION],
        [STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,STRUCTURE_EXTENSION,                   ,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,STRUCTURE_TOWER    ,STRUCTURE_EXTENSION,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ],
        [                   ,                   ,STRUCTURE_EXTENSION,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,STRUCTURE_EXTENSION,                   ,                   ],
        [                   ,                   ,                   ,STRUCTURE_ROAD     ,                   ,STRUCTURE_ROAD     ,                   ,STRUCTURE_ROAD     ,                   ,                   ,                   ],
        [                   ,                   ,STRUCTURE_ROAD     ,                   ,                   ,                   ,                   ,                   ,STRUCTURE_ROAD     ,                   ,                   ]
    ],
    6:[   
        [                   ,                   ,                   ,STRUCTURE_LAB      ,STRUCTURE_ROAD     ,                   ,STRUCTURE_ROAD     ,                   ,                   ,                   ,                   ],
        [                   ,STRUCTURE_ROAD     ,                   ,                   ,                   ,STRUCTURE_ROAD     ,                   ,                   ,                   ,STRUCTURE_ROAD     ,                   ],
        [STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,                   ,                   ,STRUCTURE_ROAD     ,STRUCTURE_LAB      ,STRUCTURE_ROAD     ,STRUCTURE_LAB      ,                   ,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ],
        [STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,                   ,STRUCTURE_STORAGE  ,                   ,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION],
        [STRUCTURE_EXTENSION,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,STRUCTURE_TERMINAL ,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,STRUCTURE_EXTENSION],
        [STRUCTURE_TOWER    ,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,STRUCTURE_SPAWN    ,                   ,STRUCTURE_ROAD     ,STRUCTURE_LINK     ,                   ,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,                   ],
        [STRUCTURE_EXTENSION,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,                   ,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,STRUCTURE_EXTENSION],
        [STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,                   ,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION],
        [STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,STRUCTURE_EXTENSION,                   ,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,STRUCTURE_TOWER    ,STRUCTURE_EXTENSION,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ],
        [                   ,STRUCTURE_EXTENSION,STRUCTURE_EXTENSION,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,STRUCTURE_EXTENSION,STRUCTURE_EXTENSION,                   ],
        [                   ,                   ,                   ,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,                   ,                   ,                   ],
        [                   ,                   ,STRUCTURE_ROAD     ,                   ,                   ,STRUCTURE_ROAD     ,                   ,                   ,STRUCTURE_ROAD     ,                   ,                   ]
    ],
    7:[   
        [                   ,                   ,                   ,STRUCTURE_LAB      ,STRUCTURE_ROAD     ,STRUCTURE_LAB      ,STRUCTURE_ROAD     ,                   ,                   ,                   ,                   ],
        [STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,                   ,                   ,STRUCTURE_LAB      ,STRUCTURE_ROAD     ,STRUCTURE_LAB      ,                   ,STRUCTURE_TOWER    ,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION],
        [STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,STRUCTURE_EXTENSION,                   ,STRUCTURE_ROAD     ,STRUCTURE_LAB      ,STRUCTURE_ROAD     ,STRUCTURE_LAB      ,STRUCTURE_EXTENSION,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ],
        [STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,                   ,STRUCTURE_STORAGE  ,STRUCTURE_FACTORY      ,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION],
        [STRUCTURE_EXTENSION,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,STRUCTURE_TERMINAL ,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,STRUCTURE_EXTENSION],
        [STRUCTURE_TOWER    ,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,STRUCTURE_SPAWN    ,STRUCTURE_LINK     ,STRUCTURE_ROAD     ,STRUCTURE_LINK     ,STRUCTURE_SPAWN    ,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,                   ],
        [STRUCTURE_EXTENSION,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,                   ,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,STRUCTURE_EXTENSION],
        [STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,                   ,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION],
        [STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,STRUCTURE_EXTENSION,                   ,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,STRUCTURE_TOWER    ,STRUCTURE_EXTENSION,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ],
        [STRUCTURE_EXTENSION,STRUCTURE_EXTENSION,STRUCTURE_EXTENSION,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,STRUCTURE_EXTENSION,STRUCTURE_EXTENSION,STRUCTURE_EXTENSION],
        [                   ,STRUCTURE_EXTENSION,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,STRUCTURE_EXTENSION,                   ],
        [                   ,                   ,STRUCTURE_ROAD     ,                   ,                   ,STRUCTURE_ROAD     ,                   ,                   ,STRUCTURE_ROAD     ,                   ,                   ]
    ],
    8:[   
        [STRUCTURE_EXTENSION,STRUCTURE_EXTENSION,                   ,STRUCTURE_LAB      ,STRUCTURE_ROAD     ,STRUCTURE_LAB      ,STRUCTURE_ROAD     ,STRUCTURE_POWER_SPAWN,                 ,STRUCTURE_EXTENSION,STRUCTURE_EXTENSION],
        [STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,STRUCTURE_TOWER    ,STRUCTURE_LAB      ,STRUCTURE_LAB      ,STRUCTURE_ROAD     ,STRUCTURE_LAB      ,STRUCTURE_LAB      ,STRUCTURE_TOWER    ,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION],
        [STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,STRUCTURE_EXTENSION,STRUCTURE_LAB      ,STRUCTURE_ROAD     ,STRUCTURE_LAB      ,STRUCTURE_ROAD     ,STRUCTURE_LAB      ,STRUCTURE_EXTENSION,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ],
        [STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,STRUCTURE_LAB      ,STRUCTURE_STORAGE  ,STRUCTURE_FACTORY      ,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION],
        [STRUCTURE_EXTENSION,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,STRUCTURE_TERMINAL ,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,STRUCTURE_EXTENSION],
        [STRUCTURE_TOWER    ,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,STRUCTURE_SPAWN    ,STRUCTURE_LINK     ,STRUCTURE_ROAD     ,STRUCTURE_LINK     ,STRUCTURE_SPAWN    ,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,STRUCTURE_TOWER    ],
        [STRUCTURE_EXTENSION,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,STRUCTURE_NUKER    ,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,STRUCTURE_EXTENSION],
        [STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,STRUCTURE_SPAWN    ,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION],
        [STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,STRUCTURE_EXTENSION,STRUCTURE_TOWER    ,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,STRUCTURE_TOWER    ,STRUCTURE_EXTENSION,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ],
        [STRUCTURE_EXTENSION,STRUCTURE_EXTENSION,STRUCTURE_EXTENSION,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,STRUCTURE_EXTENSION,STRUCTURE_EXTENSION,STRUCTURE_EXTENSION],
        [                   ,STRUCTURE_EXTENSION,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,STRUCTURE_EXTENSION,STRUCTURE_OBSERVER ],
        [                   ,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,STRUCTURE_EXTENSION,STRUCTURE_ROAD     ,STRUCTURE_EXTENSION,                   ]
    ]
    }
    
};