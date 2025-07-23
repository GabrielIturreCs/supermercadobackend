const mongoose = require("mongoose")

const categoriaSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre es requerido"],
      unique: true,
      trim: true,
      maxlength: [50, "El nombre no puede exceder 50 caracteres"],
    },
    descripcion: {
      type: String,
      trim: true,
      maxlength: [200, "La descripción no puede exceder 200 caracteres"],
    },
    color: {
      type: String,
      default: "#2196f3",
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Color no válido"],
    },
    icono: {
      type: String,
      default: "category",
    },
    activa: {
      type: Boolean,
      default: true,
    },
    orden: {
      type: Number,
      default: 0,
    },
    padre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Categoria",
    },
  },
  {
    timestamps: true,
  },
)

// Índices
categoriaSchema.index({ nombre: 1 })
categoriaSchema.index({ activa: 1 })
categoriaSchema.index({ padre: 1 })

module.exports = mongoose.model("Categoria", categoriaSchema)
