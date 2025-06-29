const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs').promises;
const DatabaseAPI = require('./src/server/DatabaseAPI');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos estáticos
app.use(express.static('.'));

// Crear directorio de datos si no existe
const dataDir = path.join(__dirname, 'data');
fs.mkdir(dataDir, { recursive: true }).catch(console.error);

// Inicializar API de base de datos
const databaseAPI = new DatabaseAPI(dataDir);

// Rutas API
app.use('/api/database', databaseAPI.router);

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Ruta de administración
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Ruta para obtener archivos de datos
app.get('/api/data/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(__dirname, 'src', 'data', filename);

        const data = await fs.readFile(filePath, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        console.error('Error leyendo archivo:', error);
        res.status(404).json({ error: 'Archivo no encontrado' });
    }
});

// Ruta para guardar archivos de datos
app.post('/api/data/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;
        const data = req.body;
        const filePath = path.join(__dirname, 'src', 'data', filename);

        await fs.writeFile(filePath, JSON.stringify(data, null, 2));
        res.json({ success: true, message: 'Archivo guardado correctamente' });
    } catch (error) {
        console.error('Error guardando archivo:', error);
        res.status(500).json({ error: 'Error al guardar archivo' });
    }
});

// Manejo de errores
app.use((err, req, res, next) => {
    console.error('Error del servidor:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📁 Directorio de datos: ${dataDir}`);
    console.log(`🔗 Página principal: http://localhost:${PORT}`);
    console.log(`🔗 Administración: http://localhost:${PORT}/admin`);
}); 