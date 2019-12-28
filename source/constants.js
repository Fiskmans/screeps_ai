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
COLONY_RETARGET_SELLING_INTERVAL = 13
COLONY_RETARGET_FACTORY_INTERVAL = 17
MARKETING_ENERGY_LOWER_LIMIT = 50000
MARKETING_STOCK_ENERGY = 30000
MARGETING_STOCK_OTHER = 10000
MARKETING_IMPORT_LEVEL = 5000
FACTORY_NUMBER_OF_CRAFTS_TO_STOCK = 6
FACTORY_ENERGY_TO_LEAVE_IN_STORAGE = 60000

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
    "https://youtu.be/dQw4w9WgXcQ"
    ]

ALWAYSPROFITABLE = 200
MinimumSellingPrice = 
{
    [RESOURCE_ENERGY]:0.05,
    [RESOURCE_OXYGEN]:0.036,
    [RESOURCE_HYDROGEN]:0.034,
    [RESOURCE_ZYNTHIUM]:0.036,
    [RESOURCE_LEMERGIUM]:0.068,
    [RESOURCE_UTRIUM]:0.038,
    [RESOURCE_KEANIUM]:0.038,
    [RESOURCE_CATALYST]:0.110,
    [RESOURCE_GHODIUM_OXIDE]:0.023,
    [RESOURCE_POWER]:0.57,
    [RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE]:0.46,

    [RESOURCE_OXIDANT]:         0.22,
    [RESOURCE_REDUCTANT]:       0.25,
    [RESOURCE_ZYNTHIUM_BAR]:    0.26,
    [RESOURCE_LEMERGIUM_BAR]:   0.500,
    [RESOURCE_UTRIUM_BAR]:      0.200,
    [RESOURCE_KEANIUM_BAR]:     0.200,
    [RESOURCE_PURIFIER]:        0.87,
    [RESOURCE_GHODIUM_MELT]:    2.0,
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


let xml  = require("xmlParser");
let ParseStyle=function(string)
{
    let out = {};
    let key = "";
    let value = "";
    let readingKey = true;
    for(let i = 0;i < string.length;i++)
    {
        let char = string[i];
        if(readingKey)
        {
            if(char == ':')
            {
                readingKey = false;
            }
            else
            {
                key += char;
            }
        }
        else
        {
            if(char == ';')
            {
                out[key] = value;
                readingKey = true;
                key = "";
                value = "";
            }
            else
            {
                value += char;
            }
        }
    }
    return out;
}

let readNumber=function(at,string)
{
    let out = {};
    let data = "";
    for(let i = at;i < string.length; i++)
    {
        let char = string[i];
        if(char != " " && char != ",")
        {
            data += char;
        }
        else
        {
            out.value = parseFloat(data);
            out.jumpTo = i;
            if(isNaN(out.value))
            {
                console.log(data)
            }
            return out;
        }
    }
    out.value = 0;
    out.jumpTo = string.length;
    return out;
}

let readPoint=function(at,string)
{
    let out = {};
    let x = readNumber(at,string);
    at = x.jumpTo;
    if(string[at] == ",") {at++};
    let y = readNumber(at,string);

    out.value = [x.value,y.value];
    out.jumpTo = y.jumpTo;
    return out;
}

let ParsePoly=function(string)
{
    let out = [];
    let cursor = [0,0];
    let argumentStarts = ["-","0",".","1","2","3","4","5","6","7","8","9"]
    let lastCommand = "l";
    for(let i = 0; i < string.length; i++)
    {
        let command = string[i];
        if(command != " ")
        {
            if(argumentStarts.includes(command))
            {
                command = lastCommand;
            }
            else
            {
                i++;
                for(; i < string.length; i++) { if(string[i]!= " ") { break; } }
                lastCommand = command;        
            }
            switch(command)
            {
                case "h":
                    {
                        let dx = readNumber(i,string);
                        i = dx.jumpTo;
                        cursor[0] += dx.value;
                        out.push([cursor[0],cursor[1]]);
                    }
                    break;
                case "H":
                    {
                        let x = readNumber(i,string);
                        i = x.jumpTo;
                        cursor[0] = x.value;
                        out.push([cursor[0],cursor[1]]);
                    }
                    break;
                    
                case "v":
                    {
                        let dy = readNumber(i,string);
                        i = dy.jumpTo;
                        cursor[1] += dy.value;
                        out.push([cursor[0],cursor[1]]);
                    }
                    break;
                case "V":
                    {
                        let y = readNumber(i,string);
                        i = y.jumpTo;
                        cursor[1] = y.value;
                        out.push([cursor[0],cursor[1]]);
                    }
                    break;

                case "m":
                    {
                        let d = readPoint(i,string);
                        i = d.jumpTo;
                        cursor[0] += d.value[0];
                        cursor[1] += d.value[1];
                        out.push([cursor[0],cursor[1]]);
                        lastCommand = "l";
                    }
                    break;
                case "M":
                    {
                        let d = readPoint(i,string);
                        i = d.jumpTo;
                        cursor[0] = d.value[0];
                        cursor[1] = d.value[1];
                        out.push([cursor[0],cursor[1]]);
                        lastCommand = "L"
                    }
                    break;
                
                case "L":
                    {
                        let d = readPoint(i,string);
                        i = d.jumpTo;
                        cursor[0] = d.value[0];
                        cursor[1] = d.value[1];
                        out.push([cursor[0],cursor[1]]);
                    }
                    break;

                case "l":
                    {
                        let d = readPoint(i,string);
                        i = d.jumpTo;
                        cursor[0] += d.value[0];
                        cursor[1] += d.value[1];
                        out.push([cursor[0],cursor[1]]);
                    }
                    break;
                    
                case "C":
                    {
                        let c1 = readPoint(i,string);
                        i = c1.jumpTo + 1;
                        let c2 = readPoint(i,string);
                        i = c2.jumpTo + 1;
                        let t = readPoint(i,string);
                        i = t.jumpTo;
                        
                        out = out.concat(BezierFragment(5,[cursor, c1.value,c2.value,t.value]))

                        cursor[0] = t.value[0];
                        cursor[1] = t.value[1];
                        //out.push([cursor[0],cursor[1]]);
                    }
                    break;
                    
                case "c":
                    {
                        let c1 = readPoint(i,string);
                        i = c1.jumpTo + 1;
                        let c2 = readPoint(i,string);
                        i = c2.jumpTo + 1;
                        let t = readPoint(i,string);
                        i = t.jumpTo;
                        
                        c1.value[0] += cursor[0];
                        c1.value[1] += cursor[1];
                        c2.value[0] += cursor[0];
                        c2.value[1] += cursor[1];
                        t.value[0] += cursor[0];
                        t.value[1] += cursor[1];
                        out = out.concat(BezierFragment(5,[cursor, c1.value,c2.value,t.value]))
                        cursor[0] = t.value[0];
                        cursor[1] = t.value[1];
                        //out.push([cursor[0],cursor[1]]);
                    }
                    break;

                case "z":
                case "Z":
                    out.push(_.first(out));
                    break;
            }
        }
    }
    return out;
}
let ParseSVG=function(fileName)
{
    let data = require(fileName);
    let object = xml.parseFromString(""+data)

    let out = [];
    object.forEach((element) =>
    {
        if(element.type == "element")
        {

            switch(element.tagName.replace("\n",""))
            {
            case "rect":
                {

                    let layer = {};
                    layer.type = VISUALTYPE_RECT
                    let attr = element.attributes;
                    layer.x = attr.x;
                    layer.y = attr.y;
                    layer.width = attr.width;
                    layer.height = attr.height;
                    
                    let style = ParseStyle(attr.style);
                    
                    layer.fill = style.fill
                    layer.opacity = style["fill-opacity"]||1;

                    layer.stroke = style.stroke;
                    layer.strokeWidth = style["stroke-width"];
                    out.push(layer)
                }
                break;
            case "path":
                {
                    let layer = {};
                    layer.type = VISUALTYPE_POLY
                    let attr = element.attributes;
                    layer.poly = ParsePoly(attr.d)
                    
                    let style = ParseStyle(attr.style);
                    
                    layer.fill = style.fill
                    layer.opacity = style["fill-opacity"]||1;
                    layer.stroke = style.stroke;
                    layer.strokeWidth = style["stroke-width"];
                    out.push(layer)
                }
                break;
            case "circle":
                {
                    let layer = {};
                    layer.type = VISUALTYPE_CIRCLE
                    let attr = element.attributes;
                    layer.x = parseFloat(attr.cx)
                    layer.y = parseFloat(attr.cy)
                    layer.radius = parseFloat(attr.r);
                    
                    let style = ParseStyle(attr.style);
                    
                    layer.fill = style.fill
                    layer.opacity = style["fill-opacity"];
                    layer.stroke = style.stroke;
                    layer.strokeWidth = style["stroke-width"];
                    out.push(layer)
                }
                break;
            }
        }
    })
    return out;
}

RESOURCE_UNIQUE_ICONS=
{
    [RESOURCE_SILICON]:ParseSVG("RESOURCE_SILICON_SVG"),

    [RESOURCE_METAL]:ParseSVG("RESOURCE_METAL_SVG"),

    [RESOURCE_BIOMASS]:ParseSVG("RESOURCE_BIOMASS_SVG"),

    [RESOURCE_MIST]:ParseSVG("RESOURCE_MIST_SVG"),
    
    [RESOURCE_OPS]:ParseSVG("RESOURCE_OPS_SVG"),
    [RESOURCE_BATTERY]:ParseSVG("RESOURCE_BATTERY_SVG"),
    [RESOURCE_COMPOSITE]:ParseSVG("RESOURCE_COMPOSITE_SVG"),
    [RESOURCE_CRYSTAL]:ParseSVG("RESOURCE_CRYSTAL_SVG"),
    [RESOURCE_LIQUID]:ParseSVG("RESOURCE_LIQUID_SVG")
}