// Get CyTube Playlist
// $('.qe_title').each(function(){window.console.debug('{"title":"' + this.textContent + '","url":"' + this.href + '"},');});
// {"title":"purple","url":"minivan"}

var newVideos = [ 
{"title":"Yevgenia","url":"https://files.catbox.moe/0i2qc2.mp4"},
  {}
]; 
 
var defDelay = 4000; 
var delay = defDelay; 
 
function findVideo(url) { 
  var uid = -1; 
  let justName = url.replace(/\.[^/.]+$/, ""); // Remove Extension 
  justName = justName.replace(/[^0-9a-z]/gi, "."); // AlphaNumeric Only 
  justName = justName.replace(/[.]+/gi,'.*'); 
 
  let regex = new RegExp(".*" + justName + ".*", 'gi'); 
 
  $('#queue > li.queue_entry').filter(function(){ 
    if ($(this).html().match(regex)) { 
      uid = $(this).data("uid"); 
    } 
  }); 
 
  return uid; 
} 
 
function addNewVideosLoop(loop){ 
  delay = defDelay; 
  var video = newVideos[loop];
  
  if ((typeof video === "undefined") || (typeof video['url'] === "undefined")) {
    window.console.log("Finished ################################################################################"); 
    return; 
  }
  
  let Url = video['url'];
  let Title = video['title'];
  if (Title.length < 1) { Title = Url; }
  
  let uid = findVideo(Url); 
 
  if (uid >= 0) { 
     window.console.log("Duplicate: " + Title); 
     delay = 100; 
   } 
   else { 
     window.console.log("Adding: " + Title); 
     socket.emit("queue", { id: Url, title: Title, pos:"end", type:"fi", "temp":false }); 
   } 
 
  setTimeout(()=>{ loop++; addNewVideosLoop(loop); }, delay); 
} 
 
function addNewVideos(){ 
  setTimeout(()=>{ addNewVideosLoop(0); }, defDelay); 
} 
 
// socket.emit("clearPlaylist"); 
addNewVideos(); 
