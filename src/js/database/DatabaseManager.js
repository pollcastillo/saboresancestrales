/**
 * DatabaseManager.js
 * Gestor de datos simplificado para Sabores Ancestrales
 * Usa localStorage directamente para persistencia
 */

class DatabaseManager {
    constructor() {
        this.isInitialized = false;
        this.storageKeys = {
            services: 'sabores_services',
            categories: 'sabores_categories',
            tips: 'sabores_tips',
            tipCategories: 'sabores_tip_categories',
            gallery: 'sabores_gallery',
            galleryCategories: 'sabores_gallery_categories',
            users: 'sabores_users',
            messages: 'sabores_messages'
        };
    }

    /**
     * Inicializa el gestor de datos
     */
    async initialize() {
        try {
            // Cargar datos iniciales si no existen
            await this.loadInitialData();

            this.isInitialized = true;
            console.log('✅ Gestor de datos inicializado correctamente');

        } catch (error) {
            console.error('❌ Error al inicializar el gestor de datos:', error);
            throw error;
        }
    }

    /**
     * Carga datos iniciales desde los archivos JSON
     */
    async loadInitialData() {
        try {
            // Cargar servicios solo si no existen
            if (!this.getServices().length) {
                const servicesResponse = await fetch('src/data/services.json');
                const servicesData = await servicesResponse.json();

                // Guardar categorías
                this.saveToStorage(this.storageKeys.categories, servicesData.categories);

                // Guardar servicios
                this.saveToStorage(this.storageKeys.services, servicesData.services);
                console.log('✅ Servicios iniciales cargados');
            }

            // Cargar tips solo si no existen
            if (!this.getCookingTips().length) {
                const tipsResponse = await fetch('src/data/cooking-tips.json');
                const tipsData = await tipsResponse.json();

                // Guardar categorías de tips
                this.saveToStorage(this.storageKeys.tipCategories, tipsData.categories);

                // Guardar tips
                this.saveToStorage(this.storageKeys.tips, tipsData.tips);
                console.log('✅ Tips iniciales cargados');
            }

            // Cargar galería solo si no existe
            if (!this.getGalleryImages().length) {
                const galleryResponse = await fetch('src/data/gallery.json');
                const galleryData = await galleryResponse.json();

                // Guardar categorías de galería
                this.saveToStorage(this.storageKeys.galleryCategories, galleryData.categories);

                // Guardar imágenes
                this.saveToStorage(this.storageKeys.gallery, galleryData.images);
                console.log('✅ Galería inicial cargada');
            }

            // Cargar usuarios solo si no existen
            if (!this.getUsers().length) {
                const usersResponse = await fetch('src/data/users.json');
                const usersData = await usersResponse.json();
                this.saveToStorage(this.storageKeys.users, usersData.users);
                console.log('✅ Usuarios iniciales cargados');
            }

        } catch (error) {
            console.error('❌ Error cargando datos iniciales:', error);
            throw error;
        }
    }

    // ===== MÉTODOS UTILITARIOS =====

