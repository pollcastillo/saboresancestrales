/**
 * Modelo para gestionar los tips de cocina
 */
export class TipModel {
    constructor() {
        this.tips = [];
        this.categories = [];
        this.loadTips();
    }

    /**
     * Carga los tips desde el archivo JSON
     */
    async loadTips() {
        try {
            const response = await fetch('src/data/cooking-tips.json');
            const data = await response.json();
            this.tips = data.tips || [];
            this.categories = data.categories || [];
        } catch (error) {
            console.error('Error cargando tips:', error);
            this.tips = this.getDefaultTips();
            this.categories = this.getDefaultCategories();
        }
    }

    /**
     * Obtiene tips por defecto si no se puede cargar el archivo
     */
    getDefaultTips() {
        return [
            {
                id: 1,
                title: "Conservación de Hierbas",
                content: "Para mantener las hierbas frescas por más tiempo, envuelve los tallos en una toalla de papel húmeda y guárdalas en el refrigerador.",
                category: "conservacion",
                difficulty: "facil",
                time: "5 min",
                active: true,
                featured: true,
                order: 1,
                tags: ["hierbas", "refrigerador", "frescura"]
            },
            {
                id: 2,
                title: "Cortar Cebolla Sin Llorar",
                content: "Antes de cortar la cebolla, métela en el congelador por 10 minutos. Esto reduce la liberación de gases que causan el lagrimeo.",
                category: "tecnicas",
                difficulty: "facil",
                time: "10 min",
                active: true,
                featured: true,
                order: 2,
                tags: ["cebolla", "corte", "truco"]
            },
            {
                id: 3,
                title: "Huevos Perfectos",
                content: "Para huevos duros perfectos, colócalos en agua fría, lleva a ebullición, luego apaga el fuego y deja reposar 12 minutos.",
                category: "huevos",
                difficulty: "facil",
                time: "15 min",
                active: true,
                featured: false,
                order: 3,
                tags: ["huevos", "coccion", "perfecto"]
            }
        ];
    }

    /**
     * Obtiene categorías por defecto
     */
    getDefaultCategories() {
        return [
            { id: "conservacion", name: "Conservación", color: "#D46528" },
            { id: "tecnicas", name: "Técnicas", color: "#185A48" },
            { id: "huevos", name: "Huevos", color: "#8B4513" },
            { id: "carnes", name: "Carnes", color: "#8B0000" },
            { id: "vegetales", name: "Vegetales", color: "#228B22" },
            { id: "postres", name: "Postres", color: "#FF69B4" },
            { id: "bebidas", name: "Bebidas", color: "#4169E1" }
        ];
    }

    /**
     * Obtiene todos los tips
     * @returns {Array} - Lista de tips
     */
    getAllTips() {
        return this.tips;
    }

    /**
     * Obtiene tips activos
     * @returns {Array} - Lista de tips activos
     */
    getActiveTips() {
        return this.tips.filter(tip => tip.active);
    }

    /**
     * Obtiene tips destacados
     * @returns {Array} - Lista de tips destacados
     */
    getFeaturedTips() {
        return this.tips.filter(tip => tip.featured && tip.active);
    }

    /**
     * Obtiene tips por categoría
     * @param {string} category - Categoría a filtrar
     * @returns {Array} - Lista de tips de la categoría
     */
    getTipsByCategory(category) {
        return this.tips.filter(tip => tip.category === category && tip.active);
    }

