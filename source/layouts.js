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
    [-2]:
    {
        [-1]:STRUCTURE_TOWER,
        [ 1]:STRUCTURE_TOWER
    },
    [-1]: 
    {
        [-2]:STRUCTURE_TOWER,
        [ 0]:STRUCTURE_LINK,
        [ 2]:STRUCTURE_TOWER
    },
    [ 0]:
    {
        [-1]:STRUCTURE_TERMINAL,
        [ 0]:STRUCTURE_STORAGE,
        [ 1]:STRUCTURE_FACTORY,
        [ 3]:STRUCTURE_LINK
    },
    [ 1]: 
    {
        [-2]:STRUCTURE_TOWER,
        [ 0]:STRUCTURE_SPAWN,
        [ 2]:STRUCTURE_SPAWN
    },
    [ 2]:
    {
        [-1]:STRUCTURE_TOWER
    }
}
labSateliteLayout = 
{
    [-1]:
    {
        [-1]:STRUCTURE_LAB,
        [ 0]:STRUCTURE_LAB,
        [ 1]:STRUCTURE_ROAD,
        [ 2]:STRUCTURE_LAB
    },
    [ 0]:
    {
        [-1]:STRUCTURE_LAB,
        [ 0]:STRUCTURE_ROAD,
        [ 1]:STRUCTURE_LAB,
        [ 2]:STRUCTURE_ROAD
    },
    [ 1]:
    {
        [-1]:STRUCTURE_ROAD,
        [ 0]:STRUCTURE_LAB,
        [ 1]:STRUCTURE_LAB,
        [ 2]:STRUCTURE_LAB
    },
    [ 2]:
    {
        [-1]:STRUCTURE_LAB,
        [ 0]:STRUCTURE_ROAD,
        [ 1]:STRUCTURE_LAB
    }
}