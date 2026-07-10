# test-frontend.ps1
# Frontend Tests - Check pages and functionality

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Frontend Tests" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$frontendUrl = "http://localhost:3000"
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
# 1. Test Home Page
# ============================================
Write-Host "1. Testing Home Page..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri $frontendUrl -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Add-TestResult "Home Page" $true "Page loaded successfully"
    } else {
        Add-TestResult "Home Page" $false "Status: $($response.StatusCode)"
    }
} catch {
    Add-TestResult "Home Page" $false "Frontend not running: $($_.Exception.Message)"
}
Write-Host "`n"

# ============================================
# 2. Test Pages
# ============================================
$pages = @(
    @{path="/login"; name="Login"},
    @{path="/register"; name="Register"},
    @{path="/dashboard"; name="Dashboard"},
    @{path="/learn"; name="Learn"},
    @{path="/dictionary"; name="Dictionary"},
    @{path="/stories"; name="Stories"},
    @{path="/scenarios"; name="Scenarios"},
    @{path="/mentors"; name="Mentors"},
    @{path="/achievements"; name="Achievements"},
    @{path="/profile"; name="Profile"},
    @{path="/settings"; name="Settings"}
)

Write-Host "2. Testing Pages..." -ForegroundColor Yellow
foreach ($page in $pages) {
    try {
        $response = Invoke-WebRequest -Uri "$frontendUrl$($page.path)" -UseBasicParsing -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Add-TestResult $page.name $true "Page accessible"
        } else {
            Add-TestResult $page.name $false "Status: $($response.StatusCode)"
        }
    } catch {
        Add-TestResult $page.name $false "Error: $($_.Exception.Message)"
    }
}
Write-Host "`n"

# ============================================
# 3. Test Admin Pages
# ============================================
Write-Host "3. Testing Admin Pages..." -ForegroundColor Yellow

$adminPages = @(
    @{path="/admin"; name="Admin Dashboard"},
    @{path="/admin/users"; name="Admin Users"},
    @{path="/admin/lessons"; name="Admin Lessons"},
    @{path="/admin/exercises"; name="Admin Exercises"},
    @{path="/admin/achievements"; name="Admin Achievements"}
)

foreach ($page in $adminPages) {
    try {
        $response = Invoke-WebRequest -Uri "$frontendUrl$($page.path)" -UseBasicParsing -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Add-TestResult $page.name $true "Page accessible"
        } else {
            Add-TestResult $page.name $false "Status: $($response.StatusCode)"
        }
    } catch {
        Add-TestResult $page.name $false "Error: $($_.Exception.Message)"
    }
}
Write-Host "`n"

# ============================================
# Summary
# ============================================
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Frontend Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$passed = ($testResults | Where-Object { $_.Success -eq $true }).Count
$failed = ($testResults | Where-Object { $_.Success -eq $false }).Count
$total = $testResults.Count

Write-Host "   [OK] Passed: $passed" -ForegroundColor Green
Write-Host "   [FAIL] Failed: $failed" -ForegroundColor Red
Write-Host "   Total: $total" -ForegroundColor Yellow

if ($failed -eq 0) {
    Write-Host "`n[SUCCESS] All frontend tests passed!" -ForegroundColor Green
} else {
    Write-Host "`n[WARN] Some tests failed. Please check the errors above." -ForegroundColor Yellow
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "[OK] Frontend tests complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan