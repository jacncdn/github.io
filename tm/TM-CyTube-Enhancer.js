// ==UserScript==
// @name         CyTube Enhancer
// @namespace    https://tampermonkey.net/
// @version      0.7.059
// @description  Make changes to CyTube for better experience. Tested in chrome.
// @author       Buster Garvin
// @match        https://cytu.be/r/*
// @match        https://baked.live/tv/*
// @sandbox      raw
// @grant        unsafeWindow
// @grant        GM_xmlhttpRequest
// @grant        GM.xmlHttpRequest
// @run-at       document-end
// @require      https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js
// @require      https://ajax.googleapis.com/ajax/libs/jqueryui/1.13.0/jquery-ui.min.js
// @require      https://cdn.socket.io/4.5.4/socket.io.min.js
// @require      http://cdn.embed.ly/player-0.0.12.min.js
// ==/UserScript==
'use strict';
/* globals $ */
/* globals jQuery, socket, waitForKeyElements */

const scriptVersion = GM_info.script.version;
unsafeWindow.console.debug('##### CyTube Enhancer Loading v' + scriptVersion);

// debugger;

const debugCSS = `
@charset "UTF-8";

body {
  line-height: 1.2;
  color: rgba(255,255,255,.82);
  overflow-x: hidden;
}

.container { width: 100% }
.container, .container-fluid {
  padding-left: 2px;
  padding-right: 2px;
}

.row {
  margin-left: 0px;
  margin-right: 0px;
}

#currenttitle {
  color: Gold;
  padding-left: 8px;
}

#showcustomembed, #showplaylistmanager, #qlockbtn, #getplaylist, #showmediaupload, #showplaylist {
  visibility: hidden;
  width: 0;
  margin: 0;
  padding: 0;
}

.channel-emote {
  max-width: 80px;
  max-height: 80px;
  vertical-align: bottom;
}

#chatwrap, #videowrap {
  margin-bottom: 4px;
  padding-left: 4px;
  padding-right: 4px;
}

#chatwrap, .pm-buffer {
  font-family: Tahoma, Arial, Helvetica, sans-serif;
  line-height: 1.2;
  font-size: 14px;
  font-weight: 100;
  vertical-align: baseline;
}
#chatwrap em, .pm-buffer em {
  color: White;
  font-weight: 400;
  font-style: normal;
}
.pm-gone {
  color: black !important;
  text-decoration: white line-through;
}

#chatline {
  height: 2em;
}

#userlist {
  width: 22%;
  font-size: 75%;
  padding-left: 2px;
  color: #d4b791;
}
.userlist_afk .glyphicon {
  display: inline;
  color: #bf935a;
  padding-right: 2px;
}
.userlist_afk { color: #bf935a; }

#messagebuffer .server-whisper {
  line-height: 0;
  font-size: 75%;
  color: DeepSkyBlue;
}
#messagebuffer .timestamp, .pm-buffer .timestamp {
  line-height: 0;
  font-size: 75%;
  font-style: normal;
  color: #808080;
}
#messagebuffer .action {
  color: SpringGreen;
}
#messagebuffer .server-msg-reconnect, #messagebuffer .server-msg-disconnect {
  line-height: 1;
  margin-top: 2px;
  margin-bottom: 2px;
}
#messagebuffer .username, .pm-buffer .username {
  color: #d4b791;
  font-size: 75%;
  font-weight: 100;
  font-stretch: ultra-condensed;
}

.credit, .credit a {
  color: DarkGray;
  font-size: 50%;
}

.pm-panel, .pm-panel-placeholder {
  width: 30%;
  min-width: 120px;
  opacity: 0.8;
}
.pm-panel:hover {opacity:1}

.pm-panel > .panel-heading {
  color: white;
  font-weight: bold;
  padding-top: 2px;
  padding-bottom: 2px;
}

.profile-box {
  color: white;
  background-color: #bf935a;
}

.throb_text { animation: throbber 4s ease infinite; }
@keyframes throbber { 0% { opacity: 1.0; } 50% { opacity: 0.4; } 100% { opacity: 1.0; } }

/* PM Chat */
.panel-default > .panel-heading { background-color: #bf935a; }
.panel-primary > .panel-heading { /* ALERT */
  background-color: #bf935a;
  animation: blinker 1s ease infinite;
}
@keyframes blinker { 50% { background-color: #f2d00d; } }
`;

const changeCSS = function() {
  'use strict';
  try {
    let debugStyle = document.createElement("style");
    debugStyle.type = "text/css";
    debugStyle.innerHTML = debugCSS;
    document.body.appendChild(debugStyle);
  } catch (error) {
    unsafeWindow.console.error('##### CyTube Enhancer changeCSS: ' + error);
  }
};

const removeVid = function() {
  'use strict';
  try {
    unsafeWindow.removeVideo(event);
  } catch (error) {
    unsafeWindow.console.error('##### CyTube Enhancer removeVid: ' + error);
  }
};

