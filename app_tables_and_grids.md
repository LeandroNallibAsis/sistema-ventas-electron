# Estructura de Tablas y Grillas del Sistema

Este documento detalla la ubicación exacta de cada tabla (listados de datos) y grilla (disposiciones visuales) dentro de la aplicación. Te servirá como guía para aprender la estructura del código, poder exponer sus partes y realizar cambios precisos.

Todos los archivos mencionados se encuentran dentro del directorio `src/components/`. La aplicación utiliza **React** para los componentes y **Tailwind CSS** para los estilos.

---

## 📊 1. Tablas de Datos (Listados Principales)

Las tablas de datos se construyen principalmente usando la etiqueta HTML estándar `<table>`. A continuación, se detalla qué datos muestra cada una y en qué componente se encuentra:

*   **Punto de Venta (Carrito)** 👉 `POSScreen.jsx`
    *   *Ubicación visual:* Pantalla principal de ventas.
    *   *Qué muestra:* La lista de productos que se están cobrando en la venta actual (cantidad, nombre, precio unitario, subtotal y botón de eliminar).
*   **Inventario de Productos** 👉 `ProductList.jsx`
    *   *Ubicación visual:* Sección "Inventario".
    *   *Qué muestra:* El catálogo completo de productos (código de barras, nombre, categoría, precio de costo/venta, y stock actual).
*   **Historial de Ventas** 👉 `SalesHistory.jsx`
    *   *Ubicación visual:* Sección "Historial".
    *   *Qué muestra:* El registro de todas las ventas concretadas (fecha, comprobante, cliente, método de pago y total).
*   **Movimientos de Caja** 👉 `CashRegister.jsx`
    *   *Ubicación visual:* Sección "Caja".
    *   *Qué muestra:* El detalle de todos los ingresos (ventas, ingreso manual) y egresos (gastos) del día o turno actual.
*   **Gestión de Clientes** 👉 `ClientManagement.jsx`
    *   *Ubicación visual:* Sección "Clientes".
    *   *Qué muestra:* El listado de clientes registrados en el sistema, mostrando su nombre, contacto y saldo de cuenta corriente. Esta vista también tiene subdivisiones para ver el historial de compras de cada cliente.
*   **Gestión de Proveedores** 👉 `SupplierManagement.jsx`
    *   *Ubicación visual:* Sección "Proveedores".
    *   *Qué muestra:* La lista de proveedores, datos de contacto y rubro.
*   **Gestión de Compras** 👉 `PurchaseManagement.jsx`
    *   *Ubicación visual:* Sección "Compras".
    *   *Qué muestra:* Registro de las compras de mercadería realizadas para reponer stock.
*   **Gestión de Usuarios** 👉 `UserManagement.jsx`
    *   *Ubicación visual:* Sección "Usuarios" (solo Administradores).
    *   *Qué muestra:* Lista de empleados o usuarios del sistema con su rol correspondiente.
*   **Cotizaciones** 👉 `QuotesList.jsx` y `QuoteForm.jsx`
    *   *Ubicación visual:* Sección "Cotizaciones".
    *   *Qué muestra:* `QuotesList` contiene la tabla con el historial de presupuestos guardados. `QuoteForm` contiene la tabla con los ítems que se están agregando a un nuevo presupuesto.
*   **Reportes Mensuales** 👉 `MonthlyReport.jsx`
    *   *Ubicación visual:* Sección "Reportes".
    *   *Qué muestra:* Tablas analíticas que desglosan ingresos, egresos y ganancias netas por mes.
*   **Panel Principal (Alertas)** 👉 `Dashboard.jsx`
    *   *Ubicación visual:* Pantalla de inicio ("Inicio").
    *   *Qué muestra:* Contiene una tabla pequeña dedicada unicamente a mostrar las **"Alertas de Stock Bajo"**, listando los productos que necesitan reposición urgente.

---

## 📱 2. Grillas (Diseños tipo "Grid" o Tarjetas)

Las grillas se utilizan para organizar elementos visuales en la pantalla, generalmente mediante clases de Tailwind como `grid grid-cols-X`. Las implementaciones de grilla más importantes y vistosas para tu exposición son:

*   **Pizarra de Notas (Tarjetas / Sticky Notes)** 👉 `NotesBoard.jsx`
    *   *Punto clave de exposición:* Esta pantalla es 100% grilla. Utiliza una disposición responsiva (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`) para acomodar notas tipo "post-it" que se ajustan dinámicamente según el tamaño de la pantalla.
*   **Dashboard (Tarjetas de Estadísticas)** 👉 `Dashboard.jsx`
    *   *Punto clave de exposición:* La pantalla de inicio divide los indicadores financieros (Ventas Hoy, Esta Semana, Este Mes) en una elegante grilla de 3 columnas superiores y luego otra grilla de 3 columnas inferiores para los Balances Financieros detallados. 
*   **Formularios de Creación (Modal)** 👉 `ProductForm.jsx`, `SettingsScreen.jsx`, `PurchaseManagement.jsx`
    *   *Punto clave de exposición:* Cuando se abre un modal para crear un producto o editar configuraciones, los campos de texto no están uno debajo del otro de forma aburrida. Se acomodan usando una grilla de 2 columnas (`grid grid-cols-2 gap-4`) para optimizar el espacio y darle un aspecto más profesional.

---

> [!TIP]
> **Consejo para tu exposición:**  
> Si necesitas hacer una modificación en vivo frente a los evaluadores (ej. agregar una columna a una tabla), te recomiendo elegir el **Inventario** (`ProductList.jsx`). Es fácil identificar la etiqueta `<thead>` (cabeceras) y añadir un `<th>Nueva Columna</th>`, para luego ir al `<tbody>` y añadir la celda `<td className="py-2">Dato</td>` correspondiente a cada fila.
