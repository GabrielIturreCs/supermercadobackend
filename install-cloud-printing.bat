# INSTALACION DE DEPENDENCIAS PARA IMPRESION EN LA NUBE
# Ejecutar en la carpeta backend

echo "=== INSTALANDO DEPENDENCIAS PARA IMPRESION EN LA NUBE ==="

# Instalar nodemailer para email printing
npm install nodemailer

# Instalar axios para APIs de cloud printing
npm install axios

# Instalar dotenv para variables de entorno
npm install dotenv

echo "=== DEPENDENCIAS INSTALADAS ==="
echo ""
echo "PROXIMOS PASOS:"
echo "1. Copia .env.example a .env"
echo "2. Configura tus credenciales en .env"
echo "3. En Render, agrega las variables de entorno"
echo "4. Deploy nuevamente"
