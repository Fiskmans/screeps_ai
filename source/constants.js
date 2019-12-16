ROAD_MAINTAIN_INTERVAL = 1500
COLONY_MAINTAIN_INTERVAL = 5000
MINE_MAINTAIN_INTERVAL = 10000
MARKETPRICE_TIMEOUT = 500
MARKETPRICE_REFRESSRATE = 13
MINER_REPLACEMENT_TIMER = 150
MAP_DECAY_TIME = 10000
MAX_ACTIVE_SCOUTS = 2
MINE_STATUS_REFRESHRATE = 11
MINE_LINK_TRANSFERRATE = 20
DATA_POINTS_PER_SEGMENT = 128
COLONY_RETARGET_COLOY_SELLING_INTERVAL = 13
MARKETING_ENERGY_LOWER_LIMIT = 50000
MARKETING_STOCK_ENERGY = 30000
MARGETING_STOCK_OTHER = 10000

ROLE_WORKER = 'worker'
ROLE_HAULER = 'hauler'
ROLE_MINER = 'miner'
ROLE_CLAIMER = 'claimer'
ROLE_ATTACKER = 'attacker'
ROLE_MINERALMINER = 'mineralminer'
ROLE_LINKEDMINER = 'linkedminer'
ROLE_SCOUT = 'scout'
ROLE_GUARD = 'guard'
ROLE_ENERGY_DRAIN = 'energyDrain'
ROLE_DISMANTLER = 'dismantler'
ROLE_BANK_HEALER = 'bankhealer'
ROLE_BANK_ATTACKER = 'bankattacker'

OWNER_CORRIDOR = 'C'
OWNER_ME = 'M'
OWNER_UNOWNED = 'U'
OWNER_ENEMY = 'E'
OWNER_KEEPER = 'K'
OWNER_UNKNOWN = ' '

TARGET_WORKER_COUNT = [
    0,
    9, //1
    6, //2
    3, //3
    3, //4
    3, //5
    2, //6
    1, //7
    1  //8
]

OWNER_COLOR = {
    [OWNER_CORRIDOR]:"#FFFFFF",
    [OWNER_ME]:"#00FF00",
    [OWNER_UNOWNED]:"#808080",
    [OWNER_ENEMY]:"#FF0000",
    [OWNER_KEEPER]:"#FFa500",
    [OWNER_UNKNOWN]:"#000000"
}

WARSTAGE_INTEL = 1
WARSTAGE_DRAIN = 2
WARSTAGE_HERASS = 3
WARSTAGE_ATTACK = 4
WARSTAGE_BLOCK = 5

BODIES = 
{
    [ROLE_WORKER]:[
        {cost:300,body:[MOVE,CARRY,WORK,WORK]},
        {cost:350,body:[MOVE,MOVE,CARRY,WORK,WORK]},
        {cost:400,body:[MOVE,MOVE,CARRY,CARRY,WORK,WORK]},
        {cost:650,body:[MOVE,MOVE,MOVE,CARRY,CARRY,WORK,WORK,WORK,WORK]},
        {cost:800,body:[MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,WORK,WORK,WORK,WORK]},
        {cost:900,body:[MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,WORK,WORK,WORK,WORK]},
        {cost:1200,body:[MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,WORK,WORK,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,WORK,WORK]},
        {cost:1600,body:[MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,WORK,WORK,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,WORK,WORK,WORK,WORK,WORK,WORK]}],
    [ROLE_HAULER]:[
        {cost:200,body:[MOVE,MOVE,CARRY,CARRY]},
        {cost:400,body:[MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY]},
        {cost:600,body:[MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY]},
        {cost:1200,body:[MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY]}],
    [ROLE_MINER]:[
        {cost:250,body:[MOVE,WORK,WORK]},
        {cost:350,body:[MOVE,WORK,WORK,WORK]},
        {cost:450,body:[MOVE,WORK,WORK,WORK,WORK]},
        {cost:550,body:[MOVE,WORK,WORK,WORK,WORK,WORK]}],
    [ROLE_CLAIMER]:[
        {cost:650,body:[MOVE,CLAIM]}],
    [ROLE_ATTACKER]:[
        {cost:130,body:[MOVE,ATTACK]},
        {cost:440,body:[TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,MOVE]},
        {cost:700,body:[TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,MOVE]},
        {cost:1400,body:[TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,MOVE]}],
    [ROLE_MINERALMINER]:[
        {cost:550,body:[MOVE,WORK,WORK,WORK,WORK,WORK]},
        {cost:750,body:[MOVE,WORK,WORK,WORK,WORK,WORK,WORK,WORK]},
        {cost:1000,body:[MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK]},
        {cost:2000,body:[MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK]},
        {cost:3000,body:[MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK]}],
    [ROLE_SCOUT]:[
        {cost:50,body:[MOVE]}],
    [ROLE_GUARD]:[
        {cost:200,body:[MOVE,RANGED_ATTACK]}],
    [ROLE_LINKEDMINER]:[
        {cost:1050,body:[MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY]}],
    [ROLE_ENERGY_DRAIN]:[
        {cost:2220,body:[TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL]},
        {cost:5100,body:[TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL]}],
    [ROLE_DISMANTLER]:[
        {cost:2100,body:[TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK]}],
    [ROLE_BANK_HEALER]:[
        {cost:7500,body:[MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL]}],
    [ROLE_BANK_ATTACKER]:[
        {cost:2600,body:[MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK]}]
}

ALL_DIRECTIONS = [
    TOP,
    TOP_RIGHT,
    RIGHT,
    BOTTOM_RIGHT,
    BOTTOM,
    BOTTOM_LEFT,
    LEFT,
    TOP_LEFT
    ]
    

REVERSED_REACTIONS = {};
for(let left in REACTIONS)
{
    for(let right in REACTIONS[left])
    {
        let result = REACTIONS[left][right];
        REVERSED_REACTIONS[result] = [left,right];
    }
}

ENEMIES = [
    "SteeleR",
    "Jaemon",
    "Viperl",
    "CrossXBones"
    ]
FRENEMIES = []

QUIPS = [
    "Sometimes dead is better",
    "Ever seen a blue flamingo?",
    "Crabs are people",
    "Clams are people",
    "Even a broken clock is right two times a day",
    "Apple pie recipie: 1.Lots of Hydrogen 2.Lots of Time"
    ]

ALWAYSPROFITABLE = 200
MinimumSellingPrice = 
{
    [RESOURCE_ENERGY]:0.027,
    [RESOURCE_OXYGEN]:0.036,
    [RESOURCE_HYDROGEN]:0.034,
    [RESOURCE_ZYNTHIUM]:0.036,
    [RESOURCE_LEMERGIUM]:0.068,
    [RESOURCE_UTRIUM]:0.038,
    [RESOURCE_KEANIUM]:0.038,
    [RESOURCE_CATALYST]:0.130,
    [RESOURCE_GHODIUM_OXIDE]:0.023
}