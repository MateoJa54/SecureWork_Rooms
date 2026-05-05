@echo off
echo ===== REINICIANDO DOCKER COMPOSE =====
cd /d "C:\Users\MSI\Desktop\SecureWork_Rooms"

echo.
echo 1. Deteniendo contenedores...
docker-compose down

echo.
echo 2. Iniciando contenedores...
docker-compose up -d

echo.
echo 3. Esperando a que el backend se inicie...
timeout /t 10 /nobreak

echo.
echo 4. Verificando estado...
docker-compose ps

echo.
echo 5. Mostrando logs del backend...
docker-compose logs backend --tail 30

echo.
echo ===== LISTO =====
echo Ahora puedes acceder a:
echo Frontend: http://localhost:5173
echo Backend: http://localhost:3000
echo Diagnóstico: http://localhost:3000/api/diag/salas
