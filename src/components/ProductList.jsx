import React, { useState } from 'react';
import StockBadge from './StockBadge';

const ProductList = ({ products, onEdit, onDelete, onDeleteMultiple, onShowBarcode, readOnly }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIds, setSelectedIds] = useState(new Set());

    const handleToggleSelect = (id) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const handleToggleSelectAll = () => {
        if (selectedIds.size === filteredProducts.length) {
            setSelectedIds(new Set()); // Deselect all
        } else {
            setSelectedIds(new Set(filteredProducts.map(p => p.id))); // Select all filtered
        }
    };

    const handleBatchDelete = () => {
        if (selectedIds.size === 0) return;
        if (window.confirm(`¿Estás seguro de eliminar los ${selectedIds.size} productos seleccionados?`)) {
            onDeleteMultiple(Array.from(selectedIds));
            setSelectedIds(new Set());
        }
    };

    const filteredProducts = products ? products.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (p.barcode && p.barcode.includes(searchQuery)) ||
        (p.supplier && p.supplier.toLowerCase().includes(searchQuery.toLowerCase()))
    ) : [];
    if (!products || products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-96 text-gray-400">
                <svg className="w-24 h-24 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <p className="text-lg font-medium">No hay productos en esta categoría</p>
                {!readOnly && <p className="text-sm mt-1">Haz clic en "Agregar Producto" para comenzar</p>}
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {/* Toolbar */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <input
                        type="text"
                        placeholder="Buscar producto..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input w-64 bg-gray-50 border-gray-200"
                    />
                    {!readOnly && selectedIds.size > 0 && (
                        <button
                            onClick={handleBatchDelete}
                            className="btn bg-danger-50 text-danger-600 hover:bg-danger-100 flex items-center gap-2"
                        >
                            <span>🗑️</span> Eliminar ({selectedIds.size})
                        </button>
                    )}
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            {!readOnly && (
                                <th className="px-6 py-3 text-left w-12">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                                        checked={filteredProducts.length > 0 && selectedIds.size === filteredProducts.length}
                                        onChange={handleToggleSelectAll}
                                    />
                                </th>
                            )}
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Producto
                            </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Proveedor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Costo USD
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Costo ARS
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Precio
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Stock
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Estado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Acciones
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProducts.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                            {!readOnly && (
                                <td className="px-6 py-4">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                                        checked={selectedIds.has(product.id)}
                                        onChange={() => handleToggleSelect(product.id)}
                                    />
                                </td>
                            )}
                            <td className="px-6 py-4">
                                <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                {product.description && (
                                    <div className="text-sm text-gray-500 truncate max-w-xs">{product.description}</div>
                                )}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700">
                                {product.supplier || '-'}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700">
                                ${product.cost_usd?.toFixed(2) || '0.00'}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700">
                                ${product.cost_ars?.toFixed(2) || '0.00'}
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                ${product.price?.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700">
                                {product.stock}
                            </td>
                            <td className="px-6 py-4">
                                <StockBadge stock={product.stock} />
                            </td>
                            <td className="px-6 py-4 text-sm">
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => onEdit(product)}
                                        className="text-primary-600 hover:text-primary-700"
                                        title="Editar"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        onClick={() => onShowBarcode(product)}
                                        className="text-gray-600 hover:text-gray-700"
                                        title="Código de barras"
                                    >
                                        📊
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (window.confirm(`¿Eliminar "${product.name}"?`)) {
                                                onDelete(product.id);
                                            }
                                        }}
                                        className="text-danger-600 hover:text-danger-700"
                                        title="Eliminar"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {filteredProducts.length === 0 && products && products.length > 0 && (
                        <tr>
                            <td colSpan={readOnly ? 8 : 9} className="px-6 py-8 text-center text-gray-500">
                                No se encontraron productos que coincidan con la búsqueda.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
        </div>
    );
};

export default React.memo(ProductList);
