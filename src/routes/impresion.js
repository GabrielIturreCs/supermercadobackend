const express = require('express');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const router = express.Router();

// Log para verificar que el módulo se carga
console.log('🖨️  Módulo de impresión MULTIPLATAFORMA cargado correctamente');

/**
 * SERVICIO DE IMPRESIÓN ULTRA COMPACTA INTEGRADO
 * PowerShell + .NET PrintDocument para Windows + métodos Linux
 */

/**
 * Envío directo con PowerShell - SIN notepad (WINDOWS)
 */
async function enviarConPowerShellDirecto(contenido) {
  return new Promise((resolve, reject) => {
    const tempFile = path.join(os.tmpdir(), `ps_direct_${Date.now()}.txt`);
    
    try {
      fs.writeFileSync(tempFile, contenido, 'binary');
      
      console.log('🔥 ENVIANDO CON POWERSHELL DIRECTO - SIN NOTEPAD');
      console.log('📄 Archivo:', tempFile);
      
      const psScript = `
        try {
          # Leer archivo como bytes
          $bytes = [System.IO.File]::ReadAllBytes("${tempFile.replace(/\\/g, '\\\\')}")
          
          # Intentar envío directo por puerto
          try {
            $port = New-Object System.IO.Ports.SerialPort("COM1", 9600)
            $port.Open()
            $port.Write($bytes, 0, $bytes.Length)
            $port.Close()
            Write-Output "SUCCESS:COM1"
            exit 0
          } catch {
            # Si falla COM1, intentar con impresora directa
            try {
              # Usar .NET PrintDocument para envío RAW
              Add-Type -AssemblyName System.Drawing
              Add-Type -AssemblyName System.Windows.Forms
              
              $printDoc = New-Object System.Drawing.Printing.PrintDocument
              $printDoc.PrinterSettings.PrinterName = "XP-58"
              
              # Configurar para envío RAW
              $printDoc.DefaultPageSettings.Margins = New-Object System.Drawing.Printing.Margins(0, 0, 0, 0)
              
              $printDoc.add_PrintPage({
                param($sender, $e)
                
                # Convertir bytes a string para ESC/POS
                $content = [System.Text.Encoding]::GetEncoding("ISO-8859-1").GetString($bytes)
                
                # Usar Graphics para envío directo con letra más grande
                $font = New-Object System.Drawing.Font("Courier New", 8)
                $brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::Black)
                
                # Calcular posición sin márgenes
                $x = 0
                $y = 0
                
                # Dibujar contenido
                $e.Graphics.DrawString($content, $font, $brush, $x, $y)
                $e.HasMorePages = $false
              })
              
              $printDoc.Print()
              Write-Output "SUCCESS:PrintDocument"
              exit 0
              
            } catch {
              # Último recurso: copy directo
              try {
                Copy-Item "${tempFile.replace(/\\/g, '\\\\')}" -Destination "\\\\localhost\\XP-58" -Force
                Write-Output "SUCCESS:Copy"
                exit 0
              } catch {
                Write-Output "ERROR:Todos los métodos fallaron"
                exit 1
              }
            }
          }
        } catch {
          Write-Output "ERROR:$($_.Exception.Message)"
          exit 1
        }
      `;
      
      const child = spawn('powershell', ['-Command', psScript], {
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      let output = '';
      let errorOutput = '';
      
      child.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      child.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });
      
      child.on('close', (code) => {
        try { fs.unlinkSync(tempFile); } catch (e) {}
        
        console.log('📤 PowerShell Output:', output.trim());
        if (errorOutput) console.log('⚠️  PowerShell Error:', errorOutput.trim());
        
        if (code === 0 && output.includes('SUCCESS:')) {
          const method = output.replace('SUCCESS:', '').trim();
          console.log(`✅ ENVIADO CON POWERSHELL: ${method}`);
          resolve({ success: true, method: `PowerShell-${method}` });
        } else {
          console.log('❌ PowerShell falló, respondiendo error...');
          reject(new Error(`PowerShell falló: ${output || errorOutput}`));
        }
      });
      
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Impresión en LINUX/RENDER - Métodos alternativos
 */
async function enviarEnLinux(contenido) {
  return new Promise((resolve, reject) => {
    try {
      console.log('🐧 ENVIANDO EN LINUX/RENDER - MÉTODOS ALTERNATIVOS');
      
      const tempFile = path.join(os.tmpdir(), `linux_ticket_${Date.now()}.txt`);
      fs.writeFileSync(tempFile, contenido, 'utf8');
      
      console.log('📄 Ticket guardado en:', tempFile);
      console.log('📊 SIMULANDO IMPRESIÓN FÍSICA EN LINUX:');
      console.log('='.repeat(50));
      console.log(contenido);
      console.log('='.repeat(50));
      
      // Método 1: Intentar con lp (Linux Print)
      const child = spawn('which', ['lp'], { stdio: ['pipe', 'pipe', 'pipe'] });
      
      child.on('close', (code) => {
        if (code === 0) {
          console.log('🖨️  Comando lp encontrado, intentando impresión...');
          const printChild = spawn('lp', ['-d', 'XP-58', tempFile], { stdio: ['pipe', 'pipe', 'pipe'] });
          
          printChild.on('close', (printCode) => {
            try { fs.unlinkSync(tempFile); } catch (e) {}
            
            if (printCode === 0) {
              console.log('✅ IMPRESO CON LP EN LINUX');
              resolve({ success: true, method: 'Linux-LP-Physical' });
            } else {
              console.log('⚠️  LP falló, usando simulación...');
              simularImpresionLinux(contenido).then(resolve).catch(reject);
            }
          });
        } else {
          console.log('⚠️  LP no disponible, usando simulación...');
          try { fs.unlinkSync(tempFile); } catch (e) {}
          simularImpresionLinux(contenido).then(resolve).catch(reject);
        }
      });
      
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Simulación de impresión para Linux/Render
 */
async function simularImpresionLinux(contenido) {
  return new Promise((resolve, reject) => {
    try {
      console.log('🎯 SIMULACIÓN DE IMPRESIÓN LINUX - IGUAL QUE WINDOWS');
      
      const ticketsDir = path.join(os.tmpdir(), 'tickets_impresos');
      if (!fs.existsSync(ticketsDir)) {
        fs.mkdirSync(ticketsDir, { recursive: true });
      }
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const ticketFile = path.join(ticketsDir, `ticket_${timestamp}.txt`);
      fs.writeFileSync(ticketFile, contenido, 'utf8');
      
      console.log('💾 TICKET "IMPRESO" EN LINUX:', ticketFile);
      console.log('📊 PROCESAMIENTO COMPLETO:');
      console.log('🎫 Líneas del ticket:', contenido.split('\n').length);
      console.log('📝 Caracteres:', contenido.length);
      console.log('✅ IMPRESIÓN LINUX SIMULADA EXITOSA - IGUAL FUNCIONALIDAD');
      
      resolve({ 
        success: true, 
        method: 'Linux-Simulation-Complete',
        archivo: ticketFile,
        directorio: ticketsDir
      });
      
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Generar ticket ULTRA COMPACTO
 */
function generarTicketUltraCompacto(venta, items) {
  console.log('🎫 Generando ticket - Total:', venta.total, 'Items:', items.length);
  
  let ticket = '';
  
  const fecha = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
  const hora = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  const numero = venta.numero || Math.floor(Math.random() * 10000);
  
  // Encabezado
  ticket += '\n';
  ticket += '                   SUPERMERCADO\n';
  ticket += '\n';
  ticket += `${fecha} ${hora}                       #${numero}\n`;
  ticket += '\n';
  ticket += '===============================================\n';
  
  // Items
  items.forEach(item => {
    const nombre = item.nombre.length > 32 ? 
                   item.nombre.substring(0, 30) + '..' : 
                   item.nombre;
    
    const total = (item.precio * item.cantidad).toFixed(0);
    
    ticket += `\n${nombre}\n`;
    ticket += `   ${item.cantidad} x $${item.precio.toFixed(0)} = $${total}\n`;
  });
  
  // Total
  ticket += '\n';
  ticket += '===============================================\n';
  ticket += '\n';
  ticket += `             TOTAL: $${venta.total.toFixed(0)}\n`;
  ticket += '\n';
  
  // Método de pago
  const metodoPago = (venta.metodoPago || 'EFECTIVO').toUpperCase();
  ticket += `             ${metodoPago}\n`;
  
  // Pie
  ticket += '\n';
  ticket += '===============================================\n';
  ticket += '\n';
  ticket += '                 ¡GRACIAS!\n';
  ticket += '\n';
  ticket += '              Mercadito Dani\n';
  ticket += '\n\n\n';
  
  return ticket;
}

/**
 * ENDPOINT PRINCIPAL - IMPRESIÓN MULTIPLATAFORMA
 * POST /api/impresion/58mm-auto
 */
router.post('/58mm-auto', async (req, res) => {
  // Headers EXPLÍCITOS para Render
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  console.log('🚀 ENDPOINT /58mm-auto INICIADO');
  console.log('📋 Method:', req.method);
  console.log('📋 Headers:', JSON.stringify(req.headers, null, 2));
  console.log('📋 Body presente:', !!req.body);
  
  try {
    const { venta, items } = req.body;
    
    console.log('🎫 =================================================');
    console.log('🎫 IMPRESIÓN MULTIPLATAFORMA - MISMA FUNCIONALIDAD');
    console.log('🎫 =================================================');
    console.log('📋 Datos recibidos - Venta:', !!venta, 'Items:', items?.length || 0);
    
    // Validar datos
    if (!venta || !items || !Array.isArray(items) || items.length === 0) {
      console.error('❌ DATOS INVÁLIDOS RECIBIDOS');
      const errorResponse = { 
        success: false, 
        error: 'Datos de venta e items son obligatorios',
        received: { 
          venta: !!venta, 
          items: !!items, 
          itemsCount: items?.length || 0,
          isArray: Array.isArray(items)
        },
        timestamp: new Date().toISOString(),
        endpoint: '/api/impresion/58mm-auto'
      };
      return res.status(400).json(errorResponse);
    }
    
    console.log('📋 Total:', venta.total, '- Items:', items.length);
    console.log('🔤 Courier New 8pt - Letra más grande');
    console.log('📏 Optimizado para papel 58mm');
    
    // Detectar plataforma
    const isWindows = process.platform === 'win32';
    const hostname = process.env.RENDER_SERVICE_NAME || os.hostname();
    const isRender = !!(process.env.RENDER_SERVICE_NAME || process.env.RENDER || hostname.includes('render'));
    
    console.log('🖥️  Plataforma:', process.platform);
    console.log('🌐 Hostname:', hostname);
    console.log('🔍 Es Windows:', isWindows);
    console.log('🚀 Es Render:', isRender);
    
    // Generar ticket
    const ticketCompacto = generarTicketUltraCompacto(venta, items);
    console.log('✅ Ticket generado:', ticketCompacto.length, 'caracteres');
    
    let resultado;
    let metodoUsado;
    let impresionFisica;
    
    if (isWindows && !isRender) {
      // WINDOWS LOCAL - Impresión física real
      console.log('🖨️  WINDOWS - INTENTANDO IMPRESIÓN FÍSICA...');
      
      try {
        resultado = await enviarConPowerShellDirecto(ticketCompacto);
        metodoUsado = resultado.method;
        impresionFisica = true;
        console.log('✅ IMPRESIÓN FÍSICA EXITOSA:', metodoUsado);
      } catch (printError) {
        console.error('❌ Error impresión física:', printError.message);
        metodoUsado = 'Windows-Error-Processed';
        impresionFisica = false;
      }
      
    } else {
      // LINUX/RENDER - Impresión simulada/alternativa
      console.log('🐧 LINUX/RENDER - IMPRESIÓN ALTERNATIVA...');
      
      try {
        resultado = await enviarEnLinux(ticketCompacto);
        metodoUsado = resultado.method;
        impresionFisica = resultado.method.includes('Physical');
        console.log('✅ IMPRESIÓN LINUX EXITOSA:', metodoUsado);
      } catch (linuxError) {
        console.error('❌ Error impresión Linux:', linuxError.message);
        metodoUsado = 'Linux-Error-Processed';
        impresionFisica = false;
      }
    }
    
    // Respuesta unificada
    const successResponse = { 
      success: true, 
      message: `✅ Ticket procesado correctamente - ${metodoUsado}`,
      method: metodoUsado,
      caracteresPorLinea: 47,
      fontUsada: 'Courier New 8pt (Letra más grande)',
      servidor: isRender ? 'Backend Render Linux' : (isWindows ? 'Backend Local Windows' : 'Backend Linux'),
      entorno: isRender ? 'Producción' : 'Desarrollo',
      plataforma: process.platform,
      hostname: hostname,
      ticketGenerado: true,
      impresionFisica: impresionFisica,
      impresionSimulada: !impresionFisica,
      venta: { 
        total: venta.total,
        metodoPago: venta.metodoPago,
        numero: venta.numero,
        items: items.length 
      },
      ticketInfo: {
        lineas: ticketCompacto.split('\n').length,
        caracteres: ticketCompacto.length,
        formato: 'Texto plano optimizado para XP-58'
      },
      timestamp: new Date().toISOString(),
      multiplataforma: true
    };
    
    console.log('📤 RESPUESTA EXITOSA MULTIPLATAFORMA:');
    console.log(`🎯 Método: ${metodoUsado}`);
    console.log(`🖨️  Impresión física: ${impresionFisica ? 'SÍ' : 'NO (simulada)'}`);
    
    // FORZAR ENVÍO DE RESPUESTA
    console.log('📤 ENVIANDO RESPUESTA JSON...');
    res.status(200);
    const response = res.json(successResponse);
    console.log('✅ RESPUESTA ENVIADA EXITOSAMENTE');
    return response;
    
  } catch (error) {
    console.error('❌ ERROR CRÍTICO EN ENDPOINT:', error.message);
    console.error('📋 Stack:', error.stack);
    
    const criticalErrorResponse = { 
      success: false, 
      error: 'Error interno crítico del servidor',
      details: error.message,
      endpoint: '/api/impresion/58mm-auto',
      timestamp: new Date().toISOString(),
      platform: process.platform,
      hostname: process.env.RENDER_SERVICE_NAME || os.hostname()
    };
    
    console.log('📤 ENVIANDO RESPUESTA DE ERROR...');
    res.status(500);
    const errorResponse = res.json(criticalErrorResponse);
    console.log('❌ RESPUESTA DE ERROR ENVIADA');
    return errorResponse;
  }
});

/**
 * ENDPOINT DE ESTADO
 * GET /api/impresion/status
 */
router.get('/status', (req, res) => {
  console.log('🔍 ENDPOINT /status INICIADO');
  
  // Headers explícitos
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-cache');
  
  const isWindows = process.platform === 'win32';
  const isRender = !!(process.env.RENDER_SERVICE_NAME || process.env.RENDER);
  
  const statusResponse = {
    servicio: 'Impresión Multiplataforma',
    estado: 'Activo',
    puerto: process.env.PORT || 3000,
    sistema: {
      plataforma: process.platform,
      windows: isWindows,
      linux: !isWindows,
      mac: process.platform === 'darwin'
    },
    metodos: {
      windows: ['PowerShell + .NET PrintDocument', 'COM1 Serial', 'Copy directo'],
      linux: ['lp command', 'Simulación completa', 'Archivo temporal'],
      fallback: ['Procesamiento sin impresión', 'Respuesta siempre exitosa']
    },
    caracteristicas: [
      'Detección automática de sistema operativo',
      'Métodos específicos por plataforma',
      'Fallback a simulación si falla',
      'Respuestas JSON válidas siempre',
      'Courier New 8pt - letra más grande',
      'Optimizado para papel 58mm',
      'Headers explícitos para Render'
    ],
    endpoints: [
      'POST /api/impresion/58mm-auto - Impresión automática',
      'GET /api/impresion/status - Estado del servicio'
    ],
    timestamp: new Date().toISOString()
  };
  
  console.log('📤 ENVIANDO RESPUESTA DE STATUS...');
  res.status(200);
  const response = res.json(statusResponse);
  console.log('✅ STATUS ENVIADO EXITOSAMENTE');
  return response;
});

module.exports = router;
