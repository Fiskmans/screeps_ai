

IS_PERSISTENT                       = !!(Game.shard && Game.shard.name.startsWith("shard")); 
IS_SIM                              = !!Game.rooms['sim'];
IS_PTR                              = !!(Game.shard && Game.shard.ptr);
IS_SEASONAL                         = !!(Game.shard && Game.shard.name == "shardSeason")
IS_FISK_SERVER                      = !!(Game.shard && Game.shard.name == "FiskServer")



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
COLONY_CHECK_BUILDINGS_INTERVAL     = 23;
COLONY_RETARGET_SELLING_INTERVAL    = 13;
COLONY_RETARGET_FACTORY_INTERVAL    = 17;
SIGN_CONTROLLER_INTERVAL            = 500
REFRESH_INCOME_INTERVAL             = 200

COLONY_EXTRA_WORKER_THRESHOLD               = 600000;
COLONY_WORKER_FREE_FOR_ALL_ENERGY_THRESHOLD = 800000;
RCL_MAX                             = 8;
CPU_BUCKET_MAX                      = 10000;
ROOM_WIDTH                          = 50;
ROOM_HEIGHT                         = 50;

CPU_MEASURE_RANGE                   = 1500

BUZZ_CHANCE                         = 0.1

MY_USERNAME                         = 'Fiskmans'
INVADER_USERNAME                    = 'Invader'

ROOM_NAME_REGEX                     =  /^([WE])(\d+)([NS])(\d+)$/;

ENEMY_STRUCTURES_WITH_LOOT          = [STRUCTURE_STORAGE,STRUCTURE_TERMINAL,STRUCTURE_FACTORY,STRUCTURE_LAB]

COLONY_SURPLUS_THRESHOLD = 10000
COLONY_PUSH_RESOURCE_THRESHOLD = 5000

TERMINAL_ENERGY_MAX     = 40000
TERMINAL_ENERGY_MIN     = 30000
TEMRINAL_RESOURCE_MIN   = 10000
TERMINAL_EXPORT_AMOUNT  = 2500

MARKET_SELL_REFRESH_INTERVAL    = 20;
MARKET_PRICE_REFRESH_INTERVAL   = 100;
MARKET_STALE_PRICE_THRESHOLD    = 500;
MARKETING_IMPORT_LEVEL          = 5000

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
STALE_REQUEST_THRESHOLD = 10
STALE_PLANNER_COSTMATRIX_THRESHOLD = 50
REFILL_CHECK_INTERVAL = 29
MINING_CONTAINER_EMPTY_THRESHOLD = 1000
SPAWNING_ENERGY_PANIC_AMOUNT    = 10000

TOWER_REFILL_THRESHOLD = 600

LAB_REBUILD_STATUS_INTERVAL = 500
LAB_REFILL_THRESHOLD        = 1600
LAB_STOCK_RESOURCE_AMOUNT   = 1500
LAB_REMOVE_RESOURCE_AMOUNT  = 1000
LAB_USABLE_AMOUNT_THRESHOLD = 250
LAB_PRODUCTION_CAP          = 3000

SHARD_PREFIX_INDEX          = 0
ROLE_PREFIX_INDEX           = 1

SHARD_CHECK_PULSE_INTERVAL  = 150
SHARD_CREEP_NAME_PREFIXES   =
{
    ["shard0"]:"0",
    ["shard1"]:"1",
    ["shard2"]:"2",
    ["shard3"]:"3"
}

RAMPARTS_HITS_TO_IGNORE = 
{
    0:0,
    1:0,
    2:0,
    3:100000,
    4:300000,
    5:500000,
    6:500000,
    7:500000,
    8:RAMPART_HITS_MAX[8]-1000000,
}

MARKETING_ENERGY_LOWER_LIMIT    = 100000
POWER_PROCESS_ENERGY_LIMIT      = 150000
POWER_SEARCHING_ENERGY_LIMIT    = 200000
ENERGY_SELLING_ENERGY_LIMIT     = 500000
UPGRADE_FROM_STORAGE_MIN_ENERGY = 70000


