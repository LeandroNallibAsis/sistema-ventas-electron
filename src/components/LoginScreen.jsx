import React, { useState } from 'react';

const LoginScreen = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const user = await window.api.login(username, password);
            if (user) {
                onLogin(user);
            } else {
                setError('Usuario o contraseña incorrectos');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('Error de conexión con la base de datos');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-secondary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

            <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-2xl shadow-xl w-full max-w-md z-10 relative">
                <div className="text-center mb-8">
                    <img src="logo_full.png" alt="VentaCore Logo" className="w-56 mx-auto mb-6 drop-shadow-xl" />
                    <p className="text-gray-400 font-medium">Sistema de Gestión Profesional</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-500/20 border border-red-500 text-red-100 px-4 py-3 rounded-lg text-sm text-center">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">Usuario</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-gray-800/50 border border-gray-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors placeholder-gray-500"
                            placeholder="Ej: admin"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-gray-800/50 border border-gray-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors placeholder-gray-500"
                            placeholder="••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg transform transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Verificando...' : 'Ingresar'}
                    </button>

                </form>
            </div>
        </div>
    );
};

export default LoginScreen;
