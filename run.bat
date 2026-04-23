@echo off
echo Running Prisma Generate...
call npx prisma generate
if %errorlevel% neq 0 (
    echo Prisma Generate failed. Please check if any other processes are using the Prisma files.
    pause
    exit /b %errorlevel%
)
echo.
echo Starting Development Server...
npm run dev
