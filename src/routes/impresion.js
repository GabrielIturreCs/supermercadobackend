const express = require('express');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Importar nodemailer para email printing
let nodemailer;
try {
  nodemailer = require('nodemailer');
} catch (e) {
  console.log('Nodemailer no disponible, email printing deshabilitado');
  nodemailer = null;
}

// Para fetch en versiones anteriores de Node.js
let fetch;
try {
  fetch = globalThis.fetch;
  if (!fetch) {
    fetch = require('node-fetch');
  }
} catch (e) {
  console.log('Fetch no disponible, impresion local deshabilitada');
  fetch = null;
}

// ===== CONFIGURACIONES DE SERVICIOS DE IMPRESION =====
const PRINT_CONFIG = {
  // Configuración de email para impresora (puedes configurar tu email de impresora)
  EMAIL_PRINTER: {
    enabled: process.env.EMAIL_PRINT_ENABLED !== 'false', // Habilitado por defecto
    printerEmail: process.env.PRINTER_EMAIL || 'impresora@supermercado.com',
    fromEmail: process.env.FROM_EMAIL || 'supermercado@tudominio.com',
    smtpConfig: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    }
  },
  
  // Configuración de servicio de impresión en la nube (PrintNode, etc.)
  CLOUD_PRINT: {
    enabled: process.env.CLOUD_PRINT_ENABLED === 'true',
    apiKey: process.env.PRINTNODE_API_KEY,
    printerId: process.env.PRINTER_ID,
    service: process.env.CLOUD_PRINT_SERVICE || 'printnode' // printnode, google, etc.
  }
};

const router = express.Router();

console.log('Modulo de impresion MULTIPLATAFORMA con IMPRESION FISICA AUTOMATICA');

/**
 * Envío directo con PowerShell (WINDOWS LOCAL)
 */
