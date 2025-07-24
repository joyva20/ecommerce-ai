@echo off
echo Starting Full-Stack E-commerce with AI Recommendations...
echo.

echo Starting MongoDB (make sure MongoDB is running)...
echo.

echo Starting Python Recommendation Service...
start "Recommendation Service" cmd /k "cd recommendation-service && python app.py"

timeout /t 3 /nobreak >nul

echo Starting Node.js Backend...
start "Backend" cmd /k "cd backend && npm start"

timeout /t 3 /nobreak >nul

echo Starting React Frontend...
start "Frontend" cmd /k "cd frontend && npm run dev"

timeout /t 3 /nobreak >nul

echo Starting Admin Panel...
start "Admin" cmd /k "cd admin && npm run dev"

echo.
echo All services are starting...
echo.
echo Frontend: http://localhost:5173
echo Admin: http://localhost:5174
echo Backend: http://localhost:4000
echo Recommendations: http://localhost:5001
echo.
echo Press any key to exit...
pause >nul
