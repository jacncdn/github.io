/*!
**|  CyTube Enhancements: Common
**|  Version: 2023.08.25
**|
**@preserve
*/
"use strict";

// https://jshint.com/docs/options/
// jshint curly:true, eqeqeq:true, esversion:10, freeze:true, futurehostile:true, latedef:true, maxerr:10, nocomma:true
// jshint strict:global, trailingcomma:true, varstmt:true
// jshint devel:true, jquery:true
// jshint varstmt: false
// jshint unused:false
// jshint undef:true

/* globals socket, CHANNEL, CLIENT, Rank, CHATTHROTTLE, IGNORED, USEROPTS, initPm, pingMessage, formatChatMessage, Callbacks */
/* globals removeVideo, makeAlert, videojs, CHANNEL_DEBUG, PLAYER, BOT_NICK, IMABOT, MOTD_MSG */
/* globals Buttons_URL, Footer_URL, Favicon_URL, START, ROOM_ANNOUNCEMENT, MOD_ANNOUNCEMENT, ADVERTISEMENT */

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
var _originalCallbacks = {};
var _originalEmit = null;

// ##################################################################################################################################

const isNullOrEmpty = function(data) {
  if (typeof data === 'undefined') { return true; }
  if (data === null) { return true; }
  if (typeof(data) === 'string') {
    return (data.length > 0);
  }
  return (!(data)); // Catch ALL
};

// ----------------------------------------------------------------------------------------------------------------------------------
function Sleep(sleepMS) {
  // USE: await Sleep(2000);
  return new Promise(resolve => setTimeout(resolve, sleepMS));
}

// ----------------------------------------------------------------------------------------------------------------------------------

const timeString = function(datetime) {
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
  let msg = desc;
  if ((typeof data !== 'undefined') && (data)) {
    msg += ': ' + JSON.stringify(data, null, 2);
  }

  return "[" + new Date().toTimeString().split(" ")[0] + "] " + msg;
};

const logTrace = function(desc, data) {
  window.console.log(formatConsoleMsg(desc));

  if (CHANNEL_DEBUG && (typeof data !== 'undefined') && (data)) {
    window.console.debug(JSON.stringify(data, null, 2));
  }
};

// Send debug msg to console
const debugData = function(desc, data) {
  if (!CHANNEL_DEBUG) { return; }
  window.console.debug(formatConsoleMsg(desc, data));
};

// Send error msg to console
const errorData = function(desc, data) {
  window.console.error(formatConsoleMsg(desc, data));
};

// Send log msg to console
const logData = function(desc, data) {
  window.console.log(formatConsoleMsg(desc, data));
};

// Admin Debugger
const debugListener = function(eventName, data) { 
  if (eventName.toLowerCase() === "mediaupdate") { return; }
  window.console.info(formatConsoleMsg(eventName, data));
};

// ##################################################################################################################################

const hmsToSeconds = function(hms) {
  let part = hms.split(':'), secs = 0, mins = 1;
  while (part.length > 0) {
    secs += (mins * parseInt(part.pop(), 10));
    mins *= 60;
  }
  return secs;
};

const secondsToHMS = function(secs) {
  let start = 15;
       if (secs >= 36000) { start = 11; }
  else if (secs >= 3600)  { start = 12; }
  else if (secs >= 600)   { start = 14; }
  return new Date(secs * 1000).toISOString().substring(start, 19);
};

// ##################################################################################################################################

// JQuery Wait for an HTML element to exist
const waitForElement = function(selector, callback, checkFreqMs, timeoutMs) {
  let startTimeMs = Date.now();
  (function loopSearch() {
    if ($(selector).length) {
      callback();
      return;
    }
    else {
      setTimeout(() => {
        if (timeoutMs && ((Date.now() - startTimeMs) > timeoutMs)) { return; }
        loopSearch();
      }, checkFreqMs);
    }
  })();
};

// ##################################################################################################################################

const notifyPing = function() {
  try {
    new Audio('https://cdn.freesound.org/previews/25/25879_37876-lq.mp3').play();
  } catch {}
};

const msgPing = function() {
  try {
    new Audio('https://cdn.freesound.org/previews/662/662411_11523868-lq.mp3').play();
  } catch {}
};

// ##################################################################################################################################

// Get User from UserList
const getUser = function(name) {
  let user = null;
  $("#userlist .userlist_item").each(function(index, item) {
    let data = $(item).data();
    if (data.name.toLowerCase() === name.toLowerCase()) { user = data; }
  });
  return user;
};

