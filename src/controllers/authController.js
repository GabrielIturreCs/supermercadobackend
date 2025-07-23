const jwt = require("jsonwebtoken")
const Usuario = require("../models/Usuario")

// Generar JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  })
}

// @desc    Login usuario
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {

    const { username, password } = req.body;
    console.log('Intento de login:', { username, password });

    // Validar entrada
    if (!username || !password) {
      console.log('Falta usuario o contraseña');
      return res.status(400).json({
        success: false,
        message: "Por favor proporciona usuario y contraseña",
      });
    }

    // Buscar usuario por username o email
    const usuario = await Usuario.findOne({
      $or: [
        { username: username },
        { email: username }
      ]
    }).select("+password");
    console.log('Usuario encontrado:', usuario ? usuario.username : null);

    if (!usuario) {
      console.log('No se encontró usuario');
      return res.status(401).json({
        success: false,
        message: "Credenciales inválidas",
      });
    }

    // Verificar contraseña
    const isMatch = await usuario.matchPassword(password)
    console.log('¿Contraseña coincide?', isMatch);

    if (!isMatch) {
      console.log('Contraseña incorrecta');
      return res.status(401).json({
        success: false,
        message: "Credenciales inválidas",
      })
    }

    // Verificar si el usuario está activo
    if (!usuario.activo) {
      console.log('Usuario desactivado');
      return res.status(401).json({
        success: false,
        message: "Usuario desactivado",
      })
    }

    // Actualizar último acceso
    usuario.ultimoAcceso = new Date()
    await usuario.save()

    // Generar token
    const token = generateToken(usuario._id)
    console.log('Login exitoso, token generado');

    res.status(200).json({
      success: true,
      token,
      user: usuario.getPublicProfile(),
    })
  } catch (error) {
    console.error("Error en login:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}

// @desc    Obtener usuario actual
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuario.id).populate("sucursal")

    res.status(200).json({
      success: true,
      data: usuario.getPublicProfile(),
    })
  } catch (error) {
    console.error("Error obteniendo usuario:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}

// @desc    Cambiar contraseña
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Por favor proporciona la contraseña actual y la nueva",
      })
    }

    const usuario = await Usuario.findById(req.usuario.id).select("+password")

    // Verificar contraseña actual
    const isMatch = await usuario.matchPassword(currentPassword)

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Contraseña actual incorrecta",
      })
    }

    // Actualizar contraseña
    usuario.password = newPassword
    await usuario.save()

    res.status(200).json({
      success: true,
      message: "Contraseña actualizada correctamente",
    })
  } catch (error) {
    console.error("Error cambiando contraseña:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}

// @desc    Logout usuario
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    // En una implementación más completa, aquí se podría invalidar el token
    // Por ahora, simplemente confirmamos el logout
    res.status(200).json({
      success: true,
      message: "Logout exitoso",
    })
  } catch (error) {
    console.error("Error en logout:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}

module.exports = {
  login,
  getMe,
  changePassword,
  logout,
}
