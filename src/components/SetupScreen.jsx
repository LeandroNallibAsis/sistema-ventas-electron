import React, { useState } from 'react';

const SetupScreen = ({ onComplete }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        if (password.length < 4) {
            setError('La contraseña debe tener al menos 4 caracteres');
            return;
        }

        setLoading(true);
        try {
            const result = await window.api.createUser({
                username,
                password,
                role: 'admin',
                name: name || username
            });

            if (result && result.id) {
                // Auto-login or just signal completion
                const user = await window.api.login(username, password);
                onComplete(user);
            }
        } catch (err) {
            console.error('Setup error:', err);
            setError(err.message || 'Error al crear el usuario administrador');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 relative overflow-hidden">
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-secondary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

            <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-2xl shadow-xl w-full max-w-md z-10 relative">
                <div className="text-center mb-8">
                    <img src="logo_full.png" alt="VentaCore Logo" className="w-32 mx-auto mb-4 drop-shadow-lg" />
                    <h1 className="text-3xl font-bold text-white mb-2">Configuración Inicial</h1>
                    <p className="text-gray-300">Crea la cuenta de administrador principal</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-500/20 border border-red-500 text-red-100 px-4 py-3 rounded-lg text-sm text-center">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-gray-300 text-sm font-medium mb-1">Nombre Completo (Opcional)</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-gray-800/50 border border-gray-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-primary-500 transition-colors"
                            placeholder="Ej: Juan Pérez"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-300 text-sm font-medium mb-1">Nombre de Usuario</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-gray-800/50 border border-gray-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-primary-500 transition-colors"
                            placeholder="Ej: admin"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-300 text-sm font-medium mb-1">Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-gray-800/50 border border-gray-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-primary-500 transition-colors"
                            placeholder="••••••"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-300 text-sm font-medium mb-1">Confirmar Contraseña</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-gray-800/50 border border-gray-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-primary-500 transition-colors"
                            placeholder="••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg transform transition-all active:scale-95 disabled:opacity-50 mt-4"
                    >
                        {loading ? 'Creando...' : 'Finalizar Configuración'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SetupScreen;
