const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const helmet = require("helmet")
const morgan = require("morgan")
const compression = require("compression")
const mongoSanitize = require("express-mongo-sanitize")
const rateLimit = require("express-rate-limit")
require("dotenv").config()

// Import routes
const authRoutes = require("./src/routes/auth")
const productosRoutes = require("./src/routes/productos")
const ventasRoutes = require("./src/routes/ventas")
const usuariosRoutes = require("./src/routes/usuarios")
const reportesRoutes = require("./src/routes/reportes")
const categoriasRoutes = require("./src/routes/categorias")
const proveedoresRoutes = require("./src/routes/proveedores")
const alertasRoutes = require("./src/routes/alertas")
const cajasRoutes = require("./src/routes/cajas")
const movimientosCajaRoutes = require("./src/routes/movimientosCaja")
const inventariosRoutes = require("./src/routes/inventarios")
const movimientosInventarioRoutes = require("./src/routes/movimientosInventario")
const depositosRoutes = require("./src/routes/depositos")
const movimientosDepositoRoutes = require("./src/routes/movimientosDeposito")
const vencimientosRoutes = require("./src/routes/vencimientos")
const ingresosEgresosRoutes = require("./src/routes/ingresosEgresos")
const sucursalesRoutes = require("./src/routes/sucursales")
const balanzasRoutes = require("./src/routes/balanzas")
const auditoriasRoutes = require("./src/routes/auditorias")

// Import middleware
const errorHandler = require("./src/middleware/errorHandler")
const notFound = require("./src/middleware/notFound")

const path = require("path");

const app = express()
const PORT = process.env.PORT || 3000

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: "Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.",
})

// Middleware
app.use(helmet())
app.use(compression())
app.use(limiter)
app.use(morgan("combined"))
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "https://supermercado-knm6.onrender.com",
    credentials: true,
  }),
)
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))
app.use(mongoSanitize())

// Servir archivos estáticos del frontend Angular
app.use(express.static(path.join(__dirname, "public")));

// Redirigir todas las rutas no API al index.html del frontend (Angular SPA)
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
})

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/productos", productosRoutes)
app.use("/api/ventas", ventasRoutes)
app.use("/api/usuarios", usuariosRoutes)
app.use("/api/reportes", reportesRoutes)
app.use("/api/categorias", categoriasRoutes)
app.use("/api/proveedores", proveedoresRoutes)
app.use("/api/alertas", alertasRoutes)
app.use("/api/cajas", cajasRoutes)
app.use("/api/movimientos-caja", movimientosCajaRoutes)
app.use("/api/inventarios", inventariosRoutes)
app.use("/api/movimientos-inventario", movimientosInventarioRoutes)
app.use("/api/depositos", depositosRoutes)
app.use("/api/movimientos-deposito", movimientosDepositoRoutes)
app.use("/api/vencimientos", vencimientosRoutes)
app.use("/api/ingresos-egresos", ingresosEgresosRoutes)
app.use("/api/sucursales", sucursalesRoutes)
app.use("/api/balanzas", balanzasRoutes)
app.use("/api/auditorias", auditoriasRoutes)

// Error handling middleware
app.use(notFound)
app.use(errorHandler)

// Database connection

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb+srv://<usuario>:<password>@ac-jotlwe9-shard-00-00.2vz7f6m.mongodb.net/supermeercado?retryWrites=true&w=majority';
if (!MONGO_URI || typeof MONGO_URI !== 'string') {
  console.error('❌ Error: MONGO_URI no está definido o no es un string. Verifica tu archivo .env.');
  process.exit(1);
}
mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ Conectado a MongoDB")
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`)
      console.log(`🌍 Entorno: ${process.env.NODE_ENV || "development"}`)
    })
  })
  .catch((error) => {
    console.error("❌ Error conectando a MongoDB:", error)
    process.exit(1)
  })

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("👋 SIGTERM recibido, cerrando servidor...")
  mongoose.connection.close(() => {
    console.log("📦 Conexión a MongoDB cerrada")
    process.exit(0)
  })
})

module.exports = app
