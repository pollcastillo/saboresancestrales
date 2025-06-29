/**
 * example.js
 * Ejemplos de uso de la base de datos SQL.js en Sabores Ancestrales
 * Este archivo muestra cómo usar las diferentes funcionalidades
 */

// ===== EJEMPLO 1: INICIALIZACIÓN BÁSICA =====

async function ejemploInicializacion() {
    console.log('🔄 Ejemplo 1: Inicialización básica');

    try {
        // Crear instancia del gestor de base de datos
        const dbManager = new DatabaseManager();

        // Inicializar la base de datos
        await dbManager.initialize();

        // Crear adaptador para compatibilidad
        const adapter = new DataAdapter(dbManager);

        console.log('✅ Base de datos inicializada correctamente');
        return { dbManager, adapter };

    } catch (error) {
        console.error('❌ Error en inicialización:', error);
        return null;
    }
}

// ===== EJEMPLO 2: OPERACIONES CON SERVICIOS =====

async function ejemploServicios() {
    console.log('🔄 Ejemplo 2: Operaciones con servicios');

    const { dbManager, adapter } = await ejemploInicializacion();
    if (!dbManager) return;

    try {
        // Obtener todos los servicios
        const servicios = await adapter.getServices();
        console.log('📋 Servicios disponibles:', servicios.services.length);

        // Obtener servicios destacados
        const destacados = await adapter.getFeaturedServices();
        console.log('⭐ Servicios destacados:', destacados.length);

        // Insertar un nuevo servicio
        const nuevoServicio = {
            title: "Servicio de Ejemplo",
            description: "Este es un servicio de ejemplo",
            icon: "ph-fill ph-star",
            category: "catering",
            badge: "Nuevo",
            active: true,
            featured: false,
            order: 999
        };

        dbManager.insertService(nuevoServicio);
        console.log('✅ Nuevo servicio insertado');

        // Obtener servicios actualizados
        const serviciosActualizados = await adapter.getServices();
        console.log('📋 Total de servicios:', serviciosActualizados.services.length);

    } catch (error) {
        console.error('❌ Error con servicios:', error);
    }
}

// ===== EJEMPLO 3: OPERACIONES CON TIPS =====

async function ejemploTips() {
    console.log('🔄 Ejemplo 3: Operaciones con tips');

    const { dbManager, adapter } = await ejemploInicializacion();
    if (!dbManager) return;

    try {
        // Obtener todos los tips
        const tips = await adapter.getCookingTips();
        console.log('📋 Tips disponibles:', tips.tips.length);

        // Obtener tips por categoría
        const tipsConservacion = await adapter.getCookingTipsByCategory('conservacion');
        console.log('🥬 Tips de conservación:', tipsConservacion.length);

        // Insertar un nuevo tip
        const nuevoTip = {
            title: "Tip de Ejemplo",
            description: "Este es un tip de ejemplo para demostrar la funcionalidad",
            category: "tecnicas",
            icon: "ph-fill ph-lightbulb",
            difficulty: "fácil",
            time: "10 min"
        };

        dbManager.insertCookingTip(nuevoTip);
        console.log('✅ Nuevo tip insertado');

    } catch (error) {
        console.error('❌ Error con tips:', error);
    }
}

// ===== EJEMPLO 4: OPERACIONES CON GALERÍA =====

async function ejemploGaleria() {
    console.log('🔄 Ejemplo 4: Operaciones con galería');

    const { dbManager, adapter } = await ejemploInicializacion();
    if (!dbManager) return;

    try {
        // Obtener todas las imágenes
        const galeria = await adapter.getGallery();
        console.log('📷 Imágenes en galería:', galeria.images.length);

        // Obtener imágenes destacadas
        const destacadas = await adapter.getFeaturedGalleryImages();
        console.log('⭐ Imágenes destacadas:', destacadas.length);

        // Insertar una nueva imagen
        const nuevaImagen = {
            title: "Imagen de Ejemplo",
            description: "Esta es una imagen de ejemplo",
            filename: "ejemplo.jpg",
            url: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400",
            category: "platos",
            active: true,
            featured: false,
            order: 999,
            alt: "Imagen de ejemplo",
            tags: ["ejemplo", "demo"]
        };

        dbManager.insertGalleryImage(nuevaImagen);
        console.log('✅ Nueva imagen insertada');

    } catch (error) {
        console.error('❌ Error con galería:', error);
    }
}

