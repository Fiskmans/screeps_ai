ROAD_MAINTAIN_INTERVAL = 1500
COLONY_MAINTAIN_INTERVAL = 5000
MINE_MAINTAIN_INTERVAL = 10000
MARKETPRICE_TIMEOUT = 500
MARKETPRICE_REFRESSRATE = 13
MINER_REPLACEMENT_TIMER = 150
MAP_DECAY_TIME = 10000
MAX_ACTIVE_SCOUTS = 2
MINE_STATUS_REFRESHRATE = 11
MINE_LINK_TRANSFERLIMIT = 200
DATA_POINTS_PER_SEGMENT = 128
COLONY_CHECK_BUILDINGS_INTERVAL = 23
COLONY_RETARGET_SELLING_INTERVAL = 13
COLONY_RETARGET_FACTORY_INTERVAL = 17
MARKETING_STOCK_ENERGY = 30000
MARGETING_STOCK_OTHER = 10000
MARKETING_IMPORT_LEVEL = 5000
FACTORY_NUMBER_OF_CRAFTS_TO_STOCK = 6
FACTORY_ENERGY_TO_LEAVE_IN_STORAGE = 200000
SVG_DRAWER_CPU_LIMIT = Game.cpu.limit * 0.95;
SVG_DRAWER_BUCKET_LIMIT = 3000
CONTROLLER_MIN_DOWNGRADE = 5000
CONTROLLER_MAX_DOWNGRADE = 15000
RAMPART_ACTIVATE_LIMIT = 400000
RAMPART_DEACTIVATE_LIMIT = 300000
RAMPART_HITS_BEFORE_NEXT_CONSTRUCTION = 50000
RAMPART_RETARGET_INTERVAL = 127
SURPLUS_THRESHOLD = 3000
STALE_REQUEST_THRESHOLD = 100
TOWER_REFILL_THRESHOLD = 600

RAMPARTS_HITS_TO_IGNORE = 
{
    0:0,
    1:0,
    2:0,
    3:300000,
    4:1000000,
    5:3000000,
    6:RAMPART_HITS_MAX[6]-1000000,
    7:RAMPART_HITS_MAX[7]-1000000,
    8:RAMPART_HITS_MAX[8]-1000000,
}

MARKETING_ENERGY_LOWER_LIMIT = 100000
POWER_PROCESS_ENERGY_LIMIT = 150000
POWER_SEARCHING_ENERGY_LIMIT = 200000
ENERGY_SELLING_ENERGY_LIMIT = 500000
RESOURCE_SELLING_LIMIT = 3000

ROLE_WORKER = 'worker'
ROLE_HAULER = 'hauler'
ROLE_MINER = 'miner'
ROLE_CLAIMER = 'claimer'
ROLE_ATTACKER = 'attacker'
ROLE_MINERALMINER = 'mineralminer'
ROLE_LINKEDMINER = 'linkedminer'
ROLE_LINKEDMINERBOOST1 = 'linkedminerboosted1'
ROLE_LINKEDMINERBOOST2 = 'linkedminerboosted2'
ROLE_LINKEDMINERBOOST3 = 'linkedminerboosted3'
ROLE_LINKEDMINERBOOST4 = 'linkedminerboosted4'
ROLE_LINKEDMINERBOOST5 = 'linkedminerboosted5'
ROLE_SCOUT = 'scout'
ROLE_GUARD = 'guard'
ROLE_ENERGY_DRAIN = 'energyDrain'
ROLE_DISMANTLER = 'dismantler'
ROLE_BANK_HEALER = 'bankhealer'
ROLE_BANK_ATTACKER = 'bankattacker'

ROLE_PREFIXES = {
    [ROLE_WORKER] : 'W',
    [ROLE_HAULER] : 'H',
    [ROLE_MINER] : 'M',
    [ROLE_CLAIMER] : 'C',
    [ROLE_ATTACKER] : 'A',
    [ROLE_MINERALMINER] : 'M',
    [ROLE_LINKEDMINER] : 'M',
    [ROLE_LINKEDMINERBOOST1] : 'M',
    [ROLE_LINKEDMINERBOOST2] : 'M',
    [ROLE_LINKEDMINERBOOST3] : 'M',
    [ROLE_LINKEDMINERBOOST4] : 'M',
    [ROLE_LINKEDMINERBOOST5] : 'M',
    [ROLE_SCOUT] : 'S',
    [ROLE_GUARD] : 'G',
    [ROLE_ENERGY_DRAIN] : 'D',
    [ROLE_DISMANTLER] : 'D',
    [ROLE_BANK_HEALER] : 'B',
    [ROLE_BANK_ATTACKER] : 'B'
}

