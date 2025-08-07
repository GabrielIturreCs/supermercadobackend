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
    // Filtros de consulta desde query params
    const { periodo, desde, hasta, vendedor, metodoPago, estado, limite } = req.query;
    
    // Construir filtro de fecha
    let filtroFecha = {};
    const hoy = new Date();
    
    if (periodo) {
      switch (periodo) {
        case 'hoy':
          const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 0, 0, 0);
          const finHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 23, 59, 59);
          filtroFecha.createdAt = { $gte: inicioHoy, $lte: finHoy };
          break;
        case 'mes':
          const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1, 0, 0, 0);
          const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0, 23, 59, 59);
          filtroFecha.createdAt = { $gte: inicioMes, $lte: finMes };
          break;
        case 'anio':
          const inicioAnio = new Date(hoy.getFullYear(), 0, 1, 0, 0, 0);
          const finAnio = new Date(hoy.getFullYear(), 11, 31, 23, 59, 59);
          filtroFecha.createdAt = { $gte: inicioAnio, $lte: finAnio };
          break;
        case 'semana':
          const inicioSemana = new Date(hoy);
          inicioSemana.setDate(hoy.getDate() - hoy.getDay());
          inicioSemana.setHours(0, 0, 0, 0);
          const finSemana = new Date(inicioSemana);
          finSemana.setDate(inicioSemana.getDate() + 6);
          finSemana.setHours(23, 59, 59, 999);
          filtroFecha.createdAt = { $gte: inicioSemana, $lte: finSemana };
          break;
      }
    } else if (desde || hasta) {
      if (desde && hasta) {
        const fechaDesde = new Date(desde);
        const fechaHasta = new Date(hasta);
        fechaHasta.setHours(23, 59, 59, 999); // Incluir todo el día final
        filtroFecha.createdAt = { $gte: fechaDesde, $lte: fechaHasta };
      } else if (desde) {
        filtroFecha.createdAt = { $gte: new Date(desde) };
      } else if (hasta) {
        const fechaHasta = new Date(hasta);
        fechaHasta.setHours(23, 59, 59, 999);
        filtroFecha.createdAt = { $lte: fechaHasta };
      }
    }
    
    // Construir filtro completo
    let filtro = { ...filtroFecha };
    
    if (vendedor) {
      filtro.vendedor = vendedor;
    }
    
    if (metodoPago) {
      filtro.metodoPago = metodoPago;
    }
    
    if (estado) {
      filtro.estado = estado;
    }
    
    console.log('🔍 Filtros aplicados en backend:', filtro);
    
    // Construir query con límite opcional
    let query = Venta.find(filtro).populate('vendedor items.producto turno');
    
    if (limite && !isNaN(parseInt(limite))) {
      query = query.limit(parseInt(limite));
    }
    
    const ventas = await query.sort({ createdAt: -1 }); // Ordenar por fecha descendente
    
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

    // Calcular totales para el día, mes y año actual (independiente de filtros)
    const inicioHoyCalculo = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 0, 0, 0);
    const ventasHoy = await Venta.find({ 
      createdAt: { $gte: inicioHoyCalculo },
      estado: { $ne: 'cancelada' }
    });
    const totalDia = ventasHoy.reduce((sum, v) => sum + (v.total || 0), 0);

    const inicioMesCalculo = new Date(hoy.getFullYear(), hoy.getMonth(), 1, 0, 0, 0);
    const ventasMes = await Venta.find({ 
      createdAt: { $gte: inicioMesCalculo },
      estado: { $ne: 'cancelada' }
    });
    const totalMes = ventasMes.reduce((sum, v) => sum + (v.total || 0), 0);

    const inicioAnioCalculo = new Date(hoy.getFullYear(), 0, 1, 0, 0, 0);
    const ventasAnio = await Venta.find({ 
      createdAt: { $gte: inicioAnioCalculo },
      estado: { $ne: 'cancelada' }
    });
    const totalAnio = ventasAnio.reduce((sum, v) => sum + (v.total || 0), 0);
    
    // Total del período filtrado
    const totalPeriodo = ventasConFecha
      .filter(v => v.estado !== 'cancelada')
      .reduce((sum, v) => sum + (v.total || 0), 0);

    res.json({
      ventas: ventasConFecha,
      totalDia,
      totalMes,
      totalAnio,
      totalPeriodo,
      filtros: {
        aplicados: filtro,
        total: ventasConFecha.length
      }
    });
  } catch (err) {
    console.error('Error en getAll ventas:', err);
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