async function enviarConPowerShellDirecto(contenido) {
  return new Promise((resolve, reject) => {
    const tempFile = path.join(os.tmpdir(), `ps_direct_${Date.now()}.txt`);
    
    try {
      fs.writeFileSync(tempFile, contenido, 'binary');
      console.log('ENVIANDO CON POWERSHELL DIRECTO A IMPRESORA...');
      
      const psScript = `
        try {
          $bytes = [System.IO.File]::ReadAllBytes("${tempFile.replace(/\\/g, '\\\\')}")
          
          try {
            $port = New-Object System.IO.Ports.SerialPort("COM1", 9600)
            $port.Open()
            $port.Write($bytes, 0, $bytes.Length)
            $port.Close()
            Write-Output "SUCCESS:COM1"
            exit 0
          } catch {
            try {
              Add-Type -AssemblyName System.Drawing
              Add-Type -AssemblyName System.Windows.Forms
              
              $printDoc = New-Object System.Drawing.Printing.PrintDocument
              $printDoc.PrinterSettings.PrinterName = "XP-58"
              $printDoc.DefaultPageSettings.Margins = New-Object System.Drawing.Printing.Margins(0, 0, 0, 0)
              
              $printDoc.add_PrintPage({
                param($sender, $e)
                $content = [System.Text.Encoding]::GetEncoding("ISO-8859-1").GetString($bytes)
                $font = New-Object System.Drawing.Font("Courier New", 8)
                $brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::Black)
                $e.Graphics.DrawString($content, $font, $brush, 0, 0)
                $e.HasMorePages = $false
              })
              
              $printDoc.Print()
              Write-Output "SUCCESS:PrintDocument"
              exit 0
            } catch {
              Write-Output "ERROR:Impresion fallo"
              exit 1
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
      
      child.stdout.on('data', (data) => { output += data.toString(); });
      child.stderr.on('data', (data) => { errorOutput += data.toString(); });
      
      child.on('close', (code) => {
        try { fs.unlinkSync(tempFile); } catch (e) {}
        
        if (code === 0 && output.includes('SUCCESS:')) {
          const method = output.replace('SUCCESS:', '').trim();
          console.log(`IMPRESION FISICA EXITOSA: ${method}`);
          resolve({ success: true, method: `PowerShell-${method}` });
        } else {
          reject(new Error(`PowerShell fallo: ${output || errorOutput}`));
        }
      });
      
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Procesamiento completo INDEPENDIENTE para Linux/Render CON IMPRESION REAL
 */
async function procesarImpresionCompleta(contenido) {
  return new Promise(async (resolve, reject) => {
    try {
      console.log('PROCESAMIENTO RENDER CON IMPRESION FISICA REAL');
      
      const ticketsDir = path.join(os.tmpdir(), 'tickets_procesados');
      if (!fs.existsSync(ticketsDir)) {
        fs.mkdirSync(ticketsDir, { recursive: true });
      }
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const ticketFile = path.join(ticketsDir, `ticket_procesado_${timestamp}.txt`);
      
      const lineas = contenido.split('\n').length;
      const caracteres = contenido.length;
      const productos = (contenido.match(/x \\$/g) || []).length;
      
      const contenidoOptimizado = contenido
        .replace(/\n{3,}/g, '\n\n')
        .replace(/\s+$/gm, '')
        .trim();
      
      console.log('ENVIANDO A SERVICIO DE IMPRESION EN LA NUBE...');
      console.log('='.repeat(50));
      console.log(contenidoOptimizado);
      console.log('='.repeat(50));
      
      // IMPRESION FISICA INTELIGENTE - MULTIPLES METODOS
      let impresionExitosa = false;
      let metodoImpresion = 'Virtual';
      let detalleError = '';
      const ticketId = timestamp.replace(/[-T:.]/g, '').substring(0, 12);
      
      console.log('🖨️ Intentando impresión física...');
      
      // INTENTO 1: Chrome Kiosk Printing (más confiable en servidores)
      try {
        console.log('🌐 Intentando Chrome Kiosk Printing...');
        const resultado = await enviarAChromeKiosk(contenidoOptimizado, ticketId);
        impresionExitosa = true;
        metodoImpresion = 'Chrome-Kiosk-Printing';
        console.log('✅ CHROME KIOSK EXITOSO');
      } catch (chromeError) {
        console.log('⚠️ Chrome Kiosk falló:', chromeError.message);
        detalleError += `ChromeKiosk: ${chromeError.message}; `;
      }
      
      // INTENTO 2: Cloud Print Service (fallback)
      if (!impresionExitosa && PRINT_CONFIG.CLOUD_PRINT.enabled && PRINT_CONFIG.CLOUD_PRINT.apiKey) {
        try {
          console.log('🌐 Intentando Cloud Print Service...');
          const resultado = await enviarAServicioImpresion(contenidoOptimizado);
          impresionExitosa = true;
          metodoImpresion = 'Cloud-Print-Service';
          console.log('✅ CLOUD PRINT EXITOSO');
        } catch (cloudError) {
          console.log('⚠️ Cloud Print falló:', cloudError.message);
          detalleError += `CloudPrint: ${cloudError.message}; `;
        }
      }
      
      // INTENTO 3: Email Printing (último fallback)
      if (!impresionExitosa && PRINT_CONFIG.EMAIL_PRINTER.enabled) {
        try {
          console.log('📧 Intentando Email Printing...');
          const resultado = await enviarPorEmail(contenidoOptimizado);
          impresionExitosa = true;
          metodoImpresion = 'Email-Printer';
          console.log('✅ EMAIL PRINT EXITOSO');
        } catch (emailError) {
          console.log('⚠️ Email Print falló:', emailError.message);
          detalleError += `Email: ${emailError.message}; `;
        }
      }
      
      if (!impresionExitosa) {
        console.log('❌ Ningún método de impresión física disponible');
        console.log('💡 Configura Chrome en el servidor o variables de entorno para habilitar impresión');
        console.log('📋 Errores:', detalleError);
        console.log(`🌐 URL de ticket disponible: /api/impresion/ticket/${ticketId}`);
      }
      
      const ticketData = {
        timestamp: new Date().toISOString(),
        contenido: contenidoOptimizado,
        estadisticas: { lineas, caracteres, productos },
        configuracion: {
          formato: 'XP-58 58mm termico',
          font: 'Courier New 8pt'
        },
        procesado: true,
        impresionFisica: impresionExitosa,
        metodoImpresion: metodoImpresion,
        entorno: 'Render/Linux'
      };
      
      fs.writeFileSync(ticketFile, JSON.stringify(ticketData, null, 2), 'utf8');
      const ticketPlainFile = path.join(ticketsDir, `ticket_plain_${timestamp}.txt`);
      fs.writeFileSync(ticketPlainFile, contenidoOptimizado, 'utf8');
      
      console.log(`PROCESAMIENTO RENDER COMPLETO - IMPRESION: ${impresionExitosa ? 'FISICA' : 'SIMULADA'}`);
      
      resolve({ 
        success: true, 
        method: 'Render-Cloud-Printing',
        archivo: ticketFile,
        archivoPlano: ticketPlainFile,
        impresionFisica: impresionExitosa,
        metodoImpresion: metodoImpresion,
        procesamiento: 'completo-con-impresion-real'
      });
      
    } catch (error) {
      console.error('Error en procesamiento Render:', error.message);
      reject(error);
    }
  });
}

/**
 * Enviar ticket por email a impresora con email
 */
async function enviarPorEmail(contenido) {
  if (!PRINT_CONFIG.EMAIL_PRINTER.enabled) {
    throw new Error('Email printing no habilitado');
  }
  
  if (!nodemailer) {
    throw new Error('Nodemailer no disponible');
  }
  
  // Si no hay credenciales configuradas, usar configuración por defecto para pruebas
  const smtpConfig = PRINT_CONFIG.EMAIL_PRINTER.smtpConfig.auth.user ? 
    PRINT_CONFIG.EMAIL_PRINTER.smtpConfig : 
    {
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: 'ethereal.user@ethereal.email',
        pass: 'ethereal.pass'
      }
    };
  
  try {
    const transporter = nodemailer.createTransporter(smtpConfig);
    
    const mailOptions = {
      from: PRINT_CONFIG.EMAIL_PRINTER.fromEmail,
      to: PRINT_CONFIG.EMAIL_PRINTER.printerEmail,
      subject: `Ticket de Venta - ${new Date().toLocaleString()}`,
      text: contenido,
      attachments: [
        {
          filename: 'ticket.txt',
          content: contenido,
          contentType: 'text/plain; charset=utf-8'
        }
      ]
    };
    
    console.log(`📧 Enviando ticket por email a: ${PRINT_CONFIG.EMAIL_PRINTER.printerEmail}`);
    
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ EMAIL ENVIADO:', info.messageId);
    
    return {
      metodo: 'email-to-printer',
      destinatario: PRINT_CONFIG.EMAIL_PRINTER.printerEmail,
      messageId: info.messageId,
      exito: true
    };
    
  } catch (error) {
    console.error('❌ Error enviando email:', error.message);
    throw new Error(`Error enviando email: ${error.message}`);
  }
}

/**
 * Enviar a Chrome Kiosk Printing (RENDER - Opción más confiable)
 */
async function enviarAChromeKiosk(contenido, ticketId) {
  try {
    const { spawn } = require('child_process');
    
    // URL del ticket para Chrome kiosk
    const ticketUrl = process.env.RENDER_EXTERNAL_URL ? 
      `${process.env.RENDER_EXTERNAL_URL}/api/impresion/ticket/${ticketId}` :
      `https://supermercadobackend.onrender.com/api/impresion/ticket/${ticketId}`;
    
    console.log(`🌐 Chrome Kiosk URL: ${ticketUrl}`);
    
    // Intentar ejecutar Chrome en modo kiosk para impresión
    const chromeCommand = 'google-chrome-stable'; // En Linux Render
    const chromeArgs = [
      '--kiosk-printing',
      '--kiosk',
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--headless',
      ticketUrl
    ];
    
    console.log('🖨️ Ejecutando Chrome kiosk printing...');
    
    return new Promise((resolve, reject) => {
      const chromeProcess = spawn(chromeCommand, chromeArgs, {
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      let output = '';
      let errorOutput = '';
      
      chromeProcess.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      chromeProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });
      
      chromeProcess.on('close', (code) => {
        if (code === 0 || code === null) {
          console.log('✅ Chrome kiosk printing completado');
          resolve({
            metodo: 'chrome-kiosk-printing',
            url: ticketUrl,
            exitCode: code,
            exito: true
          });
        } else {
          console.log('⚠️ Chrome kiosk falló, código:', code);
          reject(new Error(`Chrome kiosk falló con código: ${code}`));
        }
      });
      
      // Timeout de 10 segundos
      setTimeout(() => {
        chromeProcess.kill();
        reject(new Error('Chrome kiosk timeout'));
      }, 10000);
    });
    
  } catch (error) {
    console.error('❌ Error Chrome kiosk:', error.message);
    throw new Error(`Chrome kiosk error: ${error.message}`);
  }
}
async function enviarAServicioImpresion(contenido) {
  if (!PRINT_CONFIG.CLOUD_PRINT.enabled) {
    throw new Error('Cloud printing no habilitado');
  }
  
  if (!PRINT_CONFIG.CLOUD_PRINT.apiKey) {
    console.log('Cloud printing configurado pero sin API key');
    throw new Error('Sin API key de servicio de impresión');
  }
  
  try {
    if (PRINT_CONFIG.CLOUD_PRINT.service === 'printnode') {
      // Integración con PrintNode API
      const axios = require('axios');
      
      const printJob = {
        printerId: PRINT_CONFIG.CLOUD_PRINT.printerId,
        title: `Ticket Supermercado - ${new Date().toLocaleString()}`,
        contentType: 'raw_base64',
        content: Buffer.from(contenido, 'utf8').toString('base64'),
        source: 'Supermercado App'
      };
      
      console.log(`🖨️ Enviando a PrintNode - Impresora: ${PRINT_CONFIG.CLOUD_PRINT.printerId}`);
      
      const response = await axios.post('https://api.printnode.com/printjobs', printJob, {
        auth: {
          username: PRINT_CONFIG.CLOUD_PRINT.apiKey,
          password: ''
        },
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ PRINTNODE: Ticket enviado correctamente', response.data);
      
      return {
        metodo: 'cloud-print-service',
        servicio: PRINT_CONFIG.CLOUD_PRINT.service,
        impresoraId: PRINT_CONFIG.CLOUD_PRINT.printerId,
        jobId: response.data,
        exito: true
      };
      
    } else {
      // Para otros servicios
      console.log(`🌐 Servicio ${PRINT_CONFIG.CLOUD_PRINT.service} no implementado aún`);
      throw new Error(`Servicio ${PRINT_CONFIG.CLOUD_PRINT.service} no soportado`);
    }
    
  } catch (error) {
    console.error('❌ Error en servicio de impresión:', error.message);
    throw new Error(`Error en servicio de impresión: ${error.message}`);
  }
}

/**
 * Generar ticket ULTRA COMPACTO
 */
function generarTicketUltraCompacto(venta, items) {
  console.log('Generando ticket - Total:', venta.total, 'Items:', items.length);
  
  let ticket = '';
  const fecha = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
  const hora = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  const numero = venta.numero || Math.floor(Math.random() * 10000);
  
  ticket += '\n';
  ticket += '                   SUPERMERCADO\n';
  ticket += '\n';
  ticket += `${fecha} ${hora}                       #${numero}\n`;
  ticket += '\n';
  ticket += '===============================================\n';
  
  items.forEach(item => {
    const nombre = item.nombre.length > 32 ? 
                   item.nombre.substring(0, 30) + '..' : 
                   item.nombre;
    const total = (item.precio * item.cantidad).toFixed(0);
    ticket += `\n${nombre}\n`;
    ticket += `   ${item.cantidad} x $${item.precio.toFixed(0)} = $${total}\n`;
  });
  
  ticket += '\n';
  ticket += '===============================================\n';
  ticket += '\n';
  ticket += `             TOTAL: $${venta.total.toFixed(0)}\n`;
  ticket += '\n';
  
  const metodoPago = (venta.metodoPago || 'EFECTIVO').toUpperCase();
  ticket += `             ${metodoPago}\n`;
  
  ticket += '\n';
  ticket += '===============================================\n';
  ticket += '\n';
  ticket += '                 GRACIAS!\n';
  ticket += '\n';
  ticket += '              Mercadito Dani\n';
  ticket += '\n\n\n';
  
  return ticket;
}

/**
 * ENDPOINT PRINCIPAL - IMPRESION MULTIPLATAFORMA INDEPENDIENTE
 */
router.post('/58mm-auto', async (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  console.log('ENDPOINT /58mm-auto INICIADO');
  
  try {
    const { venta, items } = req.body;
    
    console.log('IMPRESION MULTIPLATAFORMA INDEPENDIENTE');
    
    if (!venta || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Datos de venta e items son obligatorios'
      });
    }
    
    const isWindows = process.platform === 'win32';
    const isRender = !!(process.env.RENDER_SERVICE_NAME || process.env.RENDER);
    
    const ticketCompacto = generarTicketUltraCompacto(venta, items);
    
    let metodoUsado;
    let impresionFisica = true;
    
    if (isWindows && !isRender) {
      // WINDOWS LOCAL - Impresión física directa
      console.log('WINDOWS - IMPRESION FISICA DIRECTA...');
      
      try {
        const resultado = await enviarConPowerShellDirecto(ticketCompacto);
        metodoUsado = resultado.method;
        impresionFisica = true;
        console.log('IMPRESION FISICA LOCAL EXITOSA');
      } catch (printError) {
        console.error('Error impresion local:', printError.message);
        metodoUsado = 'Windows-Local-Error';
        impresionFisica = false;
      }
      
    } else {
      // RENDER/LINUX - Impresión física en la nube
      console.log('RENDER - IMPRESION FISICA EN LA NUBE...');
      
      try {
        const resultado = await procesarImpresionCompleta(ticketCompacto);
        metodoUsado = resultado.method;
        impresionFisica = resultado.impresionFisica; // Puede ser true si logró imprimir por email/servicio
        
        if (resultado.impresionFisica) {
          console.log(`IMPRESION FISICA EN LA NUBE EXITOSA: ${resultado.metodoImpresion}`);
        } else {
          console.log('IMPRESION FISICA NO DISPONIBLE - PROCESAMIENTO COMPLETO REALIZADO');
        }
        
      } catch (linuxError) {
        console.error('Error procesamiento Render:', linuxError.message);
        metodoUsado = 'Render-Error-Processed';
        impresionFisica = false;
      }
    }
    
    const successResponse = { 
      success: true, 
      message: `Ticket procesado correctamente - ${metodoUsado}`,
      method: metodoUsado,
      servidor: isRender ? 'Backend Render Linux' : 'Backend Local Windows',
      entorno: isRender ? 'Produccion' : 'Desarrollo',
      impresionFisica: impresionFisica,
      independiente: true,
      timestamp: new Date().toISOString()
    };
    
    res.status(200).json(successResponse);
    
  } catch (error) {
    console.error('ERROR CRITICO:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor'
    });
  }
});

/**
 * ENDPOINT DE ESTADO
 */
router.get('/status', (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const statusResponse = {
    servicio: 'Impresion Multiplataforma Independiente',
    estado: 'Activo',
    endpoints: [
      'POST /api/impresion/58mm-auto - Impresion automatica',
      'GET /api/impresion/status - Estado del servicio',
      'GET /api/impresion/ticket/:id - Pagina de ticket para chrome kiosk'
    ],
    timestamp: new Date().toISOString()
  };
  
  res.status(200).json(statusResponse);
});

/**
 * ENDPOINT PARA GENERAR PAGINA DE TICKET PARA CHROME KIOSK
 */
router.get('/ticket/:id', (req, res) => {
  try {
    const ticketId = req.params.id;
    
    // Si es un monitor, verificar si hay tickets pendientes
    if (ticketId.startsWith('monitor_')) {
      return handleMonitorRequest(req, res, ticketId);
    }
    
    // Buscar el ticket en el directorio de tickets procesados
    const ticketsDir = path.join(os.tmpdir(), 'tickets_procesados');
    let ticketContent = '';
    
    try {
      if (fs.existsSync(ticketsDir)) {
        const ticketFiles = fs.readdirSync(ticketsDir).filter(f => f.includes(ticketId) && f.endsWith('.txt'));
        if (ticketFiles.length > 0) {
          const ticketFile = path.join(ticketsDir, ticketFiles[0]);
          ticketContent = fs.readFileSync(ticketFile, 'utf8');
        }
      }
    } catch (dirError) {
      console.log('Error accediendo directorio tickets:', dirError.message);
    }
    
    if (!ticketContent) {
      // Si no existe el archivo, generar un ticket de ejemplo
      ticketContent = `
                   SUPERMERCADO

06/08 12:34                       #${ticketId}

===============================================

Producto de Ejemplo
   1 x $100 = $100

===============================================

             TOTAL: $100

             EFECTIVO

===============================================

                 GRACIAS!

              Mercadito Dani

`;
    }
    
    const html = generateTicketHTML(ticketId, ticketContent);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(html);
    
  } catch (error) {
    console.error('Error generando página de ticket:', error.message);
    res.status(500).send('<h1>Error generando ticket</h1>');
  }
});

/**
 * Manejar peticiones de monitoreo para impresión automática
 */
function handleMonitorRequest(req, res, monitorId) {
  try {
    const ticketsDir = path.join(os.tmpdir(), 'tickets_procesados');
    
    // Verificar si hay tickets nuevos (últimos 30 segundos)
    const ahora = new Date();
    const hace30seg = new Date(ahora.getTime() - 30000);
    
    let ticketReciente = null;
    
    if (fs.existsSync(ticketsDir)) {
      const archivos = fs.readdirSync(ticketsDir)
        .filter(f => f.startsWith('ticket_plain_') && f.endsWith('.txt'))
        .map(f => {
          const rutaCompleta = path.join(ticketsDir, f);
          const stats = fs.statSync(rutaCompleta);
          return { archivo: f, ruta: rutaCompleta, modificado: stats.mtime };
        })
        .filter(item => item.modificado > hace30seg)
        .sort((a, b) => b.modificado - a.modificado);
      
      if (archivos.length > 0) {
        const contenido = fs.readFileSync(archivos[0].ruta, 'utf8');
        ticketReciente = {
          id: archivos[0].archivo.replace('ticket_plain_', '').replace('.txt', ''),
          contenido: contenido,
          timestamp: archivos[0].modificado
        };
      }
    }
    
    if (ticketReciente) {
      // HAY TICKET NUEVO - Generar página para imprimir
      console.log(`🔔 NUEVO TICKET DETECTADO: ${ticketReciente.id}`);
      const html = generateTicketHTML(ticketReciente.id, ticketReciente.contenido, true);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.status(200).send(html);
    } else {
      // NO HAY TICKETS NUEVOS - Página vacía que se cierra sola
      const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Monitor - Sin tickets</title>
</head>
<body>
    <div style="font-family: monospace; padding: 20px; text-align: center;">
        <p>🔍 Monitoreando tickets...</p>
        <p>Sin tickets nuevos</p>
    </div>
    <script>
        console.log('Monitor activo - Sin tickets pendientes');
        setTimeout(() => {
            window.close();
        }, 1000);
    </script>
</body>
</html>`;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.status(200).send(html);
    }
    
  } catch (error) {
    console.error('Error en monitor:', error.message);
    res.status(500).send('<h1>Error en monitoreo</h1>');
  }
}

/**
 * Generar HTML del ticket optimizado para impresión
 */
function generateTicketHTML(ticketId, ticketContent, esNuevo = false) {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Ticket ${ticketId}</title>
    <style>
        @page {
            size: 58mm auto;
            margin: 0;
        }
        
        body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.2;
            margin: 0;
            padding: 5px;
            width: 58mm;
            background: white;
        }
        
        pre {
            margin: 0;
            padding: 0;
            white-space: pre-wrap;
            font-family: inherit;
            font-size: inherit;
        }
        
        @media print {
            body {
                margin: 0;
                padding: 2px;
            }
        }
    </style>
</head>
<body>
    <pre id="ticket">${ticketContent}</pre>
    
    <script>
        console.log('🖨️ PAGINA DE TICKET CARGADA - ID: ${ticketId}');
        ${esNuevo ? "console.log('🔔 NUEVO TICKET - IMPRIMIENDO...');" : ""}
        
        // Imprimir automáticamente después de cargar
        window.onload = function() {
            console.log('📄 Iniciando impresión automática...');
            setTimeout(() => {
                ${esNuevo ? "console.log('🎯 IMPRIMIENDO TICKET NUEVO');" : ""}
                window.print();
                console.log('✅ Comando de impresión enviado');
                
                // Cerrar ventana después de imprimir
                setTimeout(() => {
                    window.close();
                }, 2000);
            }, ${esNuevo ? '500' : '1000'});
        };
        
        // Para debug
        console.log('Ticket ID: ${ticketId}');
        ${esNuevo ? "console.log('TIPO: NUEVO TICKET');" : "console.log('TIPO: TICKET EXISTENTE');"}
    </script>
</body>
</html>`;
}

module.exports = router;
