# add-scenarios.ps1
# Add scenarios to database

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Adding Scenarios to Database" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Login
$loginResponse = Invoke-RestMethod -Method Post -Uri "http://localhost:5001/api/auth/login" -ContentType "application/json" -Body '{"email":"admin@german-academy.com","password":"admin123456"}'
$token = $loginResponse.data.accessToken
$headers = @{ "Authorization" = "Bearer $token" }
Write-Host "Logged in successfully`n" -ForegroundColor Green

$scenario1 = @{
    id = "scenario-1"
    level = "A1"
    title = @{
        fa = "Ordering Coffee at a Cafe"
        en = "Ordering Coffee at a Cafe"
        de = "Kaffee bestellen im Cafe"
    }
    description = @{
        fa = "Learning how to order coffee in German"
        en = "Learning how to order coffee in German"
        de = "Lernen, wie man Kaffee auf Deutsch bestellt"
    }
    icon = "☕"
    startMessage = @{
        fa = "Welcome to a cafe in Berlin! How can I help you?"
        en = "Welcome to a cafe in Berlin! How can I help you?"
        de = "Willkommen in einem Cafe in Berlin! Wie kann ich Ihnen helfen?"
    }
    steps = @(
        @{
            id = "step-1"
            prompt = @{
                fa = "What do you say to the waiter?"
                en = "What do you say to the waiter?"
                de = "Was sagen Sie zum Kellner?"
            }
            options = @(
                @{ id = "opt-1"; text = "Hallo!"; correct = $true }
                @{ id = "opt-2"; text = "Tschuess!"; correct = $false }
                @{ id = "opt-3"; text = "Auf Wiedersehen!"; correct = $false }
            )
            feedback = @{
                fa = "Great! Hallo is appropriate for greeting at a cafe."
                en = "Great! Hallo is appropriate for greeting at a cafe."
                de = "Super! Hallo ist passend fuer die Begruessung im Cafe."
            }
        }
        @{
            id = "step-2"
            prompt = @{
                fa = "How do you order a coffee?"
                en = "How do you order a coffee?"
                de = "Wie bestellen Sie einen Kaffee?"
            }
            options = @(
                @{ id = "opt-1"; text = "Ich moechte einen Kaffee."; correct = $true }
                @{ id = "opt-2"; text = "Ich habe einen Kaffee."; correct = $false }
                @{ id = "opt-3"; text = "Ich bin ein Kaffee."; correct = $false }
            )
            feedback = @{
                fa = "Correct! Ich moechte einen Kaffee."
                en = "Correct! Ich moechte einen Kaffee."
                de = "Richtig! Ich moechte einen Kaffee."
            }
        }
    )
    xpReward = 50
    estimatedMinutes = 15
    isActive = $true
}

$scenarios = @($scenario1)
$count = 0

foreach ($scenario in $scenarios) {
    try {
        $body = $scenario | ConvertTo-Json -Depth 5
        $response = Invoke-RestMethod -Method Post -Uri "http://localhost:5001/api/scenarios" -Headers $headers -ContentType "application/json" -Body $body -ErrorAction Stop
        if ($response.success) {
            Write-Host "  Added: $($scenario.title.en)" -ForegroundColor Green
            $count++
        }
    } catch {
        Write-Host "  Error: $($scenario.title.en) - $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`nAdded $count scenarios!" -ForegroundColor Green