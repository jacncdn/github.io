/*!
**|  CyTube Customizations
**|   
**@preserve
*/

var ChannelName_Caption = 'Solo Beauty';
var Room_ID = 'sb';

var ALLOW_GUESTS = true;
var AGE_RESTRICT = true;
var MOTD_BTNS = false;

var MOTD_MSG = `<br /><span style="color:orange">Looking for room moderators. <a href="mailto:admin@jackandchat.net">Apply here.</a></span>`;

// ##################################################################################################################################
if (!window[CHANNEL.name]) { window[CHANNEL.name] = {}; }

$.getScript("https://jacncdn.github.io/www/loader.js");
