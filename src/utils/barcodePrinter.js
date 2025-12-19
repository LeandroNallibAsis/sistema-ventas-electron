/**
 * Generates the HTML string for bulk barcode printing.
 * @param {Array} products - Array of { name, price, barcodeImage }
 * @returns {string} HTML string
 */
export const generateBulkPrintHTML = (products) => {
    const labelsHTML = products.map(p => `
        <div class="label-container">
            <div class="product-name">${p.name}</div>
            <img src="${p.barcodeImage}" class="barcode-img" />
            <div class="price">$${p.price.toFixed(2)}</div>
        </div>
    `).join('');

    return `
        <html>
            <head>
                <title>Imprimir Etiquetas de Productos</title>
                <style>
                    body {
                        margin: 0;
                        padding: 10mm;
                        font-family: sans-serif;
                    }
                    .grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fill, 60mm);
                        gap: 5mm;
                        justify-content: center;
                    }
                    .label-container {
                        width: 60mm;
                        height: 40mm;
                        border: 1px solid #eee;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        padding: 2mm;
                        text-align: center;
                        box-sizing: border-box;
                        page-break-inside: avoid;
                    }
                    .product-name {
                        font-size: 9pt;
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
                        font-size: 10pt;
                        font-weight: bold;
                        margin-top: 1mm;
                    }
                    @media print {
                        body { padding: 0; }
                        .label-container { border: 1px solid #eee; } /* Keep border for easier cutting if needed, or remove */
                        @page {
                            margin: 10mm;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="grid">
                    ${labelsHTML}
                </div>
                <script>
                    window.onload = () => {
                        window.print();
                        // Optional: window.close(); 
                    };
                </script>
            </body>
        </html>
    `;
};
