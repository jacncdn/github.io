/*!
 **|  CyTube PM Enhancements
 **|  Copyright Xaekai 2014-16
 **|  Copyright Bv5t3r 2023
 **|  Version 2023.05.16.1200
 **@preserve
 */
/* jshint esversion:6 */
/* jshint curly:true */
/* jshint eqeqeq:true */
/* jshint varstmt:true */

/* jshint undef:true */
/* globals socket, debugData */
/* globals CHANNEL, CLIENT, Rank, CHATTHROTTLE, IGNORED, USEROPTS, initPm, pingMessage, formatChatMessage, Callbacks */
/* globals debugData */

/*
window.localStorage.clear()

for (let key of Object.keys(localStorage)) { window.console.info(`${key} ${JSON.stringify(localStorage[key], null, 2)}`) }

for (let key of Object.keys(localStorage)) {
  if (key.toLowerCase().includes("prevopen")) {
    window.console.info(`${key} ${JSON.stringify(localStorage[key], null, 2)}`);
  }
}

*/

// This is a self-executing anonymous function.
// The first set of parentheses contain the expressions to be executed, and the second set of parentheses executes those expressions.
(function(CyTube_BetterPM) { 'use strict'; return CyTube_BetterPM(window, document, window.jQuery); })

(function(window, document, $, undefined) {'use strict'; 
  if (typeof Storage === "undefined") {
    window.console.error("betterpm", "localStorage not supported. Aborting load.");
    return;
  }
  else if (typeof CLIENT.name === "undefined") {
    window.console.error("betterpm", "Client is an anonymous user. Aborting load.");
    return;
  }
  else {
    window.console.info("betterpm", "Loading");
    debugData("betterpm.Loading");
  }

  if (!window[CHANNEL.name]) { window[CHANNEL.name] = {}; }

  // Remove OLD BetterPM data TODO
  for (let key of Object.keys(localStorage)) {
    if (key.toLowerCase().includes("_betterpm_")) { localStorage.removeItem(key); }
  }

  // ----------------------------------------------------------------------------------------------------------------------------------
  class BetterPrivateMessages {
    static get maxPMs() { return 50; }
    static get maxMS() { return 2592000000; } // 1 month

    get historyID() { return `PM_History_${CHANNEL.name.toLowerCase()}_${CLIENT.name.toLowerCase()}_`; }

    constructor() {
      debugData("betterpm.constructor");

      if (localStorage.getItem(`PM_PrevOpen_${CHANNEL.name.toLowerCase()}_${CLIENT.name.toLowerCase()}`) === null) { // CHANNEL_PM_PrevOpen_CLIENT
        localStorage.setItem(`PM_PrevOpen_${CHANNEL.name.toLowerCase()}_${CLIENT.name.toLowerCase()}`, JSON.stringify([]));  // Create empty JSON
      }

      this.previouslyOpen = JSON.parse(localStorage.getItem(`PM_PrevOpen_${CHANNEL.name.toLowerCase()}_${CLIENT.name.toLowerCase()}`));
      debugData("betterpm.previouslyOpen", this.previouslyOpen);

      this.openCache = {};

      $("#pmbar").on("deployCache", ((ev, user) => {
          debugData("betterpm.onDeployCache", user);
          this.deployCache(user);
          this.saveOpen();
        }));

      $("#pmbar").on("newMessage", ((ev, coresp, data) => {
          debugData("betterpm.onNewMessage", data);
          this.newMessage(coresp, data);
          this.saveOpen();
        }));

      $(window).on("unload.openprivs", (() => {
          debugData("betterpm.onUnload.openprivs");
          this.saveOpen();
          this.flushCache();
        }));
      return this;
    }

    flushCache() {
      Object.keys(this.openCache).forEach((coresp => {
        debugData("betterpm.flushCache", this.openCache[coresp]);
        localStorage.setItem(`PM_History_${CHANNEL.name.toLowerCase()}_${CLIENT.name.toLowerCase()}_${coresp}`, JSON.stringify(this.openCache[coresp]));
      }));
    }

    deployCache(coresp) {
      debugData("betterpm.deployCache", coresp);
      if (localStorage.getItem(`PM_History_${CHANNEL.name.toLowerCase()}_${CLIENT.name.toLowerCase()}_${coresp}`) === null) { return; }
      this.initCache(coresp);
      this.openCache[coresp].slice((this.openCache[coresp].length > this.maxPMs) ? (this.openCache[coresp].length - this.maxPMs) : 0) // Limit to MaxPMs
        .forEach((item => {
          debugData("betterpm.deployCache.item", item);
          Callbacks.pm(item, true);
        }));
    }

    scheduleFlush() { this.flushCache(); }

    initCache(coresp) {
      debugData("betterpm.initCache", coresp);
      if (typeof this.openCache[coresp] === "undefined") {
        this.openCache[coresp] = JSON.parse(localStorage.getItem(`PM_History_${CHANNEL.name.toLowerCase()}_${CLIENT.name.toLowerCase()}_${coresp}`));
      }
    }

    saveOpen() {
      let currOpen = [];
      $("#pmbar > div[id^=pm]:not(.pm-panel-placeholder)").each(function() {
        currOpen.push($(this)
          .attr("id")
          .replace(/^pm-/, ""));
      });
      localStorage.setItem(`PM_PrevOpen_${CHANNEL.name.toLowerCase()}_${CLIENT.name.toLowerCase()}`, JSON.stringify(currOpen));
      debugData("betterpm.saveOpen", currOpen);
    }

    newMessage(coresp, msg) {
      debugData("betterpm.newMessage", msg);
      if (localStorage.getItem(`PM_History_${CHANNEL.name.toLowerCase()}_${CLIENT.name.toLowerCase()}_${coresp}`) === null) {
        localStorage.setItem(`PM_History_${CHANNEL.name.toLowerCase()}_${CLIENT.name.toLowerCase()}_${coresp}`, JSON.stringify([]));
      }
      this.initCache(coresp);
      this.openCache[coresp].push(msg);
      this.scheduleFlush();
    }

    startUp() {
      let self = this;
      $("#pmbar > div[id^=pm]:not(.pm-panel-placeholder)").each(function() {
        return; // TODO:
        let currentUser = $(this).attr("id").replace(/^pm-/, "");
        self.previouslyOpen.push(currentUser);
        $(this).find("div.pm-buffer").each(function() { return; });
      });

      this.previouslyOpen.forEach((user => { initPm(user); }));
      localStorage.setItem(`PM_PrevOpen_${CHANNEL.name.toLowerCase()}_${CLIENT.name.toLowerCase()}`, JSON.stringify([]));
      debugData("betterpm.startUp", this);

      return this;
    }
  }

  // ----------------------------------------------------------------------------------------------------------------------------------
  if (!CLIENT.BetterPMs) {
    CLIENT.BetterPMs = (new BetterPrivateMessages()).startUp();
  }
  
  // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
  // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

  window.initPm = function(user) {
    debugData("betterpm.initPm", user);

    if ($("#pm-" + user).length > 0) { return $("#pm-" + user); }

    let pm = $("<div/>")
      .addClass("panel panel-default pm-panel")
      .appendTo($("#pmbar"))
      .data("last", {
        name: ""
      }).attr("id", "pm-" + user);

    let title = $("<div/>")
      .addClass("panel-heading")
      .text(user)
      .appendTo(pm);

    $("<button/>") //closeButton
      .addClass("close pull-right")
      .html("&times;")
      .appendTo(title)
      .click(function() {
        pm.remove();
        $("#pm-placeholder-" + user).remove();
      });

    let body = $("<div/>")
      .addClass("panel-body")
      .appendTo(pm)
      .hide();

    let placeholder;

    title.click(function() {
      debugData("betterpm.title.click", user);

      body.toggle();
      pm.removeClass("panel-primary")
        .addClass("panel-default");

      if (!body.is(":hidden")) {
        placeholder = $("<div/>")
          .addClass("pm-panel-placeholder")
          .attr("id", "pm-placeholder-" + user)
          .insertAfter(pm);

        let left = pm.position().left;

        pm.css("position", "absolute")
          .css("bottom", "0px")
          .css("left", left);
      } else {
        pm.css("position", "");
        $("#pm-placeholder-" + user).remove();
      }
    });

    $("<div/>") // buffer
      .addClass("pm-buffer linewrap")
      .appendTo(body);

    $("<hr/>").appendTo(body);

    let input = $("<input/>")
      .addClass("form-control pm-input")
      .attr("type", "text")
      .attr("maxlength", 240)
      .appendTo(body);

    input.keydown(function(ev) {
      if (ev.keyCode === 13) {
        if (CHATTHROTTLE) { return; }

        let meta = {};
        let msg = input.val().trim();
        if (msg === "") { return; }

        debugData("betterpm.input.keydown", msg);

        if (USEROPTS.modhat && (CLIENT.rank >= Rank.Moderator)) {
          meta.modflair = CLIENT.rank;
        }

        if ((window.CLIENT.rank >= Rank.Moderator) && (msg.indexOf("/m ") === 0)) {
          meta.modflair = CLIENT.rank;
          msg = msg.substring(3);
        }

        socket.emit("pm", { to: user, msg: msg, meta: meta });
        input.val("");
      }
    });

    $("#pmbar").trigger("deployCache", user);

    ({startCheck: function(user) {
        debugData("betterpm.startCheck", user);

        if (!$("#pm-" + user).length) { return; }

        let buffer = initPm(user).find(".pm-buffer");

        if (buffer.children().last().length) {
          buffer.children().last()[0].scrollIntoView();
        }

        buffer[0].scrollTop = buffer[0].scrollHeight;

        if ((buffer[0].scrollHeight === this.scrollHeight) && (this.scrollHeight !== 0)) { return; }
        else {
          this.scrollHeight = buffer[0].scrollHeight;
          setTimeout(this.startCheck.bind(this), this.timeout, user);
        }
      },
      scrollHeight: -1,
      timeout: 250
    })
    .startCheck(user);

    return pm;
  };
  
  // ----------------------------------------------------------------------------------------------------------------------------------
  window.formatChatMessage = function(data, last) {
    // Backwards compatibility
    if (!data.meta || data.msgclass) {
      data.meta = {
        addClass: data.msgclass,
        addClassToNameAndTimestamp: data.msgclass
      };
    }
    
    // Phase 1: Determine whether to show the username or not
    let skip = data.username === last.name;
    if (data.meta.addClass === "server-whisper") { skip = true; }

    // Prevent impersonation by abuse of the bold filter
    if (data.msg.match(/^\s*<strong>\w+\s*:\s*<\/strong>\s*/)) { skip = false; }
    if (data.meta.forceShowName) { skip = false; }

    data.msg = stripImages(data.msg);
    data.msg = execEmotes(data.msg);

    last.name = data.username;
    let div = $("<div/>");
    
    /* drink is a special case because the entire container gets the class, not just the message */
    if (data.meta.addClass === "drink") {
      div.addClass("drink");
      data.meta.addClass = "";
    }

    // Add timestamps (unless disabled)
    if (USEROPTS.show_timestamps) {
      let time = $("<span/>").addClass("timestamp").appendTo(div);
      time.text("[" + timeString(data.time) + "] ");
      if (data.meta.addClass && data.meta.addClassToNameAndTimestamp) {
        time.addClass(data.meta.addClass);
      }
    }

    // Add username
    let name = $("<span/>");
    if (!skip) { name.appendTo(div); }
    
    $("<strong/>").addClass("username").text(data.username + ": ").appendTo(name);
    if (data.meta.modflair) { name.addClass(getNameColor(data.meta.modflair)); }
    if (data.meta.addClass && data.meta.addClassToNameAndTimestamp) { name.addClass(data.meta.addClass); }
    if (data.meta.superadminflair) {
      name.addClass("label").addClass(data.meta.superadminflair.labelclass);
      $("<span/>").addClass(data.meta.superadminflair.icon)
        .addClass("glyphicon")
        .css("margin-right", "3px")
        .prependTo(name);
    }

    // Add the message itself
    let message = $("<span/>").appendTo(div);
    message[0].innerHTML = data.msg;

    // For /me the username is part of the message
    if (data.meta.action) {
      name.remove();
      message[0].innerHTML = data.username + " " + data.msg;
    }
    if (data.meta.addClass) { message.addClass(data.meta.addClass); }
    if (data.meta.shadow) { div.addClass("chat-shadow"); }
    
    return div;
  };

  // ----------------------------------------------------------------------------------------------------------------------------------
  window.Callbacks.pm = function(data, backlog) {
    // debugData("betterpm.Callbacks.pm", data);
    // debugData("betterpm.Callbacks.pm", backlog);

    let name = data.username;
    if (IGNORED.indexOf(name) !== -1) { return; }

    if (data.username === CLIENT.name) {
      name = data.to;
    } else {
      pingMessage(true);
    }

    let pm = initPm(name);
    let msg = formatChatMessage(data, pm.data("last"));
    let buffer = pm.find(".pm-buffer");
    msg.appendTo(buffer);
    buffer.scrollTop(buffer.prop("scrollHeight"));

    if (pm.find(".panel-body").is(":hidden")) {
      pm.removeClass("panel-default").addClass("panel-primary");
    }

    if (!backlog) {
      let coresp = CLIENT.name !== data.username ? data.username : data.to;
      $("#pmbar").trigger("newMessage", [coresp, data]);
    }
  };
});
