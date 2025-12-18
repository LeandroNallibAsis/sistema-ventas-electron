const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('api', {
    // Category operations
    getCategories: () => ipcRenderer.invoke('get-categories'),
    createCategory: (name) => ipcRenderer.invoke('create-category', name),
    deleteCategory: (id) => ipcRenderer.invoke('delete-category', id),

    // Product operations
    getProducts: (categoryId) => ipcRenderer.invoke('get-products', categoryId),
    createProduct: (data) => ipcRenderer.invoke('create-product', data),
    updateProduct: (id, data) => ipcRenderer.invoke('update-product', id, data),
    deleteProduct: (id) => ipcRenderer.invoke('delete-product', id),

    // POS operations
    getProductByBarcode: (barcode) => ipcRenderer.invoke('get-product-by-barcode', barcode),
    searchProducts: (query) => ipcRenderer.invoke('search-products', query),
    updateProductBarcode: (productId, barcode) => ipcRenderer.invoke('update-product-barcode', productId, barcode),

    // Sales operations
    createSale: (saleData, items) => ipcRenderer.invoke('create-sale', saleData, items),
    getSales: (filters) => ipcRenderer.invoke('get-sales', filters),
    getSaleDetail: (saleId) => ipcRenderer.invoke('get-sale-detail', saleId),

    // Cash register operations
    getCashRegister: (filters) => ipcRenderer.invoke('get-cash-register', filters),
    createExpense: (expenseData) => ipcRenderer.invoke('create-expense', expenseData),
    createIncome: (incomeData) => ipcRenderer.invoke('create-income', incomeData),
    getBalance: (currency) => ipcRenderer.invoke('get-balance', currency),

    // Payment config operations
    getPaymentConfigs: () => ipcRenderer.invoke('get-payment-configs'),
    updatePaymentConfig: (method, surcharge) => ipcRenderer.invoke('update-payment-config', method, surcharge),

    // Store config operations
    getStoreConfig: () => ipcRenderer.invoke('get-store-config'),
    updateStoreConfig: (key, value) => ipcRenderer.invoke('update-store-config', key, value),

    // Dashboard
    // Dashboard
    getDashboardStats: () => ipcRenderer.invoke('get-dashboard-stats'),
    getMonthlyReport: (month, year) => ipcRenderer.invoke('get-monthly-report', month, year),

    // Utilities
    openExternal: (url) => ipcRenderer.invoke('open-external', url),

    // User Authentication
    login: (username, password) => ipcRenderer.invoke('login', username, password),
    getUsers: () => ipcRenderer.invoke('get-users'),
    createUser: (userData) => ipcRenderer.invoke('create-user', userData),
    updateUser: (id, userData) => ipcRenderer.invoke('update-user', id, userData),
    deleteUser: (id) => ipcRenderer.invoke('delete-user', id),

    // Client Management
    getClients: () => ipcRenderer.invoke('get-clients'),
    searchClients: (query) => ipcRenderer.invoke('search-clients', query),
    createClient: (clientData) => ipcRenderer.invoke('create-client', clientData),
    updateClient: (id, clientData) => ipcRenderer.invoke('update-client', id, clientData),
    deleteClient: (id) => ipcRenderer.invoke('delete-client', id),

    // Supplier Management
    getSuppliers: () => ipcRenderer.invoke('get-suppliers'),
    searchSuppliers: (query) => ipcRenderer.invoke('search-suppliers', query),
    createSupplier: (data) => ipcRenderer.invoke('create-supplier', data),
    updateSupplier: (id, data) => ipcRenderer.invoke('update-supplier', id, data),
    deleteSupplier: (id) => ipcRenderer.invoke('delete-supplier', id),

    // Purchase Management
    createPurchase: (data) => ipcRenderer.invoke('create-purchase', data),
    getPurchases: (filters) => ipcRenderer.invoke('get-purchases', filters),
    addPurchasePayment: (purchaseId, data) => ipcRenderer.invoke('add-purchase-payment', purchaseId, data),
    getPurchasePayments: (purchaseId) => ipcRenderer.invoke('get-purchase-payments', purchaseId),
    getPurchaseById: (id) => ipcRenderer.invoke('get-purchase-by-id', id),

    // Cash Register Backup/Restore
    exportCashRegister: () => ipcRenderer.invoke('export-cash-register'),
    importCashRegister: (mode) => ipcRenderer.invoke('import-cash-register', mode),

    // Notes Board
    getNotes: () => ipcRenderer.invoke('get-notes'),
    createNote: (data) => ipcRenderer.invoke('create-note', data),
    updateNote: (id, data) => ipcRenderer.invoke('update-note', id, data),
    deleteNote: (id) => ipcRenderer.invoke('delete-note', id),
});
