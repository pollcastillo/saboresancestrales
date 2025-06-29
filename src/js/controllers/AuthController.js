/**
 * AuthController.js
 * Controlador de autenticación para Sabores Ancestrales
 * Maneja el login y logout usando SQL.js
 */

class AuthController {
    constructor(userModel = null) {
        this.dbManager = null;
        this.userModel = userModel;
        this.currentUser = null;
        this.isAuthenticated = false;
        this.sessionTimeout = 30 * 60 * 1000; // 30 minutos
        this.sessionTimer = null;

        this.init();
    }

    /**
     * Inicializa el controlador
     */
    async init() {
        try {
            // Esperar a que la base de datos esté lista
            if (window.dbManager && window.dbManager.isInitialized) {
                this.dbManager = window.dbManager;
            } else {
                // Esperar a que se inicialice
                await this.waitForDatabase();
            }

            // Verificar si hay una sesión activa
            this.checkExistingSession();

            // Configurar eventos
            this.setupEventListeners();

            console.log('✅ AuthController inicializado correctamente');

        } catch (error) {
            console.error('❌ Error al inicializar AuthController:', error);
        }
    }

    /**
     * Espera a que la base de datos esté disponible
     */
    async waitForDatabase() {
        return new Promise((resolve) => {
            const checkDatabase = () => {
                if (window.dbManager && window.dbManager.isInitialized) {
                    this.dbManager = window.dbManager;
                    resolve();
                } else {
                    setTimeout(checkDatabase, 100);
                }
            };
            checkDatabase();
        });
    }

