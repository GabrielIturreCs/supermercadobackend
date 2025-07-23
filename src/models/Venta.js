const mongoose = require("mongoose")

const itemVentaSchema = new mongoose.Schema({
  producto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Producto",
    required: true,
  },
  codigo: {
    type: String,
    required: true,
  },
  nombre: {
    type: String,
    required: true,
  },
  cantidad: {
    type: Number,
    required: true,
    min: [0.01, "La cantidad debe ser mayor a 0"],
  },
  precio: {
    type: Number,
    required: true,
    min: [0, "El precio no puede ser negativo"],
  },
  subtotal: {
    type: Number,
    required: true,
    min: [0, "El subtotal no puede ser negativo"],
  },
  variante: {
    type: String,
  },
  descuento: {
    type: Number,
    default: 0,
    min: [0, "El descuento no puede ser negativo"],
  },
})

const ventaSchema = new mongoose.Schema(
  {
    numero: {
      type: String,
      unique: true,
    },
    items: [itemVentaSchema],
    subtotal: {
      type: Number,
      required: true,
      min: [0, "El subtotal no puede ser negativo"],
    },
    descuento: {
      type: Number,
      default: 0,
      min: [0, "El descuento no puede ser negativo"],
    },
    impuestos: {
      type: Number,
      default: 0,
      min: [0, "Los impuestos no pueden ser negativos"],
    },
    total: {
      type: Number,
      required: true,
      min: [0, "El total no puede ser negativo"],
    },
    metodoPago: {
      type: String,
      enum: ["efectivo", "tarjeta", "transferencia", "mixto"],
      required: true,
    },
    detallesPago: {
      efectivo: {
        type: Number,
        default: 0,
      },
      tarjeta: {
        type: Number,
        default: 0,
      },
      transferencia: {
        type: Number,
        default: 0,
      },
      cambio: {
        type: Number,
        default: 0,
      },
    },
    cliente: {
      nombre: String,
      documento: String,
      telefono: String,
      email: String,
      direccion: String,
    },
    vendedor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },
    sucursal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sucursal",
    },
    turno: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Turno",
    },
    estado: {
      type: String,
      enum: ["completada", "cancelada", "pendiente", "devuelta"],
      default: "completada",
    },
    observaciones: {
      type: String,
      maxlength: [500, "Las observaciones no pueden exceder 500 caracteres"],
    },
    fechaCancelacion: Date,
    motivoCancelacion: String,
    usuarioCancelacion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
    },
  },
  {
    timestamps: true,
  },
)

// Índices
ventaSchema.index({ numero: 1 })
ventaSchema.index({ vendedor: 1 })
ventaSchema.index({ estado: 1 })
ventaSchema.index({ createdAt: -1 })
ventaSchema.index({ sucursal: 1, createdAt: -1 })

// Middleware para generar número de venta
ventaSchema.pre("save", async function (next) {
  if (this.isNew) {
    const count = await this.constructor.countDocuments()
    this.numero = `V${String(count + 1).padStart(8, "0")}`
  }
  next()
})

// Método para calcular totales
ventaSchema.methods.calcularTotales = function () {
  this.subtotal = this.items.reduce((sum, item) => sum + item.subtotal, 0)
  this.total = this.subtotal - this.descuento + this.impuestos
}

module.exports = mongoose.model("Venta", ventaSchema)
