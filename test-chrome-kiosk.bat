@echo off
echo 🧪 TESTING CHROME KIOSK PRINTING LOCALMENTE...
echo.

echo 📌 PASO 1: Probando endpoint de ticket...
echo Abriendo: https://supermercadobackend.onrender.com/api/impresion/ticket/test123
start "" "https://supermercadobackend.onrender.com/api/impresion/ticket/test123"

timeout /t 3

echo.
echo 📌 PASO 2: Probando Chrome Kiosk Mode...
echo ATENCION: Se abrirá Chrome en modo kiosk e imprimirá automáticamente
echo Presiona cualquier tecla para continuar o Ctrl+C para cancelar...
pause

echo Ejecutando Chrome Kiosk...
"C:\Program Files\Google\Chrome\Application\chrome.exe" --kiosk-printing --kiosk "https://supermercadobackend.onrender.com/api/impresion/ticket/test123"

echo.
echo ✅ PRUEBA COMPLETADA
echo.
echo 📋 QUE DEBIO PASAR:
echo 1. Se abrió página del ticket en navegador normal
echo 2. Se abrió Chrome en pantalla completa (kiosk)
echo 3. Se ejecutó window.print() automáticamente  
echo 4. Apareció diálogo de impresión o imprimió directo
echo 5. Chrome se cerró automáticamente
echo.
echo 💡 Si funcionó aquí, funcionará en Render con impresora conectada
pause
