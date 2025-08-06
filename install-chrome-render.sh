#!/bin/bash

# INSTALACION DE CHROME PARA RENDER LINUX
# Este script installa Google Chrome en servidores Linux para kiosk printing

echo "🚀 INSTALANDO GOOGLE CHROME PARA IMPRESION AUTOMATICA..."

# Actualizar repositorios
apt-get update

# Instalar dependencias
apt-get install -y wget gnupg2 software-properties-common

# Agregar clave de Google
wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add -

# Agregar repositorio de Chrome
echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list

# Actualizar e instalar Chrome
apt-get update
apt-get install -y google-chrome-stable

# Instalar dependencias adicionales para headless
apt-get install -y xvfb

echo "✅ CHROME INSTALADO CORRECTAMENTE"

# Verificar instalación
google-chrome-stable --version

echo ""
echo "🖨️ CHROME KIOSK PRINTING LISTO!"
echo "   Uso: google-chrome-stable --kiosk-printing --kiosk URL"
echo ""
echo "📌 Para Render, agrega esto a tu Dockerfile:"
echo "   RUN apt-get update && apt-get install -y google-chrome-stable"