SPAWN_PRIORITY_GENERIC  = 0;
SPAWN_PRIORITY_URGENT   = 1;
SPAWN_PRIORITY_IMPORTANT= 2;
SPAWN_PRIORITY_VITAL    = 3;

ROLE_WORKER             = 'worker'
ROLE_HAULER             = 'hauler'
ROLE_MINER              = 'miner'
ROLE_DEFENDER           = 'defender'
ROLE_CLAIMER            = 'claimer'
ROLE_ATTACKER           = 'attacker'
ROLE_UPGRADER           = 'upgrader'
ROLE_MINERALMINER       = 'mineralminer'
ROLE_LINKEDMINER        = 'linkedminer'
ROLE_LINKEDMINERBOOST1  = 'linkedminerboosted1'
ROLE_LINKEDMINERBOOST2  = 'linkedminerboosted2'
ROLE_LINKEDMINERBOOST3  = 'linkedminerboosted3'
ROLE_LINKEDMINERBOOST4  = 'linkedminerboosted4'
ROLE_LINKEDMINERBOOST5  = 'linkedminerboosted5'
ROLE_SCOUT              = 'scout'
ROLE_GUARD              = 'guard'
ROLE_ENERGY_DRAIN       = 'energyDrain'
ROLE_DISMANTLER         = 'dismantler'
ROLE_BANK_HEALER        = 'bankhealer'
ROLE_BANK_ATTACKER      = 'bankattacker'

ROLE_PREFIXES = {
    [ROLE_WORKER]               : 'W',
    [ROLE_HAULER]               : 'H',
    [ROLE_MINER]                : 'M',
    [ROLE_DEFENDER]             : 'D',
    [ROLE_CLAIMER]              : 'C',
    [ROLE_ATTACKER]             : 'A',
    [ROLE_UPGRADER]             : 'U',
    [ROLE_MINERALMINER]         : 'M',
    [ROLE_LINKEDMINER]          : 'M',
    [ROLE_LINKEDMINERBOOST1]    : 'M',
    [ROLE_LINKEDMINERBOOST2]    : 'M',
    [ROLE_LINKEDMINERBOOST3]    : 'M',
    [ROLE_LINKEDMINERBOOST4]    : 'M',
    [ROLE_LINKEDMINERBOOST5]    : 'M',
    [ROLE_SCOUT]                : 'S',
    [ROLE_GUARD]                : 'G',
    [ROLE_ENERGY_DRAIN]         : 'D',
    [ROLE_DISMANTLER]           : 'D',
    [ROLE_BANK_HEALER]          : 'B',
    [ROLE_BANK_ATTACKER]        : 'B'
}

DAMAGE_TYPE_ENEMY    = 'enemy'
DAMAGE_TYPE_FRIENDLY = 'friendly'

HEAL_TYPE_ENEMY      = 'enemy'
HEAL_TYPE_FRIENDLY   = 'friendly'

OWNER_CORRIDOR  = 'C'
OWNER_ME        = 'M'
OWNER_UNOWNED   = 'U'
OWNER_ENEMY     = 'E'
OWNER_KEEPER    = 'K'
OWNER_UNKNOWN   = ' '

OWNER_COLOR = {
    [OWNER_CORRIDOR]:"#FFFFFF",
    [OWNER_ME]:"#00FF00",
    [OWNER_UNOWNED]:"#808080",
    [OWNER_ENEMY]:"#FF0000",
    [OWNER_KEEPER]:"#FFa500",
    [OWNER_UNKNOWN]:"#000000"
}

