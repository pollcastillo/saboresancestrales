/**
 * Modelo para gestionar la galería de imágenes
 */
export class GalleryModel {
    constructor() {
        this.images = [];
        this.categories = [];
        this.loadGallery();
    }

    /**
     * Carga la galería desde el archivo JSON
     */
    async loadGallery() {
        try {
            const response = await fetch('src/data/gallery.json');
            const data = await response.json();
            this.images = data.images || [];
            this.categories = data.categories || [];
        } catch (error) {
            console.error('Error cargando galería:', error);
            this.images = this.getDefaultImages();
            this.categories = this.getDefaultCategories();
        }
    }

    /**
     * Obtiene imágenes por defecto si no se puede cargar el archivo
     */
    getDefaultImages() {
        return [
            {
                id: 1,
                title: "Plato Principal",
                description: "Nuestro plato estrella con ingredientes frescos",
                filename: "plato-principal.jpg",
                url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800",
                category: "platos",
                active: true,
                featured: true,
                order: 1,
                alt: "Plato principal con ingredientes frescos",
                tags: ["plato", "principal", "fresco"]
            },
            {
                id: 2,
                title: "Evento Corporativo",
                description: "Catering para eventos empresariales",
                filename: "evento-corporativo.jpg",
                url: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800",
                category: "eventos",
                active: true,
                featured: true,
                order: 2,
                alt: "Evento corporativo con catering",
                tags: ["evento", "corporativo", "catering"]
            },
            {
                id: 3,
                title: "Postre Artesanal",
                description: "Postres caseros con toque especial",
                filename: "postre-artesanal.jpg",
                url: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800",
                category: "postres",
                active: true,
                featured: false,
                order: 3,
                alt: "Postre artesanal casero",
                tags: ["postre", "artesanal", "casero"]
            }
        ];
    }

    /**
     * Obtiene categorías por defecto
     */
    getDefaultCategories() {
        return [
            { id: "platos", name: "Platos Principales", color: "#D46528" },
            { id: "eventos", name: "Eventos", color: "#185A48" },
            { id: "postres", name: "Postres", color: "#8B4513" },
            { id: "bebidas", name: "Bebidas", color: "#4169E1" },
            { id: "decoracion", name: "Decoración", color: "#FF69B4" },
            { id: "equipamiento", name: "Equipamiento", color: "#808080" }
        ];
    }

    /**
     * Obtiene todas las imágenes
     * @returns {Array} - Lista de imágenes
     */
    getAllImages() {
        return this.images;
    }

    /**
     * Obtiene imágenes activas
     * @returns {Array} - Lista de imágenes activas
     */
    getActiveImages() {
        return this.images.filter(image => image.active);
    }

    /**
     * Obtiene imágenes destacadas
     * @returns {Array} - Lista de imágenes destacadas
     */
    getFeaturedImages() {
        return this.images.filter(image => image.featured && image.active);
    }

    /**
     * Obtiene imágenes por categoría
     * @param {string} category - Categoría a filtrar
     * @returns {Array} - Lista de imágenes de la categoría
     */
    getImagesByCategory(category) {
        return this.images.filter(image => image.category === category && image.active);
    }

    /**
     * Obtiene una imagen por ID
     * @param {number} id - ID de la imagen
     * @returns {Object|null} - Imagen encontrada o null
     */
    getImageById(id) {
        return this.images.find(image => image.id === id) || null;
    }

    /**
     * Obtiene todas las categorías
     * @returns {Array} - Lista de categorías
     */
    getAllCategories() {
        return this.categories;
    }

    /**
     * Obtiene una categoría por ID
     * @param {string} id - ID de la categoría
     * @returns {Object|null} - Categoría encontrada o null
     */
    getCategoryById(id) {
        return this.categories.find(cat => cat.id === id) || null;
    }

