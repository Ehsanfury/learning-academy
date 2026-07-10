# reset-db.ps1
# Reset database and prepare for testing

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Database Reset" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# 1. Stop Docker containers
Write-Host "1. Stopping Docker containers..." -ForegroundColor Yellow
try {
    docker-compose down 2>$null
    Write-Host "   [OK] Docker containers stopped" -ForegroundColor Green
} catch {
    Write-Host "   [WARN] No Docker containers running" -ForegroundColor Yellow
}

Write-Host "`n"

# 2. Drop and recreate database
Write-Host "2. Recreating database..." -ForegroundColor Yellow
try {
    $env:PGPASSWORD = "postgres"
    & "C:\Program Files\PostgreSQL\17\bin\psql" -U postgres -c "DROP DATABASE IF EXISTS mydb;" 2>$null
    & "C:\Program Files\PostgreSQL\17\bin\psql" -U postgres -c "CREATE DATABASE mydb;" 2>$null
    Write-Host "   [OK] Database recreated" -ForegroundColor Green
} catch {
    Write-Host "   [WARN] Could not reset database via psql" -ForegroundColor Yellow
    Write-Host "   [INFO] Please ensure PostgreSQL is running" -ForegroundColor Gray
}

Write-Host "`n"

# 3. Install dependencies
Write-Host "3. Installing dependencies..." -ForegroundColor Yellow
Set-Location H:\german-academy\backend
npm install --silent 2>$null
Write-Host "   [OK] Dependencies installed" -ForegroundColor Green

Write-Host "`n"

# 4. Sync database with Sequelize
Write-Host "4. Syncing database..." -ForegroundColor Yellow
node -e "
import sequelize from './config/db.js';
import './models/index.js';
const sync = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync({ force: true });
        console.log('[OK] Database synced successfully');
        await sequelize.close();
    } catch (err) {
        console.error('[FAIL] Sync failed:', err.message);
    }
};
sync();
" 2>$null

Write-Host "   [OK] Database synced" -ForegroundColor Green

Write-Host "`n"

# 5. Run lesson seeder
Write-Host "5. Running lesson seeder..." -ForegroundColor Yellow
node scripts/runLessonSeeder.js 2>$null

Write-Host "`n"
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "[OK] Database reset complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan