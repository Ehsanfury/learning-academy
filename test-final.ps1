# test-final.ps1
# تست نهایی پروژه Learning Academy

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TEST FINAL - Learning Academy" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$BACKEND_URL = "http://localhost:5001"
$FRONTEND_URL = "http://localhost:3000"

# ============================================
# 1. تست Backend Health
# ============================================

Write-Host "[1] Testing Backend Health..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Method Get -Uri "$BACKEND_URL/health" -ErrorAction Stop
    if ($health.status -eq "healthy") {
        Write-Host "[OK] Backend is healthy!" -ForegroundColor Green
        Write-Host "    Database: $($health.services.database)" -ForegroundColor Gray
    } else {
        Write-Host "[FAIL] Backend is not healthy!" -ForegroundColor Red
        exit
    }
} catch {
    Write-Host "[FAIL] Backend not responding: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

Write-Host "`n"

# ============================================
# 2. تست Login
# ============================================

Write-Host "[2] Testing Login..." -ForegroundColor Yellow
try {
    $loginBody = '{"email":"admin@german-academy.com","password":"admin123456"}'
    $login = Invoke-RestMethod -Method Post -Uri "$BACKEND_URL/api/auth/login" `
        -ContentType "application/json" -Body $loginBody -ErrorAction Stop

    if ($login.success) {
        Write-Host "[OK] Login successful!" -ForegroundColor Green
        $token = $login.data.accessToken
        Write-Host "    Token: $($token.Substring(0, 30))..." -ForegroundColor Gray
        Write-Host "    Role: $($login.data.user.role)" -ForegroundColor Gray
    } else {
        Write-Host "[FAIL] Login failed!" -ForegroundColor Red
        exit
    }
} catch {
    Write-Host "[FAIL] Login error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $reader.DiscardBufferedData()
        $responseBody = $reader.ReadToEnd()
        Write-Host "    Response: $responseBody" -ForegroundColor Red
    }
    exit
}

Write-Host "`n"

# ============================================
# 3. تست Admin Dashboard
# ============================================

Write-Host "[3] Testing Admin Dashboard..." -ForegroundColor Yellow
try {
    $headers = @{ "Authorization" = "Bearer $token" }
    $dashboard = Invoke-RestMethod -Method Get -Uri "$BACKEND_URL/api/admin/dashboard" -Headers $headers -ErrorAction Stop
    
    if ($dashboard.success) {
        Write-Host "[OK] Dashboard loaded!" -ForegroundColor Green
        Write-Host "    Total Users: $($dashboard.data.totalUsers)" -ForegroundColor Gray
        Write-Host "    Total Lessons: $($dashboard.data.totalLessons)" -ForegroundColor Gray
        Write-Host "    Total XP: $($dashboard.data.totalXP)" -ForegroundColor Gray
    } else {
        Write-Host "[FAIL] Dashboard failed!" -ForegroundColor Red
    }
} catch {
    Write-Host "[FAIL] Dashboard error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n"

# ============================================
# 4. تست Admin Users
# ============================================

Write-Host "[4] Testing Admin Users..." -ForegroundColor Yellow
try {
    $headers = @{ "Authorization" = "Bearer $token" }
    $users = Invoke-RestMethod -Method Get -Uri "$BACKEND_URL/api/admin/users" -Headers $headers -ErrorAction Stop
    
    if ($users.success) {
        Write-Host "[OK] Users loaded!" -ForegroundColor Green
        $count = if ($users.data) { $users.data.Count } else { 0 }
        Write-Host "    Total Users: $count" -ForegroundColor Gray
    } else {
        Write-Host "[FAIL] Users failed!" -ForegroundColor Red
    }
} catch {
    Write-Host "[FAIL] Users error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n"

# ============================================
# 5. تست Admin Lessons
# ============================================

Write-Host "[5] Testing Admin Lessons..." -ForegroundColor Yellow
try {
    $headers = @{ "Authorization" = "Bearer $token" }
    $lessons = Invoke-RestMethod -Method Get -Uri "$BACKEND_URL/api/admin/lessons" -Headers $headers -ErrorAction Stop
    
    if ($lessons.success) {
        Write-Host "[OK] Lessons loaded!" -ForegroundColor Green
        $count = if ($lessons.data) { $lessons.data.Count } else { 0 }
        Write-Host "    Total Lessons: $count" -ForegroundColor Gray
    } else {
        Write-Host "[FAIL] Lessons failed!" -ForegroundColor Red
    }
} catch {
    Write-Host "[FAIL] Lessons error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n"

# ============================================
# 6. تست Admin Achievements
# ============================================

Write-Host "[6] Testing Admin Achievements..." -ForegroundColor Yellow
try {
    $headers = @{ "Authorization" = "Bearer $token" }
    $achievements = Invoke-RestMethod -Method Get -Uri "$BACKEND_URL/api/admin/achievements" -Headers $headers -ErrorAction Stop
    
    if ($achievements.success) {
        Write-Host "[OK] Achievements loaded!" -ForegroundColor Green
        $count = if ($achievements.data) { $achievements.data.Count } else { 0 }
        Write-Host "    Total Achievements: $count" -ForegroundColor Gray
    } else {
        Write-Host "[FAIL] Achievements failed!" -ForegroundColor Red
    }
} catch {
    Write-Host "[FAIL] Achievements error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n"

# ============================================
# 7. تست Admin Exercises
# ============================================

Write-Host "[7] Testing Admin Exercises..." -ForegroundColor Yellow
try {
    $headers = @{ "Authorization" = "Bearer $token" }
    $exercises = Invoke-RestMethod -Method Get -Uri "$BACKEND_URL/api/admin/exercises" -Headers $headers -ErrorAction Stop
    
    if ($exercises.success) {
        Write-Host "[OK] Exercises loaded!" -ForegroundColor Green
        $count = if ($exercises.data) { $exercises.data.Count } else { 0 }
        Write-Host "    Total Exercises: $count" -ForegroundColor Gray
    } else {
        Write-Host "[FAIL] Exercises failed!" -ForegroundColor Red
    }
} catch {
    Write-Host "[FAIL] Exercises error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n"

# ============================================
# 8. تست Frontend
# ============================================

Write-Host "[8] Testing Frontend..." -ForegroundColor Yellow
try {
    $frontend = Invoke-WebRequest -Method Get -Uri "$FRONTEND_URL" -UseBasicParsing -TimeoutSec 5
    if ($frontend.StatusCode -eq 200) {
        Write-Host "[OK] Frontend is running!" -ForegroundColor Green
    } else {
        Write-Host "[WARN] Frontend status: $($frontend.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "[WARN] Frontend not responding: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host "`n"

# ============================================
# 9. خلاصه نهایی
# ============================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TEST COMPLETED!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Summary:"
Write-Host "   Backend: http://localhost:5001"
Write-Host "   Frontend: http://localhost:3000"
Write-Host "   Admin Panel: http://localhost:3000/admin"
Write-Host ""
Write-Host "Credentials:"
Write-Host "   Email: admin@german-academy.com"
Write-Host "   Password: admin123456"
Write-Host ""
Write-Host "For production deployment, configure .env.production"