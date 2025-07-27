const mongoose = require("mongoose")

const varianteSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
  },
  valor: {
    type: String,
    required: true,
  },
  precio: {
    type: Number,
    min: 0,
  },
  stock: {
    type: Number,
    default: 0,
    min: 0,
  },
})

const productoSchema = new mongoose.Schema(
  {
    codigo: {
      type: String,
      required: [true, "El código es requerido"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    nombre: {
      type: String,
      required: [true, "El nombre es requerido"],
      trim: true,
      maxlength: [100, "El nombre no puede exceder 100 caracteres"],
    },
    descripcion: {
      type: String,
      trim: true,
      maxlength: [500, "La descripción no puede exceder 500 caracteres"],
    },
    categoria: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Categoria",
      required: [true, "La categoría es requerida"],
    },
    marca: {
      type: String,
      trim: true,
    },
    precios: {
      minorista: {
        type: Number,
        required: [true, "El precio minorista es requerido"],
        min: [0, "El precio no puede ser negativo"],
      },
      mayorista: {
        type: Number,
        min: [0, "El precio no puede ser negativo"],
      },
      costo: {
        type: Number,
        min: [0, "El costo no puede ser negativo"],
      },
    },
    stock: {
      actual: {
        type: Number,
        default: 0,
        min: [0, "El stock no puede ser negativo"],
      },
      minimo: {
        type: Number,
        default: 5,
        min: [0, "El stock mínimo no puede ser negativo"],
      },
      maximo: {
        type: Number,
        min: [0, "El stock máximo no puede ser negativo"],
      },
      unidad: {
        type: String,
        enum: ["unidades", "kg", "litros", "metros", "cajas"],
        default: "unidades",
      },
    },
    variantes: [varianteSchema],
    vencimiento: {
      type: Date,
    },
    caducidad: {
      type: Date,
    },
    proveedor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Proveedor",
    },
    imagen: {
      type: String,
    },
    codigoBarras: {
      type: String,
      unique: true,
      sparse: true,
    },
    activo: {
      type: Boolean,
      default: true,
    },
    destacado: {
      type: Boolean,
      default: false,
    },
    tags: [String],
    ubicacion: {
      pasillo: String,
      estante: String,
      nivel: String,
    },
    historialPrecios: [
      {
        precio: Number,
        fecha: {
          type: Date,
          default: Date.now,
        },
        usuario: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Usuario",
        },
      },
    ],
  },
  {
    timestamps: true,
  },
)

// Índices para búsqueda
productoSchema.index({ nombre: "text", descripcion: "text", marca: "text" })
productoSchema.index({ categoria: 1 })
productoSchema.index({ activo: 1 })
productoSchema.index({ "stock.actual": 1 })



module.exports = mongoose.model("Producto", productoSchema)
