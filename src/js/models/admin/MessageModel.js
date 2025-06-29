/**
 * Modelo para gestionar los mensajes de contacto
 */
export class MessageModel {
    constructor() {
        this.messages = [];
        this.loadMessages();
    }

    /**
     * Carga los mensajes desde localStorage
     */
    loadMessages() {
        try {
            const stored = localStorage.getItem('contactMessages');
            if (stored) {
                this.messages = JSON.parse(stored);
            } else {
                this.messages = this.getDefaultMessages();
                this.saveMessages();
            }
        } catch (error) {
            console.error('Error cargando mensajes:', error);
            this.messages = this.getDefaultMessages();
        }
    }

    /**
     * Obtiene mensajes por defecto
     */
    getDefaultMessages() {
        return [
            {
                id: 1,
                name: "Juan Pérez",
                email: "juan.perez@email.com",
                phone: "+57 300 123 4567",
                subject: "Consulta sobre catering empresarial",
                message: "Hola, me gustaría obtener información sobre sus servicios de catering para un evento corporativo de 50 personas. ¿Podrían enviarme un presupuesto?",
                status: "unread",
                priority: "medium",
                createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 día atrás
                updatedAt: new Date(Date.now() - 86400000).toISOString(),
                readAt: null,
                repliedAt: null,
                tags: ["catering", "empresarial", "presupuesto"]
            },
            {
                id: 2,
                name: "María González",
                email: "maria.gonzalez@email.com",
                phone: "+57 310 987 6543",
                subject: "Evento de boda",
                message: "Estoy organizando mi boda y necesito un servicio de catering para 100 invitados. ¿Tienen experiencia en eventos de boda?",
                status: "read",
                priority: "high",
                createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 días atrás
                updatedAt: new Date(Date.now() - 172800000).toISOString(),
                readAt: new Date(Date.now() - 86400000).toISOString(),
                repliedAt: null,
                tags: ["boda", "evento", "catering"]
            },
            {
                id: 3,
                name: "Carlos Rodríguez",
                email: "carlos.rodriguez@empresa.com",
                phone: "+57 315 555 1234",
                subject: "Servicio regular para oficina",
                message: "Buenos días, estamos interesados en contratar un servicio de catering regular para nuestra oficina. Somos 25 personas y necesitaríamos almuerzo de lunes a viernes.",
                status: "replied",
                priority: "high",
                createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 días atrás
                updatedAt: new Date(Date.now() - 86400000).toISOString(),
                readAt: new Date(Date.now() - 172800000).toISOString(),
                repliedAt: new Date(Date.now() - 86400000).toISOString(),
                tags: ["oficina", "regular", "almuerzo"]
            }
        ];
    }

