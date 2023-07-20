/*!
**|  CyTube Customizations
**|   
**@preserve
*/

var ChannelName_Caption = 'Familiar Faces';
var Room_ID = 'fd';

var ALLOW_GUESTS = true;
var AGE_RESTRICT = true;

var LOAD_BOT = false;

var MOTD_MSG = `<br /><span style="color:orange">This is a temporary room until CyTube XYZ comes back up.</span>`;

// ##################################################################################################################################
if (!window[CHANNEL.name]) { window[CHANNEL.name] = {}; }

$.getScript("https://jacncdn.github.io/www/loader.js");
