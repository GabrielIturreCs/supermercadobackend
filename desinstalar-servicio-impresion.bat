@echo off
title DESINSTALADOR - SERVICIO IMPRESION AUTOMATICA
color 0C

echo.
echo ========================================================
echo   🗑️  DESINSTALADOR SERVICIO IMPRESION AUTOMATICA 🗑️
echo ========================================================
echo.
echo Este desinstalador:
echo ❌ Detendra el servicio de impresion
echo ❌ Eliminara el inicio automatico
echo ❌ Borrara todos los archivos del servicio
echo ❌ Limpiara el registro de Windows
echo.
echo ⚠️  REQUIERE PERMISOS DE ADMINISTRADOR ⚠️
pause

echo.
echo 🛑 Deteniendo procesos del servicio...
taskkill /F /IM cmd.exe /FI "WINDOWTITLE eq Servicio Impresion Supermercado*" >nul 2>&1
taskkill /F /IM chrome.exe /FI "COMMANDLINE eq *supermercadobackend*" >nul 2>&1

echo 🔑 Eliminando entrada del registro...
reg delete "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Run" /v "SupermercadoImpresion" /f >nul 2>&1

echo 🗑️ Eliminando archivos del servicio...
if exist "C:\SupermercadoImpresion" (
    rmdir /s /q "C:\SupermercadoImpresion"
)

echo 🎯 Eliminando acceso directo del escritorio...
if exist "%USERPROFILE%\Desktop\Control Impresion Supermercado.lnk" (
    del "%USERPROFILE%\Desktop\Control Impresion Supermercado.lnk"
)

echo.
echo ========================================================
echo             ✅ DESINSTALACION COMPLETADA ✅
echo ========================================================
echo.
echo 🎉 El servicio de impresion automatica ha sido eliminado completamente
echo.
echo 📋 QUE SE ELIMINO:
echo    • Servicio de impresion automatica
echo    • Inicio automatico de Windows
echo    • Archivos en C:\SupermercadoImpresion\
echo    • Acceso directo del escritorio
echo    • Procesos en segundo plano
echo.
echo 💡 Para volver a instalar, ejecuta: instalar-servicio-impresion.bat
pause
