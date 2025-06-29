# Scripts de Servidor - Sabores Ancestrales

## 📋 Descripción

Scripts automatizados para iniciar el servidor local del proyecto **Sabores Ancestrales** de manera fácil y rápida.

## 🚀 Scripts Disponibles

### Para macOS/Linux: `start_server.sh`
```bash
# Hacer ejecutable (solo la primera vez)
chmod +x start_server.sh

# Usar el script
./start_server.sh [opción]
```

### Para Windows: `start_server.bat`
```cmd
# Usar el script
start_server.bat [opción]
```

## 🎯 Opciones Disponibles

| Opción | Descripción | Puerto | Comando Interno |
|--------|-------------|--------|-----------------|
| `auto` | Detectar automáticamente el mejor servidor | Variable | Detección automática |
| `python` | Usar Python HTTP Server | 8000 | `python -m http.server 8000` |
| `node` | Usar Node.js http-server | 8080 | `npx http-server -p 8080 -o` |
| `php` | Usar PHP Built-in Server | 8000 | `php -S localhost:8000` |
| `help` | Mostrar ayuda | - | - |

## 🔧 Uso Básico

### Detección Automática (Recomendado)
```bash
# macOS/Linux
./start_server.sh

# Windows
start_server.bat
```

### Especificar Servidor
```bash
# macOS/Linux
./start_server.sh python
./start_server.sh node
./start_server.sh php

# Windows
start_server.bat python
start_server.bat node
start_server.bat php
```

### Ver Ayuda
```bash
# macOS/Linux
./start_server.sh help

# Windows
start_server.bat help
```

## ✅ Verificaciones Automáticas

Los scripts verifican automáticamente:

### 📁 Archivos Requeridos
- `index.html` - Página principal
- `src/js/main.js` - Script principal
- `src/js/database/DatabaseManager.js` - Gestor de base de datos
- `src/vendors/sql-wasm.js` - SQL.js principal
- `src/vendors/sql-wasm.wasm` - SQL.js WebAssembly
- `src/data/services.json` - Datos de servicios
- `src/data/cooking-tips.json` - Datos de tips
- `src/data/gallery.json` - Datos de galería

### 🛠️ Servidores Disponibles
- **Python** (prioridad alta)
- **Node.js** (prioridad media)
- **PHP** (prioridad baja)

## 🌐 URLs de Acceso

Una vez iniciado el servidor, accede a:

| Servidor | URL Principal | URL Admin |
|----------|---------------|-----------|
| Python | http://localhost:8000 | http://localhost:8000/admin.html |
| Node.js | http://localhost:8080 | http://localhost:8080/admin.html |
| PHP | http://localhost:8000 | http://localhost:8000/admin.html |

## 🔍 Verificación de Funcionamiento

1. **Abrir la consola del navegador** (F12)
2. **Verificar mensajes**:
   ```
   ✅ Base de datos SQL.js inicializada correctamente
   ✅ Tablas creadas correctamente
   ✅ Datos iniciales cargados correctamente
   ```

## 🐛 Solución de Problemas

### Error: "Archivos faltantes"
```bash
❌ Archivos faltantes: index.html src/js/main.js
💡 Asegúrate de que todos los archivos estén en su lugar antes de continuar
```

**Solución**: Verificar que todos los archivos estén en las rutas correctas.

### Error: "Servidor no encontrado"
```bash
❌ Python no está instalado
💡 Descarga Python desde: https://www.python.org/downloads/
```

**Soluciones**:
- Instalar Python: https://www.python.org/downloads/
- Instalar Node.js: https://nodejs.org/
- Instalar PHP: https://www.php.net/downloads

### Error: "Puerto en uso"
```bash
Address already in use
```

**Solución**: 
- Cambiar puerto en el script
- Detener otros servicios que usen el puerto
- Usar `lsof -i :8000` para ver qué usa el puerto

## 📊 Comparación de Servidores

| Característica | Python | Node.js | PHP |
|----------------|--------|---------|-----|
| **Velocidad** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Facilidad** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Compatibilidad** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Recursos** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Recomendado** | ✅ | ✅ | ✅ |

## 🔧 Personalización

### Cambiar Puerto (Python)
```bash
# En start_server.sh, línea ~120
python3 -m http.server 9000  # Cambiar 8000 por 9000
```

### Cambiar Puerto (Node.js)
```bash
# En start_server.sh, línea ~140
npx http-server -p 9000 -o  # Cambiar 8080 por 9000
```

### Añadir Nuevo Servidor
1. Crear función `start_new_server()`
2. Añadir opción en `main()`
3. Actualizar `auto_detect_server()`

## 📝 Logs y Debugging

### Habilitar Logs Detallados
```bash
# Python
python3 -m http.server 8000 --bind 127.0.0.1

# Node.js
npx http-server -p 8080 -o -d

# PHP
php -S localhost:8000 -t . -d display_errors=1
```

### Verificar Estado del Servidor
```bash
# Verificar puerto en uso
lsof -i :8000  # macOS/Linux
netstat -an | findstr :8000  # Windows

# Verificar procesos
ps aux | grep python  # macOS/Linux
tasklist | findstr python  # Windows
```

## 🚀 Integración con IDEs

### VS Code
```json
// .vscode/launch.json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Start Server",
            "type": "node",
            "request": "launch",
            "program": "${workspaceFolder}/start_server.sh",
            "args": ["auto"]
        }
    ]
}
```

### IntelliJ/WebStorm
- Configurar "Run Configuration"
- Ejecutar script como "External Tool"

## 📚 Referencias

- [Python HTTP Server](https://docs.python.org/3/library/http.server.html)
- [Node.js http-server](https://www.npmjs.com/package/http-server)
- [PHP Built-in Server](https://www.php.net/manual/en/features.commandline.webserver.php)
- [SQL.js Documentation](https://sql.js.org/)

---

*Documentación creada el: $(date)*
*Versión: 1.0*
*Proyecto: Sabores Ancestrales* 