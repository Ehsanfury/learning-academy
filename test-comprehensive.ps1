# test-comprehensive.ps1
# Comprehensive System Test - Learning Academy

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Comprehensive System Test" -ForegroundColor Cyan
Write-Host "Learning Academy" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$baseUrl = "http://localhost:5001/api"
$frontendUrl = "http://localhost:3000"
$testResults = @()
$passCount = 0
$failCount = 0

function Write-TestResult {
    param($name, $success, $message)
    $testResult = [PSCustomObject]@{
        Name = $name
        Success = $success
        Message = $message
    }
    $script:testResults += $testResult
    if ($success) {
        $script:passCount++
        Write-Host "   [PASS] $name - $message" -ForegroundColor Green
    } else {
        $script:failCount++
        Write-Host "   [FAIL] $name - $message" -ForegroundColor Red
    }
}

# ============================================
# 1. AUTHENTICATION TESTS
# ============================================
Write-Host "`n1. Authentication Tests..." -ForegroundColor Yellow

# 1.1 Login
try {
    $loginBody = '{"email":"admin@german-academy.com","password":"admin123456"}'
    $login = Invoke-RestMethod -Method Post -Uri "$baseUrl/auth/login" -ContentType "application/json" -Body $loginBody
    if ($login.success) {
        Write-TestResult "Login" $true "Token received"
        $token = $login.data.accessToken
        $refreshToken = $login.data.refreshToken
        $headers = @{ "Authorization" = "Bearer $token" }
    } else {
        Write-TestResult "Login" $false "Login failed"
        exit 1
    }
} catch {
    Write-TestResult "Login" $false $_.Exception.Message
    exit 1
}

# 1.2 Get Current User
try {
    $me = Invoke-RestMethod -Method Get -Uri "$baseUrl/auth/me" -Headers $headers
    if ($me.success -and $me.data) {
        Write-TestResult "Get Current User" $true "User: $($me.data.user.name)"
    } else {
        Write-TestResult "Get Current User" $false "Failed to get user"
    }
} catch {
    Write-TestResult "Get Current User" $false $_.Exception.Message
}

# 1.3 Refresh Token
try {
    # روش 1: اگر refreshToken در پاسخ login وجود دارد
    if ($login.data.refreshToken) {
        $refreshBody = "{`"refreshToken`":`"$($login.data.refreshToken)`"}"
    } 
    # روش 2: اگر refreshToken در کوکی است
    elseif ($login.data.refresh_token) {
        $refreshBody = "{`"refreshToken`":`"$($login.data.refresh_token)`"}"
    }
    # روش 3: اگر هیچکدام نیست، از کوکی استفاده کن
    else {
        # کوکی را از response بگیر
        $cookies = $loginResponse.Headers["Set-Cookie"]
        $refreshToken = ($cookies | Where-Object { $_ -match "refreshToken" } | ForEach-Object { ($_ -split ";")[0] -replace "refreshToken=", "" })
        $refreshBody = "{`"refreshToken`":`"$refreshToken`"}"
    }
    
    $refresh = Invoke-RestMethod -Method Post -Uri "$baseUrl/auth/refresh" -ContentType "application/json" -Body $refreshBody
    if ($refresh.success) {
        Write-TestResult "Refresh Token" $true "New token received"
    } else {
        Write-TestResult "Refresh Token" $false "Failed to refresh"
    }
} catch {
    Write-TestResult "Refresh Token" $false $_.Exception.Message
}

# ============================================
# 2. USER PROFILE TESTS
# ============================================
Write-Host "`n2. User Profile Tests..." -ForegroundColor Yellow

# 2.1 Get Profile
try {
    $profile = Invoke-RestMethod -Method Get -Uri "$baseUrl/users/profile" -Headers $headers
    if ($profile.success -and $profile.data) {
        Write-TestResult "Get Profile" $true "Name: $($profile.data.name), XP: $($profile.data.xp)"
    } else {
        Write-TestResult "Get Profile" $false "Failed to get profile"
    }
} catch {
    Write-TestResult "Get Profile" $false $_.Exception.Message
}