// ===== EJEMPLO 5: SISTEMA DE MENSAJES =====

async function ejemploMensajes() {
    console.log('🔄 Ejemplo 5: Sistema de mensajes');

    const { dbManager, adapter } = await ejemploInicializacion();
    if (!dbManager) return;

    try {
        // Obtener todos los mensajes
        const mensajes = await adapter.getMessages();
        console.log('📧 Mensajes existentes:', mensajes.length);

        // Insertar un nuevo mensaje
        const nuevoMensaje = {
            name: "Usuario Ejemplo",
            email: "usuario@ejemplo.com",
            phone: "123456789",
            message: "Este es un mensaje de ejemplo para probar la funcionalidad"
        };

        const mensajeId = await adapter.insertMessage(nuevoMensaje);
        console.log('✅ Nuevo mensaje insertado con ID:', mensajeId);

        // Marcar mensaje como leído
        await adapter.markMessageAsRead(mensajeId);
        console.log('✅ Mensaje marcado como leído');

        // Obtener mensajes actualizados
        const mensajesActualizados = await adapter.getMessages();
        console.log('📧 Total de mensajes:', mensajesActualizados.length);

    } catch (error) {
        console.error('❌ Error con mensajes:', error);
    }
}

// ===== EJEMPLO 6: ESTADÍSTICAS =====

async function ejemploEstadisticas() {
    console.log('🔄 Ejemplo 6: Estadísticas de la base de datos');

    const { dbManager, adapter } = await ejemploInicializacion();
    if (!dbManager) return;

    try {
        // Obtener estadísticas generales
        const stats = await adapter.getDatabaseStats();
        console.log('📊 Estadísticas de la base de datos:');
        console.log('   - Servicios:', stats.services);
        console.log('   - Tips:', stats.tips);
        console.log('   - Imágenes:', stats.images);
        console.log('   - Mensajes:', stats.messages);
        console.log('   - Total:', stats.total);

    } catch (error) {
        console.error('❌ Error obteniendo estadísticas:', error);
    }
}

// ===== EJEMPLO 7: CONSULTAS SQL PERSONALIZADAS =====

async function ejemploConsultasPersonalizadas() {
    console.log('🔄 Ejemplo 7: Consultas SQL personalizadas');

    const { dbManager, adapter } = await ejemploInicializacion();
    if (!dbManager) return;

    try {
        // Consulta personalizada: Servicios activos con sus categorías
        const serviciosActivos = dbManager.db.exec(`
            SELECT s.title, s.description, sc.name as categoria
            FROM services s
            LEFT JOIN service_categories sc ON s.category = sc.id
            WHERE s.active = 1
            ORDER BY s.order_index ASC
        `);

        console.log('📋 Servicios activos con categorías:');
        console.log(dbManager.formatResult(serviciosActivos));

        // Consulta personalizada: Tips por dificultad
        const tipsPorDificultad = dbManager.db.exec(`
            SELECT difficulty, COUNT(*) as cantidad
            FROM cooking_tips
            GROUP BY difficulty
            ORDER BY cantidad DESC
        `);

        console.log('📊 Tips por dificultad:');
        console.log(dbManager.formatResult(tipsPorDificultad));

        // Consulta personalizada: Mensajes no leídos
        const mensajesNoLeidos = dbManager.db.exec(`
            SELECT name, email, message, created_at
            FROM messages
            WHERE read = 0
            ORDER BY created_at DESC
        `);

        console.log('📧 Mensajes no leídos:');
        console.log(dbManager.formatResult(mensajesNoLeidos));

    } catch (error) {
        console.error('❌ Error en consultas personalizadas:', error);
    }
}

// ===== EJEMPLO 8: EXPORTACIÓN E IMPORTACIÓN =====

