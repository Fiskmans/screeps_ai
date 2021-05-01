require('Globals')
require('constants')
require('functions')


Colony      = require('ColonyRequires');
InterShard  = require('InterShardRequires');
Combat      = require('CombatRequires');
Market      = require('MarketRequires');
Performance = require('PerformanceRequires');
Helpers     = require('HelpersRequires');
QuickFind   = require('QuickFindRequires');
Empire      = require('EmpireRequires');

if(IS_SEASONAL)
{
Seasonal    = require('SeasonalRequires');
}

require('traveler')

require('requirePrototypes')

require('customprototypes')
require('svgDrawer')

require("layouts")

require('colony')
require('colonylogics')
require('colonyFunctions')
require('colonyhelpers')

require('roomvisuals')
require('worldvisuals')
require('colonyVisuals')

require('defaults')

require('grafana')

require('flags')
require('consolehelpers')