# 2.2 Get User Stats
try {
    $stats = Invoke-RestMethod -Method Get -Uri "$baseUrl/users/stats" -Headers $headers
    if ($stats.success) {
        Write-TestResult "Get User Stats" $true "XP: $($stats.data.xp), Level: $($stats.data.level)"
    } else {
        Write-TestResult "Get User Stats" $false "Failed to get stats"
    }
} catch {
    Write-TestResult "Get User Stats" $false $_.Exception.Message
}

# 2.3 Get Streak
try {
    $streak = Invoke-RestMethod -Method Get -Uri "$baseUrl/users/streak" -Headers $headers
    if ($streak.success) {
        Write-TestResult "Get Streak" $true "Streak: $($streak.data.currentStreak) days"
    } else {
        Write-TestResult "Get Streak" $false "Failed to get streak"
    }
} catch {
    Write-TestResult "Get Streak" $false $_.Exception.Message
}

# 2.4 Get Achievements
try {
    $achievements = Invoke-RestMethod -Method Get -Uri "$baseUrl/users/achievements" -Headers $headers
    if ($achievements.success) {
        Write-TestResult "Get Achievements" $true "Found $($achievements.data.Count) achievements"
    } else {
        Write-TestResult "Get Achievements" $false "Failed to get achievements"
    }
} catch {
    Write-TestResult "Get Achievements" $false $_.Exception.Message
}

# ============================================
# 3. LESSON SYSTEM TESTS
# ============================================
Write-Host "`n3. Lesson System Tests..." -ForegroundColor Yellow

# 3.1 Get All Lessons
try {
    $lessons = Invoke-RestMethod -Method Get -Uri "$baseUrl/lessons" -Headers $headers
    if ($lessons.success -and $lessons.data.lessons.Count -gt 0) {
        Write-TestResult "Get All Lessons" $true "Total: $($lessons.data.total) lessons"
        $firstLessonId = $lessons.data.lessons[0].id
    } else {
        Write-TestResult "Get All Lessons" $false "No lessons found"
    }
} catch {
    Write-TestResult "Get All Lessons" $false $_.Exception.Message
}

# 3.2 Get Lesson by ID
try {
    $lesson = Invoke-RestMethod -Method Get -Uri "$baseUrl/lessons/$firstLessonId" -Headers $headers
    if ($lesson.success -and $lesson.data) {
        Write-TestResult "Get Lesson by ID" $true "ID: $($lesson.data.id), Sections: $($lesson.data.totalSections)"
    } else {
        Write-TestResult "Get Lesson by ID" $false "Lesson not found"
    }
} catch {
    Write-TestResult "Get Lesson by ID" $false $_.Exception.Message
}

# 3.3 Get Lesson Progress
try {
    $progress = Invoke-RestMethod -Method Get -Uri "$baseUrl/lessons/$firstLessonId/progress" -Headers $headers
    if ($progress.success) {
        Write-TestResult "Get Lesson Progress" $true "Status: $($progress.data.status)"
    } else {
        Write-TestResult "Get Lesson Progress" $false "Failed to get progress"
    }
} catch {
    Write-TestResult "Get Lesson Progress" $false $_.Exception.Message
}

# 3.4 Complete Lesson
try {
    $completeBody = '{"answers":{},"timeSpent":0,"score":100}'
    $complete = Invoke-RestMethod -Method Post -Uri "$baseUrl/lessons/$firstLessonId/complete" -Headers $headers -ContentType "application/json" -Body $completeBody
    if ($complete.success) {
        Write-TestResult "Complete Lesson" $true "XP Earned: $($complete.data.xpEarned), Score: $($complete.data.score)%"
    } else {
        Write-TestResult "Complete Lesson" $false "Failed to complete lesson"
    }
} catch {
    Write-TestResult "Complete Lesson" $false $_.Exception.Message
}

