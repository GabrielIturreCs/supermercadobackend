const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Ruta ${req.originalUrl} no encontrada`,
  })
}

module.exports = notFound
