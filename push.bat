@echo off
setlocal
title MUSO File Transfer - GitHub Deployment

echo =====================================================================
echo           MUSO File Transfer - Industrial Deployment Tool
echo =====================================================================
echo.
echo [1/3] Checking Git environment...

:: Ensure git is in PATH
where git >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    if exist "%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\git\cmd\git.exe" (
        set "PATH=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\git\cmd;%PATH%"
        echo [OK] Using bundled Git runtime.
    ) else (
        echo [ERROR] Git was not found on your system. Please install Git for Windows.
        goto :END
    )
) else (
    echo [OK] Git is available in PATH.
)

echo.
echo [2/3] Staging and committing files...
cd /d "%~dp0"
git add .
git commit -m "Add neat 1-page System Architecture diagram and specification"
git status --short

echo.
echo [3/3] Pushing to https://github.com/muzeemreniman113-arch/MUSO.git ...
echo (If prompted, your browser will open to authorize GitHub)
echo.

git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo =====================================================================
    echo [SUCCESS] All files deployed to GitHub successfully!
    echo Repository URL: https://github.com/muzeemreniman113-arch/MUSO
    echo =====================================================================
    echo.
    echo Next Step: To enable GitHub Pages:
    echo  1. Go to https://github.com/muzeemreniman113-arch/MUSO/settings/pages
    echo  2. Under 'Branch', select 'main' and '/ (root)', then click Save.
    echo.
) else (
    echo.
    echo =====================================================================
    echo [ATTENTION] Git push did not complete.
    echo If a browser window opened, please click "Authorize" or sign in.
    echo =====================================================================
)

:END
echo.
echo Press any key to exit...
pause >nul