CREEP_ATTACK                = 'attack'
CREEP_ATTACK_CONTROLLER     = 'attackController'
CREEP_BUILD                 = 'build'
CREEP_CLAIM_CONTROLLER      = 'claimController'
CREEP_DISMANTLE             = 'dismantle'
CREEP_DROP                  = 'drop'
CREEP_GENERATE_SAFE_MODE    = 'generateSafeMode'
CREEP_HARVEST               = 'harvest'
CREEP_HEAL                  = 'heal'
CREEP_RANGED_HEAL           = 'rangedHeal'
CREEP_PICKUP                = 'pickup'
CREEP_RANGED_ATTACK         = 'rangedAttack'
CREEP_RANGED_MASS_ATTACK    = 'rangedMassAttack'
CREEP_REPAIR                = 'repair'
CREEP_RESERVE_CONTROLLER    = 'reserveController'
CREEP_SIGN_CONTROLLER       = 'signController'
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
    [CREEP_RANGED_HEAL        ]:'',
    [CREEP_PICKUP             ]:'🖐️',
    [CREEP_RANGED_ATTACK      ]:'🏹',
    [CREEP_REPAIR             ]:'🛠️',
    [CREEP_RESERVE_CONTROLLER ]:'',
    [CREEP_SIGN_CONTROLLER    ]:'',
    [CREEP_TRANSFER           ]:'⬇️',
    [CREEP_UPGRADE_CONTROLLER ]:'💰',
    [CREEP_WITHDRAW           ]:'⬆️'
}

REQUEST_ACTION_EMPTY        = 'Empty'
REQUEST_ACTION_FILL         = 'Fill'

REQUEST_PRIORITY_TIMED     = 4
REQUEST_PRIORITY_FUNCTION  = 3
REQUEST_PRIORITY_PROGRESS  = 2
REQUEST_PRIORITY_AUXILIARY = 1

LAB_ACTION_HOLD             = 'hold'
LAB_ACTION_REACT            = 'react'

TOWER_ACTION_ATTACK         = 'attack'
TOWER_ACTION_HEAL           = 'heal'
TOWER_ACTION_REPAIR         = 'repair'

PLANNER_STAGE_PLACE         = 'place'
PLANNER_STAGE_WAITING       = 'waiting'
PLANNER_STAGE_DONE          = 'done'

PLANNER_STAGE_FAILED        = 'failed'


ENERGY_CAPACITY_AT_LEVEL =
{
    [1]:300,
    [2]:550,
    [3]:800,
    [4]:1300,
    [5]:1800,
    [6]:2300,
    [7]:5600,
    [8]:12900
}

REMOTE_HAULER_CARRY_PARTS_AT_LEVEL =
{
    [3]:10,
    [4]:17,
    [5]:24,
    [6]:30,
    [7]:33
}

HAULER_PARTS_AT_LEVEL =
{
    [1]:3,
    [2]:5,
    [3]:8,
    [4]:13,
    [5]:18,
    [6]:23,
    [7]:25,
    [8]:25
}

WORKER_PARTS_AT_LEVEL = 
{
    [1]:1,
    [2]:3,
    [3]:4,
    [4]:6,
    [5]:9,
    [6]:11,
    [7]:17,
    [8]:17
}

