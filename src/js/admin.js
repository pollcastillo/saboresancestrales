/**
 * Sistema de Administración - Sabores Ancestrales
 * Archivo principal que inicializa y gestiona todos los módulos de administración
 */

// Variables globales
let currentUser = null;
let isAuthenticated = false;
let currentView = 'dashboard';
let currentTheme = 'light';
let databaseManager = null;

/**
 * Clase principal del sistema de administración
 */
class AdminSystem {
    constructor() {
        this.currentView = 'dashboard';
        this.isAuthenticated = false;
        this.currentUser = null;

        // Inicializar managers de paginación
        this.servicesPagination = new PaginationManager('servicesPagination', 10);
        this.tipsPagination = new PaginationManager('tipsPagination', 10);

        // Inicializar gestor de estadísticas
        this.statisticsManager = new StatisticsManager();

        // Inicializar AuthController para el login original
        this.authController = null;

        // Configurar callbacks de paginación
        this.servicesPagination.onPageChange = (data) => this.renderServicesTable(data);
        this.tipsPagination.onPageChange = (data) => this.renderTipsTable(data);

        this.init();
    }

    /**
     * Inicializa el sistema
     */
    async init() {
        try {
            // Inicializar base de datos
            await this.initDatabase();

            // Inicializar AuthController para el login original
            await this.initAuthController();

            // Verificar si el usuario está autenticado
            this.checkAuthStatus();

            // Inicializar la vista correspondiente
            if (this.isAuthenticated) {
                this.showDashboard();
            } else {
                this.showLogin();
            }

            // Vincular eventos globales
            this.bindGlobalEvents();

            // Inicializar contador de caracteres
            this.initCharacterCounter();

            console.log('✅ Sistema de administración inicializado correctamente');
        } catch (error) {
            console.error('❌ Error inicializando el sistema:', error);
            this.showError('Error al inicializar el sistema');
        }
    }

    /**
     * Inicializa la base de datos
     */
    async initDatabase() {
        try {
            console.log('🔄 Inicializando gestor de datos...');

            // Crear instancia del DatabaseManager
            window.databaseManager = new DatabaseManager();

            // Inicializar
            await databaseManager.initialize();

            console.log('✅ Gestor de datos inicializado correctamente');

        } catch (error) {
            console.error('❌ Error inicializando gestor de datos:', error);
            this.showError('Error al inicializar el gestor de datos: ' + error.message);
        }
    }

    /**
     * Inicializa el AuthController para el login original
     */
    async initAuthController() {
        try {
            console.log('🔄 Inicializando AuthController...');

            // Importar y crear el UserModel
            const { UserModel } = await import('./models/UserModel.js');
            const userModel = new UserModel();

            // Crear el AuthController usando la versión global
            this.authController = new window.AuthController(userModel);

            console.log('✅ AuthController inicializado correctamente');

        } catch (error) {
            console.error('❌ Error al inicializar AuthController:', error);
            // No lanzar error para permitir fallback
        }
    }

    /**
     * Verifica el estado de autenticación
     */
    checkAuthStatus() {
        const token = localStorage.getItem('adminToken');
        const userData = localStorage.getItem('adminUser');

        if (token && userData) {
            try {
                this.currentUser = JSON.parse(userData);
                this.isAuthenticated = true;
            } catch (error) {
                console.error('Error parseando datos de usuario:', error);
                this.logout();
            }
        }
    }

    /**
     * Muestra la pantalla de login
     */
    showLogin() {
        this.currentView = 'login';
        this.showLoginForm();

        // Aplicar clase para ocultar scroll
        document.body.classList.remove('dashboard-active');
        document.body.classList.add('login-active');
    }

    /**
     * Muestra el formulario de login
     */
    showLoginForm() {
        const loginSection = document.getElementById('loginSection');
        const adminDashboard = document.getElementById('adminDashboard');

        if (loginSection) loginSection.style.display = 'block';
        if (adminDashboard) adminDashboard.style.display = 'none';

        this.bindLoginEvents();
    }

