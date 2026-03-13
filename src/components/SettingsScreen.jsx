






















































































































































import React, { useState, useEffect } from 'react';
import TicketView from './TicketView';

const SettingsScreen = () => {
    const [activeTab, setActiveTab] = useState('store'); // 'store' or 'payments'
    const [paymentConfigs, setPaymentConfigs] = useState([]);
    const [storeConfig, setStoreConfig] = useState({
        store_name: '',
        store_address: '',
        store_phone: '',
        store_logo: '',
        receipt_message: '',
        return_policy: '',
        backup_enabled: 'false',
        backup_path: '',
        auto_start: 'false'
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    const paymentLabels = {
        'cash_ars': 'Efectivo (ARS)',
        'cash_usd': 'Efectivo (USD)',
        'transfer_ars': 'Transferencia (ARS)',
        'transfer_usd': 'Transferencia (USD)',
        'qr': 'QR',
        'debit': 'Tarjeta de Débito',
        'credit_1': 'Crédito 1 cuota',
        'credit_3': 'Crédito 3 cuotas',
        'credit_6': 'Crédito 6 cuotas',
        'credit_12': 'Crédito 12 cuotas',
        'link': 'Link de Pago'
    };

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const configs = await window.api.getPaymentConfigs();
            setPaymentConfigs(configs);
        } catch (error) {
            console.error('Error loading payment configs:', error);
        }

        try {
            const store = await window.api.getStoreConfig();
            if (store && Object.keys(store).length > 0) {
                setStoreConfig(prev => ({ ...prev, ...store }));
            }
        } catch (error) {
            console.error('Error loading store config:', error);
            // Keep default values if store config fails
        }

        setLoading(false);
    };

    const handleSurchargeChange = (method, value) => {
        setPaymentConfigs(prev =>
            prev.map(config =>
                config.method === method
                    ? { ...config, surcharge: parseFloat(value) || 0 }
                    : config
            )
        );
    };

    const handleStoreChange = (key, value) => {
        setStoreConfig(prev => ({ ...prev, [key]: value }));
    };

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                handleStoreChange('store_logo', reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSavePayments = async () => {
        setSaving(true);
        setMessage('');
        try {
            for (const config of paymentConfigs) {
                await window.api.updatePaymentConfig(config.method, config.surcharge);
            }
            setMessage('✅ Configuración de pagos guardada');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Error saving:', error);
            setMessage('❌ Error al guardar');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveStore = async () => {
        setSaving(true);
        setMessage('');
        try {
            for (const [key, value] of Object.entries(storeConfig)) {
                await window.api.updateStoreConfig(key, value);
            }
            setMessage('✅ Configuración del local guardada');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Error saving:', error);
            setMessage('❌ Error al guardar');
        } finally {
            setSaving(false);
        }
    };

    const handleCreateBackup = async () => {
        setSaving(true);
        setMessage('⏳ Creando copia de seguridad...');
        try {
            const result = await window.api.invoke('create-backup-manual');
            if (result.success) {
                setMessage('✅ Copia de seguridad creada con éxito en "tablas copia"');
            } else {
                setMessage(`❌ Error al crear copia: ${result.error}`);
            }
            setTimeout(() => setMessage(''), 5000);
        } catch (error) {
            console.error('Error creating backup:', error);
            setMessage('❌ Error al crear copia');
        } finally {
            setSaving(false);
        }
    };

    const handleRestoreBackup = async () => {
        if (!window.confirm('⚠️ ADVERTENCIA: Esta acción REEMPLAZARÁ toda la base de datos actual con los datos de las "tablas copia". ¿Estás completamente seguro de continuar?')) {
            return;
        }
        
        setSaving(true);
        setMessage('⏳ Restaurando copia de seguridad. Por favor espera...');
        try {
            const result = await window.api.invoke('restore-backup-manual');
            if (result.success) {
                setMessage('✅ Copia de seguridad restaurada con éxito. Por favor, reinicia la aplicación.');
            } else {
                setMessage(`❌ Error al restaurar: ${result.error}`);
            }
            // Keep message on screen longer for restart notice
            if (result.success) setTimeout(() => setMessage(''), 8000);
            else setTimeout(() => setMessage(''), 5000);
        } catch (error) {
            console.error('Error restoring backup:', error);
            setMessage('❌ Error al restaurar copia');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center">
                <p className="text-gray-500">Cargando configuración...</p>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">⚙️ Configuración</h1>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setActiveTab('store')}
                    className={`px-6 py-3 rounded-lg font-medium transition-colors ${activeTab === 'store'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                >
                    🏪 Datos del Local
                </button>
                <button
                    onClick={() => setActiveTab('payments')}
                    className={`px-6 py-3 rounded-lg font-medium transition-colors ${activeTab === 'payments'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                >
                    💳 Métodos de Pago
                </button>
            </div>

            {/* Store Config Tab */}
            {activeTab === 'store' && (
                <div className="grid grid-cols-2 gap-6">
                    {/* Store Data Form */}
                    <div className="card p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">🏪 Información del Local</h2>

                        <div className="space-y-4">
                            {/* Logo Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Logo del Local</label>
                                <div className="flex items-center gap-4">
                                    {storeConfig.store_logo ? (
                                        <img
                                            src={storeConfig.store_logo}
                                            alt="Logo"
                                            className="w-20 h-20 object-contain border rounded-lg"
                                        />
                                    ) : (
                                        <div className="w-20 h-20 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                                            <span className="text-gray-400 text-2xl">📷</span>
                                        </div>
                                    )}
                                    <div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleLogoUpload}
                                            className="hidden"
                                            id="logo-upload"
                                        />
                                        <label
                                            htmlFor="logo-upload"
                                            className="btn btn-secondary cursor-pointer"
                                        >
                                            Subir Logo
                                        </label>
                                        {storeConfig.store_logo && (
                                            <button
                                                onClick={() => handleStoreChange('store_logo', '')}
                                                className="btn btn-danger ml-2"
                                            >
                                                Quitar
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Store Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Local *</label>
                                <input
                                    type="text"
                                    value={storeConfig.store_name || ''}
                                    onChange={(e) => handleStoreChange('store_name', e.target.value)}
                                    className="input"
                                    placeholder="Mi Negocio"
                                />
                            </div>

                            {/* Address */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                                <input
                                    type="text"
                                    value={storeConfig.store_address || ''}
                                    onChange={(e) => handleStoreChange('store_address', e.target.value)}
                                    className="input"
                                    placeholder="Calle 123, Ciudad"
                                />
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono de Contacto</label>
                                <input
                                    type="text"
                                    value={storeConfig.store_phone || ''}
                                    onChange={(e) => handleStoreChange('store_phone', e.target.value)}
                                    className="input"
                                    placeholder="(011) 1234-5678"
                                />
                            </div>

                            {/* Receipt Message */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mensaje del Ticket</label>
                                <textarea
                                    value={storeConfig.receipt_message || ''}
                                    onChange={(e) => handleStoreChange('receipt_message', e.target.value)}
                                    className="input"
                                    rows="2"
                                    placeholder="¡Gracias por su compra!"
                                />
                            </div>

                            {/* Return Policy */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Política de Devolución</label>
                                <textarea
                                    value={storeConfig.return_policy || ''}
                                    onChange={(e) => handleStoreChange('return_policy', e.target.value)}
                                    className="input"
                                    rows="2"
                                    placeholder="Cambios y devoluciones dentro de los 30 días con ticket."
                                />
                            </div>



                            <button
                                onClick={handleSaveStore}
                                disabled={saving}
                                className="btn btn-primary w-full"
                            >
                                {saving ? 'Guardando...' : '💾 Guardar Datos del Local'}
                            </button>

                            {message && activeTab === 'store' && (
                                <p className={message.includes('✅') ? 'text-success-600' : 'text-danger-600'}>
                                    {message}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Receipt Preview & Backup */}
                    <div className="space-y-6">
                        <div className="card p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">🧾 Vista Previa del Ticket</h2>
                            <div className="border rounded-lg overflow-hidden bg-gray-100 p-4 flex justify-center overflow-x-auto">
                                <TicketView
                                    storeConfig={{
                                        name: storeConfig.store_name,
                                        address: storeConfig.store_address,
                                        phone: storeConfig.store_phone,
                                        logo: storeConfig.store_logo,
                                        message: storeConfig.receipt_message,
                                        return_policy: storeConfig.return_policy
                                    }}
                                    isPreview={true}
                                />
                            </div>
                        </div>

                        {/* Backup Configuration */}
                        <div className="card p-6 border-l-4 border-blue-500">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                💾 Copia de Seguridad
                            </h2>
                            <p className="text-sm text-gray-500 mb-6">
                                Configura una carpeta (ej: Dropbox o Google Drive) para guardar copias automáticas de la base de datos al cerrar el programa.
                            </p>

                            <div className="space-y-6">
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <div>
                                        <p className="font-medium text-gray-900">Backup automático al cerrar</p>
                                        <p className="text-xs text-gray-500">Se genera una copia cada vez que cierras la aplicación.</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={storeConfig.backup_enabled === 'true'}
                                            onChange={(e) => handleStoreChange('backup_enabled', e.target.checked ? 'true' : 'false')}
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>

                                {storeConfig.backup_enabled === 'true' && (
                                    <div className="space-y-3 animate-fade-in">
                                        <label className="block text-sm font-medium text-gray-700">Carpeta de Destino</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                readOnly
                                                value={storeConfig.backup_path || ''}
                                                className="input flex-1 bg-gray-50 text-gray-600 text-sm italic"
                                                placeholder="No se ha seleccionado carpeta"
                                            />
                                            <button
                                                onClick={async () => {
                                                    const path = await window.api.selectDirectory();
                                                    if (path) handleStoreChange('backup_path', path);
                                                }}
                                                className="btn btn-secondary whitespace-nowrap"
                                            >
                                                📁 Seleccionar
                                            </button>
                                        </div>
                                        {storeConfig.backup_path && (
                                            <p className="text-[10px] text-blue-600 font-medium">
                                                ✅ Las copias se guardarán en esta ubicación.
                                            </p>
                                        )}
                                    </div>
                                )}

                                <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
                                    <button
                                        onClick={handleCreateBackup}
                                        disabled={saving || !storeConfig.backup_path}
                                        className="btn bg-blue-100 text-blue-700 hover:bg-blue-200 w-full flex items-center justify-center gap-2"
                                        title={!storeConfig.backup_path ? "Selecciona una carpeta primero" : ""}
                                    >
                                        <span>📥</span> Crear Copia de Seguridad Ahora
                                    </button>
                                    
                                    <button
                                        onClick={handleRestoreBackup}
                                        disabled={saving || !storeConfig.backup_path}
                                        className="btn bg-orange-100 text-orange-700 hover:bg-orange-200 w-full flex items-center justify-center gap-2"
                                        title={!storeConfig.backup_path ? "Selecciona una carpeta primero" : ""}
                                    >
                                        <span>🔄</span> Restaurar Copia desde "tablas copia"
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Startup Configuration */}
                        <div className="card p-6 border-l-4 border-emerald-500">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                🚀 Inicio del Sistema
                            </h2>
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div>
                                    <p className="font-medium text-gray-900">Iniciar con Windows</p>
                                    <p className="text-xs text-gray-500">Abrir automáticamente al encender la computadora.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={storeConfig.auto_start === 'true'}
                                        onChange={(e) => handleStoreChange('auto_start', e.target.checked ? 'true' : 'false')}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Config Tab */}
            {activeTab === 'payments' && (
                <div className="card p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">💳 Intereses por Método de Pago</h2>
                    <p className="text-sm text-gray-500 mb-6">
                        Define el porcentaje de recargo que se aplicará automáticamente al usar cada método de pago.
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                        {paymentConfigs.map((config) => (
                            <div
                                key={config.method}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">
                                        {config.method.includes('cash') ? '💵' :
                                            config.method.includes('transfer') ? '🏦' :
                                                config.method === 'qr' ? '📱' :
                                                    config.method === 'debit' ? '💳' :
                                                        config.method.includes('credit') ? '💳' :
                                                            config.method === 'link' ? '🔗' : '💰'}
                                    </span>
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            {paymentLabels[config.method] || config.display_name || config.method}
                                        </p>
                                        {config.method.includes('credit') && (
                                            <p className="text-xs text-gray-500">
                                                {config.method === 'credit_1' ? 'Sin cuotas' :
                                                    config.method === 'credit_3' ? '3 cuotas mensuales' :
                                                        config.method === 'credit_6' ? '6 cuotas mensuales' :
                                                            config.method === 'credit_12' ? '12 cuotas mensuales' : ''}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.5"
                                        value={config.surcharge}
                                        onChange={(e) => handleSurchargeChange(config.method, e.target.value)}
                                        className="w-20 px-3 py-2 text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                    <span className="text-gray-600 font-medium">%</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 flex items-center gap-4">
                        <button
                            onClick={handleSavePayments}
                            disabled={saving}
                            className="btn btn-primary"
                        >
                            {saving ? 'Guardando...' : '💾 Guardar Cambios'}
                        </button>
                        {message && activeTab === 'payments' && (
                            <span className={message.includes('✅') ? 'text-success-600' : 'text-danger-600'}>
                                {message}
                            </span>
                        )}
                    </div>

                    {/* Summary Cards */}
                    <div className="card p-6 mt-6 bg-gray-50">
                        <h3 className="font-semibold text-gray-900 mb-4">📊 Resumen de Recargos</h3>
                        <div className="grid grid-cols-4 gap-4 text-center">
                            <div className="p-3 bg-white rounded-lg">
                                <p className="text-sm text-gray-500">Sin recargo</p>
                                <p className="text-2xl font-bold text-success-600">
                                    {paymentConfigs.filter(c => c.surcharge === 0).length}
                                </p>
                            </div>
                            <div className="p-3 bg-white rounded-lg">
                                <p className="text-sm text-gray-500">1% - 10%</p>
                                <p className="text-2xl font-bold text-warning-600">
                                    {paymentConfigs.filter(c => c.surcharge > 0 && c.surcharge <= 10).length}
                                </p>
                            </div>
                            <div className="p-3 bg-white rounded-lg">
                                <p className="text-sm text-gray-500">11% - 25%</p>
                                <p className="text-2xl font-bold text-orange-600">
                                    {paymentConfigs.filter(c => c.surcharge > 10 && c.surcharge <= 25).length}
                                </p>
                            </div>
                            <div className="p-3 bg-white rounded-lg">
                                <p className="text-sm text-gray-500">Más del 25%</p>
                                <p className="text-2xl font-bold text-danger-600">
                                    {paymentConfigs.filter(c => c.surcharge > 25).length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsScreen;
