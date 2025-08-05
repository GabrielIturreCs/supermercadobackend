const mongoose = require('mongoose');
const Producto = require('./src/models/Producto');

// Conectar a MongoDB
mongoose.connect('mongodb+srv://gabidev:gabi123@clusterventas.m4pma.mongodb.net/ventasDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function fixStock() {
  try {
    console.log('Conectando a MongoDB...');
    
    // Buscar productos con stock negativo
    const productosStockNegativo = await Producto.find({ 'stock.actual': { $lt: 0 } });
    
    console.log(`Encontrados ${productosStockNegativo.length} productos con stock negativo:`);
    
    for (const producto of productosStockNegativo) {
      console.log(`- ${producto.nombre} (${producto.codigo}): ${producto.stock.actual}`);
      
      // Actualizar stock a 10 unidades
      await Producto.findByIdAndUpdate(producto._id, {
        'stock.actual': 10
      });
      
      console.log(`  ✅ Stock actualizado a 10 unidades`);
    }
    
    console.log('✅ Stock corregido exitosamente');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixStock();
