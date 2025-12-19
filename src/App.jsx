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
import ClientManagement from './components/ClientManagement';
import SupplierManagement from './components/SupplierManagement';
import PurchaseManagement from './components/PurchaseManagement';
import NotesBoard from './components/NotesBoard';
import QuotesManager from './components/QuotesManager';
import JsBarcode from 'jsbarcode';
import { generateBulkPrintHTML } from './utils/barcodePrinter';

function App() {
  const [user, setUser] = useState(null); // { id, username, role, name }
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'inventory', 'pos', 'sales', 'cash', 'reports', 'settings', 'users', 'clients', 'suppliers', 'purchases', 'quotes'

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showBarcode, setShowBarcode] = useState(null);
  const [notifications, setNotifications] = useState([]); // { id, title, message, type: 'warning'|'info'|'success'|'error', duration }
  const notifiedNotesRef = React.useRef(new Set());

  // Notification Helper
  const addNotification = (title, message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random();
    setNotifications(prev => [...prev, { id, title, message, type, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };


  // Alerts & Reminders Check
  useEffect(() => {
    if (!user) return;

    const checkAlerts = async () => {
      try {
        // 1. Check Reminders
        const reminders = await window.api.getPendingReminders();
        reminders.forEach(note => {
          if (!notifiedNotesRef.current.has(note.id)) {
            addNotification('Recordatorio 📌', note.title, 'info', 10000);
            notifiedNotesRef.current.add(note.id);
          }
        });

        // 2. Check Low Stock (Only on startup)
        // We can check if we just loaded
      } catch (error) {
        console.error("Error checking alerts", error);
      }
    };

    const checkLowStock = async () => {
      try {
        const stats = await window.api.getDashboardStats();
        if (stats.lowStock && stats.lowStock.length > 0) {
          addNotification('Stock Bajo ⚠️', `Hay ${stats.lowStock.length} productos con stock bajo.`, 'warning', 10000);
        }
      } catch (e) { console.error(e) }
    };

    checkAlerts(); // Immediate check on mount/login
    checkLowStock();

    const interval = setInterval(checkAlerts, 60000); // Check every minute
    return () => clearInterval(interval);

  }, [user]);

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Load products when category changes
  useEffect(() => {
    if (selectedCategory && currentView === 'inventory') {
      loadProducts(selectedCategory.id);
    } else {
      setProducts([]);
    }
  }, [selectedCategory, currentView]);

  const loadCategories = async () => {
    try {
      const cats = await window.api.getCategories();
      setCategories(cats);

      // Auto-select first category if none selected
      if (!selectedCategory && cats.length > 0) {
        setSelectedCategory(cats[0]);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      alert('Error al cargar categorías');
    }
  };

  const loadProducts = async (categoryId) => {
    try {
      const prods = await window.api.getProducts(categoryId);
      setProducts(prods);
    } catch (error) {
      console.error('Error loading products:', error);
      alert('Error al cargar productos');
    }
  };

  const handleCreateCategory = async (name) => {
    try {
      const newCategory = await window.api.createCategory(name);
      await loadCategories();
      setSelectedCategory(newCategory);
    } catch (error) {
      console.error('Error creating category:', error);
      alert('Error al crear categoría. Puede que ya exista.');
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      await window.api.deleteCategory(id);
      await loadCategories();
      setSelectedCategory(null);
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Error al eliminar categoría');
    }
  };

  const handleCreateProduct = async (productData) => {
    try {
      await window.api.createProduct(productData);
      await loadProducts(selectedCategory.id);
      setShowProductForm(false);
      setEditingProduct(null);
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Error al crear producto');
    }
  };

  const handleUpdateProduct = async (productData) => {
    try {
      await window.api.updateProduct(editingProduct.id, productData);
      await loadProducts(selectedCategory.id);
      setShowProductForm(false);
      setEditingProduct(null);
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Error al actualizar producto');
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      await window.api.deleteProduct(id);
      await loadProducts(selectedCategory.id);
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error al eliminar producto');
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowProductForm(true);
  };

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

  const handlePrintBulkLabels = () => {
    if (!products || products.length === 0) {
      alert('No hay productos para imprimir');
      return;
    }

    const tempCanvas = document.createElement('canvas');
    const productsWithImages = products.map(p => {
      try {
        JsBarcode(tempCanvas, String(p.id).padStart(8, '0'), {
          format: 'CODE128',
          width: 2,
          height: 60,
          displayValue: true
        });
        return {
          name: p.name,
          price: p.price,
          barcodeImage: tempCanvas.toDataURL('image/png')
        };
      } catch (error) {
        console.error('Error generating barcode for product:', p.name, error);
        return null;
      }
    }).filter(p => p !== null);

    const htmlContent = generateBulkPrintHTML(productsWithImages);
    const printWindow = window.open('', '_blank');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // Helper for determining visibility
  const canShow = (view) => {
    if (user?.role === 'admin') return true;
    if (user?.role === 'seller') return ['pos', 'sales', 'clients', 'notes', 'quotes'].includes(view);
    return false;
  };

  // Render different views based on currentView
  const renderContent = () => {
    // Security check for views
    if (user?.role === 'seller') {
      if (!['pos', 'sales', 'clients', 'notes', 'quotes'].includes(currentView)) { // Allow clients for seller
        return <div className="p-8">Acceso no autorizado</div>;
      }
    }

    switch (currentView) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentView} />;

      case 'pos':
        return <POSScreen user={user} />;

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
      case 'clients':
        return <ClientManagement />;
      case 'suppliers':
        return <SupplierManagement />;
      case 'purchases':
        return <PurchaseManagement />;

      case 'notes':
        return <NotesBoard />;

      case 'quotes':
        return <QuotesManager />;

      case 'inventory':
      default:
        return (
          <div className="flex flex-1 h-full bg-gray-50 overflow-hidden">
            {/* Sidebar (Categories) */}
            <Sidebar
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              onCreateCategory={handleCreateCategory}
              onDeleteCategory={handleDeleteCategory}
              readOnly={user?.role === 'seller'}
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
                    <div className="flex gap-3">
                      <button
                        onClick={handlePrintBulkLabels}
                        className="btn btn-secondary flex items-center gap-2"
                        title="Imprimir etiquetas de todos los productos de esta categoría"
                      >
                        🏷️ Imprimir Etiquetas
                      </button>
                      <button
                        onClick={handleAddProduct}
                        className="btn btn-primary"
                      >
                        + Agregar Producto
                      </button>
                    </div>
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <p className="text-xl">Selecciona una categoría del panel izquierdo</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
    }
  };

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 font-sans text-gray-900">
      {/* Sidebar Navigation */}
      <nav className="bg-gray-900 w-64 flex-shrink-0 flex flex-col py-6 gap-2 shadow-xl z-50 items-start">
        <div className="flex items-center justify-start gap-3 w-full px-6 mb-6">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex-shrink-0 flex items-center justify-center shadow-lg shadow-blue-900/50">
            <span className="text-white font-bold text-lg">ES</span>
          </div>
          <span className="text-white font-bold text-xl whitespace-nowrap">ElectroStock</span>
        </div>

        {[
          { id: 'dashboard', icon: '📊', label: 'Panel Principal', show: true },
          { id: 'inventory', icon: '📦', label: 'Inventario', show: true },
          { id: 'pos', icon: '🛒', label: 'Punto de Venta', show: canShow('pos') },
          { id: 'sales', icon: '📜', label: 'Historial Ventas', show: canShow('sales') },
          { id: 'cash', icon: '💵', label: 'Caja Diaria', show: canShow('cash') },
          { id: 'clients', icon: '👥', label: 'Clientes', show: canShow('clients') },
          { id: 'quotes', icon: '📋', label: 'Presupuestos', show: canShow('quotes') },
          { id: 'suppliers', icon: '🚚', label: 'Proveedores', show: canShow('suppliers') },
          { id: 'purchases', icon: '🛍️', label: 'Compras', show: canShow('purchases') },
          { id: 'notes', icon: '📌', label: 'Pizarra de Notas', show: canShow('notes') },
          { id: 'reports', icon: '📈', label: 'Reportes', show: canShow('reports') },
          { id: 'users', icon: '🔐', label: 'Usuarios', show: canShow('users') },
          { id: 'settings', icon: '⚙️', label: 'Configuración', show: canShow('settings') },
        ].map(item => item.show && (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={`
              relative flex items-center h-12 rounded-xl transition-all duration-200 mx-3 group w-[calc(100%-1.5rem)] px-4
              ${currentView === item.id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'}
            `}
          >
            <span className="text-xl flex-shrink-0">{item.icon}</span>
            <span className="ml-3 font-medium whitespace-nowrap overflow-hidden">
              {item.label}
            </span>
          </button>
        ))}

        <div className="mt-auto w-full px-3">
          <button
            onClick={handleLogout}
            className="flex items-center h-12 rounded-xl transition-all duration-200 w-full group text-gray-400 hover:bg-red-900/20 hover:text-red-500 px-4"
            title="Cerrar Sesión"
          >
            <span className="text-xl flex-shrink-0">🚪</span>
            <span className="ml-3 font-medium whitespace-nowrap overflow-hidden">
              Cerrar Sesión
            </span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative h-full">
        {renderContent()}

        {/* Modals outside router (if any global) */}
        {showProductForm && (
          <ProductForm
            onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
            onCancel={() => { setShowProductForm(false); setEditingProduct(null); }}
            initialData={editingProduct}
            categories={categories}
            selectedCategoryId={selectedCategory?.id}
          />
        )}

        {showBarcode && (
          <BarcodeModal
            product={showBarcode}
            onClose={() => setShowBarcode(null)}
          />
        )}
      </main>

      {/* Notifications Toast Container */}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {notifications.map(n => (
          <div
            key={n.id}
            className={`
              pointer-events-auto p-4 rounded-lg shadow-lg max-w-sm border-l-4 animate-slide-in
              ${n.type === 'warning' ? 'bg-orange-50 border-orange-500 text-orange-800' :
                n.type === 'error' ? 'bg-red-50 border-red-500 text-red-800' :
                  n.type === 'success' ? 'bg-green-50 border-green-500 text-green-800' :
                    'bg-blue-50 border-blue-500 text-blue-800'}
            `}
          >
            <div className="flex justify-between items-start">
              <h4 className="font-bold text-sm mb-1">{n.title}</h4>
              <button onClick={() => removeNotification(n.id)} className="text-gray-400 hover:text-gray-600 ml-2">×</button>
            </div>
            <p className="text-sm opacity-90">{n.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