const isUserHere = function(name) {
  return (getUser(name) !== null);
};

// Is User Idle?
const isUserAFK = function(name) {
  let afk = false;
  let user = getUser(name);
  if (!user) { afk = false; } else { afk = user.meta.afk; }
  return afk;
};

// ##################################################################################################################################

async function notifyMe(chan, title, msg) {

  if (document.hasFocus()) { msgPing(); return; }

  if (!("Notification" in window)) { return; } // NOT supported
    if (Notification.permission === 'denied') { return; }

  if (Notification.permission !== "granted") {
    await Notification.requestPermission();
  }

  if (Notification.permission !== "granted") { return; }

  const notify = new Notification(chan + ': ' + title, {
    body: msg,
    tag: chan,
    lang: "en-US",
    icon: 'https://jacncdn.github.io/img/favicon.png',
    silent: false,
  });

  document.addEventListener("visibilitychange", (evt) => {
      try {
        notify.close();
      } catch {}
    }, { once: true, });

  notify.onclick = function() {
    window.parent.focus();
    notify.close();
  };

  setTimeout(() => notify.close(), 20000);

  notifyPing();
}

// ##################################################################################################################################

//  Room Announcements
const roomAnnounce = function(msg) { 
  if (msg.length < 1) { return; }
  if (window.CLIENT.rank < Rank.Member) { return; }
  if (BOT_NICK.toLowerCase() === CLIENT.name.toLowerCase()) { return; }

  $(function() {
    makeAlert("Message from Admin", msg).attr("id","roomAnnounce").appendTo("#announcements");
  });
};

//  Moderator Announcements
const modAnnounce = function(msg) { 
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
  setTimeout(() => {
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

window[CHANNEL.name].VideoInfo = { title: "None", current: 0, duration: 0, };

var VIDEO_TITLE = { title: "None", current: 0, duration: 0, };

const setVideoTitle = function() {
  if (VIDEO_TITLE.duration < 1) { VIDEO_TITLE.duration = VIDEO_TITLE.current; }
  let remaining = Math.round(VIDEO_TITLE.duration - VIDEO_TITLE.current);
  $currenttitle.html("Playing: <strong>" + VIDEO_TITLE.title + "</strong> &nbsp; (" + secondsToHMS(remaining) + ")");  
};

const refreshVideo = function() {
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
  debugData("common.videoFix");
  
  let vplayer = videojs('ytapiplayer');
  vplayer.on("error", function(e) {
    errorData("common.Reloading Player", e);
    vplayer.createModal("ERROR: Reloading player!");
    
    window.setTimeout(function() { refreshVideo(); }, 2000);
  });
};

function videoErrorHandler(event) {
  errorData('common.videoErrorHandler', event);
  refreshVideo();
}

// ##################################################################################################################################

// Turn AFK off if PMing
const pmAfkOff = function(data) {
  if (isUserAFK(CLIENT.name)) { window.socket.emit("chatMsg", { msg: "/afk", }); }
};
if (window.CLIENT.rank < Rank.Admin) { window.socket.on("pm", pmAfkOff); } // Below Admin

// ##################################################################################################################################

// Auto Expire Messages
const autoMsgExpire = function() {
  // Mark Server Messages
  $messagebuffer.find("[class^=chat-msg-\\\\\\$]:not([data-expire])").each(function() { $(this).attr("data-expire", Date.now() + messageExpireTime);});
  $messagebuffer.find("[class^=server-msg]:not([data-expire])").each(function() { $(this).attr("data-expire", Date.now() + messageExpireTime);});
  $messagebuffer.find("div.poll-notify:not([data-expire])").attr("data-expire", Date.now() + (messageExpireTime * 2));

  if (window.CLIENT.rank < Rank.Moderator) { // Mark Chat Messages
    $messagebuffer.find("[class*=chat-shadow]:not([data-expire])").each(function() { $(this).attr("data-expire", Date.now() + messageExpireTime);});
    $messagebuffer.find("[class*=chat-msg-]:not([data-expire])").each(function() { $(this).attr("data-expire", Date.now() + chatExpireTime);});
  }
  
  // Remove Expired Messages
  $messagebuffer.find("div[data-expire]").each(() => {
      if (Date.now() > parseInt($(this).attr("data-expire"))) { 
        $(this).remove();
      }});

  if (document.visibilityState === "hidden") { // delay if hidden
    $messagebuffer.find("div[data-expire]").each(function() {
      $(this).attr("data-expire", parseInt($(this).attr("data-expire")) + 400);
    });
  }
};

// ##################################################################################################################################

const cacheEmotes = function() {
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
  CHANNEL.motd += window[CHANNEL.name].commonMotd;
  $("#motd").html(CHANNEL.motd);

  if (MOTD_MSG === null) { return; }
  if (MOTD_MSG.length < 1) { return; }
  $("#motd div:first").append(MOTD_MSG);
};

const getCustomMOTD = function() {
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
    },
  });
};

