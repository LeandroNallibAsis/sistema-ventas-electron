import React, { useState, useEffect } from 'react';

const QuotesList = ({ onCreate }) => {
    const [quotes, setQuotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Details Modal State
    const [selectedQuote, setSelectedQuote] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [converting, setConverting] = useState(false);

    useEffect(() => {
        loadQuotes();
    }, [filterStatus, searchTerm]);

    const loadQuotes = async () => {
        setLoading(true);
        try {
            const data = await window.api.getQuotes({
                status: filterStatus || undefined,
                search: searchTerm || undefined
            });
            setQuotes(data);
        } catch (error) {
            console.error('Error loading quotes:', error);
            alert('Error al cargar presupuestos');
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = async (id) => {
        try {
            const quote = await window.api.getQuoteDetails(id);
            setSelectedQuote(quote);
            setShowDetailsModal(true);
        } catch (error) {
            console.error('Error details:', error);
            alert('Error al obtener detalles');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Eliminar este presupuesto?')) return;
        try {
            await window.api.deleteQuote(id);
            loadQuotes();
            if (selectedQuote?.id === id) setShowDetailsModal(false);
        } catch (error) {
            console.error('Error deleting:', error);
            alert('Error al eliminar');
        }
    };

    const handleConvert = async (quote) => {
        if (!confirm(`¿Convertir presupuesto #${quote.id} en VENTA REAL?\n\nEsto descontará stock e ingresará dinero en caja.`)) return;

        setConverting(true);
        try {
            // Default payment method 'cash' for now, or could ask user via prompt/modal
            const method = 'cash';
            await window.api.convertQuoteToSale(quote.id, method);
            alert('¡Presupuesto convertido en venta exitosamente!');
            setShowDetailsModal(false);
            loadQuotes();
        } catch (error) {
            console.error('Error converting:', error);
            alert('Error al convertir: ' + error.message);
        } finally {
            setConverting(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString();
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-800',
            converted: 'bg-green-100 text-green-800',
            expired: 'bg-red-100 text-red-800'
        };
        const label = {
            pending: 'Pendiente',
            converted: 'Convertido',
            expired: 'Vencido'
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100'}`}>
                {label[status] || status}
            </span>
        );
    };

    return (
        <div className="h-full flex flex-col bg-gray-50">
            {/* Header */}
            <div className="bg-white p-6 border-b border-gray-200 shadow-sm flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">📋 Presupuestos</h1>
                    <p className="text-sm text-gray-500">Gestiona y convierte tus presupuestos a ventas</p>
                </div>
                <button
                    onClick={onCreate}
                    className="btn btn-primary flex items-center gap-2 shadow-lg"
                >
                    <span className="text-xl">+</span> Nuevo Presupuesto
                </button>
            </div>

            {/* Filters */}
            <div className="p-6 pb-2">
                <div className="flex gap-4">
                    <input
                        type="text"
                        placeholder="Buscar por cliente o ID..."
                        className="input max-w-xs"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <select
                        className="input max-w-xs"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="">Todos los Estados</option>
                        <option value="pending">Pendientes</option>
                        <option value="converted">Convertidos</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto p-6 pt-2">
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-xs font-semibold">
                            <tr>
                                <th className="p-4">ID</th>
                                <th className="p-4">Fecha</th>
                                <th className="p-4">Cliente</th>
                                <th className="p-4">Total</th>
                                <th className="p-4">Ítems</th>
                                <th className="p-4">Estado</th>
                                <th className="p-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan="7" className="p-8 text-center text-gray-400">Cargando...</td></tr>
                            ) : quotes.length === 0 ? (
                                <tr><td colSpan="7" className="p-8 text-center text-gray-400">No se encontraron presupuestos</td></tr>
                            ) : (
                                quotes.map((quote) => (
                                    <tr key={quote.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4 font-mono text-gray-600">#{quote.id}</td>
                                        <td className="p-4">{formatDate(quote.created_at)}</td>
                                        <td className="p-4 font-medium">{quote.client_name || 'Consumidor Final'}</td>
                                        <td className="p-4 font-bold text-gray-800">{formatCurrency(quote.total_amount)}</td>
                                        <td className="p-4">{quote.item_count}</td>
                                        <td className="p-4">{getStatusBadge(quote.status)}</td>
                                        <td className="p-4 text-right space-x-2">
                                            <button
                                                onClick={() => handleViewDetails(quote.id)}
                                                className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                                            >
                                                Ver Detalles
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Details Modal */}
            {showDetailsModal && selectedQuote && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-start bg-gray-50">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Presupuesto #{selectedQuote.id}</h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    {formatDate(selectedQuote.created_at)}
                                </p>
                            </div>
                            <div className="flex flex-col items-end">
                                {getStatusBadge(selectedQuote.status)}
                                <button
                                    onClick={() => setShowDetailsModal(false)}
                                    className="text-gray-400 hover:text-gray-600 mt-2"
                                >
                                    ✕ Cerrar
                                </button>
                            </div>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1">
                            {/* Client Info */}
                            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                                <h3 className="text-sm font-bold text-blue-800 uppercase mb-2">Cliente</h3>
                                <p className="text-gray-900 font-medium">{selectedQuote.client_name || 'Consumidor Final'}</p>
                                {selectedQuote.client_dni && <p className="text-gray-600 text-sm">DNI: {selectedQuote.client_dni}</p>}
                                {selectedQuote.client_address && <p className="text-gray-600 text-sm">{selectedQuote.client_address}</p>}
                            </div>

                            {/* Items List */}
                            <table className="w-full text-left mb-6">
                                <thead className="border-b border-gray-200 text-xs text-gray-500 uppercase">
                                    <tr>
                                        <th className="py-2">Producto</th>
                                        <th className="py-2 text-right">Cant.</th>
                                        <th className="py-2 text-right">Precio Unit.</th>
                                        <th className="py-2 text-right">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {selectedQuote.items.map((item, idx) => (
                                        <tr key={idx}>
                                            <td className="py-3 pr-2">
                                                <div className="font-medium text-gray-800">{item.product_name}</div>
                                                <div className="text-xs text-gray-500">{item.barcode}</div>
                                            </td>
                                            <td className="py-3 text-right">{item.quantity}</td>
                                            <td className="py-3 text-right">{formatCurrency(item.unit_price)}</td>
                                            <td className="py-3 text-right font-medium">{formatCurrency(item.subtotal)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="border-t border-gray-200">
                                    <tr>
                                        <td colSpan="3" className="py-4 text-right font-bold text-gray-600">Total</td>
                                        <td className="py-4 text-right font-bold text-xl text-blue-600">
                                            {formatCurrency(selectedQuote.total_amount)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>

                            {selectedQuote.notes && (
                                <div className="bg-yellow-50 p-4 rounded text-sm text-yellow-800 border border-yellow-100">
                                    <strong>Notas:</strong> {selectedQuote.notes}
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
                            <button
                                onClick={() => handleDelete(selectedQuote.id)}
                                className="text-red-600 hover:text-red-800 font-medium text-sm flex items-center gap-2"
                            >
                                🗑️ Eliminar Presupuesto
                            </button>

                            <div className="flex gap-3">
                                {/* Print logic could be added here similar to ReceiptModal */}
                                <button
                                    className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                                    onClick={() => alert('Función de imprimir pendiente de implementar (reutilizará ReceiptModal)')}
                                >
                                    🗳️ Imprimir
                                </button>

                                {selectedQuote.status === 'pending' && (
                                    <button
                                        onClick={() => handleConvert(selectedQuote)}
                                        disabled={converting}
                                        className="btn btn-success shadow-lg shadow-green-200 flex items-center gap-2"
                                    >
                                        {converting ? 'Procesando...' : '💰 Convertir a Venta'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuotesList;
