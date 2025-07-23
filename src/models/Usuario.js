const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const usuarioSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "El nombre de usuario es requerido"],
      unique: true,
      trim: true,
      minlength: [3, "El nombre de usuario debe tener al menos 3 caracteres"],
      maxlength: [30, "El nombre de usuario no puede exceder 30 caracteres"],
    },
    email: {
      type: String,
      required: [true, "El email es requerido"],
      unique: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Email no válido"],
    },
    password: {
      type: String,
      required: [true, "La contraseña es requerida"],
      minlength: [6, "La contraseña debe tener al menos 6 caracteres"],
    },
    nombre: {
      type: String,
      required: [true, "El nombre es requerido"],
      trim: true,
    },
    apellido: {
      type: String,
      required: [true, "El apellido es requerido"],
      trim: true,
    },
    role: {
      type: String,
      enum: ["admin", "gerente", "cajero", "reponedor"],
      default: "cajero",
    },
    sucursal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sucursal",
      required: function () {
        return this.role !== "admin"
      },
    },
    activo: {
      type: Boolean,
      default: true,
    },
    ultimoAcceso: {
      type: Date,
    },
    configuracion: {
      tema: {
        type: String,
        enum: ["claro", "oscuro"],
        default: "claro",
      },
      notificaciones: {
        type: Boolean,
        default: true,
      },
      idioma: {
        type: String,
        default: "es",
      },
    },
  },
  {
    timestamps: true,
  },
)

// Encriptar contraseña antes de guardar
usuarioSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next()
  }

  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

// Método para comparar contraseñas
usuarioSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

// Método para obtener datos públicos del usuario
usuarioSchema.methods.getPublicProfile = function () {
  return {
    id: this._id,
    username: this.username,
    email: this.email,
    nombre: this.nombre,
    apellido: this.apellido,
    role: this.role,
    sucursal: this.sucursal,
    activo: this.activo,
    ultimoAcceso: this.ultimoAcceso,
  }
}

module.exports = mongoose.model("Usuario", usuarioSchema)
