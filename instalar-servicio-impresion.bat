@echo off
title INSTALADOR - SERVICIO IMPRESION AUTOMATICA
color 0E

echo.
echo ========================================================
echo   🚀 INSTALADOR SERVICIO IMPRESION AUTOMATICA 🚀
echo ========================================================
echo.
echo Este instalador creara un servicio que:
echo ✅ Se ejecuta automaticamente al iniciar Windows
echo ✅ Siempre esta corriendo en segundo plano
echo ✅ No necesitas ejecutar nada manualmente
echo ✅ Sobrevive a reinicios y actualizaciones
echo.
echo ⚠️  REQUIERE PERMISOS DE ADMINISTRADOR ⚠️
pause

echo.
echo 📁 Creando directorio del servicio...
if not exist "C:\SupermercadoImpresion" mkdir "C:\SupermercadoImpresion"

echo 📄 Copiando archivos del servicio...
copy "%~dp0monitor-impresion-automatica.bat" "C:\SupermercadoImpresion\monitor-servicio.bat"

echo 🔧 Creando script del servicio...
(
echo @echo off
echo cd /d "C:\SupermercadoImpresion"
echo title Servicio Impresion Supermercado
echo :LOOP
echo call monitor-servicio.bat
echo timeout /t 5 /nobreak ^> nul
echo goto LOOP
) > "C:\SupermercadoImpresion\servicio-impresion.bat"

echo 🔑 Creando entrada en el registro para inicio automatico...
reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Run" /v "SupermercadoImpresion" /t REG_SZ /d "C:\SupermercadoImpresion\servicio-impresion.bat" /f

echo 🎯 Creando acceso directo en el escritorio...
powershell -Command "$WScript = New-Object -ComObject WScript.Shell; $Shortcut = $WScript.CreateShortcut('%USERPROFILE%\Desktop\Control Impresion Supermercado.lnk'); $Shortcut.TargetPath = 'C:\SupermercadoImpresion\servicio-impresion.bat'; $Shortcut.WorkingDirectory = 'C:\SupermercadoImpresion'; $Shortcut.IconLocation = 'shell32.dll,21'; $Shortcut.Description = 'Servicio Impresion Automatica Supermercado'; $Shortcut.Save()"

echo 🚀 Iniciando servicio por primera vez...
start "" "C:\SupermercadoImpresion\servicio-impresion.bat"

echo.
echo ========================================================
echo               ✅ INSTALACION COMPLETADA ✅
echo ========================================================
echo.
echo 🎉 El servicio ya esta corriendo y se ejecutara automaticamente
echo    cada vez que inicies Windows
echo.
echo 📋 QUE SE INSTALO:
echo    • Servicio en: C:\SupermercadoImpresion\
echo    • Inicio automatico configurado
echo    • Acceso directo en el escritorio
echo    • Proceso corriendo en segundo plano
echo.
echo 🔧 CONTROLES:
echo    • Detener: Ctrl+C en la ventana del servicio
echo    • Reiniciar: Doble clic en "Control Impresion Supermercado"
echo    • Desinstalar: ejecutar desinstalar-servicio-impresion.bat
echo.
echo ✅ Tu impresora ya esta conectada a Render automaticamente!
pause