BODIES = 
{
    SCOUT:[MOVE],

    BASIC_CLAIMER:[MOVE,MOVE,MOVE,MOVE,CLAIM],

    LV1_WORKER                      :[MOVE,WORK,CARRY],
    LV2_WORKER                      :[MOVE,MOVE,MOVE,WORK,WORK,WORK,CARRY,CARRY],
    LV3_WORKER                      :[MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY],
    LV4_WORKER                      :[MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY],
    LV5_WORKER                      :[MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY],
    LV6_WORKER                      :[MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY],
    LV7_WORKER                      :[MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY],

    LV1_HAULER                      :[MOVE,MOVE,MOVE,CARRY,CARRY,CARRY],
    LV2_HAULER                      :[MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,CARRY],
    LV3_HAULER                      :[MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY],
    LV4_HAULER                      :[MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY],
    LV5_HAULER                      :[MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY],
    LV6_HAULER                      :[MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY],
    LV7_HAULER                      :[MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY],

    LV2_REMOTE_MINER                :[MOVE,MOVE,WORK,WORK,WORK,CARRY,CARRY,CARRY],
    LV3_REMOTE_MINER                :[MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY],
    LV4_REMOTE_MINER                :[MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY],
    LV5_REMOTE_MINER                :[MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY],
    LV6_REMOTE_MINER                :[MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY],

    LV3_REMOTE_DEFENDER             :[TOUGH,MOVE,MOVE,MOVE,MOVE,RANGED_ATTACK,RANGED_ATTACK,HEAL],
    LV4_REMOTE_DEFENDER             :[MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,HEAL],

    LV3_CLAIMER                     :[MOVE,CLAIM],

    LV3_CORE_POPPER                 :[MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK],
    LV4_CORE_POPPER                 :[MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK],

    SOURCE_REMOTE_MINER             :[MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,CARRY],
    SOURCE_REMOTE_MINER_CONTESTED   :[MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,CARRY,ATTACK],
    SK_REMOTE_MINER                 :[MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY],
    MINERAL_REMOTE_MINER            :[MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK],

    LV3_CLAIMER                     :[MOVE,CLAIM],
    LV4_CLAIMER                     :[MOVE,MOVE,CLAIM,CLAIM],
    LV6_CLAIMER                     :[MOVE,MOVE,MOVE,CLAIM,CLAIM,CLAIM],
    LV7_CLAIMER                     :[MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,CLAIM,CLAIM,CLAIM,CLAIM,CLAIM,CLAIM,CLAIM,CLAIM],
    LV8_CLAIMER                     :[MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,CLAIM,CLAIM,CLAIM,CLAIM,CLAIM,CLAIM,CLAIM,CLAIM,CLAIM,CLAIM,CLAIM,CLAIM,CLAIM,CLAIM,CLAIM,CLAIM,CLAIM,CLAIM,CLAIM],

    LV3_CLAIMER_CONTESTED           :[ATTACK,MOVE,CLAIM],
    LV4_CLAIMER_CONTESTED           :[ATTACK,MOVE,MOVE,CLAIM],
    LV6_CLAIMER_CONTESTED           :[ATTACK,MOVE,MOVE,MOVE,CLAIM,CLAIM,CLAIM],
    LV7_CLAIMER_CONTESTED           :[ATTACK,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,CLAIM,CLAIM,CLAIM,CLAIM,CLAIM,CLAIM,CLAIM,CLAIM],
    LV8_CLAIMER_CONTESTED           :[ATTACK,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,CLAIM,CLAIM,CLAIM,CLAIM,CLAIM,CLAIM,CLAIM,CLAIM,CLAIM,CLAIM,CLAIM,CLAIM,CLAIM,CLAIM,CLAIM,CLAIM,CLAIM,CLAIM,CLAIM],

    LV3_REMOTE_HAULER               :[MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY],
    LV4_REMOTE_HAULER               :[MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY],
    LV5_REMOTE_HAULER               :[MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY],
    LV6_REMOTE_HAULER               :[MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY],
    LV7_REMOTE_HAULER               :[MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY],

    LV3_REMOTE_DEFENDER             :[MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK],

    LV3_REMOTE_ATTACKER             :[MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,HEAL],
    LV4_REMOTE_ATTACKER             :[MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,HEAL],
    LV5_REMOTE_ATTACKER             :[MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,HEAL,HEAL],
    LV6_REMOTE_ATTACKER             :[MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,HEAL,HEAL],

    DEDICATED_UPGRADER              :[MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY],

    LOCAL_MINER                     :[MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK],
    LOCAL_LINKED_MINER              :[MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY],

    LOW_CPU_MINER                   :[MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY],

    LOCAL_MINERAL_MINER             :[MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK],

    GLC_PRAISER                     :[MOVE,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY],

    SK_CLEARER                      :[MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL],

    BANK_HEALER                     :[MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL],    

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
        {cost:260,body:[MOVE,MOVE,ATTACK,ATTACK]},
        {cost:520,body:[MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK]},
        {cost:2080,body:[MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK]}],
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
    [ROLE_BANK_ATTACKER]:[
        {cost:2340,body:[MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,MOVE]}],
}