    /**
     * Vincula eventos del formulario de login
     */
    bindLoginEvents() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleLogin();
            });
        }
    }

    /**
     * Maneja el proceso de login
     */
    async handleLogin() {
        try {
            const username = document.getElementById('username').value;
            const cedula = document.getElementById('password').value;

            if (!username || !cedula) {
                this.showError('Por favor completa todos los campos');
                return;
            }

            // Usar el AuthController para autenticación
            if (this.authController) {
                // Intentar autenticar usando el AuthController
                const user = await this.authController.authenticate(username, cedula);

                if (user) {
                    // Login exitoso - actualizar estado del AdminSystem
                    this.currentUser = user;
                    this.isAuthenticated = true;

                    // Guardar en localStorage
                    localStorage.setItem('adminToken', 'authenticated');
                    localStorage.setItem('adminUser', JSON.stringify(user));

                    // Mostrar mensaje de éxito
                    this.showSuccess('¡Bienvenido, ' + user.fullName + '!');

                    // Mostrar dashboard después de un delay
                    setTimeout(() => {
                        this.showDashboard();
                    }, 1000);
                } else {
                    this.showError('Credenciales incorrectas. Verifica tu primer nombre y cédula.');
                }
            } else {
                // Fallback si no hay AuthController
                this.showError('Error en el sistema de autenticación');
            }

        } catch (error) {
            console.error('Error en login:', error);
            this.showError('Error al iniciar sesión');
        }
    }

    /**
     * Muestra el dashboard principal
     */
    showDashboard() {
        console.log('🔄 Mostrando dashboard...');
        this.currentView = 'dashboard';

        // Aplicar clase para permitir scroll
        document.body.classList.remove('login-active');
        document.body.classList.add('dashboard-active');

        // Mostrar el dashboard
        const loginSection = document.getElementById('loginSection');
        const adminDashboard = document.getElementById('adminDashboard');

        if (loginSection) loginSection.style.display = 'none';
        if (adminDashboard) adminDashboard.style.display = 'block';

        // Actualizar información del usuario en el header
        this.updateUserInfo();

        console.log('✅ Dashboard mostrado correctamente');

        // Inicializar controladores y eventos
        this.initializeControllers();
        this.bindDashboardEvents();

        // Mostrar la sección de dashboard por defecto
        this.navigateToSection('dashboard');

        // Actualizar contenido con un pequeño delay para asegurar que el DOM esté listo
        setTimeout(() => {
            console.log('⏰ Iniciando actualización de contenido...');
            this.updateDashboardContent();
        }, 50);
    }

    /**
     * Actualiza la información del usuario en el header
     */
    updateUserInfo() {
        if (this.currentUser) {
            // Actualizar nombre del usuario
            const userNameElement = document.getElementById('userName');
            if (userNameElement) {
                userNameElement.textContent = this.currentUser.fullName || this.currentUser.username;
            }

            // Actualizar rol del usuario
            const userRoleElement = document.getElementById('userRole');
            if (userRoleElement) {
                const roleMap = {
                    'admin': 'Administrador',
                    'editor': 'Editor',
                    'viewer': 'Visualizador'
                };
                userRoleElement.textContent = roleMap[this.currentUser.role] || this.currentUser.role;
            }
        }
    }

    /**
     * Actualiza el contenido del dashboard
     */
    async updateDashboardContent() {
        try {
            console.log('🔄 Actualizando contenido del dashboard...');

            // Actualizar estadísticas en las tarjetas del dashboard
            this.updateDashboardStats();

            // Actualizar nombre del usuario
            const userNameElement = document.getElementById('userName');
            if (userNameElement && this.currentUser) {
                userNameElement.textContent = this.currentUser.fullName;
            }

            // Cargar datos en las tablas con delay para asegurar que el DOM esté listo
            setTimeout(async () => {
                console.log('📊 Cargando datos de las tablas...');

                try {
                    await this.loadTipsTable();
                    console.log('✅ Tips cargados correctamente');
                } catch (error) {
                    console.error('❌ Error cargando tips:', error);
                }

                try {
                    await this.loadServicesTable();
                    console.log('✅ Servicios cargados correctamente');
                } catch (error) {
                    console.error('❌ Error cargando servicios:', error);
                }

                try {
                    await this.loadMessagesList();
                    console.log('✅ Mensajes cargados correctamente');
                } catch (error) {
                    console.error('❌ Error cargando mensajes:', error);
                }

                try {
                    await this.loadGalleryGrid();
                    console.log('✅ Galería cargada correctamente');
                } catch (error) {
                    console.error('❌ Error cargando galería:', error);
                }

                console.log('🎉 Todas las tablas cargadas');
            }, 100);

        } catch (error) {
            console.error('❌ Error en updateDashboardContent:', error);
        }
    }

    /**
     * Actualiza las estadísticas del dashboard
     */
    async updateDashboardStats() {
        try {
            console.log('🔄 Actualizando estadísticas del dashboard...');

            // Obtener estadísticas de servicios
            const servicesCount = await this.getServiceStats();
            this.updateStatCard('servicesCount', servicesCount);

            // Obtener estadísticas de tips
            const tipsCount = await this.getTipStats();
            this.updateStatCard('tipsCount', tipsCount);

            // Obtener estadísticas de galería
            const galleryCount = await this.getGalleryStats();
            this.updateStatCard('galleryCount', galleryCount);

            // Obtener estadísticas de mensajes
            const messagesCount = await this.getMessageStats();
            this.updateStatCard('messagesCount', messagesCount);

            console.log('✅ Estadísticas actualizadas correctamente');

        } catch (error) {
            console.error('❌ Error actualizando estadísticas:', error);
        }
    }

    /**
     * Actualiza una tarjeta de estadística
     */
    updateStatCard(statId, value) {
        const element = document.getElementById(statId);
        if (element) {
            console.log(`Actualizando ${statId}:`, value, typeof value);
            element.textContent = value || '0';
        } else {
            console.warn(`Elemento no encontrado: ${statId}`);
        }
    }

    /**
     * Obtiene estadísticas de mensajes
     */
    async getMessageStats() {
        try {
            if (databaseManager && databaseManager.isInitialized) {
                const messages = databaseManager.getMessages();
                const unreadMessages = messages.filter(msg => !msg.read);
                return unreadMessages.length;
            }
            return 0;
        } catch (error) {
            console.error('Error obteniendo estadísticas de mensajes:', error);
            return 0;
        }
    }

    /**
     * Inicializa controladores
     */
    initializeControllers() {
        // Los controladores se manejan directamente con la base de datos
        console.log('✅ Controladores inicializados');
    }

    /**
     * Vincula eventos del dashboard
     */
    bindDashboardEvents() {
        // Navegación del header
        this.bindHeaderNavigation();

        // Botones de acción del header
        this.bindHeaderActions();

        // Eventos de las secciones
        this.bindSectionEvents();
    }

    /**
     * Vincula eventos de navegación del header
     */
    bindHeaderNavigation() {
        const navItems = document.querySelectorAll('.nav-item');

        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();

                // Remover clase active de todos los items
                navItems.forEach(nav => nav.classList.remove('active'));

                // Agregar clase active al item clickeado
                item.classList.add('active');

                // Obtener la sección
                const section = item.getAttribute('data-section');

                // Navegar a la sección
                this.navigateToSection(section);
            });
        });
    }

    /**
     * Vincula eventos de acciones del header
     */
    bindHeaderActions() {
        // Botón de notificaciones
        const notificationsBtn = document.getElementById('notificationsBtn');
        if (notificationsBtn) {
            notificationsBtn.addEventListener('click', () => {
                this.showNotifications();
            });
        }

        // Botón de perfil
        const profileBtn = document.getElementById('profileBtn');
        if (profileBtn) {
            profileBtn.addEventListener('click', () => {
                this.showProfile();
            });
        }

        // Botón de logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }
    }

    /**
     * Navega a una sección específica
     */
    navigateToSection(section) {
        // Ocultar todas las secciones
        const sections = document.querySelectorAll('.admin-section');
        sections.forEach(sec => sec.style.display = 'none');

        // Mostrar la sección seleccionada
        const targetSection = document.getElementById(section + 'Section');
        if (targetSection) {
            targetSection.style.display = 'block';
        }

        // Actualizar contenido según la sección
        this.loadSectionContent(section);
    }

    /**
     * Carga el contenido de una sección
     */
    loadSectionContent(section) {
        switch (section) {
            case 'dashboard':
                this.updateDashboardStats();
                break;
            case 'services':
                this.loadServicesTable();
                this.bindFilterEvents();
                break;
            case 'tips':
                this.loadTipsTable();
                break;
            case 'gallery':
                this.loadGalleryGrid();
                break;
            case 'messages':
                this.loadMessagesList();
                break;
            case 'stats':
                this.updateDashboardStats();
                break;
        }
    }

    /**
     * Vincula eventos globales
     */
    bindGlobalEvents() {
        // Eventos de navegación
        document.addEventListener('click', (e) => {
            const target = e.target;

            // Navegación por enlaces
            if (target.matches('a[data-view]')) {
                e.preventDefault();
                const view = target.getAttribute('data-view');
                this.navigateToView(view);
            }

            // Acciones de botones
            if (target.matches('button[data-action]')) {
                const action = target.getAttribute('data-action');
                this.handleAction(action);
            }
        });

        // Eventos de formularios
        document.addEventListener('submit', (e) => {
            const form = e.target;
            if (form.matches('form[data-form]')) {
                e.preventDefault();
                const formType = form.getAttribute('data-form');
                this.handleFormSubmit(formType, form);
            }
        });
    }

    /**
     * Maneja acciones generales
     */
    handleAction(action) {
        switch (action) {
            case 'logout':
                this.logout();
                break;
            case 'export_db':
                this.exportDatabase();
                break;
            case 'import_db':
                this.showImportModal();
                break;
            default:
                console.log('Acción no implementada:', action);
        }
    }

    /**
     * Navega a una vista específica
     */
    navigateToView(view) {
        this.currentView = view;
        this.loadViewContent(view);
    }

    /**
     * Carga el contenido de una vista
     */
    loadViewContent(view) {
        console.log('Navegando a vista:', view);

        // Ocultar todas las secciones
        const sections = document.querySelectorAll('.admin-section');
        sections.forEach(section => section.style.display = 'none');

        // Mostrar la sección correspondiente
        const targetSection = document.getElementById(view + 'Section');
        if (targetSection) {
            targetSection.style.display = 'block';
        }

        // Actualizar contenido según la vista
        switch (view) {
            case 'services':
                this.loadServicesTable();
                break;
            case 'tips':
                this.loadTipsTable();
                break;
            case 'gallery':
                this.loadGalleryGrid();
                break;
            case 'messages':
                this.loadMessagesList();
                break;
            case 'stats':
                this.updateDashboardStats();
                break;
            case 'config':
                this.renderSettings();
                break;
        }
    }

    /**
     * Renderiza la configuración
     */
    renderSettings() {
        const configSection = document.getElementById('configSection');
        if (configSection) {
            // Aquí se puede agregar la lógica para mostrar configuraciones
            console.log('Configuración renderizada');
        }
    }

    /**
     * Cierra la sesión
     */
    logout() {
        this.isAuthenticated = false;
        this.currentUser = null;
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        this.showLogin();
    }

    /**
     * Muestra notificaciones
     */
    showNotifications() {
        // Implementar sistema de notificaciones
        console.log('Mostrando notificaciones');
    }

    /**
     * Muestra perfil de usuario
     */
    showProfile() {
        // Implementar vista de perfil
        console.log('Mostrando perfil');
    }

    /**
     * Obtiene estadísticas de servicios
     */
    async getServiceStats() {
        try {
            console.log('🔍 Obteniendo estadísticas de servicios...');
            console.log('DatabaseManager:', databaseManager);
            console.log('isInitialized:', databaseManager?.isInitialized);

            if (databaseManager && databaseManager.isInitialized) {
                const services = databaseManager.getServices();
                console.log('Servicios obtenidos:', services);
                console.log('Cantidad de servicios:', services.length);
                return services.length;
            }
            console.log('Base de datos no inicializada');
            return 0;
        } catch (error) {
            console.error('Error obteniendo estadísticas de servicios:', error);
            return 0;
        }
    }

    /**
     * Obtiene estadísticas de tips
     */
    async getTipStats() {
        try {
            if (databaseManager && databaseManager.isInitialized) {
                const tips = databaseManager.getCookingTips();
                return tips.length;
            }
            return 0;
        } catch (error) {
            console.error('Error obteniendo estadísticas de tips:', error);
            return 0;
        }
    }

    /**
     * Obtiene estadísticas de galería
     */
    async getGalleryStats() {
        try {
            if (databaseManager && databaseManager.isInitialized) {
                const images = databaseManager.getGalleryImages();
                return images.length;
            }
            return 0;
        } catch (error) {
            console.error('Error obteniendo estadísticas de galería:', error);
            return 0;
        }
    }

    /**
     * Obtiene icono de actividad
     */
    getActivityIcon(type) {
        const icons = {
            service: 'ph-fill ph-coffee',
            tip: 'ph-fill ph-lightbulb',
            gallery: 'ph-fill ph-image',
            message: 'ph-fill ph-envelope'
        };
        return icons[type] || 'ph-fill ph-circle';
    }

    /**
     * Obtiene título de vista
     */
    getViewTitle(view) {
        const titles = {
            services: 'Gestión de Servicios',
            tips: 'Gestión de Tips',
            gallery: 'Gestión de Galería',
            messages: 'Mensajes de Contacto',
            stats: 'Estadísticas',
            config: 'Configuración'
        };
        return titles[view] || 'Vista';
    }

    /**
     * Formatea fecha
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * Trunca texto a una longitud máxima
     */
    truncateText(text, maxLength) {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    /**
     * Escapa caracteres HTML para prevenir XSS
     */
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Muestra notificación de éxito
     */
    showSuccess(message) {
        this.showNotification('success', 'Éxito', message);
    }

    /**
     * Muestra notificación de error
     */
    showError(message) {
        this.showNotification('error', 'Error', message);
    }

    /**
     * Muestra notificación de advertencia
     */
    showWarning(message) {
        this.showNotification('warning', 'Advertencia', message);
    }

    /**
     * Muestra notificación de información
     */
    showInfo(message) {
        this.showNotification('info', 'Información', message);
    }

    /**
     * Muestra una notificación
     */
    showNotification(type, title, message) {
        // Crear contenedor de notificaciones si no existe
        let container = document.querySelector('.notification-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'notification-container';
            document.body.appendChild(container);
        }

        // Crear notificación
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;

        const iconMap = {
            success: 'bi-check-circle-fill',
            error: 'bi-x-circle-fill',
            warning: 'bi-exclamation-triangle-fill',
            info: 'bi-info-circle-fill'
        };

        notification.innerHTML = `
            <div class="notification-icon">
                <i class="bi ${iconMap[type] || 'bi-info-circle-fill'}"></i>
            </div>
            <div class="notification-content">
                <div class="notification-title">${this.escapeHtml(title)}</div>
                <div class="notification-message">${this.escapeHtml(message)}</div>
            </div>
            <button class="notification-close" onclick="this.closest('.notification').remove()">
                <i class="bi bi-x"></i>
            </button>
        `;

        // Agregar al contenedor
        container.appendChild(notification);

        // Auto-remover después de 5 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.classList.add('removing');
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 5000);

        // Log en consola
        console.log(`[${type.toUpperCase()}] ${title}: ${message}`);
    }

    /**
     * Inicializa contador de caracteres
     */
    initCharacterCounter() {
        const inputs = document.querySelectorAll('input[maxlength], textarea[maxlength]');
        inputs.forEach(input => {
            const maxLength = parseInt(input.getAttribute('maxlength'));
            const counter = document.getElementById(input.id + 'Counter');

            if (counter) {
                this.updateCharacterCounter(input, counter, maxLength);

                input.addEventListener('input', () => {
                    this.updateCharacterCounter(input, counter, maxLength);
                });
            }
        });
    }

    /**
     * Actualiza contador de caracteres
     */
    updateCharacterCounter(input, counter, maxLength) {
        const currentLength = input.value.length;
        counter.textContent = currentLength;

        if (currentLength > maxLength * 0.8) {
            counter.style.color = '#ff4444';
        } else if (currentLength > maxLength * 0.6) {
            counter.style.color = '#ffaa00';
        } else {
            counter.style.color = '';
        }
    }

    /**
     * Carga tabla de tips
     */
    async loadTipsTable() {
        try {
            let tips = [];

            if (databaseManager && databaseManager.isInitialized) {
                const data = await databaseManager.getCookingTips();
                tips = data.tips;
            } else {
                // Fallback a JSON
                const response = await fetch('src/data/cooking-tips.json');
                const data = await response.json();
                tips = data.tips;
            }

            this.renderTipsTable(tips);

        } catch (error) {
            console.error('Error cargando tips:', error);
            this.showError('Error al cargar los tips');
        }
    }

    /**
     * Renderiza tabla de tips
     */
    renderTipsTable(tips) {
        const tableBody = document.getElementById('tipsTableBody');
        if (!tableBody) return;

        tableBody.innerHTML = tips.map(tip => `
            <tr>
                <td>${tip.title}</td>
                <td>${this.truncateText(tip.description, 50)}</td>
                <td>${tip.category}</td>
                <td>${tip.difficulty}</td>
                <td>${tip.time}</td>
                <td>
                    <button class="btn btn-sm btn-secondary" onclick="adminSystem.handleEditTip(${tip.id})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="adminSystem.handleDeleteTip(${tip.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    /**
     * Carga tabla de servicios desde la base de datos
     */
    async loadServicesTable() {
        try {
            console.log('🔄 Cargando servicios desde la base de datos...');

            let services = [];

            // Verificar si la base de datos está disponible
            if (databaseManager && databaseManager.isInitialized) {
                console.log('✅ Base de datos inicializada, obteniendo servicios...');

                try {
                    const servicesData = databaseManager.getServices();
                    console.log('📊 Servicios obtenidos de la BD:', servicesData);

                    if (Array.isArray(servicesData)) {
                        services = servicesData;
                        console.log(`✅ ${services.length} servicios cargados desde la base de datos`);
                    } else {
                        console.warn('⚠️ Los servicios no son un array:', servicesData);
                        services = [];
                    }
                } catch (dbError) {
                    console.error('❌ Error obteniendo servicios de la BD:', dbError);
                    throw dbError;
                }
            } else if (dataAdapter && dataAdapter.isReady()) {
                console.log('🔄 Usando DataAdapter como fallback...');
                try {
                    const data = await dataAdapter.getServices();
                    services = data.services || [];
                    console.log(`✅ ${services.length} servicios cargados desde DataAdapter`);
                } catch (adapterError) {
                    console.error('❌ Error con DataAdapter:', adapterError);
                    throw adapterError;
                }
            } else {
                console.log('🔄 Usando JSON como fallback...');
                // Fallback a JSON
                const response = await fetch('src/data/services.json');
                const data = await response.json();
                services = data.services || [];
                console.log(`✅ ${services.length} servicios cargados desde JSON`);
            }

            // Aplicar filtros si existen
            services = this.applyServiceFilters(services);

            // Renderizar la tabla
            this.renderServicesTable(services);

            // Actualizar paginación si existe
            if (this.servicesPagination) {
                this.servicesPagination.setData(services);
            }

            // Cargar categorías en el filtro
            this.loadCategoryFilter();

        } catch (error) {
            console.error('❌ Error cargando servicios:', error);
            this.showError('Error al cargar los servicios: ' + error.message);

            // Mostrar tabla vacía en caso de error
            this.renderServicesTable([]);
        }
    }

    /**
     * Aplica filtros a los servicios
     */
    applyServiceFilters(services) {
        const searchTerm = document.getElementById('serviceSearch')?.value?.toLowerCase() || '';
        const categoryFilter = document.getElementById('categoryFilter')?.value || '';
        const statusFilter = document.getElementById('statusFilter')?.value || '';
        const featuredFilter = document.getElementById('featuredFilter')?.value || '';

        return services.filter(service => {
            // Filtro de búsqueda
            if (searchTerm) {
                const matchesSearch =
                    service.title?.toLowerCase().includes(searchTerm) ||
                    service.description?.toLowerCase().includes(searchTerm) ||
                    service.category_name?.toLowerCase().includes(searchTerm) ||
                    service.category?.toLowerCase().includes(searchTerm);

                if (!matchesSearch) return false;
            }

            // Filtro de categoría
            if (categoryFilter && service.category !== categoryFilter) {
                return false;
            }

            // Filtro de estado
            if (statusFilter) {
                if (statusFilter === 'active' && !service.active) return false;
                if (statusFilter === 'inactive' && service.active) return false;
            }

            // Filtro de destacados
            if (featuredFilter) {
                if (featuredFilter === 'featured' && !service.featured) return false;
                if (featuredFilter === 'not-featured' && service.featured) return false;
            }

            return true;
        });
    }

    /**
     * Carga las categorías en el filtro
     */
    loadCategoryFilter() {
        const categoryFilter = document.getElementById('categoryFilter');
        if (!categoryFilter) return;

        // Limpiar opciones existentes (mantener la primera)
        while (categoryFilter.children.length > 1) {
            categoryFilter.removeChild(categoryFilter.lastChild);
        }

        // Obtener categorías de la base de datos
        let categories = [];
        if (databaseManager && databaseManager.isInitialized) {
            categories = databaseManager.getServiceCategories();
        }

        // Agregar opciones
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categoryFilter.appendChild(option);
        });
    }

    /**
     * Vincula eventos de filtros
     */
    bindFilterEvents() {
        // Búsqueda
        const searchInput = document.getElementById('serviceSearch');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.debounce(() => this.loadServicesTable(), 300);
            });
        }

        // Filtros
        const categoryFilter = document.getElementById('categoryFilter');
        const statusFilter = document.getElementById('statusFilter');
        const featuredFilter = document.getElementById('featuredFilter');

        [categoryFilter, statusFilter, featuredFilter].forEach(filter => {
            if (filter) {
                filter.addEventListener('change', () => {
                    this.loadServicesTable();
                });
            }
        });

        // Limpiar filtros
        const clearFiltersBtn = document.getElementById('clearFilters');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => {
                this.clearServiceFilters();
            });
        }
    }

    /**
     * Limpia todos los filtros
     */
    clearServiceFilters() {
        const searchInput = document.getElementById('serviceSearch');
        const categoryFilter = document.getElementById('categoryFilter');
        const statusFilter = document.getElementById('statusFilter');
        const featuredFilter = document.getElementById('featuredFilter');

        if (searchInput) searchInput.value = '';
        if (categoryFilter) categoryFilter.value = '';
        if (statusFilter) statusFilter.value = '';
        if (featuredFilter) featuredFilter.value = '';

        this.loadServicesTable();
    }

    /**
     * Función debounce para optimizar búsquedas
     */
    debounce(func, wait) {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
        this.debounceTimer = setTimeout(func, wait);
    }

    /**
     * Renderiza tabla de servicios
     */
    renderServicesTable(services) {
        const tableBody = document.getElementById('servicesTableBody');
        if (!tableBody) {
            console.error('❌ No se encontró el elemento servicesTableBody');
            return;
        }

        console.log('🎨 Renderizando tabla de servicios:', services);

        if (!Array.isArray(services) || services.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="no-data">
                        <div class="no-data-message">
                            <i class="bi bi-inbox"></i>
                            <p>No hay servicios disponibles</p>
                        </div>
                    </td>
                </tr>
            `;

            // Actualizar paginación con datos vacíos
            if (this.servicesPagination) {
                this.servicesPagination.setData([]);
            }
            return;
        }

        // Usar paginación si está disponible
        let servicesToShow = services;
        if (this.servicesPagination) {
            this.servicesPagination.setData(services);
            servicesToShow = this.servicesPagination.getCurrentPageData();
        }

        tableBody.innerHTML = servicesToShow.map(service => {
            // Asegurar que todos los campos existan
            const title = service.title || 'Sin título';
            const description = service.description || 'Sin descripción';
            const category = service.category_name || service.category || 'Sin categoría';
            const active = service.active !== undefined ? service.active : true;
            const id = service.id || 'N/A';

            return `
                <tr data-service-id="${id}">
                    <td>
                        <div class="service-info">
                            <div class="service-title">${this.escapeHtml(title)}</div>
                            <div class="service-description">
                                ${this.escapeHtml(this.truncateText(description, 64))}
                            </div>
                        </div>
                    </td>
                    <td>
                        ${service.badge ? `<span class="service-badge">${this.escapeHtml(service.badge)}</span>` : '<span class="no-badge">-</span>'}
                    </td>
                    <td>
                        <span class="category-tag" style="background-color: ${service.category_color || '#D46528'}">
                            ${this.escapeHtml(category)}
                        </span>
                    </td>
                    <td>
                        <span class="status-badge ${active ? 'active' : 'inactive'}">
                            ${active ? 'Activo' : 'Inactivo'}
                        </span>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-sm btn-secondary" onclick="adminSystem.handleEditService(${id})" title="Editar">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="adminSystem.handleDeleteService(${id})" title="Eliminar">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        console.log(`✅ Tabla renderizada con ${servicesToShow.length} servicios`);
    }

    /**
     * Carga lista de mensajes
     */
    async loadMessagesList() {
        try {
            let messages = [];

            if (databaseManager && databaseManager.isInitialized) {
                messages = await databaseManager.getMessages();
            }

            this.renderMessagesList(messages);

        } catch (error) {
            console.error('Error cargando mensajes:', error);
        }
    }

    /**
     * Renderiza lista de mensajes
     */
    renderMessagesList(messages) {
        const messagesList = document.getElementById('messagesList');
        if (!messagesList) return;

        if (messages.length === 0) {
            messagesList.innerHTML = '<div class="no-messages">No hay mensajes</div>';
            return;
        }

        messagesList.innerHTML = messages.map(message => `
            <div class="message-item ${message.read ? 'read' : 'unread'}">
                <div class="message-header">
                    <h4>${message.name}</h4>
                    <span class="message-date">${this.formatDate(message.created_at)}</span>
                </div>
                <p class="message-email">${message.email}</p>
                <p class="message-text">${this.truncateText(message.message, 100)}</p>
                <div class="message-actions">
                    <button class="btn btn-sm btn-secondary" onclick="adminSystem.markMessageAsRead(${message.id})">
                        Marcar como leído
                    </button>
                </div>
            </div>
        `).join('');
    }

    /**
     * Carga grid de galería
     */
    async loadGalleryGrid() {
        try {
            let images = [];

            if (databaseManager && databaseManager.isInitialized) {
                const data = await databaseManager.getGalleryImages();
                images = data.images;
            } else {
                // Fallback a JSON
                const response = await fetch('src/data/gallery.json');
                const data = await response.json();
                images = data.images;
            }

            this.renderGalleryGrid(images);

        } catch (error) {
            console.error('Error cargando galería:', error);
        }
    }

    /**
     * Renderiza grid de galería
     */
    renderGalleryGrid(images) {
        const galleryGrid = document.getElementById('galleryGrid');
        if (!galleryGrid) return;

        galleryGrid.innerHTML = images.map(image => `
            <div class="gallery-item-admin">
                <img src="${image.url}" alt="${image.alt}" class="gallery-image-admin">
                <div class="gallery-overlay-admin">
                    <h4>${image.title}</h4>
                    <p>${image.category}</p>
                </div>
            </div>
        `).join('');
    }

    /**
     * Vincula eventos de tablas
     */
    bindTableEvents() {
        // Eventos para filas de tabla
        const tableRows = document.querySelectorAll('tbody tr');
        tableRows.forEach(row => {
            row.addEventListener('click', (e) => {
                if (!e.target.matches('button')) {
                    // Seleccionar fila
                    tableRows.forEach(r => r.classList.remove('selected'));
                    row.classList.add('selected');
                }
            });
        });
    }

    /**
     * Maneja edición de tip
     */
    handleEditTip(tipId) {
        console.log('Editando tip:', tipId);
        // Implementar modal de edición
    }

    /**
     * Maneja eliminación de tip
     */
    handleDeleteTip(tipId) {
        if (confirm('¿Estás seguro de que quieres eliminar este tip?')) {
            console.log('Eliminando tip:', tipId);
            // Implementar eliminación
        }
    }

    /**
     * Maneja edición de servicio
     */
    handleEditService(serviceId) {
        console.log('🔄 Editando servicio:', serviceId);
        this.showEditServiceModal(serviceId);
    }

    /**
     * Maneja eliminación de servicio
     */
    async handleDeleteService(serviceId) {
        console.log('🗑️ Eliminando servicio:', serviceId);

        // Mostrar confirmación
        const confirmed = confirm('¿Estás seguro de que quieres eliminar este servicio? Esta acción no se puede deshacer.');

        if (!confirmed) {
            return;
        }

        try {
            await this.deleteService(serviceId);
            this.showSuccess('Servicio eliminado correctamente');
            this.loadServicesTable(); // Recargar tabla
        } catch (error) {
            console.error('Error eliminando servicio:', error);
            this.showError('Error al eliminar el servicio: ' + error.message);
        }
    }

    /**
     * Elimina un servicio
     */
    async deleteService(serviceId) {
        if (!databaseManager || !databaseManager.isInitialized) {
            throw new Error('Base de datos no inicializada');
        }

        // En SQL.js, podemos "eliminar" marcando como inactivo o eliminando de la tabla
        // Por simplicidad, vamos a marcar como inactivo
        const services = databaseManager.getServices();
        const service = services.find(s => s.id == serviceId);

        if (!service) {
            throw new Error('Servicio no encontrado');
        }

        // Marcar como inactivo
        const updatedService = {
            ...service,
            active: false,
            updatedAt: new Date().toISOString()
        };

        databaseManager.insertService(updatedService);
        return true;
    }

    /**
     * Marca mensaje como leído
     */
    async markMessageAsRead(messageId) {
        try {
            if (databaseManager && databaseManager.isInitialized) {
                await databaseManager.markMessageAsRead(messageId);
                console.log(`✅ Mensaje ${messageId} marcado como leído`);
            }
        } catch (error) {
            console.error('❌ Error marcando mensaje:', error);
        }
    }

    /**
     * Exporta la base de datos
     */
    async exportDatabase() {
        try {
            let services = [];

            if (databaseManager && databaseManager.isInitialized) {
                services = databaseManager.getServices();
            }

            if (services.length === 0) {
                this.showError('No hay servicios para exportar');
                return;
            }

            // Crear contenido CSV
            const headers = ['ID', 'Título', 'Descripción', 'Categoría', 'Icono', 'Badge', 'Activo', 'Destacado', 'Orden', 'Fecha Creación'];
            const csvContent = [
                headers.join(','),
                ...services.map(service => [
                    service.id,
                    `"${service.title?.replace(/"/g, '""') || ''}"`,
                    `"${service.description?.replace(/"/g, '""') || ''}"`,
                    `"${service.category_name || service.category || ''}"`,
                    service.icon || '',
                    `"${service.badge?.replace(/"/g, '""') || ''}"`,
                    service.active ? 'Sí' : 'No',
                    service.featured ? 'Sí' : 'No',
                    service.order_index || service.order || '',
                    service.created_at || ''
                ].join(','))
            ].join('\n');

            // Crear y descargar archivo
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);

            link.setAttribute('href', url);
            link.setAttribute('download', `servicios_sabores_ancestrales_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            this.showSuccess(`Se exportaron ${services.length} servicios correctamente`);

        } catch (error) {
            console.error('Error exportando servicios:', error);
            this.showError('Error al exportar los servicios: ' + error.message);
        }
    }

    /**
     * Reinicia la base de datos
     */
    async resetDatabase() {
        try {
            const confirmed = confirm(
                '¿Estás seguro de que quieres reiniciar la base de datos?\n\n' +
                'Esto eliminará todos los datos personalizados y volverá a cargar los datos iniciales.\n' +
                'Esta acción no se puede deshacer.'
            );

            if (!confirmed) {
                return;
            }

            if (databaseManager && databaseManager.isInitialized) {
                await databaseManager.resetDatabase();
                this.showSuccess('Base de datos reiniciada correctamente');

                // Recargar la tabla de servicios
                this.loadServicesTable();
            } else {
                this.showError('Base de datos no inicializada');
            }

        } catch (error) {
            console.error('Error reiniciando base de datos:', error);
            this.showError('Error al reiniciar la base de datos: ' + error.message);
        }
    }

    /**
     * Muestra modal de importación
     */
    showImportModal() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.db,.sqlite';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    await this.importDatabase(file);
                    this.showSuccess('Base de datos importada');
                    this.updateDashboardContent(); // Recargar contenido
                } catch (error) {
                    console.error('Error importando base de datos:', error);
                    this.showError('Error al importar base de datos');
                }
            }
        };
        input.click();
    }

    /**
     * Muestra modal para agregar servicio
     */
    showAddServiceModal() {
        this.showServiceModal();
    }

    /**
     * Muestra modal para editar servicio
     */
    showEditServiceModal(serviceId) {
        // Obtener el servicio de la base de datos
        let service = null;
        if (databaseManager && databaseManager.isInitialized) {
            const services = databaseManager.getServices();
            service = services.find(s => s.id == serviceId);
        }

        this.showServiceModal(service);
    }

    /**
     * Muestra modal de servicio (crear o editar)
     */
    showServiceModal(service = null) {
        const isEditing = service !== null;

        // Obtener categorías disponibles
        let categories = [];
        if (databaseManager && databaseManager.isInitialized) {
            categories = databaseManager.getServiceCategories();
        }

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'serviceModal';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3>${isEditing ? 'Editar Servicio' : 'Nuevo Servicio'}</h3>
                    <button class="btn btn-icon" onclick="this.closest('.modal-overlay').remove()">
                        <i class="bi bi-x-lg"></i>
                    </button>
                </div>
                
                <form id="serviceForm" class="modal-content">
                    <input type="hidden" id="serviceId" value="${service?.id || ''}">
                    
                    <div class="form-group">
                        <label for="serviceTitle">Título *</label>
                        <input type="text" id="serviceTitle" name="title" 
                               value="${this.escapeHtml(service?.title || '')}" required
                               maxlength="100" placeholder="Ej: Catering Corporativo">
                        <div class="input-counter">
                            <span id="titleCounter">${service?.title?.length || 0}</span>/100
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="serviceDescription">Descripción *</label>
                        <textarea id="serviceDescription" name="description" rows="4" required
                                  maxlength="500" placeholder="Describe el servicio...">${this.escapeHtml(service?.description || '')}</textarea>
                        <div class="input-counter">
                            <span id="descriptionCounter">${service?.description?.length || 0}</span>/500
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="serviceIcon">Icono *</label>
                            <select id="serviceIcon" name="icon" required>
                                <option value="">Seleccionar icono</option>
                                <option value="ph-fill ph-coffee" ${service?.icon === 'ph-fill ph-coffee' ? 'selected' : ''}>☕ Café</option>
                                <option value="ph-fill ph-calendar" ${service?.icon === 'ph-fill ph-calendar' ? 'selected' : ''}>📅 Calendario</option>
                                <option value="ph-fill ph-heart" ${service?.icon === 'ph-fill ph-heart' ? 'selected' : ''}>❤️ Corazón</option>
                                <option value="ph-fill ph-star" ${service?.icon === 'ph-fill ph-star' ? 'selected' : ''}>⭐ Estrella</option>
                                <option value="ph-fill ph-users" ${service?.icon === 'ph-fill ph-users' ? 'selected' : ''}>👥 Usuarios</option>
                                <option value="ph-fill ph-gear" ${service?.icon === 'ph-fill ph-gear' ? 'selected' : ''}>⚙️ Configuración</option>
                                <option value="ph-fill ph-car-profile" ${service?.icon === 'ph-fill ph-car-profile' ? 'selected' : ''}>🚗 Vehículo</option>
                                <option value="ph-fill ph-sun" ${service?.icon === 'ph-fill ph-sun' ? 'selected' : ''}>☀️ Sol</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="serviceCategory">Categoría *</label>
                            <select id="serviceCategory" name="category" required>
                                <option value="">Seleccionar categoría</option>
                                ${categories.map(cat => `
                                    <option value="${cat.id}" ${service?.category === cat.id ? 'selected' : ''}>
                                        ${this.escapeHtml(cat.name)}
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="serviceBadge">Badge</label>
                            <input type="text" id="serviceBadge" name="badge" 
                                   value="${this.escapeHtml(service?.badge || '')}" 
                                   maxlength="20" placeholder="Ej: Nuevo, Popular">
                            <div class="input-counter">
                                <span id="badgeCounter">${service?.badge?.length || 0}</span>/20
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="serviceOrder">Orden</label>
                            <input type="number" id="serviceOrder" name="order" 
                                   value="${service?.order_index || service?.order || 1}" 
                                   min="1" max="999">
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="serviceActive" name="active" 
                                       ${service?.active !== false ? 'checked' : ''}>
                                <span class="checkmark"></span>
                                Servicio activo
                            </label>
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
                        <button type="button" class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">
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
        this.bindServiceModalEvents(modal, service);
    }

    /**
     * Vincula eventos del modal de servicio
     */
    bindServiceModalEvents(modal, service) {
        // Contador de caracteres
        const titleInput = modal.querySelector('#serviceTitle');
        const descriptionInput = modal.querySelector('#serviceDescription');
        const badgeInput = modal.querySelector('#serviceBadge');

        if (titleInput) {
            titleInput.addEventListener('input', (e) => {
                this.updateCharacterCounter(e.target, modal.querySelector('#titleCounter'), 100);
            });
        }

        if (descriptionInput) {
            descriptionInput.addEventListener('input', (e) => {
                this.updateCharacterCounter(e.target, modal.querySelector('#descriptionCounter'), 500);
            });
        }

        if (badgeInput) {
            badgeInput.addEventListener('input', (e) => {
                this.updateCharacterCounter(e.target, modal.querySelector('#badgeCounter'), 20);
            });
        }

        // Manejo del formulario
        const form = modal.querySelector('#serviceForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleServiceFormSubmit(form, service);
            });
        }

        // Cerrar modal con Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                modal.remove();
            }
        });

        // Cerrar modal al hacer clic fuera
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    /**
     * Maneja el envío del formulario de servicio
     */
    async handleServiceFormSubmit(form, service) {
        try {
            const formData = new FormData(form);
            const serviceData = {
                title: formData.get('title').trim(),
                description: formData.get('description').trim(),
                icon: formData.get('icon'),
                category: formData.get('category'),
                badge: formData.get('badge').trim() || null,
                order: parseInt(formData.get('order')) || 1,
                active: formData.get('active') === 'on',
                featured: formData.get('featured') === 'on'
            };

            // Validaciones
            if (!serviceData.title || !serviceData.description || !serviceData.icon || !serviceData.category) {
                this.showError('Por favor completa todos los campos obligatorios');
                return;
            }

            const isEditing = service !== null;

            if (isEditing) {
                // Actualizar servicio existente
                await this.updateService(service.id, serviceData);
                this.showSuccess('Servicio actualizado correctamente');
            } else {
                // Crear nuevo servicio
                await this.createService(serviceData);
                this.showSuccess('Servicio creado correctamente');
            }

            // Cerrar modal y recargar tabla
            form.closest('.modal-overlay').remove();
            this.loadServicesTable();

        } catch (error) {
            console.error('Error guardando servicio:', error);
            this.showError('Error al guardar el servicio: ' + error.message);
        }
    }

    /**
     * Crea un nuevo servicio
     */
    async createService(serviceData) {
        if (!databaseManager || !databaseManager.isInitialized) {
            throw new Error('Base de datos no inicializada');
        }

        // Generar ID único
        const services = databaseManager.getServices();
        const newId = Math.max(...services.map(s => s.id), 0) + 1;

        const newService = {
            id: newId,
            ...serviceData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // Usar el método insertService del DatabaseManager
        databaseManager.insertService(newService);

        console.log('✅ Servicio creado y guardado:', newService);
        return newService;
    }

    /**
     * Actualiza un servicio existente
     */
    async updateService(serviceId, serviceData) {
        if (!databaseManager || !databaseManager.isInitialized) {
            throw new Error('Base de datos no inicializada');
        }

        const updatedService = {
            id: serviceId,
            ...serviceData,
            updatedAt: new Date().toISOString()
        };

        // Usar el método updateService del DatabaseManager
        databaseManager.updateService(serviceId, serviceData);

        console.log('✅ Servicio actualizado y guardado:', updatedService);
        return updatedService;
    }

    /**
     * Vincula eventos de las secciones
     */
    bindSectionEvents() {
        // Botones de acción de las secciones
        const actionButtons = document.querySelectorAll('.btn');
        actionButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const action = e.target.closest('.btn').getAttribute('data-action');
                if (action) {
                    this.handleDashboardAction(action);
                }
            });
        });
    }

    /**
     * Maneja acciones del dashboard
     */
    handleDashboardAction(action) {
        switch (action) {
            case 'add_service':
                this.showAddServiceModal();
                break;
            case 'add_tip':
                this.showAddTipModal();
                break;
            case 'upload_images':
                this.showUploadModal();
                break;
            case 'view_messages':
                this.showMessagesView();
                break;
            case 'export_services':
                this.exportServices();
                break;
            default:
                console.log('Acción no implementada:', action);
        }
    }

    /**
     * Importa una base de datos
     */
    async importDatabase(file) {
        try {
            if (databaseManager && databaseManager.isInitialized) {
                await databaseManager.importDatabase(file);
                this.showSuccess('Base de datos importada correctamente');

                // Recargar datos
                await this.loadServices();
                await this.loadTipsTable();
                await this.loadGallery();
                await this.loadMessagesList();
            }
        } catch (error) {
            console.error('❌ Error importando base de datos:', error);
            this.showError('Error al importar la base de datos: ' + error.message);
        }
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Crear instancia global de la aplicación
    window.adminSystem = new AdminSystem();
});

