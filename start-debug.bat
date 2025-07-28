@echo off
echo Starting FullStack E-commerce Backend and Admin Panel...

echo Starting Backend Server...
cd backend
start "Backend" cmd /k "npm start"

timeout /t 3

echo Starting Admin Panel...
cd ../admin
start "Admin Panel" cmd /k "npm run dev"

echo Both services are starting...
echo Backend: http://localhost:4000
echo Admin Panel: http://localhost:5174
pause
