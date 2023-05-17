
var newVideos = [ 
"https://pomf2.lain.la/f/7ejuupbg.mp4",
"" 
]; 
 
var defDelay = 4000; 
var delay = defDelay; 
 
function shuffleArray(array) { 
  for (let i = array.length - 1; i > 0; i--) { 
    const j = Math.floor(Math.random() * (i + 1)); 
    if (array[i].length > 0) { [array[i], array[j]] = [array[j], array[i]]; } 
  } 
} 
 
function findVideo(video) { 
  var uid = -1; 
  let justName = video.replace(/\.[^/.]+$/, ""); // Remove Extension 
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
  if (!video) {
    window.console.log("Finished ################################################################################"); 
    return; 
  }
  
  let uid = findVideo(video); 
 
  if (uid >= 0) { 
     window.console.log("Duplicate: " + video); 
     delay = 100; 
   } 
   else { 
     window.console.log("Adding: " + video); 
     socket.emit("queue", { id: video, pos:"end", type:"fi", "temp":false }); 
   } 
 
  setTimeout(()=>{ loop++; addNewVideosLoop(loop); }, delay); 
} 
 
function addNewVideos(){ 
  shuffleArray(newVideos); 
  setTimeout(()=>{ addNewVideosLoop(0); }, defDelay); 
} 
 
// socket.emit("clearPlaylist"); 
addNewVideos(); 
