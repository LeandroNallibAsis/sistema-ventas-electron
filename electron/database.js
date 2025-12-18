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

        // Clients table (Phase 2)
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS clients (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                type TEXT DEFAULT 'consumer', -- 'consumer', 'business'
                identifier TEXT, -- DNI, CUIT, etc.
                phone TEXT,
                email TEXT,
                address TEXT,
                notes TEXT,
                debt REAL DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Migration: Add client_id to sales if not exists
        try {
            const columns = this.db.prepare("PRAGMA table_info(sales)").all();
            const hasClientId = columns.some(col => col.name === 'client_id');
            if (!hasClientId) {
                this.db.exec('ALTER TABLE sales ADD COLUMN client_id INTEGER REFERENCES clients(id)');
                console.log('Migration: Added client_id column to sales');
            }
        } catch (error) {
            console.error('Migration error (client_id):', error);
        }

        // Suppliers table (Phase 2 - Supplier Management)
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS suppliers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                company TEXT,
                products_sold TEXT,
                contact_phone TEXT,
                shipping_methods TEXT,
                notes TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Purchases table (Phase 2 - Supplier Management)
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS purchases (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                supplier_id INTEGER NOT NULL,
                description TEXT NOT NULL,
                total_amount REAL NOT NULL,
                paid_amount REAL DEFAULT 0,
                payment_status TEXT DEFAULT 'pending',
                purchase_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                due_date TEXT,
                notes TEXT,
                FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
            )
        `);

        // Purchase payments table (Phase 2 - Supplier Management)
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS purchase_payments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                purchase_id INTEGER NOT NULL,
                amount REAL NOT NULL,
                payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                payment_method TEXT,
                notes TEXT,
                FOREIGN KEY (purchase_id) REFERENCES purchases(id)
            )
        `);

        // Notes table (Board Feature)
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS notes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT,
                content TEXT,
                color TEXT DEFAULT 'bg-yellow-200',
                is_completed INTEGER DEFAULT 0,
                position_order INTEGER DEFAULT 0,
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

    // Client Operations
    createClient(clientData) {
        const stmt = this.db.prepare(`
            INSERT INTO clients (name, type, identifier, phone, email, address, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        const result = stmt.run(
            clientData.name,
            clientData.type || 'consumer',
            clientData.identifier,
            clientData.phone,
            clientData.email,
            clientData.address,
            clientData.notes
        );
        return { id: result.lastInsertRowid, ...clientData };
    }

    getClients() {
        return this.db.prepare('SELECT * FROM clients ORDER BY name').all();
    }

    searchClients(query) {
        const stmt = this.db.prepare(`
            SELECT * FROM clients 
            WHERE name LIKE ? OR identifier LIKE ? OR phone LIKE ?
            ORDER BY name
            LIMIT 20
        `);
        const search = `%${query}%`;
        return stmt.all(search, search, search);
    }

    updateClient(id, data) {
        const stmt = this.db.prepare(`
            UPDATE clients 
            SET name = ?, type = ?, identifier = ?, phone = ?, email = ?, address = ?, notes = ?
            WHERE id = ?
        `);
        stmt.run(
            data.name,
            data.type,
            data.identifier,
            data.phone,
            data.email,
            data.address,
            data.notes,
            id
        );
        return this.getClientById(id);
    }

    deleteClient(id) {
        // Prevent delete if has sales... or just set active to 0? 
        // For now, allow delete but SQL constraint might fail if we enforce FK. 
        // SQLite enforces FK only if PRAGMA foreign_keys = ON.
        return this.db.prepare('DELETE FROM clients WHERE id = ?').run(id);
    }

    getClientById(id) {
        return this.db.prepare('SELECT * FROM clients WHERE id = ?').get(id);
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
                               customer_notes, warranty_enabled, warranty_months, client_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
                sale.warranty_months || 0,
                sale.client_id || null
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
            const description = `Venta #${saleId} - ${sale.payment_method} ${sale.client_id ? '(Cliente Registrado)' : ''}`;
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

    // ==================== Supplier Management ====================

    createSupplier(supplierData) {
        const stmt = this.db.prepare(`
            INSERT INTO suppliers (name, company, products_sold, contact_phone, shipping_methods, notes)
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        const result = stmt.run(
            supplierData.name,
            supplierData.company || null,
            supplierData.products_sold || null,
            supplierData.contact_phone || null,
            supplierData.shipping_methods || null,
            supplierData.notes || null
        );
        return { id: result.lastInsertRowid };
    }

    getSuppliers() {
        return this.db.prepare('SELECT * FROM suppliers ORDER BY name').all();
    }

    searchSuppliers(query) {
        return this.db.prepare(`
            SELECT * FROM suppliers 
            WHERE name LIKE ? OR company LIKE ? OR contact_phone LIKE ?
            ORDER BY name
            LIMIT 50
        `).all(`%${query}%`, `%${query}%`, `%${query}%`);
    }

    updateSupplier(id, data) {
        const stmt = this.db.prepare(`
            UPDATE suppliers 
            SET name = ?, company = ?, products_sold = ?, contact_phone = ?, 
                shipping_methods = ?, notes = ?
            WHERE id = ?
        `);
        stmt.run(
            data.name,
            data.company || null,
            data.products_sold || null,
            data.contact_phone || null,
            data.shipping_methods || null,
            data.notes || null,
            id
        );
    }

    deleteSupplier(id) {
        this.db.prepare('DELETE FROM suppliers WHERE id = ?').run(id);
    }

    getSupplierById(id) {
        return this.db.prepare('SELECT * FROM suppliers WHERE id = ?').get(id);
    }

    // ==================== Purchase Management ====================

    createPurchase(purchaseData) {
        const transaction = this.db.transaction((data) => {
            // Insert purchase
            const purchaseStmt = this.db.prepare(`
                INSERT INTO purchases (supplier_id, description, total_amount, paid_amount, 
                                      payment_status, due_date, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `);
            const result = purchaseStmt.run(
                data.supplier_id,
                data.description,
                data.total_amount,
                data.paid_amount || 0,
                data.payment_status || 'pending',
                data.due_date || null,
                data.notes || null
            );
            const purchaseId = result.lastInsertRowid;

            // Add to cash register as expense (only if paid something)
            if (data.paid_amount && data.paid_amount > 0) {
                const cashStmt = this.db.prepare(`
                    INSERT INTO cash_register (type, amount, currency, payment_method, description, expense_category)
                    VALUES ('expense', ?, ?, ?, ?, ?)
                `);
                cashStmt.run(
                    data.paid_amount,  // Changed from data.total_amount to data.paid_amount
                    data.currency || 'ARS',
                    data.payment_method || 'cash_ars',
                    `Compra #${purchaseId} - ${data.description}`,
                    'supplier_purchase'
                );
            }

            return purchaseId;
        });

        return transaction(purchaseData);
    }

    getPurchases(filters = {}) {
        let query = `
            SELECT p.*, s.name as supplier_name, s.company as supplier_company
            FROM purchases p
            JOIN suppliers s ON p.supplier_id = s.id
            WHERE 1=1
        `;
        const params = [];

        if (filters.supplier_id) {
            query += ' AND p.supplier_id = ?';
            params.push(filters.supplier_id);
        }

        if (filters.status) {
            query += ' AND p.payment_status = ?';
            params.push(filters.status);
        }

        query += ' ORDER BY p.purchase_date DESC';

        return this.db.prepare(query).all(...params);
    }

    addPurchasePayment(purchaseId, paymentData) {
        const transaction = this.db.transaction((pId, data) => {
            // Insert payment record
            const paymentStmt = this.db.prepare(`
                INSERT INTO purchase_payments (purchase_id, amount, payment_method, notes)
                VALUES (?, ?, ?, ?)
            `);
            paymentStmt.run(
                pId,
                data.amount,
                data.payment_method || null,
                data.notes || null
            );

            // Update purchase paid_amount and status
            const purchase = this.db.prepare('SELECT total_amount, paid_amount FROM purchases WHERE id = ?').get(pId);
            const newPaidAmount = purchase.paid_amount + data.amount;
            let newStatus = 'pending';

            if (newPaidAmount >= purchase.total_amount) {
                newStatus = 'paid';
            } else if (newPaidAmount > 0) {
                newStatus = 'partial';
            }

            const updateStmt = this.db.prepare(`
                UPDATE purchases 
                SET paid_amount = ?, payment_status = ?
                WHERE id = ?
            `);
            updateStmt.run(newPaidAmount, newStatus, pId);

            // Add to cash register
            const cashStmt = this.db.prepare(`
                INSERT INTO cash_register (type, amount, currency, payment_method, description, expense_category)
                VALUES ('expense', ?, ?, ?, ?, ?)
            `);
            cashStmt.run(
                data.amount,
                data.currency || 'ARS',
                data.payment_method || 'cash_ars',
                `Pago Compra #${pId}`,
                'supplier_payment'
            );
        });

        transaction(purchaseId, paymentData);
    }

    getPurchasePayments(purchaseId) {
        return this.db.prepare(`
            SELECT * FROM purchase_payments 
            WHERE purchase_id = ? 
            ORDER BY payment_date DESC
        `).all(purchaseId);
    }

    getPurchaseById(id) {
        return this.db.prepare(`
            SELECT p.*, s.name as supplier_name, s.company as supplier_company
            FROM purchases p
            JOIN suppliers s ON p.supplier_id = s.id
            WHERE p.id = ?
        `).get(id);
    }

    // ==================== Cash Register Backup/Restore ====================

    exportCashRegister() {
        // Get all cash register entries
        const entries = this.db.prepare('SELECT * FROM cash_register ORDER BY entry_date ASC').all();
        return entries;
    }

    importCashRegister(entries, mode = 'append') {
        const transaction = this.db.transaction((data, importMode) => {
            if (importMode === 'replace') {
                // Clear existing data
                this.db.prepare('DELETE FROM cash_register').run();
            }

            // Insert entries
            const stmt = this.db.prepare(`
                INSERT INTO cash_register (entry_date, type, amount, currency, payment_method, description, expense_category, sale_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `);

            for (const entry of data) {
                stmt.run(
                    entry.entry_date,
                    entry.type,
                    entry.amount,
                    entry.currency,
                    entry.payment_method || null,
                    entry.description || null,
                    entry.expense_category || null,
                    entry.sale_id || null
                );
            }
        });

        transaction(entries, mode);
    }



    // ==================== Notes Management ====================

    getNotes() {
        return this.db.prepare('SELECT * FROM notes ORDER BY is_completed ASC, position_order DESC, created_at DESC').all();
    }

    createNote(noteData) {
        const stmt = this.db.prepare(`
            INSERT INTO notes (title, content, color, position_order)
            VALUES (?, ?, ?, ?)
        `);
        // Get max position to put new note first
        const maxPos = this.db.prepare('SELECT MAX(position_order) as max FROM notes').get().max || 0;

        const result = stmt.run(
            noteData.title,
            noteData.content,
            noteData.color || 'bg-yellow-200',
            maxPos + 1
        );
        return result.lastInsertRowid;
    }

    updateNote(id, data) {
        // Build dynamic update query
        const fields = [];
        const values = [];

        if (data.title !== undefined) { fields.push('title = ?'); values.push(data.title); }
        if (data.content !== undefined) { fields.push('content = ?'); values.push(data.content); }
        if (data.color !== undefined) { fields.push('color = ?'); values.push(data.color); }
        if (data.is_completed !== undefined) { fields.push('is_completed = ?'); values.push(data.is_completed ? 1 : 0); }
        if (data.position_order !== undefined) { fields.push('position_order = ?'); values.push(data.position_order); }

        if (fields.length === 0) return 0;

        values.push(id);
        const stmt = this.db.prepare(`UPDATE notes SET ${fields.join(', ')} WHERE id = ?`);
        const result = stmt.run(...values);
        return result.changes;
    }

    deleteNote(id) {
        return this.db.prepare('DELETE FROM notes WHERE id = ?').run(id).changes;
    }

    close() {
        if (this.db) {
            this.db.close();
        }
    }
}

module.exports = DatabaseManager;
