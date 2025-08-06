const Venta = require('../models/Venta');
const Producto = require('../models/Producto');

// Importar fetch para llamadas HTTP internas
let fetch;
try {
  fetch = globalThis.fetch;
  if (!fetch) {
    fetch = require('node-fetch');
  }
} catch (e) {
  console.log('Fetch no disponible, impresión automática deshabilitada');
  fetch = null;
}

exports.getAll = async (req, res) => {
  try {
    const ventas = await Venta.find().populate('vendedor items.producto turno');
    // Agregar campo 'fecha' igual a 'createdAt' para compatibilidad con frontend
    let ventasConFecha = ventas.map(v => {
      const obj = v.toObject();
      obj.fecha = v.createdAt;
      // UX: mostrar nombre del vendedor si está poblado
      if (obj.vendedor && typeof obj.vendedor === 'object') {
        obj.vendedor = obj.vendedor.nombre || obj.vendedor.username || obj.vendedor.email || '-';
      }
      return obj;
    });

    // UX: ordenar ventas por fecha descendente (más reciente primero)
    ventasConFecha = ventasConFecha.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    // Calcular totales
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const totalDia = ventasConFecha
      .filter(v => new Date(v.fecha) >= hoy)
      .reduce((sum, v) => sum + (v.total || 0), 0);

    const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const totalMes = ventasConFecha
      .filter(v => new Date(v.fecha) >= primerDiaMes)
      .reduce((sum, v) => sum + (v.total || 0), 0);

    const primerDiaAnio = new Date(hoy.getFullYear(), 0, 1);
    const totalAnio = ventasConFecha
      .filter(v => new Date(v.fecha) >= primerDiaAnio)
      .reduce((sum, v) => sum + (v.total || 0), 0);

    res.json({
      ventas: ventasConFecha,
      totalDia,
      totalMes,
      totalAnio
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const venta = await Venta.findById(req.params.id).populate('vendedor items.producto turno');
    if (!venta) return res.status(404).json({ error: 'No encontrado' });
    res.json(venta);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    console.log('POST /api/ventas - body:', JSON.stringify(req.body, null, 2));
    
    // Limpiar campos ObjectId que vienen como string vacío
    const ventaData = { ...req.body };
    if (ventaData.sucursal === '' || ventaData.sucursal === null) {
      delete ventaData.sucursal;
    }
    if (ventaData.turno === '' || ventaData.turno === null) {
      delete ventaData.turno;
    }
    
    const venta = new Venta(ventaData);
    console.log('Venta instanciada:', venta);
    // Baja automática de stock usando items (solo para productos reales, no manuales)
    if (!venta.items || !Array.isArray(venta.items)) {
      console.log('Error: items no es array o no existe');
    }
    for (const item of (venta.items || [])) {
      console.log('Procesando item:', item);
      // Solo actualizar stock si NO es un producto manual
      if (item.codigo !== 'MANUAL' && !item.producto.toString().startsWith('manual_')) {
        await Producto.findByIdAndUpdate(item.producto, { $inc: { 'stock.actual': -item.cantidad } });
      } else {
        console.log('Producto manual detectado, saltando actualización de stock:', item.producto);
      }
    }
    await venta.save();
    console.log('Venta guardada OK:', venta._id);
    
    // ===== IMPRESIÓN AUTOMÁTICA PARA MONITOR LOCAL =====
    try {
      console.log('🖨️ Iniciando impresión automática para venta:', venta._id);
      
      // Generar timestamp para el ticket
      const timestamp = new Date().toISOString().replace(/[-T:\.Z]/g, '').slice(0, 12);
      
      // Llamar al endpoint de impresión 58mm
      const impresionData = {
        venta: {
          _id: venta._id,
          total: venta.total,
          metodoPago: venta.metodoPago || 'efectivo'
        },
        items: venta.items.map(item => ({
          nombre: item.nombre || 'Producto',
          precio: item.precio,
          cantidad: item.cantidad
        }))
      };
      
      console.log('📊 Datos para impresión:', impresionData);
      
      // Hacer llamada interna al endpoint de impresión
      const baseUrl = process.env.NODE_ENV === 'production' ? 
        'https://supermercadobackend.onrender.com' : 
        'http://localhost:3001';
      
      const impresionResponse = await fetch(`${baseUrl}/api/impresion/58mm-auto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(impresionData)
      });
      
      const impresionResult = await impresionResponse.json();
      console.log('✅ Respuesta de impresión:', impresionResult);
      
    } catch (impresionError) {
      console.log('❌ Error en impresión automática:', impresionError.message);
      // No falla la venta si la impresión falla
    }
    
    res.status(201).json(venta);
  } catch (err) {
    console.log('Error al crear venta:', err.message, err);
    res.status(400).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const venta = await Venta.findByIdAndDelete(req.params.id);
    if (!venta) return res.status(404).json({ error: 'No encontrado' });
    res.json({ message: 'Eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
