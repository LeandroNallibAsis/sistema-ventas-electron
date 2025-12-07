import React, { useEffect, useState } from 'react';
import { formatCurrency, formatDate } from '../utils/paymentCalculator';
import TicketView from './TicketView';

const ReceiptModal = ({ saleDetails, onClose }) => {
    const [storeConfig, setStoreConfig] = useState(null);
    const [whatsappNumber, setWhatsappNumber] = useState('+54'); // Default Argentina prefix
    const [printMode, setPrintMode] = useState('thermal'); // 'thermal' | 'normal'

    useEffect(() => {
        loadStoreConfig();
    }, []);

    const loadStoreConfig = async () => {
        try {
            const config = await window.api.getStoreConfig();
            // Map DB keys to component props
            setStoreConfig({
                name: config.store_name,
                address: config.store_address,
                phone: config.store_phone,
                logo: config.store_logo,
                message: config.receipt_message,
                return_policy: config.return_policy,
                whatsappMessage: config.whatsapp_message
            });
        } catch (error) {
            console.error('Error loading store config:', error);
        }
    };

    const handlePrint = (mode) => {
        setPrintMode(mode);
        // Delay needed for state update and render
        setTimeout(() => {
            window.print();
        }, 100);
    };

    const handleWhatsApp = () => {
        if (!whatsappNumber) return;

        let cleanNumber = whatsappNumber.replace(/\D/g, '');

        // Build detailed receipt message
        // Items list
        const itemsList = saleDetails.items.map(item =>
            `${item.quantity} x ${item.product_name} (${formatCurrency(item.unit_price, saleDetails.currency)}) = ${formatCurrency(item.subtotal, saleDetails.currency)}`
        ).join('\n');

        const dateStr = new Date().toLocaleDateString('es-AR');

        // Payment & Installments info
        let paymentInfo = `Pago: ${saleDetails.paymentMethod}`;
        if (saleDetails.installments > 1) {
            const installmentAmount = saleDetails.total / saleDetails.installments;
            paymentInfo += `\nCuotas: ${saleDetails.installments} de ${formatCurrency(installmentAmount, saleDetails.currency)}`;
        }

        // Custom intro/outro from settings or defaults
        const header = `*${storeConfig?.name || 'TU NEGOCIO'}*\n${storeConfig?.address || ''}`;
        const footer = storeConfig?.whatsappMessage || '¡Gracias por su compra!';

        // Assemble full message
        const message = `${header}

📅 ${dateStr}
🧾 Ticket #${saleDetails.id || '?'}

----------------
*DETALLE DE COMPRA*
----------------
${itemsList}
----------------
Subtotal: ${formatCurrency(saleDetails.subtotal, saleDetails.currency)}
${saleDetails.surcharge > 0 ? `Recargo: ${formatCurrency(saleDetails.surcharge, saleDetails.currency)}\n` : ''}
*TOTAL: ${formatCurrency(saleDetails.total, saleDetails.currency)}*

${paymentInfo}

${footer}`;

        const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;

        // Use Electron shell to open in default browser/app
        if (window.api && window.api.openExternal) {
            window.api.openExternal(url);
        } else {
            window.open(url, '_blank');
        }
    };

    if (!saleDetails) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in print:p-0 print:bg-white print:static print:block">
            {/* Modal Container */}
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md flex flex-col max-h-[90vh] print:shadow-none print:w-full print:max-w-none print:h-auto print:rounded-none">

                {/* Header Actions (No print) */}
                <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg print:hidden">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <span>🧾</span> Ticket Generado
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Ticket View Area */}
                <div className="overflow-y-auto p-6 bg-gray-100 print:p-0 print:bg-white print:overflow-visible flex justify-center">
                    <TicketView storeConfig={storeConfig} saleDetails={saleDetails} printMode={printMode} />
                </div>

                {/* Footer Actions (No print) */}
                <div className="p-4 bg-white border-t border-gray-200 rounded-b-lg print:hidden">
                    {/* WhatsApp Input */}
                    <div className="mb-4 flex gap-2">
                        <div className="flex-1 relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">📱</span>
                            <input
                                type="text"
                                value={whatsappNumber}
                                onChange={(e) => setWhatsappNumber(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-success-500 focus:border-success-500 outline-none transition-all"
                                placeholder="WhatsApp (ej: +549...)"
                            />
                        </div>
                        <button
                            onClick={handleWhatsApp}
                            className="btn bg-[#25D366] hover:bg-[#128C7E] text-white px-4 py-2 flex items-center gap-2 font-medium"
                        >
                            <span>Enviar</span>
                        </button>
                    </div>

                    {/* Print Options */}
                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <button
                            onClick={() => handlePrint('thermal')}
                            className="bg-gray-800 hover:bg-black text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors"
                        >
                            <span>🖨️</span> Ticket (Termico)
                        </button>
                        <button
                            onClick={() => handlePrint('normal')}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors"
                        >
                            <span>📄</span> Normal (A4)
                        </button>
                    </div>

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-medium transition-colors"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReceiptModal;