// Función global para verificar el estado de la aplicación
window.isAdminReady = function () {
    return window.adminSystem && window.adminSystem.isAuthenticated !== undefined;
};

// Función global para obtener el usuario actual
window.getCurrentUser = function () {
    if (window.adminSystem) {
        return window.adminSystem.currentUser;
    }
    return null;
};

// Función global para verificar si el usuario está autenticado
window.isAuthenticated = function () {
    if (window.adminSystem) {
        return window.adminSystem.isAuthenticated;
    }
    return false;
};

// Función global para hacer logout
window.logout = function () {
    if (window.adminSystem) {
        window.adminSystem.logout();
    }
};

// Función global para verificar permisos
window.hasPermission = function (permission) {
    const user = window.getCurrentUser();
    if (!user) return false;

    // Mapeo de roles a permisos
    const rolePermissions = {
        'admin': ['read', 'write', 'delete', 'manage_users', 'manage_content'],
        'editor': ['read', 'write', 'manage_content'],
        'viewer': ['read']
    };

    const userPermissions = rolePermissions[user.role] || [];
    return userPermissions.includes(permission);
};

// Función global para verificar rol
window.hasRole = function (role) {
    const user = window.getCurrentUser();
    return user && user.role === role;
};

// Exportar la clase para uso global
window.AdminSystem = AdminSystem;