BODY_GROUPS={
    WORKERS:
    [
        BODIES.LV1_WORKER,
        BODIES.LV2_WORKER,
        BODIES.LV3_WORKER,
        BODIES.LV4_WORKER,
        BODIES.LV5_WORKER,
        BODIES.LV6_WORKER,
        BODIES.LV7_WORKER
    ],
    HAULERS:
    [
        BODIES.LV1_HAULER,
        BODIES.LV2_HAULER,
        BODIES.LV3_HAULER,
        BODIES.LV4_HAULER,
        BODIES.LV5_HAULER,
        BODIES.LV6_HAULER,
        BODIES.LV7_HAULER
    ],
    REMOTE_MINERS:
    [
        BODIES.LV2_REMOTE_MINER,
        BODIES.LV3_REMOTE_MINER,
        BODIES.LV4_REMOTE_MINER,
        BODIES.LV5_REMOTE_MINER,
        BODIES.LV6_REMOTE_MINER
    ]
}

RICK_QR_CODE =
[
    "1111111000001000001111111",
    "1000001011111101101000001",
    "1011101010110101001011101",
    "1011101001011011001011101",
    "1011101011011101001011101",
    "1000001010100001001000001",
    "1111111010101010101111111",

    "0000000010101000000000000",
    "1101001100011010101110110",
    "0100010001010100101010010",
    "0111011000010101011101100",
    "0100110101101100011110001",
    "0001101100100010000100111",
    "0110100101001011000110110",
    "1010101110111110001011000",
    "0101010110101110111100000",
    "1101111101000000111110001",
    "0000000011011101100010000",
    
    "1111111011000110101011011",
    "1000001001111010100011111",
    "1011101001010010111110110",
    "1011101010110100101110000",
    "1011101000110001010101101",
    "1000001010100101110011011",
    "1111111010100101110011011"
]

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

RESOURCE_TYPE_ENERGY    = 'energy'
RESOURCE_TYPE_OPS       = 'ops'
RESOURCE_TYPE_MINABLE   = 'mine'
RESOURCE_TYPE_CHEMICAL  = 'chemical'
RESOURCE_TYPE_COMMODITY = 'commodity'


MARKET_RESOURCE_LIMITS = {
    [RESOURCE_TYPE_ENERGY]: 
    {
        sell:               650000,
        dump:               800000
    },
    [RESOURCE_TYPE_OPS]: 
    {
        sell:               1000,
        dump:               8000
    },
    [RESOURCE_TYPE_MINABLE]: 
    {
        sell:               15000,
        dump:               100000
    },
    [RESOURCE_TYPE_CHEMICAL]: 
    {
        sell:               4000,
        dump:               10000
    },
    [RESOURCE_TYPE_COMMODITY]: 
    {
        sell:               20,
        dump:               100000
    }
}

