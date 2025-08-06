#!/usr/bin/env node

/**
 * TEST RAPIDO DE IMPRESION FISICA
 * Verifica que la impresión funcione en ambos entornos
 */

console.log('🧪 TESTING IMPRESION FISICA...\n');

const testVenta = {
  total: 150.50,
  metodoPago: 'efectivo',
  numero: 12345
};

const testItems = [
  { nombre: 'Coca Cola 500ml', precio: 50.25, cantidad: 2 },
  { nombre: 'Pan Lactal', precio: 45.75, cantidad: 1 },
  { nombre: 'Leche La Serenísima 1L', precio: 54.25, cantidad: 1 }
];

const testPayload = {
  venta: testVenta,
  items: testItems
};

async function testLocal() {
  try {
    console.log('📍 TESTING LOCAL (Windows)...');
    const response = await fetch('http://localhost:3001/api/impresion/58mm-auto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPayload)
    });
    
    const result = await response.json();
    console.log('✅ LOCAL:', result.impresionFisica ? 'IMPRESION FISICA' : 'VIRTUAL');
    console.log('🔧 Método:', result.method);
  } catch (error) {
    console.log('❌ LOCAL ERROR:', error.message);
  }
}

async function testRender() {
  try {
    console.log('\n🌐 TESTING RENDER...');
    const response = await fetch('https://supermercadobackend.onrender.com/api/impresion/58mm-auto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPayload)
    });
    
    const result = await response.json();
    console.log('✅ RENDER:', result.impresionFisica ? 'IMPRESION FISICA' : 'VIRTUAL');
    console.log('🔧 Método:', result.method);
    console.log('🖥️ Servidor:', result.servidor);
    
    if (!result.impresionFisica) {
      console.log('\n💡 Para habilitar impresión física en Render:');
      console.log('   1. Ve a Render Dashboard > Environment');
      console.log('   2. Agrega: EMAIL_PRINT_ENABLED=true');
      console.log('   3. Agrega: PRINTER_EMAIL=tu-impresora@gmail.com');
      console.log('   4. Deploy nuevamente');
    }
    
  } catch (error) {
    console.log('❌ RENDER ERROR:', error.message);
  }
}

async function runTests() {
  // Verificar fetch disponible
  global.fetch = global.fetch || require('node-fetch');
  
  await testLocal();
  await testRender();
  
  console.log('\n📋 RESUMEN:');
  console.log('• Local debe mostrar IMPRESION FISICA');
  console.log('• Render mostrará VIRTUAL hasta configurar variables');
  console.log('• Lee ACTIVAR-IMPRESION-RENDER.md para más detalles');
}

runTests().catch(console.error);
