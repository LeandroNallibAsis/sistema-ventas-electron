import React, { useState, useEffect } from 'react';

const ProductForm = ({ product, categoryId, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        supplier: '',
        cost_usd: '',
        cost_ars: '',
        price: '',
        stock: '',
        description: '',
    });

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || '',
                supplier: product.supplier || '',
                cost_usd: product.cost_usd || '',
                cost_ars: product.cost_ars || '',
                price: product.price || '',
                stock: product.stock || '',
                description: product.description || '',
            });
        }
    }, [product]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const productData = {
            category_id: categoryId,
            name: formData.name,
            supplier: formData.supplier,
            cost_usd: parseFloat(formData.cost_usd) || 0,
            cost_ars: parseFloat(formData.cost_ars) || 0,
            price: parseFloat(formData.price),
            stock: parseInt(formData.stock) || 0,
            description: formData.description,
        };

        onSubmit(productData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {product ? 'Editar Producto' : 'Nuevo Producto'}
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nombre del Producto *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="input"
                            placeholder="Ej: Funda iPhone 13"
                        />
                    </div>

                    {/* Supplier */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Proveedor/Mayorista
                        </label>
                        <input
                            type="text"
                            name="supplier"
                            value={formData.supplier}
                            onChange={handleChange}
                            className="input"
                            placeholder="Ej: Distribuidora XYZ"
                        />
                    </div>

                    {/* Costs */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Costo USD
                            </label>
                            <input
                                type="number"
                                name="cost_usd"
                                value={formData.cost_usd}
                                onChange={handleChange}
                                step="0.01"
                                min="0"
                                className="input"
                                placeholder="0.00"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Costo ARS
                            </label>
                            <input
                                type="number"
                                name="cost_ars"
                                value={formData.cost_ars}
                                onChange={handleChange}
                                step="0.01"
                                min="0"
                                className="input"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    {/* Price and Stock */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Precio de Venta *
                            </label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                step="0.01"
                                min="0"
                                required
                                className="input"
                                placeholder="0.00"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Cantidad en Stock
                            </label>
                            <input
                                type="number"
                                name="stock"
                                value={formData.stock}
                                onChange={handleChange}
                                min="0"
                                className="input"
                                placeholder="0"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Descripción
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="3"
                            className="input"
                            placeholder="Detalles adicionales del producto..."
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button type="submit" className="btn btn-primary flex-1">
                            {product ? 'Guardar Cambios' : 'Crear Producto'}
                        </button>
                        <button type="button" onClick={onCancel} className="btn btn-secondary">
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductForm;
