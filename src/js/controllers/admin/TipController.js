/**
 * Controlador para gestionar los tips de cocina en el panel de administración
 */
export class TipController {
    constructor(tipModel) {
        this.tipModel = tipModel;
        this.currentView = 'list';
        this.editingTip = null;
        this.editingCategory = null;
        this.init();
    }

    /**
     * Inicializa el controlador
     */
    init() {
        this.bindEvents();
        this.loadTips();
    }

    /**
     * Vincula los eventos del DOM
     */
    bindEvents() {
        // Botones del dashboard
        const editTipsBtn = document.querySelector('[data-action="edit-tips"]');
        if (editTipsBtn) {
            editTipsBtn.addEventListener('click', () => this.showTipManager());
        }

        // Eventos delegados para el modal de tips
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-action="add-tip"]')) {
                this.showTipForm();
            }
            if (e.target.matches('[data-action="edit-tip"]')) {
                const tipId = parseInt(e.target.dataset.id);
                this.editTip(tipId);
            }
            if (e.target.matches('[data-action="delete-tip"]')) {
                const tipId = parseInt(e.target.dataset.id);
                this.deleteTip(tipId);
            }
            if (e.target.matches('[data-action="restore-tip"]')) {
                const tipId = parseInt(e.target.dataset.id);
                this.restoreTip(tipId);
            }
            if (e.target.matches('[data-action="toggle-featured-tip"]')) {
                const tipId = parseInt(e.target.dataset.id);
                this.toggleFeaturedTip(tipId);
            }
            if (e.target.matches('[data-action="add-category"]')) {
                this.showCategoryForm();
            }
            if (e.target.matches('[data-action="edit-category"]')) {
                const categoryId = e.target.dataset.id;
                this.editCategory(categoryId);
            }
            if (e.target.matches('[data-action="delete-category"]')) {
                const categoryId = e.target.dataset.id;
                this.deleteCategory(categoryId);
            }
            if (e.target.matches('[data-action="close-modal"]')) {
                this.closeModal();
            }
        });

        // Formularios
        document.addEventListener('submit', (e) => {
            if (e.target.matches('#tipForm')) {
                e.preventDefault();
                this.saveTip(e.target);
            }
            if (e.target.matches('#categoryForm')) {
                e.preventDefault();
                this.saveCategory(e.target);
            }
        });
    }

    /**
     * Carga y muestra los tips
     */
    async loadTips() {
        await this.tipModel.loadTips();
        this.renderTipList();
    }

    /**
     * Muestra el gestor de tips
     */
    showTipManager() {
        this.currentView = 'list';
        this.renderTipManager();
    }

    /**
     * Renderiza el gestor de tips
     */
    renderTipManager() {
        const dashboardContent = document.querySelector('.dashboard-content');
        if (!dashboardContent) return;

        dashboardContent.innerHTML = `
            <div class="tip-manager">
                <div class="manager-header">
                    <h2>Gestión de Tips de Cocina</h2>
                    <div class="manager-actions">
                        <button class="btn btn-primary" data-action="add-tip">
                            <i class="bi bi-plus-circle"></i>
                            Nuevo Tip
                        </button>
                        <button class="btn btn-secondary" data-action="add-category">
                            <i class="bi bi-tags"></i>
                            Nueva Categoría
                        </button>
                        <button class="btn btn-secondary" data-action="export-tips">
                            <i class="bi bi-download"></i>
                            Exportar
                        </button>
                        <button class="btn btn-secondary" data-action="import-tips">
                            <i class="bi bi-upload"></i>
                            Importar
                        </button>
                    </div>
                </div>
                
                <div class="tip-filters">
                    <div class="search-box">
                        <input type="text" id="tipSearch" placeholder="Buscar tips..." class="search-input">
                        <i class="bi bi-search"></i>
                    </div>
                    <div class="filter-buttons">
                        <button class="filter-btn active" data-filter="all">Todos</button>
                        <button class="filter-btn" data-filter="active">Activos</button>
                        <button class="filter-btn" data-filter="inactive">Inactivos</button>
                        <button class="filter-btn" data-filter="featured">Destacados</button>
                    </div>
                    <div class="category-filter">
                        <select id="categoryFilter" class="select-input">
                            <option value="">Todas las categorías</option>
                            ${this.renderCategoryOptions()}
                        </select>
                    </div>
                </div>
                
                <div class="tip-list" id="tipList">
                    ${this.renderTipList()}
                </div>
            </div>
        `;

        this.bindFilterEvents();
        this.bindSearchEvents();
    }

    /**
     * Renderiza las opciones de categorías
     */
    renderCategoryOptions() {
        return this.tipModel.getAllCategories().map(category =>
            `<option value="${category.id}">${category.name}</option>`
        ).join('');
    }

    /**
     * Renderiza la lista de tips
     */
    renderTipList(filter = 'all', category = '', search = '') {
        let tips = this.tipModel.getAllTips();

        // Aplicar filtros
        switch (filter) {
            case 'active':
                tips = tips.filter(t => t.active);
                break;
            case 'inactive':
                tips = tips.filter(t => !t.active);
                break;
            case 'featured':
                tips = tips.filter(t => t.featured && t.active);
                break;
        }

        // Aplicar filtro de categoría
        if (category) {
            tips = tips.filter(t => t.category === category);
        }

        // Aplicar búsqueda
        if (search) {
            tips = this.tipModel.searchTips(search);
        }

        if (tips.length === 0) {
            return `
                <div class="empty-state">
                    <i class="bi bi-lightbulb"></i>
                    <h3>No hay tips</h3>
                    <p>${filter === 'all' && !category && !search ? 'Crea tu primer tip para comenzar.' : 'No hay tips con estos filtros.'}</p>
                </div>
            `;
        }

        return tips.map(tip => {
            const category = this.tipModel.getCategoryById(tip.category);
            return `
                <div class="tip-card ${!tip.active ? 'inactive' : ''}" data-id="${tip.id}">
                    <div class="tip-card-header">
                        <div class="tip-category" style="background-color: ${category?.color || '#ccc'}">
                            ${category?.name || tip.category}
                        </div>
                        <div class="tip-status">
                            ${tip.active ?
                    '<span class="status-badge active">Activo</span>' :
                    '<span class="status-badge inactive">Inactivo</span>'
                }
                            ${tip.featured ?
                    '<span class="status-badge featured">Destacado</span>' : ''
                }
                        </div>
                    </div>
                    
                    <div class="tip-card-content">
                        <h3 class="tip-title">${tip.title}</h3>
                        <p class="tip-content">${tip.content}</p>
                        <div class="tip-meta">
                            <span class="tip-difficulty">${tip.difficulty}</span>
                            <span class="tip-time">${tip.time}</span>
                            <span class="tip-order">Orden: ${tip.order}</span>
                        </div>
                        <div class="tip-tags">
                            ${tip.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                    </div>
                    
                    <div class="tip-card-actions">
                        <button class="btn btn-sm btn-primary" data-action="edit-tip" data-id="${tip.id}">
                            <i class="bi bi-pencil"></i>
                            Editar
                        </button>
                        ${tip.active ?
                    `<button class="btn btn-sm btn-warning" data-action="delete-tip" data-id="${tip.id}">
                                <i class="bi bi-trash"></i>
                                Eliminar
                            </button>` :
                    `<button class="btn btn-sm btn-success" data-action="restore-tip" data-id="${tip.id}">
                                <i class="bi bi-arrow-clockwise"></i>
                                Restaurar
                            </button>`
                }
                        <button class="btn btn-sm ${tip.featured ? 'btn-secondary' : 'btn-outline'}" 
                                data-action="toggle-featured-tip" data-id="${tip.id}">
                            <i class="bi bi-star${tip.featured ? '-fill' : ''}"></i>
                            ${tip.featured ? 'Quitar' : 'Destacar'}
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

        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => this.applyFilters());
        }
    }

    /**
     * Vincula eventos de búsqueda
     */
    bindSearchEvents() {
        const searchInput = document.getElementById('tipSearch');
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
        const categoryFilter = document.getElementById('categoryFilter')?.value || '';
        const searchQuery = document.getElementById('tipSearch')?.value || '';

        const tipList = document.getElementById('tipList');
        if (tipList) {
            tipList.innerHTML = this.renderTipList(activeFilter, categoryFilter, searchQuery);
        }
    }

    /**
     * Muestra el formulario de tip
     */
    showTipForm(tip = null) {
        this.editingTip = tip;
        this.renderTipForm(tip);
    }

    /**
     * Renderiza el formulario de tip
     */
    renderTipForm(tip = null) {
        const isEditing = tip !== null;
        const categories = this.tipModel.getAllCategories();

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3>${isEditing ? 'Editar Tip' : 'Nuevo Tip'}</h3>
                    <button class="btn btn-icon" data-action="close-modal">
                        <i class="bi bi-x-lg"></i>
                    </button>
                </div>
                
                <form id="tipForm" class="modal-content">
                    <div class="form-group">
                        <label for="tipTitle">Título</label>
                        <input type="text" id="tipTitle" name="title" 
                               value="${tip?.title || ''}" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="tipContent">Contenido</label>
                        <textarea id="tipContent" name="content" rows="4" required>${tip?.content || ''}</textarea>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="tipCategory">Categoría</label>
                            <select id="tipCategory" name="category" required>
                                <option value="">Seleccionar categoría</option>
                                ${categories.map(cat =>
            `<option value="${cat.id}" ${tip?.category === cat.id ? 'selected' : ''}>
                                        ${cat.name}
                                    </option>`
        ).join('')}
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="tipDifficulty">Dificultad</label>
                            <select id="tipDifficulty" name="difficulty" required>
                                <option value="facil" ${tip?.difficulty === 'facil' ? 'selected' : ''}>Fácil</option>
                                <option value="medio" ${tip?.difficulty === 'medio' ? 'selected' : ''}>Medio</option>
                                <option value="dificil" ${tip?.difficulty === 'dificil' ? 'selected' : ''}>Difícil</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="tipTime">Tiempo</label>
                            <input type="text" id="tipTime" name="time" 
                                   value="${tip?.time || ''}" placeholder="ej: 5 min" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="tipOrder">Orden</label>
                            <input type="number" id="tipOrder" name="order" 
                                   value="${tip?.order || 1}" min="1" required>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="tipTags">Etiquetas (separadas por comas)</label>
                        <input type="text" id="tipTags" name="tags" 
                               value="${tip?.tags?.join(', ') || ''}" 
                               placeholder="ej: hierbas, refrigerador, frescura">
                    </div>
                    
                    <div class="form-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="tipFeatured" name="featured" 
                                   ${tip?.featured ? 'checked' : ''}>
                            <span class="checkmark"></span>
                            Tip destacado
                        </label>
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
     * Muestra el formulario de categoría
     */
    showCategoryForm(category = null) {
        this.editingCategory = category;
        this.renderCategoryForm(category);
    }

    /**
     * Renderiza el formulario de categoría
     */
    renderCategoryForm(category = null) {
        const isEditing = category !== null;

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3>${isEditing ? 'Editar Categoría' : 'Nueva Categoría'}</h3>
                    <button class="btn btn-icon" data-action="close-modal">
                        <i class="bi bi-x-lg"></i>
                    </button>
                </div>
                
                <form id="categoryForm" class="modal-content">
                    <div class="form-group">
                        <label for="categoryName">Nombre</label>
                        <input type="text" id="categoryName" name="name" 
                               value="${category?.name || ''}" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="categoryColor">Color</label>
                        <input type="color" id="categoryColor" name="color" 
                               value="${category?.color || '#D46528'}" required>
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

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });
    }

    /**
     * Guarda un tip
     */
    async saveTip(form) {
        const formData = new FormData(form);
        const tipData = {
            title: formData.get('title'),
            content: formData.get('content'),
            category: formData.get('category'),
            difficulty: formData.get('difficulty'),
            time: formData.get('time'),
            order: parseInt(formData.get('order')),
            featured: formData.get('featured') === 'on',
            tags: formData.get('tags').split(',').map(tag => tag.trim()).filter(tag => tag)
        };

        try {
            if (this.editingTip) {
                const updated = this.tipModel.updateTip(this.editingTip.id, tipData);
                if (updated) {
                    this.showSuccess('Tip actualizado correctamente');
                } else {
                    this.showError('Error al actualizar el tip');
                }
            } else {
                const created = this.tipModel.createTip(tipData);
                if (created) {
                    this.showSuccess('Tip creado correctamente');
                } else {
                    this.showError('Error al crear el tip');
                }
            }

            this.closeModal();
            this.renderTipList();
        } catch (error) {
            console.error('Error guardando tip:', error);
            this.showError('Error al guardar el tip');
        }
    }

    /**
     * Guarda una categoría
     */
    async saveCategory(form) {
        const formData = new FormData(form);
        const categoryData = {
            name: formData.get('name'),
            color: formData.get('color')
        };

        try {
            if (this.editingCategory) {
                const updated = this.tipModel.updateCategory(this.editingCategory.id, categoryData);
                if (updated) {
                    this.showSuccess('Categoría actualizada correctamente');
                } else {
                    this.showError('Error al actualizar la categoría');
                }
            } else {
                const created = this.tipModel.createCategory(categoryData);
                if (created) {
                    this.showSuccess('Categoría creada correctamente');
                } else {
                    this.showError('Error al crear la categoría');
                }
            }

            this.closeModal();
            this.renderTipManager();
        } catch (error) {
            console.error('Error guardando categoría:', error);
            this.showError('Error al guardar la categoría');
        }
    }

    /**
     * Edita un tip
     */
    editTip(tipId) {
        const tip = this.tipModel.getTipById(tipId);
        if (tip) {
            this.showTipForm(tip);
        }
    }

    /**
     * Edita una categoría
     */
    editCategory(categoryId) {
        const category = this.tipModel.getCategoryById(categoryId);
        if (category) {
            this.showCategoryForm(category);
        }
    }

    /**
     * Elimina un tip
     */
    deleteTip(tipId) {
        if (confirm('¿Estás seguro de que quieres eliminar este tip?')) {
            const deleted = this.tipModel.deleteTip(tipId);
            if (deleted) {
                this.showSuccess('Tip eliminado correctamente');
                this.renderTipList();
            } else {
                this.showError('Error al eliminar el tip');
            }
        }
    }

    /**
     * Elimina una categoría
     */
    deleteCategory(categoryId) {
        if (confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
            const deleted = this.tipModel.deleteCategory(categoryId);
            if (deleted) {
                this.showSuccess('Categoría eliminada correctamente');
                this.renderTipManager();
            } else {
                this.showError('No se puede eliminar la categoría porque tiene tips asociados');
            }
        }
    }

    /**
     * Restaura un tip
     */
    restoreTip(tipId) {
        const restored = this.tipModel.restoreTip(tipId);
        if (restored) {
            this.showSuccess('Tip restaurado correctamente');
            this.renderTipList();
        } else {
            this.showError('Error al restaurar el tip');
        }
    }

    /**
     * Cambia el estado destacado de un tip
     */
    toggleFeaturedTip(tipId) {
        const tip = this.tipModel.getTipById(tipId);
        if (tip) {
            const updated = this.tipModel.updateTip(tipId, {
                featured: !tip.featured
            });
            if (updated) {
                this.showSuccess(`Tip ${updated.featured ? 'destacado' : 'quedó destacado'} correctamente`);
                this.renderTipList();
            } else {
                this.showError('Error al cambiar el estado del tip');
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
        this.editingTip = null;
        this.editingCategory = null;
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