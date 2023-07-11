/*!
**|  CyTube Enhancements: Common
**|
**@preserve
*/

// https://jshint.com
/* jshint esversion:6 */
/* jshint strict:true */
/* jshint curly:true */
/* jshint eqeqeq:true */
/* jshint varstmt:true */

/* jshint undef:true */
/* globals $, socket, CHANNEL, CLIENT, Rank, CHATTHROTTLE, IGNORED, USEROPTS, initPm, pingMessage, formatChatMessage, Callbacks */
/* globals videojs, CHANNEL_DEBUG, BOT_NICK, IMABOT, MOTD_MSG */

if (!window[CHANNEL.name]) { window[CHANNEL.name] = {}; }

// Global Variables
var $chatline = $("#chatline");
var $currenttitle = $("#currenttitle");
var $messagebuffer = $("#messagebuffer");
var $userlist = $("#userlist");
var $voteskip = $("#voteskip");
var $ytapiplayer = $("#ytapiplayer");
var _vPlayer = videojs("ytapiplayer");
var messageExpireTime = 1000 * 60 * 2;
var chatExpireTime = 1000 * 60 * 60 * 2;

// ##################################################################################################################################

const isNullOrEmpty = function(data) {
  'use strict';
  if (typeof data === 'undefined') { return true; }
  return !(data);
};

function Sleep(sleepMS) {
  'use strict';
  // USE: await Sleep(2000);
  return new Promise(resolve => setTimeout(resolve, sleepMS));
}

// ----------------------------------------------------------------------------------------------------------------------------------

const timeString = function(datetime) {
   'use strict';
  if (!(datetime instanceof Date)) { datetime = new Date(datetime); }
  
  let now = new Date();
  let localDT = new Intl.DateTimeFormat('default', {
      month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    }).format(datetime);
    
  let parts = localDT.split(/[\s,]+/);
  let tsStr = parts[1];
  if (datetime.toDateString() !== now.toDateString()) { tsStr = parts[0] + " " + tsStr; }

  return "[" + tsStr + "]";
};

const formatConsoleMsg = function(desc, data) {
  'use strict';
  let msg = desc;
  if ((typeof data !== 'undefined') && (data)) {
    msg += ': ' + JSON.stringify(data, null, 2);
  }

  return "[" + new Date().toTimeString().split(" ")[0] + "] " + msg;
};

const logTrace = function(desc, data) {
  'use strict';
  window.console.log(formatConsoleMsg(desc));

  if (CHANNEL_DEBUG && (typeof data !== 'undefined') && (data)) {
    window.console.debug(JSON.stringify(data, null, 2));
  }
};

// Send debug msg to console
const debugData = function(desc, data) {
  'use strict';
  if (!CHANNEL_DEBUG) { return; }
  window.console.debug(formatConsoleMsg(desc, data));
};

// Send error msg to console
const errorData = function(desc, data) {
  'use strict';
  window.console.error(formatConsoleMsg(desc, data));
};

// Send log msg to console
const logData = function(desc, data) {
  'use strict';
  window.console.log(formatConsoleMsg(desc, data));
};

// Admin Debugger
const debugListener = function(eventName, data) { 
  'use strict';
  if (eventName.toLowerCase() === "mediaupdate") { return; }
  window.console.info(formatConsoleMsg(eventName, data));
};

// ##################################################################################################################################

const hmsToSeconds = function(hms) {
  'use strict';
  let part = hms.split(':'), secs = 0, mins = 1;
  while (part.length > 0) {
    secs += (mins * parseInt(part.pop(), 10));
    mins *= 60;
  }
  return secs;
};

const secondsToHMS = function(secs) {
  'use strict';
  let start = 15;
       if (secs >= 36000) { start = 11; }
  else if (secs >= 3600)  { start = 12; }
  else if (secs >= 600)   { start = 14; }
  return new Date(secs * 1000).toISOString().substring(start, 19);
};

// ##################################################################################################################################

// JQuery Wait for an HTML element to exist
const waitForElement = function(selector, callback, checkFreqMs, timeoutMs) {
  'use strict';
  let startTimeMs = Date.now();
  (function loopSearch() {
    if ($(selector).length) {
      callback();
      return;
    }
    else {
      setTimeout(()=>{
        if (timeoutMs && ((Date.now() - startTimeMs) > timeoutMs)) { return; }
        loopSearch();
      }, checkFreqMs);
    }
  })();
};

