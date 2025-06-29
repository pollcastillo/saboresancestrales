# Mostrar Datos en la Interfaz de Usuario (UI) - Sabores Ancestrales

## Descripción General

Este documento explica cómo mostrar los datos obtenidos desde la base de datos SQL.js en la interfaz de usuario usando JavaScript. Incluye patrones, ejemplos y mejores prácticas para renderizar información en tablas, listas, tarjetas y otros componentes visuales.

## Flujo Básico

1. **Leer los datos** desde la base de datos usando DatabaseManager.
2. **Procesar/transformar** los datos si es necesario.
3. **Renderizar** los datos en el DOM usando JavaScript.

## Ejemplo General

```javascript
// 1. Leer datos
const services = dbManager.getServices();

// 2. Seleccionar el contenedor en el DOM
const tableBody = document.getElementById('servicesTableBody');

// 3. Limpiar el contenedor
tableBody.innerHTML = '';

// 4. Renderizar cada elemento
services.forEach(service => {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${service.title}</td>
        <td>${service.description}</td>
        <td>${service.price || '-'}</td>
        <td>${service.active ? 'Activo' : 'Inactivo'}</td>
        <td>
            <button class="btn btn-sm btn-primary">Editar</button>
        </td>
    `;
    tableBody.appendChild(row);
});
```

## Patrones Comunes

### 1. Mostrar Listas

```javascript
const tips = dbManager.getCookingTips();
const list = document.getElementById('tipsList');
list.innerHTML = '';
tips.forEach(tip => {
    const li = document.createElement('li');
    li.textContent = `${tip.title} (${tip.category_name})`;
    list.appendChild(li);
});
```

### 2. Mostrar Tarjetas

```javascript
const images = dbManager.getGalleryImages();
const grid = document.getElementById('galleryGrid');
grid.innerHTML = '';
images.forEach(img => {
    const card = document.createElement('div');
    card.className = 'gallery-card';
    card.innerHTML = `
        <img src="${img.url}" alt="${img.alt}">
        <div class="card-title">${img.title}</div>
        <div class="card-category">${img.category_name}</div>
    `;
    grid.appendChild(card);
});
```

### 3. Mostrar Tablas

```javascript
const users = dbManager.formatResult(dbManager.db.exec('SELECT * FROM users'));
const tbody = document.getElementById('usersTableBody');
tbody.innerHTML = '';
users.forEach(user => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td>${user.username}</td>
        <td>${user.role}</td>
        <td>${user.email || '-'}</td>
    `;
    tbody.appendChild(tr);
});
```

### 4. Mostrar Datos Detallados

```javascript
function showServiceDetail(serviceId) {
    const service = dbManager.getServices().find(s => s.id === serviceId);
    if (!service) return;
    document.getElementById('serviceTitle').textContent = service.title;
    document.getElementById('serviceDesc').textContent = service.description;
    document.getElementById('serviceCategory').textContent = service.category_name;
}
```

## Renderizado Reactivo (actualización dinámica)

- Si los datos cambian (por ejemplo, tras un CRUD), vuelve a llamar a la función de renderizado.
- Ejemplo:

```javascript
function refreshServicesTable() {
    const services = dbManager.getServices();
    renderServicesTable(services);
}

function renderServicesTable(services) {
    const tbody = document.getElementById('servicesTableBody');
    tbody.innerHTML = '';
    services.forEach(service => {
        // ...
    });
}
```

## Buenas Prácticas

- **Limpiar el contenedor** antes de renderizar para evitar duplicados.
- **Usar plantillas literales** para mayor legibilidad.
- **Separar lógica de obtención y renderizado** en funciones distintas.
- **Agregar clases y atributos** para facilitar el estilo y la manipulación.
- **Evitar renderizar grandes volúmenes de datos de golpe** (usar paginación o lazy loading si es necesario).

## Ejemplo Completo: Renderizar Servicios con Paginación

```javascript
function renderPaginatedServices(page = 1, pageSize = 10) {
    const offset = (page - 1) * pageSize;
    const result = dbManager.db.exec(`
        SELECT s.*, sc.name as category_name
        FROM services s
        LEFT JOIN service_categories sc ON s.category = sc.id
        WHERE s.active = 1
        ORDER BY s.order_index ASC
        LIMIT ? OFFSET ?
    `, [pageSize, offset]);
    const services = dbManager.formatResult(result);
    const tbody = document.getElementById('servicesTableBody');
    tbody.innerHTML = '';
    services.forEach(service => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${service.title}</td>
            <td>${service.description}</td>
            <td>${service.category_name}</td>
        `;
        tbody.appendChild(tr);
    });
}
```

## Consideraciones de Accesibilidad

- Usar etiquetas semánticas (`<table>`, `<ul>`, `<section>`, etc.).
- Incluir atributos `alt` en imágenes.
- Asegurarse de que los textos sean legibles y los colores tengan buen contraste.

## Resumen

1. Lee los datos con DatabaseManager.
2. Selecciona el contenedor adecuado en el DOM.
3. Limpia el contenedor antes de renderizar.
4. Usa bucles para crear y añadir los elementos al DOM.
5. Separa la lógica de obtención y renderizado para mayor claridad y reutilización.

---

**Nota:** Para componentes complejos, considera crear funciones reutilizables de renderizado o usar frameworks si el proyecto lo requiere. 