@echo OFF
SetLocal EnableDelayedExpansion

SET CURL="N:\CyTube\curl\bin\curl.exe"

REM  https://curl.se/download.html
REM  https://curl.se/docs/manpage.html

%CURL% --version
@echo ----------------------------------------------------------------------------------------------------------------------------------

REM JackAndChat / wYATZ670bQ2r - HWM Temp
SET CB_USER=35659c837520eb5c59a55ea1e
SET SRC_DIR=N:\temp

REM LarryFlynt / wYATZ670bQ2r - Hentai
rem SET CB_USER=021789cf087302b7663971985

REM Bv5t3r / wYATZ670bQ2r - BLACKED Offline?
rem SET CB_USER=337846ce14bc5cdd8b36764b5

REM ClassicStars2022
rem SET CB_USER=a7e3d894d684b17e2fcdbb21d

REM CUR / x4fse7EjJ9E7
rem SET CB_USER=cccb6927dd4743f3860ef31b2

REM ----------------------------------------------------------------------------------------------------------------------------------

SET CB_FILES=!SRC_DIR!\catbox.rpt

PushD "!SRC_DIR!"
DEL /F /Q "%CB_FILES%" >NUL 2>NUL

FOR /F "usebackq delims==" %%I IN (`dir *.mp4 /b /s /Os`) DO (
  @echo %%I
  rem @echo "%%~nxI" >> "%CB_FILES%"

  REM %CURL% --progress-bar --ipv4 --max-time 600 --output "out.rpt" -F "reqtype=fileupload" -F "fileToUpload=@\"%%I\"" -F "time=1h" "https://litterbox.catbox.moe/resources/internals/api.php"
  SET ERRCODE=
  SET CMDLINE=%CURL% --progress-bar --ipv4 --max-time 600 --output "out.rpt" -F "userhash=!CB_USER!" -F "reqtype=fileupload" -F "fileToUpload=@\"%%I\"" "https://catbox.moe/user/api.php"
  @echo !CMDLINE! & !CMDLINE!
  SET /a ERRCODE=!ERRORLEVEL!
  @echo ERRORLEVEL: !ERRCODE!
  
  IF !ERRCODE! EQU 0 (
    type "out.rpt" >> "%CB_FILES%"
    @echo. >> "%CB_FILES%"
    @echo.
    type "out.rpt"
    @echo.
  ) ELSE (
    @echo. UPLOAD FAILED: "%%I" >> "%CB_FILES%"
  )
  @echo ----------------------------------------------------------------------------------------------------------------------------------
)
PopD

REM ----------------------------------------------------------------------------------------------------------------------------------
:END
PAUSE
EXIT
