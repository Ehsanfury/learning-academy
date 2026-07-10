# test-system.ps1
# Learning Academy - Full System Test

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Learning Academy - Full System Test" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# 1. Health Check
Write-Host "1. Health Check..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:5001/health" -TimeoutSec 5
    Write-Host "  [OK] Status: $($health.status)" -ForegroundColor Green
    Write-Host "  [OK] Environment: $($health.environment)" -ForegroundColor Green
    Write-Host "  [OK] Database: $($health.services.database)" -ForegroundColor Green
} catch {
    Write-Host "  [FAIL] Health Check: $($_.Exception.Message)" -ForegroundColor Red
}

# 2. Login
Write-Host "`n2. Login..." -ForegroundColor Yellow
try {
    $login = Invoke-RestMethod -Method Post -Uri "http://localhost:5001/api/auth/login" -ContentType "application/json" -Body '{"email":"admin@german-academy.com","password":"admin123456"}'
    if ($login.success) {
        Write-Host "  [OK] Login: SUCCESS" -ForegroundColor Green
        $token = $login.data.accessToken
        $headers = @{ "Authorization" = "Bearer $token" }
    } else {
        Write-Host "  [FAIL] Login: $($login.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "  [FAIL] Login: $($_.Exception.Message)" -ForegroundColor Red
}

if ($token) {
    # 3. Lessons
    Write-Host "`n3. Lessons..." -ForegroundColor Yellow
    try {
        $lessons = Invoke-RestMethod -Method Get -Uri "http://localhost:5001/api/lessons" -Headers $headers
        Write-Host "  [OK] Total Lessons: $($lessons.data.total)" -ForegroundColor Green
        if ($lessons.data.lessons.Count -gt 0) {
            $first = $lessons.data.lessons[0]
            Write-Host "  [OK] First Lesson: $($first.title.fa)" -ForegroundColor Gray
        }
    } catch {
        Write-Host "  [FAIL] Lessons: $($_.Exception.Message)" -ForegroundColor Red
    }

    # 4. Profile
    Write-Host "`n4. Profile..." -ForegroundColor Yellow
    try {
        $profile = Invoke-RestMethod -Method Get -Uri "http://localhost:5001/api/users/profile" -Headers $headers
        Write-Host "  [OK] XP: $($profile.data.xp)" -ForegroundColor Green
        Write-Host "  [OK] Level: $($profile.data.level)" -ForegroundColor Green
        Write-Host "  [OK] Streak: $($profile.data.streak)" -ForegroundColor Green
    } catch {
        Write-Host "  [FAIL] Profile: $($_.Exception.Message)" -ForegroundColor Red
    }

    # 5. Achievements
    Write-Host "`n5. Achievements..." -ForegroundColor Yellow
    try {
        $achievements = Invoke-RestMethod -Method Get -Uri "http://localhost:5001/api/achievements" -Headers $headers
        $earned = $achievements.data | Where-Object { $_.earned -eq $true }
        Write-Host "  [OK] Earned: $($earned.Count)/$($achievements.data.Count)" -ForegroundColor Green
        foreach ($ach in $earned) {
            Write-Host "     [ACH] $($ach.title.fa) ($($ach.xpReward) XP)" -ForegroundColor Gray
        }
    } catch {
        Write-Host "  [FAIL] Achievements: $($_.Exception.Message)" -ForegroundColor Red
    }

    # 6. Admin Stats
    Write-Host "`n6. Admin Stats..." -ForegroundColor Yellow
    try {
        $stats = Invoke-RestMethod -Method Get -Uri "http://localhost:5001/api/admin/stats" -Headers $headers
        Write-Host "  [OK] Users: $($stats.data.users)" -ForegroundColor Green
        Write-Host "  [OK] Lessons: $($stats.data.lessons)" -ForegroundColor Green
        Write-Host "  [OK] Total XP: $($stats.data.totalXP)" -ForegroundColor Green
    } catch {
        Write-Host "  [FAIL] Admin Stats: $($_.Exception.Message)" -ForegroundColor Red
    }

    # 7. Dictionary
    Write-Host "`n7. Dictionary..." -ForegroundColor Yellow
    try {
        $dictTest = Invoke-RestMethod -Method Get -Uri "http://localhost:5001/api/dictionary" -Headers $headers -ErrorAction Stop
        Write-Host "  [OK] GET /api/dictionary: SUCCESS" -ForegroundColor Green
        $dictCount = $dictTest.data.Count
        if ($dictCount -gt 0) {
            Write-Host "  [OK] Total Words: $dictCount" -ForegroundColor Green
        } else {
            Write-Host "  [WARN] Dictionary is empty" -ForegroundColor Yellow
        }
    } catch {
        if ($_.Exception.Response.StatusCode -eq 404) {
            Write-Host "  [FAIL] GET /api/dictionary: 404 Not Found" -ForegroundColor Red
            Write-Host "     [FIX] Add dictionaryRoutes to app.js" -ForegroundColor Yellow
        } else {
            Write-Host "  [FAIL] Dictionary: $($_.Exception.Message)" -ForegroundColor Red
        }
    }

    # 8. Stories
    Write-Host "`n8. Stories..." -ForegroundColor Yellow
    try {
        $stories = Invoke-RestMethod -Method Get -Uri "http://localhost:5001/api/stories" -Headers $headers
        Write-Host "  [OK] Total Stories: $($stories.data.Count)" -ForegroundColor Green
    } catch {
        Write-Host "  [FAIL] Stories: $($_.Exception.Message)" -ForegroundColor Red
    }

    # 9. Mentors
    Write-Host "`n9. Mentors..." -ForegroundColor Yellow
    try {
        $mentors = Invoke-RestMethod -Method Get -Uri "http://localhost:5001/api/mentors" -Headers $headers
        Write-Host "  [OK] Total Mentors: $($mentors.data.Count)" -ForegroundColor Green
    } catch {
        Write-Host "  [FAIL] Mentors: $($_.Exception.Message)" -ForegroundColor Red
    }

    # 10. Scenarios
    Write-Host "`n10. Scenarios..." -ForegroundColor Yellow
    try {
        $scenarios = Invoke-RestMethod -Method Get -Uri "http://localhost:5001/api/scenarios" -Headers $headers
        Write-Host "  [OK] Total Scenarios: $($scenarios.data.Count)" -ForegroundColor Green
    } catch {
        Write-Host "  [FAIL] Scenarios: $($_.Exception.Message)" -ForegroundColor Red
    }

    # 11. AI Chat
    Write-Host "`n11. AI Chat..." -ForegroundColor Yellow
    try {
        $aiBody = '{"message":"Hallo, wie geht es dir?","sessionId":"test"}'
        $aiResponse = Invoke-RestMethod -Method Post -Uri "http://localhost:5001/api/ai/chat" -Headers $headers -ContentType "application/json" -Body $aiBody -ErrorAction Stop
        if ($aiResponse.success) {
            $responseText = $aiResponse.data.response
            if ($responseText.Length -gt 50) {
                $responseText = $responseText.Substring(0, 50) + "..."
            }
            Write-Host "  [OK] AI Response: $responseText" -ForegroundColor Green
        } else {
            Write-Host "  [FAIL] AI Chat: $($aiResponse.message)" -ForegroundColor Red
        }
    } catch {
        Write-Host "  [FAIL] AI Chat: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "All tests completed" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`nRecommendations:" -ForegroundColor Yellow
try {
    $dictCheck = Invoke-RestMethod -Method Get -Uri "http://localhost:5001/api/dictionary" -Headers $headers -ErrorAction SilentlyContinue
    if ($dictCheck.success) {
        Write-Host "  [OK] Dictionary is working" -ForegroundColor Green
    }
} catch {
    Write-Host "  [FIX] Dictionary needs to be registered in app.js" -ForegroundColor Yellow
    Write-Host "        Add: app.use('/api/dictionary', authenticate, trackActivity, dictionaryRoutes);" -ForegroundColor White
}