import React, { useState, useEffect, useRef } from 'react';

const QuoteForm = ({ onCancel, onQuoteCreated }) => {
    // --- State ---
    const [barcodeInput, setBarcodeInput] = useState('');
    const [cart, setCart] = useState([]);
    const [error, setError] = useState('');
    const [notes, setNotes] = useState('');

    // Client Search
    const [selectedClient, setSelectedClient] = useState(null);
    const [clientSearchQuery, setClientSearchQuery] = useState('');
    const [clientResults, setClientResults] = useState([]);

    // Product Search
    const [showProductSearch, setShowProductSearch] = useState(false);
    const [productSearchQuery, setProductSearchQuery] = useState('');
    const [productResults, setProductResults] = useState([]);

    const barcodeInputRef = useRef(null);

    // --- Effects ---
    useEffect(() => {
        barcodeInputRef.current?.focus();
    }, []);

    // Client Search Debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (clientSearchQuery.length >= 2) performClientSearch(clientSearchQuery);
            else setClientResults([]);
        }, 300);
        return () => clearTimeout(timer);
    }, [clientSearchQuery]);

    // Product Search Debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (productSearchQuery.length >= 2) performProductSearch();
            else setProductResults([]);
        }, 300);
        return () => clearTimeout(timer);
    }, [productSearchQuery]);

    // --- Logic ---

    const performClientSearch = async (query) => {
        try {
            const results = await window.api.searchClients(query);
            setClientResults(results);
        } catch (error) {
            console.error('Error searching clients:', error);
        }
    };

    const performProductSearch = async () => {
        try {
            const results = await window.api.searchProducts(productSearchQuery);
            setProductResults(results);
        } catch (error) {
            console.error('Error searching products:', error);
        }
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
            console.error(error);
            setError('Error al buscar producto');
        }
    };

    const addToCart = (product) => {
        const existingIndex = cart.findIndex(item => item.id === product.id);
        if (existingIndex >= 0) {
            const newCart = [...cart];
            newCart[existingIndex].quantity += 1;
            setCart(newCart);
        } else {
            setCart([...cart, { ...product, quantity: 1 }]);
        }
        setShowProductSearch(false);
        setProductSearchQuery('');
    };

    const updateQuantity = (index, qty) => {
        if (qty < 1) return;
        const newCart = [...cart];
        newCart[index].quantity = qty;
        setCart(newCart);
    };

    const removeFromCart = (index) => {
        setCart(cart.filter((_, i) => i !== index));
    };

    const calculateTotal = () => {
        return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    const handleSaveQuote = async () => {
        if (cart.length === 0) {
            setError('El presupuesto está vacío');
            return;
        }

        try {
            const quoteData = {
                client_id: selectedClient?.id,
                total: calculateTotal(),
                items: cart.map(item => ({
                    id: item.id,
                    quantity: item.quantity,
                    price: item.price,
                    name: item.name
                })),
                notes
            };

            await window.api.createQuote(quoteData);
            alert('Presupuesto creado exitosamente');
            if (onQuoteCreated) onQuoteCreated();
        } catch (error) {
            console.error('Error creating quote:', error);
            setError('Error al guardar presupuesto');
        }
    };

    return (
        <div className="h-full flex flex-col bg-gray-50">
            {/* Header */}
            <div className="bg-white p-6 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
                        ← Volver
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">Nuevo Presupuesto</h1>
                </div>
            </div>

            <div className="flex-1 overflow-hidden flex">
                {/* Left: Input & Cart */}
                <div className="flex-1 flex flex-col p-6 overflow-hidden">
                    {/* Toolbar */}
                    <div className="flex gap-4 mb-4">
                        <form onSubmit={handleBarcodeSubmit} className="flex-1">
                            <input
                                ref={barcodeInputRef}
                                type="text"
                                className="input w-full shadow-sm border-gray-300"
                                placeholder="Escanear código de barras..."
                                value={barcodeInput}
                                onChange={(e) => setBarcodeInput(e.target.value)}
                            />
                        </form>
                        <button
                            onClick={() => setShowProductSearch(true)}
                            className="btn bg-white border border-gray-300 hover:bg-gray-50 text-gray-700"
                        >
                            🔍 Buscar Producto
                        </button>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-700 p-3 rounded mb-4 border border-red-200 flex justify-between">
                            <span>{error}</span>
                            <button onClick={() => setError('')} className="font-bold">✕</button>
                        </div>
                    )}

                    {/* Cart Table */}
                    <div className="bg-white rounded-lg shadow flex-1 overflow-hidden flex flex-col">
                        <div className="overflow-auto flex-1">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold sticky top-0 h-10">
                                    <tr>
                                        <th className="px-4 py-2">Producto</th>
                                        <th className="px-4 py-2 text-right">Precio</th>
                                        <th className="px-4 py-2 text-center">Cant.</th>
                                        <th className="px-4 py-2 text-right">Subtotal</th>
                                        <th className="px-4 py-2 text-center">Acción</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {cart.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50">
                                            <td className="px-4 py-3">
                                                <div className="font-medium">{item.name}</div>
                                                <div className="text-xs text-gray-500">{item.barcode}</div>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                ${item.price.toLocaleString()}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    className="w-16 p-1 border rounded text-center"
                                                    value={item.quantity}
                                                    onChange={(e) => updateQuantity(idx, parseInt(e.target.value) || 1)}
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium text-gray-900">
                                                ${(item.price * item.quantity).toLocaleString()}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <button
                                                    onClick={() => removeFromCart(idx)}
                                                    className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                                                >
                                                    ✕
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {cart.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="p-8 text-center text-gray-400">
                                                Escanea un producto para comenzar
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right: Summary & Client */}
                <div className="w-96 bg-white border-l border-gray-200 p-6 flex flex-col shadow-lg z-10">
                    <div className="mb-6">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Cliente (Opcional)</label>
                        {selectedClient ? (
                            <div className="bg-blue-50 p-3 rounded border border-blue-100 flex justify-between items-center group">
                                <div>
                                    <div className="font-bold text-blue-900">{selectedClient.name}</div>
                                    <div className="text-xs text-blue-600">{selectedClient.dni}</div>
                                </div>
                                <button
                                    onClick={() => setSelectedClient(null)}
                                    className="text-blue-400 hover:text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    Cambiar
                                </button>
                            </div>
                        ) : (
                            <div className="relative">
                                <input
                                    type="text"
                                    className="input w-full"
                                    placeholder="Buscar cliente..."
                                    value={clientSearchQuery}
                                    onChange={(e) => setClientSearchQuery(e.target.value)}
                                />
                                {clientResults.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 bg-white shadow-xl border border-gray-200 rounded-b max-h-48 overflow-auto z-50">
                                        {clientResults.map(client => (
                                            <div
                                                key={client.id}
                                                className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0"
                                                onClick={() => {
                                                    setSelectedClient(client);
                                                    setClientSearchQuery('');
                                                    setClientResults([]);
                                                }}
                                            >
                                                <div className="font-bold text-sm">{client.name}</div>
                                                <div className="text-xs text-gray-500">{client.dni}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Notas / Observaciones</label>
                        <textarea
                            className="input w-full h-24 resize-none"
                            placeholder="Ej: Oferta válida por 7 días..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    <div className="mt-auto">
                        <div className="flex justify-between items-center mb-4 text-xl font-bold text-gray-800">
                            <span>Total Estimado:</span>
                            <span>${calculateTotal().toLocaleString()}</span>
                        </div>
                        <button
                            onClick={handleSaveQuote}
                            disabled={cart.length === 0}
                            className={`btn btn-primary w-full py-3 text-lg shadow-lg ${cart.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            💾 Guardar Presupuesto
                        </button>
                    </div>
                </div>
            </div>

            {/* Product Search Modal */}
            {showProductSearch && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-lg">Buscar Producto</h3>
                            <button onClick={() => setShowProductSearch(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>
                        <div className="p-4 border-b border-gray-100">
                            <input
                                type="text"
                                autoFocus
                                className="input w-full"
                                placeholder="Nombre del producto..."
                                value={productSearchQuery}
                                onChange={(e) => setProductSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex-1 overflow-auto p-2">
                            {productResults.map(prod => (
                                <div
                                    key={prod.id}
                                    onClick={() => addToCart(prod)}
                                    className="p-3 hover:bg-blue-50 cursor-pointer rounded border-b border-gray-50 last:border-0 flex justify-between items-center group"
                                >
                                    <div>
                                        <div className="font-bold text-gray-800">{prod.name}</div>
                                        <div className="text-xs text-gray-500">Stock: {prod.stock} | {prod.barcode}</div>
                                    </div>
                                    <div className="text-blue-600 font-bold group-hover:scale-110 transition-transform">
                                        ${prod.price.toLocaleString()}
                                    </div>
                                </div>
                            ))}
                            {productResults.length === 0 && productSearchQuery.length > 2 && (
                                <div className="text-center p-8 text-gray-400">No se encontraron productos</div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuoteForm;
