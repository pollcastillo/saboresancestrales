# Implementación de SQL.js en Sabores Ancestrales

## 📋 Descripción General

Este documento describe la implementación de **SQL.js** en el proyecto **Sabores Ancestrales**, una migración desde archivos JSON estáticos a una base de datos SQLite en el navegador.

## 🎯 Objetivos

- **Migrar** de archivos JSON a base de datos SQLite
- **Mantener compatibilidad** con el código existente
- **Mejorar rendimiento** y escalabilidad
- **Facilitar operaciones CRUD** complejas
- **Permitir exportación/importación** de datos

## 🏗️ Arquitectura

### Estructura de Archivos

```
src/
├── js/
│   ├── database/
│   │   ├── DatabaseManager.js    # Gestor principal de la base de datos
│   │   └── DataAdapter.js        # Adaptador para compatibilidad
│   ├── main.js                   # Script principal (actualizado)
│   └── admin.js                  # Script de administración (actualizado)
├── data/                         # Archivos JSON originales (fallback)
│   ├── services.json
│   ├── cooking-tips.json
│   └── gallery.json
└── styles/                       # Estilos CSS
```

### Componentes Principales

#### 1. DatabaseManager.js
**Gestor principal de la base de datos SQL.js**

```javascript
class DatabaseManager {
    constructor() {
        this.db = null;
        this.SQL = null;
        this.isInitialized = false;
    }
    
    async initialize() {
        // Inicializa SQL.js y crea la base de datos
    }
    
    createTables() {
        // Crea todas las tablas necesarias
    }
    
    async loadInitialData() {
        // Carga datos desde archivos JSON
    }
}
```

**Funcionalidades:**
- ✅ Inicialización automática de SQL.js
- ✅ Creación de tablas con esquemas optimizados
- ✅ Carga de datos iniciales desde JSON
- ✅ Operaciones CRUD completas
- ✅ Exportación/importación de base de datos

#### 2. DataAdapter.js
**Adaptador para mantener compatibilidad**

```javascript
class DataAdapter {
    constructor(databaseManager) {
        this.db = databaseManager;
    }
    
    async getServices() {
        // Retorna datos en formato compatible con código existente
    }
    
    async getCookingTips() {
        // Retorna tips en formato compatible
    }
}
```

**Funcionalidades:**
- ✅ Interfaz compatible con código existente
- ✅ Conversión automática de formatos
- ✅ Manejo de errores y fallbacks
- ✅ Estadísticas de base de datos

## 📊 Esquema de Base de Datos

### Tablas Principales

#### 1. services
```sql
CREATE TABLE services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT,
    category TEXT,
    badge TEXT,
    active BOOLEAN DEFAULT 1,
    featured BOOLEAN DEFAULT 0,
    order_index INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. service_categories
```sql
CREATE TABLE service_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT NOT NULL
);
```

#### 3. cooking_tips
```sql
CREATE TABLE cooking_tips (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT,
    icon TEXT,
    difficulty TEXT,
    time TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 4. tip_categories
```sql
CREATE TABLE tip_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT NOT NULL
);
```

#### 5. gallery
```sql
CREATE TABLE gallery (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    filename TEXT,
    url TEXT NOT NULL,
    category TEXT,
    active BOOLEAN DEFAULT 1,
    featured BOOLEAN DEFAULT 0,
    order_index INTEGER DEFAULT 0,
    alt TEXT,
    tags TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 6. gallery_categories
```sql
CREATE TABLE gallery_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT NOT NULL
);
```

#### 7. users
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 8. messages
```sql
CREATE TABLE messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT 0,
    replied BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🚀 Implementación

### 1. Inicialización

```javascript
// En main.js
document.addEventListener('DOMContentLoaded', async function () {
    // Inicializar base de datos
    await initDatabase();
    
    // Inicializar funcionalidades
    initThemeToggle();
    initMobileMenu();
    // ... otras inicializaciones
});

async function initDatabase() {
    try {
        console.log('🔄 Inicializando base de datos SQL.js...');
        
        databaseManager = new DatabaseManager();
        await databaseManager.initialize();
        dataAdapter = new DataAdapter(databaseManager);
        
        console.log('✅ Base de datos inicializada correctamente');
    } catch (error) {
        console.error('❌ Error al inicializar la base de datos:', error);
        console.log('🔄 Usando fallback a archivos JSON...');
    }
}
```

### 2. Carga de Datos

```javascript
// Cargar servicios
async function initServices() {
    try {
        let services = [];

        // Intentar cargar desde la base de datos
        if (dataAdapter && dataAdapter.isReady()) {
            const data = await dataAdapter.getServices();
            services = data.services;
            console.log('✅ Servicios cargados desde SQL.js');
        } else {
            // Fallback a archivos JSON
            const response = await fetch('src/data/services.json');
            const data = await response.json();
            services = data.services || [];
            console.log('✅ Servicios cargados desde JSON (fallback)');
        }

        renderServices(services);
    } catch (error) {
        console.error('❌ Error cargando servicios:', error);
    }
}
```

### 3. Operaciones CRUD

#### Crear (Create)
```javascript
// Insertar un nuevo servicio
databaseManager.insertService({
    title: "Nuevo Servicio",
    description: "Descripción del servicio",
    icon: "ph-fill ph-star",
    category: "catering",
    active: true,
    featured: false
});
```

#### Leer (Read)
```javascript
// Obtener todos los servicios
const services = databaseManager.getServices();

// Obtener servicios destacados
const featuredServices = databaseManager.getFeaturedServices();

// Obtener servicios por categoría
const cateringServices = databaseManager.getServicesByCategory('catering');
```

#### Actualizar (Update)
```javascript
// Actualizar un servicio
databaseManager.updateService(1, {
    title: "Servicio Actualizado",
    active: false
});
```