    /**
     * Configura los event listeners
     */
    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }

        // Contadores de caracteres
        this.setupCharacterCounters();

        // Remember me checkbox
        const rememberMe = document.getElementById('rememberMe');
        if (rememberMe) {
            rememberMe.addEventListener('change', (e) => {
                localStorage.setItem('rememberMe', e.target.checked);
            });
        }
    }

    /**
     * Configura los contadores de caracteres
     */
    setupCharacterCounters() {
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        const usernameCounter = document.getElementById('usernameCounter');
        const passwordCounter = document.getElementById('passwordCounter');

        if (usernameInput && usernameCounter) {
            usernameInput.addEventListener('input', (e) => {
                usernameCounter.textContent = e.target.value.length;
            });
        }

        if (passwordInput && passwordCounter) {
            passwordInput.addEventListener('input', (e) => {
                passwordCounter.textContent = e.target.value.length;
            });
        }
    }

    /**
     * Maneja el proceso de login
     */
    async handleLogin(event) {
        event.preventDefault();

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        const rememberMe = document.getElementById('rememberMe').checked;

        // Validaciones básicas
        if (!username || !password) {
            this.showError('Por favor, completa todos los campos');
            return;
        }

        if (username.length < 2) {
            this.showError('El nombre debe tener al menos 2 caracteres');
            return;
        }

        if (password.length < 5) {
            this.showError('La cédula debe tener al menos 5 dígitos');
            return;
        }

        try {
            // Mostrar loading
            this.showLoading(true);

            // Intentar autenticar
            const user = await this.authenticate(username, password);

            if (user) {
                // Login exitoso
                this.loginSuccess(user, rememberMe);
            } else {
                // Login fallido
                this.showError('Credenciales incorrectas. Verifica tu nombre y cédula.');
            }

        } catch (error) {
            console.error('Error en login:', error);
            this.showError('Error al iniciar sesión. Intenta nuevamente.');
        } finally {
            this.showLoading(false);
        }
    }

    /**
     * Autentica al usuario usando la base de datos
     */
    async authenticate(username, password) {
        // Si tenemos UserModel, usarlo
        if (this.userModel) {
            // Asegurar que los usuarios estén cargados
            await this.userModel.loadUsers();
            return this.userModel.authenticate(username, password);
        }

        // Fallback al DatabaseManager
        if (!this.dbManager) {
            throw new Error('Base de datos no disponible');
        }

        // Buscar usuario en la base de datos
        const user = this.dbManager.authenticateUser(username, password);

        return user;
    }

    /**
     * Maneja el login exitoso
     */
    loginSuccess(user, rememberMe) {
        this.currentUser = user;
        this.isAuthenticated = true;

        // Guardar sesión
        this.saveSession(user, rememberMe);

        // Iniciar timer de sesión
        this.startSessionTimer();

        // Mostrar dashboard
        this.showDashboard();

        // Mostrar mensaje de bienvenida
        this.showSuccess(`¡Bienvenido, ${user.username}!`);

        console.log('✅ Login exitoso:', user);
    }

    /**
     * Guarda la sesión del usuario
     */
    saveSession(user, rememberMe) {
        const sessionData = {
            userId: user.id,
            username: user.username,
            role: user.role,
            loginTime: Date.now(),
            rememberMe: rememberMe
        };

        if (rememberMe) {
            localStorage.setItem('saboresAncestrales_session', JSON.stringify(sessionData));
        } else {
            sessionStorage.setItem('saboresAncestrales_session', JSON.stringify(sessionData));
        }
    }

    /**
     * Verifica si hay una sesión existente
     */
    checkExistingSession() {
        let sessionData = null;

        // Buscar en localStorage (remember me)
        const localSession = localStorage.getItem('saboresAncestrales_session');
        if (localSession) {
            sessionData = JSON.parse(localSession);
        }

        // Si no hay en localStorage, buscar en sessionStorage
        if (!sessionData) {
            const sessionStorage = sessionStorage.getItem('saboresAncestrales_session');
            if (sessionStorage) {
                sessionData = JSON.parse(sessionStorage);
            }
        }

        if (sessionData) {
            // Verificar si la sesión no ha expirado
            const now = Date.now();
            const sessionAge = now - sessionData.loginTime;

            if (sessionAge < this.sessionTimeout) {
                // Sesión válida, restaurar
                this.restoreSession(sessionData);
            } else {
                // Sesión expirada, limpiar
                this.clearSession();
            }
        }
    }

    /**
     * Restaura la sesión del usuario
     */
    restoreSession(sessionData) {
        this.currentUser = {
            id: sessionData.userId,
            username: sessionData.username,
            role: sessionData.role
        };
        this.isAuthenticated = true;

        // Iniciar timer de sesión
        this.startSessionTimer();

        // Mostrar dashboard
        this.showDashboard();

        console.log('✅ Sesión restaurada:', this.currentUser);
    }

    /**
     * Inicia el timer de sesión
     */
    startSessionTimer() {
        if (this.sessionTimer) {
            clearTimeout(this.sessionTimer);
        }

        this.sessionTimer = setTimeout(() => {
            this.handleSessionTimeout();
        }, this.sessionTimeout);
    }

    /**
     * Maneja el timeout de sesión
     */
    handleSessionTimeout() {
        this.showError('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        this.handleLogout();
    }

    /**
     * Maneja el logout
     */
    handleLogout() {
        this.currentUser = null;
        this.isAuthenticated = false;

        // Limpiar sesión
        this.clearSession();

        // Detener timer
        if (this.sessionTimer) {
            clearTimeout(this.sessionTimer);
            this.sessionTimer = null;
        }

        // Mostrar login
        this.showLogin();

        console.log('✅ Logout exitoso');
    }

    /**
     * Limpia la sesión
     */
    clearSession() {
        localStorage.removeItem('saboresAncestrales_session');
        sessionStorage.removeItem('saboresAncestrales_session');
    }

    /**
     * Muestra el dashboard
     */
    showDashboard() {
        const loginSection = document.getElementById('loginSection');
        const adminDashboard = document.getElementById('adminDashboard');
        const userName = document.getElementById('userName');

        if (loginSection) loginSection.style.display = 'none';
        if (adminDashboard) adminDashboard.style.display = 'block';
        if (userName && this.currentUser) {
            userName.textContent = this.currentUser.username;
        }
    }

    /**
     * Muestra el formulario de login
     */
    showLogin() {
        const loginSection = document.getElementById('loginSection');
        const adminDashboard = document.getElementById('adminDashboard');

        if (loginSection) loginSection.style.display = 'block';
        if (adminDashboard) adminDashboard.style.display = 'none';

        // Limpiar formulario
        const loginForm = document.getElementById('loginForm');
        if (loginForm) loginForm.reset();

        // Resetear contadores
        const usernameCounter = document.getElementById('usernameCounter');
        const passwordCounter = document.getElementById('passwordCounter');
        if (usernameCounter) usernameCounter.textContent = '0';
        if (passwordCounter) passwordCounter.textContent = '0';
    }

    /**
     * Muestra mensaje de error
     */
    showError(message) {
        // Crear o actualizar elemento de error
        let errorElement = document.getElementById('loginError');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.id = 'loginError';
            errorElement.className = 'login-error';

            const loginForm = document.getElementById('loginForm');
            if (loginForm) {
                loginForm.insertBefore(errorElement, loginForm.firstChild);
            }
        }

        errorElement.textContent = message;
        errorElement.style.display = 'block';

        // Ocultar después de 5 segundos
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 5000);
    }

    /**
     * Muestra mensaje de éxito
     */
    showSuccess(message) {
        // Crear elemento de éxito
        const successElement = document.createElement('div');
        successElement.className = 'login-success';
        successElement.textContent = message;
        successElement.style.display = 'block';

        // Insertar en el dashboard
        const dashboardHeader = document.querySelector('.dashboard-header');
        if (dashboardHeader) {
            dashboardHeader.appendChild(successElement);
        }

        // Ocultar después de 3 segundos
        setTimeout(() => {
            successElement.style.display = 'none';
        }, 3000);
    }

    /**
     * Muestra/oculta el estado de loading
     */
    showLoading(show) {
        const loginBtn = document.querySelector('.login-btn');
        if (loginBtn) {
            if (show) {
                loginBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> Iniciando Sesión...';
                loginBtn.disabled = true;
            } else {
                loginBtn.innerHTML = '<i class="bi bi-box-arrow-in-right"></i> Iniciar Sesión';
                loginBtn.disabled = false;
            }
        }
    }

    /**
     * Verifica si el usuario está autenticado
     */
    isUserAuthenticated() {
        return this.isAuthenticated && this.currentUser !== null;
    }

    /**
     * Obtiene el usuario actual
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Verifica si el usuario tiene un rol específico
     */
    hasRole(role) {
        return this.currentUser && this.currentUser.role === role;
    }
}

// Exportar la clase
window.AuthController = AuthController; 