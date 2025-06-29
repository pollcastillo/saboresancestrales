# Sistema de Login - Sabores Ancestrales

## Descripción General

El sistema de login de Sabores Ancestrales está implementado usando **SQL.js** para el almacenamiento de usuarios y autenticación. Proporciona un sistema completo de autenticación con gestión de sesiones, roles y permisos.

## Arquitectura del Sistema

### Componentes Principales

1. **DatabaseManager** (`src/js/database/DatabaseManager.js`)
   - Gestor de base de datos SQL.js
   - Maneja la tabla `users` para autenticación
   - Métodos CRUD para usuarios

2. **AuthController** (`src/js/controllers/AuthController.js`)
   - Controlador principal de autenticación
   - Maneja login/logout
   - Gestión de sesiones
   - Validaciones de seguridad

3. **AdminApp** (`src/js/admin.js`)
   - Aplicación principal del panel de administración
   - Inicializa todos los componentes
   - Proporciona funciones globales

### Estructura de Base de Datos

#### Tabla `users`
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'viewer',
    fullName TEXT,
    email TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);
```

#### Roles Disponibles
- **admin**: Acceso completo al sistema
- **editor**: Puede crear y editar contenido
- **viewer**: Solo puede ver contenido

## Funcionalidades Implementadas

### 1. Sistema de Autenticación

#### Login
- Validación de credenciales contra base de datos SQL.js
- Campos requeridos: username (nombre) y password (cédula)
- Validaciones de longitud mínima
- Estado de loading durante la autenticación

#### Logout
- Cierre de sesión seguro
- Limpieza de datos de sesión
- Redirección al formulario de login

### 2. Gestión de Sesiones

#### Persistencia de Sesión
- **Remember Me**: Almacena sesión en localStorage
- **Sesión Temporal**: Almacena en sessionStorage
- Timeout automático de 30 minutos

#### Restauración de Sesión
- Verificación automática al cargar la página
- Validación de expiración de sesión
- Restauración transparente del estado

### 3. Sistema de Roles y Permisos

#### Roles Predefinidos
```javascript
const rolePermissions = {
    'admin': ['read', 'write', 'delete', 'manage_users', 'manage_content'],
    'editor': ['read', 'write', 'manage_content'],
    'viewer': ['read']
};
```

#### Funciones de Verificación
- `hasRole(role)`: Verifica si el usuario tiene un rol específico
- `hasPermission(permission)`: Verifica permisos específicos
- `isAuthenticated()`: Verifica si el usuario está autenticado

### 4. Interfaz de Usuario

#### Formulario de Login
- Diseño moderno y responsivo
- Contadores de caracteres en tiempo real
- Mensajes de error/éxito
- Checkbox "Recordar sesión"

#### Dashboard
- Header con información del usuario
- Botón de logout
- Navegación por secciones

## Datos de Usuario Iniciales

### Usuarios de Prueba
```json
{
  "users": [
    {
      "id": 1,
      "username": "admin",
      "password": "12345",
      "role": "admin",
      "fullName": "Administrador Principal"
    },
    {
      "id": 2,
      "username": "maria",
      "password": "54321",
      "role": "admin",
      "fullName": "María González"
    },
    {
      "id": 3,
      "username": "juan",
      "password": "67890",
      "role": "editor",
      "fullName": "Juan Pérez"
    },
    {
      "id": 4,
      "username": "ana",
      "password": "09876",
      "role": "editor",
      "fullName": "Ana Rodríguez"
    },
    {
      "id": 5,
      "username": "carlos",
      "password": "11223",
      "role": "viewer",
      "fullName": "Carlos López"
    }
  ]
}
```

## Uso del Sistema

### 1. Acceso al Panel de Administración

1. Abrir `admin.html` en el navegador
2. El sistema se inicializa automáticamente
3. Si hay una sesión activa, se muestra el dashboard
4. Si no hay sesión, se muestra el formulario de login

### 2. Proceso de Login

1. Ingresar el nombre de usuario (primer nombre)
2. Ingresar la cédula como contraseña
3. Opcional: Marcar "Recordar sesión"
4. Hacer clic en "Iniciar Sesión"

### 3. Navegación del Dashboard

- **Servicios**: Gestión de servicios ofrecidos
- **Tips**: Gestión de tips de cocina
- **Galería**: Gestión de imágenes
- **Mensajes**: Revisión de mensajes de contacto
- **Estadísticas**: Visualización de métricas
- **Configuración**: Ajustes del sistema

### 4. Logout

- Hacer clic en "Cerrar Sesión" en el header
- La sesión se cierra automáticamente
- Se redirige al formulario de login

## Funciones Globales Disponibles

### Verificación de Estado
```javascript
// Verificar si la aplicación está lista
window.isAdminReady()

