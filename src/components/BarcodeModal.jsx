import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

const BarcodeModal = ({ product, onClose }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (product && canvasRef.current) {
            try {
                // Generate barcode using product ID
                JsBarcode(canvasRef.current, String(product.id).padStart(8, '0'), {
                    format: 'CODE128',
                    width: 2,
                    height: 100,
                    displayValue: true,
                    fontSize: 14,
                    margin: 10,
                });
            } catch (error) {
                console.error('Error generating barcode:', error);
            }
        }
    }, [product]);

    const handleDownload = () => {
        if (canvasRef.current) {
            const canvas = canvasRef.current;
            const link = document.createElement('a');
            link.download = `barcode-${product.name.replace(/\s+/g, '-')}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        }
    };

    if (!product) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">Código de Barras</h2>
                </div>

                <div className="p-6">
                    {/* Product Info */}
                    <div className="mb-6 text-center">
                        <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                        <p className="text-2xl font-bold text-primary-600 mt-2">
                            ${product.price?.toFixed(2)}
                        </p>
                        {product.supplier && (
                            <p className="text-sm text-gray-500 mt-1">{product.supplier}</p>
                        )}
                    </div>

                    {/* Barcode */}
                    <div className="flex justify-center mb-6 bg-white p-4 rounded-lg border border-gray-200">
                        <canvas ref={canvasRef}></canvas>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button onClick={handleDownload} className="btn btn-primary flex-1">
                            🖨️ Descargar PNG
                        </button>
                        <button onClick={onClose} className="btn btn-secondary">
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BarcodeModal;