// ##################################################################################################################################

const getFooter = function() {
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
    },
  });
};

// ##################################################################################################################################

const makeNoRefererMeta = function() {
  let meta = document.createElement('meta');
  meta.name = 'referrer';
  meta.content = 'no-referrer';
  document.head.append(meta);
};

// ##################################################################################################################################

// Intercept Original Callbacks
const CustomCallbacks = {
  changeMedia: function(data) {
    debugData("CustomCallbacks.changeMedia", data);
    _originalCallbacks.changeMedia(data);
    
    window.CurrentMedia = data;
    VIDEO_TITLE.title = data.title;
    VIDEO_TITLE.current = data.currentTime;
    VIDEO_TITLE.duration = data.seconds;
    setVideoTitle();

    waitForElement('#ytapiplayer', () => {
      let newVideo = document.getElementById('ytapiplayer');
      if (newVideo) { newVideo.addEventListener('error', videoErrorHandler, true); }
    }, 100, 10000);
  },

  chatMsg: function(data) { 
    debugData("CustomCallbacks.chatMsg", data);
    
    if (data.username.toLowerCase() === window.CLIENT.name.toLowerCase()) { // Don't talk to yourself
      msgPing();
    }

    _originalCallbacks.chatMsg(data);
  },

  disconnect: function(data) {
    if (window.KICKED) {
      removeVideo(event); // Remove Video on KICK
    }
    _originalCallbacks.disconnect(data);
  },

  mediaUpdate: function(data) {
    // debugData("CustomCallbacks.mediaUpdate", data);
    _originalCallbacks.mediaUpdate(data);

    if ((window.PLAYER) && (window.PLAYER.player) && (window.PLAYER.player.error_)) {
      refreshVideo();
      return;
    }
    
    VIDEO_TITLE.current = data.currentTime;
    setVideoTitle();
  },

  pm: function(data) {
    debugData("CustomCallbacks.pm", data);
    if (data.to === BOT_NICK) { return; }
    if (data.msg.startsWith(PREFIX_INFO)) { return; }

    if (data.username.toLowerCase() !== window.CLIENT.name.toLowerCase()) { // Don't talk to yourself
      notifyMe(window.CHANNELNAME, data.username, data.msg);
    }
    
    _originalCallbacks.pm(data);
  },
  
  setMotd: function(data) {
    debugData("CustomCallbacks.setMotd", data);
    _originalCallbacks.setMotd(data);
    setCustomMOTD();
  },
  
  // --------------------------------------------------------------------------------
  addUser: function(data) { // Enhanced PM Box
    debugData("CustomCallbacks.addUser", data);
    _originalCallbacks.addUser(data);

    $("#pm-" + data.name + " .panel-heading").removeClass("pm-gone");
    if (BOT_NICK.toLowerCase() !== CLIENT.name.toLowerCase()) {
      setTimeout(() => { $(".userlist_owner:contains('"+ BOT_NICK + "')").parent().css("display","none"); }, 6000);
    }
  },

  userLeave: function(data) { // Enhanced PM Box
    $("#pm-" + data.name + " .panel-heading").addClass("pm-gone"); 
    _originalCallbacks.userLeave(data);
  },
};

