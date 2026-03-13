import React, { useState } from 'react';

const Sidebar = ({ categories, selectedCategory, onSelectCategory, onCreateCategory, onDeleteCategory, onDeleteMultipleCategories, readOnly }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIds, setSelectedIds] = useState(new Set());

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newCategoryName.trim()) {
            setSubmitting(true);
            try {
                await onCreateCategory(newCategoryName.trim());
                setNewCategoryName('');
                setIsAdding(false);
            } catch (error) {
                // Error handled by parent, but we stop loading
            } finally {
                setSubmitting(false);
            }
        }
    };

    const handleToggleSelect = (e, id) => {
        e.stopPropagation();
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const handleBatchDelete = () => {
        if (selectedIds.size === 0) return;
        if (window.confirm(`¿Estás seguro de eliminar las ${selectedIds.size} categorías seleccionadas?`)) {
            onDeleteMultipleCategories(Array.from(selectedIds));
            setSelectedIds(new Set());
        }
    };

    const filteredCategories = categories.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">

            {/* Branding Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-center">
                <img src="logo_full.png" alt="VentaCore" className="h-10 w-auto object-contain" />
            </div>

            {/* Categories List */}
            <div className="flex-1 overflow-y-auto p-4">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-semibold text-gray-700 uppercase">Categorías</h2>
                    <div className="flex gap-2">
                        {!readOnly && selectedIds.size > 0 && (
                            <button
                                onClick={handleBatchDelete}
                                className="text-danger-600 hover:text-danger-700 text-sm font-bold bg-danger-50 px-2 rounded"
                                title="Eliminar seleccionados"
                            >
                                🗑️ ({selectedIds.size})
                            </button>
                        )}
                        {!readOnly && (
                            <button
                                onClick={() => setIsAdding(true)}
                                className="text-primary-600 hover:text-primary-700 text-xl font-bold"
                                title="Agregar categoría"
                            >
                                +
                            </button>
                        )}
                    </div>
                </div>

                {/* Search Bar */}
                <div className="mb-3">
                    <input
                        type="text"
                        placeholder="Buscar categoría..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input text-sm w-full bg-gray-50 border-gray-200"
                    />
                </div>

                {/* Add Category Form */}
                {isAdding && (
                    <form onSubmit={handleSubmit} className="mb-3 animate-fadeIn">
                        <input
                            type="text"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="Nombre de categoría"
                            className="input text-sm mb-2"
                            autoFocus
                            disabled={submitting}
                        />
                        <div className="flex gap-2">
                            <button type="submit" className="btn btn-primary btn-sm flex-1" disabled={submitting}>
                                {submitting ? '...' : 'Crear'}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsAdding(false);
                                    setNewCategoryName('');
                                }}
                                className="btn btn-secondary btn-sm"
                                disabled={submitting}
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                )}

                {/* Category Items */}
                <div className="space-y-1">
                    {filteredCategories.map((category) => (
                        <div
                            key={category.id}
                            className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${selectedCategory?.id === category.id
                                ? 'bg-primary-50 text-primary-700 font-medium'
                                : 'hover:bg-gray-50 text-gray-700'
                                }`}
                            onClick={() => onSelectCategory(category)}
                        >
                            {!readOnly && (
                                <input
                                    type="checkbox"
                                    className="mr-3 w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                                    checked={selectedIds.has(category.id)}
                                    onChange={(e) => handleToggleSelect(e, category.id)}
                                    onClick={(e) => e.stopPropagation()}
                                />
                            )}
                            <span className="flex-1 truncate">{category.name}</span>
                            {!readOnly && selectedCategory?.id === category.id && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (window.confirm(`¿Eliminar categoría "${category.name}"?`)) {
                                            onDeleteCategory(category.id);
                                        }
                                    }}
                                    className="opacity-0 group-hover:opacity-100 text-danger-600 hover:text-danger-700 ml-2"
                                    title="Eliminar categoría"
                                >
                                    🗑️
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {categories.length === 0 && !isAdding && (
                    <p className="text-sm text-gray-400 text-center mt-4">
                        No hay categorías. Haz clic en + para crear una.
                    </p>
                )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
                <p className="text-xs text-gray-500 text-center">
                    VentaCore v1.0
                </p>
            </div>
        </div>
    );
};

export default Sidebar;
