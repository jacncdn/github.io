@echo OFF
SetLocal EnableDelayedExpansion

REM $.getScript("https://tralfazz.kiev.ua/www/UploadScript.js" + '?ac=' + Date.now());

rem SET REPLACE=TRUE

SET WEBSITE=hwm
rem SET WEBSITE=fd
rem SET WEBSITE=clx
rem SET WEBSITE=gb
rem SET WEBSITE=blk

SET SRC_DIR=N:\CyTube\@Work\%WEBSITE%\3_Upload
SET SRC_DIR=D:\Sentinel\Tums\CyTube\%WEBSITE%\4_Uploaded

REM ----------------------------------------------------------------------------------------------------------------------------------
SET URL=https://srv.jackandchat.net/cdn/%WEBSITE%

SET SCRIPT="%~dpn0.js"
SET DELAY=4000

REM ----------------------------------------------------------------------------------------------------------------------------------
@echo // Generated JavaScript Upload Script >!SCRIPT!
@echo: >>!SCRIPT!
@echo var newVideos = [ >>!SCRIPT!

PushD "!SRC_DIR!"
FOR /F "usebackq delims==" %%I IN (`dir *.mp4 /b /s /On`) DO (
  @echo %%I
  @echo   "%%~nxI", >>!SCRIPT!
)
PopD

@echo   "" >>!SCRIPT!
@echo ]; >>!SCRIPT!
@echo: >>!SCRIPT!
@echo var roomURL = "!URL!"; >>!SCRIPT!
@echo var defDelay = !DELAY!; >>!SCRIPT!
@echo var delay = defDelay; >>!SCRIPT!
@echo: >>!SCRIPT!

@echo function shuffleArray(array) { >>!SCRIPT!
@echo   for (let i = array.length - 1; i ^> 0; i--) { >>!SCRIPT!
@echo     const j = Math.floor(Math.random() * (i + 1)); >>!SCRIPT!
@echo     if (array[i].length ^> 0) { [array[i], array[j]] = [array[j], array[i]]; } >>!SCRIPT!
@echo   } >>!SCRIPT!
@echo } >>!SCRIPT!
@echo: >>!SCRIPT!

@echo function findVideo(video) { >>!SCRIPT!
@echo   var uid = -1; >>!SCRIPT!
@echo   let justName = video.replace(/\.[^^/.]+$/, ""); // Remove Extension >>!SCRIPT!
@echo   justName = justName.replace(/[^^0-9a-z]/gi, "."); // AlphaNumeric Only >>!SCRIPT!
@echo   justName = justName.replace(/[.]+/gi,'.*'); >>!SCRIPT!
@echo: >>!SCRIPT!
@echo   let regex = new RegExp(".*" + justName + ".*", 'gi'); >>!SCRIPT!
@echo: >>!SCRIPT!
@echo   $('#queue ^> li.queue_entry').filter(function(){ >>!SCRIPT!
@echo     if ($(this).html().match(regex)) { >>!SCRIPT!
@echo       uid = $(this).data("uid"); >>!SCRIPT!
@echo     } >>!SCRIPT!
@echo   }); >>!SCRIPT!
@echo: >>!SCRIPT!
@echo   return uid; >>!SCRIPT!
@echo } >>!SCRIPT!
@echo: >>!SCRIPT!

@echo function addNewVideosLoop(loop){ >>!SCRIPT!
@echo   delay = defDelay; >>!SCRIPT!
@echo   var video = newVideos[loop]; >>!SCRIPT!
@echo   if (^^!video) { >>!SCRIPT!
@echo     window.console.log("Finished ################################################################################"); >>!SCRIPT!
@echo     return; >>!SCRIPT!
@echo   } >>!SCRIPT!
@echo: >>!SCRIPT!
@echo   let uid = findVideo(video); >>!SCRIPT!
@echo: >>!SCRIPT!

IF NOT DEFINED REPLACE GOTO :SKIP_REPLACE
@echo   if (uid ^>= 0) { // Replace >>!SCRIPT!
@echo     window.console.log("Deleting: " + video); >>!SCRIPT!
@echo     try { socket.emit("delete", uid) } catch (e){} >>!SCRIPT!
@echo     uid = -1;  >>!SCRIPT!
@echo   } >>!SCRIPT!
@echo: >>!SCRIPT!
:SKIP_REPLACE

@echo   if (uid ^>= 0) { >>!SCRIPT!
@echo      window.console.log("Duplicate: " + video); >>!SCRIPT!
@echo      delay = 100; >>!SCRIPT!
@echo    } >>!SCRIPT!
@echo    else { >>!SCRIPT!
@echo      window.console.log("Adding: " + video); >>!SCRIPT!
rem @echo      // video = video.replace(/\s/g,"%%20"); >>!SCRIPT!
@echo      socket.emit("queue", { id: roomURL + '/' + video, pos:"end", type:"fi", "temp":false }); >>!SCRIPT!
@echo    } >>!SCRIPT!
@echo: >>!SCRIPT!

@echo   setTimeout(()=^>{ loop++; addNewVideosLoop(loop); }, delay); >>!SCRIPT!
@echo } >>!SCRIPT!
@echo: >>!SCRIPT!

@echo function addNewVideos(){ >>!SCRIPT!
@echo   shuffleArray(newVideos); >>!SCRIPT!
@echo   setTimeout(()=^>{ addNewVideosLoop(0); }, defDelay); >>!SCRIPT!
@echo } >>!SCRIPT!
@echo: >>!SCRIPT!

@echo // socket.emit("clearPlaylist"); >>!SCRIPT!
@echo addNewVideos(); >>!SCRIPT!

EXIT
