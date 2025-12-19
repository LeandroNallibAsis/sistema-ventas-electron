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

    const handlePrint = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const imgData = canvas.toDataURL('image/png');
        const printWindow = window.open('', '_blank');

        printWindow.document.write(`
            <html>
                <head>
                    <title>Imprimir Etiqueta - ${product.name}</title>
                    <style>
                        body {
                            margin: 0;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            height: 100vh;
                            font-family: sans-serif;
                        }
                        .label-container {
                            width: 60mm;
                            height: 40mm;
                            border: 1px dashed #ccc;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            justify-content: center;
                            padding: 2mm;
                            text-align: center;
                            box-sizing: border-box;
                        }
                        .product-name {
                            font-size: 10pt;
                            font-weight: bold;
                            margin-bottom: 1mm;
                            white-space: nowrap;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            width: 100%;
                        }
                        .barcode-img {
                            width: 100%;
                            height: auto;
                            max-height: 20mm;
                        }
                        .price {
                            font-size: 12pt;
                            font-weight: bold;
                            margin-top: 1mm;
                        }
                        @media print {
                            body { margin: 0; }
                            .label-container { border: none; }
                            @page {
                                size: 60mm 40mm;
                                margin: 0;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="label-container">
                        <div class="product-name">${product.name}</div>
                        <img src="${imgData}" class="barcode-img" />
                        <div class="price">$${product.price?.toFixed(2)}</div>
                    </div>
                    <script>
                        setTimeout(() => {
                            window.print();
                            window.close();
                        }, 500);
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    if (!product) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900">Código de Barras</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        ✕
                    </button>
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
                    <div className="flex flex-col gap-3">
                        <div className="flex gap-3">
                            <button onClick={handlePrint} className="btn btn-primary flex-1 flex items-center justify-center gap-2">
                                🖨️ Imprimir Etiqueta
                            </button>
                            <button onClick={handleDownload} className="btn btn-secondary flex-1">
                                💾 Descargar PNG
                            </button>
                        </div>
                        <button onClick={onClose} className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 w-full">
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BarcodeModal;
