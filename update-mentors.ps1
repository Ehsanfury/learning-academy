# update-mentors.ps1
# Update mentor information

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Updating Mentors Information" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Login
$loginResponse = Invoke-RestMethod -Method Post -Uri "http://localhost:5001/api/auth/login" -ContentType "application/json" -Body '{"email":"admin@german-academy.com","password":"admin123456"}'
$token = $loginResponse.data.accessToken
$headers = @{ "Authorization" = "Bearer $token" }
Write-Host "Logged in successfully`n" -ForegroundColor Green

# Get existing mentors
$mentorsList = Invoke-RestMethod -Method Get -Uri "http://localhost:5001/api/mentors" -Headers $headers

# Update mentor-1
$mentor1 = $mentorsList.data | Where-Object { $_.id -eq "mentor-1" -or $_.name -like "*Anna*" }
if ($mentor1) {
    Write-Host "Updating mentor: $($mentor1.id)" -ForegroundColor Yellow
    $updateBody = @{
        name = "Anna Schmidt"
        level = "A1"
        hourlyRate = 15
        isVerified = $true
        totalStudents = 50
        rating = 4.8
        languages = @("fa", "de", "en")
        specializations = @("Conversation", "Grammar", "Pronunciation")
        bio = @{
            fa = "Experienced German teacher with 5 years experience"
            en = "Experienced German teacher with 5 years of experience"
            de = "Erfahrener Deutschlehrer mit 5 Jahren Erfahrung"
        }
        isActive = $true
    } | ConvertTo-Json -Depth 5
    
    try {
        $response = Invoke-RestMethod -Method Put -Uri "http://localhost:5001/api/mentors/$($mentor1.id)" -Headers $headers -ContentType "application/json" -Body $updateBody -ErrorAction Stop
        if ($response.success) {
            Write-Host "  ✅ Updated: $($mentor1.name)" -ForegroundColor Green
        }
    } catch {
        Write-Host "  ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Update mentor-2
$mentor2 = $mentorsList.data | Where-Object { $_.id -eq "mentor-2" -or ($_.name -like "*Thomas*" -and $_.id -ne "mentor-1") }
if ($mentor2) {
    Write-Host "Updating mentor: $($mentor2.id)" -ForegroundColor Yellow
    $updateBody = @{
        name = "Thomas Weber"
        level = "B1"
        hourlyRate = 20
        isVerified = $true
        totalStudents = 35
        rating = 4.6
        languages = @("fa", "de")
        specializations = @("Goethe Exam", "Conversation", "Writing")
        bio = @{
            fa = "Professional German instructor specializing in conversation"
            en = "Professional German instructor specializing in conversation"
            de = "Professioneller Deutschlehrer mit Spezialisierung auf Konversation"
        }
        isActive = $true
    } | ConvertTo-Json -Depth 5
    
    try {
        $response = Invoke-RestMethod -Method Put -Uri "http://localhost:5001/api/mentors/$($mentor2.id)" -Headers $headers -ContentType "application/json" -Body $updateBody -ErrorAction Stop
        if ($response.success) {
            Write-Host "  ✅ Updated: $($mentor2.name)" -ForegroundColor Green
        }
    } catch {
        Write-Host "  ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️ Mentor 2 not found" -ForegroundColor Yellow
}

Write-Host "`nMentors updated!" -ForegroundColor Green