/**
 * Clase para manejar la paginación de las tablas
 */
class PaginationManager {
    constructor(containerId, pageSize = 10) {
        this.containerId = containerId;
        this.pageSize = pageSize;
        this.currentPage = 1;
        this.data = [];
        this.totalPages = 0;
        this.onPageChange = null;
        this.init();
    }

    init() {
        this.container = document.getElementById(this.containerId);
        if (this.container) {
            this.bindEvents();
        }
    }

    setData(data) {
        this.data = Array.isArray(data) ? data : [];
        this.totalPages = Math.ceil(this.data.length / this.pageSize);
        this.currentPage = Math.min(this.currentPage, this.totalPages || 1);
        this.render();
    }

    setPageSize(size) {
        this.pageSize = parseInt(size) || 10;
        this.totalPages = Math.ceil(this.data.length / this.pageSize);
        this.currentPage = 1;
        this.render();
    }

    getCurrentPageData() {
        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        return this.data.slice(start, end);
    }

    goToPage(page) {
        const newPage = Math.max(1, Math.min(page, this.totalPages));
        if (newPage !== this.currentPage) {
            this.currentPage = newPage;
            this.render();
            if (this.onPageChange) {
                this.onPageChange(this.getCurrentPageData());
            }
        }
    }

    goToFirst() {
        this.goToPage(1);
    }

