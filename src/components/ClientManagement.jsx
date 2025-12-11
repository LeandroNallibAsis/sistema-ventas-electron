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
            setClients(data);
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

    return (
        <div className="p-6 h-full flex flex-col animate-fade-in bg-gray-50">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Clientes</h1>
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

            <div className="bg-white rounded-xl shadow border border-gray-100 flex-1 overflow-hidden flex flex-col">
                <div className="overflow-auto flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-gray-50 shadow-sm z-10">
                            <tr className="text-gray-600 text-xs uppercase tracking-wider font-semibold">
                                <th className="p-4 border-b">Nombre</th>
                                <th className="p-4 border-b">DNI / CUIT</th>
                                <th className="p-4 border-b">Teléfono</th>
                                <th className="p-4 border-b">Email</th>
                                <th className="p-4 border-b text-center">Deuda</th>
                                <th className="p-4 border-b text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {clients.map((client) => (
                                <tr key={client.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="p-4 font-medium text-gray-800 flex flex-col">
                                        <span>{client.name}</span>
                                        <span className="text-xs text-gray-400 font-normal">{client.type === 'business' ? 'Empresa' : 'Consumidor Final'}</span>
                                    </td>
                                    <td className="p-4 text-gray-600 font-mono text-sm">{client.identifier || '-'}</td>
                                    <td className="p-4 text-gray-600">{client.phone || '-'}</td>
                                    <td className="p-4 text-gray-600 text-sm">{client.email || '-'}</td>
                                    <td className="p-4 text-center">
                                        {client.debt > 0 ? (
                                            <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">
                                                ${client.debt.toFixed(2)}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400 text-xs">-</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleEdit(client)}
                                            className="text-blue-600 hover:text-blue-800 mr-4 font-medium"
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => handleDelete(client.id)}
                                            className="text-red-500 hover:text-red-700 font-medium"
                                        >
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {clients.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="6" className="p-12 text-center text-gray-400">
                                        <div className="flex flex-col items-center">
                                            <svg className="w-12 h-12 mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                            No se encontraron clientes
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="bg-gray-50 border-t p-3 text-xs text-gray-500 text-right">
                    Total: {clients.length} clientes
                </div>
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-800">{editingClient ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            {error && (
                                <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm border border-red-100 flex items-center">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo *</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow"
                                            placeholder="Ej: Juan Pérez"
                                            autoFocus
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                                        <select
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                                        >
                                            <option value="consumer">Consumidor Final</option>
                                            <option value="business">Empresa / Responsable</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">DNI / CUIT</label>
                                        <input
                                            type="text"
                                            value={formData.identifier}
                                            onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500 transition-shadow"
                                            placeholder="Numeros sin puntos"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                                        <input
                                            type="text"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500 transition-shadow"
                                            placeholder="+54 9 ..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500 transition-shadow"
                                            placeholder="email@ejemplo.com"
                                        />
                                    </div>

                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                                        <input
                                            type="text"
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500 transition-shadow"
                                            placeholder="Calle, Altura, Ciudad"
                                        />
                                    </div>

                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                                        <textarea
                                            value={formData.notes}
                                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500 transition-shadow h-20 resize-none"
                                            placeholder="Información adicional..."
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-5 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium border border-gray-200"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-5 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium shadow-sm hover:shadow"
                                    >
                                        Guardar Cliente
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientManagement;
