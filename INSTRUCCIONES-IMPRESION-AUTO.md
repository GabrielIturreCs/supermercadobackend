# 🖨️ SERVICIO AUTOMATICO: RENDER → TU IMPRESORA LOCAL

## 🎯 ¿QUÉ LOGRARÁS?

Un **servicio permanente** que se ejecuta automáticamente al iniciar Windows y conecta tu impresora local con Render sin intervención manual. **Una sola instalación, funciona para siempre.**

## ⚡ COMO FUNCIONA:

```
[INICIO WINDOWS] → [SERVICIO ACTIVO] → [VENTA EN RENDER] → [IMPRIME AUTOMÁTICO]
```

1. **Windows inicia** → El servicio se activa automáticamente
2. **Servicio monitorea** Render cada 5 segundos en segundo plano
3. **Detecta venta nueva** → Chrome kiosk se abre invisible
4. **Tu impresora** recibe el ticket e imprime sin diálogos

## 🚀 INSTALACIÓN (SOLO UNA VEZ):

### PASO 1: Commit y Deploy
```bash
git add .
git commit -m "🔧 Servicio automático impresión implementado"
git push
```

### PASO 2: Instalar Servicio Permanente
```bash
# EJECUTAR COMO ADMINISTRADOR (clic derecho → "Ejecutar como administrador")
instalar-servicio-impresion.bat
```

### PASO 3: ¡Listo! 
**El servicio ya está funcionando y se ejecutará automáticamente cada vez que inicies Windows.**

## 🧪 PROBAR:

1. **Ejecuta**: `probar-impresion-inmediata.bat` (para verificar)
2. **Reinicia tu PC** → El servicio debe iniciarse automáticamente
3. **Haz una venta** → Debe imprimir automáticamente

## 📋 ARCHIVOS PARA EL SERVICIO:

- 🔧 `instalar-servicio-impresion.bat` - **Instalador único** (ejecutar como admin)
- 🗑️ `desinstalar-servicio-impresion.bat` - Desinstalador completo
- 🧪 `probar-impresion-inmediata.bat` - Prueba rápida
- 🔄 `monitor-impresion-automatica.bat` - Motor del servicio

## 💡 USO DIARIO:

1. **Enciendes tu PC** → ✅ Servicio se inicia automáticamente
2. **Trabajas normalmente** → ✅ Impresión automática en segundo plano  
3. **Apagas tu PC** → ✅ Servicio se detiene automáticamente
4. **Reinicias Windows** → ✅ Servicio se activa de nuevo

**¡NO TIENES QUE HACER NADA MÁS!** 🎉

## 🔧 QUE INSTALA EL SERVICIO:

- ✅ **Directorio**: `C:\SupermercadoImpresion\` - Archivos del servicio
- ✅ **Registro Windows**: Entrada de inicio automático  
- ✅ **Acceso directo**: "Control Impresion Supermercado" en escritorio
- ✅ **Proceso en segundo plano**: Monitor permanente activo

## 🎛️ CONTROLES DEL SERVICIO:

- **🔍 Ver estado**: Doble clic en acceso directo del escritorio
- **⏹️ Detener temporalmente**: Ctrl+C en ventana del servicio
- **🔄 Reiniciar**: Doble clic en acceso directo nuevamente  
- **🗑️ Desinstalar completamente**: `desinstalar-servicio-impresion.bat`

## ⚠️ VENTAJAS DEL SERVICIO:

- ✅ **Una sola instalación** - Funciona para siempre
- ✅ **Inicio automático** - No necesitas recordar ejecutar nada
- ✅ **Segundo plano** - No interfiere con tu trabajo
- ✅ **Sobrevive reinicios** - Siempre activo después de Windows
- ✅ **Limpieza automática** - Se mantiene optimizado
- ✅ **Fácil desinstalación** - Un clic para eliminar todo

¡Tu servicio de impresión automática permanente está listo! 🎉🖨️🔧