RESOURCE_TYPES={
    [RESOURCE_ENERGY]:                          RESOURCE_TYPE_ENERGY,
    [RESOURCE_POWER]:                           RESOURCE_TYPE_MINABLE,
            
    [RESOURCE_HYDROGEN]:                        RESOURCE_TYPE_MINABLE,
    [RESOURCE_OXYGEN]:                          RESOURCE_TYPE_MINABLE,
    [RESOURCE_UTRIUM]:                          RESOURCE_TYPE_MINABLE,
    [RESOURCE_LEMERGIUM]:                       RESOURCE_TYPE_MINABLE,
    [RESOURCE_KEANIUM]:                         RESOURCE_TYPE_MINABLE,
    [RESOURCE_ZYNTHIUM]:                        RESOURCE_TYPE_MINABLE,
    [RESOURCE_CATALYST]:                        RESOURCE_TYPE_MINABLE,
    
    [RESOURCE_HYDROXIDE]:                       RESOURCE_TYPE_CHEMICAL,
    [RESOURCE_ZYNTHIUM_KEANITE]:                RESOURCE_TYPE_CHEMICAL,
    [RESOURCE_UTRIUM_LEMERGITE]:                RESOURCE_TYPE_CHEMICAL,

    [RESOURCE_GHODIUM]:                         RESOURCE_TYPE_CHEMICAL,
                
    [RESOURCE_KEANIUM_HYDRIDE]:                 RESOURCE_TYPE_CHEMICAL,
    [RESOURCE_KEANIUM_OXIDE]:                   RESOURCE_TYPE_CHEMICAL,
    [RESOURCE_UTRIUM_HYDRIDE]:                  RESOURCE_TYPE_CHEMICAL,
    [RESOURCE_UTRIUM_OXIDE]:                    RESOURCE_TYPE_CHEMICAL,
    [RESOURCE_LEMERGIUM_HYDRIDE]:               RESOURCE_TYPE_CHEMICAL,
    [RESOURCE_LEMERGIUM_OXIDE]:                 RESOURCE_TYPE_CHEMICAL,
    [RESOURCE_ZYNTHIUM_HYDRIDE]:                RESOURCE_TYPE_CHEMICAL,
    [RESOURCE_ZYNTHIUM_OXIDE]:                  RESOURCE_TYPE_CHEMICAL,
    [RESOURCE_GHODIUM_HYDRIDE]:                 RESOURCE_TYPE_CHEMICAL,
    [RESOURCE_GHODIUM_OXIDE]:                   RESOURCE_TYPE_CHEMICAL,
                
    [RESOURCE_KEANIUM_ACID]:                    RESOURCE_TYPE_CHEMICAL,
    [RESOURCE_KEANIUM_ALKALIDE]:                RESOURCE_TYPE_CHEMICAL,
    [RESOURCE_UTRIUM_ACID]:                     RESOURCE_TYPE_CHEMICAL,
    [RESOURCE_UTRIUM_ALKALIDE]:                 RESOURCE_TYPE_CHEMICAL,
    [RESOURCE_LEMERGIUM_ACID]:                  RESOURCE_TYPE_CHEMICAL,
    [RESOURCE_LEMERGIUM_ALKALIDE]:              RESOURCE_TYPE_CHEMICAL,
    [RESOURCE_ZYNTHIUM_ACID]:                   RESOURCE_TYPE_CHEMICAL,
    [RESOURCE_ZYNTHIUM_ALKALIDE]:               RESOURCE_TYPE_CHEMICAL,
    [RESOURCE_GHODIUM_ACID]:                    RESOURCE_TYPE_CHEMICAL,
    [RESOURCE_GHODIUM_ALKALIDE]:                RESOURCE_TYPE_CHEMICAL,
  
    [RESOURCE_CATALYZED_KEANIUM_ACID]:          RESOURCE_TYPE_CHEMICAL,
    [RESOURCE_CATALYZED_KEANIUM_ALKALIDE]:      RESOURCE_TYPE_CHEMICAL,
    [RESOURCE_CATALYZED_UTRIUM_ACID]:           RESOURCE_TYPE_CHEMICAL,
    [RESOURCE_CATALYZED_UTRIUM_ALKALIDE]:       RESOURCE_TYPE_CHEMICAL,
    [RESOURCE_CATALYZED_LEMERGIUM_ACID]:        RESOURCE_TYPE_CHEMICAL,
    [RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE]:    RESOURCE_TYPE_CHEMICAL,
    [RESOURCE_CATALYZED_ZYNTHIUM_ACID]:         RESOURCE_TYPE_CHEMICAL,
    [RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE]:     RESOURCE_TYPE_CHEMICAL,
    [RESOURCE_CATALYZED_GHODIUM_ACID]:          RESOURCE_TYPE_CHEMICAL,
    [RESOURCE_CATALYZED_GHODIUM_ALKALIDE]:      RESOURCE_TYPE_CHEMICAL,

    [RESOURCE_OXIDANT]:                         RESOURCE_TYPE_COMMODITY,
    [RESOURCE_REDUCTANT]:                       RESOURCE_TYPE_COMMODITY,
    [RESOURCE_ZYNTHIUM_BAR]:                    RESOURCE_TYPE_COMMODITY,
    [RESOURCE_LEMERGIUM_BAR]:                   RESOURCE_TYPE_COMMODITY,
    [RESOURCE_UTRIUM_BAR]:                      RESOURCE_TYPE_COMMODITY,
    [RESOURCE_KEANIUM_BAR]:                     RESOURCE_TYPE_COMMODITY,
    [RESOURCE_PURIFIER]:                        RESOURCE_TYPE_COMMODITY,
    [RESOURCE_GHODIUM_MELT]:                    RESOURCE_TYPE_COMMODITY,

    [RESOURCE_SILICON]:                         RESOURCE_TYPE_MINABLE,

    [RESOURCE_WIRE]:                            RESOURCE_TYPE_COMMODITY,
    [RESOURCE_SWITCH]:                          RESOURCE_TYPE_COMMODITY,
    [RESOURCE_TRANSISTOR]:                      RESOURCE_TYPE_COMMODITY,
    [RESOURCE_MICROCHIP]:                       RESOURCE_TYPE_COMMODITY,
    [RESOURCE_CIRCUIT]:                         RESOURCE_TYPE_COMMODITY,
    [RESOURCE_DEVICE]:                          RESOURCE_TYPE_COMMODITY,
    
    [RESOURCE_METAL]:                           RESOURCE_TYPE_MINABLE,

    [RESOURCE_ALLOY]:                           RESOURCE_TYPE_COMMODITY,
    [RESOURCE_TUBE]:                            RESOURCE_TYPE_COMMODITY,
    [RESOURCE_FIXTURES]:                        RESOURCE_TYPE_COMMODITY,
    [RESOURCE_FRAME]:                           RESOURCE_TYPE_COMMODITY,
    [RESOURCE_HYDRAULICS]:                      RESOURCE_TYPE_COMMODITY,
    [RESOURCE_MACHINE]:                         RESOURCE_TYPE_COMMODITY,

    [RESOURCE_BIOMASS]:                         RESOURCE_TYPE_MINABLE,

    [RESOURCE_CELL]:                            RESOURCE_TYPE_COMMODITY,
    [RESOURCE_PHLEGM]:                          RESOURCE_TYPE_COMMODITY,
    [RESOURCE_TISSUE]:                          RESOURCE_TYPE_COMMODITY,
    [RESOURCE_MUSCLE]:                          RESOURCE_TYPE_COMMODITY,
    [RESOURCE_ORGANOID]:                        RESOURCE_TYPE_COMMODITY,
    [RESOURCE_ORGANISM]:                        RESOURCE_TYPE_COMMODITY,
    
    [RESOURCE_MIST]:                            RESOURCE_TYPE_MINABLE,

    [RESOURCE_CONDENSATE]:                      RESOURCE_TYPE_COMMODITY,
    [RESOURCE_CONCENTRATE]:                     RESOURCE_TYPE_COMMODITY,
    [RESOURCE_EXTRACT]:                         RESOURCE_TYPE_COMMODITY,
    [RESOURCE_SPIRIT]:                          RESOURCE_TYPE_COMMODITY,
    [RESOURCE_EMANATION]:                       RESOURCE_TYPE_COMMODITY,
    [RESOURCE_ESSENCE]:                         RESOURCE_TYPE_COMMODITY,
    
    [RESOURCE_OPS]:                             RESOURCE_TYPE_OPS,
    [RESOURCE_BATTERY]:                         RESOURCE_TYPE_COMMODITY,
    [RESOURCE_COMPOSITE]:                       RESOURCE_TYPE_COMMODITY,
    [RESOURCE_CRYSTAL]:                         RESOURCE_TYPE_COMMODITY,
    [RESOURCE_LIQUID]:                          RESOURCE_TYPE_COMMODITY,
}

