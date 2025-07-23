const jwt = require("jsonwebtoken")
const Usuario = require("../models/Usuario")

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No hay token, acceso denegado",
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const usuario = await Usuario.findById(decoded.id).select("-password")

    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: "Token no válido",
      })
    }

    if (!usuario.activo) {
      return res.status(401).json({
        success: false,
        message: "Usuario desactivado",
      })
    }

    req.usuario = usuario
    next()
  } catch (error) {
    console.error("Error en middleware de autenticación:", error)
    res.status(401).json({
      success: false,
      message: "Token no válido",
    })
  }
}

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({
        success: false,
        message: "Acceso denegado",
      })
    }

    if (!roles.includes(req.usuario.role)) {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para realizar esta acción",
      })
    }

    next()
  }
}

module.exports = { auth, authorize }
