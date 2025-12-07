import React, { useState, useEffect } from 'react';
import { formatCurrency, formatDate } from '../utils/paymentCalculator';
import * as XLSX from 'xlsx';

const EXPENSE_CATEGORIES = [
    { value: 'servicios', label: 'Servicios' },
    { value: 'mayoristas', label: 'Mayoristas' },
    { value: 'sueldo', label: 'Sueldo' },
    { value: 'compras', label: 'Compras' },
    { value: 'impuestos', label: 'Impuestos' },
    { value: 'otros', label: 'Otros' }
];

const PAYMENT_METHODS = [
    { value: 'cash_ars', label: 'Efectivo ARS' },
    { value: 'cash_usd', label: 'Efectivo USD' },
    { value: 'transfer_ars', label: 'Transferencia ARS' },
    { value: 'transfer_usd', label: 'Transferencia USD' },
    { value: 'qr', label: 'QR' },
    { value: 'debit', label: 'Débito' },
    { value: 'credit', label: 'Crédito' },
    { value: 'link', label: 'Link de Pago' },
    { value: 'otros', label: 'Otros' }
];

const MONTHS = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const CashRegister = () => {
    const [entries, setEntries] = useState([]);
    const [filteredEntries, setFilteredEntries] = useState([]);
    const [balanceARS, setBalanceARS] = useState({ income: 0, expense: 0, balance: 0 });
    const [balanceUSD, setBalanceUSD] = useState({ income: 0, expense: 0, balance: 0 });
    const [filters, setFilters] = useState({
        type: 'all',
        currency: 'all',
        startDate: '',
        endDate: ''
    });

    // Modal states
    const [showExpenseForm, setShowExpenseForm] = useState(false);
    const [showIncomeForm, setShowIncomeForm] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);

    // Form data
    const [expenseData, setExpenseData] = useState({
        amount: '',
        currency: 'ARS',
        description: '',
        payment_method: 'cash_ars',
        expense_category: 'otros'
    });

    const [incomeData, setIncomeData] = useState({
        amount: '',
        currency: 'ARS',
        description: '',
        payment_method: 'cash_ars'
    });

    // Export data
    const [exportPeriod, setExportPeriod] = useState({
        month: new Date().getMonth(),
        year: new Date().getFullYear()
    });

    useEffect(() => {
        loadCashRegister();
        loadBalances();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [entries, filters]);

    const loadCashRegister = async () => {
        try {
            const data = await window.api.getCashRegister({});
            setEntries(data);
        } catch (error) {
            console.error('Error loading cash register:', error);
        }
    };

    const loadBalances = async () => {
        try {
            const balARS = await window.api.getBalance('ARS');
            const balUSD = await window.api.getBalance('USD');
            setBalanceARS(balARS);
            setBalanceUSD(balUSD);
        } catch (error) {
            console.error('Error loading balances:', error);
        }
    };

    const applyFilters = () => {
        let filtered = [...entries];

        if (filters.type !== 'all') {
            filtered = filtered.filter(e => e.type === filters.type);
        }

        if (filters.currency !== 'all') {
            filtered = filtered.filter(e => e.currency === filters.currency);
        }

        if (filters.startDate) {
            filtered = filtered.filter(e => new Date(e.entry_date) >= new Date(filters.startDate));
        }

        if (filters.endDate) {
            const endDate = new Date(filters.endDate);
            endDate.setHours(23, 59, 59, 999);
            filtered = filtered.filter(e => new Date(e.entry_date) <= endDate);
        }

        setFilteredEntries(filtered);
    };

    const handleAddExpense = async (e) => {
        e.preventDefault();
        try {
            await window.api.createExpense({
                amount: parseFloat(expenseData.amount),
                currency: expenseData.currency,
                description: expenseData.description,
                payment_method: expenseData.payment_method,
                expense_category: expenseData.expense_category
            });
            await loadCashRegister();
            await loadBalances();
            setExpenseData({
                amount: '',
                currency: 'ARS',
                description: '',
                payment_method: 'cash_ars',
                expense_category: 'otros'
            });
            setShowExpenseForm(false);
        } catch (error) {
            console.error('Error adding expense:', error);
            alert('Error al registrar egreso');
        }
    };

    const handleAddIncome = async (e) => {
        e.preventDefault();
        try {
            await window.api.createIncome({
                amount: parseFloat(incomeData.amount),
                currency: incomeData.currency,
                description: incomeData.description,
                payment_method: incomeData.payment_method
            });
            await loadCashRegister();
            await loadBalances();
            setIncomeData({
                amount: '',
                currency: 'ARS',
                description: '',
                payment_method: 'cash_ars'
            });
            setShowIncomeForm(false);
        } catch (error) {
            console.error('Error adding income:', error);
            alert('Error al registrar ingreso');
        }
    };

    const handleExportExcel = () => {
        // Filter entries by selected month/year
        const startDate = new Date(exportPeriod.year, exportPeriod.month, 1);
        const endDate = new Date(exportPeriod.year, exportPeriod.month + 1, 0, 23, 59, 59);

        const periodEntries = entries.filter(e => {
            const entryDate = new Date(e.entry_date);
            return entryDate >= startDate && entryDate <= endDate;
        });

        // Calculate period balances
        const periodBalanceARS = periodEntries
            .filter(e => e.currency === 'ARS')
            .reduce((acc, e) => ({
                income: acc.income + (e.type === 'income' ? e.amount : 0),
                expense: acc.expense + (e.type === 'expense' ? e.amount : 0)
            }), { income: 0, expense: 0 });

        const periodBalanceUSD = periodEntries
            .filter(e => e.currency === 'USD')
            .reduce((acc, e) => ({
                income: acc.income + (e.type === 'income' ? e.amount : 0),
                expense: acc.expense + (e.type === 'expense' ? e.amount : 0)
            }), { income: 0, expense: 0 });

        // Prepare data for Excel
        const excelData = periodEntries.map(e => ({
            'Fecha': formatDate(e.entry_date),
            'Tipo': e.type === 'income' ? 'INGRESO' : 'EGRESO',
            'Categoría': e.expense_category ? getCategoryLabel(e.expense_category) : '-',
            'Monto': e.amount,
            'Moneda': e.currency,
            'Método': e.payment_method || '-',
            'Descripción': e.description
        }));

        // Add summary rows
        excelData.push({});
        excelData.push({ 'Fecha': '--- RESUMEN ---' });
        excelData.push({ 'Fecha': 'BALANCE ARS', 'Tipo': '', 'Categoría': '', 'Monto': '' });
        excelData.push({ 'Fecha': 'Ingresos ARS', 'Monto': periodBalanceARS.income });
        excelData.push({ 'Fecha': 'Egresos ARS', 'Monto': periodBalanceARS.expense });
        excelData.push({ 'Fecha': 'Balance ARS', 'Monto': periodBalanceARS.income - periodBalanceARS.expense });
        excelData.push({});
        excelData.push({ 'Fecha': 'BALANCE USD', 'Tipo': '', 'Categoría': '', 'Monto': '' });
        excelData.push({ 'Fecha': 'Ingresos USD', 'Monto': periodBalanceUSD.income });
        excelData.push({ 'Fecha': 'Egresos USD', 'Monto': periodBalanceUSD.expense });
        excelData.push({ 'Fecha': 'Balance USD', 'Monto': periodBalanceUSD.income - periodBalanceUSD.expense });

        // Create workbook and worksheet
        const ws = XLSX.utils.json_to_sheet(excelData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Libro de Caja');

        // Auto-adjust column widths
        const colWidths = [
            { wch: 18 }, // Fecha
            { wch: 10 }, // Tipo
            { wch: 12 }, // Categoría
            { wch: 12 }, // Monto
            { wch: 8 },  // Moneda
            { wch: 15 }, // Método
            { wch: 40 }  // Descripción
        ];
        ws['!cols'] = colWidths;

        // Generate filename
        const monthName = MONTHS[exportPeriod.month];
        const filename = `LibroDeCaja_${monthName}_${exportPeriod.year}.xlsx`;

        // Download file
        XLSX.writeFile(wb, filename);
        setShowExportModal(false);
    };

    const getCategoryLabel = (value) => {
        const cat = EXPENSE_CATEGORIES.find(c => c.value === value);
        return cat ? cat.label : value;
    };

    return (
        <div className="p-8">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">💵 Libro de Caja</h1>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowExportModal(true)}
                        className="btn btn-secondary"
                    >
                        📥 Exportar Excel
                    </button>
                    <button
                        onClick={() => setShowIncomeForm(true)}
                        className="btn btn-success"
                    >
                        + Registrar Ingreso
                    </button>
                    <button
                        onClick={() => setShowExpenseForm(true)}
                        className="btn btn-danger"
                    >
                        − Registrar Egreso
                    </button>
                </div>
            </div>

            {/* Balance Cards */}
            <div className="grid grid-cols-2 gap-6 mb-6">
                {/* ARS Balance */}
                <div className="card p-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-4">Balance ARS ($)</h3>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-success-600">Ingresos:</span>
                            <span className="font-semibold text-success-600">
                                {formatCurrency(balanceARS.income, 'ARS')}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-danger-600">Egresos:</span>
                            <span className="font-semibold text-danger-600">
                                {formatCurrency(balanceARS.expense, 'ARS')}
                            </span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-gray-200">
                            <span className="font-bold">Balance:</span>
                            <span className={`font-bold text-lg ${balanceARS.balance >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                                {formatCurrency(balanceARS.balance, 'ARS')}
                            </span>
                        </div>
                    </div>
                </div>

                {/* USD Balance */}
                <div className="card p-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-4">Balance USD (U$D)</h3>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-success-600">Ingresos:</span>
                            <span className="font-semibold text-success-600">
                                {formatCurrency(balanceUSD.income, 'USD')}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-danger-600">Egresos:</span>
                            <span className="font-semibold text-danger-600">
                                {formatCurrency(balanceUSD.expense, 'USD')}
                            </span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-gray-200">
                            <span className="font-bold">Balance:</span>
                            <span className={`font-bold text-lg ${balanceUSD.balance >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                                {formatCurrency(balanceUSD.balance, 'USD')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="card p-4 mb-6">
                <div className="grid grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                        <select
                            value={filters.type}
                            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                            className="input"
                        >
                            <option value="all">Todos</option>
                            <option value="income">Ingresos</option>
                            <option value="expense">Egresos</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Moneda</label>
                        <select
                            value={filters.currency}
                            onChange={(e) => setFilters({ ...filters, currency: e.target.value })}
                            className="input"
                        >
                            <option value="all">Todas</option>
                            <option value="ARS">ARS</option>
                            <option value="USD">USD</option>
                        </select>
                    </div>
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
                </div>
            </div>

            {/* Entries Table */}
            <div className="card flex flex-col h-[calc(100vh-500px)] overflow-hidden">
                <div className="overflow-auto flex-1">
                    <table className="w-full relative">
                        <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cat. Producto</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Productos</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cat. Egreso</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Moneda</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Método</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredEntries.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="px-6 py-12 text-center text-gray-400">
                                        No hay movimientos registrados
                                    </td>
                                </tr>
                            ) : (
                                filteredEntries.map((entry) => (
                                    <tr key={entry.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {formatDate(entry.entry_date)}
                                        </td>
                                        <td className="px-6 py-4">
                                            {entry.type === 'income' ? (
                                                <span className="badge badge-success">🟢 Ingreso</span>
                                            ) : (
                                                <span className="badge badge-danger">🔴 Egreso</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            <span className="truncate block" title={entry.category_names || '-'}>
                                                {entry.category_names || '-'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">
                                            <span className="truncate block" title={entry.product_names || '-'}>
                                                {entry.product_names || '-'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {entry.expense_category ? getCategoryLabel(entry.expense_category) : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className={entry.type === 'income' ? 'text-success-600 font-medium' : 'text-danger-600 font-medium'}>
                                                {formatCurrency(entry.amount, entry.currency)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">{entry.currency}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700">{entry.payment_method || '-'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{entry.description}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Income Form Modal */}
            {showIncomeForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                        <h2 className="text-2xl font-bold text-success-600 mb-6">+ Registrar Ingreso</h2>

                        <form onSubmit={handleAddIncome} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Monto *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={incomeData.amount}
                                    onChange={(e) => setIncomeData({ ...incomeData, amount: e.target.value })}
                                    required
                                    className="input"
                                    placeholder="0.00"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Moneda *</label>
                                <select
                                    value={incomeData.currency}
                                    onChange={(e) => setIncomeData({ ...incomeData, currency: e.target.value })}
                                    className="input"
                                >
                                    <option value="ARS">ARS (Pesos)</option>
                                    <option value="USD">USD (Dólares)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Método de Pago *</label>
                                <select
                                    value={incomeData.payment_method}
                                    onChange={(e) => setIncomeData({ ...incomeData, payment_method: e.target.value })}
                                    className="input"
                                >
                                    {PAYMENT_METHODS.map(m => (
                                        <option key={m.value} value={m.value}>{m.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
                                <textarea
                                    value={incomeData.description}
                                    onChange={(e) => setIncomeData({ ...incomeData, description: e.target.value })}
                                    required
                                    className="input"
                                    rows="3"
                                    placeholder="Ej: Venta directa, cobro de deuda..."
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button type="submit" className="btn btn-success flex-1">
                                    Registrar Ingreso
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowIncomeForm(false)}
                                    className="btn btn-secondary"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Expense Form Modal */}
            {showExpenseForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                        <h2 className="text-2xl font-bold text-danger-600 mb-6">− Registrar Egreso</h2>

                        <form onSubmit={handleAddExpense} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Egreso *</label>
                                <select
                                    value={expenseData.expense_category}
                                    onChange={(e) => setExpenseData({ ...expenseData, expense_category: e.target.value })}
                                    className="input"
                                >
                                    {EXPENSE_CATEGORIES.map(cat => (
                                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Monto *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={expenseData.amount}
                                    onChange={(e) => setExpenseData({ ...expenseData, amount: e.target.value })}
                                    required
                                    className="input"
                                    placeholder="0.00"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Moneda *</label>
                                <select
                                    value={expenseData.currency}
                                    onChange={(e) => setExpenseData({ ...expenseData, currency: e.target.value })}
                                    className="input"
                                >
                                    <option value="ARS">ARS (Pesos)</option>
                                    <option value="USD">USD (Dólares)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Método de Pago</label>
                                <select
                                    value={expenseData.payment_method}
                                    onChange={(e) => setExpenseData({ ...expenseData, payment_method: e.target.value })}
                                    className="input"
                                >
                                    {PAYMENT_METHODS.map(m => (
                                        <option key={m.value} value={m.value}>{m.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
                                <textarea
                                    value={expenseData.description}
                                    onChange={(e) => setExpenseData({ ...expenseData, description: e.target.value })}
                                    required
                                    className="input"
                                    rows="3"
                                    placeholder="Ej: Pago de alquiler, compra de mercadería..."
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button type="submit" className="btn btn-danger flex-1">
                                    Registrar Egreso
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowExpenseForm(false)}
                                    className="btn btn-secondary"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Export Modal */}
            {showExportModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">📥 Exportar a Excel</h2>

                        <div className="space-y-4">
                            <p className="text-gray-600">Selecciona el período a exportar:</p>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mes</label>
                                    <select
                                        value={exportPeriod.month}
                                        onChange={(e) => setExportPeriod({ ...exportPeriod, month: parseInt(e.target.value) })}
                                        className="input"
                                    >
                                        {MONTHS.map((month, index) => (
                                            <option key={index} value={index}>{month}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Año</label>
                                    <select
                                        value={exportPeriod.year}
                                        onChange={(e) => setExportPeriod({ ...exportPeriod, year: parseInt(e.target.value) })}
                                        className="input"
                                    >
                                        {[2023, 2024, 2025, 2026].map(year => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-600">
                                    Se exportarán todos los movimientos de <strong>{MONTHS[exportPeriod.month]} {exportPeriod.year}</strong> incluyendo ingresos, egresos y balance del período.
                                </p>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button onClick={handleExportExcel} className="btn btn-primary flex-1">
                                    📥 Descargar Excel
                                </button>
                                <button
                                    onClick={() => setShowExportModal(false)}
                                    className="btn btn-secondary"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CashRegister;