async function ejemploExportacionImportacion() {
    console.log('🔄 Ejemplo 8: Exportación e importación');

    const { dbManager, adapter } = await ejemploInicializacion();
    if (!dbManager) return;

    try {
        // Exportar base de datos
        console.log('📤 Exportando base de datos...');
        adapter.exportDatabase();
        console.log('✅ Base de datos exportada como "sabores-ancestrales.db"');

        // Nota: La importación requiere un archivo seleccionado por el usuario
        console.log('📥 Para importar, usa: adapter.importDatabase(archivo)');

    } catch (error) {
        console.error('❌ Error en exportación/importación:', error);
    }
}

// ===== EJEMPLO 9: AUTENTICACIÓN =====

async function ejemploAutenticacion() {
    console.log('🔄 Ejemplo 9: Sistema de autenticación');

    const { dbManager, adapter } = await ejemploInicializacion();
    if (!dbManager) return;

    try {
        // Insertar un usuario de prueba
        const usuarioPrueba = {
            username: "admin",
            password: "admin123",
            role: "admin"
        };

        dbManager.insertUser(usuarioPrueba);
        console.log('✅ Usuario de prueba insertado');

        // Autenticar usuario
        const usuarioAutenticado = await adapter.authenticateUser("admin", "admin123");

        if (usuarioAutenticado) {
            console.log('✅ Usuario autenticado correctamente');
            console.log('   - ID:', usuarioAutenticado.id);
            console.log('   - Usuario:', usuarioAutenticado.username);
            console.log('   - Rol:', usuarioAutenticado.role);
        } else {
            console.log('❌ Autenticación fallida');
        }

    } catch (error) {
        console.error('❌ Error en autenticación:', error);
    }
}

// ===== EJEMPLO 10: EJECUTAR TODOS LOS EJEMPLOS =====

async function ejecutarTodosLosEjemplos() {
    console.log('🚀 Ejecutando todos los ejemplos de SQL.js');
    console.log('==========================================');

    await ejemploInicializacion();
    console.log('');

    await ejemploServicios();
    console.log('');

    await ejemploTips();
    console.log('');

    await ejemploGaleria();
    console.log('');

    await ejemploMensajes();
    console.log('');

    await ejemploEstadisticas();
    console.log('');

    await ejemploConsultasPersonalizadas();
    console.log('');

    await ejemploExportacionImportacion();
    console.log('');

    await ejemploAutenticacion();
    console.log('');

    console.log('🎉 Todos los ejemplos completados');
}

// ===== FUNCIONES DE UTILIDAD =====

// Función para limpiar datos de prueba
async function limpiarDatosPrueba() {
    console.log('🧹 Limpiando datos de prueba...');

    const { dbManager } = await ejemploInicializacion();
    if (!dbManager) return;

    try {
        // Eliminar servicios de ejemplo
        dbManager.db.run("DELETE FROM services WHERE title LIKE '%Ejemplo%'");

        // Eliminar tips de ejemplo
        dbManager.db.run("DELETE FROM cooking_tips WHERE title LIKE '%Ejemplo%'");

        // Eliminar imágenes de ejemplo
        dbManager.db.run("DELETE FROM gallery WHERE title LIKE '%Ejemplo%'");

        // Eliminar mensajes de ejemplo
        dbManager.db.run("DELETE FROM messages WHERE name LIKE '%Ejemplo%'");

        // Eliminar usuarios de prueba
        dbManager.db.run("DELETE FROM users WHERE username = 'admin'");

        console.log('✅ Datos de prueba eliminados');

    } catch (error) {
        console.error('❌ Error limpiando datos:', error);
    }
}

// ===== EXPORTAR FUNCIONES =====

// Exportar funciones para uso global
window.ejemplosSQL = {
    ejecutarTodosLosEjemplos,
    ejemploInicializacion,
    ejemploServicios,
    ejemploTips,
    ejemploGaleria,
    ejemploMensajes,
    ejemploEstadisticas,
    ejemploConsultasPersonalizadas,
    ejemploExportacionImportacion,
    ejemploAutenticacion,
    limpiarDatosPrueba
};

console.log('📚 Ejemplos de SQL.js cargados. Usa: ejemplosSQL.ejecutarTodosLosEjemplos()'); 