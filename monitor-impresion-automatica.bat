@echo off
cls
title Servicio Impresion Supermercado - ACTIVO
color 0A

REM Configurar para funcionar como servicio en segundo plano
mode con: cols=80 lines=25

echo.
echo  ╔══════════════════════════════════════════════════════════╗
echo  ║          🖨️  SERVICIO IMPRESION AUTOMATICA  🖨️          ║
echo  ╠══════════════════════════════════════════════════════════╣
echo  ║                                                          ║
echo  ║  ✅ Servicio iniciado automaticamente con Windows       ║
echo  ║  ✅ Monitoreo activo cada 5 segundos                    ║  
echo  ║  ✅ Impresion completamente automatica                  ║
echo  ║  ✅ Funciona en segundo plano                           ║
echo  ║                                                          ║
echo  ║  🌐 Endpoint: .../api/impresion/58mm-auto               ║
echo  ║  🖥️ Estado: SERVICIO ACTIVO                             ║
echo  ║                                                          ║
echo  ║  💡 Puedes minimizar esta ventana                       ║
echo  ║     El servicio seguira funcionando                     ║
echo  ║                                                          ║
echo  ╚══════════════════════════════════════════════════════════╝
echo.

REM Minimizar ventana automaticamente después de 10 segundos
start /min powershell -WindowStyle Hidden -Command "Start-Sleep 10; (New-Object -ComObject Shell.Application).MinimizeAll()"

set /a contador=0
set /a errores=0

:MONITOR_LOOP
set /a contador+=1

REM Mostrar estado cada 10 verificaciones para no saturar
set /a mostrar=contador%%10
if %mostrar%==0 (
    echo [%TIME%] 🔄 Verificacion #%contador% - Servicio activo [Errores: %errores%]
)

REM Generar ID unico para monitoreo
for /f "tokens=1-4 delims=:.," %%a in ("%time%") do set timestamp=%%a%%b%%c%%d
set MONITOR_ID=monitor_%timestamp%_%RANDOM%

REM Chrome en modo servicio - completamente silencioso
start /B "" "C:\Program Files\Google\Chrome\Application\chrome.exe" ^
--kiosk-printing ^
--kiosk ^
--no-default-browser-check ^
--disable-default-apps ^
--disable-popup-blocking ^
--disable-notifications ^
--no-first-run ^
--disable-extensions ^
--disable-plugins ^
--disable-sync ^
--disable-background-timer-throttling ^
--disable-backgrounding-occluded-windows ^
--disable-renderer-backgrounding ^
--autoplay-policy=no-user-gesture-required ^
--window-position=-2000,-2000 ^
--window-size=1,1 ^
"https://supermercadobackend.onrender.com/api/impresion/ticket/%MONITOR_ID%" >nul 2>&1

REM Verificar si Chrome se ejecuto correctamente
if %ERRORLEVEL% NEQ 0 set /a errores+=1

REM Esperar 5 segundos antes del siguiente chequeo (optimizado para servicio)
timeout /t 5 /nobreak >nul

REM Limpiar procesos Chrome obsoletos cada 50 verificaciones
set /a limpiar=contador%%50
if %limpiar%==0 (
    taskkill /F /IM chrome.exe /FI "COMMANDLINE eq *supermercadobackend*" >nul 2>&1
    echo [%TIME%] 🧹 Limpieza de procesos Chrome completada
)

goto MONITOR_LOOP