# ============================================
# 4. DICTIONARY TESTS
# ============================================
Write-Host "`n4. Dictionary Tests..." -ForegroundColor Yellow

# 4.1 Get Dictionary
try {
    $dictionary = Invoke-RestMethod -Method Get -Uri "$baseUrl/dictionary?limit=10" -Headers $headers
    if ($dictionary.success) {
        Write-TestResult "Get Dictionary" $true "Found $($dictionary.data.words.Count) words"
    } else {
        Write-TestResult "Get Dictionary" $false "Failed to get dictionary"
    }
} catch {
    Write-TestResult "Get Dictionary" $false $_.Exception.Message
}

# 4.2 Search Dictionary
try {
    $search = Invoke-RestMethod -Method Get -Uri "$baseUrl/dictionary/search?q=hallo" -Headers $headers
    if ($search.success) {
        Write-TestResult "Search Dictionary" $true "Search results: $($search.data.total)"
    } else {
        Write-TestResult "Search Dictionary" $false "Failed to search"
    }
} catch {
    Write-TestResult "Search Dictionary" $false $_.Exception.Message
}

# 4.3 Get Word Details
try {
    $word = Invoke-RestMethod -Method Get -Uri "$baseUrl/dictionary/hallo" -Headers $headers
    if ($word.success) {
        Write-TestResult "Get Word Details" $true "Word: $($word.data.de) = $($word.data.fa)"
    } else {
        Write-TestResult "Get Word Details" $false "Word not found"
    }
} catch {
    Write-TestResult "Get Word Details" $false $_.Exception.Message
}

# ============================================
# 5. STORY SYSTEM TESTS
# ============================================
Write-Host "`n5. Story System Tests..." -ForegroundColor Yellow

# 5.1 Get Stories
try {
    $stories = Invoke-RestMethod -Method Get -Uri "$baseUrl/stories" -Headers $headers
    if ($stories.success) {
        Write-TestResult "Get Stories" $true "Found $($stories.data.Count) stories"
    } else {
        Write-TestResult "Get Stories" $false "Failed to get stories"
    }
} catch {
    Write-TestResult "Get Stories" $false $_.Exception.Message
}

# 5.2 Get Story by ID
try {
    if ($stories.data.Count -gt 0) {
        $storyId = $stories.data[0].id
        $story = Invoke-RestMethod -Method Get -Uri "$baseUrl/stories/$storyId" -Headers $headers
        if ($story.success) {
            Write-TestResult "Get Story by ID" $true "Story: $($story.data.title.fa)"
        } else {
            Write-TestResult "Get Story by ID" $false "Story not found"
        }
    } else {
        Write-TestResult "Get Story by ID" $false "No stories available"
    }
} catch {
    Write-TestResult "Get Story by ID" $false $_.Exception.Message
}

# ============================================
# 6. SCENARIO SYSTEM TESTS
# ============================================
Write-Host "`n6. Scenario System Tests..." -ForegroundColor Yellow

# 6.1 Get Scenarios
try {
    $scenarios = Invoke-RestMethod -Method Get -Uri "$baseUrl/scenarios" -Headers $headers
    if ($scenarios.success) {
        Write-TestResult "Get Scenarios" $true "Found $($scenarios.data.Count) scenarios"
    } else {
        Write-TestResult "Get Scenarios" $false "Failed to get scenarios"
    }
} catch {
    Write-TestResult "Get Scenarios" $false $_.Exception.Message
}

