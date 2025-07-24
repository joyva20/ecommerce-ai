@echo off
echo Starting Simple Recommendation Service...
echo.
echo Note: This is a simplified version without ML dependencies
echo For production, use the full ML model after resolving Python dependencies
echo.

REM Navigate to the recommendation service directory
cd /d "%~dp0"

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed or not in PATH
    pause
    exit /b 1
)

REM Install basic dependencies if needed
echo Installing basic Flask dependencies...
pip install flask flask-cors

REM Start the service
echo.
echo Starting Flask service on port 5001...
python app.py

pause
