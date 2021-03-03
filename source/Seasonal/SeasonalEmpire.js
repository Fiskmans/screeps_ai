
let C =
{
    DECODER_REQUEST_AMOUNT : 1000
}

module.exports.IsAlly = function(userName)
{
    return false;
}

module.exports.Update = function()
{
    for(let r of Object.values(Game.rooms))
    {
        if(r.controller && (r.controller.my || (r.controller.owner && this.IsAlly(r.controller.owner.userName))))
        {
            let closest = Colony.Helpers.FindClosest(r.name);
            if(closest)
            {
                for(let dec of r.find(FIND_SYMBOL_DECODERS))
                {
                    RequestResource(closest,dec.id,dec.resourceType,C.DECODER_REQUEST_AMOUNT,REQUEST_PRIORITY_PROGRESS);
                }
            }
        }
    }
}