# 6.2 Get Scenario by ID
try {
    if ($scenarios.data.Count -gt 0) {
        $scenarioId = $scenarios.data[0].id
        $scenario = Invoke-RestMethod -Method Get -Uri "$baseUrl/scenarios/$scenarioId" -Headers $headers
        if ($scenario.success) {
            Write-TestResult "Get Scenario by ID" $true "Scenario: $($scenario.data.title.fa)"
        } else {
            Write-TestResult "Get Scenario by ID" $false "Scenario not found"
        }
    } else {
        Write-TestResult "Get Scenario by ID" $false "No scenarios available"
    }
} catch {
    Write-TestResult "Get Scenario by ID" $false $_.Exception.Message
}

# ============================================
# 7. MENTOR SYSTEM TESTS
# ============================================
Write-Host "`n7. Mentor System Tests..." -ForegroundColor Yellow

# 7.1 Get Mentors
try {
    $mentors = Invoke-RestMethod -Method Get -Uri "$baseUrl/mentors" -Headers $headers
    if ($mentors.success) {
        Write-TestResult "Get Mentors" $true "Found $($mentors.data.Count) mentors"
    } else {
        Write-TestResult "Get Mentors" $false "Failed to get mentors"
    }
} catch {
    Write-TestResult "Get Mentors" $false $_.Exception.Message
}

# 7.2 Get Mentor by ID
try {
    if ($mentors.data.Count -gt 0) {
        $mentorId = $mentors.data[0].id
        $mentor = Invoke-RestMethod -Method Get -Uri "$baseUrl/mentors/$mentorId" -Headers $headers
        if ($mentor.success) {
            Write-TestResult "Get Mentor by ID" $true "Mentor: $($mentor.data.name)"
        } else {
            Write-TestResult "Get Mentor by ID" $false "Mentor not found"
        }
    } else {
        Write-TestResult "Get Mentor by ID" $false "No mentors available"
    }
} catch {
    Write-TestResult "Get Mentor by ID" $false $_.Exception.Message
}

# ============================================
# 8. VOCABULARY SYSTEM TESTS
# ============================================
Write-Host "`n8. Vocabulary System Tests..." -ForegroundColor Yellow

# 8.1 Get Vocabulary
try {
    $vocab = Invoke-RestMethod -Method Get -Uri "$baseUrl/vocabulary/words?limit=10" -Headers $headers
    if ($vocab.success) {
        Write-TestResult "Get Vocabulary" $true "Found $($vocab.data.Count) words"
    } else {
        Write-TestResult "Get Vocabulary" $false "Failed to get vocabulary"
    }
} catch {
    Write-TestResult "Get Vocabulary" $false $_.Exception.Message
}

# 8.2 Get Categories
try {
    $categories = Invoke-RestMethod -Method Get -Uri "$baseUrl/vocabulary/categories" -Headers $headers
    if ($categories.success) {
        Write-TestResult "Get Categories" $true "Found $($categories.data.Count) categories"
    } else {
        Write-TestResult "Get Categories" $false "Failed to get categories"
    }
} catch {
    Write-TestResult "Get Categories" $false $_.Exception.Message
}

# ============================================
# 9. PROGRESS SYSTEM TESTS
# ============================================
Write-Host "`n9. Progress System Tests..." -ForegroundColor Yellow

# 9.1 Get All Progress
try {
    $progress = Invoke-RestMethod -Method Get -Uri "$baseUrl/progress" -Headers $headers
    if ($progress.success) {
        Write-TestResult "Get All Progress" $true "Total: $($progress.total) items"
    } else {
        Write-TestResult "Get All Progress" $false "Failed to get progress"
    }
} catch {
    Write-TestResult "Get All Progress" $false $_.Exception.Message
}

# 9.2 Get Progress Stats
try {
    $stats = Invoke-RestMethod -Method Get -Uri "$baseUrl/progress/stats" -Headers $headers
    if ($stats.success) {
        Write-TestResult "Get Progress Stats" $true "Completed: $($stats.data.completedLessons)"
    } else {
        Write-TestResult "Get Progress Stats" $false "Failed to get stats"
    }
} catch {
    Write-TestResult "Get Progress Stats" $false $_.Exception.Message
}

