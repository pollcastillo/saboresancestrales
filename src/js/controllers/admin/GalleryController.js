/**
 * Controlador para gestionar la galería de imágenes en el panel de administración
 */
export class GalleryController {
    constructor(galleryModel) {
        this.galleryModel = galleryModel;
        this.currentView = 'list';
        this.editingImage = null;
        this.editingCategory = null;
        this.init();
    }

    /**
     * Inicializa el controlador
     */
    init() {
        this.bindEvents();
        this.loadGallery();
    }

    /**
     * Vincula los eventos del DOM
     */
    bindEvents() {
        // Botones del dashboard
        const editGalleryBtn = document.querySelector('[data-action="edit-gallery"]');
        if (editGalleryBtn) {
            editGalleryBtn.addEventListener('click', () => this.showGalleryManager());
        }

        // Eventos delegados para el modal de galería
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-action="add-image"]')) {
                this.showImageForm();
            }
            if (e.target.matches('[data-action="edit-image"]')) {
                const imageId = parseInt(e.target.dataset.id);
                this.editImage(imageId);
            }
            if (e.target.matches('[data-action="delete-image"]')) {
                const imageId = parseInt(e.target.dataset.id);
                this.deleteImage(imageId);
            }
            if (e.target.matches('[data-action="restore-image"]')) {
                const imageId = parseInt(e.target.dataset.id);
                this.restoreImage(imageId);
            }
            if (e.target.matches('[data-action="toggle-featured-image"]')) {
                const imageId = parseInt(e.target.dataset.id);
                this.toggleFeaturedImage(imageId);
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
            if (e.target.matches('[data-action="preview-image"]')) {
                const imageId = parseInt(e.target.dataset.id);
                this.previewImage(imageId);
            }
        });

        // Formularios
        document.addEventListener('submit', (e) => {
            if (e.target.matches('#imageForm')) {
                e.preventDefault();
                this.saveImage(e.target);
            }
            if (e.target.matches('#categoryForm')) {
                e.preventDefault();
                this.saveCategory(e.target);
            }
        });
    }

    /**
     * Carga y muestra la galería
     */
    async loadGallery() {
        await this.galleryModel.loadGallery();
        this.renderImageList();
    }

    /**
     * Muestra el gestor de galería
     */
    showGalleryManager() {
        this.currentView = 'list';
        this.renderGalleryManager();
    }

    /**
     * Renderiza el gestor de galería
     */
    renderGalleryManager() {
        const dashboardContent = document.querySelector('.dashboard-content');
        if (!dashboardContent) return;

        dashboardContent.innerHTML = `
            <div class="gallery-manager">
                <div class="manager-header">
                    <h2>Gestión de Galería</h2>
                    <div class="manager-actions">
                        <button class="btn btn-primary" data-action="add-image">
                            <i class="bi bi-plus-circle"></i>
                            Nueva Imagen
                        </button>
                        <button class="btn btn-secondary" data-action="add-category">
                            <i class="bi bi-tags"></i>
                            Nueva Categoría
                        </button>
                        <button class="btn btn-secondary" data-action="export-gallery">
                            <i class="bi bi-download"></i>
                            Exportar
                        </button>
                        <button class="btn btn-secondary" data-action="import-gallery">
                            <i class="bi bi-upload"></i>
                            Importar
                        </button>
                    </div>
                </div>
                
                <div class="gallery-filters">
                    <div class="search-box">
                        <input type="text" id="imageSearch" placeholder="Buscar imágenes..." class="search-input">
                        <i class="bi bi-search"></i>
                    </div>
                    <div class="filter-buttons">
                        <button class="filter-btn active" data-filter="all">Todas</button>
                        <button class="filter-btn" data-filter="active">Activas</button>
                        <button class="filter-btn" data-filter="inactive">Inactivas</button>
                        <button class="filter-btn" data-filter="featured">Destacadas</button>
                    </div>
                    <div class="category-filter">
                        <select id="categoryFilter" class="select-input">
                            <option value="">Todas las categorías</option>
                            ${this.renderCategoryOptions()}
                        </select>
                    </div>
                </div>
                
                <div class="gallery-grid" id="imageGrid">
                    ${this.renderImageGrid()}
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
        return this.galleryModel.getAllCategories().map(category =>
            `<option value="${category.id}">${category.name}</option>`
        ).join('');
    }

    /**
     * Renderiza la cuadrícula de imágenes
     */
    renderImageGrid(filter = 'all', category = '', search = '') {
        let images = this.galleryModel.getAllImages();

        // Aplicar filtros
        switch (filter) {
            case 'active':
                images = images.filter(i => i.active);
                break;
            case 'inactive':
                images = images.filter(i => !i.active);
                break;
            case 'featured':
                images = images.filter(i => i.featured && i.active);
                break;
        }

        // Aplicar filtro de categoría
        if (category) {
            images = images.filter(i => i.category === category);
        }

        // Aplicar búsqueda
        if (search) {
            images = this.galleryModel.searchImages(search);
        }

        if (images.length === 0) {
            return `
                <div class="empty-state">
                    <i class="bi bi-images"></i>
                    <h3>No hay imágenes</h3>
                    <p>${filter === 'all' && !category && !search ? 'Añade tu primera imagen para comenzar.' : 'No hay imágenes con estos filtros.'}</p>
                </div>
            `;
        }

        return images.map(image => {
            const category = this.galleryModel.getCategoryById(image.category);
            return `
                <div class="image-card ${!image.active ? 'inactive' : ''}" data-id="${image.id}">
                    <div class="image-preview">
                        <img src="${image.url}" alt="${image.alt}" loading="lazy">
                        <div class="image-overlay">
                            <button class="btn btn-sm btn-primary" data-action="preview-image" data-id="${image.id}">
                                <i class="bi bi-eye"></i>
                                Vista previa
                            </button>
                            <button class="btn btn-sm btn-secondary" data-action="edit-image" data-id="${image.id}">
                                <i class="bi bi-pencil"></i>
                                Editar
                            </button>
                        </div>
                    </div>
                    
                    <div class="image-info">
                        <div class="image-header">
                            <h3 class="image-title">${image.title}</h3>
                            <div class="image-status">
                                ${image.active ?
                    '<span class="status-badge active">Activa</span>' :
                    '<span class="status-badge inactive">Inactiva</span>'
                }
                                ${image.featured ?
                    '<span class="status-badge featured">Destacada</span>' : ''
                }
                            </div>
                        </div>
                        
                        <p class="image-description">${image.description}</p>
                        
                        <div class="image-meta">
                            <span class="image-category" style="background-color: ${category?.color || '#ccc'}">
                                ${category?.name || image.category}
                            </span>
                            <span class="image-order">Orden: ${image.order}</span>
                        </div>
                        
                        <div class="image-tags">
                            ${image.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                    </div>
                    
                    <div class="image-actions">
                        <button class="btn btn-sm btn-primary" data-action="edit-image" data-id="${image.id}">
                            <i class="bi bi-pencil"></i>
                            Editar
                        </button>
                        ${image.active ?
                    `<button class="btn btn-sm btn-warning" data-action="delete-image" data-id="${image.id}">
                                <i class="bi bi-trash"></i>
                                Eliminar
                            </button>` :
                    `<button class="btn btn-sm btn-success" data-action="restore-image" data-id="${image.id}">
                                <i class="bi bi-arrow-clockwise"></i>
                                Restaurar
                            </button>`
                }
                        <button class="btn btn-sm ${image.featured ? 'btn-secondary' : 'btn-outline'}" 
                                data-action="toggle-featured-image" data-id="${image.id}">
                            <i class="bi bi-star${image.featured ? '-fill' : ''}"></i>
                            ${image.featured ? 'Quitar' : 'Destacar'}
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
        const searchInput = document.getElementById('imageSearch');
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
        const searchQuery = document.getElementById('imageSearch')?.value || '';

        const imageGrid = document.getElementById('imageGrid');
        if (imageGrid) {
            imageGrid.innerHTML = this.renderImageGrid(activeFilter, categoryFilter, searchQuery);
        }
    }

    /**
     * Muestra el formulario de imagen
     */
    showImageForm(image = null) {
        this.editingImage = image;
        this.renderImageForm(image);
    }

    /**
     * Renderiza el formulario de imagen
     */
    renderImageForm(image = null) {
        const isEditing = image !== null;
        const categories = this.galleryModel.getAllCategories();

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3>${isEditing ? 'Editar Imagen' : 'Nueva Imagen'}</h3>
                    <button class="btn btn-icon" data-action="close-modal">
                        <i class="bi bi-x-lg"></i>
                    </button>
                </div>
                
                <form id="imageForm" class="modal-content">
                    <div class="form-group">
                        <label for="imageTitle">Título</label>
                        <input type="text" id="imageTitle" name="title" 
                               value="${image?.title || ''}" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="imageDescription">Descripción</label>
                        <textarea id="imageDescription" name="description" rows="3" required>${image?.description || ''}</textarea>
                    </div>
                    
                    <div class="form-group">
                        <label for="imageUrl">URL de la imagen</label>
                        <input type="url" id="imageUrl" name="url" 
                               value="${image?.url || ''}" required>
                        <small>Ingresa la URL de la imagen (ej: https://images.unsplash.com/...)</small>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="imageCategory">Categoría</label>
                            <select id="imageCategory" name="category" required>
                                <option value="">Seleccionar categoría</option>
                                ${categories.map(cat =>
            `<option value="${cat.id}" ${image?.category === cat.id ? 'selected' : ''}>
                                        ${cat.name}
                                    </option>`
        ).join('')}
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="imageOrder">Orden</label>
                            <input type="number" id="imageOrder" name="order" 
                                   value="${image?.order || 1}" min="1" required>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="imageAlt">Texto alternativo (alt)</label>
                        <input type="text" id="imageAlt" name="alt" 
                               value="${image?.alt || ''}" required>
                        <small>Descripción de la imagen para accesibilidad</small>
                    </div>
                    
                    <div class="form-group">
                        <label for="imageTags">Etiquetas (separadas por comas)</label>
                        <input type="text" id="imageTags" name="tags" 
                               value="${image?.tags?.join(', ') || ''}" 
                               placeholder="ej: plato, principal, fresco">
                    </div>
                    
                    <div class="form-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="imageFeatured" name="featured" 
                                   ${image?.featured ? 'checked' : ''}>
                            <span class="checkmark"></span>
                            Imagen destacada
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
     * Guarda una imagen
     */
    async saveImage(form) {
        const formData = new FormData(form);
        const imageData = {
            title: formData.get('title'),
            description: formData.get('description'),
            url: formData.get('url'),
            category: formData.get('category'),
            order: parseInt(formData.get('order')),
            alt: formData.get('alt'),
            featured: formData.get('featured') === 'on',
            tags: formData.get('tags').split(',').map(tag => tag.trim()).filter(tag => tag)
        };

        try {
            // Validar URL de imagen
            const isValidUrl = await this.galleryModel.validateImageUrl(imageData.url);
            if (!isValidUrl) {
                this.showError('La URL de la imagen no es válida o no se puede acceder');
                return;
            }

            if (this.editingImage) {
                const updated = this.galleryModel.updateImage(this.editingImage.id, imageData);
                if (updated) {
                    this.showSuccess('Imagen actualizada correctamente');
                } else {
                    this.showError('Error al actualizar la imagen');
                }
            } else {
                const created = this.galleryModel.createImage(imageData);
                if (created) {
                    this.showSuccess('Imagen creada correctamente');
                } else {
                    this.showError('Error al crear la imagen');
                }
            }

            this.closeModal();
            this.renderImageGrid();
        } catch (error) {
            console.error('Error guardando imagen:', error);
            this.showError('Error al guardar la imagen');
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
                const updated = this.galleryModel.updateCategory(this.editingCategory.id, categoryData);
                if (updated) {
                    this.showSuccess('Categoría actualizada correctamente');
                } else {
                    this.showError('Error al actualizar la categoría');
                }
            } else {
                const created = this.galleryModel.createCategory(categoryData);
                if (created) {
                    this.showSuccess('Categoría creada correctamente');
                } else {
                    this.showError('Error al crear la categoría');
                }
            }

            this.closeModal();
            this.renderGalleryManager();
        } catch (error) {
            console.error('Error guardando categoría:', error);
            this.showError('Error al guardar la categoría');
        }
    }

    /**
     * Edita una imagen
     */
    editImage(imageId) {
        const image = this.galleryModel.getImageById(imageId);
        if (image) {
            this.showImageForm(image);
        }
    }

    /**
     * Edita una categoría
     */
    editCategory(categoryId) {
        const category = this.galleryModel.getCategoryById(categoryId);
        if (category) {
            this.showCategoryForm(category);
        }
    }

    /**
     * Elimina una imagen
     */
    deleteImage(imageId) {
        if (confirm('¿Estás seguro de que quieres eliminar esta imagen?')) {
            const deleted = this.galleryModel.deleteImage(imageId);
            if (deleted) {
                this.showSuccess('Imagen eliminada correctamente');
                this.renderImageGrid();
            } else {
                this.showError('Error al eliminar la imagen');
            }
        }
    }

    /**
     * Elimina una categoría
     */
    deleteCategory(categoryId) {
        if (confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
            const deleted = this.galleryModel.deleteCategory(categoryId);
            if (deleted) {
                this.showSuccess('Categoría eliminada correctamente');
                this.renderGalleryManager();
            } else {
                this.showError('No se puede eliminar la categoría porque tiene imágenes asociadas');
            }
        }
    }

    /**
     * Restaura una imagen
     */
    restoreImage(imageId) {
        const restored = this.galleryModel.restoreImage(imageId);
        if (restored) {
            this.showSuccess('Imagen restaurada correctamente');
            this.renderImageGrid();
        } else {
            this.showError('Error al restaurar la imagen');
        }
    }

    /**
     * Cambia el estado destacado de una imagen
     */
    toggleFeaturedImage(imageId) {
        const image = this.galleryModel.getImageById(imageId);
        if (image) {
            const updated = this.galleryModel.updateImage(imageId, {
                featured: !image.featured
            });
            if (updated) {
                this.showSuccess(`Imagen ${updated.featured ? 'destacada' : 'quedó destacada'} correctamente`);
                this.renderImageGrid();
            } else {
                this.showError('Error al cambiar el estado de la imagen');
            }
        }
    }

    /**
     * Muestra vista previa de una imagen
     */
    previewImage(imageId) {
        const image = this.galleryModel.getImageById(imageId);
        if (!image) return;

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal modal-large">
                <div class="modal-header">
                    <h3>${image.title}</h3>
                    <button class="btn btn-icon" data-action="close-modal">
                        <i class="bi bi-x-lg"></i>
                    </button>
                </div>
                
                <div class="modal-content">
                    <div class="image-preview-large">
                        <img src="${image.url}" alt="${image.alt}">
                    </div>
                    
                    <div class="image-details">
                        <h4>Descripción</h4>
                        <p>${image.description}</p>
                        
                        <div class="image-meta-details">
                            <div class="meta-item">
                                <strong>Categoría:</strong> 
                                <span style="color: ${this.galleryModel.getCategoryById(image.category)?.color || '#ccc'}">
                                    ${this.galleryModel.getCategoryById(image.category)?.name || image.category}
                                </span>
                            </div>
                            <div class="meta-item">
                                <strong>Orden:</strong> ${image.order}
                            </div>
                            <div class="meta-item">
                                <strong>Estado:</strong> 
                                ${image.active ? 'Activa' : 'Inactiva'}
                                ${image.featured ? ' (Destacada)' : ''}
                            </div>
                        </div>
                        
                        <div class="image-tags-details">
                            <strong>Etiquetas:</strong>
                            ${image.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.bindModalEvents(modal);
    }

    /**
     * Cierra el modal
     */
    closeModal() {
        const modal = document.querySelector('.modal-overlay');
        if (modal) {
            modal.remove();
        }
        this.editingImage = null;
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