# test-backend.ps1
# Complete Backend API Tests

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Backend API Tests" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$baseUrl = "http://localhost:5001/api"
$token = $null
$userId = $null
$testResults = @()

function Add-TestResult {
    param($name, $success, $message)
    $testResults += [PSCustomObject]@{
        Name = $name
        Success = $success
        Message = $message
    }
    if ($success) {
        Write-Host "   [OK] $name - $message" -ForegroundColor Green
    } else {
        Write-Host "   [FAIL] $name - $message" -ForegroundColor Red
    }
}

# ============================================
# 1. Test Health Check
# ============================================
Write-Host "1. Testing Health Check..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:5001/health" -TimeoutSec 5
    if ($health.status -eq "healthy") {
        Add-TestResult "Health Check" $true "Server is healthy"
    } else {
        Add-TestResult "Health Check" $false "Server is not healthy"
    }
} catch {
    Add-TestResult "Health Check" $false "Server not responding: $($_.Exception.Message)"
}
Write-Host "`n"

# ============================================
# 2. Test Login
# ============================================
Write-Host "2. Testing Login..." -ForegroundColor Yellow
try {
    $loginBody = '{"email":"admin@german-academy.com","password":"admin123456"}'
    $loginResponse = Invoke-RestMethod -Method Post -Uri "$baseUrl/auth/login" -Body $loginBody -ContentType "application/json"
    
    if ($loginResponse.success -and $loginResponse.data.accessToken) {
        $token = $loginResponse.data.accessToken
        $userId = $loginResponse.data.user.id
        Add-TestResult "Login" $true "Token received"
    } else {
        Add-TestResult "Login" $false "Failed to get token"
    }
} catch {
    Add-TestResult "Login" $false $_.Exception.Message
}
Write-Host "`n"