# 9.3 Get Daily Stats
try {
    $daily = Invoke-RestMethod -Method Get -Uri "$baseUrl/progress/daily-stats?days=7" -Headers $headers
    if ($daily.success) {
        Write-TestResult "Get Daily Stats" $true "Found $($daily.data.Count) days"
    } else {
        Write-TestResult "Get Daily Stats" $false "Failed to get daily stats"
    }
} catch {
    Write-TestResult "Get Daily Stats" $false $_.Exception.Message
}

# ============================================
# 10. ACHIEVEMENT SYSTEM TESTS
# ============================================
Write-Host "`n10. Achievement System Tests..." -ForegroundColor Yellow

# 10.1 Get All Achievements
try {
    $allAchievements = Invoke-RestMethod -Method Get -Uri "$baseUrl/achievements" -Headers $headers
    if ($allAchievements.success) {
        $earned = ($allAchievements.data | Where-Object { $_.earned -eq $true }).Count
        Write-TestResult "Get All Achievements" $true "Total: $($allAchievements.data.Count), Earned: $earned"
    } else {
        Write-TestResult "Get All Achievements" $false "Failed to get achievements"
    }
} catch {
    Write-TestResult "Get All Achievements" $false $_.Exception.Message
}

# 10.2 Get Achievement Stats
try {
    $achievementStats = Invoke-RestMethod -Method Get -Uri "$baseUrl/achievements/stats" -Headers $headers
    if ($achievementStats.success) {
        Write-TestResult "Get Achievement Stats" $true "Progress: $($achievementStats.data.progress)%"
    } else {
        Write-TestResult "Get Achievement Stats" $false "Failed to get stats"
    }
} catch {
    Write-TestResult "Get Achievement Stats" $false $_.Exception.Message
}

# ============================================
# 11. ADMIN PANEL TESTS
# ============================================
Write-Host "`n11. Admin Panel Tests..." -ForegroundColor Yellow

# 11.1 Admin Stats
try {
    $adminStats = Invoke-RestMethod -Method Get -Uri "$baseUrl/admin/stats" -Headers $headers
    if ($adminStats.success) {
        Write-TestResult "Admin Stats" $true "Users: $($adminStats.data.users), Lessons: $($adminStats.data.lessons)"
    } else {
        Write-TestResult "Admin Stats" $false "Failed to get admin stats"
    }
} catch {
    Write-TestResult "Admin Stats" $false $_.Exception.Message
}

# 11.2 Admin Users
try {
    $adminUsers = Invoke-RestMethod -Method Get -Uri "$baseUrl/admin/users?limit=10" -Headers $headers
    if ($adminUsers.success) {
        Write-TestResult "Admin Users" $true "Found $($adminUsers.data.Count) users"
    } else {
        Write-TestResult "Admin Users" $false "Failed to get users"
    }
} catch {
    Write-TestResult "Admin Users" $false $_.Exception.Message
}

# 11.3 Admin Lessons
try {
    $adminLessons = Invoke-RestMethod -Method Get -Uri "$baseUrl/admin/lessons?limit=10" -Headers $headers
    if ($adminLessons.success) {
        Write-TestResult "Admin Lessons" $true "Found $($adminLessons.data.Count) lessons"
    } else {
        Write-TestResult "Admin Lessons" $false "Failed to get lessons"
    }
} catch {
    Write-TestResult "Admin Lessons" $false $_.Exception.Message
}

# 11.4 Admin Achievements
try {
    $adminAchievements = Invoke-RestMethod -Method Get -Uri "$baseUrl/admin/achievements" -Headers $headers
    if ($adminAchievements.success) {
        Write-TestResult "Admin Achievements" $true "Found $($adminAchievements.data.Count) achievements"
    } else {
        Write-TestResult "Admin Achievements" $false "Failed to get achievements"
    }
} catch {
    Write-TestResult "Admin Achievements" $false $_.Exception.Message
}

