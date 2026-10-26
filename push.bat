@echo off
echo ========================================================
echo   MUSO File Transfer - Push to GitHub
echo ========================================================
echo Pushing commit to https://github.com/muzeemreniman113-arch/MUSO.git ...

git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [SUCCESS] Code deployed to GitHub successfully!
    echo Visit repository: https://github.com/muzeemreniman113-arch/MUSO
) else (
    echo.
    echo [INFO] If git is not in PATH, attempting with runtime git...
    "%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\git\cmd\git.exe" push -u origin main
)

echo.
pause
