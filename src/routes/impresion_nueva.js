const express = require('express');
const router = express.Router();
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Log para verificar que el módulo se carga
console.log('🖨️ MÓDULO DE IMPRESIÓN SIMPLE - NUEVO');

/**
 * ENDPOINT PRINCIPAL - VERSIÓN SIMPLIFICADA
 * POST /api/impresion/58mm-auto
 */
router.post('/58mm-auto', (req, res) => {
  console.log('🚀 ENDPOINT /58mm-auto - INICIADO');
  
  // Headers básicos
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  try {
    const body = req.body || {};
    const venta = body.venta || {};
    const items = body.items || [];
    
    console.log('📋 Datos recibidos - Venta total:', venta.total, 'Items:', items.length);
    
    // RESPUESTA INMEDIATA AL FRONTEND
    const response = {
      success: true,
      message: 'Ticket procesado correctamente',
      total: venta.total || 0,
      items: items.length || 0,
      timestamp: new Date().toISOString()
    };
    
    console.log('✅ ENVIANDO RESPUESTA:', JSON.stringify(response));
    res.status(200).json(response);
    
    // IMPRESIÓN EN SEGUNDO PLANO
    console.log('🖨️ INICIANDO IMPRESIÓN...');
    
    try {
      // Detectar si estamos en Windows
      const esWindows = process.platform === 'win32';
      
      if (esWindows) {
        console.log('💻 SISTEMA WINDOWS DETECTADO');
        
        // Generar contenido del ticket SIMPLE
        let ticket = '';
        
        ticket += '================================\n';
        ticket += '   Verduleria y Despensa  Jona\n';
        ticket += '================================\n';
        ticket += `Fecha: ${new Date().toLocaleString()}\n`;
        ticket += '--------------------------------\n';
        
        if (items && items.length > 0) {
          items.forEach(item => {
            const nombre = (item.nombre || 'Producto').substring(0, 25);
            const precio = parseFloat(item.precio || 0);
            const cantidad = parseInt(item.cantidad || 1);
            const subtotal = (precio * cantidad).toFixed(2);
            
            ticket += `${nombre}\n`;
            ticket += `${cantidad} x $${precio.toFixed(2)} = $${subtotal}\n`;
            ticket += '--------------------------------\n';
          });
        }
        
        ticket += `TOTAL: $${venta.total || 0}\n`;
        ticket += `Pago: ${venta.metodoPago || 'efectivo'}\n`;
        ticket += '================================\n';
        ticket += '    GRACIAS POR SU COMPRA!\n';
        ticket += '================================\n\n\n';
        
        // Guardar en archivo temporal
        const tempFile = path.join(process.cwd(), 'ticket_simple.txt');
        fs.writeFileSync(tempFile, ticket);
        
        console.log('🖨️ ARCHIVO CREADO, INTENTANDO IMPRIMIR...');
        
        let impreso = false;
        
        // Método 1: copy PRN
        try {
          execSync(`copy "${tempFile}" PRN`, { 
            encoding: 'utf8', 
            timeout: 5000,
            stdio: 'ignore'
          });
          console.log('✅ IMPRESO VIA COPY PRN');
          impreso = true;
        } catch (e1) {
          console.log('⚠️ Copy PRN falló');
          
          // Método 2: notepad /p
          try {
            execSync(`notepad /p "${tempFile}"`, { 
              encoding: 'utf8', 
              timeout: 5000,
              stdio: 'ignore'
            });
            console.log('✅ IMPRESO VIA NOTEPAD');
            impreso = true;
          } catch (e2) {
            console.log('⚠️ Notepad falló');
            
            // Método 3: print
            try {
              execSync(`print "${tempFile}"`, { 
                encoding: 'utf8', 
                timeout: 5000,
                stdio: 'ignore'
              });
              console.log('✅ IMPRESO VIA PRINT');
              impreso = true;
            } catch (e3) {
              console.log('❌ TODOS los métodos fallaron');
              console.log('Copy:', e1.message);
              console.log('Notepad:', e2.message);
              console.log('Print:', e3.message);
            }
          }
        }
        
        // Limpiar archivo
        try {
          fs.unlinkSync(tempFile);
        } catch (e) {
          console.log('⚠️ No se pudo eliminar archivo temporal');
        }
        
        if (impreso) {
          console.log('✅ TICKET IMPRESO EXITOSAMENTE');
        } else {
          console.log('❌ NO SE PUDO IMPRIMIR');
          console.log('💡 Verifica que la impresora esté encendida y conectada');
        }
        
      } else {
        console.log('🐧 Sistema Linux detectado - impresión no disponible');
      }
      
    } catch (errorImpresion) {
      console.log('⚠️ Error en impresión:', errorImpresion.message);
    }
    
    return;
    
  } catch (error) {
    console.error('❌ ERROR GENERAL:', error.message);
    
    res.status(500).json({
      success: false,
      error: 'Error procesando ticket',
      timestamp: new Date().toISOString()
    });
    return;
  }
});

/**
 * ENDPOINT DE ESTADO
 * GET /api/impresion/status
 */
router.get('/status', (req, res) => {
  console.log('🔍 ENDPOINT /status');
  
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  res.status(200).json({
    servicio: 'Impresión Simple',
    estado: 'Activo',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
