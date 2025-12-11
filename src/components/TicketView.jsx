import React from 'react';
import { formatCurrency, formatDate } from '../utils/paymentCalculator';

const TicketView = ({ storeConfig, saleDetails, isPreview = false, printMode = 'thermal' }) => {
    // Dummy data for preview mode
    const dummyItems = [
        { product_name: 'Producto ejemplo 1', quantity: 1, subtotal: 1500, unit_price: 1500 },
        { product_name: 'Producto ejemplo 2', quantity: 2, subtotal: 3000, unit_price: 1500 }
    ];

    const data = isPreview ? {
        items: dummyItems,
        subtotal: 4500,
        surcharge: 450,
        surchargePercent: 10,
        total: 4950,
        currency: 'ARS',
        paymentMethod: 'Efectivo',
        warranty: { enabled: true, months: 1 },
        customerNotes: 'Cliente frecuente',
        id: '000001'
    } : saleDetails;

    if (!data || !storeConfig) return <div className="p-4 text-center text-gray-400">Cargando vista previa...</div>;

    const {
        items,
        subtotal,
        surcharge,
        surchargePercent,
        total,
        currency,
        paymentMethod,
        customerNotes,
        warranty,
        installments,
        id
    } = data;

    const ticketNumber = id || String(Date.now()).slice(-6);
    const dateStr = isPreview ? formatDate(new Date()).split(' ')[0] : formatDate(new Date()).split(' ')[0];
    const timeStr = isPreview ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Print classes based on mode
    // thermal: restrict width to 80mm
    // normal: full width (max-w-none)
    const printWidthClass = printMode === 'normal' ? 'print:max-w-none' : 'print:max-w-[80mm]';

    return (
        <div
            id="ticket-view"
            className={`bg-white p-8 w-full font-mono text-sm leading-tight text-black shadow-none mx-auto max-w-[80mm] ${printWidthClass}`}
            style={{
                fontFamily: '"Courier New", Courier, monospace',
                width: '100%', // Flexible in container
            }}
        >
            {/* Logo */}
            {storeConfig?.logo && (
                <div className="flex justify-center mb-4">
                    <img
                        src={storeConfig.logo}
                        alt="Logo"
                        className="h-16 object-contain grayscale filter"
                    />
                </div>
            )}

            {/* Store Header */}
            <div className="text-center mb-4">
                <h1 className="text-xl font-bold uppercase tracking-wider mb-1">{storeConfig?.name || 'Nombre del Local'}</h1>
                {storeConfig?.address && <div className="text-xs">{storeConfig.address}</div>}
                {storeConfig?.phone && <div className="text-xs">Tel: {storeConfig.phone}</div>}
            </div>

            {/* Date/Ticket Line */}
            <div className="border-t border-b border-dashed border-gray-400 py-2 mb-4 flex justify-between text-xs">
                <div>
                    <div>Fecha:</div>
                    <div>Hora:</div>
                    <div>Ticket #:</div>
                </div>
                <div className="text-right">
                    <div>{dateStr}</div>
                    <div>{timeStr}</div>
                    <div>{ticketNumber}</div>
                </div>
            </div>

            {/* Client Info */}
            {data.client && (
                <div className="border-b border-dashed border-gray-400 pb-2 mb-4 text-xs">
                    <div className="font-bold uppercase">Cliente: {data.client.name}</div>
                    {data.client.identifier && <div>DNI/CUIT: {data.client.identifier}</div>}
                    {data.client.address && <div>Dir: {data.client.address}</div>}
                </div>
            )}

            {/* Items */}
            <div className="mb-4">
                <div className="space-y-2">
                    {items.map((item, index) => (
                        <div key={index} className="flex justify-between items-start">
                            <div className="flex-1 pr-2 uppercase">
                                {item.product_name}
                                {item.quantity > 1 && <span className="font-bold ml-1">x{item.quantity}</span>}
                            </div>
                            <div className="text-right whitespace-nowrap">
                                {formatCurrency(item.subtotal, currency || 'ARS')}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Totals */}
            <div className="border-t border-dashed border-gray-400 pt-2 mb-4">
                <div className="flex justify-between text-xs">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(subtotal, currency || 'ARS')}</span>
                </div>

                {surcharge > 0 && (
                    <div className="flex justify-between text-xs my-1 text-gray-600">
                        <span>Recargo ({surchargePercent}%):</span>
                        <span>{formatCurrency(surcharge, currency || 'ARS')}</span>
                    </div>
                )}

                <div className="flex justify-between text-lg font-bold mt-2 pt-1">
                    <span>TOTAL:</span>
                    <span>{formatCurrency(total, currency || 'ARS')}</span>
                </div>

                {installments > 1 && (
                    <div className="text-right text-xs mt-1">
                        ({installments} cuotas de {formatCurrency(total / installments, currency || 'ARS')})
                    </div>
                )}
            </div>

            {/* Info Footer */}
            <div className="border-t border-dashed border-gray-400 pt-2 mb-6 text-xs space-y-1">
                <div className="flex justify-between">
                    <span>Método de Pago:</span>
                    <span className="uppercase">{paymentMethod ? paymentMethod.replace(/_/g, ' ') : 'Efectivo'}</span>
                </div>
                {warranty?.enabled && (
                    <div className="flex justify-between">
                        <span>Garantía:</span>
                        <span>
                            {warranty.months < 1
                                ? `${Math.round(warranty.months * 4)} Semanas`
                                : `${warranty.months} ${warranty.months === 1 ? 'mes' : 'meses'}`
                            }
                        </span>
                    </div>
                )}

                {customerNotes && (
                    <div className="mt-2 pt-2">
                        <span className="block mb-1">Notas:</span>
                        <p className="italic">{customerNotes}</p>
                    </div>
                )}
            </div>

            {/* Messages */}
            <div className="text-center text-xs space-y-3 mt-4">
                {storeConfig?.message && (
                    <div className="font-medium whitespace-pre-wrap">
                        {storeConfig.message}
                    </div>
                )}

                {storeConfig?.return_policy && (
                    <div className="text-[10px] text-gray-500 leading-tight px-2 whitespace-pre-wrap">
                        {storeConfig.return_policy}
                    </div>
                )}

                <div className="pt-2">****** GRACIAS POR SU COMPRA ******</div>
            </div>
        </div>
    );
};

export default TicketView;
