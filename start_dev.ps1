# Face AI SaaS 一键启动脚本
# 双击运行或在 PowerShell 中执行: .\start_dev.ps1

# 设置控制台编码为 UTF-8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001 | Out-Null

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "       Face AI SaaS Development Starting...     " -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# 启动后端
Write-Host "[1/2] Starting Backend (FastAPI @ Port 8000)..." -ForegroundColor Green
Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; Write-Host 'Backend starting...' -ForegroundColor Yellow; python -m uvicorn app.main:app --reload --port 8000"

Start-Sleep -Seconds 2

# 启动前端
Write-Host "[2/2] Starting Frontend (Vite @ Port 5173)..." -ForegroundColor Green
Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; Write-Host 'Frontend starting...' -ForegroundColor Yellow; npm run dev"

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Services starting in new windows..." -ForegroundColor Yellow
Write-Host ""
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "  Backend:  http://localhost:8000/docs" -ForegroundColor White
Write-Host ""
Write-Host "  Login: admin / admin123" -ForegroundColor Magenta
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# 5秒后自动打开浏览器
Write-Host "Opening browser in 5 seconds..." -ForegroundColor Gray
Start-Sleep -Seconds 5
Start-Process "http://localhost:5173"