TARGET_WORKER_COUNT = [
    0,
    9, //1
    9, //2
    6, //3
    4, //4
    3, //5
    2, //6
    1, //7
    1  //8
]

OWNER_CORRIDOR = 'C'
OWNER_ME = 'M'
OWNER_UNOWNED = 'U'
OWNER_ENEMY = 'E'
OWNER_KEEPER = 'K'
OWNER_UNKNOWN = ' '

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

CREEP_ATTACK                = 'attack'
CREEP_ATTACK_CONTROLLER     = 'attackController'
CREEP_BUILD                 = 'build'
CREEP_CLAIM_CONTROLLER      = 'claimController'
CREEP_DISMANTLE             = 'dismantle'
CREEP_DROP                  = 'drop'
CREEP_GENERATE_SAFE_MODE    = 'generateSafeMode'
CREEP_HARVEST               = 'harvest'
CREEP_HEAL                  = 'heal'
CREEP_PICKUP                = 'pickup'
CREEP_RANGED_ATTACK         = 'rangedAttack'
CREEP_RANGED_MASS_ATTACK    = 'rangedMassAttack'
CREEP_REPAIR                = 'repair'
CREEP_RESERVE_CONTROLLER    = 'reserveController'
CREEP_SIGN_CONTROLLER       = 'signContrroller'
CREEP_TRANSFER              = 'transfer'
CREEP_UPGRADE_CONTROLLER    = 'upgradeController'
CREEP_WITHDRAW              = 'withdraw'

CREEP_ACTION_ICON =
{
    [CREEP_ATTACK             ]:'⚔️',
    [CREEP_ATTACK_CONTROLLER  ]:'',
    [CREEP_BUILD              ]:'🚧',
    [CREEP_CLAIM_CONTROLLER   ]:'',
    [CREEP_DISMANTLE          ]:'',
    [CREEP_DROP               ]:'',
    [CREEP_GENERATE_SAFE_MODE ]:'',
    [CREEP_HARVEST            ]:'⬆️',
    [CREEP_HEAL               ]:'',
    [CREEP_PICKUP             ]:'⬆️',
    [CREEP_RANGED_ATTACK      ]:'🏹',
    [CREEP_REPAIR             ]:'',
    [CREEP_RESERVE_CONTROLLER ]:'',
    [CREEP_SIGN_CONTROLLER    ]:'',
    [CREEP_TRANSFER           ]:'⬇️',
    [CREEP_UPGRADE_CONTROLLER ]:'',
    [CREEP_WITHDRAW           ]:'⬆️'
}




