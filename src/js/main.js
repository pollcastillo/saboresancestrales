// Funcionalidad principal de Sabores Ancestrales

// Variables globales para la base de datos
let databaseManager = null;
let dataAdapter = null;

document.addEventListener('DOMContentLoaded', async function () {
    // Inicializar base de datos
    await initDatabase();

    // Inicializar funcionalidades
    initThemeToggle();
    initMobileMenu();
    initSmoothScrolling();
    initFormValidation();
    initGalleryModal();
    initAnimations();
    initCookingTips();
    initServices();
});

// Inicializar base de datos SQL.js
async function initDatabase() {
    try {
        console.log('🔄 Inicializando base de datos SQL.js...');

        // Crear instancia del gestor de base de datos
        databaseManager = new DatabaseManager();

        // Inicializar la base de datos
        await databaseManager.initialize();

        // Crear adaptador para compatibilidad
        dataAdapter = new DataAdapter(databaseManager);

        console.log('✅ Base de datos inicializada correctamente');

    } catch (error) {
        console.error('❌ Error al inicializar la base de datos:', error);

        // Fallback a archivos JSON si la base de datos falla
        console.log('🔄 Usando fallback a archivos JSON...');
    }
}

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
        contactForm.addEventListener('submit', async function (e) {
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
                // Guardar mensaje en la base de datos si está disponible
                if (dataAdapter && dataAdapter.isReady()) {
                    try {
                        const formData = new FormData(this);
                        const message = {
                            name: formData.get('name') || this.querySelector('[name="name"]').value,
                            email: formData.get('email') || this.querySelector('[name="email"]').value,
                            phone: formData.get('phone') || this.querySelector('[name="phone"]')?.value,
                            message: formData.get('message') || this.querySelector('[name="message"]').value
                        };

                        await dataAdapter.insertMessage(message);
                        console.log('✅ Mensaje guardado en la base de datos');
                    } catch (error) {
                        console.error('❌ Error al guardar mensaje:', error);
                    }
                }

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

// Animaciones al hacer scroll
function initAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observar elementos para animación
    const animatedElements = document.querySelectorAll('.service-card, .gallery-item, .contact-item');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
        observer.observe(el);
    });
}

// Header con scroll
window.addEventListener('scroll', function () {
    const header = document.querySelector('.header');
    const scrollTop = window.pageYOffset;
    const theme = document.body.getAttribute('data-theme');

    if (scrollTop > 100) {
        header.classList.add('scrolled');
        if (theme === 'dark') {
            header.style.backgroundColor = 'rgba(18, 18, 18, 0.95)';
            header.style.borderBottomColor = 'rgba(31, 34, 37, 0.8)';
        } else {
            header.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
            header.style.borderBottomColor = 'rgba(225, 225, 225, 0.8)';
        }
        header.style.backdropFilter = 'blur(10px)';
    } else {
        header.classList.remove('scrolled');
        header.style.backgroundColor = '';
        header.style.backdropFilter = '';
        header.style.borderBottomColor = '';
    }
});

// Modo oscuro para header
document.addEventListener('DOMContentLoaded', function () {
    const header = document.querySelector('.header');

    // Observar cambios en el tema
    const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
                const theme = document.body.getAttribute('data-theme');
                const scrollTop = window.pageYOffset;

                if (scrollTop > 100) {
                    if (theme === 'dark') {
                        header.style.backgroundColor = 'rgba(18, 18, 18, 0.95)';
                        header.style.borderBottomColor = 'rgba(31, 34, 37, 0.8)';
                    } else {
                        header.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
                        header.style.borderBottomColor = 'rgba(225, 225, 225, 0.8)';
                    }
                }
            }
        });
    });

    observer.observe(document.body, {
        attributes: true,
        attributeFilter: ['data-theme']
    });
});

// Tips de Cocina
async function initCookingTips() {
    const tipsGrid = document.getElementById('tipsGrid');
    const filterButtons = document.querySelectorAll('.filter-btn');
    let allTips = [];
    let categories = [];

    try {
        // Intentar cargar desde la base de datos
        if (dataAdapter && dataAdapter.isReady()) {
            const data = await dataAdapter.getCookingTips();
            allTips = data.tips;
            categories = data.categories;
            console.log('✅ Tips cargados desde SQL.js');
        } else {
            // Fallback a archivos JSON
            const response = await fetch('src/data/cooking-tips.json');
            const data = await response.json();
            allTips = data.tips;
            categories = data.categories;
            console.log('✅ Tips cargados desde JSON (fallback)');
        }

        renderTips(allTips);
        setupFilters();

    } catch (error) {
        console.error('❌ Error cargando tips:', error);
        tipsGrid.innerHTML = '<div class="tips-error">Error al cargar los tips de cocina</div>';
    }

    function renderTips(tips) {
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

    function setupFilters() {
        filterButtons.forEach(button => {
            button.addEventListener('click', function () {
                const selectedCategory = this.getAttribute('data-category');

                // Actualizar botones activos
                filterButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');

                // Filtrar tips
                let filteredTips = allTips;
                if (selectedCategory !== 'todos') {
                    filteredTips = allTips.filter(tip => tip.category === selectedCategory);
                }

                renderTips(filteredTips);
            });
        });
    }
}

// Servicios
async function initServices() {
    try {
        let services = [];

        // Intentar cargar desde la base de datos
        if (dataAdapter && dataAdapter.isReady()) {
            const data = await dataAdapter.getServices();
            services = data.services;
            console.log('✅ Servicios cargados desde SQL.js');
        } else {
            // Fallback a archivos JSON
            const response = await fetch('src/data/services.json');
            const data = await response.json();
            services = data.services || [];
            console.log('✅ Servicios cargados desde JSON (fallback)');
        }

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

// Inicializar base de datos SQL.js
initSqlJs({
    locateFile: file => `src/vendors/${file}`
}).then(SQL => {
    // Tu código aquí
}); 