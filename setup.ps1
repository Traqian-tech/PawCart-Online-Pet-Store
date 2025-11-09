# MeowMeowPetShop Setup Script for Windows
Write-Host "🐱 MeowMeowPetShop - Local Deployment Setup" -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (Test-Path ".env") {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
    $overwrite = Read-Host "Do you want to overwrite it? (y/n)"
    if ($overwrite -ne "y") {
        Write-Host "Skipping .env creation" -ForegroundColor Yellow
        exit 0
    }
}

Write-Host ""
Write-Host "MongoDB Setup Options:" -ForegroundColor Yellow
Write-Host "1. Use MongoDB Atlas (Cloud - Recommended)" -ForegroundColor White
Write-Host "2. Use Local MongoDB (Requires MongoDB installation)" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Select option (1 or 2)"

$mongoUri = ""

if ($choice -eq "1") {
    Write-Host ""
    Write-Host "📝 MongoDB Atlas Setup Instructions:" -ForegroundColor Cyan
    Write-Host "1. Go to https://www.mongodb.com/cloud/atlas/register" -ForegroundColor White
    Write-Host "2. Create a free account and cluster" -ForegroundColor White
    Write-Host "3. Set up database user and network access" -ForegroundColor White
    Write-Host "4. Get your connection string" -ForegroundColor White
    Write-Host ""
    Write-Host "Example: mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/petshop" -ForegroundColor Gray
    Write-Host ""
    $mongoUri = Read-Host "Enter your MongoDB Atlas connection string"
} else {
    Write-Host ""
    Write-Host "Using local MongoDB connection" -ForegroundColor Yellow
    $mongoUri = "mongodb://localhost:27017/petshop"
    
    # Check if MongoDB is installed
    $mongoInstalled = Get-Command mongod -ErrorAction SilentlyContinue
    if (-not $mongoInstalled) {
        Write-Host "⚠️  Warning: MongoDB doesn't appear to be installed" -ForegroundColor Red
        Write-Host "Download from: https://www.mongodb.com/try/download/community" -ForegroundColor Yellow
        Write-Host ""
        $continue = Read-Host "Continue anyway? (y/n)"
        if ($continue -ne "y") {
            exit 1
        }
    }
}

# Create .env file
$envContent = @"
# MongoDB Configuration
MONGODB_URI=$mongoUri

# Supabase Configuration (provided for testing)
VITE_SUPABASE_URL=https://ghqivevrwfkmdmduyjzv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdocWl2ZXZyd2ZrbWRtZHV5anp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NjAwODUsImV4cCI6MjA2OTAzNjA4NX0.FfQ8WT_ZKzAD5-mnAwrzX_F0JtHDjVdCxhB1y2M3aaY

# Server Configuration
PORT=5000
NODE_ENV=development
"@

$envContent | Out-File -FilePath ".env" -Encoding utf8 -NoNewline
Write-Host ""
Write-Host "✅ .env file created successfully!" -ForegroundColor Green
Write-Host ""

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ Dependencies already installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Make sure MongoDB is running (if using local)" -ForegroundColor White
Write-Host "2. Run: npm run dev" -ForegroundColor White
Write-Host "3. Open: http://localhost:5000" -ForegroundColor White
Write-Host ""
Write-Host "Default Admin Account:" -ForegroundColor Cyan
Write-Host "Email: admin@petshop.com" -ForegroundColor White
Write-Host "Password: admin123" -ForegroundColor White
Write-Host ""

$startNow = Read-Host "Start the development server now? (y/n)"
if ($startNow -eq "y") {
    Write-Host ""
    Write-Host "🚀 Starting development server..." -ForegroundColor Cyan
    npm run dev
}

