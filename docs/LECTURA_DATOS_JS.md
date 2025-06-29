# Lectura de Datos con JavaScript - Sabores Ancestrales

## Descripción General

Este documento explica cómo leer datos de la base de datos SQL.js usando JavaScript en el proyecto Sabores Ancestrales. Se cubren todos los métodos disponibles, patrones de uso y mejores prácticas.

## Arquitectura de Lectura de Datos

### Componentes Principales

1. **DatabaseManager** - Gestor principal de la base de datos
2. **Métodos de Lectura** - Funciones específicas para cada entidad
3. **Formateo de Resultados** - Conversión de datos SQL a objetos JavaScript

### Flujo de Lectura

```
JavaScript → DatabaseManager → SQL.js → Resultados → Objetos JavaScript
```

## Métodos de Lectura Disponibles

### 1. Lectura de Usuarios

#### Obtener Usuario por Credenciales
```javascript
// Autenticar usuario
const user = dbManager.authenticateUser(username, password);
if (user) {
    console.log('Usuario autenticado:', user);
    // user = { id: 1, username: "admin", role: "admin", ... }
}
```

#### Obtener Todos los Usuarios
```javascript
// Obtener todos los usuarios de la base de datos
const result = dbManager.db.exec('SELECT * FROM users');
const users = dbManager.formatResult(result);

users.forEach(user => {
    console.log(`Usuario: ${user.username}, Rol: ${user.role}`);
});
```

### 2. Lectura de Servicios

#### Obtener Todos los Servicios
```javascript
// Obtener servicios con información de categoría
const services = dbManager.getServices();

services.forEach(service => {
    console.log(`
        Título: ${service.title}
        Descripción: ${service.description}
        Categoría: ${service.category_name}
        Color: ${service.category_color}
        Activo: ${service.active ? 'Sí' : 'No'}
        Destacado: ${service.featured ? 'Sí' : 'No'}
    `);
});
```

#### Obtener Servicios Destacados
```javascript
// Obtener solo servicios marcados como destacados
const featuredServices = dbManager.getFeaturedServices();

featuredServices.forEach(service => {
    console.log(`Servicio destacado: ${service.title}`);
});
```

#### Obtener Categorías de Servicios
```javascript
// Obtener todas las categorías de servicios
const categories = dbManager.getServiceCategories();

categories.forEach(category => {
    console.log(`Categoría: ${category.name}, Color: ${category.color}`);
});
```

### 3. Lectura de Tips de Cocina

#### Obtener Todos los Tips
```javascript
// Obtener tips con información de categoría
const tips = dbManager.getCookingTips();

tips.forEach(tip => {
    console.log(`
        Título: ${tip.title}
        Descripción: ${tip.description}
        Categoría: ${tip.category_name}
        Dificultad: ${tip.difficulty}
        Tiempo: ${tip.time}
        Icono: ${tip.icon}
    `);
});
```

#### Obtener Tips por Categoría
```javascript
// Obtener tips de una categoría específica
const categoryId = 1; // ID de la categoría
const tipsByCategory = dbManager.getCookingTipsByCategory(categoryId);

tipsByCategory.forEach(tip => {
    console.log(`Tip de ${tip.category_name}: ${tip.title}`);
});
```

#### Obtener Categorías de Tips
```javascript
// Obtener todas las categorías de tips
const tipCategories = dbManager.getTipCategories();

tipCategories.forEach(category => {
    console.log(`Categoría de tip: ${category.name}`);
});
```

### 4. Lectura de Galería

#### Obtener Todas las Imágenes
```javascript
// Obtener imágenes con información de categoría
const images = dbManager.getGalleryImages();

images.forEach(image => {
    console.log(`
        Título: ${image.title}
        URL: ${image.url}
        Categoría: ${image.category_name}
        Color: ${image.category_color}
        Activa: ${image.active ? 'Sí' : 'No'}
        Destacada: ${image.featured ? 'Sí' : 'No'}
        Orden: ${image.order_index}
    `);
});
```

#### Obtener Imágenes Destacadas
```javascript
// Obtener solo imágenes marcadas como destacadas
const featuredImages = dbManager.getFeaturedGalleryImages();

featuredImages.forEach(image => {
    console.log(`Imagen destacada: ${image.title}`);
});
```

#### Obtener Categorías de Galería
```javascript
// Obtener todas las categorías de galería
const galleryCategories = dbManager.getGalleryCategories();

galleryCategories.forEach(category => {
    console.log(`Categoría de galería: ${category.name}, Color: ${category.color}`);
});
```

### 5. Lectura de Mensajes

#### Obtener Todos los Mensajes
```javascript
// Obtener mensajes de contacto ordenados por fecha
const messages = dbManager.getMessages();

messages.forEach(message => {
    console.log(`
        De: ${message.name}
        Email: ${message.email}
        Teléfono: ${message.phone || 'No proporcionado'}
        Mensaje: ${message.message}
        Fecha: ${message.created_at}
        Leído: ${message.read ? 'Sí' : 'No'}
        Respondido: ${message.replied ? 'Sí' : 'No'}
    `);
});
```

## Consultas SQL Directas

### Consultas Básicas
```javascript
// Consulta simple
const result = dbManager.db.exec('SELECT COUNT(*) as total FROM users');
const total = result[0].values[0][0];
console.log(`Total de usuarios: ${total}`);

// Consulta con parámetros
const result = dbManager.db.exec(
    'SELECT * FROM services WHERE category = ? AND active = 1',
    [categoryId]
);
const services = dbManager.formatResult(result);
```

### Consultas Complejas
```javascript
// Consulta con JOIN
const result = dbManager.db.exec(`
    SELECT s.*, sc.name as category_name, sc.color as category_color
    FROM services s
    LEFT JOIN service_categories sc ON s.category = sc.id
    WHERE s.active = 1
    ORDER BY s.order_index ASC
`);
const services = dbManager.formatResult(result);

// Consulta con agregación
const result = dbManager.db.exec(`
    SELECT 
        sc.name as category_name,
        COUNT(*) as service_count,
        AVG(s.order_index) as avg_order
    FROM services s
    LEFT JOIN service_categories sc ON s.category = sc.id
    WHERE s.active = 1
    GROUP BY s.category
    ORDER BY service_count DESC
`);
const stats = dbManager.formatResult(result);
```

## Formateo de Resultados

### Método formatResult
```javascript
// El método formatResult convierte resultados SQL en objetos JavaScript
const result = dbManager.db.exec('SELECT * FROM users WHERE role = ?', ['admin']);
const users = dbManager.formatResult(result);

// Resultado formateado:
// [
//   { id: 1, username: "admin", role: "admin", fullName: "Administrador" },
//   { id: 2, username: "maria", role: "admin", fullName: "María González" }
// ]
```

### Estructura de Datos
```javascript
// Cada fila se convierte en un objeto con propiedades nombradas
const user = users[0];
console.log(user.id);        // 1
console.log(user.username);  // "admin"
console.log(user.role);      // "admin"
console.log(user.fullName);  // "Administrador"
```

## Patrones de Lectura

### 1. Lectura con Manejo de Errores
```javascript
async function readServicesSafely() {
    try {
        const services = dbManager.getServices();
        return services;
    } catch (error) {
        console.error('Error al leer servicios:', error);
        return [];
    }
}
```

### 2. Lectura con Filtros
```javascript
function getActiveServices() {
    const allServices = dbManager.getServices();
    return allServices.filter(service => service.active === 1);
}

function getServicesByCategory(categoryId) {
    const allServices = dbManager.getServices();
    return allServices.filter(service => service.category === categoryId);
}
```

### 3. Lectura con Transformación
```javascript
function getServicesForDisplay() {
    const services = dbManager.getServices();
    return services.map(service => ({
        id: service.id,
        title: service.title,
        description: service.description,
        category: service.category_name,
        color: service.category_color,
        isActive: service.active === 1,
        isFeatured: service.featured === 1
    }));
}
```

### 4. Lectura con Paginación
```javascript
function getServicesPaginated(page = 1, pageSize = 10) {
    const offset = (page - 1) * pageSize;
    
    const result = dbManager.db.exec(`
        SELECT s.*, sc.name as category_name, sc.color as category_color
        FROM services s
        LEFT JOIN service_categories sc ON s.category = sc.id
        WHERE s.active = 1
        ORDER BY s.order_index ASC
        LIMIT ? OFFSET ?
    `, [pageSize, offset]);
    
    return dbManager.formatResult(result);
}
```

## Optimización de Lectura

### 1. Consultas Eficientes
```javascript
// ✅ Buena práctica - Consulta específica
const result = dbManager.db.exec(
    'SELECT id, title, description FROM services WHERE active = 1'
);

// ❌ Mala práctica - Seleccionar todo
const result = dbManager.db.exec('SELECT * FROM services');
```

### 2. Índices y Ordenamiento
```javascript
// Usar índices para mejorar rendimiento
const result = dbManager.db.exec(`
    SELECT * FROM services 
    WHERE active = 1 
    ORDER BY order_index ASC, title ASC
`);
```

### 3. Caché de Consultas
```javascript
// Implementar caché para consultas frecuentes
let servicesCache = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

function getServicesWithCache() {
    const now = Date.now();
    
    if (!servicesCache || (now - cacheTimestamp) > CACHE_DURATION) {
        servicesCache = dbManager.getServices();
        cacheTimestamp = now;
    }
    
    return servicesCache;
}
```

## Ejemplos Prácticos