    goToLast() {
        this.goToPage(this.totalPages);
    }

    goToPrev() {
        this.goToPage(this.currentPage - 1);
    }

    goToNext() {
        this.goToPage(this.currentPage + 1);
    }

    render() {
        if (!this.container) return;

        const start = (this.currentPage - 1) * this.pageSize + 1;
        const end = Math.min(this.currentPage * this.pageSize, this.data.length);
        const total = this.data.length;

        this.container.innerHTML = `
            <div class="pagination-info">
                <span class="pagination-text">
                    Mostrando <span class="pagination-start">${total > 0 ? start : 0}</span> a 
                    <span class="pagination-end">${end}</span> de 
                    <span class="pagination-total">${total}</span> servicios
                </span>
            </div>
            <div class="pagination-controls">
                <button class="btn btn-sm btn-secondary pagination-btn" data-action="first" 
                        ${this.currentPage <= 1 ? 'disabled' : ''}>
                    <i class="bi bi-chevron-double-left"></i>
                </button>
                <button class="btn btn-sm btn-secondary pagination-btn" data-action="prev" 
                        ${this.currentPage <= 1 ? 'disabled' : ''}>
                    <i class="bi bi-chevron-left"></i>
                </button>
                <div class="pagination-pages" id="${this.containerId}Pages">
                    ${this.renderPageNumbers()}
                </div>
                <button class="btn btn-sm btn-secondary pagination-btn" data-action="next" 
                        ${this.currentPage >= this.totalPages ? 'disabled' : ''}>
                    <i class="bi bi-chevron-right"></i>
                </button>
                <button class="btn btn-sm btn-secondary pagination-btn" data-action="last" 
                        ${this.currentPage >= this.totalPages ? 'disabled' : ''}>
                    <i class="bi bi-chevron-double-right"></i>
                </button>
            </div>
            <div class="pagination-size">
                <select class="select-input pagination-size-select" id="${this.containerId}PageSize">
                    <option value="5" ${this.pageSize === 5 ? 'selected' : ''}>5 por página</option>
                    <option value="10" ${this.pageSize === 10 ? 'selected' : ''}>10 por página</option>
                    <option value="20" ${this.pageSize === 20 ? 'selected' : ''}>20 por página</option>
                    <option value="50" ${this.pageSize === 50 ? 'selected' : ''}>50 por página</option>
                </select>
            </div>
        `;

        this.bindEvents();
    }

