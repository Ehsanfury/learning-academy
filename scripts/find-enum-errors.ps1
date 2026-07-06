# ============================================
# find-enum-errors.ps1
# Description: Find ENUM errors in Sequelize models
# ============================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🔍 Finding ENUM errors in Sequelize models" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan

$modelsPath = "H:\german-academy\backend\models"

# پیدا کردن تمام فایل‌های مدل
$modelFiles = Get-ChildItem -Path $modelsPath -Filter "*.js" -Recurse

Write-Host ""
Write-Host "📁 Checking $($modelFiles.Count) model files..." -ForegroundColor Cyan
Write-Host ""

$errorCount = 0

foreach ($file in $modelFiles) {
    $content = Get-Content -Path $file.FullName -Raw
    
    # بررسی ENUM بدون values
    if ($content -match 'type: DataTypes\.ENUM\s*,\s*[^v]') {
        Write-Host "❌ ERROR in: $($file.Name)" -ForegroundColor Red
        Write-Host "   Problem: DataTypes.ENUM without 'values' array" -ForegroundColor Red
        Write-Host "   Location: $($file.FullName)" -ForegroundColor Yellow
        Write-Host ""
        $errorCount++
    }
    
    # بررسی ENUM با values خالی
    if ($content -match 'type: DataTypes\.ENUM,\s*values:\s*\[\s*\]') {
        Write-Host "❌ ERROR in: $($file.Name)" -ForegroundColor Red
        Write-Host "   Problem: DataTypes.ENUM with empty values array" -ForegroundColor Red
        Write-Host "   Location: $($file.FullName)" -ForegroundColor Yellow
        Write-Host ""
        $errorCount++
    }
}

Write-Host "========================================" -ForegroundColor Cyan
if ($errorCount -eq 0) {
    Write-Host "✅ No ENUM errors found!" -ForegroundColor Green
} else {
    Write-Host "⚠️ Found $errorCount files with ENUM errors" -ForegroundColor Yellow
}
Write-Host "========================================" -ForegroundColor Cyan

# ============================================
# اسکریپت پیدا کردن کامنت‌های بدون //
# ============================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🔍 Finding comments without // or /* */" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan

$commentErrors = 0

foreach ($file in $modelFiles) {
    $lines = Get-Content -Path $file.FullName
    $lineNumber = 0
    
    foreach ($line in $lines) {
        $lineNumber++
        
        # بررسی خطوطی که کامنت بدون // دارند
        $hasComment = $line -match '//'
        $hasBlockComment = $line -match '/\*'
        $isString = $line -match '^["'']' -or $line -match '["''];$'
        
        # اگر خط حاوی کلماتی مثل "earned", "better", "version" باشد که قبلاً خطا داده بودند
        if ($line -match '\b(earned|better|version|metadata|statistics|system|educational)\b' -and 
            -not $hasComment -and 
            -not $hasBlockComment -and
            -not $isString -and
            $line -notmatch '^[A-Z]' -and
            $line -notmatch '^[a-z]' -and
            $line -notmatch '^/') {
            
            Write-Host "⚠️ Possible comment without // in: $($file.Name) line $lineNumber" -ForegroundColor Yellow
            Write-Host "   Line: $line" -ForegroundColor Gray
            $commentErrors++
        }
    }
}

Write-Host ""
if ($commentErrors -eq 0) {
    Write-Host "✅ No comment errors found!" -ForegroundColor Green
} else {
    Write-Host "⚠️ Found $commentErrors potential comment errors" -ForegroundColor Yellow
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ Scan complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan