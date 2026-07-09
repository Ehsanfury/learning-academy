# setup.ps1
$packages = @(
  "@google/generative-ai",
  "bcryptjs",
  "jsonwebtoken",
  "sequelize",
  "pg",
  "express",
  "cors",
  "helmet",
  "morgan",
  "compression",
  "cookie-parser",
  "socket.io",
  "winston",
  "dotenv",
  "axios",
  "express-rate-limit"
)

foreach ($pkg in $packages) {
  $url = "https://registry.npmmirror.com/$pkg"
  Write-Host "Downloading $pkg..." -ForegroundColor Yellow
  # دانلود با Invoke-WebRequest
}