// ----------------------------------------------------------------------------------------------------------------------------------
const initCallbacks = function(data) {
  for (let key in CustomCallbacks) {
    if (CustomCallbacks.hasOwnProperty(key)) {
      debugData("common.initCallbacks.key", key);
      _originalCallbacks[key] = window.Callbacks[key];
      window.Callbacks[key] = CustomCallbacks[key];
    }
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

//  DOCUMENT READY
$(document).ready(function() {
  initCallbacks();
  getFooter();

  if (window.CLIENT.rank < Rank.Moderator) { hideVideoURLs(); }
  
  getCustomMOTD();

  // --------------------------------------------------------------------------------
  // Move Title to full width
  $('<div id="titlerow" class="row" />').insertBefore("#main").html($("#videowrap-header").detach());
  VIDEO_TITLE.title = $currenttitle.text().replace("Currently Playing: ", "");
  setVideoTitle();
  
  $('#plonotification').remove();
  $('#plmeta').insertBefore("#queue");

  $('<link id="roomfavicon" href="' + Favicon_URL + '?ac=' + START + '" type="image/x-icon" rel="shortcut icon" />').appendTo("head");

  // --------------------------------------------------------------------------------
  if (ROOM_ANNOUNCEMENT !== null) { roomAnnounce(ROOM_ANNOUNCEMENT); }
  if (MOD_ANNOUNCEMENT !== null) { modAnnounce(MOD_ANNOUNCEMENT); }
  setTimeout(() => {$("#announcements").fadeOut(800, () => {$(this).remove();});}, 90000);

  if ((typeof ADVERTISEMENT !== "undefined") &&
      (window.CLIENT.rank < Rank.Moderator)) { 
    // $("#pollwrap").after('<div id="adwrap" class="col-lg-12 col-md-12">' + ADVERTISEMENT + '</div>');
    $("#customembed").before('<div id="adwrap" class="col-lg-7 col-md-7">' + ADVERTISEMENT + '</div>');
  }

  $(window).on("focus", () => { $("#chatline").focus(); });

  // --------------------------------------------------------------------------------
  window.setInterval(() => {  // Check every second
    autoMsgExpire();
    
    // Remove LastPass Icon. TODO There MUST be a better way!
    $("#chatline").attr("spellcheck", "true").css({"background-image":"none",});
    $(".pm-input").attr("spellcheck", "true").css({"background-image":"none",});
  }, 1000);
  
  $("body").keypress(function(evt) {
    // Skip if editing input (label, title, description, etc.)
    if ($(evt.target).is(':input, [contenteditable]')) { return; }
    $("#chatline").focus();
  });

  $("#chatline").attr("placeholder", "Type here to Chat").focus();

  // --------------------------------------------------------------------------------
  if (BOT_LOG && isNullOrEmpty(_originalEmit)) {
    // Override Original socket.emit
    _originalEmit = socket.emit;
    
    socket.emit = function() {
      let args = Array.prototype.slice.call(arguments);
      
      if ((args[0] === "chatpmMsg") || (args[0] === "pm")) {
        let pmMsg = args[1].msg.trim();
        if (pmMsg[0] !== '/') {
          pmMsg = pmMsg[0].toLocaleUpperCase() + pmMsg.slice(1); // Capitalize
          console.debug('common.emit.upCase: ', args[1].msg);
          args[1].msg = pmMsg;
        }
      }

      _originalEmit.apply(socket, args);

      if (args[0] === "pm") {
        console.debug('common.emit.pm: ', JSON.stringify(args));
        if (isUserHere(BOT_NICK)) {
          let dmArgs = args;
          let dmMsg = PREFIX_INFO + args[1].to + ': ' + args[1].msg;
          dmArgs[1].to = BOT_NICK;
          dmArgs[1].msg = dmMsg;
          _originalEmit.apply(socket, dmArgs);
        }
      }
    };
  }

  // --------------------------------------------------------------------------------
  if (window.CLIENT.rank > Rank.Guest) { 
    let modflair = $("#modflair");
    if (modflair.hasClass("label-default")) { modflair.trigger("click"); }
  }
 
  if (window.CLIENT.rank >= Rank.Moderator) { 
    $('<button class="btn btn-sm btn-default" id="nextvid" title="Force Skip">Skip</button>')
      .appendTo("#leftcontrols")
      .on("click", function() { window.socket.emit("playNext"); });
  }
  
  // --------------------------------------------------------------------------------
  if (window.CLIENT.rank > Rank.Moderator) { 
    $('<button class="btn btn-sm btn-default" id="clear" title="Clear Chat">Clear</button>')
      .appendTo("#leftcontrols")
      .on("click", function() {
        window.socket.emit("chatMsg", { msg: "/clear", meta: {}, });
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
  
  // --------------------------------------------------------------------------------
  makeNoRefererMeta();
  refreshVideo();
  cacheEmotes();
});

/********************  END OF SCRIPT  ********************/