    /**
     * Crea una nueva imagen
     * @param {Object} imageData - Datos de la imagen
     * @returns {Object} - Imagen creada
     */
    createImage(imageData) {
        const newImage = {
            id: this.getNextImageId(),
            ...imageData,
            active: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.images.push(newImage);
        this.saveGallery();
        return newImage;
    }

    /**
     * Actualiza una imagen existente
     * @param {number} id - ID de la imagen
     * @param {Object} imageData - Datos actualizados
     * @returns {Object|null} - Imagen actualizada o null
     */
    updateImage(id, imageData) {
        const imageIndex = this.images.findIndex(image => image.id === id);

        if (imageIndex === -1) return null;

        this.images[imageIndex] = {
            ...this.images[imageIndex],
            ...imageData,
            updatedAt: new Date().toISOString()
        };

        this.saveGallery();
        return this.images[imageIndex];
    }

    /**
     * Elimina una imagen (cambia estado a inactivo)
     * @param {number} id - ID de la imagen
     * @returns {boolean} - True si se eliminó correctamente
     */
    deleteImage(id) {
        const image = this.getImageById(id);
        if (!image) return false;

        image.active = false;
        image.updatedAt = new Date().toISOString();
        this.saveGallery();
        return true;
    }

    /**
     * Restaura una imagen eliminada
     * @param {number} id - ID de la imagen
     * @returns {boolean} - True si se restauró correctamente
     */
    restoreImage(id) {
        const image = this.getImageById(id);
        if (!image) return false;

        image.active = true;
        image.updatedAt = new Date().toISOString();
        this.saveGallery();
        return true;
    }

    /**
     * Crea una nueva categoría
     * @param {Object} categoryData - Datos de la categoría
     * @returns {Object} - Categoría creada
     */
    createCategory(categoryData) {
        const newCategory = {
            id: this.getNextCategoryId(),
            ...categoryData,
            createdAt: new Date().toISOString()
        };

        this.categories.push(newCategory);
        this.saveGallery();
        return newCategory;
    }

    /**
     * Actualiza una categoría existente
     * @param {string} id - ID de la categoría
     * @param {Object} categoryData - Datos actualizados
     * @returns {Object|null} - Categoría actualizada o null
     */
    updateCategory(id, categoryData) {
        const categoryIndex = this.categories.findIndex(cat => cat.id === id);

        if (categoryIndex === -1) return null;

        this.categories[categoryIndex] = {
            ...this.categories[categoryIndex],
            ...categoryData
        };

        this.saveGallery();
        return this.categories[categoryIndex];
    }

    /**
     * Elimina una categoría
     * @param {string} id - ID de la categoría
     * @returns {boolean} - True si se eliminó correctamente
     */
    deleteCategory(id) {
        const categoryIndex = this.categories.findIndex(cat => cat.id === id);
        if (categoryIndex === -1) return false;

        // Verificar si hay imágenes usando esta categoría
        const imagesUsingCategory = this.images.filter(image => image.category === id);
        if (imagesUsingCategory.length > 0) {
            return false; // No se puede eliminar si hay imágenes usando la categoría
        }

        this.categories.splice(categoryIndex, 1);
        this.saveGallery();
        return true;
    }

    /**
     * Cambia el orden de las imágenes
     * @param {Array} imageIds - Array de IDs en el nuevo orden
     * @returns {boolean} - True si se actualizó correctamente
     */
    reorderImages(imageIds) {
        imageIds.forEach((id, index) => {
            const image = this.getImageById(id);
            if (image) {
                image.order = index + 1;
            }
        });

        this.saveGallery();
        return true;
    }

    /**
     * Obtiene el siguiente ID de imagen disponible
     * @returns {number} - Siguiente ID
     */
    getNextImageId() {
        const maxId = Math.max(...this.images.map(image => image.id), 0);
        return maxId + 1;
    }

    /**
     * Obtiene el siguiente ID de categoría disponible
     * @returns {string} - Siguiente ID
     */
    getNextCategoryId() {
        const existingIds = this.categories.map(cat => cat.id);
        let counter = 1;
        let newId = `categoria_${counter}`;

        while (existingIds.includes(newId)) {
            counter++;
            newId = `categoria_${counter}`;
        }

        return newId;
    }

    /**
     * Guarda la galería en localStorage (simulación de base de datos)
     */
    saveGallery() {
        try {
            const data = {
                images: this.images,
                categories: this.categories,
                updatedAt: new Date().toISOString()
            };
            localStorage.setItem('adminGallery', JSON.stringify(data));
        } catch (error) {
            console.error('Error guardando galería:', error);
        }
    }

    /**
     * Carga galería desde localStorage
     */
    loadFromStorage() {
        try {
            const stored = localStorage.getItem('adminGallery');
            if (stored) {
                const data = JSON.parse(stored);
                this.images = data.images || [];
                this.categories = data.categories || [];
            }
        } catch (error) {
            console.error('Error cargando galería desde storage:', error);
        }
    }

    /**
     * Exporta la galería a JSON
     * @returns {string} - JSON string de la galería
     */
    exportGallery() {
        return JSON.stringify({
            images: this.images,
            categories: this.categories,
            exportedAt: new Date().toISOString()
        }, null, 2);
    }

    /**
     * Importa galería desde JSON
     * @param {string} jsonData - JSON string con la galería
     * @returns {boolean} - True si se importó correctamente
     */
    importGallery(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            if (data.images && Array.isArray(data.images)) {
                this.images = data.images;
                this.categories = data.categories || [];
                this.saveGallery();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error importando galería:', error);
            return false;
        }
    }

    /**
     * Busca imágenes por texto
     * @param {string} query - Texto a buscar
     * @returns {Array} - Imágenes que coinciden con la búsqueda
     */
    searchImages(query) {
        const searchTerm = query.toLowerCase();
        return this.images.filter(image =>
            image.title.toLowerCase().includes(searchTerm) ||
            image.description.toLowerCase().includes(searchTerm) ||
            image.alt.toLowerCase().includes(searchTerm) ||
            image.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
    }

    /**
     * Valida una URL de imagen
     * @param {string} url - URL a validar
     * @returns {Promise<boolean>} - True si la URL es válida
     */
    async validateImageUrl(url) {
        try {
            const response = await fetch(url, { method: 'HEAD' });
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    /**
     * Obtiene información de una imagen desde URL
     * @param {string} url - URL de la imagen
     * @returns {Promise<Object>} - Información de la imagen
     */
    async getImageInfo(url) {
        try {
            const img = new Image();
            return new Promise((resolve, reject) => {
                img.onload = () => {
                    resolve({
                        width: img.naturalWidth,
                        height: img.naturalHeight,
                        size: 'N/A' // No podemos obtener el tamaño real sin fetch
                    });
                };
                img.onerror = () => reject(new Error('No se pudo cargar la imagen'));
                img.src = url;
            });
        } catch (error) {
            throw new Error('Error al obtener información de la imagen');
        }
    }
} 