ENEMIES = [
    "SteeleR",
    "Jaemon", // self dying, sweet revenge >:)
    "Viperl", // white peace? he didn't notice my attack and i dont what to fight
    "CrossXBones" // nuke as soon as in range
    ]
FRENEMIES = []


REMOTE_MINING_SIGN = "Beware of the hornets, They've found this area tasty";
QUIPS = [
    "Sometimes dead is better",
    "Ever seen a blue flamingo?",
    "Crabs are people",
    "Clams are people",
    "Legit or quit",
    "Even a broken clock is right two times a day",
    "Apple pie recipie: 1.Lots of Hydrogen 2.Lots of Time",
    "A million apes on a million typewriters will eventually write code that runs",
    "Lurendrejs are not do goods for yous",
    "https://youtu.be/dQw4w9WgXcQ",
    "An arrow in your knee is better than an arrow in your tea",
    //"Ingenuity is shorting a battery to make a light when it's dark, stupidity is taking them out of the flashlight first.",
    "With all but the best decisions you can still end up in the wrong place",
    "Segmentation fault: Core dumped"
    ]


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

RESOURCE_UNIQUE_ICONS =
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

SVG = 
{
    cat:"CAT_SVG"
}


if(IS_SEASONAL)
{
    _.assign(RESOURCE_UNIQUE_ICONS,
        {
            [RESOURCE_SYMBOL_ALEPH]: 'ALEPH_SVG',
            [RESOURCE_SYMBOL_BETH]: 'BETH_SVG',
            [RESOURCE_SYMBOL_GIMMEL]: 'GIMMEL_SVG',
            [RESOURCE_SYMBOL_DALETH]: 'DALETH_SVG',
            [RESOURCE_SYMBOL_HE]: 'HE_SVG',
            [RESOURCE_SYMBOL_WAW]: 'WAW_SVG',
            [RESOURCE_SYMBOL_ZAYIN]: 'ZAYIN_SVG',
            [RESOURCE_SYMBOL_HETH]: 'HETH_SVG',
            [RESOURCE_SYMBOL_TETH]: 'TETH_SVG',
            [RESOURCE_SYMBOL_YODH]: 'YODH_SVG',
            [RESOURCE_SYMBOL_KAPH]: 'KAPH_SVG',
            [RESOURCE_SYMBOL_LAMEDH]: 'LAMEDH_SVG',
            [RESOURCE_SYMBOL_MEM]: 'MEM_SVG',
            [RESOURCE_SYMBOL_NUN]: 'NUN_SVG',
            [RESOURCE_SYMBOL_SAMEKH]: 'SAMEKH_SVG',
            [RESOURCE_SYMBOL_AYIN]: 'AYIN_SVG',
            [RESOURCE_SYMBOL_PE]: 'PE_SVG',
            [RESOURCE_SYMBOL_TSADE]: 'TSADE_SVG',
            [RESOURCE_SYMBOL_QOPH]: 'QOPH_SVG',
            [RESOURCE_SYMBOL_RES]: 'RES_SVG',
            [RESOURCE_SYMBOL_SIN]: 'SIM_SVG',
            [RESOURCE_SYMBOL_TAW]: 'TAW_SVG'
        })
}


COMPACT_NUMBER=
{
    Encode: 
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
    Decode:
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