import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../utils/paymentCalculator';

const MONTHS = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const MonthlyReport = () => {
    const [period, setPeriod] = useState({
        month: new Date().getMonth(),
        year: new Date().getFullYear()
    });
    const [data, setData] = useState({
        financial: [],
        byCategory: [],
        topProducts: []
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadReport();
    }, [period]);

    const loadReport = async () => {
        setLoading(true);
        try {
            // Note: month is 0-indexed in JS but our backend expects 0-indexed too?
            // Yes, Date(year, month, 1) uses 0-indexed.
            const result = await window.api.getMonthlyReport(period.month, period.year);
            setData(result);
        } catch (error) {
            console.error('Error loading report:', error);
            // alert('Error al cargar reporte'); // Fail silently or show error UI
        } finally {
            setLoading(false);
        }
    };

    // Calculate aggregated totals
    const getFinancialSummary = (currency) => {
        const item = data.financial.find(f => f.currency === currency);
        if (!item) return { revenue: 0, cost: 0, profit: 0, margin: 0 };

        const profit = item.revenue - item.total_cost;
        const margin = item.revenue > 0 ? (profit / item.revenue) * 100 : 0;

        return {
            revenue: item.revenue,
            cost: item.total_cost,
            profit: profit,
            margin: margin
        };
    };

    const arsStats = getFinancialSummary('ARS');
    const usdStats = getFinancialSummary('USD');

    return (
        <div className="p-8 h-full flex flex-col overflow-hidden bg-gray-50">
            {/* Header & Controls */}
            <div className="flex-none mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">📈 Reportes Mensuales</h1>
                    <p className="text-gray-500 mt-1">
                        Análisis de desempeño y rentabilidad de tu negocio
                    </p>
                </div>

                <div className="flex gap-3 bg-white p-2 rounded-lg shadow-sm border border-gray-200">
                    <select
                        value={period.month}
                        onChange={(e) => setPeriod({ ...period, month: parseInt(e.target.value) })}
                        className="input border-none focus:ring-0 py-1"
                    >
                        {MONTHS.map((m, i) => (
                            <option key={i} value={i}>{m}</option>
                        ))}
                    </select>
                    <select
                        value={period.year}
                        onChange={(e) => setPeriod({ ...period, year: parseInt(e.target.value) })}
                        className="input border-none focus:ring-0 py-1"
                    >
                        {[2023, 2024, 2025, 2026].map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto min-h-0 pr-2 pb-8 space-y-8">

                {/* 1. Financial KPI Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* ARS Summary */}
                    <div className="card p-6 border-l-4 border-l-primary-500">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-bold text-gray-800">Resumen ARS (Pesos)</h3>
                            <span className="badge badge-primary">ARS</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Ingresos Totales</p>
                                <p className="text-2xl font-bold text-gray-900">{formatCurrency(arsStats.revenue, 'ARS')}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Costo Estimado</p>
                                <p className="text-xl font-medium text-gray-600">{formatCurrency(arsStats.cost, 'ARS')}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Ganancia Bruta</p>
                                <p className={`text-xl font-bold ${arsStats.profit >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                                    {formatCurrency(arsStats.profit, 'ARS')}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Margen</p>
                                <p className={`text-xl font-bold ${arsStats.margin >= 30 ? 'text-success-600' : 'text-primary-600'}`}>
                                    {arsStats.margin.toFixed(1)}%
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* USD Summary */}
                    <div className="card p-6 border-l-4 border-l-success-500">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-bold text-gray-800">Resumen USD (Dólares)</h3>
                            <span className="badge badge-success">USD</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Ingresos Totales</p>
                                <p className="text-2xl font-bold text-gray-900">{formatCurrency(usdStats.revenue, 'USD')}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Costo Estimado</p>
                                <p className="text-xl font-medium text-gray-600">{formatCurrency(usdStats.cost, 'USD')}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Ganancia Bruta</p>
                                <p className={`text-xl font-bold ${usdStats.profit >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                                    {formatCurrency(usdStats.profit, 'USD')}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Margen</p>
                                <p className={`text-xl font-bold ${usdStats.margin >= 30 ? 'text-success-600' : 'text-primary-600'}`}>
                                    {usdStats.margin.toFixed(1)}%
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-96">
                    {/* 2. Top Products */}
                    <div className="card flex flex-col overflow-hidden">
                        <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                            <h3 className="font-bold text-gray-800">🏆 Productos Más Vendidos</h3>
                            <span className="text-xs text-gray-500">Top 10 por cantidad</span>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {data.topProducts.length === 0 ? (
                                <div className="p-8 text-center text-gray-400">No hay datos suficientes</div>
                            ) : (
                                <table className="w-full">
                                    <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                                        <tr>
                                            <th className="px-4 py-2 text-left">Producto</th>
                                            <th className="px-4 py-2 text-right">Cant.</th>
                                            <th className="px-4 py-2 text-right">Ingresos</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {data.topProducts.map((p, i) => (
                                            <tr key={i} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm font-medium text-gray-800">
                                                    {i + 1}. {p.product_name}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-right text-gray-600">{p.quantity}</td>
                                                <td className="px-4 py-3 text-sm text-right font-medium text-success-600">
                                                    ${p.revenue.toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>

                    {/* 3. Sales by Category */}
                    <div className="card flex flex-col overflow-hidden">
                        <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                            <h3 className="font-bold text-gray-800">📦 Ventas por Categoría</h3>
                            <span className="text-xs text-gray-500">Rendimiento por grupo</span>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {data.byCategory.length === 0 ? (
                                <div className="p-8 text-center text-gray-400">No hay datos suficientes</div>
                            ) : (
                                <table className="w-full">
                                    <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                                        <tr>
                                            <th className="px-4 py-2 text-left">Categoría</th>
                                            <th className="px-4 py-2 text-right">Cant.</th>
                                            <th className="px-4 py-2 text-right">Ingresos</th>
                                            <th className="px-4 py-2 text-right">% Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {data.byCategory.map((c, i) => {
                                            // Calculate total revenue across all cats for %
                                            // Note: Mixing currencies here is tricky for %. 
                                            // Ideally we sum everything approximately or just show raw values.
                                            // Let's simplified assuming mostly one currency dominates or just showing raw.
                                            return (
                                                <tr key={i} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{c.category_name || 'Sin Categoría'}</td>
                                                    <td className="px-4 py-3 text-sm text-right text-gray-600">{c.items_sold}</td>
                                                    <td className="px-4 py-3 text-sm text-right font-medium text-primary-600">
                                                        ${c.revenue.toLocaleString()}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-right text-gray-400">
                                                        {((c.sales_count / data.byCategory.reduce((a, b) => a + b.sales_count, 0)) * 100).toFixed(0)}%
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                    <p><strong>💡 Nota sobre los Costos:</strong> Los cálculos de ganancia y margen utilizan el <em>costo actual</em> guardado en la ficha de cada producto. Si cambias el costo de un producto hoy, el reporte recalculará las ganancias históricas con este nuevo valor.</p>
                </div>
            </div>
        </div>
    );
};

export default MonthlyReport;
