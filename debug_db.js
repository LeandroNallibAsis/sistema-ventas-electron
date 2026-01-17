const Database = require('better-sqlite3');
const path = require('path');
const os = require('os');

// Path to user data
const dbPath = path.join(process.env.APPDATA, 'ventacore', 'electrostock.db');
console.log('Opening database at:', dbPath);

try {
    const db = new Database(dbPath);

    // Check categories table
    const categories = db.prepare('SELECT * FROM categories').all();
    console.log('Categories found:', categories.length);
    console.log(categories);

    // Try to insert a test category
    try {
        const testName = 'Test Category ' + Date.now();
        console.log('Attempting to insert:', testName);
        const stmt = db.prepare('INSERT INTO categories (name) VALUES (?)');
        const info = stmt.run(testName);
        console.log('Insert successful, ID:', info.lastInsertRowid);

        // Clean up
        db.prepare('DELETE FROM categories WHERE id = ?').run(info.lastInsertRowid);
        console.log('Test category deleted.');
    } catch (err) {
        console.error('Error inserting category:', err);
    }

} catch (err) {
    console.error('Database error:', err);
}
