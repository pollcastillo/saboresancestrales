# Credenciales de Prueba - Sistema de Login

## Acceso al Panel de Administración

Para acceder al panel de administración, abre `admin.html` en tu navegador.

## Usuarios de Prueba Disponibles

### 1. Administrador Principal
- **Usuario**: `admin`
- **Cédula**: `12345`
- **Rol**: Administrador
- **Permisos**: Acceso completo al sistema

### 2. María González
- **Usuario**: `maria`
- **Cédula**: `54321`
- **Rol**: Administrador
- **Permisos**: Acceso completo al sistema

### 3. Juan Pérez
- **Usuario**: `juan`
- **Cédula**: `67890`
- **Rol**: Editor
- **Permisos**: Puede crear y editar contenido

### 4. Ana Rodríguez
- **Usuario**: `ana`
- **Cédula**: `09876`
- **Rol**: Editor
- **Permisos**: Puede crear y editar contenido

### 5. Carlos López
- **Usuario**: `carlos`
- **Cédula**: `11223`
- **Rol**: Visualizador
- **Permisos**: Solo puede ver contenido

## Instrucciones de Uso

1. Abre `admin.html` en tu navegador
2. Ingresa el **primer nombre** del usuario en el campo "Primer Nombre"
3. Ingresa la **cédula** en el campo "Cédula"
4. Opcional: Marca "Recordar sesión" para mantener la sesión activa
5. Haz clic en "Iniciar Sesión"

## Solución de Problemas

### Si el login no funciona:

1. **Verifica las credenciales**: Asegúrate de usar exactamente el primer nombre (no apellido) y la cédula correcta
2. **Limpia el caché**: Presiona `Ctrl+F5` (Windows) o `Cmd+Shift+R` (Mac) para recargar sin caché
3. **Verifica la consola**: Abre las herramientas de desarrollador (F12) y revisa si hay errores en la consola
4. **Reinicia el servidor**: Si estás usando un servidor local, reinícialo

### Ejemplo de uso correcto:

Para el usuario "María González":
- **Campo "Primer Nombre"**: `maria`
- **Campo "Cédula"**: `54321`

## Notas Importantes

- El sistema distingue entre mayúsculas y minúsculas en el nombre de usuario
- La cédula debe ser exactamente como está en la base de datos
- Todos los usuarios están marcados como activos
- La sesión expira automáticamente después de 30 minutos de inactividad 