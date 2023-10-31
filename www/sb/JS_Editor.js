/*!
**|  CyTube Customizations
**|   
**@preserve
*/

var ChannelName_Caption = 'Solo Beauty';
var Room_ID = 'sb';
var BOT_NICK = 'LarryFlynt';

var ALLOW_GUESTS = true;
var AGE_RESTRICT = true;
var MOTD_BTNS = true;

var ROOM_ANNOUNCEMENT = `<br />` +
  `The original <strong>Solo Beauty</strong> room was mysteriously deleted on October 29th probably by the room owner.<br />` +
  `We are trying to recreate this popular room for <em>your</em> enjoyment.&nbsp; Please be patient.<br />` +
  `<br />` +
  `If you are interested in being a <span style="color:Blue">Moderator</span>, have a Comment or <em>Constructive</em> Criticism,<br />` +
  `please contact <a style="font-weight:Bold" href="mailto:admin@jackandchat.net">admin@jackandchat.net</a></span><br />` +
  ``;

// ##################################################################################################################################
if (!window[CHANNEL.name]) { window[CHANNEL.name] = {}; }

$.getScript("https://jacncdn.github.io/www/loader.js");
