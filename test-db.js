const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'sabores_ancestrales.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Iniciando test de la base de datos en', dbPath);

async function runTest() {
    // 1. Crear tabla de ejemplo
    await run(`CREATE TABLE IF NOT EXISTS test_table (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT,
        valor INTEGER
    )`);
    console.log('✅ Tabla de ejemplo creada');

    // 2. Insertar un registro
    const insertResult = await run(`INSERT INTO test_table (nombre, valor) VALUES (?, ?)`, ['prueba', 42]);
    const insertedId = insertResult.lastID;
    console.log('✅ Registro insertado con id', insertedId);

    // 3. Leer el registro
    const row = await get(`SELECT * FROM test_table WHERE id = ?`, [insertedId]);
    console.log('🔎 Registro leído:', row);

    // 4. Actualizar el registro
    await run(`UPDATE test_table SET valor = ? WHERE id = ?`, [99, insertedId]);
    const updatedRow = await get(`SELECT * FROM test_table WHERE id = ?`, [insertedId]);
    console.log('✏️ Registro actualizado:', updatedRow);

    // 5. Borrar el registro
    await run(`DELETE FROM test_table WHERE id = ?`, [insertedId]);
    const deletedRow = await get(`SELECT * FROM test_table WHERE id = ?`, [insertedId]);
    console.log('🗑️ Registro después de borrar (debe ser undefined):', deletedRow);

    // 6. Cerrar conexión
    db.close();
    console.log('✅ Test finalizado y conexión cerrada');
}

function run(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
}

function get(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

runTest().catch(err => {
    console.error('❌ Error en el test:', err);
    db.close();
}); 