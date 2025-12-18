# Guía de Integración de APIs - ElectroStock

**Versión:** 1.0
**Fecha:** 8 de Diciembre de 2025

## 1. Arquitectura de Comunicación IPC

ElectroStock utiliza **IPC (Inter-Process Communication)** de Electron para comunicar el Frontend (React) con el Backend (Node.js/SQLite). La API está expuesta mediante `contextBridge` en el archivo `preload.js`.

### 1.1 Flujo de Comunicación
```
React Component → window.api.method() → IPC Bridge (preload.js) → ipcRenderer.invoke() → ipcMain.handle() (main.js) → DatabaseManager → SQLite
```

## 2. Endpoints IPC Disponibles

### 2.1 Productos (Products)
#### `getProducts(categoryId)`
Obtiene todos los productos de una categoría.
**Parámetros:**
- `categoryId` (Integer): ID de la categoría

**Respuesta:**
```json
[
  {
    "id": 1,
    "barcode": "7891234567890",
    "name": "Cable USB-C",
    "price_cost": 500,
    "price": 1200,
    "stock": 45,
    "category_id": 1,
    "category_name": "Cables"
  }
]
```

#### `searchProducts(query)`
Busca productos por nombre o código de barras.
**Parámetros:**
- `query` (String): Término de búsqueda

**Respuesta:** Array de productos (mismo formato que `getProducts`)

#### `createProduct(productData)`
Crea un nuevo producto.
**Parámetros:**
```json
{
  "barcode": "7891234567890",
  "name": "Cable USB-C",
  "price_cost": 500,
  "price": 1200,
  "stock": 50,
  "category_id": 1
}
```

**Respuesta:** `{ id: 123 }` (ID del producto creado)

### 2.2 Ventas (Sales)
#### `createSale(saleData, items)`
Registra una nueva venta.
**Parámetros:**
```json
{
  "saleData": {
    "payment_method": "cash_ars",
    "currency": "ARS",
    "subtotal": 5000,
    "surcharge": 0,
    "total": 5000,
    "installments": 1,
    "customer_notes": "Cliente frecuente",
    "warranty_enabled": true,
    "warranty_months": 3,
    "client_id": 5
  },
  "items": [
    {
      "product_id": 1,
      "product_name": "Cable USB-C",
      "category_name": "Cables",
      "quantity": 2,
      "unit_price": 1200,
      "subtotal": 2400
    }
  ]
}
```

**Respuesta:** `saleId` (Integer)

### 2.3 Clientes (Clients)
#### `getClients()`
Obtiene todos los clientes.

#### `searchClients(query)`
Busca clientes por nombre, DNI o teléfono.

#### `createClient(clientData)`
**Parámetros:**
```json
{
  "name": "Juan Pérez",
  "type": "individual",
  "identifier": "12345678",
  "phone": "+5491123456789",
  "email": "juan@example.com",
  "address": "Av. Corrientes 1234",
  "notes": "Cliente VIP"
}
```

### 2.4 Autenticación (Auth)
#### `login(username, password)`
**Parámetros:**
- `username` (String)
- `password` (String)

**Respuesta:**
```json
{
  "id": 1,
  "username": "admin",
  "role": "admin",
  "name": "Administrador"
}
```

## 3. Manejo de Errores
Todos los métodos IPC devuelven Promesas. Los errores se propagan al Frontend:
```javascript
try {
  const result = await window.api.createSale(saleData, items);
} catch (error) {
  console.error('Error:', error.message);
}
```
