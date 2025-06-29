# Documentación: DatabaseManager - Sabores Ancestrales

## Índice
1. [Introducción](#introducción)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Paso a Paso: Desarrollo del DatabaseManager](#paso-a-paso-desarrollo-del-databasemanager)
4. [Estructura de la Base de Datos](#estructura-de-la-base-de-datos)
5. [Métodos y Funcionalidades](#métodos-y-funcionalidades)
6. [Integración con el Proyecto](#integración-con-el-proyecto)
7. [Ejecución del Proyecto](#ejecución-del-proyecto)
8. [Consideraciones Técnicas](#consideraciones-técnicas)

---

## Introducción

El `DatabaseManager` es el núcleo del sistema de gestión de datos para la landing page de **Sabores Ancestrales**. Utiliza **SQL.js** para proporcionar una base de datos SQLite completa en el navegador, permitiendo el almacenamiento y gestión de todos los datos del proyecto sin necesidad de un servidor backend.

### Objetivos del Sistema
- ✅ Gestión completa de datos en el navegador
- ✅ Operaciones CRUD para servicios, tips, galería y mensajes
- ✅ Sistema de autenticación para administración
- ✅ Persistencia de datos mediante exportación/importación
- ✅ Carga automática de datos iniciales desde JSON

---

## Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    DatabaseManager                          │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   SQL.js    │  │   Tablas    │  │   Métodos   │         │
│  │  (Motor)    │  │  (Esquema)  │  │ (Operaciones)│         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Servicios │  │    Tips     │  │   Galería   │         │
│  │             │  │             │  │             │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Usuarios  │  │  Mensajes   │  │  Utilidades │         │
│  │             │  │             │  │             │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

---

## Paso a Paso: Desarrollo del DatabaseManager

### Paso 1: Configuración Inicial y Dependencias

**1.1 Instalación de SQL.js**
```bash
# Descargar SQL.js desde el CDN oficial
# Archivos necesarios:
# - sql-wasm.js
# - sql-wasm.wasm
# - sql-wasm.js.map
# - sql-wasm.wasm.map
```

**1.2 Estructura de Archivos**
```
src/
├── vendors/
│   ├── sql-wasm.js
│   ├── sql-wasm.wasm
│   ├── sql-wasm.js.map
│   └── sql-wasm.wasm.map
└── js/
    └── database/
        └── DatabaseManager.js
```

### Paso 2: Creación de la Clase Base

**2.1 Constructor y Propiedades Iniciales**
```javascript
class DatabaseManager {
    constructor() {
        this.db = null;           // Instancia de la base de datos
        this.SQL = null;          // Referencia a SQL.js
        this.isInitialized = false; // Estado de inicialización
    }
}
```

**2.2 Método de Inicialización**
```javascript
async initialize() {
    try {
        // 1. Cargar SQL.js dinámicamente
        const script = document.createElement('script');
        script.src = 'src/vendors/sql-wasm.js';
        document.head.appendChild(script);

        // 2. Esperar a que se cargue
        await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = reject;
        });

        // 3. Inicializar SQL.js
        this.SQL = await initSqlJs({
            locateFile: file => `src/vendors/${file}`
        });

        // 4. Crear base de datos en memoria
        this.db = new this.SQL.Database();

        // 5. Crear tablas
        this.createTables();

        // 6. Cargar datos iniciales
        await this.loadInitialData();

        this.isInitialized = true;
        console.log('✅ Base de datos SQL.js inicializada correctamente');

    } catch (error) {
        console.error('❌ Error al inicializar la base de datos:', error);
        throw error;
    }
}
```

### Paso 3: Diseño del Esquema de Base de Datos

**3.1 Análisis de Requerimientos**
- Servicios de catering con categorías
- Tips de cocina organizados por dificultad
- Galería de imágenes con categorías
- Sistema de usuarios para administración
- Mensajes de contacto
- Estadísticas del negocio

**3.2 Diseño de Tablas**

#### Tabla: `services`
```sql
CREATE TABLE IF NOT EXISTS services (
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
)
```

#### Tabla: `service_categories`
```sql
CREATE TABLE IF NOT EXISTS service_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT NOT NULL
)
```

#### Tabla: `cooking_tips`
```sql
CREATE TABLE IF NOT EXISTS cooking_tips (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT,
    icon TEXT,
    difficulty TEXT,
    time TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

#### Tabla: `gallery`
```sql
CREATE TABLE IF NOT EXISTS gallery (
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
)
```

#### Tabla: `users`
```sql
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

#### Tabla: `messages`
```sql
CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT 0,
    replied BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### Paso 4: Implementación de Métodos CRUD

**4.1 Métodos para Servicios**
```javascript
// Insertar servicio
insertService(service) {
    this.db.run(`
        INSERT OR REPLACE INTO services 
        (id, title, description, icon, category, badge, active, featured, order_index, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
        service.id, service.title, service.description, service.icon,
        service.category, service.badge, service.active ? 1 : 0,
        service.featured ? 1 : 0, service.order, service.createdAt, service.updatedAt
    ]);
}

// Obtener servicios
getServices() {
    const result = this.db.exec(`
        SELECT s.*, sc.name as category_name, sc.color as category_color
        FROM services s
        LEFT JOIN service_categories sc ON s.category = sc.id
        WHERE s.active = 1
        ORDER BY s.order_index ASC
    `);
    return this.formatResult(result);
}
```

**4.2 Métodos para Tips de Cocina**
```javascript
// Insertar tip
insertCookingTip(tip) {
    this.db.run(`
        INSERT OR REPLACE INTO cooking_tips 
        (id, title, description, category, icon, difficulty, time)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
        tip.id, tip.title, tip.description, tip.category,
        tip.icon, tip.difficulty, tip.time
    ]);
}

// Obtener tips por categoría
getCookingTipsByCategory(category) {
    const result = this.db.exec(`
        SELECT t.*, tc.name as category_name, tc.color as category_color
        FROM cooking_tips t
        LEFT JOIN tip_categories tc ON t.category = tc.id
        WHERE t.category = ?
        ORDER BY t.id ASC
    `, [category]);
    return this.formatResult(result);
}
```

**4.3 Métodos para Galería**
```javascript
// Insertar imagen
insertGalleryImage(image) {
    this.db.run(`
        INSERT OR REPLACE INTO gallery 
        (id, title, description, filename, url, category, active, featured, order_index, alt, tags, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
        image.id, image.title, image.description, image.filename,
        image.url, image.category, image.active ? 1 : 0,
        image.featured ? 1 : 0, image.order, image.alt,
        JSON.stringify(image.tags), image.createdAt, image.updatedAt
    ]);
}
```

**4.4 Métodos para Mensajes**
```javascript
// Insertar mensaje
insertMessage(message) {
    this.db.run(`
        INSERT INTO messages (name, email, phone, message)
        VALUES (?, ?, ?, ?)
    `, [message.name, message.email, message.phone || null, message.message]);
    
    return this.db.exec('SELECT last_insert_rowid()')[0].values[0][0];
}

// Marcar como leído
markMessageAsRead(messageId) {
    this.db.run('UPDATE messages SET read = 1 WHERE id = ?', [messageId]);
    return true;
}
```

### Paso 5: Sistema de Carga de Datos Iniciales

**5.1 Carga desde Archivos JSON**
```javascript
async loadInitialData() {
    try {
        // Cargar servicios
        const servicesResponse = await fetch('src/data/services.json');
        const servicesData = await servicesResponse.json();

        // Insertar categorías y servicios
        for (const category of servicesData.categories) {
            this.insertServiceCategory(category);
        }
        for (const service of servicesData.services) {
            this.insertService(service);
        }

        // Cargar tips
        const tipsResponse = await fetch('src/data/cooking-tips.json');
        const tipsData = await tipsResponse.json();
        
        // Cargar galería
        const galleryResponse = await fetch('src/data/gallery.json');
        const galleryData = await galleryResponse.json();

        console.log('✅ Datos iniciales cargados correctamente');

    } catch (error) {
        console.error('❌ Error al cargar datos iniciales:', error);
    }
}
```

### Paso 6: Utilidades y Métodos de Soporte

**6.1 Formateo de Resultados**
```javascript
formatResult(result) {
    if (result.length === 0) return [];

    const columns = result[0].columns;
    const values = result[0].values;

    return values.map(row => {
        const obj = {};
        columns.forEach((column, index) => {
            obj[column] = row[index];
        });
        return obj;
    });
}
```

**6.2 Exportación e Importación**
```javascript
// Exportar base de datos
exportDatabase() {
    const data = this.db.export();
    const blob = new Blob([data], { type: 'application/x-sqlite3' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'sabores-ancestrales.db';
    a.click();

    URL.revokeObjectURL(url);
}

// Importar base de datos
async importDatabase(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                this.db = new this.SQL.Database(data);
                this.isInitialized = true;
                resolve(true);
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}
```

---

## Estructura de la Base de Datos

### Relaciones entre Tablas
```
services ─────┐
              ├── service_categories
              └── (category)

cooking_tips ─┐
              ├── tip_categories
              └── (category)

gallery ──────┐
              ├── gallery_categories
              └── (category)

messages ────── (independiente)
users ──────── (independiente)
```

### Índices y Optimizaciones
- **Claves primarias**: Todas las tablas tienen ID autoincremental
- **Claves únicas**: Username en usuarios
- **Índices implícitos**: SQLite crea automáticamente índices en claves primarias
- **Ordenamiento**: Campos `order_index` para orden personalizado

---

## Métodos y Funcionalidades

### Servicios
- `insertServiceCategory(category)` - Insertar categoría
- `insertService(service)` - Insertar servicio
- `getServices()` - Obtener todos los servicios activos
- `getFeaturedServices()` - Obtener servicios destacados
- `getServiceCategories()` - Obtener categorías

### Tips de Cocina
- `insertTipCategory(category)` - Insertar categoría
- `insertCookingTip(tip)` - Insertar tip
- `getCookingTips()` - Obtener todos los tips
- `getCookingTipsByCategory(category)` - Obtener por categoría
- `getTipCategories()` - Obtener categorías

### Galería
- `insertGalleryCategory(category)` - Insertar categoría
- `insertGalleryImage(image)` - Insertar imagen
- `getGalleryImages()` - Obtener todas las imágenes
- `getFeaturedGalleryImages()` - Obtener imágenes destacadas
- `getGalleryCategories()` - Obtener categorías

### Usuarios
- `insertUser(user)` - Insertar usuario
- `authenticateUser(username, password)` - Autenticar usuario

### Mensajes
- `insertMessage(message)` - Insertar mensaje
- `getMessages()` - Obtener todos los mensajes
- `markMessageAsRead(messageId)` - Marcar como leído
- `markMessageAsReplied(messageId)` - Marcar como respondido

### Utilidades
- `formatResult(result)` - Formatear resultados SQL
- `exportDatabase()` - Exportar base de datos
- `importDatabase(file)` - Importar base de datos
- `close()` - Cerrar conexión

---

## Integración con el Proyecto

### 1. Inicialización en main.js
```javascript
// Inicializar base de datos
const dbManager = new DatabaseManager();
await dbManager.initialize();

// Hacer disponible globalmente
window.dbManager = dbManager;
```

### 2. Uso en Controladores
```javascript
// Ejemplo: GalleryController
class GalleryController {
    constructor() {
        this.dbManager = window.dbManager;
    }

    async loadGallery() {
        const images = this.dbManager.getGalleryImages();
        this.renderGallery(images);
    }
}
```

### 3. Uso en Vistas
```javascript
// Ejemplo: Cargar servicios en la página principal
async function loadServices() {
    const services = dbManager.getServices();
    const featuredServices = dbManager.getFeaturedServices();
    
    renderServices(services);
    renderFeaturedServices(featuredServices);
}
```

---

## Ejecución del Proyecto

### ⚠️ Importante: No se necesita npm start

**La base de datos se inicializa automáticamente** cuando se carga la página web, no requiere comandos especiales.

### 🔄 Proceso de Inicialización Automática

1. **Al abrir la página web** (index.html o admin.html)
2. **El archivo main.js** se ejecuta automáticamente
3. **Se crea una instancia** del DatabaseManager
4. **Se inicializa SQL.js** y se crean las tablas
5. **Se cargan los datos** desde los archivos JSON

### 🚀 Opciones para Ejecutar el Proyecto

#### Opción 1: Servidor Local (Recomendado)
```bash
# Con Python
python -m http.server 8000

# Con Node.js
npx http-server

# Con PHP
php -S localhost:8000

# Con Live Server (VS Code)
# Instalar extensión "Live Server" y hacer clic en "Go Live"
```

#### Opción 2: Abrir Directamente
```bash
# Simplemente abrir index.html en el navegador
open index.html
# o
start index.html  # En Windows
```

### 📋 Verificación de Funcionamiento

1. **Abrir la consola del navegador** (F12)
2. **Verificar que aparezcan estos mensajes**:
   ```
   ✅ Base de datos SQL.js inicializada correctamente
   ✅ Tablas creadas correctamente
   ✅ Datos iniciales cargados correctamente
   ```

### 🔍 Estructura de Archivos Requeridos

```
saboresancestrales/
├── index.html              # Página principal
├── admin.html              # Panel de administración
├── src/
│   ├── vendors/            # SQL.js y archivos WebAssembly
│   │   ├── sql-wasm.js
│   │   ├── sql-wasm.wasm
│   │   ├── sql-wasm.js.map
│   │   └── sql-wasm.wasm.map
│   ├── js/
│   │   ├── main.js         # Inicialización de la BD
│   │   └── database/
│   │       └── DatabaseManager.js
│   └── data/               # Datos iniciales
│       ├── services.json
│       ├── cooking-tips.json
│       └── gallery.json
```

### ⚠️ Consideraciones Importantes

- **Base de datos en memoria**: Se pierde al recargar la página
- **No requiere servidor backend**: Todo funciona en el navegador
- **Carga dinámica**: SQL.js se carga automáticamente
- **Datos iniciales**: Se cargan desde archivos JSON locales

### 🐛 Solución de Problemas

#### Error: "SQL.js no encontrado"
- Verificar que los archivos estén en `src/vendors/`
- Comprobar rutas en el código

#### Error: "Datos no cargados"
- Verificar que los archivos JSON existan en `src/data/`
- Comprobar estructura de los archivos JSON

#### Error: "CORS" (Cross-Origin)
- Usar un servidor local en lugar de abrir directamente
- Configurar headers CORS si es necesario

---

## Consideraciones Técnicas

### Ventajas de SQL.js
- ✅ **Completo**: Soporte completo de SQLite
- ✅ **Rápido**: Ejecución nativa en WebAssembly
- ✅ **Portable**: No requiere servidor
- ✅ **Familiar**: Sintaxis SQL estándar
- ✅ **Robusto**: Transacciones y integridad de datos

### Limitaciones
- ⚠️ **Memoria**: Base de datos en memoria (se pierde al recargar)
- ⚠️ **Tamaño**: Limitado por memoria del navegador
- ⚠️ **Concurrencia**: No soporta múltiples conexiones
- ⚠️ **Persistencia**: Requiere exportación manual

### Mejores Prácticas Implementadas
1. **Manejo de errores**: Try-catch en todas las operaciones críticas
2. **Validación de datos**: Verificación antes de insertar
3. **Transacciones**: Uso de transacciones para operaciones complejas
4. **Logging**: Console.log para debugging
5. **Modularidad**: Métodos separados por entidad
6. **Documentación**: Comentarios JSDoc completos

### Optimizaciones
- **Consultas preparadas**: Uso de parámetros para evitar SQL injection
- **JOINs eficientes**: Relaciones optimizadas
- **Índices apropiados**: Claves primarias y únicas
- **Lazy loading**: Carga de datos bajo demanda

---

## Conclusión

El `DatabaseManager` proporciona una solución completa y robusta para la gestión de datos en el proyecto **Sabores Ancestrales**. Su arquitectura modular, métodos bien documentados y integración seamless con el resto del proyecto lo convierten en una base sólida para el crecimiento futuro del sistema.

### Próximos Pasos Sugeridos
1. **Implementar caché**: Para mejorar rendimiento
2. **Añadir validaciones**: Más robustas para datos de entrada
3. **Sistema de backup**: Automático en localStorage
4. **Migraciones**: Para cambios de esquema
5. **Testing**: Unit tests para todos los métodos

---

*Documentación creada el: $(date)*
*Versión del DatabaseManager: 1.0*
*Proyecto: Sabores Ancestrales* 