// Funcionalidad principal de Sabores Ancestrales

document.addEventListener('DOMContentLoaded', function () {
    // Inicializar funcionalidades básicas
    initThemeToggle();
    initMobileMenu();
    initSmoothScrolling();
    initFormValidation();
    initGalleryModal();
    initAnimations();

    // Inicializar funcionalidades específicas según la página
    const currentPage = window.location.pathname;

    if (currentPage.includes('tips-culinarios.html')) {
        // Solo cargar tips culinarios
        initCulinaryTips();
    } else if (currentPage.includes('tips-cocina.html')) {
        // Solo cargar tips de cocina
        initKitchenTips();
    } else if (currentPage.includes('index.html') || currentPage === '/' || currentPage === '') {
        // Página principal - cargar todo
        initIndexTips();
        initServices();
    } else {
        // Otras páginas - cargar servicios si existen
        initServices();
    }
});

// Sistema de temas
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;

    // Cargar tema guardado
    const savedTheme = localStorage.getItem('theme') || 'light';
    body.setAttribute('data-theme', savedTheme);

    themeToggle.addEventListener('click', function () {
        const currentTheme = body.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';

        body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });
}

// Menú móvil
function initMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const nav = document.querySelector('.nav');

    mobileMenuToggle.addEventListener('click', function () {
        nav.classList.toggle('active');
        mobileMenuToggle.classList.toggle('active');
    });

    // Cerrar menú al hacer clic en un enlace
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function () {
            nav.classList.remove('active');
            mobileMenuToggle.classList.remove('active');
        });
    });
}

// Scroll suave para navegación
function initSmoothScrolling() {
    const internalLinks = document.querySelectorAll('a[href^="#"]');

    internalLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Validación de formulario
function initFormValidation() {
    const contactForm = document.querySelector('.contact-form');

    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Validación básica
            const inputs = this.querySelectorAll('input[required], textarea[required]');
            let isValid = true;

            inputs.forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                    input.style.borderColor = '#ff4444';
                } else {
                    input.style.borderColor = '';
                }
            });

            if (isValid) {
                // Simular envío
                const submitBtn = this.querySelector('button[type="submit"]');
                const originalText = submitBtn.innerHTML;

                submitBtn.innerHTML = '<i class="ph-fill ph-check-circle"></i> Enviado';
                submitBtn.disabled = true;

                setTimeout(() => {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                    this.reset();
                }, 2000);
            }
        });
    }
}

