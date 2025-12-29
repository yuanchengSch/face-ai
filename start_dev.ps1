# Face AI SaaS Start Script
# Encoding: UTF-8

Write-Host "Starting Face AI SaaS (Dev Mode)..." -ForegroundColor Cyan
Write-Host "Starting Backend (Port 8000)..." -ForegroundColor Green

# Start backend in new window
Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "& {cd backend; pip install -r requirements.txt; uvicorn app.main:app --reload --host 0.0.0.0}"

Write-Host "Starting Frontend (Port 5173)..." -ForegroundColor Green

# Start frontend in new window
Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "& {cd frontend; npm install; npm run dev}"

Write-Host "------------------------------------------------" -ForegroundColor Cyan
Write-Host "System is starting, please check the two new PowerShell windows" -ForegroundColor Yellow
Write-Host "Backend API: http://localhost:8000/docs"
Write-Host "Frontend:    http://localhost:5173"
Write-Host "------------------------------------------------" -ForegroundColor Cyan
