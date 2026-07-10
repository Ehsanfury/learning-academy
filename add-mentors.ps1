# add-mentors.ps1
# Create mentors in database

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Adding Mentors to Database" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Login
$loginResponse = Invoke-RestMethod -Method Post -Uri "http://localhost:5001/api/auth/login" -ContentType "application/json" -Body '{"email":"admin@german-academy.com","password":"admin123456"}'
$token = $loginResponse.data.accessToken
$headers = @{ "Authorization" = "Bearer $token" }
Write-Host "Logged in successfully`n" -ForegroundColor Green

# Mentor data - use register endpoint to create mentors
$mentors = @(
    @{
        id = "mentor-1"
        name = "Anna Schmidt"
        level = "A1"
        hourlyRate = 15
        languages = @("fa", "de", "en")
        specializations = @("Conversation", "Grammar", "Pronunciation")
        bio = @{
            fa = "Experienced German teacher with 5 years experience"
            en = "Experienced German teacher with 5 years of experience"
            de = "Erfahrener Deutschlehrer mit 5 Jahren Erfahrung"
        }
        isVerified = $true
    }
    @{
        id = "mentor-2"
        name = "Thomas Weber"
        level = "B1"
        hourlyRate = 20
        languages = @("fa", "de")
        specializations = @("Goethe Exam", "Conversation", "Writing")
        bio = @{
            fa = "Professional German instructor specializing in conversation"
            en = "Professional German instructor specializing in conversation"
            de = "Professioneller Deutschlehrer mit Spezialisierung auf Konversation"
        }
        isVerified = $true
    }
)

$count = 0
foreach ($mentor in $mentors) {
    Write-Host "Creating mentor: $($mentor.id)" -ForegroundColor Yellow
    
    $body = $mentor | ConvertTo-Json -Depth 5
    
    try {
        $response = Invoke-RestMethod -Method Post -Uri "http://localhost:5001/api/mentors/register" -Headers $headers -ContentType "application/json" -Body $body -ErrorAction Stop
        if ($response.success) {
            Write-Host "  ✅ Created: $($mentor.id) - $($mentor.name)" -ForegroundColor Green
            $count++
        }
    } catch {
        Write-Host "  ❌ Error: $($mentor.id)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $reader.BaseStream.Position = 0
            $reader.DiscardBufferedData()
            $responseBody = $reader.ReadToEnd()
            Write-Host "  Response: $responseBody" -ForegroundColor Yellow
        }
    }
}

Write-Host "`nCreated $count mentors!" -ForegroundColor Green