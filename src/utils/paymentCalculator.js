// Payment calculation utilities for ElectroStock POS

/**
 * Calculate surcharge based on payment method and installments
 * @param {number} subtotal - Base amount before surcharge
 * @param {string} paymentMethod - Payment method key (e.g., 'qr', 'credit_3')
 * @param {number} surchargePercent - Surcharge percentage (e.g., 10 for 10%)
 * @returns {number} Surcharge amount
 */
export function calculateSurcharge(subtotal, paymentMethod, surchargePercent) {
    if (!surchargePercent || surchargePercent === 0) {
        return 0;
    }
    return (subtotal * surchargePercent) / 100;
}

/**
 * Calculate total with surcharge
 * @param {number} subtotal - Base amount
 * @param {number} surcharge - Surcharge amount
 * @returns {number} Total amount
 */
export function calculateTotal(subtotal, surcharge) {
    return subtotal + surcharge;
}

/**
 * Get installment count from payment method
 * @param {string} paymentMethod - Payment method key
 * @returns {number} Number of installments (1 if not credit)
 */
export function getInstallments(paymentMethod) {
    if (paymentMethod.startsWith('credit_')) {
        const parts = paymentMethod.split('_');
        return parseInt(parts[1]) || 1;
    }
    return 1;
}

/**
 * Calculate monthly payment for installments
 * @param {number} total - Total amount
 * @param {number} installments - Number of installments
 * @returns {number} Monthly payment amount
 */
export function calculateMonthlyPayment(total, installments) {
    return total / installments;
}

/**
 * Format currency for display
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code ('ARS' or 'USD')
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, currency = 'ARS') {
    const symbol = currency === 'USD' ? '$' : '$';
    const formatted = amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${symbol}${formatted}`;
}

/**
 * Get currency from payment method
 * @param {string} paymentMethod - Payment method key
 * @returns {string} Currency code ('ARS' or 'USD')
 */
export function getCurrencyFromMethod(paymentMethod) {
    if (paymentMethod.includes('_usd')) {
        return 'USD';
    }
    if (paymentMethod.includes('_ars')) {
        return 'ARS';
    }
    return 'ARS'; // Default
}

/**
 * Get payment method display name
 * @param {string} method - Payment method key
 * @param {Object[]} configs - Payment configurations from database
 * @returns {string} Display name
 */
export function getPaymentDisplayName(method, configs) {
    const config = configs.find(c => c.method === method);
    return config ? config.display_name : method;
}

/**
 * Get surcharge percentage from configs
 * @param {string} method - Payment method key
 * @param {Object[]} configs - Payment configurations from database
 * @returns {number} Surcharge percentage
 */
export function getSurchargePercent(method, configs) {
    const config = configs.find(c => c.method === method);
    return config ? config.surcharge : 0;
}

/**
 * Validate stock availability
 * @param {Object} product - Product object
 * @param {number} requestedQty - Requested quantity
 * @returns {{valid: boolean, message: string}} Validation result
 */
export function validateStock(product, requestedQty) {
    if (!product) {
        return { valid: false, message: 'Producto no encontrado' };
    }

    if (product.stock < requestedQty) {
        return {
            valid: false,
            message: `Stock insuficiente. Disponible: ${product.stock}`
        };
    }

    return { valid: true, message: '' };
}

/**
 * Format date for display
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export function formatDate(date) {
    const d = new Date(date);
    return d.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Generate receipt number from sale ID
 * @param {number} saleId - Sale ID
 * @returns {string} Formatted receipt number
 */
export function formatReceiptNumber(saleId) {
    return `#${String(saleId).padStart(6, '0')}`;
}
