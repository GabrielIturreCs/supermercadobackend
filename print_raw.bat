@echo off
copy /b "C:\Users\gabriel\Desktop\supermeercadoapp\backend\temp_ticket.txt" "\\DESKTOP-GFU5HHN\XP-58" >nul 2>&1
if errorlevel 1 (
  copy /b "C:\Users\gabriel\Desktop\supermeercadoapp\backend\temp_ticket.txt" PRN >nul 2>&1
)