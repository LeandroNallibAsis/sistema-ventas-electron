const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron');
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
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

    // Client Management (Phase 2)
    ipcMain.handle('get-clients', async () => {
        try {
            return dbManager.getClients();
        } catch (error) {
            console.error('Error getting clients:', error);
            throw error;
        }
    });

    ipcMain.handle('search-clients', async (event, query) => {
        try {
            return dbManager.searchClients(query);
        } catch (error) {
            console.error('Error searching clients:', error);
            throw error;
        }
    });

    ipcMain.handle('create-client', async (event, clientData) => {
        try {
            return dbManager.createClient(clientData);
        } catch (error) {
            console.error('Error creating client:', error);
            throw error;
        }
    });

    ipcMain.handle('update-client', async (event, id, clientData) => {
        try {
            return dbManager.updateClient(id, clientData);
        } catch (error) {
            console.error('Error updating client:', error);
            throw error;
        }
    });

    ipcMain.handle('delete-client', async (event, id) => {
        try {
            return dbManager.deleteClient(id);
        } catch (error) {
            console.error('Error deleting client:', error);
            throw error;
        }
    });

    // Supplier Management (Phase 2)
    ipcMain.handle('get-suppliers', async () => {
        try {
            return dbManager.getSuppliers();
        } catch (error) {
            console.error('Error getting suppliers:', error);
            throw error;
        }
    });

    ipcMain.handle('search-suppliers', async (event, query) => {
        try {
            return dbManager.searchSuppliers(query);
        } catch (error) {
            console.error('Error searching suppliers:', error);
            throw error;
        }
    });

    ipcMain.handle('create-supplier', async (event, data) => {
        try {
            return dbManager.createSupplier(data);
        } catch (error) {
            console.error('Error creating supplier:', error);
            throw error;
        }
    });

    ipcMain.handle('update-supplier', async (event, id, data) => {
        try {
            return dbManager.updateSupplier(id, data);
        } catch (error) {
            console.error('Error updating supplier:', error);
            throw error;
        }
    });

    ipcMain.handle('delete-supplier', async (event, id) => {
        try {
            return dbManager.deleteSupplier(id);
        } catch (error) {
            console.error('Error deleting supplier:', error);
            throw error;
        }
    });

    // Purchase Management (Phase 2)
    ipcMain.handle('create-purchase', async (event, data) => {
        try {
            return dbManager.createPurchase(data);
        } catch (error) {
            console.error('Error creating purchase:', error);
            throw error;
        }
    });

    ipcMain.handle('get-purchases', async (event, filters) => {
        try {
            return dbManager.getPurchases(filters);
        } catch (error) {
            console.error('Error getting purchases:', error);
            throw error;
        }
    });

    ipcMain.handle('add-purchase-payment', async (event, purchaseId, data) => {
        try {
            return dbManager.addPurchasePayment(purchaseId, data);
        } catch (error) {
            console.error('Error adding purchase payment:', error);
            throw error;
        }
    });

    ipcMain.handle('get-purchase-payments', async (event, purchaseId) => {
        try {
            return dbManager.getPurchasePayments(purchaseId);
        } catch (error) {
            console.error('Error getting purchase payments:', error);
            throw error;
        }
    });

    ipcMain.handle('get-purchase-by-id', async (event, id) => {
        try {
            return dbManager.getPurchaseById(id);
        } catch (error) {
            console.error('Error getting purchase by id:', error);
            throw error;
        }
    });

    // Cash Register Backup/Restore
    ipcMain.handle('export-cash-register', async () => {
        try {
            const data = dbManager.exportCashRegister();

            // Show save dialog
            const result = await dialog.showSaveDialog(mainWindow, {
                title: 'Exportar Libro de Caja',
                defaultPath: `caja_backup_${new Date().toISOString().split('T')[0]}.xlsx`,
                filters: [
                    { name: 'Excel', extensions: ['xlsx'] }
                ]
            });

            if (!result.canceled && result.filePath) {
                // Format data for Excel
                const excelData = data.map(entry => ({
                    'ID': entry.id,
                    'Fecha': entry.entry_date,
                    'Tipo': entry.type === 'income' ? 'INGRESO' : 'EGRESO',
                    'Monto': entry.amount,
                    'Moneda': entry.currency,
                    'Método de Pago': entry.payment_method || '',
                    'Descripción': entry.description || '',
                    'Categoría': entry.expense_category || '',
                    'ID Venta': entry.sale_id || ''
                }));

                // Create workbook
                const ws = XLSX.utils.json_to_sheet(excelData);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, 'Libro de Caja');

                // Auto-adjust column widths
                const colWidths = [
                    { wch: 6 },  // ID
                    { wch: 20 }, // Fecha
                    { wch: 10 }, // Tipo
                    { wch: 12 }, // Monto
                    { wch: 8 },  // Moneda
                    { wch: 18 }, // Método
                    { wch: 40 }, // Descripción
                    { wch: 15 }, // Categoría
                    { wch: 10 }  // ID Venta
                ];
                ws['!cols'] = colWidths;

                // Write file
                XLSX.writeFile(wb, result.filePath);
                return { success: true, path: result.filePath };
            }

            return { success: false, canceled: true };
        } catch (error) {
            console.error('Error exporting cash register:', error);
            throw error;
        }
    });

    ipcMain.handle('import-cash-register', async (event, mode) => {
        try {
            // Show open dialog
            const result = await dialog.showOpenDialog(mainWindow, {
                title: 'Importar Libro de Caja',
                filters: [
                    { name: 'Excel', extensions: ['xlsx'] }
                ],
                properties: ['openFile']
            });

            if (!result.canceled && result.filePaths.length > 0) {
                // Read Excel file
                const workbook = XLSX.readFile(result.filePaths[0]);
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const excelData = XLSX.utils.sheet_to_json(worksheet);

                // Convert Excel data back to database format
                const data = excelData.map(row => ({
                    entry_date: row['Fecha'],
                    type: row['Tipo'] === 'INGRESO' ? 'income' : 'expense',
                    amount: row['Monto'],
                    currency: row['Moneda'],
                    payment_method: row['Método de Pago'] || null,
                    description: row['Descripción'] || null,
                    expense_category: row['Categoría'] || null,
                    sale_id: row['ID Venta'] || null
                }));

                // Import data
                dbManager.importCashRegister(data, mode);

                return { success: true, count: data.length };
            }

            return { success: false, canceled: true };
        } catch (error) {
            console.error('Error importing cash register:', error);
            throw error;
        }
    });
    // Notes Management
    ipcMain.handle('get-notes', async () => {
        try {
            return dbManager.getNotes();
        } catch (error) {
            console.error('Error getting notes:', error);
            throw error;
        }
    });

    ipcMain.handle('create-note', async (event, note) => {
        try {
            return dbManager.createNote(note);
        } catch (error) {
            console.error('Error creating note:', error);
            throw error;
        }
    });

    ipcMain.handle('update-note', async (event, id, data) => {
        try {
            return dbManager.updateNote(id, data);
        } catch (error) {
            console.error('Error updating note:', error);
            throw error;
        }
    });

    ipcMain.handle('delete-note', async (event, id) => {
        try {
            return dbManager.deleteNote(id);
        } catch (error) {
            console.error('Error deleting note:', error);
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
