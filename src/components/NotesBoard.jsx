import React, { useState, useEffect } from 'react';

const COLORS = [
    { bg: 'bg-yellow-200', text: 'text-yellow-900', border: 'border-yellow-300', name: 'Amarillo' },
    { bg: 'bg-blue-200', text: 'text-blue-900', border: 'border-blue-300', name: 'Azul' },
    { bg: 'bg-green-200', text: 'text-green-900', border: 'border-green-300', name: 'Verde' },
    { bg: 'bg-pink-200', text: 'text-pink-900', border: 'border-pink-300', name: 'Rosa' },
    { bg: 'bg-purple-200', text: 'text-purple-900', border: 'border-purple-300', name: 'Violeta' },
    { bg: 'bg-orange-200', text: 'text-orange-900', border: 'border-orange-300', name: 'Naranja' },
    { bg: 'bg-red-200', text: 'text-red-900', border: 'border-red-300', name: 'Rojo' },
    { bg: 'bg-teal-200', text: 'text-teal-900', border: 'border-teal-300', name: 'Turquesa' }
];

const NotesBoard = () => {
    const [notes, setNotes] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [editingNote, setEditingNote] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        color: 'bg-yellow-200'
    });

    useEffect(() => {
        loadNotes();
    }, []);

    const loadNotes = async () => {
        try {
            const data = await window.api.getNotes();
            setNotes(data);
            setIsLoaded(true);
        } catch (error) {
            console.error('Error loading notes:', error);
            alert('Error al cargar las notas');
        }
    };

    const handleOpenModal = (note = null) => {
        if (note) {
            setEditingNote(note);
            setFormData({
                title: note.title || '',
                content: note.content || '',
                color: note.color || 'bg-yellow-200'
            });
        } else {
            setEditingNote(null);
            setFormData({
                title: '',
                content: '',
                color: 'bg-yellow-200'
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingNote(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingNote) {
                await window.api.updateNote(editingNote.id, formData);
            } else {
                await window.api.createNote(formData);
            }
            loadNotes();
            handleCloseModal();
        } catch (error) {
            console.error('Error saving note:', error);
            alert('Error al guardar la nota');
        }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation(); // Prevent opening edit modal
        if (!confirm('¿Eliminar esta nota?')) return;
        try {
            await window.api.deleteNote(id);
            loadNotes();
        } catch (error) {
            console.error('Error deleting note:', error);
        }
    };

    const handleToggleComplete = async (note, e) => {
        e.stopPropagation();
        try {
            await window.api.updateNote(note.id, { is_completed: !note.is_completed });
            loadNotes();
        } catch (error) {
            console.error('Error toggling note status:', error);
        }
    };

    // Helper to get text color based on bg color (simple mapping)
    const getTextColor = (bgColor) => {
        const colorObj = COLORS.find(c => c.bg === bgColor);
        return colorObj ? colorObj.text : 'text-gray-900';
    };

    return (
        <div className="h-full flex flex-col bg-[#f0f2f5] relative overflow-hidden">
            {/* Header */}
            <div className="flex-none p-6 pb-2 flex justify-between items-center z-10 bg-white/50 backdrop-blur-sm border-b border-gray-200/50">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        📌 Pizarra de Notas
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        {notes.filter(n => !n.is_completed).length} pendientes
                    </p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="btn btn-primary flex items-center gap-2 shadow-lg hover:transform hover:scale-105 transition-all text-lg px-6 py-3"
                >
                    <span className="text-2xl">+</span> Nueva Nota
                </button>
            </div>

            {/* Wooden Frame + Corkboard Background */}
            <div className="flex-1 overflow-auto p-4 md:p-8 relative cursor-default bg-[#8B4513]"
                style={{
                    boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)',
                    padding: '24px', // Space for frame
                }}
            >
                {/* Inner Bevel for Frame */}
                <div className="h-full w-full rounded-sm overflow-auto p-6 relative"
                    style={{
                        backgroundImage: 'radial-gradient(#d1d5db 1px, transparent 1px)',
                        backgroundSize: '20px 20px',
                        backgroundColor: '#f3f4f6', // Slightly gray/cork color
                        boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.3)',
                        border: '4px solid #5D4037' // Darker wood border inner
                    }}
                >
                    {/* Texture Overlay (Optional Cork Effect via CSS) */}
                    <div className="absolute inset-0 pointer-events-none opacity-50 z-0"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E")`,
                        }}
                    ></div>

                    {/* Notes Grid (z-index relative to overlay) */}
                    <div className="relative z-10">
                        {!isLoaded ? (
                            <div className="flex items-center justify-center h-full text-gray-400">Cargando...</div>
                        ) : notes.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-60">
                                <div className="text-6xl mb-4">📝</div>
                                <p className="text-xl">No hay notas. ¡Agrega una para comenzar!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-max">
                                {notes.map((note) => (
                                    <div
                                        key={note.id}
                                        onClick={() => handleOpenModal(note)}
                                        className={`
                                    relative p-5 rounded-sm shadow-md transition-all duration-200 
                                    hover:shadow-xl hover:-translate-y-1 hover:rotate-1 cursor-pointer
                                    ${note.color} ${getTextColor(note.color)}
                                    ${note.is_completed ? 'opacity-60 saturate-50' : ''}
                                `}
                                        style={{
                                            transform: `rotate(${note.id % 2 === 0 ? '1deg' : '-1deg'})`,
                                            minHeight: '200px'
                                        }}
                                    >
                                        {/* Pin visual */}
                                        <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-red-500 shadow-sm z-10 border border-red-700"></div>

                                        {/* Content */}
                                        <div className="h-full flex flex-col">
                                            <div className="flex justify-between items-start mb-3 border-b border-black/10 pb-2">
                                                <h3 className={`font-bold text-lg leading-tight ${note.is_completed ? 'line-through decoration-2' : ''}`}>
                                                    {note.title || '(Sin título)'}
                                                </h3>
                                                {note.is_completed && (
                                                    <span className="text-xs font-bold bg-black/10 px-2 py-0.5 rounded ml-2 whitespace-nowrap">
                                                        ✓ HECHO
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex-1 whitespace-pre-wrap font-handwriting text-md leading-snug">
                                                {note.content}
                                            </div>

                                            {/* Footer Actions */}
                                            <div className="flex justify-between items-end mt-4 pt-2 border-t border-black/5 opacity-0 group-hover:opacity-100 md:opacity-100 transition-opacity">
                                                <button
                                                    onClick={(e) => handleToggleComplete(note, e)}
                                                    className="p-1.5 rounded hover:bg-black/10 transition-colors"
                                                    title={note.is_completed ? "Marcar pendiente" : "Marcar completado"}
                                                >
                                                    {note.is_completed ? '⏪ Pendiente' : '✅ Completar'}
                                                </button>
                                                <button
                                                    onClick={(e) => handleDelete(note.id, e)}
                                                    className="p-1.5 rounded hover:bg-black/10 text-red-700 hover:text-red-900 transition-colors"
                                                    title="Eliminar nota"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className={`bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100`}>
                        <form onSubmit={handleSubmit} className="flex flex-col h-full">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <h2 className="text-xl font-bold text-gray-800">
                                    {editingNote ? '✏️ Editar Nota' : '✨ Nueva Nota'}
                                </h2>
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="text-gray-400 hover:text-gray-600 w-8 h-8 rounded-full hover:bg-gray-200 flex items-center justify-center transition-colors"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                {/* Color Selector */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                                    <div className="flex flex-wrap gap-3">
                                        {COLORS.map((c) => (
                                            <button
                                                key={c.bg}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, color: c.bg })}
                                                className={`
                                                    w-8 h-8 rounded-full border-2 transition-transform hover:scale-110
                                                    ${c.bg} ${formData.color === c.bg ? 'border-gray-600 scale-110 ring-2 ring-gray-300 ring-offset-1' : 'border-transparent'}
                                                `}
                                                title={c.name}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Title Input */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className={`input w-full font-bold ${formData.color} bg-opacity-30 border-gray-200`}
                                        placeholder="Ej: Pedido de Bebidas"
                                        autoFocus
                                    />
                                </div>

                                {/* Content Textarea */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Contenido</label>
                                    <textarea
                                        value={formData.content}
                                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                        className={`input w-full h-40 resize-none ${formData.color} bg-opacity-30 border-gray-200`}
                                        placeholder="Escribe los detalles aquí..."
                                    />
                                </div>
                            </div>

                            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                                >
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary px-8">
                                    {editingNote ? 'Guardar Cambios' : 'Crear Nota'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotesBoard;
