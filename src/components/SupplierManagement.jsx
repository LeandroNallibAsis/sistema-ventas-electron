import React, { useState, useEffect } from 'react';

const SupplierManagement = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        company: '',
        products_sold: '',
        contact_phone: '',
        shipping_methods: '',
        notes: ''
    });

    useEffect(() => {
        loadSuppliers();
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchTerm.length >= 2) {
                searchSuppliers();
            } else if (searchTerm.length === 0) {
                loadSuppliers();
            }
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    const loadSuppliers = async () => {
        setLoading(true);
        try {
            const data = await window.api.getSuppliers();
            setSuppliers(data);
        } catch (error) {
            console.error('Error loading suppliers:', error);
            alert('Error al cargar proveedores');
        } finally {
            setLoading(false);
        }
    };

    const searchSuppliers = async () => {
        setLoading(true);
        try {
            const data = await window.api.searchSuppliers(searchTerm);
            setSuppliers(data);
        } catch (error) {
            console.error('Error searching suppliers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (supplier = null) => {
        if (supplier) {
            setEditingSupplier(supplier);
            setFormData({
                name: supplier.name,
                company: supplier.company || '',
                products_sold: supplier.products_sold || '',
                contact_phone: supplier.contact_phone || '',
                shipping_methods: supplier.shipping_methods || '',
                notes: supplier.notes || ''
            });
        } else {
            setEditingSupplier(null);
            setFormData({
                name: '',
                company: '',
                products_sold: '',
                contact_phone: '',
                shipping_methods: '',
                notes: ''
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingSupplier(null);
        setFormData({
            name: '',
            company: '',
            products_sold: '',
            contact_phone: '',
            shipping_methods: '',
            notes: ''
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            alert('El nombre del proveedor es obligatorio');
            return;
        }

        try {
            if (editingSupplier) {
                await window.api.updateSupplier(editingSupplier.id, formData);
            } else {
                await window.api.createSupplier(formData);
            }
            handleCloseModal();
            loadSuppliers();
        } catch (error) {
            console.error('Error saving supplier:', error);
            alert('Error al guardar proveedor');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Está seguro de eliminar este proveedor?')) return;

        try {
            await window.api.deleteSupplier(id);
            loadSuppliers();
        } catch (error) {
            console.error('Error deleting supplier:', error);
            alert('Error al eliminar proveedor');
        }
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">📦 Proveedores</h1>
                <button
                    onClick={() => handleOpenModal()}
                    className="btn btn-primary"
                >
                    + Nuevo Proveedor
                </button>
            </div>

            {/* Search */}
            <div className="mb-6">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por nombre, empresa o teléfono..."
                    className="input w-full max-w-md"
                />
            </div>

            {/* Suppliers Table */}
            <div className="card overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Cargando...</div>
                ) : suppliers.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        {searchTerm ? 'No se encontraron proveedores' : 'No hay proveedores registrados'}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Empresa</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Productos</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contacto</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Envíos</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {suppliers.map((supplier) => (
                                    <tr key={supplier.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-medium text-gray-900">{supplier.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {supplier.company || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {supplier.products_sold || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {supplier.contact_phone || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {supplier.shipping_methods || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleOpenModal(supplier)}
                                                className="text-primary-600 hover:text-primary-900 mr-4"
                                            >
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => handleDelete(supplier.id)}
                                                className="text-danger-600 hover:text-danger-900"
                                            >
                                                Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                            {editingSupplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}
                        </h2>

                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nombre *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="input w-full"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Empresa
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.company}
                                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                        className="input w-full"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Teléfono
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.contact_phone}
                                        onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                                        className="input w-full"
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Productos que vende
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.products_sold}
                                        onChange={(e) => setFormData({ ...formData, products_sold: e.target.value })}
                                        className="input w-full"
                                        placeholder="Ej: Cables, Cargadores, Auriculares"
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Medios de envío
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.shipping_methods}
                                        onChange={(e) => setFormData({ ...formData, shipping_methods: e.target.value })}
                                        className="input w-full"
                                        placeholder="Ej: Andreani, OCA, Retiro en local"
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Notas
                                    </label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        className="input w-full h-24 resize-none"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="btn bg-gray-200 text-gray-700 hover:bg-gray-300"
                                >
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingSupplier ? 'Guardar Cambios' : 'Crear Proveedor'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SupplierManagement;