# ============================================
# 12. AI SYSTEM TESTS
# ============================================
Write-Host "`n12. AI System Tests..." -ForegroundColor Yellow

# 12.1 AI Chat
try {
    $chatBody = '{"message":"Hallo, wie geht es dir?","level":"A1"}'
    $chat = Invoke-RestMethod -Method Post -Uri "$baseUrl/ai/chat" -Headers $headers -ContentType "application/json" -Body $chatBody
    if ($chat.success) {
        Write-TestResult "AI Chat" $true "Response received"
    } else {
        Write-TestResult "AI Chat" $false "Failed to get response"
    }
} catch {
    Write-TestResult "AI Chat" $false $_.Exception.Message
}

# 12.2 Grammar Correction
try {
    $grammarBody = '{"text":"Ich heiße Anna. Ich komme aus Deutschland."}'
    $grammar = Invoke-RestMethod -Method Post -Uri "$baseUrl/ai/grammar/correct" -Headers $headers -ContentType "application/json" -Body $grammarBody
    if ($grammar.success) {
        Write-TestResult "Grammar Correction" $true "Corrected text received"
    } else {
        Write-TestResult "Grammar Correction" $false "Failed to correct grammar"
    }
} catch {
    Write-TestResult "Grammar Correction" $false $_.Exception.Message
}

# ============================================
# 13. FRONTEND TESTS
# ============================================
Write-Host "`n13. Frontend Tests..." -ForegroundColor Yellow

$frontendPages = @(
    "/",
    "/login",
    "/register",
    "/dashboard",
    "/learn",
    "/dictionary",
    "/stories",
    "/scenarios",
    "/mentors",
    "/ai-tutor",
    "/achievements",
    "/profile",
    "/settings",
    "/admin",
    "/admin/users",
    "/admin/lessons",
    "/admin/exercises",
    "/admin/achievements"
)

foreach ($page in $frontendPages) {
    try {
        $response = Invoke-WebRequest -Uri "$frontendUrl$page" -UseBasicParsing -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-TestResult "Frontend: $page" $true "Status: 200"
        } else {
            Write-TestResult "Frontend: $page" $false "Status: $($response.StatusCode)"
        }
    } catch {
        Write-TestResult "Frontend: $page" $false $_.Exception.Message
    }
}

# ============================================
# 14. DATABASE CONNECTION TEST
# ============================================
Write-Host "`n14. Database Connection Test..." -ForegroundColor Yellow

try {
    $health = Invoke-RestMethod -Uri "http://localhost:5001/health" -TimeoutSec 5
    if ($health.services.database -eq "connected") {
        Write-TestResult "Database Connection" $true "Database is connected"
    } else {
        Write-TestResult "Database Connection" $false "Database is disconnected"
    }
} catch {
    Write-TestResult "Database Connection" $false $_.Exception.Message
}

# ============================================
# FINAL SUMMARY
# ============================================
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$total = $passCount + $failCount
$successRate = if ($total -gt 0) { [math]::Round(($passCount / $total) * 100, 2) } else { 0 }

Write-Host ""
Write-Host "   Passed : $passCount" -ForegroundColor Green
Write-Host "   Failed : $failCount" -ForegroundColor Red
Write-Host "   Total  : $total" -ForegroundColor Yellow
Write-Host "   Success Rate: $successRate%" -ForegroundColor Cyan

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

if ($failCount -eq 0) {
    Write-Host "ALL TESTS PASSED" -ForegroundColor Green
    Write-Host "System is fully operational" -ForegroundColor Green
} else {
    Write-Host "SOME TESTS FAILED" -ForegroundColor Red
    Write-Host "Please check the failed tests above" -ForegroundColor Red
}

Write-Host "========================================" -ForegroundColor Cyan