// ##################################################################################################################################

// Get User from UserList
const getUser = function(name) {
  'use strict';
  let user = null;
  $("#userlist .userlist_item").each(function(index, item) {
    let data = $(item).data();
    if (data.name.toLowerCase() === name.toLowerCase()) { user = data; }
  });
  return user;
};

// Is User Idle?
const isUserAFK = function(name) {
  'use strict';
  let afk = false;
  let user = getUser(name);
  if (!user) { afk = false; } else { afk = user.meta.afk; }
  return afk;
};

// ##################################################################################################################################

// Remove Video on KICK
window.socket.on("disconnect", function(msg) {
  'use strict';
  if (!window.KICKED) { return; }
  removeVideo(event);  
});

// ##################################################################################################################################

//  Room Announcements
const roomAnnounce = function(msg) { 
  'use strict';
  if (msg.length < 1) { return; }
  if (window.CLIENT.rank < Rank.Member) { return; }
  if (BOT_NICK.toLowerCase() === CLIENT.name.toLowerCase()) { return; }

  $(function() {
    makeAlert("Message from Admin", msg).attr("id","roomAnnounce").appendTo("#announcements");
  });
};

//  Moderator Announcements
const modAnnounce = function(msg) { 
  'use strict';
  if (msg.length < 1) { return; }
  if (window.CLIENT.rank < Rank.Moderator) { return; }
  if (BOT_NICK.toLowerCase() === CLIENT.name.toLowerCase()) { return; }
    
  $(function() {
    makeAlert("Moderators", msg).attr("id","modAnnounce").appendTo("#announcements");
  });
};

// ##################################################################################################################################

// Remove Video URLs
const hideVideoURLs = function() {
  'use strict';
  setTimeout(()=>{
    $(".qe_title").each(function(idx,data) {data.replaceWith(data.text);});
    if (window.CLIENT.rank > Rank.Member) {
      $("#queue li.queue_entry div.btn-group").hide();
    }
  }, 2000);  
};

if (window.CLIENT.rank < Rank.Moderator) {
  window.socket.on("changeMedia", hideVideoURLs);
  window.socket.on("playlist", hideVideoURLs); //
  window.socket.on("setPlaylistMeta", hideVideoURLs);
  window.socket.on("shufflePlaylist", hideVideoURLs);
}

// ##################################################################################################################################

// Change the Video Title

window[CHANNEL.name].VideoInfo = {title: "None", current: 0, duration: 0};

var VIDEO_TITLE = {title: "None", current: 0, duration: 0};

const setVideoTitle = function() {
  'use strict';
  if (VIDEO_TITLE.duration < 1) { VIDEO_TITLE.duration = VIDEO_TITLE.current; }
  let remaining = Math.round(VIDEO_TITLE.duration - VIDEO_TITLE.current);
  $currenttitle.html("Playing: <strong>" + VIDEO_TITLE.title + "</strong> &nbsp; (" + secondsToHMS(remaining) + ")");  
};

window.socket.on("mediaUpdate", (data)=>{
  'use strict';
  // debugData('common.mediaUpdate', data);

  if ((window.PLAYER) && (window.PLAYER.player) && (window.PLAYER.player.error_)) {
    refreshVideo();
    return;
  }
  
  VIDEO_TITLE.current = data.currentTime;
  setVideoTitle();
});

const refreshVideo = function() {
  'use strict';
  debugData("common.refreshVideo", window.CurrentMedia);

  if (window.PLAYER) { 
    PLAYER.mediaType = "";
    PLAYER.mediaId = "";
  } else if (typeof window.CurrentMedia !== 'undefined') {
    window.loadMediaPlayer(window.CurrentMedia);
  }
  
  // playerReady triggers server to send changeMedia which reloads player
  window.socket.emit('playerReady');
};

// Player Error Reload
const videoFix = function() {
  'use strict';
  debugData("common.videoFix");
  
  let vplayer = videojs('ytapiplayer');
  vplayer.on("error", function(e) {
    errorData("common.Reloading Player", e);
    vplayer.createModal("ERROR: Reloading player!");
    
    window.setTimeout(function() { refreshVideo(); }, 2000);
  });
};

