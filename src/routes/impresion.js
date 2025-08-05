const express = require('express');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const router = express.Router();

// Log para verificar que el módulo se carga
console.log('🖨️  Módulo de impresión cargado correctamente');

/**
 * SERVICIO DE IMPRESIÓN ULTRA COMPACTA INTEGRADO
 * PowerShell + .NET PrintDocument para envío directo
 */

/**
 * Envío directo con PowerShell - SIN notepad
 */
async function enviarConPowerShellDirecto(contenido) {
  return new Promise((resolve, reject) => {
    // Crear archivo temporal
    const tempFile = path.join(os.tmpdir(), `ps_direct_${Date.now()}.txt`);
    
    try {
      // Escribir contenido con comandos ESC/POS
      fs.writeFileSync(tempFile, contenido, 'binary');
      
      console.log('🔥 ENVIANDO CON POWERSHELL DIRECTO - SIN NOTEPAD');
      console.log('📄 Archivo:', tempFile);
      
      // PowerShell script para envío directo
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
                
                # Usar Graphics para envío directo
                $font = New-Object System.Drawing.Font("Courier New", 6)
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
      
      // Ejecutar PowerShell script
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
        // Limpiar archivo temporal
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
 * Generar ticket ULTRA COMPACTO con máximo aprovechamiento
 */
function generarTicketUltraCompacto(venta, items) {
  let ticket = '';
  
  // Comandos ESC/POS para máxima compactación
  ticket += '\x1B\x40';           // ESC @ - Reset
  ticket += '\x1B\x4D\x01';       // ESC M 1 - Font B (9x17) - MÁS PEQUEÑA
  ticket += '\x1B\x0F';           // ESC SI - Condensado ON
  ticket += '\x1B\x33\x00';       // ESC 3 0 - Espaciado línea mínimo
  ticket += '\x1B\x20\x00';       // ESC SP 0 - Espaciado char mínimo  
  ticket += '\x1D\x4C\x00\x00';   // GS L 0 0 - Margen izquierdo 0
  
  // Contenido - Font B + Condensado = hasta 56 caracteres
  const fecha = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
  const hora = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  const numero = venta.numero || Math.floor(Math.random() * 10000);
  
  // Encabezado ULTRA compacto
  ticket += '                        SUPERMERCADO\n';
  ticket += `${fecha} ${hora}                            #${numero}\n`;
  ticket += '========================================================\n';
  
  // Items aprovechando TODO el ancho
  items.forEach(item => {
    const maxNombre = 50; // Con Font B condensado
    const nombre = item.nombre.length > maxNombre ? 
                   item.nombre.substring(0, maxNombre - 2) + '..' : 
                   item.nombre;
    
    const total = (item.precio * item.cantidad).toFixed(0);
    
    // Línea del producto
    ticket += `${nombre}\n`;
    
    // Línea cantidad x precio = total (alineada)
    const lineaCantidad = `${item.cantidad}x${item.precio.toFixed(0)}`;
    const espaciosLibres = 56 - lineaCantidad.length - total.length - 1;
    const espacios = ' '.repeat(Math.max(1, espaciosLibres));
    
    ticket += `${lineaCantidad}${espacios}$${total}\n`;
  });
  
  // Total
  ticket += '========================================================\n';
  const totalStr = venta.total.toFixed(0);
  const espaciosTotal = 56 - 6 - totalStr.length - 1;
  ticket += `TOTAL:${' '.repeat(Math.max(1, espaciosTotal))}$${totalStr}\n`;
  
  // Método de pago
  const metodoPago = (venta.metodoPago || 'EFECTIVO').toUpperCase();
  ticket += `${metodoPago}\n`;
  
  // Pie ultra compacto
  ticket += '========================================================\n';
  ticket += '                       ¡GRACIAS!\n';
  ticket += '\n\n';
  
  // Corte automático
  ticket += '\x1D\x56\x42\x00';   // GS V B 0 - Corte parcial
  
  return ticket;
}

/**
 * ENDPOINT PRINCIPAL - IMPRESIÓN ULTRA COMPACTA
 * POST /api/impresion/58mm-auto
 */
router.post('/58mm-auto', async (req, res) => {
  try {
    const { venta, items } = req.body;
    
    console.log('🎫 =================================================');
    console.log('🎫 IMPRESIÓN ULTRA COMPACTA - BACKEND INTEGRADO');
    console.log('🎫 =================================================');
    console.log('📋 Total:', venta.total, '- Items:', items.length);
    console.log('🔤 Font B (9x17) + Condensado = 56 caracteres/línea');
    console.log('📏 Aprovecha TODO el ancho del papel (58mm)');
    console.log('🚀 Enviando con PowerShell directo (SIN notepad)...');
    
    // Generar ticket ultra compacto
    const ticketCompacto = generarTicketUltraCompacto(venta, items);
    
    // Enviar con PowerShell directo
    const resultado = await enviarConPowerShellDirecto(ticketCompacto);
    
    console.log('✅ TICKET ULTRA COMPACTO ENVIADO DESDE BACKEND');
    console.log(`🎯 Método usado: ${resultado.method}`);
    console.log('📐 56 caracteres por línea - TODO el ancho usado');
    
    res.json({ 
      success: true, 
      message: `Ticket ultra compacto enviado - ${resultado.method}`,
      method: resultado.method,
      caracteresPorLinea: 56,
      fontUsada: 'Font B (9x17) + Condensado',
      servidor: 'Backend Integrado Puerto 3000'
    });
    
  } catch (error) {
    console.error('❌ ERROR EN IMPRESIÓN ULTRA COMPACTA:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Error en impresión ultra compacta',
      details: error.message 
    });
  }
});

/**
 * ENDPOINT DE ESTADO DEL SERVICIO DE IMPRESIÓN
 * GET /api/impresion/status
 */
router.get('/status', (req, res) => {
  res.json({
    servicio: 'Impresión Ultra Compacta',
    estado: 'Activo',
    puerto: process.env.PORT || 3000,
    caracteristicas: [
      'Font B (9x17) - letra más pequeña',
      'Modo condensado - 56 caracteres por línea',
      'PowerShell directo - sin notepad',
      'Márgenes 0 - aprovecha todo el papel',
      'Integrado en backend principal'
    ],
    endpoints: [
      'POST /api/impresion/58mm-auto - Impresión automática',
      'GET /api/impresion/status - Estado del servicio'
    ]
  });
});

module.exports = router;
