; Ports installer-full.iss's NeedsNpcap check into electron-builder's NSIS installer:
; install the bundled Npcap driver only if it isn't already present on the system.
; Free Npcap doesn't support silent (/S) install - only Npcap OEM does - so its own
; installer wizard is shown here instead (same approach Wireshark's installer uses).
!macro customInstall
  IfFileExists "$SYSDIR\drivers\npcap.sys" npcap_installed 0
    DetailPrint "Installing Npcap driver..."
    FindFirst $0 $1 "$INSTDIR\resources\dependencies\npcap-*.exe"
    StrCmp $1 "" npcap_notfound 0
      ExecWait '"$INSTDIR\resources\dependencies\$1"'
    npcap_notfound:
    FindClose $0
  npcap_installed:
!macroend