### 1. Dashboard de Estadísticas
```javascript
function getDashboardStats() {
    const stats = {};
    
    // Total de servicios
    const servicesResult = dbManager.db.exec('SELECT COUNT(*) as total FROM services WHERE active = 1');
    stats.totalServices = servicesResult[0].values[0][0];
    
    // Total de tips
    const tipsResult = dbManager.db.exec('SELECT COUNT(*) as total FROM cooking_tips');
    stats.totalTips = tipsResult[0].values[0][0];
    
    // Total de imágenes
    const imagesResult = dbManager.db.exec('SELECT COUNT(*) as total FROM gallery WHERE active = 1');
    stats.totalImages = imagesResult[0].values[0][0];
    
    // Mensajes no leídos
    const messagesResult = dbManager.db.exec('SELECT COUNT(*) as total FROM messages WHERE read = 0');
    stats.unreadMessages = messagesResult[0].values[0][0];
    
    return stats;
}
```

### 2. Búsqueda de Contenido
```javascript
function searchContent(query) {
    const searchTerm = `%${query}%`;
    
    const result = dbManager.db.exec(`
        SELECT 'service' as type, id, title, description, NULL as category
        FROM services 
        WHERE (title LIKE ? OR description LIKE ?) AND active = 1
        
        UNION ALL
        
        SELECT 'tip' as type, id, title, description, category
        FROM cooking_tips 
        WHERE title LIKE ? OR description LIKE ?
        
        ORDER BY title ASC
    `, [searchTerm, searchTerm, searchTerm, searchTerm]);
    
    return dbManager.formatResult(result);
}
```

### 3. Exportación de Datos
```javascript
function exportAllData() {
    const data = {
        services: dbManager.getServices(),
        tips: dbManager.getCookingTips(),
        images: dbManager.getGalleryImages(),
        messages: dbManager.getMessages(),
        users: dbManager.formatResult(dbManager.db.exec('SELECT * FROM users'))
    };
    
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sabores-ancestrales-data.json';
    a.click();
    
    URL.revokeObjectURL(url);
}
```

## Consideraciones de Rendimiento

### 1. Consultas Grandes
```javascript
// Para grandes volúmenes de datos, usar paginación
function getLargeDataset(page = 1, pageSize = 50) {
    const offset = (page - 1) * pageSize;
    
    const result = dbManager.db.exec(`
        SELECT * FROM large_table
        ORDER BY id
        LIMIT ? OFFSET ?
    `, [pageSize, offset]);
    
    return dbManager.formatResult(result);
}
```

### 2. Consultas Múltiples
```javascript
// Evitar múltiples consultas en bucles
// ❌ Mala práctica
users.forEach(user => {
    const userServices = dbManager.db.exec(
        'SELECT * FROM services WHERE user_id = ?', 
        [user.id]
    );
});

// ✅ Buena práctica - Consulta única
const allUserServices = dbManager.db.exec(`
    SELECT s.*, u.username 
    FROM services s 
    JOIN users u ON s.user_id = u.id
`);
```

### 3. Memoria
```javascript
// Limpiar resultados grandes cuando no se necesiten
function processLargeDataset() {
    const data = dbManager.db.exec('SELECT * FROM large_table');
    const processed = processData(data);
    
    // Limpiar referencia
    data = null;
    
    return processed;
}
```

## Debugging y Logging

### 1. Logging de Consultas
```javascript
function logQuery(sql, params = []) {
    console.log('SQL Query:', sql);
    console.log('Parameters:', params);
    
    const startTime = performance.now();
    const result = dbManager.db.exec(sql, params);
    const endTime = performance.now();
    
    console.log('Execution time:', endTime - startTime, 'ms');
    console.log('Rows returned:', result[0]?.values?.length || 0);
    
    return result;
}
```

### 2. Validación de Datos
```javascript
function validateUserData(user) {
    const errors = [];
    
    if (!user.username) errors.push('Username es requerido');
    if (!user.password) errors.push('Password es requerido');
    if (!user.role) errors.push('Role es requerido');
    
    if (errors.length > 0) {
        console.error('Errores de validación:', errors);
        return false;
    }
    
    return true;
}
```

## Mejores Prácticas

### 1. Siempre Usar Parámetros
```javascript
// ✅ Seguro - Usar parámetros
const result = dbManager.db.exec(
    'SELECT * FROM users WHERE username = ?', 
    [username]
);

// ❌ Peligroso - Concatenación directa
const result = dbManager.db.exec(
    `SELECT * FROM users WHERE username = '${username}'`
);
```

### 2. Manejar Errores
```javascript
function safeQuery(sql, params = []) {
    try {
        return dbManager.db.exec(sql, params);
    } catch (error) {
        console.error('Error en consulta SQL:', error);
        console.error('SQL:', sql);
        console.error('Parámetros:', params);
        throw error;
    }
}
```

### 3. Validar Resultados
```javascript
function getValidatedServices() {
    const services = dbManager.getServices();
    
    return services.filter(service => {
        return service.title && 
               service.description && 
               service.active !== undefined;
    });
}
```

---

**Nota**: Esta documentación cubre todos los aspectos de lectura de datos con JavaScript usando SQL.js. Para consultas específicas o casos de uso particulares, revisar la documentación del DatabaseManager o consultar los ejemplos en el código del proyecto. 