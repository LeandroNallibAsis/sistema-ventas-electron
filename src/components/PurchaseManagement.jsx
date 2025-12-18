import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../utils/paymentCalculator';

const PurchaseManagement = () => {
    const [purchases, setPurchases] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showPurchaseModal, setShowPurchaseModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPurchase, setSelectedPurchase] = useState(null);
    const [payments, setPayments] = useState([]);
    const [filterStatus, setFilterStatus] = useState('all');

    const [purchaseForm, setPurchaseForm] = useState({
        supplier_id: '',
        description: '',
        total_amount: '',
        paid_amount: '',
        payment_status: 'pending',
        due_date: '',
        notes: '',
        currency: 'ARS',
        payment_method: 'cash_ars'
    });

    const [paymentForm, setPaymentForm] = useState({
        amount: '',
        payment_method: 'cash_ars',
        currency: 'ARS',
        notes: ''
    });

    useEffect(() => {
        loadPurchases();
        loadSuppliers();
    }, []);

    useEffect(() => {
        loadPurchases();
    }, [filterStatus]);

    const loadPurchases = async () => {
        setLoading(true);
        try {
            const filters = filterStatus !== 'all' ? { status: filterStatus } : {};
            const data = await window.api.getPurchases(filters);
            setPurchases(data);
        } catch (error) {
            console.error('Error loading purchases:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadSuppliers = async () => {
        try {
            const data = await window.api.getSuppliers();
            setSuppliers(data);
        } catch (error) {
            console.error('Error loading suppliers:', error);
        }
    };

    const handleOpenPurchaseModal = () => {
        setPurchaseForm({
            supplier_id: '',
            description: '',
            total_amount: '',
            paid_amount: '',
            payment_status: 'pending',
            due_date: '',
            notes: '',
            currency: 'ARS',
            payment_method: 'cash_ars'
        });
        setShowPurchaseModal(true);
    };

    const handleSubmitPurchase = async (e) => {
        e.preventDefault();

        if (!purchaseForm.supplier_id || !purchaseForm.description || !purchaseForm.total_amount) {
            alert('Complete los campos obligatorios');
            return;
        }

        const totalAmount = parseFloat(purchaseForm.total_amount);
        const paidAmount = parseFloat(purchaseForm.paid_amount) || 0;

        if (paidAmount > totalAmount) {
            alert('El monto pagado no puede ser mayor al total');
            return;
        }

        let status = 'pending';
        if (paidAmount >= totalAmount) {
            status = 'paid';
        } else if (paidAmount > 0) {
            status = 'partial';
        }

        try {
            await window.api.createPurchase({
                ...purchaseForm,
                total_amount: totalAmount,
                paid_amount: paidAmount,
                payment_status: status
            });
            setShowPurchaseModal(false);
            loadPurchases();
        } catch (error) {
            console.error('Error creating purchase:', error);
            alert('Error al crear compra');
        }
    };

    const handleOpenPaymentModal = async (purchase) => {
        setSelectedPurchase(purchase);
        setPaymentForm({
            amount: '',
            payment_method: 'cash_ars',
            currency: 'ARS',
            notes: ''
        });

        try {
            const paymentHistory = await window.api.getPurchasePayments(purchase.id);
            setPayments(paymentHistory);
        } catch (error) {
            console.error('Error loading payments:', error);
        }

        setShowPaymentModal(true);
    };

    const handleSubmitPayment = async (e) => {
        e.preventDefault();

        const amount = parseFloat(paymentForm.amount);
        const pendingAmount = selectedPurchase.total_amount - selectedPurchase.paid_amount;

        if (amount <= 0) {
            alert('El monto debe ser mayor a cero');
            return;
        }

        if (amount > pendingAmount) {
            alert(`El monto no puede superar la deuda pendiente: ${formatCurrency(pendingAmount, 'ARS')}`);
            return;
        }

        try {
            await window.api.addPurchasePayment(selectedPurchase.id, {
                ...paymentForm,
                amount
            });
            setShowPaymentModal(false);
            loadPurchases();
        } catch (error) {
            console.error('Error adding payment:', error);
            alert('Error al registrar pago');
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: 'bg-yellow-100 text-yellow-800',
            partial: 'bg-blue-100 text-blue-800',
            paid: 'bg-green-100 text-green-800'
        };
        const labels = {
            pending: 'Pendiente',
            partial: 'Parcial',
            paid: 'Pagado'
        };
        return (
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${badges[status]}`}>
                {labels[status]}
            </span>
        );
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">🛒 Compras a Proveedores</h1>
                <button onClick={handleOpenPurchaseModal} className="btn btn-primary">
                    + Nueva Compra
                </button>
            </div>

            {/* Filters */}
            <div className="mb-6 flex gap-2">
                {['all', 'pending', 'partial', 'paid'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === status
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        {status === 'all' ? 'Todas' : status === 'pending' ? 'Pendientes' : status === 'partial' ? 'Parciales' : 'Pagadas'}
                    </button>
                ))}
            </div>

            {/* Purchases Table */}
            <div className="card overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Cargando...</div>
                ) : purchases.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No hay compras registradas</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Proveedor</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Pagado</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Pendiente</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Estado</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {purchases.map((purchase) => {
                                    const pending = purchase.total_amount - purchase.paid_amount;
                                    return (
                                        <tr key={purchase.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(purchase.purchase_date).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-medium text-gray-900">{purchase.supplier_name}</div>
                                                {purchase.supplier_company && (
                                                    <div className="text-xs text-gray-500">{purchase.supplier_company}</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {purchase.description}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                                                {formatCurrency(purchase.total_amount, 'ARS')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                                                {formatCurrency(purchase.paid_amount, 'ARS')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-danger-600">
                                                {formatCurrency(pending, 'ARS')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                {getStatusBadge(purchase.payment_status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                {purchase.payment_status !== 'paid' && (
                                                    <button
                                                        onClick={() => handleOpenPaymentModal(purchase)}
                                                        className="text-primary-600 hover:text-primary-900 text-sm font-medium"
                                                    >
                                                        Pagar
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Purchase Modal */}
            {showPurchaseModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Nueva Compra</h2>
                        <form onSubmit={handleSubmitPurchase}>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor *</label>
                                    <select
                                        value={purchaseForm.supplier_id}
                                        onChange={(e) => setPurchaseForm({ ...purchaseForm, supplier_id: e.target.value })}
                                        className="input w-full"
                                        required
                                    >
                                        <option value="">Seleccione un proveedor</option>
                                        {suppliers.map((s) => (
                                            <option key={s.id} value={s.id}>
                                                {s.name} {s.company && `- ${s.company}`}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
                                    <input
                                        type="text"
                                        value={purchaseForm.description}
                                        onChange={(e) => setPurchaseForm({ ...purchaseForm, description: e.target.value })}
                                        className="input w-full"
                                        required
                                        placeholder="Ej: 50 cables USB-C"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Monto Total *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={purchaseForm.total_amount}
                                        onChange={(e) => setPurchaseForm({ ...purchaseForm, total_amount: e.target.value })}
                                        className="input w-full"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Monto Pagado Ahora</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={purchaseForm.paid_amount}
                                        onChange={(e) => setPurchaseForm({ ...purchaseForm, paid_amount: e.target.value })}
                                        className="input w-full"
                                        placeholder="0"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Vencimiento</label>
                                    <input
                                        type="date"
                                        value={purchaseForm.due_date}
                                        onChange={(e) => setPurchaseForm({ ...purchaseForm, due_date: e.target.value })}
                                        className="input w-full"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Método de Pago</label>
                                    <select
                                        value={purchaseForm.payment_method}
                                        onChange={(e) => setPurchaseForm({ ...purchaseForm, payment_method: e.target.value })}
                                        className="input w-full"
                                    >
                                        <option value="cash_ars">Efectivo ARS</option>
                                        <option value="cash_usd">Efectivo USD</option>
                                        <option value="transfer_ars">Transferencia ARS</option>
                                        <option value="transfer_usd">Transferencia USD</option>
                                    </select>
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                                    <textarea
                                        value={purchaseForm.notes}
                                        onChange={(e) => setPurchaseForm({ ...purchaseForm, notes: e.target.value })}
                                        className="input w-full h-24 resize-none"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowPurchaseModal(false)}
                                    className="btn bg-gray-200 text-gray-700 hover:bg-gray-300"
                                >
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Registrar Compra
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Payment Modal */}
            {showPaymentModal && selectedPurchase && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Registrar Pago</h2>

                        <div className="bg-gray-50 p-4 rounded-lg mb-6">
                            <div className="text-sm text-gray-600 mb-2">
                                <strong>Proveedor:</strong> {selectedPurchase.supplier_name}
                            </div>
                            <div className="text-sm text-gray-600 mb-2">
                                <strong>Descripción:</strong> {selectedPurchase.description}
                            </div>
                            <div className="text-sm text-gray-600 mb-2">
                                <strong>Total:</strong> {formatCurrency(selectedPurchase.total_amount, 'ARS')}
                            </div>
                            <div className="text-sm text-gray-600 mb-2">
                                <strong>Pagado:</strong> {formatCurrency(selectedPurchase.paid_amount, 'ARS')}
                            </div>
                            <div className="text-lg font-bold text-danger-600">
                                <strong>Pendiente:</strong> {formatCurrency(selectedPurchase.total_amount - selectedPurchase.paid_amount, 'ARS')}
                            </div>
                        </div>

                        <form onSubmit={handleSubmitPayment}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Monto a Pagar *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={paymentForm.amount}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                                    className="input w-full"
                                    required
                                    max={selectedPurchase.total_amount - selectedPurchase.paid_amount}
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Método de Pago</label>
                                <select
                                    value={paymentForm.payment_method}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value })}
                                    className="input w-full"
                                >
                                    <option value="cash_ars">Efectivo ARS</option>
                                    <option value="cash_usd">Efectivo USD</option>
                                    <option value="transfer_ars">Transferencia ARS</option>
                                    <option value="transfer_usd">Transferencia USD</option>
                                </select>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                                <textarea
                                    value={paymentForm.notes}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                                    className="input w-full h-20 resize-none"
                                />
                            </div>

                            {/* Payment History */}
                            {payments.length > 0 && (
                                <div className="mb-4">
                                    <h3 className="text-sm font-medium text-gray-700 mb-2">Historial de Pagos</h3>
                                    <div className="max-h-40 overflow-y-auto border border-gray-200 rounded">
                                        {payments.map((payment) => (
                                            <div key={payment.id} className="p-2 border-b border-gray-100 text-xs">
                                                <div className="flex justify-between">
                                                    <span>{new Date(payment.payment_date).toLocaleDateString()}</span>
                                                    <span className="font-medium">{formatCurrency(payment.amount, 'ARS')}</span>
                                                </div>
                                                {payment.notes && <div className="text-gray-500 mt-1">{payment.notes}</div>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowPaymentModal(false)}
                                    className="btn bg-gray-200 text-gray-700 hover:bg-gray-300"
                                >
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Registrar Pago
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PurchaseManagement;