    /**
     * Obtiene todos los mensajes
     * @returns {Array} - Lista de mensajes
     */
    getAllMessages() {
        return this.messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    /**
     * Obtiene mensajes no leídos
     * @returns {Array} - Lista de mensajes no leídos
     */
    getUnreadMessages() {
        return this.messages.filter(message => message.status === 'unread');
    }

    /**
     * Obtiene mensajes leídos
     * @returns {Array} - Lista de mensajes leídos
     */
    getReadMessages() {
        return this.messages.filter(message => message.status === 'read');
    }

    /**
     * Obtiene mensajes respondidos
     * @returns {Array} - Lista de mensajes respondidos
     */
    getRepliedMessages() {
        return this.messages.filter(message => message.status === 'replied');
    }

    /**
     * Obtiene mensajes por prioridad
     * @param {string} priority - Prioridad a filtrar
     * @returns {Array} - Lista de mensajes de la prioridad
     */
    getMessagesByPriority(priority) {
        return this.messages.filter(message => message.priority === priority);
    }

    /**
     * Obtiene un mensaje por ID
     * @param {number} id - ID del mensaje
     * @returns {Object|null} - Mensaje encontrado o null
     */
    getMessageById(id) {
        return this.messages.find(message => message.id === id) || null;
    }

    /**
     * Crea un nuevo mensaje
     * @param {Object} messageData - Datos del mensaje
     * @returns {Object} - Mensaje creado
     */
    createMessage(messageData) {
        const newMessage = {
            id: this.getNextMessageId(),
            ...messageData,
            status: 'unread',
            priority: this.determinePriority(messageData),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            readAt: null,
            repliedAt: null,
            tags: this.extractTags(messageData.message)
        };

        this.messages.push(newMessage);
        this.saveMessages();
        return newMessage;
    }

    /**
     * Actualiza un mensaje existente
     * @param {number} id - ID del mensaje
     * @param {Object} messageData - Datos actualizados
     * @returns {Object|null} - Mensaje actualizado o null
     */
    updateMessage(id, messageData) {
        const messageIndex = this.messages.findIndex(message => message.id === id);

        if (messageIndex === -1) return null;

        this.messages[messageIndex] = {
            ...this.messages[messageIndex],
            ...messageData,
            updatedAt: new Date().toISOString()
        };

        this.saveMessages();
        return this.messages[messageIndex];
    }

    /**
     * Marca un mensaje como leído
     * @param {number} id - ID del mensaje
     * @returns {boolean} - True si se marcó correctamente
     */
    markAsRead(id) {
        const message = this.getMessageById(id);
        if (!message) return false;

        message.status = 'read';
        message.readAt = new Date().toISOString();
        message.updatedAt = new Date().toISOString();
        this.saveMessages();
        return true;
    }

    /**
     * Marca un mensaje como respondido
     * @param {number} id - ID del mensaje
     * @returns {boolean} - True si se marcó correctamente
     */
    markAsReplied(id) {
        const message = this.getMessageById(id);
        if (!message) return false;

        message.status = 'replied';
        message.repliedAt = new Date().toISOString();
        message.updatedAt = new Date().toISOString();
        this.saveMessages();
        return true;
    }

    /**
     * Elimina un mensaje
     * @param {number} id - ID del mensaje
     * @returns {boolean} - True si se eliminó correctamente
     */
    deleteMessage(id) {
        const messageIndex = this.messages.findIndex(message => message.id === id);
        if (messageIndex === -1) return false;

        this.messages.splice(messageIndex, 1);
        this.saveMessages();
        return true;
    }

    /**
     * Restaura un mensaje eliminado
     * @param {number} id - ID del mensaje
     * @returns {boolean} - True si se restauró correctamente
     */
    restoreMessage(id) {
        // En este caso, como eliminamos completamente, no hay restauración
        // Pero podríamos implementar un sistema de papelera
        return false;
    }

    /**
     * Cambia la prioridad de un mensaje
     * @param {number} id - ID del mensaje
     * @param {string} priority - Nueva prioridad
     * @returns {boolean} - True si se cambió correctamente
     */
    changePriority(id, priority) {
        const message = this.getMessageById(id);
        if (!message) return false;

        message.priority = priority;
        message.updatedAt = new Date().toISOString();
        this.saveMessages();
        return true;
    }

    /**
     * Añade etiquetas a un mensaje
     * @param {number} id - ID del mensaje
     * @param {Array} tags - Etiquetas a añadir
     * @returns {boolean} - True si se añadieron correctamente
     */
    addTags(id, tags) {
        const message = this.getMessageById(id);
        if (!message) return false;

        const newTags = tags.filter(tag => !message.tags.includes(tag));
        message.tags = [...message.tags, ...newTags];
        message.updatedAt = new Date().toISOString();
        this.saveMessages();
        return true;
    }

    /**
     * Elimina etiquetas de un mensaje
     * @param {number} id - ID del mensaje
     * @param {Array} tags - Etiquetas a eliminar
     * @returns {boolean} - True si se eliminaron correctamente
     */
    removeTags(id, tags) {
        const message = this.getMessageById(id);
        if (!message) return false;

        message.tags = message.tags.filter(tag => !tags.includes(tag));
        message.updatedAt = new Date().toISOString();
        this.saveMessages();
        return true;
    }

    /**
     * Obtiene el siguiente ID de mensaje disponible
     * @returns {number} - Siguiente ID
     */
    getNextMessageId() {
        const maxId = Math.max(...this.messages.map(message => message.id), 0);
        return maxId + 1;
    }

    /**
     * Determina la prioridad de un mensaje basado en su contenido
     * @param {Object} messageData - Datos del mensaje
     * @returns {string} - Prioridad determinada
     */
    determinePriority(messageData) {
        const urgentKeywords = ['urgente', 'inmediato', 'hoy', 'mañana', 'emergencia'];
        const highKeywords = ['boda', 'evento', 'importante', 'presupuesto', 'contrato'];

        const content = `${messageData.subject} ${messageData.message}`.toLowerCase();

        if (urgentKeywords.some(keyword => content.includes(keyword))) {
            return 'urgent';
        } else if (highKeywords.some(keyword => content.includes(keyword))) {
            return 'high';
        } else {
            return 'medium';
        }
    }

    /**
     * Extrae etiquetas del contenido del mensaje
     * @param {string} message - Contenido del mensaje
     * @returns {Array} - Etiquetas extraídas
     */
    extractTags(message) {
        const commonTags = [
            'catering', 'evento', 'boda', 'empresarial', 'presupuesto', 'contrato',
            'oficina', 'almuerzo', 'cena', 'desayuno', 'coffee break', 'cocktail',
            'vegetariano', 'vegano', 'sin gluten', 'orgánico', 'tradicional'
        ];

        const content = message.toLowerCase();
        return commonTags.filter(tag => content.includes(tag));
    }

    /**
     * Guarda los mensajes en localStorage
     */
    saveMessages() {
        try {
            localStorage.setItem('contactMessages', JSON.stringify(this.messages));
        } catch (error) {
            console.error('Error guardando mensajes:', error);
        }
    }

    /**
     * Exporta los mensajes a JSON
     * @returns {string} - JSON string de los mensajes
     */
    exportMessages() {
        return JSON.stringify({
            messages: this.messages,
            exportedAt: new Date().toISOString()
        }, null, 2);
    }

    /**
     * Importa mensajes desde JSON
     * @param {string} jsonData - JSON string con los mensajes
     * @returns {boolean} - True si se importó correctamente
     */
    importMessages(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            if (data.messages && Array.isArray(data.messages)) {
                this.messages = data.messages;
                this.saveMessages();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error importando mensajes:', error);
            return false;
        }
    }

    /**
     * Busca mensajes por texto
     * @param {string} query - Texto a buscar
     * @returns {Array} - Mensajes que coinciden con la búsqueda
     */
    searchMessages(query) {
        const searchTerm = query.toLowerCase();
        return this.messages.filter(message =>
            message.name.toLowerCase().includes(searchTerm) ||
            message.email.toLowerCase().includes(searchTerm) ||
            message.subject.toLowerCase().includes(searchTerm) ||
            message.message.toLowerCase().includes(searchTerm) ||
            message.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
    }

    /**
     * Obtiene estadísticas de mensajes
     * @returns {Object} - Estadísticas de mensajes
     */
    getMessageStats() {
        const total = this.messages.length;
        const unread = this.getUnreadMessages().length;
        const read = this.getReadMessages().length;
        const replied = this.getRepliedMessages().length;

        const urgent = this.getMessagesByPriority('urgent').length;
        const high = this.getMessagesByPriority('high').length;
        const medium = this.getMessagesByPriority('medium').length;
        const low = this.getMessagesByPriority('low').length;

        const today = new Date().toDateString();
        const todayMessages = this.messages.filter(message =>
            new Date(message.createdAt).toDateString() === today
        ).length;

        const thisWeek = this.getMessagesFromLastDays(7).length;
        const thisMonth = this.getMessagesFromLastDays(30).length;

        return {
            total,
            unread,
            read,
            replied,
            priorities: { urgent, high, medium, low },
            recent: { today: todayMessages, week: thisWeek, month: thisMonth }
        };
    }

    /**
     * Obtiene mensajes de los últimos N días
     * @param {number} days - Número de días
     * @returns {Array} - Mensajes de los últimos días
     */
    getMessagesFromLastDays(days) {
        const cutoffDate = new Date(Date.now() - (days * 24 * 60 * 60 * 1000));
        return this.messages.filter(message =>
            new Date(message.createdAt) >= cutoffDate
        );
    }

    /**
     * Limpia mensajes antiguos
     * @param {number} days - Días de antigüedad para eliminar
     * @returns {number} - Número de mensajes eliminados
     */
    cleanupOldMessages(days) {
        const cutoffDate = new Date(Date.now() - (days * 24 * 60 * 60 * 1000));
        const initialCount = this.messages.length;

        this.messages = this.messages.filter(message =>
            new Date(message.createdAt) >= cutoffDate
        );

        const deletedCount = initialCount - this.messages.length;
        this.saveMessages();
        return deletedCount;
    }
} 