    /**
     * Guarda datos en localStorage
     */
    saveToStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error('❌ Error guardando en localStorage:', error);
        }
    }

    /**
     * Carga datos desde localStorage
     */
    loadFromStorage(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('❌ Error cargando desde localStorage:', error);
            return [];
        }
    }

    /**
     * Limpia todos los datos
     */
    clearAllData() {
        Object.values(this.storageKeys).forEach(key => {
            localStorage.removeItem(key);
        });
        console.log('🗑️ Todos los datos eliminados');
    }

    // ===== MÉTODOS PARA SERVICIOS =====

    /**
     * Inserta o actualiza un servicio
     */
    insertService(service) {
        const services = this.getServices();

        if (service.id) {
            // Actualizar servicio existente
            const index = services.findIndex(s => s.id === service.id);
            if (index !== -1) {
                services[index] = { ...services[index], ...service, updatedAt: new Date().toISOString() };
            } else {
                services.push({ ...service, updatedAt: new Date().toISOString() });
            }
        } else {
            // Crear nuevo servicio
            const newId = Math.max(...services.map(s => s.id), 0) + 1;
            services.push({
                ...service,
                id: newId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
        }

        this.saveToStorage(this.storageKeys.services, services);
        return service;
    }

    /**
     * Obtiene todos los servicios
     */
    getServices() {
        const services = this.loadFromStorage(this.storageKeys.services);
        const categories = this.loadFromStorage(this.storageKeys.categories);

        return services.map(service => {
            const category = categories.find(cat => cat.id === service.category);
            return {
                ...service,
                category_name: category?.name || service.category,
                category_color: category?.color || '#D46528'
            };
        }).filter(service => service.active !== false);
    }

    /**
     * Obtiene servicios destacados
     */
    getFeaturedServices() {
        return this.getServices().filter(service => service.featured);
    }

    /**
     * Obtiene categorías de servicios
     */
    getServiceCategories() {
        return this.loadFromStorage(this.storageKeys.categories);
    }

    /**
     * Elimina un servicio
     */
    deleteService(serviceId) {
        const services = this.getServices();
        const filteredServices = services.filter(service => service.id !== serviceId);
        this.saveToStorage(this.storageKeys.services, filteredServices);
        return true;
    }

    /**
     * Actualiza un servicio
     */
    updateService(serviceId, serviceData) {
        const services = this.getServices();
        const index = services.findIndex(s => s.id === serviceId);

        if (index !== -1) {
            services[index] = {
                ...services[index],
                ...serviceData,
                id: serviceId,
                updatedAt: new Date().toISOString()
            };
            this.saveToStorage(this.storageKeys.services, services);
            return true;
        }
        return false;
    }

    // ===== MÉTODOS PARA TIPS =====

    /**
     * Inserta o actualiza un tip
     */
    insertCookingTip(tip) {
        const tips = this.getCookingTips();

        if (tip.id) {
            const index = tips.findIndex(t => t.id === tip.id);
            if (index !== -1) {
                tips[index] = { ...tips[index], ...tip };
            } else {
                tips.push(tip);
            }
        } else {
            const newId = Math.max(...tips.map(t => t.id), 0) + 1;
            tips.push({ ...tip, id: newId });
        }

        this.saveToStorage(this.storageKeys.tips, tips);
        return tip;
    }

    /**
     * Obtiene todos los tips
     */
    getCookingTips() {
        const tips = this.loadFromStorage(this.storageKeys.tips);
        const categories = this.loadFromStorage(this.storageKeys.tipCategories);

        return tips.map(tip => {
            const category = categories.find(cat => cat.id === tip.category);
            return {
                ...tip,
                category_name: category?.name || tip.category,
                category_color: category?.color || '#D46528'
            };
        });
    }

    /**
     * Obtiene tips por categoría
     */
    getCookingTipsByCategory(category) {
        return this.getCookingTips().filter(tip => tip.category === category);
    }

    /**
     * Obtiene categorías de tips
     */
    getTipCategories() {
        return this.loadFromStorage(this.storageKeys.tipCategories);
    }

    // ===== MÉTODOS PARA GALERÍA =====

    /**
     * Inserta o actualiza una imagen
     */
    insertGalleryImage(image) {
        const images = this.getGalleryImages();

        if (image.id) {
            const index = images.findIndex(img => img.id === image.id);
            if (index !== -1) {
                images[index] = { ...images[index], ...image, updatedAt: new Date().toISOString() };
            } else {
                images.push({ ...image, updatedAt: new Date().toISOString() });
            }
        } else {
            const newId = Math.max(...images.map(img => img.id), 0) + 1;
            images.push({
                ...image,
                id: newId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
        }

        this.saveToStorage(this.storageKeys.gallery, images);
        return image;
    }

    /**
     * Obtiene todas las imágenes
     */
    getGalleryImages() {
        const images = this.loadFromStorage(this.storageKeys.gallery);
        const categories = this.loadFromStorage(this.storageKeys.galleryCategories);

        return images.map(image => {
            const category = categories.find(cat => cat.id === image.category);
            return {
                ...image,
                category_name: category?.name || image.category,
                category_color: category?.color || '#D46528'
            };
        }).filter(image => image.active !== false);
    }

    /**
     * Obtiene imágenes destacadas
     */
    getFeaturedGalleryImages() {
        return this.getGalleryImages().filter(image => image.featured);
    }

    /**
     * Obtiene categorías de galería
     */
    getGalleryCategories() {
        return this.loadFromStorage(this.storageKeys.galleryCategories);
    }

    // ===== MÉTODOS PARA USUARIOS =====

    /**
     * Inserta un usuario
     */
    insertUser(user) {
        const users = this.getUsers();
        const index = users.findIndex(u => u.id === user.id);

        if (index !== -1) {
            users[index] = user;
        } else {
            users.push(user);
        }

        this.saveToStorage(this.storageKeys.users, users);
        return user;
    }

    /**
     * Obtiene todos los usuarios
     */
    getUsers() {
        return this.loadFromStorage(this.storageKeys.users);
    }

    /**
     * Verifica credenciales de usuario
     */
    authenticateUser(username, password) {
        const users = this.getUsers();
        return users.find(user =>
            user.username === username &&
            user.cedula === password &&
            user.active !== false
        ) || null;
    }

    // ===== MÉTODOS PARA MENSAJES =====

    /**
     * Inserta un mensaje
     */
    insertMessage(message) {
        const messages = this.getMessages();
        const newId = Math.max(...messages.map(m => m.id), 0) + 1;
        const newMessage = {
            ...message,
            id: newId,
            created_at: new Date().toISOString(),
            read: false,
            replied: false
        };

        messages.unshift(newMessage); // Agregar al inicio
        this.saveToStorage(this.storageKeys.messages, messages);
        return newMessage;
    }

    /**
     * Obtiene todos los mensajes
     */
    getMessages() {
        return this.loadFromStorage(this.storageKeys.messages);
    }

    /**
     * Marca un mensaje como leído
     */
    markMessageAsRead(messageId) {
        const messages = this.getMessages();
        const index = messages.findIndex(m => m.id === messageId);

        if (index !== -1) {
            messages[index].read = true;
            this.saveToStorage(this.storageKeys.messages, messages);
            return true;
        }
        return false;
    }

    /**
     * Marca un mensaje como respondido
     */
    markMessageAsReplied(messageId) {
        const messages = this.getMessages();
        const index = messages.findIndex(m => m.id === messageId);

        if (index !== -1) {
            messages[index].replied = true;
            this.saveToStorage(this.storageKeys.messages, messages);
            return true;
        }
        return false;
    }

    // ===== MÉTODOS DE EXPORTACIÓN/IMPORTACIÓN =====

    /**
     * Exporta todos los datos como JSON
     */
    exportDatabase() {
        const data = {
            services: this.getServices(),
            categories: this.getServiceCategories(),
            tips: this.getCookingTips(),
            tipCategories: this.getTipCategories(),
            gallery: this.getGalleryImages(),
            galleryCategories: this.getGalleryCategories(),
            users: this.getUsers(),
            messages: this.getMessages(),
            exportedAt: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sabores-ancestrales-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    /**
     * Importa datos desde archivo JSON
     */
    async importDatabase(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);

                    // Importar cada tipo de dato
                    if (data.services) this.saveToStorage(this.storageKeys.services, data.services);
                    if (data.categories) this.saveToStorage(this.storageKeys.categories, data.categories);
                    if (data.tips) this.saveToStorage(this.storageKeys.tips, data.tips);
                    if (data.tipCategories) this.saveToStorage(this.storageKeys.tipCategories, data.tipCategories);
                    if (data.gallery) this.saveToStorage(this.storageKeys.gallery, data.gallery);
                    if (data.galleryCategories) this.saveToStorage(this.storageKeys.galleryCategories, data.galleryCategories);
                    if (data.users) this.saveToStorage(this.storageKeys.users, data.users);
                    if (data.messages) this.saveToStorage(this.storageKeys.messages, data.messages);

                    resolve(true);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }

    /**
     * Reinicia la base de datos con datos iniciales
     */
    async resetDatabase() {
        try {
            // Limpiar todos los datos
            this.clearAllData();

            // Cargar datos iniciales
            await this.loadInitialData();

            console.log('🔄 Base de datos reiniciada correctamente');
            return true;
        } catch (error) {
            console.error('❌ Error reiniciando base de datos:', error);
            throw error;
        }
    }

    /**
     * Cierra el gestor de datos
     */
    close() {
        this.isInitialized = false;
    }
}

// Exportar la clase
window.DatabaseManager = DatabaseManager; 