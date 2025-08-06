@echo off
echo 🧪 PROBANDO IMPRESION AUTOMATICA...
echo.

echo 📌 PASO 1: Probando endpoint de ticket directo
echo URL: https://supermercadobackend.onrender.com/api/impresion/ticket/test123
pause

echo 📌 PASO 2: Abriendo Chrome en modo kiosk de impresion...
echo ⚠️  ATENCION: Se abrira Chrome y deberia imprimir automaticamente

"C:\Program Files\Google\Chrome\Application\chrome.exe" ^
--kiosk-printing ^
--kiosk ^
--no-default-browser-check ^
"https://supermercadobackend.onrender.com/api/impresion/ticket/test123"

echo.
echo ✅ PRUEBA COMPLETADA
echo.
echo 📋 QUE DEBIO PASAR:
echo 1. Chrome se abrio en pantalla completa
echo 2. Cargo la pagina del ticket
echo 3. Ejecuto window.print() automaticamente
echo 4. Tu impresora recibio el comando de impresion
echo 5. Chrome se cerro automaticamente
echo.
echo 💡 Si funciono, ejecuta: monitor-impresion-automatica.bat
echo    para monitoreo continuo en segundo plano
pause
