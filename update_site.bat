@echo off
echo Starting site update...

REM 1. Pull latest changes
echo Pulling latest changes...
git pull
if %errorlevel% neq 0 (
    echo Error: Failed to pull latest changes. Please resolve conflicts manually.
    pause
    exit /b %errorlevel%
)

REM 2. Build the blog
echo Building the blog...
cd blog
call npm run build
if %errorlevel% neq 0 (
    echo Error: Build failed.
    pause
    exit /b %errorlevel%
)
cd ..

REM 3. Add changes
echo Staging changes...
git add .

REM 4. Commit
echo Committing changes...
git commit -m "Update site content via script"

REM 5. Push
echo Pushing to GitHub...
git push
if %errorlevel% neq 0 (
    echo Error: Push failed.
    pause
    exit /b %errorlevel%
)

echo Done! Site updated.
pause
