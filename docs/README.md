# Sabores Ancestrales - Landing Page

Una landing page moderna y responsiva para un servicio de catering empresarial con enfoque familiar y amigable.

## 🍽️ Sobre el Proyecto

**Sabores Ancestrales** es una empresa de catering que ofrece servicios especializados para eventos empresariales, manteniendo la tradición culinaria y la atención personalizada que caracteriza a las familias ecuatorianas.

## ✨ Características

- **Diseño Responsivo**: Optimizado para móviles y desktop
- **Sistema de Temas**: Modo claro y oscuro con toggle
- **Galería Interactiva**: Modal para visualizar imágenes
- **Formulario de Contacto**: Con validación y feedback
- **Navegación Suave**: Scroll automático a secciones
- **Animaciones**: Efectos de entrada y hover
- **Accesibilidad**: Navegación por teclado y lectores de pantalla

## 🎨 Sistema de Diseño

### Colores Principales
- **Naranja/Terracota**: `#D46528`
- **Verde Oscuro**: `#185A48`
- **11 variantes** de cada color desde claras hasta oscuras

### Tipografía
- **Principal**: Geist Sans
- **Monoespaciada**: Geist Mono

### Espaciado
- **Grilla de 8**: Todos los espaciados siguen múltiplos de 8px
- **Valores**: 8px, 16px, 24px, 32px, 40px, 48px, 56px, 64px, etc.

## 📁 Estructura del Proyecto

```
saboresancestrales/
├── index.html                 # Página principal
├── src/
│   ├── styles/
│   │   ├── styles.css         # Archivo principal de estilos
│   │   ├── base.css           # Variables y estilos base
│   │   ├── header.css         # Estilos del header
│   │   ├── hero.css           # Estilos de la sección hero
│   │   ├── services.css       # Estilos de servicios
│   │   ├── gallery.css        # Estilos de la galería
│   │   ├── contact.css        # Estilos de contacto
│   │   ├── footer.css         # Estilos del footer
│   │   ├── buttons.css        # Estilos de botones
│   │   ├── forms.css          # Estilos de formularios
│   │   └── theme.css          # Sistema de temas
│   ├── js/
│   │   └── main.js            # Funcionalidad JavaScript
│   └── assets/                # Imágenes y recursos
└── README.md
```

## 🚀 Instalación y Uso

1. **Clonar el repositorio**:
   ```bash
   git clone [url-del-repositorio]
   cd saboresancestrales
   ```

2. **Abrir en el navegador**:
   - Simplemente abre `index.html` en tu navegador
   - O usa un servidor local:
   ```bash
   python -m http.server 8000
   # o
   npx serve .
   ```

3. **Desarrollo**:
   - Edita los archivos CSS en `src/styles/`
   - Modifica la funcionalidad en `src/js/main.js`
   - Actualiza el contenido en `index.html`

## 🎯 Componentes Principales

### Header
- Logo y navegación
- Toggle de tema (claro/oscuro)
- Menú hamburguesa para móviles

### Hero Section
- Título principal y descripción
- Botones de llamada a la acción
- Imagen destacada

### Servicios
- 4 tarjetas de servicios principales
- Iconos y descripciones
- Efectos hover

### Galería
- Grid responsivo de imágenes
- Modal al hacer clic
- Overlay con títulos

### Contacto
- Información de contacto
- Formulario con validación
- Feedback de envío

### Footer
- Información de la empresa
- Enlaces a servicios
- Datos de contacto

## 🔧 Personalización

### Cambiar Colores
Edita las variables CSS en `src/styles/base.css`:
```css
:root {
    --color-primary-1: #D46528;
    --color-primary-2: #185A48;
    /* ... más variantes */
}
```

### Agregar Servicios
Modifica la sección de servicios en `index.html` y actualiza los estilos en `src/styles/services.css`.

### Cambiar Imágenes
Reemplaza las URLs de Unsplash en `index.html` por tus propias imágenes.

## 📱 Responsive Design

El proyecto está optimizado para:
- **Móviles**: 320px - 768px
- **Tablets**: 768px - 1024px
- **Desktop**: 1024px+

## 🌙 Sistema de Temas

- **Modo Claro**: Fondo blanco, componentes blancos
- **Modo Oscuro**: Fondo #191919, componentes #121212
- **Persistencia**: El tema se guarda en localStorage

## 🎨 Animaciones

- **Fade In**: Elementos aparecen al hacer scroll
- **Hover Effects**: Transformaciones en tarjetas y botones
- **Smooth Transitions**: Cambios suaves entre estados

## 📍 Ubicación

**Sabores Ancestrales** está ubicado en **Guayaquil - Ecuador**, ofreciendo servicios de catering empresarial en toda la región.

## 📞 Contacto

Para más información sobre el proyecto o solicitar modificaciones, contacta a través del formulario en la página web.

---

**Desarrollado con ❤️ para Sabores Ancestrales - Guayaquil, Ecuador** 