function videoErrorHandler(event) {
  'use strict';
  errorData('common.videoErrorHandler', event);
  refreshVideo();
}

window.socket.on('changeMedia', (data)=>{
  'use strict';
  debugData("common.changeMedia", data);
  window.CurrentMedia = data;
  VIDEO_TITLE.title = data.title;
  VIDEO_TITLE.current = data.currentTime;
  VIDEO_TITLE.duration = data.seconds;
  setVideoTitle();

  waitForElement('#ytapiplayer', ()=>{
    let newVideo = document.getElementById('ytapiplayer');
    if (newVideo) { newVideo.addEventListener('error', videoErrorHandler, true); }
  }, 100, 10000);
});

// ##################################################################################################################################

// Turn AFK off if PMing
const pmAfkOff = function(data) {
  'use strict';
  if (isUserAFK(CLIENT.name)) {window.socket.emit("chatMsg", { msg: "/afk" });}
};
if (window.CLIENT.rank < Rank.Admin) { window.socket.on("pm", pmAfkOff); } // Below Admin

// ##################################################################################################################################

// Auto Expire Messages
const autoMsgExpire = function() {
  'use strict';
  // Mark Server Messages
  $messagebuffer.find("[class^=chat-msg-\\\\\\$]:not([data-expire])").each(function() { $(this).attr("data-expire", Date.now() + messageExpireTime);});
  $messagebuffer.find("[class^=server-msg]:not([data-expire])").each(function() { $(this).attr("data-expire", Date.now() + messageExpireTime);});
  $messagebuffer.find("div.poll-notify:not([data-expire])").attr("data-expire", Date.now() + (messageExpireTime * 2));

  if (window.CLIENT.rank < Rank.Moderator) { // Mark Chat Messages
    $messagebuffer.find("[class*=chat-shadow]:not([data-expire])").each(function() { $(this).attr("data-expire", Date.now() + messageExpireTime);});
    $messagebuffer.find("[class*=chat-msg-]:not([data-expire])").each(function() { $(this).attr("data-expire", Date.now() + chatExpireTime);});
  }
  
  // Remove Expired Messages
  $messagebuffer.find("div[data-expire]").each(()=>{
      if (Date.now() > parseInt($(this).attr("data-expire"))) { 
        $(this).remove();
      }});

  if (document.hidden) { // delay if hidden
    $messagebuffer.find("div[data-expire]").each(function() {
      $(this).attr("data-expire", parseInt($(this).attr("data-expire")) + 400);
    });
  }
};

// ##################################################################################################################################

const cacheEmotes = function() {
  'use strict';
  for (let loop = 0; (loop < CHANNEL.emotes.length); loop++) {
    let _img = document.createElement('img');
    _img.src = CHANNEL.emotes[loop].image;
    _img.onerror = function() {
      window.console.error("Error loading '" + this.src + "'");
    };
  }
};

// ##################################################################################################################################

window[CHANNEL.name].commonMotd = "";

const setCustomMOTD = function() {
  'use strict';
  CHANNEL.motd += window[CHANNEL.name].commonMotd;
  $("#motd").html(CHANNEL.motd);

  if (MOTD_MSG === null) { return; }
  if (MOTD_MSG.length < 1) { return; }
  $("#motd div:first").append(MOTD_MSG);
};

const getCustomMOTD = function() {
  'use strict';
  $.ajax({
    url: Buttons_URL,
    type: 'GET',
    datatype: 'text',
    cache: false,
    error: function(data) {
      errorData('common.getCustomMOTD Error', data.status + ": " + data.statusText);
    },
    success: function(data) {
      debugData("common.getCustomMOTD", data);
      window[CHANNEL.name].commonMotd = data;
      setCustomMOTD();
    }
  });
};

window.socket.on("setMotd", (data)=>{
  'use strict';
  debugData("common.socket.on(setMotd)", data);
  setCustomMOTD();
});

// ##################################################################################################################################

const getFooter = function() {
  'use strict';
  $.ajax({
    url: Footer_URL,
    type: 'GET',
    datatype: 'text',
    cache: false,
    error: function(data) {
      errorData('common.getFooter Error', data.status + ": " + data.statusText);
    },
    success: function(data) {
      debugData("common.getFooter", data);
      $("p.credit").html(data);
    }
  });
};

// ##################################################################################################################################