const makeNoRefererMeta = function() {
  'use strict';
  let meta = document.createElement('meta');
  meta.name = 'referrer';
  meta.content = 'no-referrer';
  document.head.append(meta);
};

const notifyPing = function() {
  'use strict';
  try {
    new Audio('https://cdn.freesound.org/previews/25/25879_37876-lq.mp3').play();
  } catch {}
}

const msgPing = function() {
  'use strict';
  try {
    new Audio('https://cdn.freesound.org/previews/662/662411_11523868-lq.mp3').play();
  } catch {}
}

async function notifyMe(chan, title, msg) {
  'use strict';

  if (document.hasFocus()) { msgPing(); return; }

  if (!("Notification" in window)) { return; } // NOT supported
    if (Notification.permission === 'denied') { return; }

  if (Notification.permission !== "granted") {
    let permission = await Notification.requestPermission();
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
      unsafeWindow.console.debug('##### CyTube Enhancer visibilitychange');
      try {
        notify.close();
      } catch {}
    }, { once: true });

  notify.onclick = function() {
    window.parent.focus();
    notify.close();
  }

  setTimeout(() => notify.close(), 20000);

  notifyPing();
}

const delayChanges = function() {
  'use strict';

  if (typeof unsafeWindow.Room_ID !== "undefined") {
    unsafeWindow.console.debug('##### CyTube Already AWESOME!');
    return;
  }

  makeNoRefererMeta();
  changeCSS();

  if ("none" !== $("#motd")[0].style.display) { $("#motd").toggle(); }

  $.getScript('https://jacncdn.github.io/www/showimg.js');
  $.getScript('https://jacncdn.github.io/www/betterpm.js');

  $(window).on("focus", function() { $("#chatline").focus(); });

  // Focus
  $("#chatline").attr("spellcheck", "true").attr("autocapitalize", "sentences").focus();

  $("body").keypress(function(e) {
    // Skip if editing input (label, title, description, etc.)
    if ($(e.target).is(':input, [contenteditable]')) {
      return;
    }
    $("#chatline").focus();
  });

  $("#chanjs-save-pref").prop("checked", true);
  $("#chanjs-deny").click();

  // Socket Events
  socket.on("changeMedia", function(data) {
    $("#currenttitle").text("Playing: " + data.title);

    let msg = `{"title":"` + data.title + `","url":"` + data.id + `",},`;
    unsafeWindow.console.debug(msg);
  });

  socket.on("pm", function(data) {
    if (data.username.toLowerCase() === unsafeWindow.CLIENT.name.toLowerCase()) { return; } // Don't talk to yourself
    notifyMe(unsafeWindow.CHANNELNAME, data.username, data.msg);
  });

  socket.on("chatMsg", function(data) {
    msgPing();
    // notifyMe(unsafeWindow.CHANNELNAME + ': ' + data.username, data.msg);
  });

  $('<button class="btn btn-sm btn-default" id="removeVideo" title="Remove Video">Remove Video</button>')
      .appendTo("#leftcontrols")
      .on("click", function() { removeVid(); });

  $('<button class="btn btn-sm btn-default" id="clean" title="Remove Server Messages">CleanUp</button>')
    .appendTo("#leftcontrols")
    .on("click", function() {
      let $messagebuffer = $("#messagebuffer");
      $messagebuffer.find("[class^=chat-msg-\\\\\\$server]").each(function() { $(this).remove(); });
      $messagebuffer.find("[class^=chat-msg-\\\\\\$voteskip]").each(function() { $(this).remove(); });
      $messagebuffer.find("[class^=server-msg]").each(function() { $(this).remove(); });
      $(".chat-msg-Video:not(:last)").each(function() { $(this).remove(); });
    });

  // Enhanced PM Box
  socket.on("addUser", function(data) {
    $("#pm-" + data.name + " .panel-heading").removeClass("pm-gone");
  });

  socket.on("userLeave", function(data) {
    $("#pm-" + data.name + " .panel-heading").addClass("pm-gone");
  });

  // Moderator Buttons
  if (unsafeWindow.CLIENT.rank >= 2) {
    $('<button class="btn btn-sm btn-default" id="nextvid" title="Force Skip">Skip</button>')
      .appendTo("#leftcontrols")
      .on("click", function() { socket.emit("playNext"); });

    $('<button class="btn btn-sm btn-default" id="clear" title="Clear Chat">Clear</button>')
      .appendTo("#leftcontrols")
      .on("click", function() {
        socket.emit("chatMsg", { msg: "/clear", meta: {} });
        socket.emit("playerReady");
      });
  }
};

unsafeWindow.jQuery(document).ready(function() {
  'use strict';
  try {
    setTimeout(function() { delayChanges(); }, 2000);
  } catch (error) {
    unsafeWindow.console.error('##### CyTube Enhancer DocReady: ' + error);
    debugger;
  }
});