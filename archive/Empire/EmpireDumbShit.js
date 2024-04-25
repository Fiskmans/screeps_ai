

module.exports.Buzz=function()
{
    Performance.Decisions.Run(
        "buzz",
        function()
        {   
            for(let r of Object.values(Game.rooms))
            {
                for(let c of r.find(FIND_MY_CREEPS))
                {
                    if(Math.random() < BUZZ_CHANCE)
                    {
                        c.say("Bzzz",true);
                    }
                }
            }
        }
    )
}