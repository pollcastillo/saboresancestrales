const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

class DatabaseAPI {
    constructor(dataDir) {
        this.dataDir = dataDir;
        this.dbPath = path.join(dataDir, 'sabores_ancestrales.db');
        this.router = express.Router();
        this.db = null;

        this.initDatabase();
        this.setupRoutes();
    }

    /**
     * Inicializa la base de datos SQLite
     */
    async initDatabase() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) {
                    console.error('Error conectando a la base de datos:', err);
                    reject(err);
                } else {
                    console.log('✅ Base de datos SQLite conectada');
                    this.createTables().then(resolve).catch(reject);
                }
            });
        });
    }

    /**
     * Crea las tablas si no existen
     */
    async createTables() {
        const tables = [
            `CREATE TABLE IF NOT EXISTS services (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                price REAL,
                category TEXT,
                active INTEGER DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,

            `CREATE TABLE IF NOT EXISTS cooking_tips (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                content TEXT,
                category TEXT,
                difficulty TEXT,
                active INTEGER DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,

            `CREATE TABLE IF NOT EXISTS gallery (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT,
                image_url TEXT,
                date_added DATETIME DEFAULT CURRENT_TIMESTAMP,
                active INTEGER DEFAULT 1
            )`,

            `CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                full_name TEXT,
                cedula TEXT,
                role TEXT DEFAULT 'user',
                active INTEGER DEFAULT 1,
                last_login DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,

            `CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                sender TEXT NOT NULL,
                subject TEXT,
                content TEXT,
                date_received DATETIME DEFAULT CURRENT_TIMESTAMP,
                read INTEGER DEFAULT 0
            )`
        ];

        for (const table of tables) {
            await this.runQuery(table);
        }

        // Insertar datos iniciales si las tablas están vacías
        await this.insertInitialData();

        console.log('✅ Tablas creadas correctamente');
    }

    /**
     * Inserta datos iniciales desde los archivos JSON
     */
    async insertInitialData() {
        try {
            // Verificar si ya hay datos
            const servicesCount = await this.getCount('services');
            if (servicesCount === 0) {
                console.log('📥 Insertando datos iniciales...');

                // Cargar datos desde archivos JSON
                const services = await this.loadJSONFile('services.json') || [];
                const tips = await this.loadJSONFile('cooking-tips.json') || [];
                const gallery = await this.loadJSONFile('gallery.json') || [];
                const users = await this.loadJSONFile('users.json') || [];

                console.log(`📊 Datos cargados: ${services.length} servicios, ${tips.length} tips, ${gallery.length} imágenes, ${users.length} usuarios`);

                // Insertar servicios
                for (const service of services) {
                    await this.runQuery(
                        'INSERT INTO services (name, description, price, category, active) VALUES (?, ?, ?, ?, ?)',
                        [service.name, service.description, service.price, service.category, service.active ? 1 : 0]
                    );
                }

                // Insertar tips
                for (const tip of tips) {
                    await this.runQuery(
                        'INSERT INTO cooking_tips (title, content, category, difficulty, active) VALUES (?, ?, ?, ?, ?)',
                        [tip.title, tip.content, tip.category, tip.difficulty, tip.active ? 1 : 0]
                    );
                }

                // Insertar galería
                for (const image of gallery) {
                    await this.runQuery(
                        'INSERT INTO gallery (title, description, image_url, active) VALUES (?, ?, ?, ?)',
                        [image.title, image.description, image.image_url, image.active ? 1 : 0]
                    );
                }

                // Insertar usuarios
                for (const user of users) {
                    await this.runQuery(
                        'INSERT INTO users (username, password, full_name, cedula, role, active) VALUES (?, ?, ?, ?, ?, ?)',
                        [user.username, user.password, user.full_name, user.cedula, user.role, user.active ? 1 : 0]
                    );
                }

                console.log('✅ Datos iniciales insertados');
            }
        } catch (error) {
            console.error('Error insertando datos iniciales:', error);
        }
    }

    /**
     * Carga un archivo JSON desde src/data
     */
    async loadJSONFile(filename) {
        try {
            const filePath = path.join(__dirname, '..', 'data', filename);
            const data = await fs.readFile(filePath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error(`Error cargando ${filename}:`, error);
            return [];
        }
    }

    /**
     * Configura las rutas de la API
     */
    setupRoutes() {
        // Obtener estadísticas
        this.router.get('/stats', async (req, res) => {
            try {
                const stats = {
                    services: await this.getCount('services'),
                    tips: await this.getCount('cooking_tips'),
                    gallery: await this.getCount('gallery'),
                    users: await this.getCount('users'),
                    messages: await this.getCount('messages')
                };
                res.json(stats);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // Exportar base de datos
        this.router.get('/export', async (req, res) => {
            try {
                const sql = await this.exportDatabase();
                res.setHeader('Content-Type', 'application/sql');
                res.setHeader('Content-Disposition', 'attachment; filename="sabores_ancestrales.sql"');
                res.send(sql);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // Importar base de datos
        this.router.post('/import', async (req, res) => {
            try {
                const { sql } = req.body;
                await this.importDatabase(sql);
                res.json({ success: true, message: 'Base de datos importada correctamente' });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // CRUD para servicios
        this.router.get('/services', async (req, res) => {
            try {
                const services = await this.getAll('services');
                res.json(services);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        this.router.post('/services', async (req, res) => {
            try {
                const { name, description, price, category } = req.body;
                const result = await this.runQuery(
                    'INSERT INTO services (name, description, price, category) VALUES (?, ?, ?, ?)',
                    [name, description, price, category]
                );
                res.json({ id: result.lastID, success: true });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        this.router.put('/services/:id', async (req, res) => {
            try {
                const { id } = req.params;
                const { name, description, price, category, active } = req.body;
                await this.runQuery(
                    'UPDATE services SET name = ?, description = ?, price = ?, category = ?, active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                    [name, description, price, category, active ? 1 : 0, id]
                );
                res.json({ success: true });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        this.router.delete('/services/:id', async (req, res) => {
            try {
                const { id } = req.params;
                await this.runQuery('DELETE FROM services WHERE id = ?', [id]);
                res.json({ success: true });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // CRUD para tips
        this.router.get('/tips', async (req, res) => {
            try {
                const tips = await this.getAll('cooking_tips');
                res.json(tips);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        this.router.post('/tips', async (req, res) => {
            try {
                const { title, content, category, difficulty } = req.body;
                const result = await this.runQuery(
                    'INSERT INTO cooking_tips (title, content, category, difficulty) VALUES (?, ?, ?, ?)',
                    [title, content, category, difficulty]
                );
                res.json({ id: result.lastID, success: true });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        this.router.put('/tips/:id', async (req, res) => {
            try {
                const { id } = req.params;
                const { title, content, category, difficulty, active } = req.body;
                await this.runQuery(
                    'UPDATE cooking_tips SET title = ?, content = ?, category = ?, difficulty = ?, active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                    [title, content, category, difficulty, active ? 1 : 0, id]
                );
                res.json({ success: true });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        this.router.delete('/tips/:id', async (req, res) => {
            try {
                const { id } = req.params;
                await this.runQuery('DELETE FROM cooking_tips WHERE id = ?', [id]);
                res.json({ success: true });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // CRUD para galería
        this.router.get('/gallery', async (req, res) => {
            try {
                const gallery = await this.getAll('gallery');
                res.json(gallery);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        this.router.post('/gallery', async (req, res) => {
            try {
                const { title, description, image_url } = req.body;
                const result = await this.runQuery(
                    'INSERT INTO gallery (title, description, image_url) VALUES (?, ?, ?)',
                    [title, description, image_url]
                );
                res.json({ id: result.lastID, success: true });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        this.router.put('/gallery/:id', async (req, res) => {
            try {
                const { id } = req.params;
                const { title, description, image_url, active } = req.body;
                await this.runQuery(
                    'UPDATE gallery SET title = ?, description = ?, image_url = ?, active = ? WHERE id = ?',
                    [title, description, image_url, active ? 1 : 0, id]
                );
                res.json({ success: true });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        this.router.delete('/gallery/:id', async (req, res) => {
            try {
                const { id } = req.params;
                await this.runQuery('DELETE FROM gallery WHERE id = ?', [id]);
                res.json({ success: true });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // Autenticación
        this.router.post('/auth', async (req, res) => {
            try {
                const { username, cedula } = req.body;
                const user = await this.runQuery(
                    'SELECT * FROM users WHERE username = ? AND cedula = ? AND active = 1',
                    [username, cedula]
                );

                if (user.length > 0) {
                    // Actualizar último login
                    await this.runQuery(
                        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
                        [user[0].id]
                    );
                    res.json({ success: true, user: user[0] });
                } else {
                    res.status(401).json({ error: 'Credenciales incorrectas' });
                }
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
    }

    /**
     * Ejecuta una consulta SQL
     */
    runQuery(sql, params = []) {
        return new Promise((resolve, reject) => {
            if (sql.trim().toUpperCase().startsWith('SELECT')) {
                this.db.all(sql, params, (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                });
            } else {
                this.db.run(sql, params, function (err) {
                    if (err) reject(err);
                    else resolve({ lastID: this.lastID, changes: this.changes });
                });
            }
        });
    }

    /**
     * Obtiene todos los registros de una tabla
     */
    async getAll(table) {
        return await this.runQuery(`SELECT * FROM ${table} ORDER BY id DESC`);
    }

    /**
     * Obtiene el conteo de registros en una tabla
     */
    async getCount(table) {
        const result = await this.runQuery(`SELECT COUNT(*) as count FROM ${table}`);
        return result[0].count;
    }

    /**
     * Exporta la base de datos a SQL
     */
    async exportDatabase() {
        const tables = ['services', 'cooking_tips', 'gallery', 'users', 'messages'];
        let sql = '';

        for (const table of tables) {
            const data = await this.getAll(table);
            if (data.length > 0) {
                sql += `\n-- Datos de la tabla ${table}\n`;
                for (const row of data) {
                    const columns = Object.keys(row).filter(key => key !== 'id');
                    const values = columns.map(col => {
                        const value = row[col];
                        return typeof value === 'string' ? `'${value.replace(/'/g, "''")}'` : value;
                    });
                    sql += `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${values.join(', ')});\n`;
                }
            }
        }

        return sql;
    }

    /**
     * Importa datos SQL a la base de datos
     */
    async importDatabase(sql) {
        const statements = sql.split(';').filter(stmt => stmt.trim());

        for (const statement of statements) {
            if (statement.trim()) {
                await this.runQuery(statement);
            }
        }
    }
}

module.exports = DatabaseAPI; 