// Modal de galería
function initGalleryModal() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    const modal = document.createElement('div');
    modal.className = 'gallery-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <button class="modal-close">&times;</button>
            <img class="modal-image" src="" alt="">
        </div>
    `;
    document.body.appendChild(modal);

    galleryItems.forEach(item => {
        item.addEventListener('click', function () {
            const img = this.querySelector('.gallery-image');
            const modalImg = modal.querySelector('.modal-image');

            modalImg.src = img.src;
            modalImg.alt = img.alt;
            modal.classList.add('active');
        });
    });

    // Cerrar modal
    const modalClose = modal.querySelector('.modal-close');
    modalClose.addEventListener('click', function () {
        modal.classList.remove('active');
    });

    modal.addEventListener('click', function (e) {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
}

// Animaciones
function initAnimations() {
    // Animación del header al hacer scroll
    const header = document.querySelector('.header');
    let lastScrollTop = 0;

    window.addEventListener('scroll', function () {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (scrollTop > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Ocultar/mostrar header al hacer scroll
        if (scrollTop > lastScrollTop && scrollTop > 200) {
            header.style.transform = 'translateY(-100%)';
        } else {
            header.style.transform = 'translateY(0)';
        }

        lastScrollTop = scrollTop;
    });

    // Animaciones de entrada para elementos
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Observar elementos para animación
    const animateElements = document.querySelectorAll('.service-card, .tip-card, .gallery-item');
    animateElements.forEach(el => observer.observe(el));

    // Cambiar colores del header según el tema
    const themeObserver = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
                const currentTheme = document.body.getAttribute('data-theme');

                if (currentTheme === 'dark') {
                    header.style.backgroundColor = 'rgba(25, 25, 25, 0.95)';
                    header.style.borderBottomColor = 'rgba(31, 34, 37, 0.8)';
                } else {
                    header.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
                    header.style.borderBottomColor = 'rgba(225, 225, 225, 0.8)';
                }
            }
        });
    });

    observer.observe(document.body, {
        attributes: true,
        attributeFilter: ['data-theme']
    });
}

// Tips de Cocina
async function initCookingTips() {
    // Cargar tips específicos para el index
    await initIndexTips();
}

// Tips para el Index (6 de cada sección)
async function initIndexTips() {
    const culinaryTipsGrid = document.getElementById('culinaryTipsGrid');
    const kitchenTipsGrid = document.getElementById('kitchenTipsGrid');

    if (!culinaryTipsGrid || !kitchenTipsGrid) {
        console.error('❌ No se encontraron los elementos de tips del index');
        return;
    }

    try {
        // Cargar desde el archivo específico del index
        const response = await fetch('src/data/index-tips.json');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const culinaryTips = data.culinary_tips || [];
        const kitchenTips = data.kitchen_tips || [];
        const culinaryCategories = data.culinary_categories || [];
        const kitchenCategories = data.kitchen_categories || [];

        console.log('✅ Tips del index cargados desde JSON');

        // Renderizar tips culinarios y configurar filtros
        renderTips(culinaryTipsGrid, culinaryTips, culinaryCategories);
        setupFilters('#tips-culinarios', culinaryTips, culinaryCategories);

        // Renderizar tips de cocina y configurar filtros
        renderTips(kitchenTipsGrid, kitchenTips, kitchenCategories);
        setupFilters('#tips-cocina', kitchenTips, kitchenCategories);

    } catch (error) {
        console.error('❌ Error cargando tips del index:', error);
        if (culinaryTipsGrid) {
            culinaryTipsGrid.innerHTML = '<div class="tips-error">Error al cargar los tips culinarios</div>';
        }
        if (kitchenTipsGrid) {
            kitchenTipsGrid.innerHTML = '<div class="tips-error">Error al cargar los tips de cocina</div>';
        }
    }
}

// Tips Culinarios
async function initCulinaryTips() {
    const tipsGrid = document.getElementById('culinaryTipsGrid');

    if (!tipsGrid) {
        console.error('❌ No se encontró el elemento culinaryTipsGrid');
        return;
    }

    let allTips = [];
    let categories = [];

    try {
        // Cargar desde archivos JSON
        const response = await fetch('src/data/cooking-tips.json');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        allTips = data.culinary_tips || [];
        categories = data.culinary_categories || [];

        renderTips(tipsGrid, allTips, categories);
        setupFilters('#tips-culinarios', allTips, categories);

    } catch (error) {
        console.error('❌ Error cargando tips culinarios:', error);
        tipsGrid.innerHTML = '<div class="tips-error">Error al cargar los tips culinarios: ' + error.message + '</div>';
    }
}

// Tips de Cocina
async function initKitchenTips() {
    const tipsGrid = document.getElementById('kitchenTipsGrid');
    let allTips = [];
    let categories = [];

    try {
        // Cargar desde archivos JSON
        const response = await fetch('src/data/cooking-tips.json');
        const data = await response.json();
        allTips = data.kitchen_tips || [];
        categories = data.kitchen_categories || [];
        console.log('✅ Tips de cocina cargados desde JSON');

        renderTips(tipsGrid, allTips, categories);
        setupFilters('#tips-cocina', allTips, categories);

    } catch (error) {
        console.error('❌ Error cargando tips de cocina:', error);
        tipsGrid.innerHTML = '<div class="tips-error">Error al cargar los tips de cocina</div>';
    }
}

function renderTips(tipsGrid, tips, categories) {
    tipsGrid.innerHTML = '';

    if (tips.length === 0) {
        tipsGrid.innerHTML = '<div class="tips-loading">No se encontraron tips para esta categoría</div>';
        return;
    }

    tips.forEach((tip, index) => {
        const category = categories.find(cat => cat.id === tip.category);
        const categoryColor = category ? category.color : '#D46528';

        const tipCard = document.createElement('div');
        tipCard.className = 'tip-card';
        tipCard.style.setProperty('--tip-category-color', categoryColor);
        tipCard.style.animationDelay = `${index * 0.1}s`;

        tipCard.innerHTML = `
            <div class="tip-header">
                <div class="tip-icon">
                    <i class="${tip.icon}"></i>
                </div>
                <h3 class="tip-title">${tip.title}</h3>
            </div>
            <p class="tip-description">${tip.description}</p>
            <div class="tip-meta">
                <span class="tip-category">${category ? category.name : tip.category}</span>
                <div class="tip-details">
                    <span class="tip-difficulty">
                        <i class="ph-fill ph-star"></i>
                        ${tip.difficulty}
                    </span>
                    <span class="tip-time">
                        <i class="ph-fill ph-clock"></i>
                        ${tip.time}
                    </span>
                </div>
            </div>
        `;

        tipsGrid.appendChild(tipCard);
    });
}

function setupFilters(sectionSelector, allTips, categories) {
    const filterButtons = document.querySelectorAll(`${sectionSelector} .filter-btn`);
    const tipsGrid = document.querySelector(`${sectionSelector} .tips-grid`);

    filterButtons.forEach(button => {
        button.addEventListener('click', function () {
            const selectedCategory = this.getAttribute('data-category');

            // Actualizar botones activos en esta sección
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            // Filtrar tips
            let filteredTips = allTips;
            if (selectedCategory !== 'todos') {
                filteredTips = allTips.filter(tip => tip.category === selectedCategory);
            }

            renderTips(tipsGrid, filteredTips, categories);
        });
    });
}

// Servicios
async function initServices() {
    try {
        let services = [];

        // Cargar desde archivos JSON
        const response = await fetch('src/data/services.json');
        const data = await response.json();
        services = data.services || [];
        console.log('✅ Servicios cargados desde JSON');

        renderServices(services);

    } catch (error) {
        console.error('❌ Error cargando servicios:', error);
    }
}

function renderServices(services) {
    const servicesGrid = document.querySelector('.services-grid');
    if (!servicesGrid) return;

    servicesGrid.innerHTML = services.map(service => `
        <div class="service-card">
            ${service.badge ? `<div class="service-badge">${service.badge}</div>` : ''}
            <div class="service-icon">
                <i class="${service.icon}"></i>
            </div>
            <h3 class="service-title">${service.title}</h3>
            <p class="service-description">${service.description}</p>
        </div>
    `).join('');
} 