BODIES = 
{
    [ROLE_WORKER]:[
        {cost:200,body:[MOVE,CARRY,WORK]},
        {cost:350,body:[MOVE,MOVE,CARRY,WORK,WORK]},
        {cost:400,body:[MOVE,MOVE,CARRY,CARRY,WORK,WORK]},
        {cost:650,body:[MOVE,MOVE,MOVE,CARRY,CARRY,WORK,WORK,WORK,WORK]},
        {cost:800,body:[MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,WORK,WORK,WORK,WORK]},
        {cost:900,body:[MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,WORK,WORK,WORK,WORK]},
        {cost:1200,body:[MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,WORK,WORK,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,WORK,WORK]},
        {cost:1600,body:[MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,WORK,WORK,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,WORK,WORK,WORK,WORK,WORK,WORK]},
        {cost:2000,body:[MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,WORK,WORK,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,WORK,WORK,WORK,WORK,WORK,WORK,MOVE,MOVE,CARRY,CARRY,WORK,WORK]}],
    [ROLE_HAULER]:[
        {cost:200,body:[MOVE,MOVE,CARRY,CARRY]},
        {cost:400,body:[MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY]},
        {cost:600,body:[MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY]},
        {cost:1200,body:[MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY]},
        {cost:2400,body:[MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY]}],
    [ROLE_MINER]:[
        {cost:250,body:[MOVE,WORK,WORK]},
        {cost:350,body:[MOVE,WORK,WORK,WORK]},
        {cost:450,body:[MOVE,WORK,WORK,WORK,WORK]},
        {cost:550,body:[MOVE,WORK,WORK,WORK,WORK,WORK]}],
    [ROLE_CLAIMER]:[
        {cost:650,body:[MOVE,CLAIM]},
        {cost:1300,body:[MOVE,MOVE,CLAIM,CLAIM]},
        {cost:2600,body:[MOVE,MOVE,MOVE,MOVE,CLAIM,CLAIM,CLAIM,CLAIM]}],
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
        {cost:3000,body:[MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK]},
        {cost:4150,body:[MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK]}],
    [ROLE_SCOUT]:[
        {cost:50,body:[MOVE]}],
    [ROLE_GUARD]:[
        {cost:430,body:[MOVE,MOVE,ATTACK,HEAL]}],
    [ROLE_LINKEDMINER]:[
        {cost:1050,body:[MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY]}],
    [ROLE_LINKEDMINERBOOST1]:[
        {cost:1300,body:[MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY]}],
    [ROLE_LINKEDMINERBOOST2]:[
        {cost:1550,body:[MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY]}],
    [ROLE_LINKEDMINERBOOST3]:[
        {cost:1700,body:[MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY]}],
    [ROLE_LINKEDMINERBOOST4]:[
        {cost:1950,body:[MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY]}],
    [ROLE_LINKEDMINERBOOST5]:[
        {cost:2200,body:[MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY]}],
    [ROLE_ENERGY_DRAIN]:[
        {cost:2220,body:[TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL]},
        {cost:7500,body:[MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL]}],
    [ROLE_DISMANTLER]:[
        {cost:2100,body:[TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK]}],
    [ROLE_BANK_HEALER]:[
        {cost:6900,body:[MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL]}],
    [ROLE_BANK_ATTACKER]:[
        {cost:2340,body:[MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,MOVE]}]
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

DIRECTION_OFFSET = {
    [TOP]:[0,-1],
    [TOP_RIGHT]:[1,-1],
    [RIGHT]:[1,0],
    [BOTTOM_RIGHT]:[1,1],
    [BOTTOM]:[0,1],
    [BOTTOM_LEFT]:[-1,1],
    [LEFT]:[-1,0],
    [TOP_LEFT]:[-1,-1]
}

REVERSE_DIRECTIONS = {
    [TOP]:BOTTOM,
    [TOP_RIGHT]:BOTTOM_LEFT,
    [RIGHT]:LEFT,
    [BOTTOM_RIGHT]:TOP_LEFT,
    [BOTTOM]:TOP,
    [BOTTOM_LEFT]:TOP_RIGHT,
    [LEFT]:RIGHT,
    [TOP_LEFT]:BOTTOM_RIGHT
}

REVERSED_REACTIONS = {};
for(let left in REACTIONS)
{
    for(let right in REACTIONS[left])
    {
        let result = REACTIONS[left][right];
        REVERSED_REACTIONS[result] = [left,right];
    }
}

RESOURCES_BASIC=[
    RESOURCE_ENERGY,
    RESOURCE_POWER,
    RESOURCE_HYDROGEN,
    RESOURCE_OXYGEN,
    RESOURCE_UTRIUM,
    RESOURCE_LEMERGIUM,
    RESOURCE_KEANIUM,
    RESOURCE_ZYNTHIUM,
    RESOURCE_CATALYST
]

ENEMIES = [
    "SteeleR",
    "Jaemon", // self dying, sweet revenge >:)
    "Viperl", // white peace? he didn't notice my attack and id dont what to fight
    "CrossXBones" // nuke as soon as in range
    ]
FRENEMIES = []

