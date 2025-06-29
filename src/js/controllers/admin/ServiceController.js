/**
 * Controlador para gestionar los servicios en el panel de administración
 */
export class ServiceController {
    constructor(serviceModel) {
        this.serviceModel = serviceModel;
        this.currentView = 'list';
        this.editingService = null;
        this.init();
    }

    /**
     * Inicializa el controlador
     */
    init() {
        this.bindEvents();
        this.loadServices();
    }

    /**
     * Vincula los eventos del DOM
     */
    bindEvents() {
        // Botones del dashboard
        const editServicesBtn = document.querySelector('[data-action="edit-services"]');
        if (editServicesBtn) {
            editServicesBtn.addEventListener('click', () => this.showServiceManager());
        }

        // Eventos delegados para el modal de servicios
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-action="add-service"]')) {
                this.showServiceForm();
            }
            if (e.target.matches('[data-action="edit-service"]')) {
                const serviceId = parseInt(e.target.dataset.id);
                this.editService(serviceId);
            }
            if (e.target.matches('[data-action="delete-service"]')) {
                const serviceId = parseInt(e.target.dataset.id);
                this.deleteService(serviceId);
            }
            if (e.target.matches('[data-action="restore-service"]')) {
                const serviceId = parseInt(e.target.dataset.id);
                this.restoreService(serviceId);
            }
            if (e.target.matches('[data-action="toggle-featured"]')) {
                const serviceId = parseInt(e.target.dataset.id);
                this.toggleFeatured(serviceId);
            }
            if (e.target.matches('[data-action="close-modal"]')) {
                this.closeModal();
            }
        });

        // Formulario de servicio
        document.addEventListener('submit', (e) => {
            if (e.target.matches('#serviceForm')) {
                e.preventDefault();
                this.saveService(e.target);
            }
        });
    }

    /**
     * Carga y muestra los servicios
     */
    async loadServices() {
        await this.serviceModel.loadServices();
        this.renderServiceList();
    }

    /**
     * Muestra el gestor de servicios
     */
    showServiceManager() {
        this.currentView = 'list';
        this.renderServiceManager();
    }

    /**
     * Renderiza el gestor de servicios
     */
    renderServiceManager() {
        const dashboardContent = document.querySelector('.dashboard-content');
        if (!dashboardContent) return;

        dashboardContent.innerHTML = `
            <div class="service-manager">
                <div class="manager-header">
                    <h2>Gestión de Servicios</h2>
                    <div class="manager-actions">
                        <button class="btn btn-primary" data-action="add-service">
                            <i class="bi bi-plus-circle"></i>
                            Nuevo Servicio
                        </button>
                        <button class="btn btn-secondary" data-action="export-services">
                            <i class="bi bi-download"></i>
                            Exportar
                        </button>
                        <button class="btn btn-secondary" data-action="import-services">
                            <i class="bi bi-upload"></i>
                            Importar
                        </button>
                    </div>
                </div>
                
                <div class="service-filters">
                    <button class="filter-btn active" data-filter="all">Todos</button>
                    <button class="filter-btn" data-filter="active">Activos</button>
                    <button class="filter-btn" data-filter="inactive">Inactivos</button>
                    <button class="filter-btn" data-filter="featured">Destacados</button>
                </div>
                
                <div class="service-list" id="serviceList">
                    ${this.renderServiceList()}
                </div>
            </div>
        `;

        this.bindFilterEvents();
    }

    /**
     * Renderiza la lista de servicios
     */
    renderServiceList(filter = 'all') {
        let services = this.serviceModel.getAllServices();

        // Aplicar filtros
        switch (filter) {
            case 'active':
                services = services.filter(s => s.active);
                break;
            case 'inactive':
                services = services.filter(s => !s.active);
                break;
            case 'featured':
                services = services.filter(s => s.featured && s.active);
                break;
        }

        if (services.length === 0) {
            return `
                <div class="empty-state">
                    <i class="bi bi-inbox"></i>
                    <h3>No hay servicios</h3>
                    <p>${filter === 'all' ? 'Crea tu primer servicio para comenzar.' : 'No hay servicios con este filtro.'}</p>
                </div>
            `;
        }

        return services.map(service => `
            <div class="service-card ${!service.active ? 'inactive' : ''}" data-id="${service.id}">
                <div class="service-card-header">
                    <div class="service-icon">
                        <i class="bi ${service.icon}"></i>
                    </div>
                    <div class="service-status">
                        ${service.active ?
                '<span class="status-badge active">Activo</span>' :
                '<span class="status-badge inactive">Inactivo</span>'
            }
                        ${service.featured ?
                '<span class="status-badge featured">Destacado</span>' : ''
            }
                    </div>
                </div>
                
                <div class="service-card-content">
                    <h3 class="service-title">${service.title}</h3>
                    <p class="service-description">${this.truncateText(service.description, 64)}</p>
                    <div class="service-meta">
                        <span class="service-category">${service.category}</span>
                        <span class="service-order">Orden: ${service.order}</span>
                    </div>
                </div>
                
                <div class="service-card-actions">
                    <button class="btn btn-sm btn-primary" data-action="edit-service" data-id="${service.id}">
                        <i class="bi bi-pencil"></i>
                        Editar
                    </button>
                    ${service.active ?
                `<button class="btn btn-sm btn-warning" data-action="delete-service" data-id="${service.id}">
                            <i class="bi bi-trash"></i>
                            Eliminar
                        </button>` :
                `<button class="btn btn-sm btn-success" data-action="restore-service" data-id="${service.id}">
                            <i class="bi bi-arrow-clockwise"></i>
                            Restaurar
                        </button>`
            }
                    <button class="btn btn-sm ${service.featured ? 'btn-secondary' : 'btn-outline'}" 
                            data-action="toggle-featured" data-id="${service.id}">
                        <i class="bi bi-star${service.featured ? '-fill' : ''}"></i>
                        ${service.featured ? 'Quitar' : 'Destacar'}
                    </button>
                </div>
            </div>
        `).join('');
    }

    /**
     * Vincula eventos de filtros
     */
    bindFilterEvents() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Remover clase active de todos los botones
                filterBtns.forEach(b => b.classList.remove('active'));
                // Añadir clase active al botón clickeado
                e.target.classList.add('active');

                const filter = e.target.dataset.filter;
                const serviceList = document.getElementById('serviceList');
                if (serviceList) {
                    serviceList.innerHTML = this.renderServiceList(filter);
                }
            });
        });
    }

    /**
     * Muestra el formulario de servicio
     */
    showServiceForm(service = null) {
        this.editingService = service;
        this.renderServiceForm(service);
    }

    /**
     * Renderiza el formulario de servicio
     */
    renderServiceForm(service = null) {
        const isEditing = service !== null;

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3>${isEditing ? 'Editar Servicio' : 'Nuevo Servicio'}</h3>
                    <button class="btn btn-icon" data-action="close-modal">
                        <i class="bi bi-x-lg"></i>
                    </button>
                </div>
                
                <form id="serviceForm" class="modal-content">
                    <div class="form-group">
                        <label for="serviceTitle">Título</label>
                        <input type="text" id="serviceTitle" name="title" 
                               value="${service?.title || ''}" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="serviceDescription">Descripción</label>
                        <textarea id="serviceDescription" name="description" rows="3" required>${service?.description || ''}</textarea>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="serviceIcon">Icono</label>
                            <select id="serviceIcon" name="icon" required>
                                <option value="">Seleccionar icono</option>
                                <option value="bi-cup-hot-fill" ${service?.icon === 'bi-cup-hot-fill' ? 'selected' : ''}>Copa</option>
                                <option value="bi-calendar-event-fill" ${service?.icon === 'bi-calendar-event-fill' ? 'selected' : ''}>Calendario</option>
                                <option value="bi-clipboard-data-fill" ${service?.icon === 'bi-clipboard-data-fill' ? 'selected' : ''}>Clipboard</option>
                                <option value="bi-people-fill" ${service?.icon === 'bi-people-fill' ? 'selected' : ''}>Personas</option>
                                <option value="bi-gear-fill" ${service?.icon === 'bi-gear-fill' ? 'selected' : ''}>Configuración</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="serviceCategory">Categoría</label>
                            <input type="text" id="serviceCategory" name="category" 
                                   value="${service?.category || ''}" required>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="serviceOrder">Orden</label>
                            <input type="number" id="serviceOrder" name="order" 
                                   value="${service?.order || 1}" min="1" required>
                        </div>
                        
                        <div class="form-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="serviceFeatured" name="featured" 
                                       ${service?.featured ? 'checked' : ''}>
                                <span class="checkmark"></span>
                                Servicio destacado
                            </label>
                        </div>
                    </div>
                    
                    <div class="modal-actions">
                        <button type="button" class="btn btn-secondary" data-action="close-modal">
                            Cancelar
                        </button>
                        <button type="submit" class="btn btn-primary">
                            <i class="bi bi-check-lg"></i>
                            ${isEditing ? 'Actualizar' : 'Crear'}
                        </button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);
        this.bindModalEvents(modal);
    }

    /**
     * Vincula eventos del modal
     */
    bindModalEvents(modal) {
        const closeBtn = modal.querySelector('[data-action="close-modal"]');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal());
        }

        // Cerrar modal al hacer clic fuera
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });
    }

    /**
     * Guarda un servicio
     */
    async saveService(form) {
        const formData = new FormData(form);
        const serviceData = {
            title: formData.get('title'),
            description: formData.get('description'),
            icon: formData.get('icon'),
            category: formData.get('category'),
            order: parseInt(formData.get('order')),
            featured: formData.get('featured') === 'on'
        };

        try {
            if (this.editingService) {
                // Actualizar servicio existente
                const updated = this.serviceModel.updateService(this.editingService.id, serviceData);
                if (updated) {
                    this.showSuccess('Servicio actualizado correctamente');
                } else {
                    this.showError('Error al actualizar el servicio');
                }
            } else {
                // Crear nuevo servicio
                const created = this.serviceModel.createService(serviceData);
                if (created) {
                    this.showSuccess('Servicio creado correctamente');
                } else {
                    this.showError('Error al crear el servicio');
                }
            }

            this.closeModal();
            this.renderServiceList();
        } catch (error) {
            console.error('Error guardando servicio:', error);
            this.showError('Error al guardar el servicio');
        }
    }

    /**
     * Edita un servicio
     */
    editService(serviceId) {
        const service = this.serviceModel.getServiceById(serviceId);
        if (service) {
            this.showServiceForm(service);
        }
    }

    /**
     * Elimina un servicio
     */
    deleteService(serviceId) {
        if (confirm('¿Estás seguro de que quieres eliminar este servicio?')) {
            const deleted = this.serviceModel.deleteService(serviceId);
            if (deleted) {
                this.showSuccess('Servicio eliminado correctamente');
                this.renderServiceList();
            } else {
                this.showError('Error al eliminar el servicio');
            }
        }
    }

    /**
     * Restaura un servicio
     */
    restoreService(serviceId) {
        const restored = this.serviceModel.restoreService(serviceId);
        if (restored) {
            this.showSuccess('Servicio restaurado correctamente');
            this.renderServiceList();
        } else {
            this.showError('Error al restaurar el servicio');
        }
    }

    /**
     * Cambia el estado destacado de un servicio
     */
    toggleFeatured(serviceId) {
        const service = this.serviceModel.getServiceById(serviceId);
        if (service) {
            const updated = this.serviceModel.updateService(serviceId, {
                featured: !service.featured
            });
            if (updated) {
                this.showSuccess(`Servicio ${updated.featured ? 'destacado' : 'quedó destacado'} correctamente`);
                this.renderServiceList();
            } else {
                this.showError('Error al cambiar el estado del servicio');
            }
        }
    }

    /**
     * Cierra el modal
     */
    closeModal() {
        const modal = document.querySelector('.modal-overlay');
        if (modal) {
            modal.remove();
        }
        this.editingService = null;
    }

    /**
     * Muestra mensaje de éxito
     */
    showSuccess(message) {
        // Implementar notificación de éxito
        console.log('✅', message);
    }

    /**
     * Muestra mensaje de error
     */
    showError(message) {
        // Implementar notificación de error
        console.error('❌', message);
    }

    /**
     * Trunca el texto a un número máximo de caracteres
     */
    truncateText(text, maxLength) {
        if (text.length > maxLength) {
            return text.slice(0, maxLength) + '...';
        }
        return text;
    }
} 