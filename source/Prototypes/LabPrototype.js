

Object.defineProperty(StructureLab.prototype,"memory",
{
    stashed: false,

    get: function memory()
    {
        if(!this.stashed)
        {
            console.log(this.id);
            if(!Memory.labs)
            {
                Memory.labs = {};
            }
            if(!Memory.labs[this.id])
            {
                Memory.labs[this.id] = {};
            }
            this.stashed = Memory.labs[this.id];
        }

        return this.stashed;
    }
})


