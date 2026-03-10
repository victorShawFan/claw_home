@echo off
:: 🦞 Claw Home 启动脚本 (Windows)

echo 🦞 启动 Claw Home 小龙虾之家...

:: 检查端口是否被占用
set PORT=8080
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%PORT%') do (
    echo 端口 %PORT% 被占用 (PID: %%a)，正在释放...
    taskkill /F /PID %%a >nul 2>&1
    timeout /t 1 >nul
)

:: 启动服务器
echo 启动 HTTP 服务器...
start /B python -m http.server %PORT% > %TEMP%\claw_home.log 2>&1

timeout /t 2 >nul

:: 验证服务是否启动
curl -s http://localhost:%PORT% >nul
if %errorlevel% == 0 (
    echo ✅ 服务启动成功！
    echo.
    echo 🌐 访问地址:
    echo    本地: http://localhost:%PORT%
    echo.
    start http://localhost:%PORT%
    echo 日志文件: %TEMP%\claw_home.log
) else (
    echo ❌ 服务启动失败
    type %TEMP%\claw_home.log
)

pause
