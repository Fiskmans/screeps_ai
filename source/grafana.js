UpdateGrafanaStats=function()
{
    Memory.stats.tick = Game.time;
    Memory.stats.bucket = Game.cpu.bucket;
}