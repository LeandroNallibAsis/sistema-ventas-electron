import React, { useState } from 'react';

const Sidebar = ({ categories, selectedCategory, onSelectCategory, onCreateCategory, onDeleteCategory }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newCategoryName.trim()) {
            await onCreateCategory(newCategoryName.trim());
            setNewCategoryName('');
            setIsAdding(false);
        }
    };

    return (
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
                <h1 className="text-2xl font-bold text-primary-600">ElectroStock</h1>
                <p className="text-sm text-gray-500 mt-1">Gestión de Inventario</p>
            </div>

            {/* Categories List */}
            <div className="flex-1 overflow-y-auto p-4">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-semibold text-gray-700 uppercase">Categorías</h2>
                    <button
                        onClick={() => setIsAdding(true)}
                        className="text-primary-600 hover:text-primary-700 text-xl font-bold"
                        title="Agregar categoría"
                    >
                        +
                    </button>
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
                        />
                        <div className="flex gap-2">
                            <button type="submit" className="btn btn-primary btn-sm flex-1">
                                Crear
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsAdding(false);
                                    setNewCategoryName('');
                                }}
                                className="btn btn-secondary btn-sm"
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                )}

                {/* Category Items */}
                <div className="space-y-1">
                    {categories.map((category) => (
                        <div
                            key={category.id}
                            className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${selectedCategory?.id === category.id
                                    ? 'bg-primary-50 text-primary-700 font-medium'
                                    : 'hover:bg-gray-50 text-gray-700'
                                }`}
                            onClick={() => onSelectCategory(category)}
                        >
                            <span className="flex-1 truncate">{category.name}</span>
                            {selectedCategory?.id === category.id && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (confirm(`¿Eliminar categoría "${category.name}"?`)) {
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
                    ElectroStock v1.0
                </p>
            </div>
        </div>
    );
};

export default Sidebar;
