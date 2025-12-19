import React, { useState, useEffect } from 'react';

const ClientManagement = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingClient, setEditingClient] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        type: 'consumer',
        identifier: '',
        phone: '',
        email: '',
        address: '',
        notes: ''
    });
    const [error, setError] = useState('');

    // Current Account State
    const [selectedAccountClient, setSelectedAccountClient] = useState(null);
    const [movements, setMovements] = useState([]);
    const [showAccountModal, setShowAccountModal] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState(''); // String to allow decimal input
    const [paymentNote, setPaymentNote] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash_ars');

    useEffect(() => {
        loadClients();
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchTerm) {
                handleSearch(searchTerm);
            } else {
                loadClients();
            }
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    const loadClients = async () => {
        try {
            const data = await window.api.getClients();
            // Sort: Debts first
            const sorted = data.sort((a, b) => (b.current_account_balance || 0) - (a.current_account_balance || 0));
            setClients(sorted);
        } catch (error) {
            console.error('Error loading clients:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (query) => {
        try {
            const results = await window.api.searchClients(query);
            setClients(results);
        } catch (error) {
            console.error('Error searching clients:', error);
        }
    };

    const handleEdit = (client) => {
        setEditingClient(client);
        setFormData({
            name: client.name,
            type: client.type,
            identifier: client.identifier || '',
            phone: client.phone || '',
            email: client.email || '',
            address: client.address || '',
            notes: client.notes || ''
        });
        setError('');
        setShowModal(true);
    };

    const handleCreate = () => {
        setEditingClient(null);
        setFormData({
            name: '',
            type: 'consumer',
            identifier: '',
            phone: '',
            email: '',
            address: '',
            notes: ''
        });
        setError('');
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar este cliente?')) {
            try {
                await window.api.deleteClient(id);
                loadClients();
            } catch (error) {
                console.error('Error deleting client:', error);
                alert('Error al eliminar cliente');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.name.trim()) {
            setError('El nombre es requerido');
            return;
        }

        try {
            if (editingClient) {
                await window.api.updateClient(editingClient.id, formData);
            } else {
                await window.api.createClient(formData);
            }
            setShowModal(false);
            loadClients();
        } catch (err) {
            console.error('Error saving client:', err);
            setError(err.message || 'Error al guardar cliente');
        }
    };

    // CURRENT ACCOUNT LOGIC
    const handleViewAccount = async (client) => {
        setSelectedAccountClient(client);
        setPaymentAmount('');
        setPaymentNote('');
        try {
            const movs = await window.api.getClientMovements(client.id);
            setMovements(movs);
            setShowAccountModal(true);
        } catch (error) {
            console.error('Error loading movements:', error);
            alert('Error al cargar movimientos');
        }
    };

    const handleRegisterPayment = async () => {
        if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
            alert('Ingrese un monto válido');
            return;
        }

        if (!confirm(`¿Registrar pago de $${paymentAmount} para ${selectedAccountClient.name}?`)) return;

        try {
            await window.api.registerClientPayment({
                client_id: selectedAccountClient.id,
                amount: parseFloat(paymentAmount),
                payment_method: paymentMethod,
                notes: paymentNote,
                user_id: 1 // TODO: Pass actual user ID
            });
            alert('Pago registrado exitosamente');

            // Reload movements and update list
            const movs = await window.api.getClientMovements(selectedAccountClient.id);
            setMovements(movs);
            // Also need to update the client balance in the background or refetch list
            loadClients();

            // Optionally update selectedAccountClient balance locally for display
            const newBalance = (selectedAccountClient.current_account_balance || 0) - parseFloat(paymentAmount);
            setSelectedAccountClient({ ...selectedAccountClient, current_account_balance: newBalance });
            setPaymentAmount('');
            setPaymentNote('');
        } catch (error) {
            console.error('Error paying:', error);
            alert('Error al registrar pago');
        }
    };

    const formatCurrency = (val) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(val);

    return (
        <div className="p-6 h-full flex flex-col animate-fade-in bg-gray-50">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Clientes & Cuentas Corrientes</h1>
                <div className="flex gap-3">
                    <div className="relative">
                        <input
                            type="text"
                            className="bg-white border rounded-lg pl-10 pr-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
                            placeholder="Buscar por nombre o DNI..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <svg
                            className="w-5 h-5 text-gray-400 absolute left-3 top-2.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <button
                        onClick={handleCreate}
                        className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors"
                    >
                        <span className="text-xl leading-none font-bold">+</span> Nuevo
                    </button>
                </div>
            </div>

            {/* Clients List */}
            <div className="bg-white rounded-xl shadow border border-gray-100 flex-1 overflow-hidden flex flex-col">
                <div className="overflow-auto flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-gray-50 shadow-sm z-10">
                            <tr className="text-gray-600 text-xs uppercase tracking-wider font-semibold">
                                <th className="p-4 border-b">Nombre</th>
                                <th className="p-4 border-b">DNI / Datos</th>
                                <th className="p-4 border-b text-center">Saldo / Deuda</th>
                                <th className="p-4 border-b text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {clients.map((client) => {
                                const balance = client.current_account_balance || 0;
                                return (
                                    <tr key={client.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="p-4 font-medium text-gray-800 flex flex-col">
                                            <span>{client.name}</span>
                                            <span className="text-xs text-gray-400 font-normal">{client.type === 'business' ? 'Empresa' : 'Consumidor Final'}</span>
                                        </td>
                                        <td className="p-4 text-gray-600 font-mono text-sm">
                                            <div>{client.identifier || '-'}</div>
                                            <div className="text-xs text-gray-400">{client.email}</div>
                                        </td>
                                        <td className="p-4 text-center">
                                            {balance > 0 ? (
                                                <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-bold shadow-sm border border-red-200">
                                                    Debe: {formatCurrency(balance)}
                                                </span>
                                            ) : balance < 0 ? (
                                                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                                                    Favor: {formatCurrency(Math.abs(balance))}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 text-sm">-</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => handleViewAccount(client)}
                                                className="text-blue-600 hover:text-blue-800 mr-4 font-medium bg-blue-50 px-3 py-1 rounded hover:bg-blue-100 transition-colors"
                                            >
                                                📜 Ver Cuenta
                                            </button>
                                            <button
                                                onClick={() => handleEdit(client)}
                                                className="text-gray-400 hover:text-gray-600 mr-2"
                                                title="Editar"
                                            >
                                                ✏️
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-800">{editingClient ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            {error && (
                                <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm border border-red-100">
                                    {error}
                                </div>
                            )}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Nombre *</label>
                                    <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="input w-full" autoFocus required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">DNI/CUIT</label>
                                    <input type="text" value={formData.identifier} onChange={e => setFormData({ ...formData, identifier: e.target.value })} className="input w-full" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                                    <input type="text" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="input w-full" />
                                </div>
                                <div className="flex justify-end gap-3 mt-4">
                                    <button type="button" onClick={() => setShowModal(false)} className="btn bg-gray-200">Cancelar</button>
                                    <button type="submit" className="btn btn-primary">Guardar</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Account Details Modal */}
            {showAccountModal && selectedAccountClient && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col">
                        <div className="bg-gray-800 text-white px-6 py-4 flex justify-between items-center rounded-t-lg">
                            <div>
                                <h2 className="text-xl font-bold">Cuenta Corriente: {selectedAccountClient.name}</h2>
                                <p className="text-white/80 text-sm">Cód: {selectedAccountClient.identifier || 'N/A'}</p>
                            </div>
                            <div className="text-right">
                                <div className="text-xs uppercase opacity-80">Saldo Actual</div>
                                <div className={`text-2xl font-bold ${selectedAccountClient.current_account_balance > 0 ? 'text-red-300' : 'text-green-300'}`}>
                                    {formatCurrency(selectedAccountClient.current_account_balance || 0)}
                                </div>
                            </div>
                            <button onClick={() => setShowAccountModal(false)} className="ml-4 text-gray-400 hover:text-white text-xl">✕</button>
                        </div>

                        <div className="flex-1 flex overflow-hidden">
                            {/* Movements Table */}
                            <div className="flex-1 overflow-auto p-4 border-r border-gray-200 bg-gray-50">
                                <h3 className="font-bold text-gray-700 mb-4 sticky top-0 bg-gray-50 pb-2">📜 Historial de Movimientos</h3>
                                <div className="bg-white rounded shadow-sm overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                                            <tr>
                                                <th className="p-3">Fecha</th>
                                                <th className="p-3">Descripción</th>
                                                <th className="p-3 text-right">Monto</th>
                                                <th className="p-3 text-right">Saldo</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {movements.length === 0 ? (
                                                <tr><td colSpan="4" className="p-8 text-center text-gray-400">Sin movimientos</td></tr>
                                            ) : (
                                                movements.map(m => (
                                                    <tr key={m.id}>
                                                        <td className="p-3 max-w-[100px]">{new Date(m.created_at).toLocaleDateString()} <br /><span className="text-xs text-gray-400">{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></td>
                                                        <td className="p-3">
                                                            <div className="font-medium text-gray-800">{m.description}</div>
                                                            {m.type === 'credit' && <span className="text-xs bg-green-100 text-green-700 px-1 rounded">Pago Ingresado</span>}
                                                            {m.type === 'debit' && <span className="text-xs bg-red-100 text-red-700 px-1 rounded">Compra Fiado</span>}
                                                        </td>
                                                        <td className={`p-3 text-right font-bold ${m.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                                                            {m.type === 'credit' ? '-' : '+'}{formatCurrency(m.amount)}
                                                        </td>
                                                        <td className="p-3 text-right text-gray-600 font-mono">
                                                            {formatCurrency(m.balance_after)}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Payment Form */}
                            <div className="w-80 p-6 bg-white flex flex-col shadow-lg z-10">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <span>💸</span> Registrar Pago
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Monto a pagar</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2 text-gray-500">$</span>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={paymentAmount}
                                                onChange={e => setPaymentAmount(e.target.value)}
                                                className="input pl-8 text-lg font-bold text-green-700"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Método de Pago</label>
                                        <select
                                            value={paymentMethod}
                                            onChange={e => setPaymentMethod(e.target.value)}
                                            className="input"
                                        >
                                            <option value="cash_ars">Efectivo ARS</option>
                                            <option value="cash_usd">Efectivo USD</option>
                                            <option value="debit">Débito</option>
                                            <option value="transfer_ars">Transferencia</option>
                                            <option value="qr">QR</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                                        <textarea
                                            value={paymentNote}
                                            onChange={e => setPaymentNote(e.target.value)}
                                            className="input h-20 resize-none text-sm"
                                            placeholder="Detalle opcional..."
                                        />
                                    </div>
                                    <button
                                        onClick={handleRegisterPayment}
                                        disabled={!paymentAmount}
                                        className="btn btn-success w-full py-3 font-bold shadow-lg shadow-green-200 mt-4"
                                    >
                                        ✅ CONFIRMAR PAGO
                                    </button>
                                </div>

                                <div className="mt-auto pt-6 text-xs text-center text-gray-400">
                                    El pago se registrará en la Caja Diaria automáticamente.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientManagement;
