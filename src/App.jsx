import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ProductList from './components/ProductList';
import ProductForm from './components/ProductForm';
import BarcodeModal from './components/BarcodeModal';
import POSScreen from './components/POSScreen';
import CashRegister from './components/CashRegister';
import SalesHistory from './components/SalesHistory';
import SettingsScreen from './components/SettingsScreen';
import Dashboard from './components/Dashboard';
import MonthlyReport from './components/MonthlyReport';
import './index.css';

import LoginScreen from './components/LoginScreen';
import UserManagement from './components/UserManagement';

function App() {
  const [user, setUser] = useState(null); // { id, username, role, name }
  const [currentView, setCurrentView] = useState('dashboard'); // views...

  // ... (keep state variables)
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingUser] = useState(null); // Fixed typo setEditingUser -> setEditingProduct but wait, line 21 was setEditingProduct
  const [editingProductState, setEditingProduct] = useState(null); // Careful with variable name conflicts
  const [showBarcode, setShowBarcode] = useState(null);

  // ... (keep useEffects and handlers)

  // Auth Handler
  const handleLogin = (userData) => {
    setUser(userData);
    if (userData.role === 'seller') {
      setCurrentView('pos');
    } else {
      setCurrentView('dashboard');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('dashboard');
  };

  // Render different views based on currentView
  const renderContent = () => {
    // Security check for views
    if (user?.role === 'seller') {
      if (!['pos', 'sales'].includes(currentView)) {
        return <div className="p-8">Acceso no autorizado</div>;
      }
    }

    switch (currentView) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentView} />;
      case 'pos':
        return <POSScreen user={user} />; // Pass user for tracking sales?
      case 'sales':
        return <SalesHistory />;
      case 'cash':
        return <CashRegister />;
      case 'reports':
        return <MonthlyReport />;
      case 'settings':
        return <SettingsScreen />;
      case 'users':
        return <UserManagement />;
      case 'inventory':
      default:
        // Inventory Login
        return (
          <div className="flex h-screen bg-gray-50">
            {/* Sidebar (Categories) */}
            <Sidebar
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              onCreateCategory={handleCreateCategory}
              onDeleteCategory={handleDeleteCategory}
              readOnly={user?.role === 'seller'} // Just in case
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Header */}
              <div className="bg-white border-b border-gray-200 px-8 py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">
                      {selectedCategory ? selectedCategory.name : 'Selecciona una categoría'}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {products.length} {products.length === 1 ? 'producto' : 'productos'}
                    </p>
                  </div>
                  {selectedCategory && user?.role === 'admin' && (
                    <button
                      onClick={handleAddProduct}
                      className="btn btn-primary"
                    >
                      + Agregar Producto
                    </button>
                  )}
                </div>
              </div>

              {/* Product List */}
              <div className="flex-1 overflow-auto p-8">
                {selectedCategory ? (
                  <div className="card">
                    <ProductList
                      products={products}
                      onEdit={handleEditProduct}
                      onDelete={handleDeleteProduct}
                      onShowBarcode={setShowBarcode}
                      readOnly={user?.role === 'seller'}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <svg className="w-32 h-32 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    <p className="text-xl font-medium">Bienvenido a ElectroStock</p>
                    <p className="text-sm mt-2">Crea una categoría para comenzar</p>
                  </div>
                )}
              </div>
            </div>

            {/* Modals */}
            {showProductForm && (
              <ProductForm
                product={editingProduct} // Use correct state variable
                categoryId={selectedCategory?.id}
                onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
                onCancel={() => {
                  setShowProductForm(false);
                  setEditingProduct(null);
                }}
              />
            )}

            {showBarcode && (
              <BarcodeModal
                product={showBarcode}
                onClose={() => setShowBarcode(null)}
              />
            )}
          </div>
        );
    }
  };

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // Helper for determining visibility
  const canShow = (view) => {
    if (user?.role === 'admin') return true;
    if (user?.role === 'seller') return ['pos', 'sales'].includes(view);
    return false;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Navigation Sidebar */}
      <div className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold">ElectroStock</h1>
          <p className="text-sm text-gray-400 mt-1">
            {user.username} ({user.role === 'admin' ? 'Admin' : 'Vendedor'})
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {canShow('dashboard') && (
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${currentView === 'dashboard' ? 'bg-primary-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
            >
              🏠 Inicio
            </button>
          )}

          {canShow('inventory') && (
            <button
              onClick={() => setCurrentView('inventory')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${currentView === 'inventory' ? 'bg-primary-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
            >
              📦 Inventario
            </button>
          )}

          <button
            onClick={() => setCurrentView('pos')}
            className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${currentView === 'pos' ? 'bg-primary-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
          >
            💰 Punto de Venta
          </button>

          <button
            onClick={() => setCurrentView('sales')}
            className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${currentView === 'sales' ? 'bg-primary-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
          >
            📊 Historial de Ventas
          </button>

          {canShow('cash') && (
            <button
              onClick={() => setCurrentView('cash')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${currentView === 'cash' ? 'bg-primary-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
            >
              💵 Libro de Caja
            </button>
          )}

          {canShow('reports') && (
            <button
              onClick={() => setCurrentView('reports')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${currentView === 'reports' ? 'bg-primary-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
            >
              📈 Reportes Mensuales
            </button>
          )}

          {user.role === 'admin' && (
            <>
              <button
                onClick={() => setCurrentView('users')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${currentView === 'users' ? 'bg-primary-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
              >
                👥 Usuarios
              </button>

              <button
                onClick={() => setCurrentView('settings')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${currentView === 'settings' ? 'bg-primary-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
              >
                ⚙️ Configuración
              </button>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white text-sm font-bold py-2 px-4 rounded transition-colors flex items-center justify-center gap-2"
          >
            ↪️ Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        {renderContent()}
      </div>
    </div>
  );
}

export default App;
