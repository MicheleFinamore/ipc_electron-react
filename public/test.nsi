Section "-hidden section"
    CreateDirectory "$APPDATA\communication_folder"
    CreateDirectory "$APPDATA\configuration_folder"
    FileOpen $4 "$APPDATA\communication_folder\exetest.txt" w
    FileWrite $4 "{viewerPath : test}"
    FileClose $4
    ; ExecWait '"$EXEDIR\DesktopViewer Setup 2.0.0.exe"'
    ExecWait '"$EXEDIR\movefiles.bat"'
SectionEnd



