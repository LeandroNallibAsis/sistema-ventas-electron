import React, { useState, useEffect } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { formatCurrency } from '../utils/paymentCalculator';

const Dashboard = ({ onNavigate }) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const data = await window.api.getDashboardStats();
            setStats(data);
            setLoading(false);
        } catch (error) {
            console.error('Error loading dashboard stats:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-xl text-gray-500">Cargando estadísticas...</div>
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div className="p-8 space-y-8">
            <h1 className="text-3xl font-bold text-gray-900">👋 Panel Principal</h1>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card p-6 border-l-4 border-primary-500">
                    <h3 className="text-gray-500 text-sm font-medium uppercase">Ventas Hoy</h3>
                    <div className="mt-2 flex justify-between items-end">
                        <div>
                            <span className="text-3xl font-bold text-gray-900">{stats.salesSummary.today?.count || 0}</span>
                            <span className="text-gray-500 ml-2 text-sm">ventas</span>
                        </div>
                        <span className="text-xl font-semibold text-primary-600">
                            {formatCurrency(stats.salesSummary.today?.total || 0, 'ARS')}
                        </span>
                    </div>
                </div>

                <div className="card p-6 border-l-4 border-blue-500">
                    <h3 className="text-gray-500 text-sm font-medium uppercase">Esta Semana</h3>
                    <div className="mt-2 flex justify-between items-end">
                        <div>
                            <span className="text-3xl font-bold text-gray-900">{stats.salesSummary.week?.count || 0}</span>
                            <span className="text-gray-500 ml-2 text-sm">ventas</span>
                        </div>
                        <span className="text-xl font-semibold text-blue-600">
                            {formatCurrency(stats.salesSummary.week?.total || 0, 'ARS')}
                        </span>
                    </div>
                </div>

                <div className="card p-6 border-l-4 border-success-500">
                    <h3 className="text-gray-500 text-sm font-medium uppercase">Este Mes</h3>
                    <div className="mt-2 flex justify-between items-end">
                        <div>
                            <span className="text-3xl font-bold text-gray-900">{stats.salesSummary.month?.count || 0}</span>
                            <span className="text-gray-500 ml-2 text-sm">ventas</span>
                        </div>
                        <span className="text-xl font-semibold text-success-600">
                            {formatCurrency(stats.salesSummary.month?.total || 0, 'ARS')}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Income vs Expense Chart */}
                <div className="card p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Ingresos vs Egresos (Últimos 7 días)</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={stats.last7Days}
                                margin={{
                                    top: 5,
                                    right: 30,
                                    left: 20,
                                    bottom: 5,
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip
                                    formatter={(value) => formatCurrency(value, 'ARS')}
                                    labelStyle={{ color: '#374151' }}
                                />
                                <Legend />
                                <Bar dataKey="income" name="Ingresos" fill="#10B981" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="expense" name="Egresos" fill="#EF4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Products & Low Stock */}
                <div className="space-y-8">
                    {/* Low Stock Alerts */}
                    <div className="card p-6 border border-danger-100 bg-red-50">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-danger-800 flex items-center gap-2">
                                ⚠️ Alertas de Stock Bajo
                            </h3>
                            <button
                                onClick={() => onNavigate('inventory')}
                                className="text-sm text-danger-600 hover:text-danger-800 font-medium underline"
                            >
                                Ir al Inventario
                            </button>
                        </div>
                        {stats.lowStock.length === 0 ? (
                            <p className="text-green-600 font-medium">✅ Todo el stock está en niveles óptimos</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-danger-200">
                                            <th className="pb-2 text-sm font-semibold text-danger-700">Producto</th>
                                            <th className="pb-2 text-sm font-semibold text-danger-700 text-right">Stock</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-danger-200">
                                        {stats.lowStock.map((product) => (
                                            <tr key={product.id}>
                                                <td className="py-2 text-sm text-gray-800">
                                                    <span className="block font-medium">{product.name}</span>
                                                    <span className="text-xs text-gray-500">{product.category_name}</span>
                                                </td>
                                                <td className="py-2 text-sm font-bold text-danger-600 text-right">
                                                    {product.stock}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Top Selling Products */}
                    <div className="card p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">🏆 Productos Más Vendidos</h3>
                        {stats.topProducts.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">Aún no hay datos de ventas</p>
                        ) : (
                            <div className="space-y-4">
                                {stats.topProducts.map((product, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className={`
                                                flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold
                                                ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                                    index === 1 ? 'bg-gray-100 text-gray-700' :
                                                        index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-50 text-gray-500'}
                                            `}>
                                                {index + 1}
                                            </span>
                                            <span className="text-sm font-medium text-gray-700 truncate max-w-[200px]" title={product.product_name}>
                                                {product.product_name}
                                            </span>
                                        </div>
                                        <span className="text-sm font-semibold text-primary-600">
                                            {product.total_sold} un.
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
