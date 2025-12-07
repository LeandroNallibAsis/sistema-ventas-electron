const Database = require('better-sqlite3');
const path = require('path');
const { app } = require('electron');
const fs = require('fs');
const crypto = require('crypto'); // Native crypto for password hashing

class DatabaseManager {
    constructor() {
        this.db = null;
    }


    initialize() {
        // Store database in user's AppData folder for persistence
        const userDataPath = app.getPath('userData');
        const dbPath = path.join(userDataPath, 'electrostock.db');

        console.log('Database path:', dbPath);

        // Ensure directory exists
        if (!fs.existsSync(userDataPath)) {
            fs.mkdirSync(userDataPath, { recursive: true });
        }

        this.db = new Database(dbPath);
        this.db.pragma('journal_mode = WAL');

        this.createTables();
    }

    createTables() {
        // Categories table
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

        // Products table
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        supplier TEXT,
        cost_usd REAL DEFAULT 0,
        cost_ars REAL DEFAULT 0,
        price REAL NOT NULL,
        stock INTEGER DEFAULT 0,
        description TEXT,
        barcode TEXT UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
      )
    `);

        // Migration: Add barcode column if it doesn't exist (for existing databases)
        try {
            const columns = this.db.prepare("PRAGMA table_info(products)").all();
            const hasBarcode = columns.some(col => col.name === 'barcode');
            if (!hasBarcode) {
                this.db.exec('ALTER TABLE products ADD COLUMN barcode TEXT');
                console.log('Migration: Added barcode column to products table');
            }
        } catch (error) {
            console.error('Migration error:', error);
        }

        // Payment configuration table
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS payment_config (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        method TEXT UNIQUE NOT NULL,
        surcharge REAL DEFAULT 0,
        display_name TEXT NOT NULL
      )
    `);

        // Sales table
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS sales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sale_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        payment_method TEXT NOT NULL,
        currency TEXT NOT NULL,
        subtotal REAL NOT NULL,
        surcharge REAL DEFAULT 0,
        total REAL NOT NULL,
        installments INTEGER DEFAULT 1,
        customer_notes TEXT,
        warranty_enabled INTEGER DEFAULT 0,
        warranty_months INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

        // Sale items table
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS sale_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sale_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        product_name TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price REAL NOT NULL,
        subtotal REAL NOT NULL,
        FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id)
      )
    `);

        // Cash register table
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS cash_register (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entry_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        type TEXT NOT NULL,
        amount REAL NOT NULL,
        currency TEXT NOT NULL,
        payment_method TEXT,
        description TEXT,
        expense_category TEXT,
        sale_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sale_id) REFERENCES sales(id)
      )
    `);

        // Migration: Add expense_category column if it doesn't exist
        try {
            const columns = this.db.prepare("PRAGMA table_info(cash_register)").all();
            const hasCategory = columns.some(col => col.name === 'expense_category');
            if (!hasCategory) {
                this.db.exec('ALTER TABLE cash_register ADD COLUMN expense_category TEXT');
                console.log('Migration: Added expense_category column to cash_register');
            }
        } catch (error) {
            console.error('Migration error (expense_category):', error);
        }

        // Migration: Add category_name column to sale_items if it doesn't exist
        try {
            const columns = this.db.prepare("PRAGMA table_info(sale_items)").all();
            const hasCategoryName = columns.some(col => col.name === 'category_name');
            if (!hasCategoryName) {
                this.db.exec('ALTER TABLE sale_items ADD COLUMN category_name TEXT');
                console.log('Migration: Added category_name column to sale_items');
            }
        } catch (error) {
            console.error('Migration error (category_name):', error);
        }

        // Store configuration table
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS store_config (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        value TEXT
      )
    `);

        // Initialize default store configuration
        this.initializeStoreConfig();

        // Initialize default payment configurations
        this.initializePaymentConfigs();

        // Users table
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                salt TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'seller', -- 'admin' or 'seller'
                name TEXT,
                active INTEGER DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Initialize default admin if no users exist
        this.initializeDefaultAdmin();

        console.log('Database tables created successfully');
    }

    initializeDefaultAdmin() {
        const check = this.db.prepare('SELECT COUNT(*) as count FROM users').get();
        if (check.count === 0) {
            console.log('Creating default admin user...');
            this.createUser({
                username: 'admin',
                password: '123', // Default simple password, should be changed
                role: 'admin',
                name: 'Administrador'
            });
        }
    }

    // User Operations
    createUser(userData) {
        const salt = crypto.randomBytes(16).toString('hex');
        const hash = crypto.pbkdf2Sync(userData.password, salt, 1000, 64, 'sha512').toString('hex');

        const stmt = this.db.prepare(`
            INSERT INTO users (username, password_hash, salt, role, name)
            VALUES (?, ?, ?, ?, ?)
        `);

        try {
            const result = stmt.run(
                userData.username,
                hash,
                salt,
                userData.role || 'seller',
                userData.name || userData.username
            );
            return { id: result.lastInsertRowid, username: userData.username, role: userData.role };
        } catch (error) {
            if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
                throw new Error('El nombre de usuario ya existe');
            }
            throw error;
        }
    }

    validateUser(username, password) {
        const stmt = this.db.prepare('SELECT * FROM users WHERE username = ? AND active = 1');
        const user = stmt.get(username);

        if (!user) return null;

        const hash = crypto.pbkdf2Sync(password, user.salt, 1000, 64, 'sha512').toString('hex');

        if (hash === user.password_hash) {
            // Return user without security sensitive info
            const { password_hash, salt, ...safeUser } = user;
            return safeUser;
        }
        return null;
    }

    getUsers() {
        const stmt = this.db.prepare('SELECT id, username, role, name, active, created_at FROM users ORDER BY name');
        return stmt.all();
    }

    updateUser(id, data) {
        // If password is provided, re-hash it
        if (data.password) {
            const salt = crypto.randomBytes(16).toString('hex');
            const hash = crypto.pbkdf2Sync(data.password, salt, 1000, 64, 'sha512').toString('hex');

            const stmt = this.db.prepare(`
                UPDATE users 
                SET password_hash = ?, salt = ?, role = ?, name = ?, active = ?
                WHERE id = ?
            `);
            stmt.run(hash, salt, data.role, data.name, data.active ? 1 : 0, id);
        } else {
            // Update info without changing password
            const stmt = this.db.prepare(`
                UPDATE users 
                SET role = ?, name = ?, active = ?
                WHERE id = ?
            `);
            stmt.run(data.role, data.name, data.active ? 1 : 0, id);
        }
        return this.getUserById(id);
    }

    deleteUser(id) {
        // Prevent deleting the last admin? Ideally yes, but for now simple delete
        const stmt = this.db.prepare('DELETE FROM users WHERE id = ?');
        return stmt.run(id);
    }

    getUserById(id) {
        const stmt = this.db.prepare('SELECT id, username, role, name, active FROM users WHERE id = ?');
        return stmt.get(id);
    }

    initializeStoreConfig() {
        const defaults = [
            { key: 'store_name', value: 'Mi Negocio' },
            { key: 'store_address', value: 'Dirección del local' },
            { key: 'store_phone', value: '000-000-0000' },
            { key: 'store_logo', value: '' },
            { key: 'receipt_message', value: '¡Gracias por su compra!' },
            { key: 'return_policy', value: 'Cambios y devoluciones dentro de los 30 días con ticket.' }
        ];

        const checkStmt = this.db.prepare('SELECT COUNT(*) as count FROM store_config WHERE key = ?');
        const insertStmt = this.db.prepare('INSERT INTO store_config (key, value) VALUES (?, ?)');

        for (const config of defaults) {
            const exists = checkStmt.get(config.key);
            if (exists.count === 0) {
                insertStmt.run(config.key, config.value);
            }
        }
    }

    initializePaymentConfigs() {
        const configs = [
            { method: 'cash_ars', surcharge: 0, display_name: 'Efectivo (ARS)' },
            { method: 'cash_usd', surcharge: 0, display_name: 'Efectivo (USD)' },
            { method: 'transfer_ars', surcharge: 0, display_name: 'Transferencia (ARS)' },
            { method: 'transfer_usd', surcharge: 0, display_name: 'Transferencia (USD)' },
            { method: 'qr', surcharge: 10, display_name: 'QR' },
            { method: 'debit', surcharge: 10, display_name: 'Tarjeta de Débito' },
            { method: 'credit_1', surcharge: 0, display_name: 'Crédito 1 cuota' },
            { method: 'credit_3', surcharge: 15, display_name: 'Crédito 3 cuotas' },
            { method: 'credit_6', surcharge: 25, display_name: 'Crédito 6 cuotas' },
            { method: 'credit_12', surcharge: 40, display_name: 'Crédito 12 cuotas' },
            { method: 'link', surcharge: 0, display_name: 'Link de Pago' }
        ];

        const checkStmt = this.db.prepare('SELECT COUNT(*) as count FROM payment_config');
        const result = checkStmt.get();

        if (result.count === 0) {
            const insertStmt = this.db.prepare(
                'INSERT INTO payment_config (method, surcharge, display_name) VALUES (?, ?, ?)'
            );
            for (const config of configs) {
                insertStmt.run(config.method, config.surcharge, config.display_name);
            }
            console.log('Payment configurations initialized');
        }
    }

    // Category operations
    getCategories() {
        const stmt = this.db.prepare('SELECT * FROM categories ORDER BY name');
        return stmt.all();
    }

    createCategory(name) {
        const stmt = this.db.prepare('INSERT INTO categories (name) VALUES (?)');
        const result = stmt.run(name);
        return { id: result.lastInsertRowid, name };
    }

    deleteCategory(id) {
        const stmt = this.db.prepare('DELETE FROM categories WHERE id = ?');
        return stmt.run(id);
    }

    // Product operations
    getProducts(categoryId) {
        if (categoryId) {
            const stmt = this.db.prepare('SELECT * FROM products WHERE category_id = ? ORDER BY name');
            return stmt.all(categoryId);
        } else {
            const stmt = this.db.prepare('SELECT * FROM products ORDER BY name');
            return stmt.all();
        }
    }

    createProduct(data) {
        const stmt = this.db.prepare(`
      INSERT INTO products (category_id, name, supplier, cost_usd, cost_ars, price, stock, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
        const result = stmt.run(
            data.category_id,
            data.name,
            data.supplier || '',
            data.cost_usd || 0,
            data.cost_ars || 0,
            data.price,
            data.stock || 0,
            data.description || ''
        );
        return { id: result.lastInsertRowid, ...data };
    }

    updateProduct(id, data) {
        const stmt = this.db.prepare(`
      UPDATE products 
      SET name = ?, supplier = ?, cost_usd = ?, cost_ars = ?, price = ?, stock = ?, description = ?
      WHERE id = ?
    `);
        stmt.run(
            data.name,
            data.supplier || '',
            data.cost_usd || 0,
            data.cost_ars || 0,
            data.price,
            data.stock || 0,
            data.description || '',
            id
        );
        return { id, ...data };
    }

    deleteProduct(id) {
        const stmt = this.db.prepare('DELETE FROM products WHERE id = ?');
        return stmt.run(id);
    }

    // POS Operations
    getProductByBarcode(barcode) {
        // Try to find by barcode field first (with category name)
        let stmt = this.db.prepare(`
            SELECT p.*, c.name as category_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id 
            WHERE p.barcode = ?
        `);
        let product = stmt.get(barcode);

        if (product) {
            return product;
        }

        // If not found and barcode is numeric, try to find by ID
        const numericId = parseInt(barcode);
        if (!isNaN(numericId)) {
            stmt = this.db.prepare(`
                SELECT p.*, c.name as category_name 
                FROM products p 
                LEFT JOIN categories c ON p.category_id = c.id 
                WHERE p.id = ?
            `);
            product = stmt.get(numericId);
        }

        return product;
    }

    searchProducts(query) {
        if (!query) return [];
        const searchTerm = `%${query}%`;
        const stmt = this.db.prepare(`
            SELECT p.*, c.name as category_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id 
            WHERE p.name LIKE ? OR p.description LIKE ?
            ORDER BY p.name ASC
            LIMIT 20
        `);
        return stmt.all(searchTerm, searchTerm);
    }

    updateProductBarcode(productId, barcode) {
        const stmt = this.db.prepare('UPDATE products SET barcode = ? WHERE id = ?');
        return stmt.run(barcode, productId);
    }

    decrementStock(productId, quantity) {
        const stmt = this.db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?');
        return stmt.run(quantity, productId);
    }

    // Sales Operations
    createSale(saleData, items) {
        const insertSale = this.db.prepare(`
            INSERT INTO sales (payment_method, currency, subtotal, surcharge, total, installments, 
                               customer_notes, warranty_enabled, warranty_months)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const insertItem = this.db.prepare(`
            INSERT INTO sale_items (sale_id, product_id, product_name, category_name, quantity, unit_price, subtotal)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        const insertCashEntry = this.db.prepare(`
            INSERT INTO cash_register (type, amount, currency, payment_method, description, sale_id)
            VALUES ('income', ?, ?, ?, ?, ?)
        `);

        const updateStock = this.db.prepare(`
            UPDATE products SET stock = stock - ? WHERE id = ?
        `);

        // Transaction for atomicity
        const transaction = this.db.transaction((sale, saleItems) => {
            const result = insertSale.run(
                sale.payment_method,
                sale.currency,
                sale.subtotal,
                sale.surcharge,
                sale.total,
                sale.installments || 1,
                sale.customer_notes || '',
                sale.warranty_enabled ? 1 : 0,
                sale.warranty_months || 0
            );

            const saleId = result.lastInsertRowid;

            // Insert sale items and update stock
            for (const item of saleItems) {
                insertItem.run(
                    saleId,
                    item.product_id,
                    item.product_name,
                    item.category_name || '',
                    item.quantity,
                    item.unit_price,
                    item.subtotal
                );

                updateStock.run(item.quantity, item.product_id);
            }

            // Add cash register entry
            const description = `Venta #${saleId} - ${sale.payment_method}`;
            insertCashEntry.run(
                sale.total,
                sale.currency,
                sale.payment_method,
                description,
                saleId
            );

            return saleId;
        });

        return transaction(saleData, items);
    }

    getSales(filters = {}) {
        let query = `
            SELECT s.*, 
                   GROUP_CONCAT(DISTINCT si.category_name) as category_names,
                   GROUP_CONCAT(si.product_name, ', ') as product_names
            FROM sales s
            LEFT JOIN sale_items si ON s.id = si.sale_id
            WHERE 1=1
        `;
        const params = [];

        if (filters.startDate) {
            query += ' AND s.sale_date >= ?';
            params.push(filters.startDate);
        }

        if (filters.endDate) {
            query += ' AND s.sale_date <= ?';
            params.push(filters.endDate);
        }

        if (filters.payment_method) {
            query += ' AND s.payment_method = ?';
            params.push(filters.payment_method);
        }

        query += ' GROUP BY s.id ORDER BY s.sale_date DESC';

        const stmt = this.db.prepare(query);
        return stmt.all(...params);
    }

    getSaleById(id) {
        const stmt = this.db.prepare('SELECT * FROM sales WHERE id = ?');
        return stmt.get(id);
    }

    getSaleItems(saleId) {
        const stmt = this.db.prepare('SELECT * FROM sale_items WHERE sale_id = ?');
        return stmt.all(saleId);
    }

    // Cash Register Operations
    getCashRegisterEntries(filters = {}) {
        let query = `
            SELECT cr.*, 
                   GROUP_CONCAT(DISTINCT si.category_name) as category_names,
                   GROUP_CONCAT(si.product_name, ', ') as product_names
            FROM cash_register cr
            LEFT JOIN sale_items si ON cr.sale_id = si.sale_id
            WHERE 1=1
        `;
        const params = [];

        if (filters.startDate) {
            query += ' AND cr.entry_date >= ?';
            params.push(filters.startDate);
        }

        if (filters.endDate) {
            query += ' AND cr.entry_date <= ?';
            params.push(filters.endDate);
        }

        if (filters.type) {
            query += ' AND cr.type = ?';
            params.push(filters.type);
        }

        if (filters.currency) {
            query += ' AND cr.currency = ?';
            params.push(filters.currency);
        }

        query += ' GROUP BY cr.id ORDER BY cr.entry_date DESC';

        const stmt = this.db.prepare(query);
        return stmt.all(...params);
    }

    createExpense(expenseData) {
        const stmt = this.db.prepare(`
            INSERT INTO cash_register (type, amount, currency, payment_method, description, expense_category)
            VALUES ('expense', ?, ?, ?, ?, ?)
        `);
        const result = stmt.run(
            expenseData.amount,
            expenseData.currency,
            expenseData.payment_method || '',
            expenseData.description,
            expenseData.expense_category || 'otros'
        );
        return { id: result.lastInsertRowid, ...expenseData };
    }

    createIncome(incomeData) {
        const stmt = this.db.prepare(`
            INSERT INTO cash_register (type, amount, currency, payment_method, description)
            VALUES ('income', ?, ?, ?, ?)
        `);
        const result = stmt.run(
            incomeData.amount,
            incomeData.currency,
            incomeData.payment_method || '',
            incomeData.description
        );
        return { id: result.lastInsertRowid, ...incomeData };
    }

    getBalance(currency) {
        const stmt = this.db.prepare(`
            SELECT 
                SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
                SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
            FROM cash_register
            WHERE currency = ?
        `);
        const result = stmt.get(currency);
        return {
            income: result.income || 0,
            expense: result.expense || 0,
            balance: (result.income || 0) - (result.expense || 0)
        };
    }

    // Payment Config Operations
    getPaymentConfigs() {
        const stmt = this.db.prepare('SELECT * FROM payment_config ORDER BY id');
        return stmt.all();
    }

    updatePaymentConfig(method, surcharge) {
        const stmt = this.db.prepare('UPDATE payment_config SET surcharge = ? WHERE method = ?');
        return stmt.run(surcharge, method);
    }

    // Store Config Operations
    getStoreConfig() {
        const stmt = this.db.prepare('SELECT key, value FROM store_config');
        const rows = stmt.all();
        const config = {};
        for (const row of rows) {
            config[row.key] = row.value;
        }
        return config;
    }

    updateStoreConfig(key, value) {
        // Use REPLACE to handle both insert (new key) and update (existing key)
        const stmt = this.db.prepare('INSERT OR REPLACE INTO store_config (key, value) VALUES (?, ?)');
        return stmt.run(key, value);
    }

    getDashboardStats() {
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();

        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday as start
        startOfWeek.setHours(0, 0, 0, 0);

        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();

        // Sales Summaries
        const salesSummary = {
            today: this.db.prepare("SELECT COUNT(*) as count, SUM(total) as total FROM sales WHERE sale_date >= ?").get(startOfDay),
            week: this.db.prepare("SELECT COUNT(*) as count, SUM(total) as total FROM sales WHERE sale_date >= ?").get(startOfWeek.toISOString()),
            month: this.db.prepare("SELECT COUNT(*) as count, SUM(total) as total FROM sales WHERE sale_date >= ?").get(startOfMonth)
        };

        // Low Stock (<= 5)
        const lowStock = this.db.prepare(`
            SELECT p.*, c.name as category_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id 
            WHERE p.stock <= 5 
            ORDER BY p.stock ASC 
            LIMIT 10
        `).all();

        // Top Selling Products (All time)
        const topProducts = this.db.prepare(`
            SELECT product_name, SUM(quantity) as total_sold 
            FROM sale_items 
            GROUP BY product_name 
            ORDER BY total_sold DESC 
            LIMIT 5
        `).all();

        // Last 7 Days Income/Expense
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            const stats = this.db.prepare(`
                SELECT 
                    SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
                    SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
                FROM cash_register 
                WHERE date(entry_date) = ?
            `).get(dateStr);

            last7Days.push({
                date: dateStr,
                income: stats.income || 0,
                expense: stats.expense || 0
            });
        }

        return {
            salesSummary,
            lowStock,
            topProducts,
            last7Days
        };
    }

    getMonthlyReport(month, year) {
        const start = new Date(year, month, 1);
        const end = new Date(year, month + 1, 0, 23, 59, 59);

        // Use simplified ISO string (YYYY-MM-DD HH:MM:SS) for better compatibility
        const startDate = start.toISOString().replace('T', ' ').substring(0, 19);
        const endDate = end.toISOString().replace('T', ' ').substring(0, 19);

        console.log(`[MonthlyReport] Querying from ${startDate} to ${endDate}`);

        // 1. Financial Summ (Revenue, Cost, Profit)
        const financial = this.db.prepare(`
            SELECT 
                s.currency,
                SUM(s.total) as revenue,
                SUM(
                    CASE 
                        WHEN s.currency = 'USD' THEN (si.quantity * IFNULL(p.cost_usd, 0))
                        ELSE (si.quantity * IFNULL(p.cost_ars, 0))
                    END
                ) as total_cost
            FROM sales s
            JOIN sale_items si ON s.id = si.sale_id
            JOIN products p ON si.product_id = p.id
            WHERE s.sale_date >= ? AND s.sale_date <= ?
            GROUP BY s.currency
        `).all(startDate, endDate);

        console.log('[MonthlyReport] Financial Rows:', financial.length);

        // 2. Sales by Category
        const byCategory = this.db.prepare(`
            SELECT 
                c.name as category_name, 
                COUNT(DISTINCT s.id) as sales_count,
                SUM(si.quantity) as items_sold,
                SUM(si.subtotal) as revenue
            FROM sales s
            JOIN sale_items si ON s.id = si.sale_id
            JOIN products p ON si.product_id = p.id
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE s.sale_date >= ? AND s.sale_date <= ?
            GROUP BY c.id
            ORDER BY revenue DESC
        `).all(startDate, endDate);

        // 3. Top Products
        const topProducts = this.db.prepare(`
            SELECT 
                product_name,
                SUM(quantity) as quantity,
                SUM(si.subtotal) as revenue
            FROM sale_items si
            JOIN sales s ON si.sale_id = s.id
            WHERE s.sale_date >= ? AND s.sale_date <= ?
            GROUP BY product_id
            ORDER BY quantity DESC
            LIMIT 10
        `).all(startDate, endDate);

        return {
            financial,
            byCategory,
            topProducts
        };
    }

    close() {
        if (this.db) {
            this.db.close();
        }
    }
}

module.exports = DatabaseManager;
