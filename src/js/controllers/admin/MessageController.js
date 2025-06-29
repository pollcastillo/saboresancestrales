/**
 * Controlador para gestionar los mensajes de contacto en el panel de administración
 */
export class MessageController {
    constructor(messageModel) {
        this.messageModel = messageModel;
        this.currentView = 'list';
        this.selectedMessage = null;
        this.init();
    }

    /**
     * Inicializa el controlador
     */
    init() {
        this.bindEvents();
        this.loadMessages();
    }

    /**
     * Vincula los eventos del DOM
     */
    bindEvents() {
        // Botones del dashboard
        const viewMessagesBtn = document.querySelector('[data-action="view-messages"]');
        if (viewMessagesBtn) {
            viewMessagesBtn.addEventListener('click', () => this.showMessageManager());
        }

        // Eventos delegados para el modal de mensajes
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-action="view-message"]')) {
                const messageId = parseInt(e.target.dataset.id);
                this.viewMessage(messageId);
            }
            if (e.target.matches('[data-action="mark-read"]')) {
                const messageId = parseInt(e.target.dataset.id);
                this.markAsRead(messageId);
            }
            if (e.target.matches('[data-action="mark-replied"]')) {
                const messageId = parseInt(e.target.dataset.id);
                this.markAsReplied(messageId);
            }
            if (e.target.matches('[data-action="delete-message"]')) {
                const messageId = parseInt(e.target.dataset.id);
                this.deleteMessage(messageId);
            }
            if (e.target.matches('[data-action="change-priority"]')) {
                const messageId = parseInt(e.target.dataset.id);
                const priority = e.target.dataset.priority;
                this.changePriority(messageId, priority);
            }
            if (e.target.matches('[data-action="close-modal"]')) {
                this.closeModal();
            }
            if (e.target.matches('[data-action="reply-message"]')) {
                const messageId = parseInt(e.target.dataset.id);
                this.showReplyForm(messageId);
            }
        });

        // Formulario de respuesta
        document.addEventListener('submit', (e) => {
            if (e.target.matches('#replyForm')) {
                e.preventDefault();
                this.sendReply(e.target);
            }
        });
    }

    /**
     * Carga y muestra los mensajes
     */
    loadMessages() {
        this.messageModel.loadMessages();
        this.renderMessageList();
    }

    /**
     * Muestra el gestor de mensajes
     */
    showMessageManager() {
        this.currentView = 'list';
        this.renderMessageManager();
    }

    /**
     * Renderiza el gestor de mensajes
     */
    renderMessageManager() {
        const dashboardContent = document.querySelector('.dashboard-content');
        if (!dashboardContent) return;

        const stats = this.messageModel.getMessageStats();

        dashboardContent.innerHTML = `
            <div class="message-manager">
                <div class="manager-header">
                    <h2>Gestión de Mensajes</h2>
                    <div class="message-stats">
                        <div class="stat-card">
                            <div class="stat-number">${stats.total}</div>
                            <div class="stat-label">Total</div>
                        </div>
                        <div class="stat-card unread">
                            <div class="stat-number">${stats.unread}</div>
                            <div class="stat-label">No leídos</div>
                        </div>
                        <div class="stat-card urgent">
                            <div class="stat-number">${stats.priorities.urgent}</div>
                            <div class="stat-label">Urgentes</div>
                        </div>
                        <div class="stat-card replied">
                            <div class="stat-number">${stats.replied}</div>
                            <div class="stat-label">Respondidos</div>
                        </div>
                    </div>
                </div>
                
                <div class="message-filters">
                    <div class="search-box">
                        <input type="text" id="messageSearch" placeholder="Buscar mensajes..." class="search-input">
                        <i class="bi bi-search"></i>
                    </div>
                    <div class="filter-buttons">
                        <button class="filter-btn active" data-filter="all">Todos</button>
                        <button class="filter-btn" data-filter="unread">No leídos</button>
                        <button class="filter-btn" data-filter="read">Leídos</button>
                        <button class="filter-btn" data-filter="replied">Respondidos</button>
                    </div>
                    <div class="priority-filter">
                        <select id="priorityFilter" class="select-input">
                            <option value="">Todas las prioridades</option>
                            <option value="urgent">Urgente</option>
                            <option value="high">Alta</option>
                            <option value="medium">Media</option>
                            <option value="low">Baja</option>
                        </select>
                    </div>
                </div>
                
                <div class="message-list" id="messageList">
                    ${this.renderMessageList()}
                </div>
            </div>
        `;

        this.bindFilterEvents();
        this.bindSearchEvents();
    }

    /**
     * Renderiza la lista de mensajes
     */
    renderMessageList(filter = 'all', priority = '', search = '') {
        let messages = this.messageModel.getAllMessages();

        // Aplicar filtros
        switch (filter) {
            case 'unread':
                messages = messages.filter(m => m.status === 'unread');
                break;
            case 'read':
                messages = messages.filter(m => m.status === 'read');
                break;
            case 'replied':
                messages = messages.filter(m => m.status === 'replied');
                break;
        }

        // Aplicar filtro de prioridad
        if (priority) {
            messages = messages.filter(m => m.priority === priority);
        }

        // Aplicar búsqueda
        if (search) {
            messages = this.messageModel.searchMessages(search);
        }

        if (messages.length === 0) {
            return `
                <div class="empty-state">
                    <i class="bi bi-envelope"></i>
                    <h3>No hay mensajes</h3>
                    <p>${filter === 'all' && !priority && !search ? 'No hay mensajes de contacto.' : 'No hay mensajes con estos filtros.'}</p>
                </div>
            `;
        }

        return messages.map(message => {
            const priorityClass = `priority-${message.priority}`;
            const statusClass = `status-${message.status}`;
            const isUnread = message.status === 'unread';

            return `
                <div class="message-card ${priorityClass} ${statusClass} ${isUnread ? 'unread' : ''}" data-id="${message.id}">
                    <div class="message-header">
                        <div class="message-sender">
                            <div class="sender-avatar">
                                <i class="bi bi-person-circle"></i>
                            </div>
                            <div class="sender-info">
                                <h3 class="sender-name">${message.name}</h3>
                                <p class="sender-email">${message.email}</p>
                                <p class="sender-phone">${message.phone}</p>
                            </div>
                        </div>
                        <div class="message-meta">
                            <div class="message-priority">
                                <span class="priority-badge ${message.priority}">${this.getPriorityLabel(message.priority)}</span>
                            </div>
                            <div class="message-status">
                                <span class="status-badge ${message.status}">${this.getStatusLabel(message.status)}</span>
                            </div>
                            <div class="message-date">
                                ${this.formatDate(message.createdAt)}
                            </div>
                        </div>
                    </div>
                    
                    <div class="message-content">
                        <h4 class="message-subject">${message.subject}</h4>
                        <p class="message-preview">${this.truncateText(message.message, 150)}</p>
                    </div>
                    
                    <div class="message-tags">
                        ${message.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                    
                    <div class="message-actions">
                        <button class="btn btn-sm btn-primary" data-action="view-message" data-id="${message.id}">
                            <i class="bi bi-eye"></i>
                            Ver
                        </button>
                        ${message.status === 'unread' ?
                    `<button class="btn btn-sm btn-secondary" data-action="mark-read" data-id="${message.id}">
                                <i class="bi bi-check-circle"></i>
                                Marcar leído
                            </button>` : ''
                }
                        ${message.status !== 'replied' ?
                    `<button class="btn btn-sm btn-success" data-action="reply-message" data-id="${message.id}">
                                <i class="bi bi-reply"></i>
                                Responder
                            </button>` : ''
                }
                        <button class="btn btn-sm btn-warning" data-action="delete-message" data-id="${message.id}">
                            <i class="bi bi-trash"></i>
                            Eliminar
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Vincula eventos de filtros
     */
    bindFilterEvents() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                filterBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.applyFilters();
            });
        });

        const priorityFilter = document.getElementById('priorityFilter');
        if (priorityFilter) {
            priorityFilter.addEventListener('change', () => this.applyFilters());
        }
    }

    /**
     * Vincula eventos de búsqueda
     */
    bindSearchEvents() {
        const searchInput = document.getElementById('messageSearch');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.applyFilters();
                }, 300);
            });
        }
    }

    /**
     * Aplica todos los filtros
     */
    applyFilters() {
        const activeFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
        const priorityFilter = document.getElementById('priorityFilter')?.value || '';
        const searchQuery = document.getElementById('messageSearch')?.value || '';

        const messageList = document.getElementById('messageList');
        if (messageList) {
            messageList.innerHTML = this.renderMessageList(activeFilter, priorityFilter, searchQuery);
        }
    }

    /**
     * Muestra un mensaje completo
     */
    viewMessage(messageId) {
        const message = this.messageModel.getMessageById(messageId);
        if (!message) return;

        // Marcar como leído si no lo está
        if (message.status === 'unread') {
            this.messageModel.markAsRead(messageId);
        }

        this.selectedMessage = message;
        this.renderMessageView(message);
    }

    /**
     * Renderiza la vista completa de un mensaje
     */
    renderMessageView(message) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal modal-large">
                <div class="modal-header">
                    <h3>${message.subject}</h3>
                    <button class="btn btn-icon" data-action="close-modal">
                        <i class="bi bi-x-lg"></i>
                    </button>
                </div>
                
                <div class="modal-content">
                    <div class="message-details">
                        <div class="message-sender-details">
                            <div class="sender-avatar-large">
                                <i class="bi bi-person-circle"></i>
                            </div>
                            <div class="sender-info-large">
                                <h4>${message.name}</h4>
                                <p><i class="bi bi-envelope"></i> ${message.email}</p>
                                <p><i class="bi bi-telephone"></i> ${message.phone}</p>
                                <p><i class="bi bi-calendar"></i> ${this.formatDate(message.createdAt)}</p>
                            </div>
                        </div>
                        
                        <div class="message-status-details">
                            <div class="status-item">
                                <strong>Estado:</strong> 
                                <span class="status-badge ${message.status}">${this.getStatusLabel(message.status)}</span>
                            </div>
                            <div class="status-item">
                                <strong>Prioridad:</strong> 
                                <span class="priority-badge ${message.priority}">${this.getPriorityLabel(message.priority)}</span>
                            </div>
                            ${message.readAt ? `
                                <div class="status-item">
                                    <strong>Leído:</strong> ${this.formatDate(message.readAt)}
                                </div>
                            ` : ''}
                            ${message.repliedAt ? `
                                <div class="status-item">
                                    <strong>Respondido:</strong> ${this.formatDate(message.repliedAt)}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    
                    <div class="message-content-full">
                        <h4>Mensaje:</h4>
                        <div class="message-text">
                            ${message.message.replace(/\n/g, '<br>')}
                        </div>
                    </div>
                    
                    <div class="message-tags-full">
                        <h4>Etiquetas:</h4>
                        <div class="tags-container">
                            ${message.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                    </div>
                    
                    <div class="message-actions-full">
                        ${message.status !== 'replied' ?
                `<button class="btn btn-primary" data-action="reply-message" data-id="${message.id}">
                                <i class="bi bi-reply"></i>
                                Responder
                            </button>` : ''
            }
                        <button class="btn btn-secondary" data-action="mark-replied" data-id="${message.id}">
                            <i class="bi bi-check-double"></i>
                            Marcar como respondido
                        </button>
                        <button class="btn btn-warning" data-action="delete-message" data-id="${message.id}">
                            <i class="bi bi-trash"></i>
                            Eliminar
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.bindModalEvents(modal);
    }

    /**
     * Muestra el formulario de respuesta
     */
    showReplyForm(messageId) {
        const message = this.messageModel.getMessageById(messageId);
        if (!message) return;

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3>Responder a ${message.name}</h3>
                    <button class="btn btn-icon" data-action="close-modal">
                        <i class="bi bi-x-lg"></i>
                    </button>
                </div>
                
                <form id="replyForm" class="modal-content">
                    <input type="hidden" name="messageId" value="${message.id}">
                    
                    <div class="form-group">
                        <label for="replyTo">Para:</label>
                        <input type="email" id="replyTo" name="to" value="${message.email}" readonly>
                    </div>
                    
                    <div class="form-group">
                        <label for="replySubject">Asunto:</label>
                        <input type="text" id="replySubject" name="subject" 
                               value="Re: ${message.subject}" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="replyMessage">Mensaje:</label>
                        <textarea id="replyMessage" name="message" rows="8" required 
                                  placeholder="Escribe tu respuesta aquí..."></textarea>
                    </div>
                    
                    <div class="modal-actions">
                        <button type="button" class="btn btn-secondary" data-action="close-modal">
                            Cancelar
                        </button>
                        <button type="submit" class="btn btn-primary">
                            <i class="bi bi-send"></i>
                            Enviar Respuesta
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

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });
    }

    /**
     * Envía una respuesta
     */
    async sendReply(form) {
        const formData = new FormData(form);
        const messageId = parseInt(formData.get('messageId'));
        const replyData = {
            to: formData.get('to'),
            subject: formData.get('subject'),
            message: formData.get('message')
        };

        try {
            // Aquí normalmente enviarías el email
            // Por ahora solo simulamos el envío
            console.log('Enviando respuesta:', replyData);

            // Marcar como respondido
            this.messageModel.markAsReplied(messageId);

            this.showSuccess('Respuesta enviada correctamente');
            this.closeModal();
            this.renderMessageList();
        } catch (error) {
            console.error('Error enviando respuesta:', error);
            this.showError('Error al enviar la respuesta');
        }
    }

    /**
     * Marca un mensaje como leído
     */
    markAsRead(messageId) {
        const marked = this.messageModel.markAsRead(messageId);
        if (marked) {
            this.showSuccess('Mensaje marcado como leído');
            this.renderMessageList();
        } else {
            this.showError('Error al marcar el mensaje');
        }
    }

    /**
     * Marca un mensaje como respondido
     */
    markAsReplied(messageId) {
        const marked = this.messageModel.markAsReplied(messageId);
        if (marked) {
            this.showSuccess('Mensaje marcado como respondido');
            this.renderMessageList();
        } else {
            this.showError('Error al marcar el mensaje');
        }
    }

    /**
     * Elimina un mensaje
     */
    deleteMessage(messageId) {
        if (confirm('¿Estás seguro de que quieres eliminar este mensaje?')) {
            const deleted = this.messageModel.deleteMessage(messageId);
            if (deleted) {
                this.showSuccess('Mensaje eliminado correctamente');
                this.renderMessageList();
            } else {
                this.showError('Error al eliminar el mensaje');
            }
        }
    }

    /**
     * Cambia la prioridad de un mensaje
     */
    changePriority(messageId, priority) {
        const changed = this.messageModel.changePriority(messageId, priority);
        if (changed) {
            this.showSuccess('Prioridad cambiada correctamente');
            this.renderMessageList();
        } else {
            this.showError('Error al cambiar la prioridad');
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
        this.selectedMessage = null;
    }

    /**
     * Obtiene la etiqueta de prioridad
     */
    getPriorityLabel(priority) {
        const labels = {
            urgent: 'Urgente',
            high: 'Alta',
            medium: 'Media',
            low: 'Baja'
        };
        return labels[priority] || priority;
    }

    /**
     * Obtiene la etiqueta de estado
     */
    getStatusLabel(status) {
        const labels = {
            unread: 'No leído',
            read: 'Leído',
            replied: 'Respondido'
        };
        return labels[status] || status;
    }

    /**
     * Formatea una fecha
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
     * Trunca un texto
     */
    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    /**
     * Muestra mensaje de éxito
     */
    showSuccess(message) {
        console.log('✅', message);
    }

    /**
     * Muestra mensaje de error
     */
    showError(message) {
        console.error('❌', message);
    }
} 