if (-not $token) {
    Write-Host "[FAIL] Cannot continue without authentication token" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "[FAIL] Backend tests failed!" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Cyan
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# ============================================
# 3. Test Get Lessons
# ============================================
Write-Host "3. Testing Get Lessons..." -ForegroundColor Yellow
try {
    $lessonsResponse = Invoke-RestMethod -Method Get -Uri "$baseUrl/lessons" -Headers $headers
    if ($lessonsResponse.success -and $lessonsResponse.data.lessons.Count -gt 0) {
        Add-TestResult "Get Lessons" $true "Found $($lessonsResponse.data.lessons.Count) lessons"
        $firstLesson = $lessonsResponse.data.lessons[0]
        Write-Host "      First lesson: $($firstLesson.title.fa) ($($firstLesson.totalSections) sections)" -ForegroundColor Gray
    } else {
        Add-TestResult "Get Lessons" $false "No lessons found"
    }
} catch {
    Add-TestResult "Get Lessons" $false $_.Exception.Message
}
Write-Host "`n"

# ============================================
# 4. Test Get Lesson by ID
# ============================================
Write-Host "4. Testing Get Lesson by ID..." -ForegroundColor Yellow
try {
    $lessonResponse = Invoke-RestMethod -Method Get -Uri "$baseUrl/lessons/a1-l01" -Headers $headers
    if ($lessonResponse.success -and $lessonResponse.data) {
        Add-TestResult "Get Lesson" $true "Lesson found: $($lessonResponse.data.title.fa)"
        Write-Host "      Sections: $($lessonResponse.data.totalSections)" -ForegroundColor Gray
        Write-Host "      Vocabulary: $($lessonResponse.data.totalVocabulary)" -ForegroundColor Gray
    } else {
        Add-TestResult "Get Lesson" $false "Lesson not found"
    }
} catch {
    Add-TestResult "Get Lesson" $false $_.Exception.Message
}
Write-Host "`n"

# ============================================
# 5. Test Complete Lesson
# ============================================
Write-Host "5. Testing Complete Lesson..." -ForegroundColor Yellow
try {
    $completeBody = '{"answers":{},"timeSpent":0,"score":100}'
    $completeResponse = Invoke-RestMethod -Method Post -Uri "$baseUrl/lessons/a1-l01/complete" -Headers $headers -Body $completeBody
    
    if ($completeResponse.success) {
        Add-TestResult "Complete Lesson" $true "XP Earned: $($completeResponse.data.xpEarned)"
        Write-Host "      Score: $($completeResponse.data.score)%" -ForegroundColor Gray
        Write-Host "      Perfect: $($completeResponse.data.isPerfect)" -ForegroundColor Gray
    } else {
        Add-TestResult "Complete Lesson" $false $completeResponse.message
    }
} catch {
    Add-TestResult "Complete Lesson" $false $_.Exception.Message
}
Write-Host "`n"

# ============================================
# 6. Test User Profile
# ============================================
Write-Host "6. Testing User Profile..." -ForegroundColor Yellow
try {
    $profileResponse = Invoke-RestMethod -Method Get -Uri "$baseUrl/users/profile" -Headers $headers
    if ($profileResponse.success -and $profileResponse.data) {
        $profile = $profileResponse.data
        Add-TestResult "User Profile" $true "Name: $($profile.name), XP: $($profile.xp)"
        Write-Host "      Level: $($profile.level)" -ForegroundColor Gray
        Write-Host "      Streak: $($profile.streak)" -ForegroundColor Gray
        Write-Host "      Achievements: $($profile.achievements.Count)" -ForegroundColor Gray
    } else {
        Add-TestResult "User Profile" $false "Profile not found"
    }
} catch {
    Add-TestResult "User Profile" $false $_.Exception.Message
}
Write-Host "`n"

# ============================================
# 7. Test Achievements
# ============================================
Write-Host "7. Testing Achievements..." -ForegroundColor Yellow
try {
    $achievementsResponse = Invoke-RestMethod -Method Get -Uri "$baseUrl/achievements" -Headers $headers
    if ($achievementsResponse.success) {
        $all = $achievementsResponse.data
        $earned = $all | Where-Object { $_.earned -eq $true }
        Add-TestResult "Achievements" $true "Total: $($all.Count), Earned: $($earned.Count)"
        if ($earned.Count -gt 0) {
            Write-Host "      Earned:" -ForegroundColor Gray
            foreach ($ach in $earned) {
                Write-Host "         - $($ach.title.fa) ($($ach.xpReward) XP)" -ForegroundColor Gray
            }
        }
    } else {
        Add-TestResult "Achievements" $false "Failed to get achievements"
    }
} catch {
    Add-TestResult "Achievements" $false $_.Exception.Message
}
Write-Host "`n"

# ============================================
# 8. Test Dictionary
# ============================================
Write-Host "8. Testing Dictionary..." -ForegroundColor Yellow
try {
    $dictResponse = Invoke-RestMethod -Method Get -Uri "$baseUrl/dictionary?limit=10" -Headers $headers
    if ($dictResponse.success) {
        $words = $dictResponse.data.words
        Add-TestResult "Dictionary" $true "Found $($words.Count) words"
        if ($words.Count -gt 0) {
            Write-Host "      Sample: $($words[0].de) = $($words[0].fa)" -ForegroundColor Gray
        }
    } else {
        Add-TestResult "Dictionary" $false "Failed to get dictionary"
    }
} catch {
    Add-TestResult "Dictionary" $false $_.Exception.Message
}
Write-Host "`n"

# ============================================
# 9. Test Stories
# ============================================
Write-Host "9. Testing Stories..." -ForegroundColor Yellow
try {
    $storiesResponse = Invoke-RestMethod -Method Get -Uri "$baseUrl/stories" -Headers $headers
    if ($storiesResponse.success) {
        Add-TestResult "Stories" $true "Found $($storiesResponse.data.Count) stories"
    } else {
        Add-TestResult "Stories" $false "Failed to get stories"
    }
} catch {
    Add-TestResult "Stories" $false $_.Exception.Message
}
Write-Host "`n"

# ============================================
# 10. Test Mentors
# ============================================
Write-Host "10. Testing Mentors..." -ForegroundColor Yellow
try {
    $mentorsResponse = Invoke-RestMethod -Method Get -Uri "$baseUrl/mentors" -Headers $headers
    if ($mentorsResponse.success) {
        Add-TestResult "Mentors" $true "Found $($mentorsResponse.data.Count) mentors"
    } else {
        Add-TestResult "Mentors" $false "Failed to get mentors"
    }
} catch {
    Add-TestResult "Mentors" $false $_.Exception.Message
}
Write-Host "`n"

# ============================================
# 11. Test Admin Dashboard
# ============================================
Write-Host "11. Testing Admin Dashboard..." -ForegroundColor Yellow
try {
    $adminStats = Invoke-RestMethod -Method Get -Uri "$baseUrl/admin/stats" -Headers $headers
    if ($adminStats.success) {
        Add-TestResult "Admin Dashboard" $true "Users: $($adminStats.data.users), Lessons: $($adminStats.data.lessons)"
    } else {
        Add-TestResult "Admin Dashboard" $false "Failed to get admin stats"
    }
} catch {
    Add-TestResult "Admin Dashboard" $false $_.Exception.Message
}
Write-Host "`n"

# ============================================
# Summary
# ============================================
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$passed = ($testResults | Where-Object { $_.Success -eq $true }).Count
$failed = ($testResults | Where-Object { $_.Success -eq $false }).Count
$total = $testResults.Count

Write-Host "   [OK] Passed: $passed" -ForegroundColor Green
Write-Host "   [FAIL] Failed: $failed" -ForegroundColor Red
Write-Host "   Total: $total" -ForegroundColor Yellow

if ($failed -eq 0) {
    Write-Host "`n[SUCCESS] All backend tests passed!" -ForegroundColor Green
} else {
    Write-Host "`n[WARN] Some tests failed. Please check the errors above." -ForegroundColor Yellow
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "[OK] Backend tests complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan