@echo off
echo Iniciando todos los servicios del IFN...
echo.

REM 1. Backend Principal
echo [1/4] Iniciando Backend Principal...
start "Backend Principal" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak > nul

REM 2. Microservicio de Analisis
echo [2/4] Iniciando Microservicio de Analisis...
start "Microservicio Analisis" cmd /k "cd microservicio-analisis && venv\Scripts\activate && python app.py"
timeout /t 3 /nobreak > nul

REM 3. Microservicio de Zonas
echo [3/4] Iniciando Microservicio de Zonas...
start "Microservicio Zonas" cmd /k "cd microservicio-oracle && npm start"
timeout /t 3 /nobreak > nul

REM 4. Frontend
echo [4/4] Iniciando Frontend...
start "Frontend React" cmd /k "cd frontend && npm start"

echo.
echo Todos los servicios iniciados correctamente
echo.
echo URLs de acceso:
echo   Frontend:               http://localhost:3000
echo   Backend Principal:      http://localhost:5000
echo   Microservicio Analisis: http://localhost:5001
echo   Microservicio Zonas:    http://localhost:5002
echo.
echo Usuarios de prueba:
echo   Admin:      admin@ifn.com / admin123
echo   Brigadista: demo@ifn.com / demo321
echo.
pause