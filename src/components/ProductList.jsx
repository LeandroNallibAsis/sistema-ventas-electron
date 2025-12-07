import React from 'react';
import StockBadge from './StockBadge';

const ProductList = ({ products, onEdit, onDelete, onShowBarcode }) => {
    if (!products || products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-96 text-gray-400">
                <svg className="w-24 h-24 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <p className="text-lg font-medium">No hay productos en esta categoría</p>
                <p className="text-sm mt-1">Haz clic en "Agregar Producto" para comenzar</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
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
                    {products.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50 transition-colors">
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
                                            if (confirm(`¿Eliminar "${product.name}"?`)) {
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
                </tbody>
            </table>
        </div>
    );
};

export default ProductList;