    renderPageNumbers() {
        if (this.totalPages <= 1) return '';

        const pages = [];
        const maxVisible = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
        let endPage = Math.min(this.totalPages, startPage + maxVisible - 1);

        if (endPage - startPage + 1 < maxVisible) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }

        // Primera página
        if (startPage > 1) {
            pages.push(`<button class="pagination-page" data-page="1">1</button>`);
            if (startPage > 2) {
                pages.push(`<span class="pagination-ellipsis">...</span>`);
            }
        }

        // Páginas visibles
        for (let i = startPage; i <= endPage; i++) {
            pages.push(`
                <button class="pagination-page ${i === this.currentPage ? 'active' : ''}" data-page="${i}">
                    ${i}
                </button>
            `);
        }

        // Última página
        if (endPage < this.totalPages) {
            if (endPage < this.totalPages - 1) {
                pages.push(`<span class="pagination-ellipsis">...</span>`);
            }
            pages.push(`<button class="pagination-page" data-page="${this.totalPages}">${this.totalPages}</button>`);
        }

        return pages.join('');
    }

    bindEvents() {
        if (!this.container) return;

        // Botones de navegación
        const buttons = this.container.querySelectorAll('.pagination-btn');
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                const action = button.getAttribute('data-action');
                switch (action) {
                    case 'first':
                        this.goToFirst();
                        break;
                    case 'prev':
                        this.goToPrev();
                        break;
                    case 'next':
                        this.goToNext();
                        break;
                    case 'last':
                        this.goToLast();
                        break;
                }
            });
        });

        // Números de página
        const pageButtons = this.container.querySelectorAll('.pagination-page');
        pageButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const page = parseInt(button.getAttribute('data-page'));
                if (page && page !== this.currentPage) {
                    this.goToPage(page);
                }
            });
        });

        // Selector de tamaño de página
        const sizeSelect = this.container.querySelector('.pagination-size-select');
        if (sizeSelect) {
            sizeSelect.addEventListener('change', (e) => {
                const newSize = parseInt(e.target.value);
                this.setPageSize(newSize);
            });
        }
    }
}

