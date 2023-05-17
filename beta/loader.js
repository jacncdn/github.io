/*!
**|  JS Library Loader
**|
**@preserve
*/
/* jshint esversion:6 */
/* jshint strict:true */
/* jshint curly:true */
/* jshint eqeqeq:true */
/* jshint varstmt:true */

/* jshint undef:true */
/* globals $, socket, CHANNEL */

if (!window[CHANNEL.name]) { window[CHANNEL.name] = {}; }

//  Channel Settings->Edit->JavaScript: $.getScript("{root}/www/loader.js");

// Defaults
let START = Date.now();
if (typeof CUSTOM_LOADED === "undefined") { let CUSTOM_LOADED = false; }
if (typeof ChannelName_Caption === "undefined") { let ChannelName_Caption = CHANNELNAME; }
if (typeof Room_ID === "undefined") { let Room_ID = "jac"; }
if (typeof ALLOW_GUESTS === "undefined") { let ALLOW_GUESTS = true; }
if (typeof MUTE_GUESTS === "undefined") { let MUTE_GUESTS = false; }
if (typeof AGE_RESTRICT === "undefined") { let AGE_RESTRICT = true; }
if (typeof CHANNEL_DEBUG === "undefined") { let CHANNEL_DEBUG = false; }
if (typeof BETA_USER === "undefined") { let BETA_USER = false; }
if (typeof BETA_USERS === "undefined") { let BETA_USERS = []; }

if (typeof ROOM_ANNOUNCEMENT === "undefined") { let ROOM_ANNOUNCEMENT = ""; }
if (typeof MOD_ANNOUNCEMENT === "undefined") { let MOD_ANNOUNCEMENT = ""; }
if (typeof CLEAR_MSG === "undefined") { let CLEAR_MSG = ""; }
if (typeof MOTD_MSG === "undefined") { let MOTD_MSG = ""; }

// ----------------------------------------------------------------------------------------------------------------------------------
if (typeof LOAD_BOT === "undefined") { let LOAD_BOT = false; }
if (typeof PERIODIC_CLEAR === "undefined") { let PERIODIC_CLEAR = false; }
if (typeof BOT_NICK === "undefined") { let BOT_NICK = "JackAndChatBot"; }
let IMABOT = (CLIENT.name.toLowerCase() === BOT_NICK.toLowerCase());

if (!IMABOT) { 
  if ((window.CLIENT.rank >= Rank.Moderator) || (BETA_USERS.includes(CLIENT.name.toLowerCase()))) { 
    BETA_USER = true; 
  }
}

// ##################################################################################################################################

let Root_URL = "https://jacncdn.github.io/";
let Base_URL = Root_URL + "www/";

if (Room_ID.toLowerCase() === 'jac') { // Alpha Debug Room
  CHANNEL_DEBUG = true;

  Base_URL = Base_URL.replace("/www/", "/beta/");
  
  if (IMABOT) {
    window.localStorage.clear();
  }
}

// ----------------------------------------------------------------------------------------------------------------------------------

let Room_URL = Base_URL + Room_ID + "/";

let Emotes_URL = Root_URL + 'emoji/emoji.json';

let Options_URL = Base_URL + 'options.json';
let Permissions_URL = Base_URL + 'permissions.json';
let Buttons_URL = Base_URL + 'motd-btns.html';
let Footer_URL = Base_URL + 'footer.html';
let BlockerCSS_URL = Base_URL + 'blocker.css';

let Logo_URL =  Room_URL + "logo.png";
let Favicon_URL = Room_URL + "favicon.png";
let CustomCSS_URL = Room_URL + 'custom.css';
let Filters_URL = Room_URL + 'filters.json';
let MOTD_URL = Room_URL + 'motd.html';

// ##################################################################################################################################

window[CHANNEL.name].jsScriptsIdx = 0;
window[CHANNEL.name].jsScripts = [
  Base_URL + "common.js",
  Base_URL + "showimg.js"
];

// ----------------------------------------------------------------------------------------------------------------------------------
const jsScriptsLoad = function() { // Load Javascripts in order
  'use strict';
  if (window[CHANNEL.name].jsScriptsIdx < window[CHANNEL.name].jsScripts.length) {
    let filename = window[CHANNEL.name].jsScripts[window[CHANNEL.name].jsScriptsIdx];

    $.getScript(filename)
      .done(function(script, textStatus) {
        window.console.log("loader.getScript " + filename + ": " + textStatus );
        window[CHANNEL.name].jsScriptsIdx++;
        jsScriptsLoad();  // Recurse
      })
      .fail(function(jqxhr, settings, exception) {
        if (arguments[0].readyState === 0) {
          window.console.error(filename + " FAILED to load!");
        } else {
          window.console.error(filename + " loaded but FAILED to parse! " + arguments[2].toString());
        }
      });
  }
};

// ----------------------------------------------------------------------------------------------------------------------------------
const loadCSS = function(id, filename) {
  'use strict';
  try {
    $("head").append('<link rel="stylesheet" type="text/css" id="' + id + '" href="' + filename + '?ac=' + START + '" />');
  } catch (e) {
    window.console.error("loader.loadCSS error: " + filename + " - " + JSON.stringify(e));
  }
};

// ##################################################################################################################################

/*  window.CLIENT.rank
  Rank.Guest: 0
  Rank.Member: 1
  Rank.Leader: 1.5
  Rank.Moderator: 2
  Rank.Admin: 3
  Rank.Owner: 10
  Rank.Siteadmin: 255
*/

if (!CUSTOM_LOADED) { // Load Once 
  CUSTOM_LOADED = true;
  
  if (window.CLIENT.rank > Rank.Moderator) { // At least Owner
    window[CHANNEL.name].jsScripts.push(Base_URL + "defaults.js");
    window[CHANNEL.name].jsScripts.push(Base_URL + "betterpm.js");
  }

  if (!ALLOW_GUESTS && (window.CLIENT.rank > Rank.Guest)) {
    window[CHANNEL.name].jsScripts.push(Base_URL + "noguests.js");
  }

  if (IMABOT) {
    if (CHANNEL_DEBUG) {
      window[CHANNEL.name].jsScripts.push(Base_URL + "dbLocal.js");
    }
    window[CHANNEL.name].jsScripts.push(Base_URL + "roombot.js");
  }

  if (BETA_USER) { 
  }

  jsScriptsLoad();

  // ----------------------------------------------------------------------------------------------------------------------------------
  $(document).ready(()=>{
    'use strict';
    $(".navbar-brand").replaceWith('<span class="navbar-brand">' + ChannelName_Caption + "</span>");
    $("ul.navbar-nav li:contains('Home')").remove();
    $("ul.navbar-nav li:contains('Discord')").remove();
    
    loadCSS("basecss", Base_URL + "base.css");
    
    $("#chanexternalcss").remove(); // No Conflicts
    
    $("#chancss").remove(); // No Conflicts
    loadCSS("chancss", CustomCSS_URL);
  });
}

// ##################################################################################################################################
/* End of Script */
