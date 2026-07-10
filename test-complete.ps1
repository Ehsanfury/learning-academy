# test-complete.ps1 - Simple English version

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Learning Academy - Complete Test" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# 1. Login
Write-Host "1. Login..." -ForegroundColor Yellow
try {
    $loginResponse = Invoke-RestMethod -Method Post -Uri "http://localhost:5001/api/auth/login" `
        -ContentType "application/json" `
        -Body '{"email":"admin@german-academy.com","password":"admin123456"}'
    
    if ($loginResponse.success) {
        Write-Host "OK Login successful!" -ForegroundColor Green
        $token = $loginResponse.data.accessToken
        Write-Host "Token: $($token.Substring(0, 30))..." -ForegroundColor Gray
    } else {
        Write-Host "FAIL Login failed!" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "FAIL Login error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

$headers = @{ 
    "Authorization" = "Bearer $token"
    "Accept" = "application/json"
}

Write-Host "`n"

# 2. Get Lessons
Write-Host "2. Getting lessons..." -ForegroundColor Yellow
try {
    $lessonsResponse = Invoke-RestMethod -Method Get -Uri "http://localhost:5001/api/lessons" -Headers $headers
    
    Write-Host "OK Response received!" -ForegroundColor Green
    Write-Host "Total lessons: $($lessonsResponse.data.total)" -ForegroundColor Gray
    
    $firstLesson = $lessonsResponse.data.lessons[0]
    Write-Host "First lesson:" -ForegroundColor Yellow
    Write-Host "  ID: $($firstLesson.id)" -ForegroundColor White
    Write-Host "  Title: $($firstLesson.title.fa)" -ForegroundColor White
    Write-Host "  Sections: $($firstLesson.totalSections)" -ForegroundColor White
} catch {
    Write-Host "FAIL Error getting lessons: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n"

# 3. Complete Lesson (a1-l01)
Write-Host "3. Completing lesson A1-L01..." -ForegroundColor Yellow
try {
    $completeBody = '{"answers":{},"timeSpent":0,"score":100}'
    
    $completeResponse = Invoke-RestMethod -Method Post -Uri "http://localhost:5001/api/lessons/A1-L01/complete" `
        -Headers $headers `
        -ContentType "application/json" `
        -Body $completeBody
    
    if ($completeResponse.success) {
        Write-Host "OK Lesson completed!" -ForegroundColor Green
        Write-Host "  XP Earned: $($completeResponse.data.xpEarned)" -ForegroundColor Yellow
        Write-Host "  Total XP: $($completeResponse.data.totalXP)" -ForegroundColor Yellow
        Write-Host "  Is Perfect: $($completeResponse.data.isPerfect)" -ForegroundColor White
    } else {
        Write-Host "FAIL Failed to complete lesson!" -ForegroundColor Red
    }
} catch {
    Write-Host "FAIL Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n"

# 4. Get User Profile
Write-Host "4. Getting user profile..." -ForegroundColor Yellow
try {
    $profileResponse = Invoke-RestMethod -Method Get -Uri "http://localhost:5001/api/users/profile" -Headers $headers
    
    if ($profileResponse.success) {
        $profile = $profileResponse.data
        Write-Host "OK Profile loaded!" -ForegroundColor Green
        Write-Host "  Name: $($profile.name)" -ForegroundColor White
        Write-Host "  XP: $($profile.xp)" -ForegroundColor Yellow
        Write-Host "  Level: $($profile.level)" -ForegroundColor White
        Write-Host "  Streak: $($profile.streak)" -ForegroundColor Yellow
        Write-Host "  Longest Streak: $($profile.longestStreak)" -ForegroundColor White
    } else {
        Write-Host "FAIL Failed to load profile!" -ForegroundColor Red
    }
} catch {
    Write-Host "FAIL Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n"

# 5. Get Achievements
Write-Host "5. Getting achievements..." -ForegroundColor Yellow
try {
    $achievementsResponse = Invoke-RestMethod -Method Get -Uri "http://localhost:5001/api/achievements" -Headers $headers
    
    if ($achievementsResponse.success) {
        $achievements = $achievementsResponse.data
        Write-Host "OK Achievements loaded!" -ForegroundColor Green
        Write-Host "  Total: $($achievements.Count)" -ForegroundColor White
        
        $earned = $achievements | Where-Object { $_.earned -eq $true }
        Write-Host "  Earned: $($earned.Count)" -ForegroundColor Yellow
        
        if ($earned.Count -gt 0) {
            Write-Host "Earned achievements:" -ForegroundColor Cyan
            foreach ($ach in $earned) {
                $title = $ach.title.fa
                Write-Host "  - $title ($($ach.xpReward) XP)" -ForegroundColor White
            }
        }
    } else {
        Write-Host "FAIL Failed to load achievements!" -ForegroundColor Red
    }
} catch {
    Write-Host "FAIL Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n"

# 6. Get Streak Stats
Write-Host "6. Getting streak stats..." -ForegroundColor Yellow
try {
    $streakResponse = Invoke-RestMethod -Method Get -Uri "http://localhost:5001/api/users/streak" -Headers $headers
    
    if ($streakResponse.success) {
        $streak = $streakResponse.data
        Write-Host "OK Streak stats loaded!" -ForegroundColor Green
        Write-Host "  Current: $($streak.currentStreak) days" -ForegroundColor Yellow
        Write-Host "  Longest: $($streak.longestStreak) days" -ForegroundColor White
        Write-Host "  Active Today: $($streak.isActiveToday)" -ForegroundColor White
    } else {
        Write-Host "FAIL Failed to load streak stats!" -ForegroundColor Red
    }
} catch {
    Write-Host "FAIL Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n"

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan