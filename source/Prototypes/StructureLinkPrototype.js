
let C =
{
    BATCH_SIZE:Math.floor(1/LINK_LOSS_RATIO)
}

StructureLink.prototype.TransferOptimal=function(other)
{
    if(!(other instanceof StructureLink))
    {
        Helpers.Externals.Notify("Other was not link",true);
        return ERR_INVALID_TARGET;
    }

    let max = Math.min(this.store.getUsedCapacity(RESOURCE_ENERGY),other.store.getFreeCapacity(RESOURCE_ENERGY))
    if(max <= C.BATCH_SIZE)
    {
        return ERR_NOT_ENOUGH_ENERGY;
    }
    let amount = Math.floor(max/C.BATCH_SIZE) * C.BATCH_SIZE;

    let result = this.transferEnergy(other,amount);

    this.store[RESOURCE_ENERGY] = (this.store[RESOURCE_ENERGY] || 0) - amount;
    other.store[RESOURCE_ENERGY] = (other.store[RESOURCE_ENERGY] || 0) + amount;
    return result;
}