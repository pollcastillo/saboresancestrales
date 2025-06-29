/**
 * Modelo para gestionar los servicios del sitio web
 */
export class ServiceModel {
    constructor() {
        this.services = [];
        this.loadServices();
    }

    /**
     * Carga los servicios desde el archivo JSON
     */
    async loadServices() {
        try {
            const response = await fetch('src/data/services.json');
            const data = await response.json();
            this.services = data.services || [];
        } catch (error) {
            console.error('Error cargando servicios:', error);
            this.services = this.getDefaultServices();
        }
    }

    /**
     * Obtiene servicios por defecto si no se puede cargar el archivo
     */
    getDefaultServices() {
        return [
            {
                id: 1,
                title: "Catering Empresarial",
                description: "Servicios de catering especializados para empresas y eventos corporativos",
                icon: "bi-cup-hot-fill",
                category: "catering",
                active: true,
                featured: true,
                order: 1
            },
            {
                id: 2,
                title: "Eventos Especiales",
                description: "Catering para bodas, cumpleaños y celebraciones especiales",
                icon: "bi-calendar-event-fill",
                category: "eventos",
                active: true,
                featured: true,
                order: 2
            },
            {
                id: 3,
                title: "Menús Personalizados",
                description: "Creación de menús adaptados a tus necesidades específicas",
                icon: "bi-clipboard-data-fill",
                category: "menus",
                active: true,
                featured: false,
                order: 3
            }
        ];
    }

    /**
     * Obtiene todos los servicios
     * @returns {Array} - Lista de servicios
     */
    getAllServices() {
        return this.services;
    }

    /**
     * Obtiene servicios activos
     * @returns {Array} - Lista de servicios activos
     */
    getActiveServices() {
        return this.services.filter(service => service.active);
    }

    /**
     * Obtiene servicios destacados
     * @returns {Array} - Lista de servicios destacados
     */
    getFeaturedServices() {
        return this.services.filter(service => service.featured && service.active);
    }

    /**
     * Obtiene un servicio por ID
     * @param {number} id - ID del servicio
     * @returns {Object|null} - Servicio encontrado o null
     */
    getServiceById(id) {
        return this.services.find(service => service.id === id) || null;
    }

    /**
     * Crea un nuevo servicio
     * @param {Object} serviceData - Datos del servicio
     * @returns {Object} - Servicio creado
     */
    createService(serviceData) {
        const newService = {
            id: this.getNextId(),
            ...serviceData,
            active: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.services.push(newService);
        this.saveServices();
        return newService;
    }

    /**
     * Actualiza un servicio existente
     * @param {number} id - ID del servicio
     * @param {Object} serviceData - Datos actualizados
     * @returns {Object|null} - Servicio actualizado o null
     */
    updateService(id, serviceData) {
        const serviceIndex = this.services.findIndex(service => service.id === id);

        if (serviceIndex === -1) return null;

        this.services[serviceIndex] = {
            ...this.services[serviceIndex],
            ...serviceData,
            updatedAt: new Date().toISOString()
        };

        this.saveServices();
        return this.services[serviceIndex];
    }

    /**
     * Elimina un servicio (cambia estado a inactivo)
     * @param {number} id - ID del servicio
     * @returns {boolean} - True si se eliminó correctamente
     */
    deleteService(id) {
        const service = this.getServiceById(id);
        if (!service) return false;

        service.active = false;
        service.updatedAt = new Date().toISOString();
        this.saveServices();
        return true;
    }

    /**
     * Restaura un servicio eliminado
     * @param {number} id - ID del servicio
     * @returns {boolean} - True si se restauró correctamente
     */
    restoreService(id) {
        const service = this.getServiceById(id);
        if (!service) return false;

        service.active = true;
        service.updatedAt = new Date().toISOString();
        this.saveServices();
        return true;
    }

    /**
     * Cambia el orden de los servicios
     * @param {Array} serviceIds - Array de IDs en el nuevo orden
     * @returns {boolean} - True si se actualizó correctamente
     */
    reorderServices(serviceIds) {
        serviceIds.forEach((id, index) => {
            const service = this.getServiceById(id);
            if (service) {
                service.order = index + 1;
            }
        });

        this.saveServices();
        return true;
    }

    /**
     * Obtiene el siguiente ID disponible
     * @returns {number} - Siguiente ID
     */
    getNextId() {
        const maxId = Math.max(...this.services.map(service => service.id), 0);
        return maxId + 1;
    }

    /**
     * Guarda los servicios en localStorage (simulación de base de datos)
     */
    saveServices() {
        try {
            localStorage.setItem('adminServices', JSON.stringify(this.services));
        } catch (error) {
            console.error('Error guardando servicios:', error);
        }
    }

    /**
     * Carga servicios desde localStorage
     */
    loadFromStorage() {
        try {
            const stored = localStorage.getItem('adminServices');
            if (stored) {
                this.services = JSON.parse(stored);
            }
        } catch (error) {
            console.error('Error cargando servicios desde storage:', error);
        }
    }

    /**
     * Exporta los servicios a JSON
     * @returns {string} - JSON string de los servicios
     */
    exportServices() {
        return JSON.stringify({
            services: this.services,
            exportedAt: new Date().toISOString()
        }, null, 2);
    }

    /**
     * Importa servicios desde JSON
     * @param {string} jsonData - JSON string con los servicios
     * @returns {boolean} - True si se importó correctamente
     */
    importServices(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            if (data.services && Array.isArray(data.services)) {
                this.services = data.services;
                this.saveServices();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error importando servicios:', error);
            return false;
        }
    }
} 