QUIPS = [
    "Sometimes dead is better",
    "Ever seen a blue flamingo?",
    "Crabs are people",
    "Clams are people",
    "Even a broken clock is right two times a day",
    "Apple pie recipie: 1.Lots of Hydrogen 2.Lots of Time",
    "A million apes on a million typewriters will eventually write code that runs",
    "Lurendrejs are not do goods for yous",
    "https://youtu.be/dQw4w9WgXcQ",
    "An arrow in your knee is better than an arrow in your tea",
    "A human has a head, 2 legs and 2 arms and even it loses a one, it’s still a human.",
    "Ingenuity is shorting a battery to make a light when it's dark, stupidity is taking them out of the flashlight first."
    ]

ALWAYSPROFITABLE = 200
MinimumSellingPrice = 
{
    [RESOURCE_ENERGY]:                      0.15,
    [RESOURCE_BATTERY]:                     0.150,
    
    [RESOURCE_POWER]:                       5.0,
    [RESOURCE_OPS]:                         0.25,

    [RESOURCE_OXYGEN]:                      0.036,
    [RESOURCE_OXIDANT]:                     0.22,

    [RESOURCE_HYDROGEN]:                    0.034,
    [RESOURCE_REDUCTANT]:                   0.25,

    [RESOURCE_ZYNTHIUM]:                    0.036,
    [RESOURCE_ZYNTHIUM_HYDRIDE]:           0.07,
    [RESOURCE_ZYNTHIUM_BAR]:                0.26,
    
    [RESOURCE_UTRIUM]:                      0.038,
    [RESOURCE_UTRIUM_HYDRIDE]:              0.08,
    [RESOURCE_UTRIUM_BAR]:                  0.200,

    [RESOURCE_KEANIUM]:                     0.038,
    [RESOURCE_KEANIUM_OXIDE]:               0.08,
    [RESOURCE_KEANIUM_BAR]:                 0.200,

    [RESOURCE_LEMERGIUM]:                   0.073,
    [RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE]:0.46,
    [RESOURCE_LEMERGIUM_BAR]:               0.400,

    [RESOURCE_GHODIUM_OXIDE]:               0.023,

    [RESOURCE_CATALYST]:                    0.090,
    [RESOURCE_PURIFIER]:                    0.87,

    [RESOURCE_GHODIUM]:                     1.0,
    [RESOURCE_GHODIUM_MELT]:                2.0,

    [RESOURCE_MIST]:                        3.5,
    [RESOURCE_CONDENSATE]:                  50

}

colors = 
{
    gray: '#555555',
    light: '#AAAAAA',
    road: '#666', // >:D
    energy: '#FFE87B',
    power: '#F53547',
    dark: '#181818',
    outline: '#8FBB93',
    speechText: '#000000',
    speechBackground: '#2ccf3b'
}

