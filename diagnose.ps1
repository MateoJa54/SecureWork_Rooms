# Script de diagnóstico para SecureWork Rooms

Write-Host "=== DIAGNÓSTICO DE SECUREWORK ROOMS ===" -ForegroundColor Cyan

# 1. Verificar Docker
Write-Host "`n1. Verificando Docker..." -ForegroundColor Yellow
docker ps -a | Select-Object -Index 0,1,2,3

# 2. Ver logs del backend
Write-Host "`n2. Obteniendo últimos logs del backend..." -ForegroundColor Yellow
$backendContainer = docker ps --filter "name=securework_rooms-backend" -q | Select-Object -First 1
if ($backendContainer) {
    Write-Host "Container ID: $backendContainer"
    docker logs --tail 50 $backendContainer
} else {
    Write-Host "Backend no está corriendo. Intenta: docker-compose up" -ForegroundColor Red
}

# 3. Verificar salas en BD
Write-Host "`n3. Verificando salas en la base de datos..." -ForegroundColor Yellow
$postgresContainer = docker ps --filter "name=securework_rooms-postgres" -q | Select-Object -First 1
if ($postgresContainer) {
    docker exec $postgresContainer psql -U securework_user -d securework -c "SELECT id, nombre, pin_plano, activa FROM salas;" 
} else {
    Write-Host "PostgreSQL no está corriendo" -ForegroundColor Red
}

# 4. Probar endpoint de diagnóstico
Write-Host "`n4. Probando endpoint /api/diag/salas..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/diag/salas" -ErrorAction Stop
    Write-Host $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}

Write-Host "`n=== FIN DEL DIAGNÓSTICO ===" -ForegroundColor Cyan
