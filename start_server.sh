#!/bin/bash

# Script para iniciar el servidor local de Sabores Ancestrales
# Autor: Sabores Ancestrales Team
# Versión: 1.0

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar el banner
show_banner() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                    SABORES ANCESTRALES                      ║"
    echo "║                     Servidor Local                          ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Función para mostrar ayuda
show_help() {
    echo -e "${YELLOW}Uso: ./start_server.sh [OPCIÓN]${NC}"
    echo ""
    echo "Opciones disponibles:"
    echo "  python     - Iniciar servidor con Python (puerto 8000)"
    echo "  node       - Iniciar servidor con Node.js (puerto 8080)"
    echo "  php        - Iniciar servidor con PHP (puerto 8000)"
    echo "  auto       - Detectar automáticamente el mejor servidor disponible"
    echo "  help       - Mostrar esta ayuda"
    echo ""
    echo "Ejemplos:"
    echo "  ./start_server.sh python"
    echo "  ./start_server.sh auto"
    echo ""
}

# Función para verificar si un comando está disponible
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Función para verificar archivos necesarios
check_required_files() {
    echo -e "${BLUE}🔍 Verificando archivos necesarios...${NC}"
    
    local missing_files=()
    
    # Verificar archivos principales
    if [ ! -f "index.html" ]; then
        missing_files+=("index.html")
    fi
    
    if [ ! -f "src/js/main.js" ]; then
        missing_files+=("src/js/main.js")
    fi
    
    # Verificar archivos de datos
    if [ ! -f "src/data/services.json" ]; then
        missing_files+=("src/data/services.json")
    fi
    
    if [ ! -f "src/data/cooking-tips.json" ]; then
        missing_files+=("src/data/cooking-tips.json")
    fi
    
    if [ ! -f "src/data/gallery.json" ]; then
        missing_files+=("src/data/gallery.json")
    fi
    
    if [ ! -f "src/data/users.json" ]; then
        missing_files+=("src/data/users.json")
    fi
    
    # Verificar archivos JavaScript principales
    if [ ! -f "src/js/database/DatabaseManager.js" ]; then
        missing_files+=("src/js/database/DatabaseManager.js")
    fi
    
    if [ ! -f "src/js/admin.js" ]; then
        missing_files+=("src/js/admin.js")
    fi
    
    if [ ${#missing_files[@]} -eq 0 ]; then
        echo -e "${GREEN}✅ Todos los archivos necesarios están presentes${NC}"
        return 0
    else
        echo -e "${RED}❌ Archivos faltantes:${NC}"
        for file in "${missing_files[@]}"; do
            echo -e "${RED}   - $file${NC}"
        done
        echo ""
        echo -e "${YELLOW}💡 Asegúrate de que todos los archivos estén en su lugar antes de continuar${NC}"
        return 1
    fi
}

# Función para iniciar servidor con Python
start_python_server() {
    echo -e "${BLUE}🐍 Iniciando servidor con Python...${NC}"
    
    if command_exists python3; then
        echo -e "${GREEN}✅ Python 3 encontrado${NC}"
        echo -e "${YELLOW}🌐 Servidor iniciado en: http://localhost:8000${NC}"
        echo -e "${YELLOW}📁 Directorio raíz: $(pwd)${NC}"
        echo ""
        echo -e "${BLUE}Presiona Ctrl+C para detener el servidor${NC}"
        echo ""
        python3 -m http.server 8000
    elif command_exists python; then
        echo -e "${GREEN}✅ Python encontrado${NC}"
        echo -e "${YELLOW}🌐 Servidor iniciado en: http://localhost:8000${NC}"
        echo -e "${YELLOW}📁 Directorio raíz: $(pwd)${NC}"
        echo ""
        echo -e "${BLUE}Presiona Ctrl+C para detener el servidor${NC}"
        echo ""
        python -m http.server 8000
    else
        echo -e "${RED}❌ Python no está instalado${NC}"
        return 1
    fi
}

# Función para iniciar servidor con Node.js
start_node_server() {
    echo -e "${BLUE}🟢 Iniciando servidor con Node.js...${NC}"
    
    if command_exists npx; then
        echo -e "${GREEN}✅ Node.js encontrado${NC}"
        echo -e "${YELLOW}🌐 Servidor iniciado en: http://localhost:8080${NC}"
        echo -e "${YELLOW}📁 Directorio raíz: $(pwd)${NC}"
        echo ""
        echo -e "${BLUE}Presiona Ctrl+C para detener el servidor${NC}"
        echo ""
        npx http-server -p 8080 -o
    else
        echo -e "${RED}❌ Node.js no está instalado${NC}"
        return 1
    fi
}

# Función para iniciar servidor con PHP
start_php_server() {
    echo -e "${BLUE}🐘 Iniciando servidor con PHP...${NC}"
    
    if command_exists php; then
        echo -e "${GREEN}✅ PHP encontrado${NC}"
        echo -e "${YELLOW}🌐 Servidor iniciado en: http://localhost:8000${NC}"
        echo -e "${YELLOW}📁 Directorio raíz: $(pwd)${NC}"
        echo ""
        echo -e "${BLUE}Presiona Ctrl+C para detener el servidor${NC}"
        echo ""
        php -S localhost:8000
    else
        echo -e "${RED}❌ PHP no está instalado${NC}"
        return 1
    fi
}

# Función para detectar automáticamente el mejor servidor
auto_detect_server() {
    echo -e "${BLUE}🔍 Detectando el mejor servidor disponible...${NC}"
    
    # Prioridad: Python > Node.js > PHP
    if command_exists python3 || command_exists python; then
        echo -e "${GREEN}✅ Python detectado - usando Python${NC}"
        start_python_server
    elif command_exists npx; then
        echo -e "${GREEN}✅ Node.js detectado - usando Node.js${NC}"
        start_node_server
    elif command_exists php; then
        echo -e "${GREEN}✅ PHP detectado - usando PHP${NC}"
        start_php_server
    else
        echo -e "${RED}❌ No se encontró ningún servidor disponible${NC}"
        echo ""
        echo -e "${YELLOW}💡 Opciones para instalar un servidor:${NC}"
        echo "  - Python: https://www.python.org/downloads/"
        echo "  - Node.js: https://nodejs.org/"
        echo "  - PHP: https://www.php.net/downloads"
        echo ""
        echo -e "${YELLOW}💡 O puedes abrir index.html directamente en tu navegador${NC}"
        return 1
    fi
}

# Función principal
main() {
    show_banner
    
    # Verificar archivos necesarios
    if ! check_required_files; then
        exit 1
    fi
    
    # Procesar argumentos
    case "${1:-auto}" in
        "python")
            start_python_server
            ;;
        "node")
            start_node_server
            ;;
        "php")
            start_php_server
            ;;
        "auto")
            auto_detect_server
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            echo -e "${RED}❌ Opción no válida: $1${NC}"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# Ejecutar función principal
main "$@" 