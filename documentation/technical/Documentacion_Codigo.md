# Documentación del Código - ElectroStock

**Versión:** 1.0
**Fecha:** 8 de Diciembre de 2025

## 1. Convenciones de Código

### 1.1 Estilo y Formato
*   **Lenguaje:** JavaScript (ES6+) con JSX para React.
*   **Indentación:** 4 espacios (configurado en `.editorconfig`).
*   **Nombres:**
    *   Componentes React: `PascalCase` (ej: `POSScreen.jsx`)
    *   Funciones/Variables: `camelCase` (ej: `handleCompleteSale`)
    *   Constantes: `UPPER_SNAKE_CASE` (ej: `MAX_STOCK_ALERT`)
    *   Archivos de base de datos: `camelCase` (ej: `database.js`)

### 1.2 Estructura de Archivos
```
proyecto/
├── electron/           # Backend (Main Process)
│   ├── main.js        # Punto de entrada, ventanas, IPC
│   ├── preload.js     # Bridge seguro (contextBridge)
│   └── database.js    # Lógica de BD (SQLite)
├── src/               # Frontend (Renderer Process)
│   ├── components/    # Componentes React
│   ├── utils/         # Helpers (formatters, calculators)
│   ├── App.jsx        # Componente raíz
│   └── index.css      # Estilos globales (Tailwind)
└── documentation/     # Documentación del proyecto
```

## 2. Arquitectura Interna de Módulos

### 2.1 Backend (Electron Main)
**Archivo:** `electron/main.js`
*   **Responsabilidad:** Gestión de ventanas, ciclo de vida de la app, registro de handlers IPC.
*   **Patrón:** Event-Driven (escucha eventos de IPC y delega a `DatabaseManager`).

**Archivo:** `electron/database.js`
*   **Clase:** `DatabaseManager`
*   **Responsabilidad:** Abstracción completa de SQLite. CRUD de todas las entidades.
*   **Patrón:** Repository Pattern (implícito).
*   **Métodos Clave:**
    *   `initializeDatabase()`: Crea tablas si no existen.
    *   `createSale(saleData, items)`: Transacción atómica para ventas.
    *   `getMonthlyReport()`: Consultas agregadas para reportes.

### 2.2 Frontend (React)
**Archivo:** `src/App.jsx`
*   **Responsabilidad:** Enrutamiento manual (state-based), autenticación, layout principal.
*   **Estado Global:** Maneja `user` (sesión actual) y `currentView` (navegación).

**Componentes Principales:**
*   `POSScreen.jsx`: Punto de venta. Maneja carrito, pagos, impresión.
*   `Dashboard.jsx`: Métricas y gráficos (Recharts).
*   `ClientManagement.jsx`: CRUD de clientes.
*   `ProductList.jsx`: Tabla de productos con acciones.

### 2.3 Utilidades
**Archivo:** `src/utils/paymentCalculator.js`
*   Funciones puras para cálculos de recargos, totales y formateo de moneda.
*   Ejemplo: `calculateSurcharge(subtotal, method, percent)`

## 3. Comentarios y Documentación en Código

### 3.1 Comentarios JSDoc (Recomendado)
Para funciones críticas, usar JSDoc:
```javascript
/**
 * Crea una nueva venta en la base de datos
 * @param {Object} saleData - Datos de la venta
 * @param {Array} items - Items de la venta
 * @returns {number} ID de la venta creada
 */
createSale(saleData, items) {
  // ...
}
```

### 3.2 Comentarios Inline
Usar comentarios para explicar **por qué**, no **qué**:
```javascript
// Usamos WAL mode para prevenir corrupción en apagados forzados
this.db.pragma('journal_mode = WAL');
```

## 4. Testing (Pendiente)
Actualmente no hay tests automatizados. Se recomienda:
*   **Unit Tests:** Jest para funciones puras (`paymentCalculator.js`).
*   **Integration Tests:** Probar handlers IPC con mocks de SQLite.
*   **E2E Tests:** Spectron (deprecado) o Playwright para flujos completos.
