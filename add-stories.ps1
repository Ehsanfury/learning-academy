# add-stories.ps1
# Add stories to database

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Adding Stories to Database" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Login
$loginResponse = Invoke-RestMethod -Method Post -Uri "http://localhost:5001/api/auth/login" -ContentType "application/json" -Body '{"email":"admin@german-academy.com","password":"admin123456"}'
$token = $loginResponse.data.accessToken
$headers = @{ "Authorization" = "Bearer $token" }
Write-Host "Logged in successfully`n" -ForegroundColor Green

# Story 1
$story1 = @{
    id = "story-2"
    level = "A1"
    title = @{
        fa = "Trip to Berlin"
        en = "Trip to Berlin"
        de = "Reise nach Berlin"
    }
    description = @{
        fa = "A short story about a trip to Berlin"
        en = "A short story about a trip to Berlin"
        de = "Eine kurze Geschichte ueber eine Reise nach Berlin"
    }
    paragraphs = @(
        @{
            de = "Ich fahre nach Berlin."
            fa = "I am going to Berlin."
            en = "I am going to Berlin."
        }
        @{
            de = "Berlin ist eine schoene Stadt."
            fa = "Berlin is a beautiful city."
            en = "Berlin is a beautiful city."
        }
        @{
            de = "Ich besuche das Brandenburger Tor."
            fa = "I visit the Brandenburg Gate."
            en = "I visit the Brandenburg Gate."
        }
    )
    icon = "✈️"
    xpReward = 30
    estimatedMinutes = 5
    isActive = $true
}

# Story 2
$story2 = @{
    id = "story-3"
    level = "A1"
    title = @{
        fa = "First Day of School"
        en = "First Day of School"
        de = "Erster Schultag"
    }
    description = @{
        fa = "Story about the first day of school in Germany"
        en = "Story about the first day of school in Germany"
        de = "Geschichte ueber den ersten Schultag in Deutschland"
    }
    paragraphs = @(
        @{
            de = "Heute ist mein erster Schultag."
            fa = "Today is my first day of school."
            en = "Today is my first day of school."
        }
        @{
            de = "Ich gehe in die Klasse."
            fa = "I enter the classroom."
            en = "I enter the classroom."
        }
        @{
            de = "Die Lehrerin heisst Frau Mueller."
            fa = "The teacher's name is Mrs. Mueller."
            en = "The teacher's name is Mrs. Mueller."
        }
    )
    icon = "🏫"
    xpReward = 30
    estimatedMinutes = 5
    isActive = $true
}

$stories = @($story1, $story2)
$count = 0

foreach ($story in $stories) {
    try {
        $body = $story | ConvertTo-Json -Depth 5
        $response = Invoke-RestMethod -Method Post -Uri "http://localhost:5001/api/stories" -Headers $headers -ContentType "application/json" -Body $body -ErrorAction Stop
        if ($response.success) {
            Write-Host "  Added: $($story.title.en)" -ForegroundColor Green
            $count++
        }
    } catch {
        Write-Host "  Error: $($story.title.en) - $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`nAdded $count stories!" -ForegroundColor Green