ColorSets = 
{
    white:  ["#ffffff", "#4c4c4c"],
    grey:   ["#b4b4b4", "#4c4c4c"],
    red:    ["#ff7b7b", "#592121"],
    yellow: ["#fdd388", "#5d4c2e"],
    green:  ["#00f4a2", "#236144"],
    blue:   ["#50d7f9", "#006181"],
    purple: ["#a071ff", "#371383"],
};
ResourceColors = 
{
    [RESOURCE_ENERGY]:    ColorSets.yellow,
    [RESOURCE_POWER]:     ColorSets.red,
    
    [RESOURCE_HYDROGEN]:  ColorSets.grey,
    [RESOURCE_OXYGEN]:    ColorSets.grey,
    [RESOURCE_UTRIUM]:    ColorSets.blue,
    [RESOURCE_LEMERGIUM]: ColorSets.green,
    [RESOURCE_KEANIUM]:   ColorSets.purple,
    [RESOURCE_ZYNTHIUM]:  ColorSets.yellow,
    [RESOURCE_CATALYST]:  ColorSets.red,
    [RESOURCE_GHODIUM]:   ColorSets.white,
  
    [RESOURCE_HYDROXIDE]:         ColorSets.grey,
    [RESOURCE_ZYNTHIUM_KEANITE]:  ColorSets.grey,
    [RESOURCE_UTRIUM_LEMERGITE]:  ColorSets.grey,
  
    [RESOURCE_UTRIUM_HYDRIDE]:    ColorSets.blue,
    [RESOURCE_UTRIUM_OXIDE]:      ColorSets.blue,
    [RESOURCE_KEANIUM_HYDRIDE]:   ColorSets.purple,
    [RESOURCE_KEANIUM_OXIDE]:     ColorSets.purple,
    [RESOURCE_LEMERGIUM_HYDRIDE]: ColorSets.green,
    [RESOURCE_LEMERGIUM_OXIDE]:   ColorSets.green,
    [RESOURCE_ZYNTHIUM_HYDRIDE]:  ColorSets.yellow,
    [RESOURCE_ZYNTHIUM_OXIDE]:    ColorSets.yellow,
    [RESOURCE_GHODIUM_HYDRIDE]:   ColorSets.white,
    [RESOURCE_GHODIUM_OXIDE]:     ColorSets.white,
  
    [RESOURCE_UTRIUM_ACID]:       ColorSets.blue,
    [RESOURCE_UTRIUM_ALKALIDE]:   ColorSets.blue,
    [RESOURCE_KEANIUM_ACID]:      ColorSets.purple,
    [RESOURCE_KEANIUM_ALKALIDE]:  ColorSets.purple,
    [RESOURCE_LEMERGIUM_ACID]:    ColorSets.green,
    [RESOURCE_LEMERGIUM_ALKALIDE]:ColorSets.green,
    [RESOURCE_ZYNTHIUM_ACID]:     ColorSets.yellow,
    [RESOURCE_ZYNTHIUM_ALKALIDE]: ColorSets.yellow,
    [RESOURCE_GHODIUM_ACID]:      ColorSets.white,
    [RESOURCE_GHODIUM_ALKALIDE]:  ColorSets.white,
  
    [RESOURCE_CATALYZED_UTRIUM_ACID]:         ColorSets.blue,
    [RESOURCE_CATALYZED_UTRIUM_ALKALIDE]:     ColorSets.blue,
    [RESOURCE_CATALYZED_KEANIUM_ACID]:        ColorSets.purple,
    [RESOURCE_CATALYZED_KEANIUM_ALKALIDE]:    ColorSets.purple,
    [RESOURCE_CATALYZED_LEMERGIUM_ACID]:      ColorSets.green,
    [RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE]:  ColorSets.green,
    [RESOURCE_CATALYZED_ZYNTHIUM_ACID]:       ColorSets.yellow,
    [RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE]:   ColorSets.yellow,
    [RESOURCE_CATALYZED_GHODIUM_ACID]:        ColorSets.white,
    [RESOURCE_CATALYZED_GHODIUM_ALKALIDE]:    ColorSets.white,

    [RESOURCE_OXIDANT]:         ColorSets.grey,
    [RESOURCE_REDUCTANT]:       ColorSets.grey,
    [RESOURCE_ZYNTHIUM_BAR]:    ColorSets.yellow,
    [RESOURCE_LEMERGIUM_BAR]:   ColorSets.green,
    [RESOURCE_UTRIUM_BAR]:      ColorSets.blue,
    [RESOURCE_KEANIUM_BAR]:     ColorSets.purple,
    [RESOURCE_PURIFIER]:        ColorSets.red,
    [RESOURCE_GHODIUM_MELT]:    ColorSets.white,
};

VISUALTYPE_POLY = 1
VISUALTYPE_RECT = 2
VISUALTYPE_CIRCLE = 3