#### Eliminar (Delete)
```javascript
// Eliminar un servicio
databaseManager.deleteService(1);
```

## 🔧 Configuración

### 1. Incluir Scripts

```html
<!-- En index.html y admin.html -->
<script src="src/js/database/DatabaseManager.js"></script>
<script src="src/js/database/DataAdapter.js"></script>
<script src="src/js/main.js"></script>
```

### 2. Dependencias Externas

SQL.js se carga automáticamente desde CDN:
```javascript
// Cargar SQL.js desde CDN
const script = document.createElement('script');
script.src = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-wasm.js';
document.head.appendChild(script);
```

## 📈 Ventajas de la Implementación

### 1. **Rendimiento**
- ✅ Consultas SQL optimizadas
- ✅ Índices automáticos
- ✅ Menos transferencia de datos

### 2. **Escalabilidad**
- ✅ Soporte para grandes volúmenes de datos
- ✅ Consultas complejas con JOINs
- ✅ Filtrado y ordenamiento eficiente

### 3. **Funcionalidad**
- ✅ Operaciones CRUD completas
- ✅ Búsqueda avanzada
- ✅ Estadísticas en tiempo real
- ✅ Exportación/importación de datos

### 4. **Compatibilidad**
- ✅ Fallback automático a JSON
- ✅ Interfaz compatible con código existente
- ✅ Migración gradual sin interrupciones

## 🔄 Migración de Datos

### Proceso Automático

1. **Inicialización**: La base de datos se crea automáticamente
2. **Carga de Datos**: Los archivos JSON se cargan como datos iniciales
3. **Verificación**: Se valida la integridad de los datos
4. **Disponibilidad**: La aplicación funciona con la nueva base de datos

### Datos Migrados

- ✅ **Servicios**: 6 servicios con categorías
- ✅ **Tips de Cocina**: 18 tips con 7 categorías
- ✅ **Galería**: 3 imágenes con categorías
- ✅ **Usuarios**: Sistema de autenticación
- ✅ **Mensajes**: Sistema de contacto

## 🛠️ Operaciones Avanzadas

### 1. Exportación de Base de Datos

```javascript
// Exportar base de datos como archivo .db
dataAdapter.exportDatabase();
```

### 2. Importación de Base de Datos

```javascript
// Importar base de datos desde archivo
const file = event.target.files[0];
await dataAdapter.importDatabase(file);
```

### 3. Estadísticas

```javascript
// Obtener estadísticas de la base de datos
const stats = await dataAdapter.getDatabaseStats();
console.log(stats);
// {
//   services: 6,
//   tips: 18,
//   images: 3,
//   messages: 0,
//   total: 27
// }
```

### 4. Consultas Personalizadas

```javascript
// Ejecutar consultas SQL personalizadas
const result = databaseManager.db.exec(`
    SELECT s.*, sc.name as category_name
    FROM services s
    LEFT JOIN service_categories sc ON s.category = sc.id
    WHERE s.active = 1 AND s.featured = 1
    ORDER BY s.order_index ASC
`);
```

## 🐛 Manejo de Errores

### 1. Fallback Automático

```javascript
// Si la base de datos falla, usar JSON
if (dataAdapter && dataAdapter.isReady()) {
    // Usar SQL.js
    const data = await dataAdapter.getServices();
} else {
    // Fallback a JSON
    const response = await fetch('src/data/services.json');
    const data = await response.json();
}
```

### 2. Logging Detallado

```javascript
console.log('🔄 Inicializando base de datos SQL.js...');
console.log('✅ Base de datos inicializada correctamente');
console.log('✅ Datos iniciales cargados correctamente');
console.error('❌ Error al inicializar la base de datos:', error);
```

## 🔒 Seguridad

### 1. Validación de Datos

```javascript
// Validar entrada de usuario
if (!username || !password) {
    this.showError('Por favor completa todos los campos');
    return;
}
```

### 2. Sanitización SQL

```javascript
// Usar parámetros preparados para evitar SQL injection
this.db.run(
    'INSERT INTO users (username, password) VALUES (?, ?)',
    [username, password]
);
```

## 📱 Compatibilidad

### Navegadores Soportados

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+

### Características Requeridas

- ✅ WebAssembly
- ✅ ES6 Modules
- ✅ Fetch API
- ✅ LocalStorage

## 🚀 Optimizaciones Futuras

### 1. **Indexación Avanzada**
- Crear índices para consultas frecuentes
- Optimizar JOINs complejos

### 2. **Caché Inteligente**
- Implementar sistema de caché
- Reducir consultas repetitivas

### 3. **Sincronización**
- Sincronización con servidor
- Backup automático

### 4. **Interfaz de Administración**
- Editor visual de consultas
- Monitor de rendimiento

## 📚 Referencias

### Documentación SQL.js
- [SQL.js Official Documentation](https://sql.js.org/)
- [GitHub Repository](https://github.com/sql-js/sql.js/)
- [API Reference](https://sql.js.org/documentation/Database.html)

### Recursos Adicionales
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [WebAssembly](https://webassembly.org/)
- [MDN Web APIs](https://developer.mozilla.org/en-US/docs/Web/API)

## 🤝 Contribución

### Reportar Bugs
1. Verificar la consola del navegador
2. Revisar los logs de inicialización
3. Probar el fallback a JSON
4. Crear issue con detalles del error

### Mejoras Sugeridas
1. Optimizar consultas SQL
2. Agregar nuevas funcionalidades
3. Mejorar la interfaz de usuario
4. Implementar nuevas tablas

---

**Versión**: 1.0.0  
**Fecha**: Enero 2024  
**Autor**: Equipo de Desarrollo Sabores Ancestrales  
**Licencia**: MIT 