const makeNoRefererMeta = function() {
  'use strict';
  let meta = document.createElement('meta');
  meta.name = 'referrer';
  meta.content = 'no-referrer';
  document.head.append(meta);
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

//  DOCUMENT READY
$(document).ready(function() {
  'use strict';
  getFooter();

  if (window.CLIENT.rank < Rank.Moderator) { hideVideoURLs(); }
  
  getCustomMOTD();

  // Move Title to full width
  $('<div id="titlerow" class="row" />').insertBefore("#main").html($("#videowrap-header").detach());
  VIDEO_TITLE.title = $currenttitle.text().replace("Currently Playing: ", "");
  setVideoTitle();
  
  $('#plonotification').remove();
  $('#plmeta').insertBefore("#queue");

  $('<link id="roomfavicon" href="' + Favicon_URL + '?ac=' + START + '" type="image/x-icon" rel="shortcut icon" />').appendTo("head");

  if (ROOM_ANNOUNCEMENT !== null) { roomAnnounce(ROOM_ANNOUNCEMENT); }
  if (MOD_ANNOUNCEMENT !== null) { modAnnounce(MOD_ANNOUNCEMENT); }
  setTimeout(()=>{$("#announcements").fadeOut(800, ()=>{$(this).remove();});}, 90000);

  if ((typeof ADVERTISEMENT !== "undefined") &&
      (window.CLIENT.rank < Rank.Moderator)) { 
    $("#customembed").before('<div id="adwrap" class="col-lg-7 col-md-7"' + ADVERTISEMENT + '</div>');
  }

  // Enhanced PM Box
  window.socket.on("addUser", (data)=>{
    $("#pm-" + data.name + " .panel-heading").removeClass("pm-gone");
    if (BOT_NICK.toLowerCase() !== CLIENT.name.toLowerCase()) {
      setTimeout(()=>{ $(".userlist_owner:contains('"+ BOT_NICK + "')").parent().css("display","none"); }, 6000);
    }
  });

  window.socket.on("userLeave", (data)=>{ 
    $("#pm-" + data.name + " .panel-heading").addClass("pm-gone"); 
  });
  
  $(window).on("focus", ()=>{
    $("#chatline").focus();    
  });

  window.setInterval(()=>{  // Check every second
    autoMsgExpire();
    
    // Remove LastPass Icon. TODO There MUST be a better way!
    $("#chatline").css({"background-image":"none"});
    $(".pm-input").css({"background-image":"none"});
  }, 1000);
  
  if (window.CLIENT.rank > Rank.Guest) { 
    let modflair = $("#modflair");
    if (modflair.hasClass("label-default")) { modflair.trigger("click"); }

    let chatline = $("#chatline");
    chatline.attr("placeholder", "Type here to Chat");
    chatline.attr("spellcheck", "true");
    chatline.focus();
  }
 
  if (window.CLIENT.rank >= Rank.Moderator) { 
    $('<button class="btn btn-sm btn-default" id="nextvid" title="Force Skip">Skip</button>')
      .appendTo("#leftcontrols")
      .on("click", function() { window.socket.emit("playNext"); });
  }
  
  if (window.CLIENT.rank > Rank.Moderator) { 
    $('<button class="btn btn-sm btn-default" id="clear" title="Clear Chat">Clear</button>')
      .appendTo("#leftcontrols")
      .on("click", function() {
        window.socket.emit("chatMsg", { msg: "/clear", meta: {} });
        window.socket.emit("playerReady");
      });

    $('<button class="btn btn-sm btn-default" id="clean" title="Clean Server Messages">Clean</button>')
      .appendTo("#leftcontrols")
      .on("click", function() {
        $messagebuffer.find("[class^=chat-msg-\\\\\\$server]").each(function() { $(this).remove(); });
        $messagebuffer.find("[class^=chat-msg-\\\\\\$voteskip]").each(function() { $(this).remove(); });
        $messagebuffer.find("[class^=server-msg]").each(function() { $(this).remove(); });
        $(".chat-msg-Video:not(:last)").each(function() { $(this).remove(); });
        $(".chat-msg-" + BOT_NICK).each(function() { $(this).remove(); });
      });
  }
  
  makeNoRefererMeta();
  refreshVideo();
  cacheEmotes();
});

/********************  END OF SCRIPT  ********************/
