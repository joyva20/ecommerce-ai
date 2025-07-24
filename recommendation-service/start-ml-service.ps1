Write-Host "Starting Full ML Recommendation Service..." -ForegroundColor Green
Write-Host ""
Write-Host "🤖 Full ML-powered recommendations with TF-IDF + Cosine Similarity" -ForegroundColor Cyan
Write-Host "📊 Reads data from CSV file and builds ML model" -ForegroundColor Cyan
Write-Host "⚠️ Will fallback to basic implementations if ML libraries unavailable" -ForegroundColor Yellow
Write-Host ""

# Navigate to the recommendation service directory
Set-Location $PSScriptRoot

# Check if Python is available
try {
    $pythonVersion = python --version 2>&1
    Write-Host "Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: Python is not installed or not in PATH" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Install dependencies with compatible versions
Write-Host "Installing ML dependencies with compatible versions..." -ForegroundColor Cyan
Write-Host "📦 Installing: Flask, Pandas 1.5.3, NumPy 1.24.3, Scikit-learn 1.3.0" -ForegroundColor Yellow

# Install with specific versions to avoid compatibility issues
pip install flask==2.3.3 flask-cors==4.0.0
pip install pandas==1.5.3
pip install numpy==1.24.3  
pip install scikit-learn==1.3.0

# Check if CSV file exists
if (Test-Path "clothing.csv") {
    Write-Host "✅ Found clothing.csv - will use real data" -ForegroundColor Green
} elseif (Test-Path "../clothing.csv") {
    Write-Host "✅ Found ../clothing.csv - will use real data" -ForegroundColor Green
} else {
    Write-Host "⚠️ CSV file not found - will create sample data" -ForegroundColor Yellow
}

# Start the service
Write-Host ""
Write-Host "Starting ML-powered Flask service on port 5001..." -ForegroundColor Green
Write-Host "Access the service at: http://localhost:5001" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the service" -ForegroundColor Yellow
Write-Host ""

python app.py