// Clase para manejar las estadísticas y gráficos
class StatisticsManager {
    constructor() {
        this.statisticsData = null;
        this.init();
    }

    async init() {
        try {
            await this.loadStatisticsData();
            this.renderStatistics();
        } catch (error) {
            console.error('Error al cargar estadísticas:', error);
        }
    }

    async loadStatisticsData() {
        try {
            const response = await fetch('src/data/statistics.json');
            if (!response.ok) {
                throw new Error('No se pudo cargar el archivo de estadísticas');
            }
            this.statisticsData = await response.json();
        } catch (error) {
            console.error('Error al cargar datos de estadísticas:', error);
            throw error;
        }
    }

    renderStatistics() {
        if (!this.statisticsData) return;

        const stats = this.statisticsData.dashboard_stats;

        // Renderizar cada tarjeta de estadísticas
        Object.keys(stats).forEach(statKey => {
            const statData = stats[statKey];
            const statCard = document.querySelector(`[data-stat="${statKey}"]`);

            if (statCard) {
                this.updateStatCard(statCard, statData);
                this.renderChart(statCard, statData.chart_data);
            }
        });
    }

    updateStatCard(statCard, statData) {
        // Actualizar valor principal
        const statValue = statCard.querySelector('.stat-value');
        if (statValue) {
            if (statData.label.includes('Ingresos')) {
                statValue.textContent = `$${statData.value.toLocaleString()}`;
            } else {
                statValue.textContent = statData.value.toLocaleString();
            }
        }

        // Actualizar tendencia
        const statTrend = statCard.querySelector('.stat-trend');
        if (statTrend) {
            const trendIcon = statTrend.querySelector('i');
            const trendText = statTrend.querySelector('span');

            if (statData.trend === 'up') {
                statTrend.className = 'stat-trend up';
                trendIcon.className = 'bi bi-arrow-up';
            } else {
                statTrend.className = 'stat-trend down';
                trendIcon.className = 'bi bi-arrow-down';
            }

            trendText.textContent = statData.percentage;
        }
    }

    renderChart(statCard, chartData) {
        const chartBars = statCard.querySelector('.chart-bars');
        if (!chartBars) return;

        // Limpiar gráfico existente
        chartBars.innerHTML = '';

        // Encontrar el valor máximo para normalizar las alturas
        const maxValue = Math.max(...chartData.map(item => item.value));

        // Crear barras
        chartData.forEach(item => {
            const bar = document.createElement('div');
            bar.className = 'chart-bar';

            // Calcular altura basada en el valor máximo
            const heightPercentage = (item.value / maxValue) * 100;
            bar.style.height = `${heightPercentage}%`;

            // Añadir valor como atributo para el tooltip
            bar.setAttribute('data-value', item.value.toLocaleString());

            chartBars.appendChild(bar);
        });
    }
} 