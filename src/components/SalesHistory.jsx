import React, { useState, useEffect } from 'react';
import { formatCurrency, formatDate, formatReceiptNumber } from '../utils/paymentCalculator';

const SalesHistory = () => {
    const [sales, setSales] = useState([]);
    const [filteredSales, setFilteredSales] = useState([]);
    const [selectedSale, setSelectedSale] = useState(null);
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        payment_method: 'all'
    });

    useEffect(() => {
        loadSales();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [sales, filters]);

    const loadSales = async () => {
        try {
            const data = await window.api.getSales({});
            setSales(data);
        } catch (error) {
            console.error('Error loading sales:', error);
        }
    };

    const applyFilters = () => {
        let filtered = [...sales];

        if (filters.startDate) {
            filtered = filtered.filter(s => new Date(s.sale_date) >= new Date(filters.startDate));
        }

        if (filters.endDate) {
            const endDate = new Date(filters.endDate);
            endDate.setHours(23, 59, 59, 999);
            filtered = filtered.filter(s => new Date(s.sale_date) <= endDate);
        }

        if (filters.payment_method !== 'all') {
            filtered = filtered.filter(s => s.payment_method === filters.payment_method);
        }

        setFilteredSales(filtered);
    };

    const handleViewDetail = async (saleId) => {
        try {
            const detail = await window.api.getSaleDetail(saleId);
            setSelectedSale(detail);
        } catch (error) {
            console.error('Error loading sale detail:', error);
        }
    };

    const getTotalSales = () => {
        return filteredSales.reduce((sum, sale) => sum + sale.total, 0);
    };

    return (
        <div className="h-full flex flex-col overflow-hidden">
            {/* Top Section: Header, Stats, Filters */}
            <div className="flex-none p-8 pb-4 space-y-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">📊 Historial de Ventas</h1>
                    <p className="text-gray-600 mt-2">
                        {filteredSales.length} ventas registradas
                    </p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-6">
                    <div className="card p-6">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Total Ventas</h3>
                        <p className="text-3xl font-bold text-gray-900">{filteredSales.length}</p>
                    </div>
                    <div className="card p-6">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Monto Total (ARS)</h3>
                        <p className="text-3xl font-bold text-success-600">
                            {formatCurrency(
                                filteredSales.filter(s => s.currency === 'ARS').reduce((sum, s) => sum + s.total, 0),
                                'ARS'
                            )}
                        </p>
                    </div>
                    <div className="card p-6">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Monto Total (USD)</h3>
                        <p className="text-3xl font-bold text-success-600">
                            {formatCurrency(
                                filteredSales.filter(s => s.currency === 'USD').reduce((sum, s) => sum + s.total, 0),
                                'USD'
                            )}
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="card p-4">
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
                            <input
                                type="date"
                                value={filters.startDate}
                                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                                className="input"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
                            <input
                                type="date"
                                value={filters.endDate}
                                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                                className="input"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Método de Pago</label>
                            <select
                                value={filters.payment_method}
                                onChange={(e) => setFilters({ ...filters, payment_method: e.target.value })}
                                className="input"
                            >
                                <option value="all">Todos</option>
                                <option value="cash_ars">Efectivo ARS</option>
                                <option value="cash_usd">Efectivo USD</option>
                                <option value="transfer_ars">Transferencia ARS</option>
                                <option value="transfer_usd">Transferencia USD</option>
                                <option value="qr">QR</option>
                                <option value="debit">Débito</option>
                                <option value="credit_1">Crédito 1 cuota</option>
                                <option value="credit_3">Crédito 3 cuotas</option>
                                <option value="credit_6">Crédito 6 cuotas</option>
                                <option value="credit_12">Crédito 12 cuotas</option>
                                <option value="link">Link de Pago</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sales Table Section - Flexible Height */}
            <div className="flex-1 min-h-0 px-8 pb-8 flex flex-col">
                <div className="card flex-1 flex flex-col overflow-hidden shadow-md">
                    <div className="overflow-auto flex-1">
                        <table className="w-full relative">
                            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-24">#</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-32">Fecha</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Productos</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Método</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cuotas</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Garantía</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredSales.length === 0 ? (
                                    <tr>
                                        <td colSpan="9" className="px-6 py-12 text-center text-gray-400">
                                            No hay ventas registradas
                                        </td>
                                    </tr>
                                ) : (
                                    filteredSales.map((sale) => (
                                        <tr key={sale.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                {formatReceiptNumber(sale.id)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                                                {formatDate(sale.sale_date)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                <span className="truncate block max-w-[150px]" title={sale.category_names || '-'}>
                                                    {sale.category_names || '-'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">
                                                <span className="truncate block max-w-[200px]" title={sale.product_names || '-'}>
                                                    {sale.product_names || '-'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                {sale.payment_method}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold text-gray-900 whitespace-nowrap">
                                                {formatCurrency(sale.total, sale.currency)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                {sale.installments > 1 ? `${sale.installments}x` : '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                {sale.warranty_enabled ? `✓ ${sale.warranty_months} m` : '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <button
                                                    onClick={() => handleViewDetail(sale.id)}
                                                    className="text-primary-600 hover:text-primary-700 font-medium whitespace-nowrap"
                                                >
                                                    Ver Detalle
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Sale Detail Modal */}
            {selectedSale && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    Venta {formatReceiptNumber(selectedSale.sale.id)}
                                </h2>
                                <button
                                    onClick={() => setSelectedSale(null)}
                                    className="text-gray-400 hover:text-gray-600 text-2xl"
                                >
                                    ×
                                </button>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                                {formatDate(selectedSale.sale.sale_date)}
                            </p>
                        </div>

                        <div className="p-6">
                            {/* Items */}
                            <h3 className="font-semibold text-gray-900 mb-3">Productos</h3>
                            <div className="space-y-2 mb-6">
                                {selectedSale.items.map((item, index) => (
                                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">{item.product_name}</p>
                                            <p className="text-sm text-gray-500">
                                                {item.quantity} x {formatCurrency(item.unit_price, selectedSale.sale.currency)}
                                            </p>
                                        </div>
                                        <p className="font-semibold text-gray-900">
                                            {formatCurrency(item.subtotal, selectedSale.sale.currency)}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Totals */}
                            <div className="space-y-2 pt-4 border-t border-gray-200">
                                <div className="flex justify-between text-gray-700">
                                    <span>Subtotal:</span>
                                    <span className="font-medium">
                                        {formatCurrency(selectedSale.sale.subtotal, selectedSale.sale.currency)}
                                    </span>
                                </div>
                                {selectedSale.sale.surcharge > 0 && (
                                    <div className="flex justify-between text-warning-600">
                                        <span>Recargo:</span>
                                        <span className="font-medium">
                                            {formatCurrency(selectedSale.sale.surcharge, selectedSale.sale.currency)}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t border-gray-300">
                                    <span>Total:</span>
                                    <span>{formatCurrency(selectedSale.sale.total, selectedSale.sale.currency)}</span>
                                </div>
                            </div>

                            {/* Payment Info */}
                            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                <h4 className="font-semibold text-gray-900 mb-2">Información de Pago</h4>
                                <div className="space-y-1 text-sm">
                                    <p><span className="text-gray-600">Método:</span> <span className="font-medium">{selectedSale.sale.payment_method}</span></p>
                                    <p><span className="text-gray-600">Moneda:</span> <span className="font-medium">{selectedSale.sale.currency}</span></p>
                                    {selectedSale.sale.installments > 1 && (
                                        <p><span className="text-gray-600">Cuotas:</span> <span className="font-medium">{selectedSale.sale.installments}x de {formatCurrency(selectedSale.sale.total / selectedSale.sale.installments, selectedSale.sale.currency)}</span></p>
                                    )}
                                    {selectedSale.sale.warranty_enabled && (
                                        <p><span className="text-gray-600">Garantía:</span> <span className="font-medium">{selectedSale.sale.warranty_months} meses</span></p>
                                    )}
                                    {selectedSale.sale.customer_notes && (
                                        <p><span className="text-gray-600">Notas:</span> <span className="font-medium">{selectedSale.sale.customer_notes}</span></p>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={() => setSelectedSale(null)}
                                className="btn btn-primary w-full mt-6"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SalesHistory;
