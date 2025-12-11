import React, { useState, useEffect, useRef } from 'react';
import {
    calculateSurcharge,
    calculateTotal,
    formatCurrency,
    getSurchargePercent,
    validateStock,
    formatDate
} from '../utils/paymentCalculator';
import ReceiptModal from './ReceiptModal';

const POSScreen = () => {
    const [barcodeInput, setBarcodeInput] = useState('');
    const [cart, setCart] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState('cash_ars');
    const [paymentConfigs, setPaymentConfigs] = useState([]);
    const [customerNotes, setCustomerNotes] = useState('');
    const [warranty, setWarranty] = useState({ enabled: false, months: 1 });
    const [showReceipt, setShowReceipt] = useState(false);
    const [lastSaleId, setLastSaleId] = useState(null);
    const [lastSaleDetails, setLastSaleDetails] = useState(null);
    const [error, setError] = useState('');

    const [showSearchModal, setShowSearchModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    // Client Search States
    const [selectedClient, setSelectedClient] = useState(null);
    const [showClientModal, setShowClientModal] = useState(false);
    const [clientSearchQuery, setClientSearchQuery] = useState('');
    const [clientResults, setClientResults] = useState([]);

    const barcodeInputRef = useRef(null);
    const searchInputRef = useRef(null);

    const paymentLabels = {
        'cash_ars': 'Efectivo (ARS)',
        'cash_usd': 'Efectivo (USD)',
        'transfer_ars': 'Transferencia (ARS)',
        'transfer_usd': 'Transferencia (USD)',
        'qr': 'QR',
        'debit': 'Tarjeta de Débito',
        'credit_1': 'Crédito 1 cuota',
        'credit_3': 'Crédito 3 cuotas',
        'credit_6': 'Crédito 6 cuotas',
        'credit_12': 'Crédito 12 cuotas',
        'link': 'Link de Pago'
    };

    useEffect(() => {
        loadPaymentConfigs();
        // Auto-focus barcode input
        barcodeInputRef.current?.focus();
    }, []);

    useEffect(() => {
        // Debounce search
        const delayDebounceFn = setTimeout(() => {
            if (searchQuery.length >= 2) {
                performSearch();
            } else {
                setSearchResults([]);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    useEffect(() => {
        if (showSearchModal) {
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 100);
        }
    }, [showSearchModal]);

    const performSearch = async () => {
        try {
            const results = await window.api.searchProducts(searchQuery);
            setSearchResults(results);
        } catch (error) {
            console.error('Error searching products:', error);
        }
    };

    const performClientSearch = async (query) => {
        try {
            const results = await window.api.searchClients(query);
            setClientResults(results);
        } catch (error) {
            console.error('Error searching clients:', error);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (clientSearchQuery.length >= 2) {
                performClientSearch(clientSearchQuery);
            } else {
                setClientResults([]);
            }
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [clientSearchQuery]);

    const handleAddFromSearch = (product) => {
        addToCart(product);
        setShowSearchModal(false);
        setSearchQuery('');
        setSearchResults([]);
        // Refocus barcode after adding
        setTimeout(() => barcodeInputRef.current?.focus(), 100);
    };

    const loadPaymentConfigs = async () => {
        try {
            const configs = await window.api.getPaymentConfigs();
            setPaymentConfigs(configs);
        } catch (error) {
            console.error('Error loading payment configs:', error);
        }
    };

    const addToCart = (product) => {
        // Check if product already in cart
        const existingIndex = cart.findIndex(item => item.product_id === product.id);

        if (existingIndex >= 0) {
            // Increase quantity
            const newCart = [...cart];
            const newQty = newCart[existingIndex].quantity + 1;

            const validation = validateStock(product, newQty);
            if (!validation.valid) {
                setError(validation.message);
                return;
            }

            newCart[existingIndex].quantity = newQty;
            newCart[existingIndex].subtotal = product.price * newQty;
            setCart(newCart);
        } else {
            // Add new item
            const validation = validateStock(product, 1);
            if (!validation.valid) {
                setError(validation.message);
                return;
            }

            setCart([...cart, {
                product_id: product.id,
                product_name: product.name,
                category_name: product.category_name || '',
                unit_price: product.price,
                quantity: 1,
                subtotal: product.price,
                stock_available: product.stock
            }]);
        }
        setError('');
    };

    const handleBarcodeSubmit = async (e) => {
        e.preventDefault();
        if (!barcodeInput.trim()) return;

        try {
            const product = await window.api.getProductByBarcode(barcodeInput.trim());

            if (!product) {
                setError(`Producto no encontrado: ${barcodeInput}`);
                setBarcodeInput('');
                return;
            }

            addToCart(product);
            setBarcodeInput('');
            setError('');
        } catch (error) {
            console.error('Error adding product:', error);
            setError('Error al buscar producto');
        }
    };

    const updateQuantity = (index, newQty) => {
        if (newQty < 1) return;

        const newCart = [...cart];
        const item = newCart[index];

        if (newQty > item.stock_available) {
            setError(`Stock insuficiente. Disponible: ${item.stock_available}`);
            return;
        }

        item.quantity = newQty;
        item.subtotal = item.unit_price * newQty;
        setCart(newCart);
        setError('');
    };

    const removeFromCart = (index) => {
        setCart(cart.filter((_, i) => i !== index));
    };

    const calculateSubtotal = () => {
        return cart.reduce((sum, item) => sum + item.subtotal, 0);
    };

    const getSurcharge = () => {
        const subtotal = calculateSubtotal();
        const percent = getSurchargePercent(paymentMethod, paymentConfigs);
        return calculateSurcharge(subtotal, paymentMethod, percent);
    };

    const getTotal = () => {
        const subtotal = calculateSubtotal();
        const surcharge = getSurcharge();
        return calculateTotal(subtotal, surcharge);
    };

    const getCurrency = () => {
        return paymentMethod.includes('_usd') ? 'USD' : 'ARS';
    };

    const getInstallments = () => {
        if (paymentMethod.startsWith('credit_')) {
            const parts = paymentMethod.split('_');
            return parseInt(parts[1]) || 1;
        }
        return 1;
    };

    const handleCompleteSale = async () => {
        if (cart.length === 0) {
            setError('El carrito está vacío');
            return;
        }

        try {
            const subtotal = calculateSubtotal();
            const surcharge = getSurcharge();
            const total = getTotal();
            const currency = getCurrency();
            const installments = getInstallments();

            const saleData = {
                payment_method: paymentMethod,
                currency,
                subtotal,
                surcharge,
                total,
                installments,
                customer_notes: customerNotes,
                warranty_enabled: warranty.enabled,
                warranty_months: warranty.enabled ? warranty.months : 0,
                client_id: selectedClient?.id || null
            };

            const saleId = await window.api.createSale(saleData, cart);

            // Save sale details for receipt BEFORE clearing cart
            const saleDetailsForReceipt = {
                items: [...cart],
                subtotal,
                surcharge,
                surchargePercent: getSurchargePercent(paymentMethod, paymentConfigs),
                total,
                currency,
                paymentMethod,
                customerNotes,
                warranty: { ...warranty },
                installments,
                id: saleId, // Pass ID for ticket number
                client: selectedClient // Pass selected client for receipt
            };

            // Success! Show receipt
            setLastSaleId(saleId);
            setLastSaleDetails(saleDetailsForReceipt);
            setShowReceipt(true);

            // Clear cart
            setCart([]);
            setCart([]);
            setCustomerNotes('');
            setWarranty({ enabled: false, months: 1 });
            setSelectedClient(null); // Reset client
            setError('');

            // Refocus barcode input
            setTimeout(() => barcodeInputRef.current?.focus(), 100);

        } catch (error) {
            console.error('Error completing sale:', error);
            setError('Error al procesar la venta');
        }
    };

    const surchargePercent = getSurchargePercent(paymentMethod, paymentConfigs);
    const subtotal = calculateSubtotal();
    const surcharge = getSurcharge();
    const total = getTotal();
    const currency = getCurrency();

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Left Panel - Barcode & Cart */}
            <div className="flex-1 flex flex-col p-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-6 flex justify-between items-center">
                    <span>💰 Punto de Venta</span>
                    {selectedClient && (
                        <div className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full flex items-center gap-2 border border-blue-100">
                            <span>👤 {selectedClient.name}</span>
                            <button onClick={() => setSelectedClient(null)} className="hover:text-blue-900">✕</button>
                        </div>
                    )}
                </h1>

                {/* Barcode Input & Search */}
                <form onSubmit={handleBarcodeSubmit} className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        📷 Escanear Código de Barras o Buscar
                    </label>
                    <div className="flex gap-3">
                        <input
                            ref={barcodeInputRef}
                            type="text"
                            value={barcodeInput}
                            onChange={(e) => setBarcodeInput(e.target.value)}
                            className="input flex-1 text-lg"
                            placeholder="Escanee código..."
                            autoFocus
                        />
                        <button type="submit" className="btn btn-primary">
                            Agregar
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowSearchModal(true)}
                            className="btn bg-secondary-600 text-white hover:bg-secondary-700 px-6 flex items-center gap-2"
                        >
                            <span>🔍</span> Buscar
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowClientModal(true)}
                            className="btn bg-indigo-600 text-white hover:bg-indigo-700 px-6 flex items-center gap-2"
                        >
                            <span>👤</span> Cliente
                        </button>
                    </div>
                    {error && (
                        <p className="text-danger-600 text-sm mt-2">{error}</p>
                    )}
                </form>

                {/* Shopping Cart */}
                <div className="flex-1 card overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                        <h2 className="text-lg font-semibold">🛒 Carrito ({cart.length})</h2>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4">
                        {cart.length === 0 ? (
                            <div className="text-center text-gray-400 py-12">
                                <p className="text-lg">Carrito vacío</p>
                                <p className="text-sm mt-2">Escanee un producto para comenzar</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {cart.map((item, index) => (
                                    <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 hover:border-primary-300 transition-colors">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex-1">
                                                <h3 className="font-medium text-gray-900">{item.product_name}</h3>
                                                <p className="text-sm text-gray-500">
                                                    {item.category_name && <span className="mr-2 text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">{item.category_name}</span>}
                                                    {formatCurrency(item.unit_price, currency)} c/u
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => removeFromCart(index)}
                                                className="text-danger-600 hover:text-danger-700 ml-2"
                                                title="Eliminar"
                                            >
                                                🗑️
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => updateQuantity(index, item.quantity - 1)}
                                                    className="w-8 h-8 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                                                >
                                                    −
                                                </button>
                                                <input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={(e) => updateQuantity(index, parseInt(e.target.value) || 1)}
                                                    className="w-16 text-center border border-gray-300 rounded px-2 py-1"
                                                    min="1"
                                                    max={item.stock_available}
                                                />
                                                <button
                                                    onClick={() => updateQuantity(index, item.quantity + 1)}
                                                    className="w-8 h-8 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-semibold text-gray-900">
                                                    {formatCurrency(item.subtotal, currency)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Panel - Payment & Totals */}
            <div className="w-96 bg-white border-l border-gray-200 p-6 flex flex-col">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Pago</h2>

                {/* Payment Method Selector */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Método de Pago
                    </label>
                    <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="input"
                    >
                        {paymentConfigs.map(config => (
                            <option key={config.method} value={config.method}>
                                {paymentLabels[config.method] || config.method} {getSurchargePercent(config.method, paymentConfigs) > 0 ? `(+${getSurchargePercent(config.method, paymentConfigs)}%)` : ''}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Warranty Options */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-gray-900">Garantía</label>
                        <div className="relative inline-block w-10 h-6 align-middle select-none transition duration-200 ease-in">
                            <input
                                type="checkbox"
                                name="toggle"
                                id="warranty-toggle"
                                checked={warranty.enabled}
                                onChange={(e) => setWarranty({ ...warranty, enabled: e.target.checked })}
                                className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                                style={{ right: warranty.enabled ? '0' : 'auto', left: warranty.enabled ? 'auto' : '0', borderColor: warranty.enabled ? '#10B981' : '#D1D5DB' }}
                            />
                            <label
                                htmlFor="warranty-toggle"
                                className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${warranty.enabled ? 'bg-success-400' : 'bg-gray-300'}`}
                            ></label>
                        </div>
                    </div>

                    {warranty.enabled && (
                        <div className="mt-2">
                            <label className="block text-xs text-gray-500 mb-1">Duración</label>
                            <select
                                value={warranty.months}
                                onChange={(e) => setWarranty({ ...warranty, months: parseInt(e.target.value) })}
                                className="input text-sm py-1"
                            >
                                <option value="0.25">1 Semana</option>
                                <option value="0.5">2 Semanas</option>
                                <option value="0.75">3 Semanas</option>
                                <option value="1">1 Mes</option>
                                <option value="2">2 Meses</option>
                                <option value="3">3 Meses</option>
                                <option value="6">6 Meses</option>
                                <option value="12">1 Año</option>
                            </select>
                        </div>
                    )}
                </div>

                {/* Customer Notes */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notas del Cliente
                    </label>
                    <textarea
                        value={customerNotes}
                        onChange={(e) => setCustomerNotes(e.target.value)}
                        className="input h-24 resize-none"
                        placeholder="Nombre, detalles..."
                    />
                </div>

                {/* Totals */}
                <div className="mt-auto space-y-3 pt-6 border-t border-gray-200">
                    <div className="flex justify-between text-gray-600">
                        <span>Subtotal</span>
                        <span>{formatCurrency(subtotal, currency)}</span>
                    </div>
                    {surcharge > 0 && (
                        <div className="flex justify-between text-gray-600 text-sm">
                            <span>Recargo ({surchargePercent}%)</span>
                            <span>{formatCurrency(surcharge, currency)}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-2xl font-bold text-gray-900 pt-2 border-t border-gray-100">
                        <span>Total</span>
                        <span>{formatCurrency(total, currency)}</span>
                    </div>

                    <button
                        onClick={handleCompleteSale}
                        className="btn btn-primary w-full py-4 text-lg font-bold mt-4"
                    >
                        Completar Venta
                    </button>
                </div>
            </div>

            {/* Receipt Modal */}
            {showReceipt && lastSaleDetails && (
                <ReceiptModal
                    saleDetails={lastSaleDetails}
                    onClose={() => setShowReceipt(false)}
                />
            )}

            {/* Client Search Modal */}
            {showClientModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[80vh] flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-gray-900">Seleccionar Cliente</h3>
                            <button onClick={() => setShowClientModal(false)} className="text-gray-500 hover:text-gray-700 text-xl">✕</button>
                        </div>

                        <input
                            type="text"
                            value={clientSearchQuery}
                            onChange={(e) => setClientSearchQuery(e.target.value)}
                            className="input mb-4"
                            placeholder="Buscar por nombre, DNI o teléfono..."
                            autoFocus
                        />

                        <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg">
                            {clientResults.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    {clientSearchQuery.length < 2 ? "Escriba para buscar..." : "No se encontraron clientes."}
                                </div>
                            ) : (
                                <table className="w-full text-left">
                                    <tbody className="divide-y divide-gray-200">
                                        {clientResults.map((client) => (
                                            <tr
                                                key={client.id}
                                                className="hover:bg-gray-50 cursor-pointer"
                                                onClick={() => {
                                                    setSelectedClient(client);
                                                    setShowClientModal(false);
                                                    setClientSearchQuery('');
                                                }}
                                            >
                                                <td className="p-3">
                                                    <div className="font-medium text-gray-900">{client.name}</div>
                                                    <div className="text-xs text-gray-500">{client.identifier || 'Sin DNI'} • {client.phone || 'Sin Tel'}</div>
                                                </td>
                                                <td className="p-3 text-right">
                                                    {client.debt > 0 && (
                                                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                                                            Deuda: ${client.debt}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Search Modal */}
            {showSearchModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-gray-900">Buscar Producto</h3>
                            <button
                                onClick={() => setShowSearchModal(false)}
                                className="text-gray-500 hover:text-gray-700 text-xl"
                            >
                                ✕
                            </button>
                        </div>

                        <input
                            ref={searchInputRef}
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input mb-4"
                            placeholder="Escriba el nombre del producto..."
                        />

                        <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg">
                            {searchResults.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    {searchQuery.length < 2
                                        ? "Escriba al menos 2 caracteres para buscar..."
                                        : "No se encontraron productos."}
                                </div>
                            ) : (
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 sticky top-0">
                                        <tr>
                                            <th className="p-3 text-sm font-semibold text-gray-700">Producto</th>
                                            <th className="p-3 text-sm font-semibold text-gray-700">Stock</th>
                                            <th className="p-3 text-sm font-semibold text-gray-700">Precio</th>
                                            <th className="p-3 text-sm font-semibold text-gray-700">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {searchResults.map((product) => (
                                            <tr key={product.id} className="hover:bg-gray-50">
                                                <td className="p-3">
                                                    <div className="font-medium text-gray-900">{product.name}</div>
                                                    <div className="text-xs text-gray-500">{product.category_name}</div>
                                                </td>
                                                <td className={`p-3 text-sm font-medium ${product.stock <= 5 ? 'text-danger-600' : 'text-gray-700'}`}>
                                                    {product.stock}
                                                </td>
                                                <td className="p-3 text-sm text-gray-700">
                                                    {formatCurrency(product.price, 'ARS')}
                                                </td>
                                                <td className="p-3">
                                                    <button
                                                        onClick={() => handleAddFromSearch(product)}
                                                        className="btn btn-sm btn-secondary text-xs"
                                                        disabled={product.stock <= 0}
                                                    >
                                                        {product.stock > 0 ? '+ Agregar' : 'Sin Stock'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default POSScreen;
