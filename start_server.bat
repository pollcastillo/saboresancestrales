@echo off
setlocal enabledelayedexpansion

REM Script para iniciar el servidor local de Sabores Ancestrales (Windows)
REM Autor: Sabores Ancestrales Team
REM Versión: 1.0

title Sabores Ancestrales - Servidor Local

REM Función para mostrar el banner
call :show_banner

REM Verificar argumentos
if "%1"=="" (
    call :auto_detect_server
) else if "%1"=="help" (
    call :show_help
    goto :eof
) else if "%1"=="python" (
    call :start_python_server
) else if "%1"=="node" (
    call :start_node_server
) else if "%1"=="php" (
    call :start_php_server
) else if "%1"=="auto" (
    call :auto_detect_server
) else (
    echo ❌ Opción no válida: %1
    echo.
    call :show_help
    goto :eof
)

goto :eof

:show_banner
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                    SABORES ANCESTRALES                      ║
echo ║                     Servidor Local                          ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
goto :eof

:show_help
echo Uso: start_server.bat [OPCIÓN]
echo.
echo Opciones disponibles:
echo   python     - Iniciar servidor con Python (puerto 8000)
echo   node       - Iniciar servidor con Node.js (puerto 8080)
echo   php        - Iniciar servidor con PHP (puerto 8000)
echo   auto       - Detectar automáticamente el mejor servidor disponible
echo   help       - Mostrar esta ayuda
echo.
echo Ejemplos:
echo   start_server.bat python
echo   start_server.bat auto
echo.
goto :eof

:check_required_files
echo 🔍 Verificando archivos necesarios...
set "missing_files="

REM Verificar archivos críticos
if not exist "index.html" (
    set "missing_files=!missing_files! index.html"
)

REM Verificar archivos de datos
if not exist "src\data\services.json" (
    set "missing_files=!missing_files! src\data\services.json"
)

if not exist "src\data\cooking-tips.json" (
    set "missing_files=!missing_files! src\data\cooking-tips.json"
)

if not exist "src\data\gallery.json" (
    set "missing_files=!missing_files! src\data\gallery.json"
)

if not exist "src\data\users.json" (
    set "missing_files=!missing_files! src\data\users.json"
)

REM Verificar archivos JavaScript principales
if not exist "src\js\database\DatabaseManager.js" (
    set "missing_files=!missing_files! src\js\database\DatabaseManager.js"
)

if not exist "src\js\admin.js" (
    set "missing_files=!missing_files! src\js\admin.js"
)

if "!missing_files!"=="" (
    echo ✅ Todos los archivos necesarios están presentes
    goto :eof
) else (
    echo ❌ Archivos faltantes:!missing_files!
    echo.
    echo 💡 Asegúrate de que todos los archivos estén en su lugar antes de continuar
    pause
    exit /b 1
)

:start_python_server
echo 🐍 Iniciando servidor con Python...
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Python encontrado
    echo 🌐 Servidor iniciado en: http://localhost:8000
    echo 📁 Directorio raíz: %CD%
    echo.
    echo Presiona Ctrl+C para detener el servidor
    echo.
    python -m http.server 8000
    goto :eof
)

python3 --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Python 3 encontrado
    echo 🌐 Servidor iniciado en: http://localhost:8000
    echo 📁 Directorio raíz: %CD%
    echo.
    echo Presiona Ctrl+C para detener el servidor
    echo.
    python3 -m http.server 8000
    goto :eof
)

echo ❌ Python no está instalado
echo.
echo 💡 Descarga Python desde: https://www.python.org/downloads/
pause
goto :eof

:start_node_server
echo 🟢 Iniciando servidor con Node.js...
npx --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Node.js encontrado
    echo 🌐 Servidor iniciado en: http://localhost:8080
    echo 📁 Directorio raíz: %CD%
    echo.
    echo Presiona Ctrl+C para detener el servidor
    echo.
    npx http-server -p 8080 -o
    goto :eof
)

echo ❌ Node.js no está instalado
echo.
echo 💡 Descarga Node.js desde: https://nodejs.org/
pause
goto :eof

:start_php_server
echo 🐘 Iniciando servidor con PHP...
php --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ PHP encontrado
    echo 🌐 Servidor iniciado en: http://localhost:8000
    echo 📁 Directorio raíz: %CD%
    echo.
    echo Presiona Ctrl+C para detener el servidor
    echo.
    php -S localhost:8000
    goto :eof
)

echo ❌ PHP no está instalado
echo.
echo 💡 Descarga PHP desde: https://www.php.net/downloads
pause
goto :eof

:auto_detect_server
echo 🔍 Detectando el mejor servidor disponible...

REM Verificar archivos necesarios primero
call :check_required_files
if %errorlevel% neq 0 goto :eof

REM Prioridad: Python > Node.js > PHP
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Python detectado - usando Python
    call :start_python_server
    goto :eof
)

python3 --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Python 3 detectado - usando Python
    call :start_python_server
    goto :eof
)

npx --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Node.js detectado - usando Node.js
    call :start_node_server
    goto :eof
)

php --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ PHP detectado - usando PHP
    call :start_php_server
    goto :eof
)

echo ❌ No se encontró ningún servidor disponible
echo.
echo 💡 Opciones para instalar un servidor:
echo   - Python: https://www.python.org/downloads/
echo   - Node.js: https://nodejs.org/
echo   - PHP: https://www.php.net/downloads
echo.
echo 💡 O puedes abrir index.html directamente en tu navegador
pause
goto :eof 