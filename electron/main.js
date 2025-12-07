const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const DatabaseManager = require('./database');

let mainWindow;
let dbManager;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        },
        icon: path.join(__dirname, '../public/icon.png'),
    });

    // Load the app
    if (!app.isPackaged) {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist-react/index.html'));
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

function setupIPC() {
    // Category handlers
    ipcMain.handle('get-categories', async () => {
        try {
            return dbManager.getCategories();
        } catch (error) {
            console.error('Error getting categories:', error);
            throw error;
        }
    });

    ipcMain.handle('create-category', async (event, name) => {
        try {
            return dbManager.createCategory(name);
        } catch (error) {
            console.error('Error creating category:', error);
            throw error;
        }
    });

    ipcMain.handle('delete-category', async (event, id) => {
        try {
            return dbManager.deleteCategory(id);
        } catch (error) {
            console.error('Error deleting category:', error);
            throw error;
        }
    });

    // Product handlers
    ipcMain.handle('get-products', async (event, categoryId) => {
        try {
            return dbManager.getProducts(categoryId);
        } catch (error) {
            console.error('Error getting products:', error);
            throw error;
        }
    });

    ipcMain.handle('create-product', async (event, data) => {
        try {
            return dbManager.createProduct(data);
        } catch (error) {
            console.error('Error creating product:', error);
            throw error;
        }
    });

    ipcMain.handle('update-product', async (event, id, data) => {
        try {
            return dbManager.updateProduct(id, data);
        } catch (error) {
            console.error('Error updating product:', error);
            throw error;
        }
    });

    ipcMain.handle('delete-product', async (event, id) => {
        try {
            return dbManager.deleteProduct(id);
        } catch (error) {
            console.error('Error deleting product:', error);
            throw error;
        }
    });

    // POS handlers
    ipcMain.handle('get-product-by-barcode', async (event, barcode) => {
        try {
            return dbManager.getProductByBarcode(barcode);
        } catch (error) {
            console.error('Error getting product by barcode:', error);
            throw error;
        }
    });

    ipcMain.handle('search-products', async (event, query) => {
        try {
            return dbManager.searchProducts(query);
        } catch (error) {
            console.error('Error searching products:', error);
            throw error;
        }
    });

    ipcMain.handle('update-product-barcode', async (event, productId, barcode) => {
        try {
            return dbManager.updateProductBarcode(productId, barcode);
        } catch (error) {
            console.error('Error updating barcode:', error);
            throw error;
        }
    });

    // Sales handlers
    ipcMain.handle('create-sale', async (event, saleData, items) => {
        try {
            return dbManager.createSale(saleData, items);
        } catch (error) {
            console.error('Error creating sale:', error);
            throw error;
        }
    });

    ipcMain.handle('get-sales', async (event, filters) => {
        try {
            return dbManager.getSales(filters);
        } catch (error) {
            console.error('Error getting sales:', error);
            throw error;
        }
    });

    ipcMain.handle('get-sale-detail', async (event, saleId) => {
        try {
            const sale = dbManager.getSaleById(saleId);
            const items = dbManager.getSaleItems(saleId);
            return { sale, items };
        } catch (error) {
            console.error('Error getting sale detail:', error);
            throw error;
        }
    });

    // Cash register handlers
    ipcMain.handle('get-cash-register', async (event, filters) => {
        try {
            return dbManager.getCashRegisterEntries(filters);
        } catch (error) {
            console.error('Error getting cash register:', error);
            throw error;
        }
    });

    ipcMain.handle('create-expense', async (event, expenseData) => {
        try {
            return dbManager.createExpense(expenseData);
        } catch (error) {
            console.error('Error creating expense:', error);
            throw error;
        }
    });

    ipcMain.handle('get-balance', async (event, currency) => {
        try {
            return dbManager.getBalance(currency);
        } catch (error) {
            console.error('Error getting balance:', error);
            throw error;
        }
    });

    ipcMain.handle('create-income', async (event, incomeData) => {
        try {
            return dbManager.createIncome(incomeData);
        } catch (error) {
            console.error('Error creating income:', error);
            throw error;
        }
    });

    // Payment config handlers
    ipcMain.handle('get-payment-configs', async () => {
        try {
            return dbManager.getPaymentConfigs();
        } catch (error) {
            console.error('Error getting payment configs:', error);
            throw error;
        }
    });

    ipcMain.handle('update-payment-config', async (event, method, surcharge) => {
        try {
            return dbManager.updatePaymentConfig(method, surcharge);
        } catch (error) {
            console.error('Error updating payment config:', error);
            throw error;
        }
    });

    // Store config handlers
    ipcMain.handle('get-store-config', async () => {
        try {
            return dbManager.getStoreConfig();
        } catch (error) {
            console.error('Error getting store config:', error);
            throw error;
        }
    });

    ipcMain.handle('update-store-config', async (event, key, value) => {
        try {
            return dbManager.updateStoreConfig(key, value);
        } catch (error) {
            console.error('Error updating store config:', error);
            throw error;
        }
    });

    // Dashboard handlers
    ipcMain.handle('get-dashboard-stats', async () => {
        try {
            return dbManager.getDashboardStats();
        } catch (error) {
            console.error('Error getting dashboard stats:', error);
            throw error;
        }
    });

    ipcMain.handle('get-monthly-report', async (event, month, year) => {
        try {
            return dbManager.getMonthlyReport(month, year);
        } catch (error) {
            console.error('Error getting monthly report:', error);
            throw error;
        }
    });

    // Handle external links
    ipcMain.handle('open-external', async (event, url) => {
        await shell.openExternal(url);
    });

    // User Authentication & Management
    ipcMain.handle('login', async (event, username, password) => {
        try {
            return dbManager.validateUser(username, password);
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    });

    ipcMain.handle('get-users', async () => {
        try {
            return dbManager.getUsers();
        } catch (error) {
            console.error('Error getting users:', error);
            throw error;
        }
    });

    ipcMain.handle('create-user', async (event, userData) => {
        try {
            return dbManager.createUser(userData);
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    });

    ipcMain.handle('update-user', async (event, id, userData) => {
        try {
            return dbManager.updateUser(id, userData);
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    });

    ipcMain.handle('delete-user', async (event, id) => {
        try {
            return dbManager.deleteUser(id);
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    });
}

app.whenReady().then(() => {
    // Initialize database
    dbManager = new DatabaseManager();
    dbManager.initialize();

    // Setup IPC handlers
    setupIPC();

    // Create window
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        if (dbManager) {
            dbManager.close();
        }
        app.quit();
    }
});

app.on('before-quit', () => {
    if (dbManager) {
        dbManager.close();
    }
});
