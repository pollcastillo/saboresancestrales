# 🚀 Servidor Backend - Sabores Ancestrales

## 📋 Descripción

Este servidor backend permite guardar datos directamente en archivos `.sql` y proporciona una API REST completa para el sistema de administración de Sabores Ancestrales.

## 🛠️ Instalación

### 1. Instalar dependencias
```bash
npm install
```

### 2. Iniciar el servidor
```bash
# Desarrollo (con recarga automática)
npm run dev

# Producción
npm start
```

### 3. Acceder a la aplicación
- **Página principal**: http://localhost:3000
- **Administración**: http://localhost:3000/admin

## 📁 Estructura del Proyecto

```
saboresancestrales/
├── server.js                 # Servidor principal
├── package.json             # Dependencias y scripts
├── data/                    # Base de datos SQLite
│   └── sabores_ancestrales.db
├── src/
│   ├── server/
│   │   └── DatabaseAPI.js   # API de base de datos
│   ├── js/
│   │   └── database/
│   │       └── ServerAdapter.js  # Adaptador frontend
│   └── data/                # Archivos JSON originales
└── SERVER_SETUP.md          # Esta documentación
```

## 🔧 Configuración

### Variables de Entorno
```bash
# Puerto del servidor (opcional, por defecto 3000)
PORT=3000

# Directorio de datos (opcional, por defecto ./data)
DATA_DIR=./data
```

### Permisos de Archivos
```bash
# En Linux/Mac
chmod 755 data/
chmod 644 data/*.db

# En Windows
# Propiedades → Seguridad → Permisos de escritura
```

## 📊 Base de Datos

### Tablas Creadas
- **services**: Servicios de catering
- **cooking_tips**: Tips de cocina
- **gallery**: Galería de imágenes
- **users**: Usuarios del sistema
- **messages**: Mensajes recibidos

### Ubicación
- **Archivo**: `data/sabores_ancestrales.db`
- **Tipo**: SQLite3
- **Backup**: Se exporta automáticamente como `.sql`

## 🔌 API Endpoints

### Estadísticas
```http
GET /api/database/stats
```

### Exportar/Importar
```http
GET /api/database/export
POST /api/database/import
```

### Servicios
```http
GET    /api/database/services
POST   /api/database/services
PUT    /api/database/services/:id
DELETE /api/database/services/:id
```

### Tips de Cocina
```http
GET    /api/database/tips
POST   /api/database/tips
PUT    /api/database/tips/:id
DELETE /api/database/tips/:id
```

### Galería
```http
GET    /api/database/gallery
POST   /api/database/gallery
PUT    /api/database/gallery/:id
DELETE /api/database/gallery/:id
```

### Autenticación
```http
POST /api/database/auth
```

### Archivos JSON
```http
GET  /api/data/:filename
POST /api/data/:filename
```

## 💾 Almacenamiento de Datos

### 1. **Base de Datos SQLite** (Principal)
- **Ubicación**: `data/sabores_ancestrales.db`
- **Persistencia**: Permanente en el servidor
- **Ventajas**: Transacciones, consultas complejas, integridad

### 2. **Archivos SQL Exportados**
- **Ubicación**: Descargados por el usuario
- **Formato**: `.sql` con INSERT statements
- **Uso**: Backup y migración

### 3. **Archivos JSON** (Compatibilidad)
- **Ubicación**: `src/data/*.json`
- **Uso**: Datos iniciales y fallback

## 🔄 Migración de Datos

### Desde JSON a SQLite
```javascript
// Automático al iniciar el servidor
// Los datos se migran desde src/data/*.json
```

### Exportar Base de Datos
```javascript
// Desde el frontend
const serverAdapter = new ServerAdapter();
await serverAdapter.exportDatabase();
```

### Importar Base de Datos
```javascript
// Desde el frontend
const serverAdapter = new ServerAdapter();
await serverAdapter.importDatabase(sqlContent);
```

## 🛡️ Seguridad

### Autenticación
- **Método**: Usuario y cédula
- **Almacenamiento**: Base de datos SQLite
- **Sesión**: localStorage del navegador

### Validación
- **Entrada**: Sanitización automática
- **SQL**: Prepared statements
- **Archivos**: Validación de tipos

### Permisos
- **Lectura**: Pública para archivos estáticos
- **Escritura**: Solo a través de API autenticada
- **Base de datos**: Acceso restringido al servidor

## 🔧 Desarrollo

### Logs del Servidor
```bash
# Ver logs en tiempo real
npm run dev

# Logs importantes:
✅ Base de datos SQLite conectada
✅ Tablas creadas correctamente
📥 Insertando datos iniciales...
✅ Datos iniciales insertados
🚀 Servidor corriendo en http://localhost:3000
```

### Debugging
```javascript
// En el frontend
console.log('Estado del servidor:', serverAdapter.isConnected);

// En el servidor
console.log('Consulta SQL:', sql);
console.log('Parámetros:', params);
```

### Testing
```bash
# Probar conexión
curl http://localhost:3000/api/database/stats

# Probar autenticación
curl -X POST http://localhost:3000/api/database/auth \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","cedula":"1234567890"}'
```

## 🚀 Despliegue

### Local
```bash
npm start
```

### Producción
```bash
# Usar PM2
npm install -g pm2
pm2 start server.js --name "sabores-ancestrales"

# O usar Docker
docker build -t sabores-ancestrales .
docker run -p 3000:3000 sabores-ancestrales
```

### Variables de Producción
```bash
NODE_ENV=production
PORT=3000
DATA_DIR=/var/www/data
```

## 📝 Notas Importantes

### 1. **Permisos de Escritura**
- El servidor necesita permisos para escribir en `data/`
- En producción, asegurar permisos correctos

### 2. **Backup Automático**
- Los datos se exportan como `.sql` automáticamente
- Mantener copias de seguridad regulares

### 3. **Compatibilidad**
- El sistema funciona con y sin servidor
- Fallback automático a archivos JSON

### 4. **Rendimiento**
- SQLite es muy eficiente para aplicaciones pequeñas
- Para mayor escala, considerar PostgreSQL/MySQL

## 🆘 Solución de Problemas

### Error: "EACCES: permission denied"
```bash
# Dar permisos al directorio de datos
chmod 755 data/
chown www-data:www-data data/  # En Linux
```

### Error: "SQLITE_BUSY"
```bash
# La base de datos está en uso
# Reiniciar el servidor
npm restart
```

### Error: "Cannot find module"
```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### Error: "Port already in use"
```bash
# Cambiar puerto
PORT=3001 npm start
```

## 📞 Soporte

Para problemas o preguntas:
1. Revisar los logs del servidor
2. Verificar permisos de archivos
3. Comprobar conectividad de red
4. Revisar esta documentación

---

**¡El servidor está listo para guardar archivos `.sql` directamente!** 🎉 