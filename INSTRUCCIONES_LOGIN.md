# Instrucciones para Probar el Sistema de Login

## Servidor Local

El servidor está corriendo en el puerto **8001**. Para acceder al panel de administración:

1. Abre tu navegador
2. Ve a: `http://localhost:8001/admin.html`

## Credenciales de Prueba

### Usuario Administrador (Recomendado)
- **Usuario**: `admin`
- **Cédula**: `12345`
- **Rol**: Administrador
- **Permisos**: Acceso completo

### Otros Usuarios Disponibles

#### María González
- **Usuario**: `maria`
- **Cédula**: `54321`
- **Rol**: Administrador

#### Juan Pérez
- **Usuario**: `juan`
- **Cédula**: `67890`
- **Rol**: Editor

#### Ana Rodríguez
- **Usuario**: `ana`
- **Cédula**: `09876`
- **Rol**: Editor

#### Carlos López
- **Usuario**: `carlos`
- **Cédula**: `11223`
- **Rol**: Visualizador

## Pasos para el Login

1. **Abre la página**: `http://localhost:8001/admin.html`
2. **Ingresa las credenciales**:
   - Campo "Primer Nombre": `admin`
   - Campo "Cédula": `12345`
3. **Opcional**: Marca "Recordar sesión"
4. **Haz clic** en "Iniciar Sesión"

## Resultado Esperado

Si todo funciona correctamente:
- ✅ Aparecerá un mensaje de bienvenida
- ✅ Después de 1 segundo se mostrará el dashboard
- ✅ Verás el panel de administración completo
- ✅ El nombre del usuario aparecerá en el header

## Solución de Problemas

### Si aparece error de "DataAdapter no encontrado":
- ✅ **SOLUCIONADO**: Ya agregué el script DataAdapter.js al HTML

### Si el login no funciona:
1. **Limpia el caché**: `Ctrl+F5` (Windows) o `Cmd+Shift+R` (Mac)
2. **Verifica la consola**: F12 → Console para ver errores
3. **Asegúrate de usar exactamente** las credenciales como están escritas
4. **Verifica que el servidor esté corriendo** en el puerto 8001

### Si hay errores en la consola:
- Revisa que todos los archivos JavaScript se estén cargando correctamente
- Verifica que no haya errores de red (404, 500, etc.)

## Archivos Corregidos

✅ `src/data/users.json` - Estructura de datos corregida
✅ `src/js/database/DatabaseManager.js` - Tabla de usuarios actualizada
✅ `src/js/controllers/AuthController.js` - Soporte para UserModel
✅ `src/js/admin.js` - Inicialización simplificada
✅ `admin.html` - Scripts agregados correctamente

## Estado del Sistema

- 🔄 **Servidor**: Corriendo en puerto 8001
- ✅ **Base de datos**: SQL.js inicializada
- ✅ **Autenticación**: Sistema funcionando
- ✅ **Usuarios**: 5 usuarios de prueba disponibles
- ✅ **Scripts**: Todos los archivos JS cargados

¡El sistema debería funcionar correctamente ahora! 