RESOURCE_UNIQUE_ICONS=
{
    [RESOURCE_SILICON]:"RESOURCE_SILICON_SVG",

    [RESOURCE_WIRE]:"RESOURCE_WIRE_SVG",
    [RESOURCE_SWITCH]:"RESOURCE_SWITCH_SVG",
    [RESOURCE_TRANSISTOR]:"RESOURCE_TRANSISTOR_SVG",
    [RESOURCE_MICROCHIP]:"RESOURCE_MICROCHIP_SVG",
    [RESOURCE_CIRCUIT]:"RESOURCE_CIRCUIT_SVG",
    [RESOURCE_DEVICE]:"RESOURCE_DEVICE_SVG",
    
    [RESOURCE_METAL]:"RESOURCE_METAL_SVG",

    [RESOURCE_ALLOY]:"RESOURCE_ALLOY_SVG",
    [RESOURCE_TUBE]:"RESOURCE_TUBE_SVG",
    [RESOURCE_FIXTURES]:"RESOURCE_FIXTURES_SVG",
    [RESOURCE_FRAME]:"RESOURCE_FRAME_SVG",
    [RESOURCE_HYDRAULICS]:"RESOURCE_HYDRAULICS_SVG",
    [RESOURCE_MACHINE]:"RESOURCE_MACHINE_SVG",

    [RESOURCE_BIOMASS]:"RESOURCE_BIOMASS_SVG",

    [RESOURCE_CELL]:"RESOURCE_CELL_SVG",
    [RESOURCE_PHLEGM]:"RESOURCE_PHLEGM_SVG",
    [RESOURCE_TISSUE]:"RESOURCE_TISSUE_SVG",
    [RESOURCE_MUSCLE]:"RESOURCE_MUSCLE_SVG",
    [RESOURCE_ORGANOID]:"RESOURCE_ORGANOID_SVG",
    [RESOURCE_ORGANISM]:"RESOURCE_ORGANISM_SVG",
    
    [RESOURCE_MIST]:"RESOURCE_MIST_SVG",

    [RESOURCE_CONDENSATE]:"RESOURCE_CONDENSATE_SVG",
    [RESOURCE_CONCENTRATE]:"RESOURCE_CONCENTRATE_SVG",
    [RESOURCE_EXTRACT]:"RESOURCE_EXTRACT_SVG",
    [RESOURCE_SPIRIT]:"RESOURCE_SPIRIT_SVG",
    [RESOURCE_EMANATION]:"RESOURCE_EMANATION_SVG",
    [RESOURCE_ESSENCE]:"RESOURCE_ESSENCE_SVG",
    
    [RESOURCE_OPS]:"RESOURCE_OPS_SVG",
    [RESOURCE_BATTERY]:"RESOURCE_BATTERY_SVG",
    [RESOURCE_COMPOSITE]:"RESOURCE_COMPOSITE_SVG",
    [RESOURCE_CRYSTAL]:"RESOURCE_CRYSTAL_SVG",
    [RESOURCE_LIQUID]:"RESOURCE_LIQUID_SVG"
}




BAKED_COORD=
{
    "Encode": 
    {
        [ 0]: "a",
        [ 1]: "b",
        [ 2]: "c",
        [ 3]: "d",
        [ 4]: "e",
        [ 5]: "f",
        [ 6]: "g",
        [ 7]: "h",
        [ 8]: "i",
        [ 9]: "j",
        [10]: "k",
        [11]: "l",
        [12]: "m",
        [13]: "n",
        [14]: "o",
        [15]: "p",
        [16]: "q",
        [17]: "r",
        [18]: "s",
        [19]: "t",
        [20]: "u",
        [21]: "v",
        [22]: "w",
        [23]: "x",
        [24]: "y",
        [25]: "z",
        [26]: "A",
        [27]: "B",
        [28]: "C",
        [29]: "D",
        [30]: "E",
        [31]: "F",
        [32]: "G",
        [33]: "H",
        [34]: "I",
        [35]: "J",
        [36]: "K",
        [37]: "L",
        [38]: "M",
        [39]: "N",
        [40]: "O",
        [41]: "P",
        [42]: "Q",
        [43]: "R",
        [44]: "S",
        [45]: "T",
        [46]: "U",
        [47]: "V",
        [48]: "W",
        [49]: "X"
    },
    "Decode":
    {
        "a":  0,
        "b":  1,
        "c":  2,
        "d":  3,
        "e":  4,
        "f":  5,
        "g":  6,
        "h":  7,
        "i":  8,
        "j":  9,
        "k": 10,
        "l": 11,
        "m": 12,
        "n": 13,
        "o": 14,
        "p": 15,
        "q": 16,
        "r": 17,
        "s": 18,
        "t": 19,
        "u": 20,
        "v": 21,
        "w": 22,
        "x": 23,
        "y": 24,
        "z": 25,
        "A": 26,
        "B": 27,
        "C": 28,
        "D": 29,
        "E": 30,
        "F": 31,
        "G": 32,
        "H": 33,
        "I": 34,
        "J": 35,
        "K": 36,
        "L": 37,
        "M": 38,
        "N": 39,
        "O": 40,
        "P": 41,
        "Q": 42,
        "R": 43,
        "S": 44,
        "T": 45,
        "U": 46,
        "V": 47,
        "W": 48,
        "X": 49
    }
}