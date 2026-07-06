# ============================================
# project-structure.ps1
# Description: نمایش ساختار کامل پروژه
# ============================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "📊 German Academy - Project Structure" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ============================================
# 1. ساختار Backend
# ============================================
Write-Host "📁 BACKEND STRUCTURE:" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

$backendPath = "H:\german-academy\backend"

# پوشه‌های اصلی backend
$backendDirs = @(
    "config",
    "controllers",
    "middlewares",
    "models",
    "repositories",
    "services",
    "routes",
    "validators",
    "utils",
    "errors",
    "scripts",
    "seeders",
    "tests"
)

foreach ($dir in $backendDirs) {
    $fullPath = Join-Path $backendPath $dir
    if (Test-Path $fullPath) {
        $files = Get-ChildItem -Path $fullPath -Filter "*.js" | Measure-Object
        Write-Host "   📂 $dir/ - $($files.Count) JS files" -ForegroundColor White
    } else {
        Write-Host "   ❌ $dir/ - NOT FOUND" -ForegroundColor Red
    }
}

Write-Host ""

# ============================================
# 2. ساختار Frontend
# ============================================
Write-Host "📁 FRONTEND STRUCTURE:" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

$frontendPath = "H:\german-academy\src"

$frontendDirs = @(
    "pages",
    "components",
    "context",
    "hooks",
    "services",
    "layouts",
    "utils",
    "styles",
    "features",
    "router"
)

foreach ($dir in $frontendDirs) {
    $fullPath = Join-Path $frontendPath $dir
    if (Test-Path $fullPath) {
        $files = Get-ChildItem -Path $fullPath -Recurse -Include "*.js","*.jsx","*.css" | Measure-Object
        Write-Host "   📂 $dir/ - $($files.Count) files" -ForegroundColor White
    } else {
        Write-Host "   ❌ $dir/ - NOT FOUND" -ForegroundColor Red
    }
}

Write-Host ""

# ============================================
# 3. صفحات اصلی (Pages)
# ============================================
Write-Host "📄 PAGES:" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

$pagesPath = Join-Path $frontendPath "pages"
if (Test-Path $pagesPath) {
    $pages = Get-ChildItem -Path $pagesPath -Directory
    foreach ($page in $pages) {
        $jsxFiles = Get-ChildItem -Path $page.FullName -Filter "*.jsx" | Measure-Object
        if ($jsxFiles.Count -gt 0) {
            Write-Host "   ✅ $($page.Name)/ - $($jsxFiles.Count) JSX files" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️ $($page.Name)/ - No JSX files" -ForegroundColor Yellow
        }
    }
}

Write-Host ""

# ============================================
# 4. کامپوننت‌های اصلی (Components)
# ============================================
Write-Host "🧩 COMPONENTS:" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

$componentsPath = Join-Path $frontendPath "components"
if (Test-Path $componentsPath) {
    $components = Get-ChildItem -Path $componentsPath -Filter "*.jsx"
    foreach ($comp in $components) {
        Write-Host "   ✅ $($comp.Name)" -ForegroundColor Green
    }
    
    # کامپوننت‌های ui
    $uiPath = Join-Path $componentsPath "ui"
    if (Test-Path $uiPath) {
        $uiComponents = Get-ChildItem -Path $uiPath -Filter "*.jsx"
        Write-Host ""
        Write-Host "   📂 ui/:" -ForegroundColor Cyan
        foreach ($comp in $uiComponents) {
            Write-Host "      ✅ $($comp.Name)" -ForegroundColor Green
        }
    }
}

Write-Host ""

# ============================================
# 5. فایل‌های اصلی
# ============================================
Write-Host "📄 MAIN FILES:" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

$mainFiles = @(
    "H:\german-academy\package.json",
    "H:\german-academy\vite.config.js",
    "H:\german-academy\src\App.jsx",
    "H:\german-academy\src\main.jsx",
    "H:\german-academy\src\styles\globals.css",
    "H:\german-academy\index.html",
    "H:\german-academy\tailwind.config.js"
)

foreach ($file in $mainFiles) {
    if (Test-Path $file) {
        Write-Host "   ✅ $($file.Split('\')[-1])" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $($file.Split('\')[-1]) - NOT FOUND" -ForegroundColor Red
    }
}

Write-Host ""

# ============================================
# 6. فایل‌های محیطی
# ============================================
Write-Host "🔧 ENV FILES:" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

$envFiles = @(
    "H:\german-academy\backend\.env",
    "H:\german-academy\.env",
    "H:\german-academy\backend\.env.example"
)

foreach ($file in $envFiles) {
    if (Test-Path $file) {
        Write-Host "   ✅ $($file.Split('\')[-1])" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $($file.Split('\')[-1]) - NOT FOUND" -ForegroundColor Red
    }
}

Write-Host ""

# ============================================
# 7. خلاصه آمار
# ============================================
Write-Host "📊 SUMMARY STATISTICS:" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan

$totalBackendFiles = (Get-ChildItem -Path $backendPath -Recurse -Include "*.js" | Measure-Object).Count
$totalFrontendFiles = (Get-ChildItem -Path $frontendPath -Recurse -Include "*.js","*.jsx","*.css" | Measure-Object).Count

Write-Host "   🔹 Backend JS files: $totalBackendFiles" -ForegroundColor White
Write-Host "   🔹 Frontend files: $totalFrontendFiles" -ForegroundColor White
Write-Host "   🔹 Total: $(($totalBackendFiles + $totalFrontendFiles)) files" -ForegroundColor White

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ Scan complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