// Verificar si el usuario está autenticado
window.isAuthenticated()

// Obtener usuario actual
window.getCurrentUser()
```

### Gestión de Sesión
```javascript
// Cerrar sesión
window.logout()

// Verificar rol
window.hasRole('admin')

// Verificar permisos
window.hasPermission('write')
```

## Seguridad Implementada

### 1. Validaciones de Entrada
- Longitud mínima de campos
- Sanitización de datos
- Prevención de inyección SQL

### 2. Gestión de Sesiones
- Timeout automático
- Almacenamiento seguro
- Limpieza de datos al logout

### 3. Control de Acceso
- Verificación de roles
- Sistema de permisos granular
- Protección de rutas

## Archivos del Sistema

### Archivos Principales
- `admin.html` - Página principal del panel
- `src/js/admin.js` - Aplicación principal
- `src/js/controllers/AuthController.js` - Controlador de autenticación
- `src/js/database/DatabaseManager.js` - Gestor de base de datos

### Archivos de Datos
- `src/data/users.json` - Datos de usuarios iniciales
- `src/styles/administration/admin.css` - Estilos del panel

### Archivos de Soporte
- `start_server.sh` - Script para iniciar servidor local
- `start_server.bat` - Script para Windows

## Configuración y Personalización

### 1. Agregar Nuevos Usuarios

Editar `src/data/users.json`:
```json
{
  "id": 6,
  "username": "nuevo_usuario",
  "password": "password123",
  "role": "editor",
  "fullName": "Nuevo Usuario",
  "email": "nuevo@saboresancestrales.com"
}
```

### 2. Modificar Roles y Permisos

Editar en `src/js/admin.js`:
```javascript
const rolePermissions = {
    'admin': ['read', 'write', 'delete', 'manage_users', 'manage_content'],
    'editor': ['read', 'write', 'manage_content'],
    'viewer': ['read'],
    'nuevo_rol': ['read', 'write'] // Agregar nuevo rol
};
```

### 3. Cambiar Timeout de Sesión

Editar en `src/js/controllers/AuthController.js`:
```javascript
this.sessionTimeout = 60 * 60 * 1000; // 1 hora en lugar de 30 minutos
```

## Solución de Problemas

### 1. Error de Inicialización
- Verificar que todos los archivos estén presentes
- Revisar la consola del navegador
- Asegurar que el servidor esté ejecutándose

### 2. Problemas de Login
- Verificar credenciales en `users.json`
- Revisar que la base de datos se haya inicializado
- Comprobar que los archivos JSON se carguen correctamente

### 3. Problemas de Sesión
- Limpiar localStorage/sessionStorage
- Verificar configuración de cookies del navegador
- Revisar timeout de sesión

## Consideraciones Técnicas

### 1. Rendimiento
- Base de datos SQL.js en memoria
- Carga asíncrona de datos
- Optimización de consultas

### 2. Compatibilidad
- Navegadores modernos (ES6+)
- Soporte para móviles
- Responsive design

### 3. Escalabilidad
- Arquitectura modular
- Separación de responsabilidades
- Fácil extensión de funcionalidades

## Próximas Mejoras

### 1. Seguridad
- Encriptación de contraseñas
- Autenticación de dos factores
- Logs de auditoría

### 2. Funcionalidades
- Recuperación de contraseña
- Registro de usuarios
- Perfiles de usuario

### 3. UX/UI
- Animaciones de transición
- Temas personalizables
- Notificaciones push

---

**Nota**: Este sistema está diseñado para uso interno y de desarrollo. Para producción, se recomienda implementar medidas de seguridad adicionales como HTTPS, encriptación de contraseñas y validación del lado del servidor. 