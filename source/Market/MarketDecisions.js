
let minimumPrice = {
    
    [RESOURCE_ENERGY]:                          0.2,
    [RESOURCE_POWER]:                           15,
            
    [RESOURCE_HYDROGEN]:                        0.2,
    [RESOURCE_OXYGEN]:                          0.2,
    [RESOURCE_UTRIUM]:                          0.15,
    [RESOURCE_LEMERGIUM]:                       0.15,
    [RESOURCE_KEANIUM]:                         0.15,
    [RESOURCE_ZYNTHIUM]:                        0.17,
    [RESOURCE_CATALYST]:                        1.3,
    
    [RESOURCE_HYDROXIDE]:                       1.2,
    [RESOURCE_ZYNTHIUM_KEANITE]:                0.3,
    [RESOURCE_UTRIUM_LEMERGITE]:                0.5,

    [RESOURCE_GHODIUM]:                         6.2,
                
    [RESOURCE_KEANIUM_HYDRIDE]:                 0.4,
    [RESOURCE_KEANIUM_OXIDE]:                   0.2,
    [RESOURCE_UTRIUM_HYDRIDE]:                  0.4,
    [RESOURCE_UTRIUM_OXIDE]:                    0.5,
    [RESOURCE_LEMERGIUM_HYDRIDE]:               0.6,
    [RESOURCE_LEMERGIUM_OXIDE]:                 0.5,
    [RESOURCE_ZYNTHIUM_HYDRIDE]:                0.08,
    [RESOURCE_ZYNTHIUM_OXIDE]:                  0.5,
    [RESOURCE_GHODIUM_HYDRIDE]:                 0.8,
    [RESOURCE_GHODIUM_OXIDE]:                   0.3,
                
    [RESOURCE_KEANIUM_ACID]:                    1.5,
    [RESOURCE_KEANIUM_ALKALIDE]:                1.3,
    [RESOURCE_UTRIUM_ACID]:                     0.7,
    [RESOURCE_UTRIUM_ALKALIDE]:                 0.7,
    [RESOURCE_LEMERGIUM_ACID]:                  1.1,
    [RESOURCE_LEMERGIUM_ALKALIDE]:              1.3,
    [RESOURCE_ZYNTHIUM_ACID]:                   1.1,
    [RESOURCE_ZYNTHIUM_ALKALIDE]:               2.4,
    [RESOURCE_GHODIUM_ACID]:                    2.1,
    [RESOURCE_GHODIUM_ALKALIDE]:                1.7,
  
    [RESOURCE_CATALYZED_KEANIUM_ACID]:          12,
    [RESOURCE_CATALYZED_KEANIUM_ALKALIDE]:      6.5,
    [RESOURCE_CATALYZED_UTRIUM_ACID]:           3.5,
    [RESOURCE_CATALYZED_UTRIUM_ALKALIDE]:       0.7,
    [RESOURCE_CATALYZED_LEMERGIUM_ACID]:        1.6,
    [RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE]:    5.6,
    [RESOURCE_CATALYZED_ZYNTHIUM_ACID]:         2.6,
    [RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE]:     6.5,
    [RESOURCE_CATALYZED_GHODIUM_ACID]:          9.5,
    [RESOURCE_CATALYZED_GHODIUM_ALKALIDE]:      8,

    [RESOURCE_OXIDANT]:                         1.8,
    [RESOURCE_REDUCTANT]:                       1.8,
    [RESOURCE_ZYNTHIUM_BAR]:                    0.6,
    [RESOURCE_LEMERGIUM_BAR]:                   0.3,
    [RESOURCE_UTRIUM_BAR]:                      0.45,
    [RESOURCE_KEANIUM_BAR]:                     0.25,
    [RESOURCE_PURIFIER]:                        3.4,
    [RESOURCE_GHODIUM_MELT]:                    8.7,

    [RESOURCE_SILICON]:                         10.2,

    [RESOURCE_WIRE]:                            390,
    [RESOURCE_SWITCH]:                          1800,
    [RESOURCE_TRANSISTOR]:                      4500,
    [RESOURCE_MICROCHIP]:                       45000,
    [RESOURCE_CIRCUIT]:                         110000,
    [RESOURCE_DEVICE]:                          200000,
    
    [RESOURCE_METAL]:                           18,

    [RESOURCE_ALLOY]:                           230,
    [RESOURCE_TUBE]:                            4300,
    [RESOURCE_FIXTURES]:                        9000,
    [RESOURCE_FRAME]:                           42000,
    [RESOURCE_HYDRAULICS]:                      140000,
    [RESOURCE_MACHINE]:                         300000,

    [RESOURCE_BIOMASS]:                         16,

    [RESOURCE_CELL]:                            210,
    [RESOURCE_PHLEGM]:                          2200,
    [RESOURCE_TISSUE]:                          13000,
    [RESOURCE_MUSCLE]:                          50000,
    [RESOURCE_ORGANOID]:                        120000,
    [RESOURCE_ORGANISM]:                        270000,
    
    [RESOURCE_MIST]:                            9,

    [RESOURCE_CONDENSATE]:                      108,
    [RESOURCE_CONCENTRATE]:                     1500,
    [RESOURCE_EXTRACT]:                         9000,
    [RESOURCE_SPIRIT]:                          30000,
    [RESOURCE_EMANATION]:                       90000,
    [RESOURCE_ESSENCE]:                         140000,
    
    [RESOURCE_OPS]:                             1.1,
    [RESOURCE_BATTERY]:                         0.8,
    [RESOURCE_COMPOSITE]:                       4.1,
    [RESOURCE_CRYSTAL]:                         11,
    [RESOURCE_LIQUID]:                          3.5,
}


let GetMinimumSell=function(resource)
{
    if(!minimumPrice[resource])
    {
        return false;
    }
    return minimumPrice[resource];
}

let GetLimits=function(resource)
{
    if(!RESOURCE_TYPES[resource])
    {
        return false;
    }
    return MARKET_RESOURCE_LIMITS[RESOURCE_TYPES[resource]]
}

module.exports.Selling=function(colony)
{
    if(Game.time % MARKET_SELL_REFRESH_INTERVAL != 0) { return; }
    let room = Game.rooms[colony.pos.roomName];
    if(!room.storage)   { return; }
    if(!room.terminal)  { return; }

    let selling = [];
    let dumping = [];
    let resources = {};
    Helpers.Resources.FindAll(room,resources);
    for(let res of Object.keys(resources))
    {
        let limits = GetLimits(res);
        if(!limits)
        {
            console.log("No Resource limits for: " + res);
            continue;
        }

        if(resources[res] > limits.dump)
        {
            if(Market.Prices.ToSell(res,room.name) > 0)
            {
                selling.push(res);
            }
            else
            {
                dumping.push(res);
            }
        }
        else if(resources[res] > limits.sell)
        {
            let minimumSell = GetMinimumSell(res);
            if(!minimumSell)
            {
                console.log("No minimum sell for: " + res);
                continue;
            }
            if(Market.Prices.ToSell(res,room.name) > GetMinimumSell(res))
            {
                selling.push(res);
            }
        }
    }
    colony.selling = selling;
    colony.dumping = dumping;
}