/**
 * Modelo de Usuario para el sistema de administración
 */
export class UserModel {
    constructor() {
        this.users = [];
        this.currentUser = null;
        this.loadUsers();
    }

    /**
     * Carga los usuarios desde el archivo JSON
     */
    async loadUsers() {
        try {
            const response = await fetch('src/data/users.json');
            const data = await response.json();
            this.users = data.users;
        } catch (error) {
            console.error('Error cargando usuarios:', error);
            this.users = [];
        }
    }

    /**
     * Autentica un usuario por primer nombre y cédula
     * @param {string} firstName - Primer nombre del usuario
     * @param {string} cedula - Número de cédula
     * @returns {Object|null} - Usuario autenticado o null si no se encuentra
     */
    authenticate(firstName, cedula) {
        const user = this.users.find(u =>
            u.active &&
            u.username.toLowerCase() === firstName.toLowerCase() &&
            u.cedula === cedula
        );

        if (user) {
            this.currentUser = user;
            this.updateLastLogin(user.id);
            return user;
        }

        return null;
    }

    /**
     * Actualiza la fecha del último login
     * @param {number} userId - ID del usuario
     */
    updateLastLogin(userId) {
        const user = this.users.find(u => u.id === userId);
        if (user) {
            user.lastLogin = new Date().toISOString();
        }
    }

    /**
     * Obtiene el usuario actual
     * @returns {Object|null} - Usuario actual o null
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Cierra la sesión del usuario actual
     */
    logout() {
        this.currentUser = null;
    }

    /**
     * Obtiene todos los usuarios
     * @returns {Array} - Lista de usuarios
     */
    getAllUsers() {
        return this.users;
    }

    /**
     * Obtiene un usuario por ID
     * @param {number} id - ID del usuario
     * @returns {Object|null} - Usuario encontrado o null
     */
    getUserById(id) {
        return this.users.find(u => u.id === id) || null;
    }

    /**
     * Verifica si un usuario está autenticado
     * @returns {boolean} - True si hay un usuario autenticado
     */
    isAuthenticated() {
        return this.currentUser !== null;
    }

    /**
     * Obtiene información básica del usuario para mostrar en el dashboard
     * @returns {Object} - Información del usuario
     */
    getUserInfo() {
        if (!this.currentUser) return null;

        return {
            id: this.currentUser.id,
            username: this.currentUser.username,
            fullName: this.currentUser.fullName,
            role: this.currentUser.role,
            lastLogin: this.currentUser.lastLogin
        };
    }
} 