    /**
     * Obtiene un tip por ID
     * @param {number} id - ID del tip
     * @returns {Object|null} - Tip encontrado o null
     */
    getTipById(id) {
        return this.tips.find(tip => tip.id === id) || null;
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
     * Crea un nuevo tip
     * @param {Object} tipData - Datos del tip
     * @returns {Object} - Tip creado
     */
    createTip(tipData) {
        const newTip = {
            id: this.getNextTipId(),
            ...tipData,
            active: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.tips.push(newTip);
        this.saveTips();
        return newTip;
    }

    /**
     * Actualiza un tip existente
     * @param {number} id - ID del tip
     * @param {Object} tipData - Datos actualizados
     * @returns {Object|null} - Tip actualizado o null
     */
    updateTip(id, tipData) {
        const tipIndex = this.tips.findIndex(tip => tip.id === id);

        if (tipIndex === -1) return null;

        this.tips[tipIndex] = {
            ...this.tips[tipIndex],
            ...tipData,
            updatedAt: new Date().toISOString()
        };

        this.saveTips();
        return this.tips[tipIndex];
    }

    /**
     * Elimina un tip (cambia estado a inactivo)
     * @param {number} id - ID del tip
     * @returns {boolean} - True si se eliminó correctamente
     */
    deleteTip(id) {
        const tip = this.getTipById(id);
        if (!tip) return false;

        tip.active = false;
        tip.updatedAt = new Date().toISOString();
        this.saveTips();
        return true;
    }

    /**
     * Restaura un tip eliminado
     * @param {number} id - ID del tip
     * @returns {boolean} - True si se restauró correctamente
     */
    restoreTip(id) {
        const tip = this.getTipById(id);
        if (!tip) return false;

        tip.active = true;
        tip.updatedAt = new Date().toISOString();
        this.saveTips();
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
        this.saveTips();
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

        this.saveTips();
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

        // Verificar si hay tips usando esta categoría
        const tipsUsingCategory = this.tips.filter(tip => tip.category === id);
        if (tipsUsingCategory.length > 0) {
            return false; // No se puede eliminar si hay tips usando la categoría
        }

        this.categories.splice(categoryIndex, 1);
        this.saveTips();
        return true;
    }

    /**
     * Cambia el orden de los tips
     * @param {Array} tipIds - Array de IDs en el nuevo orden
     * @returns {boolean} - True si se actualizó correctamente
     */
    reorderTips(tipIds) {
        tipIds.forEach((id, index) => {
            const tip = this.getTipById(id);
            if (tip) {
                tip.order = index + 1;
            }
        });

        this.saveTips();
        return true;
    }

    /**
     * Obtiene el siguiente ID de tip disponible
     * @returns {number} - Siguiente ID
     */
    getNextTipId() {
        const maxId = Math.max(...this.tips.map(tip => tip.id), 0);
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
     * Guarda los tips en localStorage (simulación de base de datos)
     */
    saveTips() {
        try {
            const data = {
                tips: this.tips,
                categories: this.categories,
                updatedAt: new Date().toISOString()
            };
            localStorage.setItem('adminTips', JSON.stringify(data));
        } catch (error) {
            console.error('Error guardando tips:', error);
        }
    }

    /**
     * Carga tips desde localStorage
     */
    loadFromStorage() {
        try {
            const stored = localStorage.getItem('adminTips');
            if (stored) {
                const data = JSON.parse(stored);
                this.tips = data.tips || [];
                this.categories = data.categories || [];
            }
        } catch (error) {
            console.error('Error cargando tips desde storage:', error);
        }
    }

    /**
     * Exporta los tips a JSON
     * @returns {string} - JSON string de los tips
     */
    exportTips() {
        return JSON.stringify({
            tips: this.tips,
            categories: this.categories,
            exportedAt: new Date().toISOString()
        }, null, 2);
    }

    /**
     * Importa tips desde JSON
     * @param {string} jsonData - JSON string con los tips
     * @returns {boolean} - True si se importó correctamente
     */
    importTips(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            if (data.tips && Array.isArray(data.tips)) {
                this.tips = data.tips;
                this.categories = data.categories || [];
                this.saveTips();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error importando tips:', error);
            return false;
        }
    }

    /**
     * Busca tips por texto
     * @param {string} query - Texto a buscar
     * @returns {Array} - Tips que coinciden con la búsqueda
     */
    searchTips(query) {
        const searchTerm = query.toLowerCase();
        return this.tips.filter(tip =>
            tip.title.toLowerCase().includes(searchTerm) ||
            tip.content.toLowerCase().includes(searchTerm) ||
            tip.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
    }
} 