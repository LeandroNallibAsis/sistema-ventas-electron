# Documento de Diseño de UI/UX - ElectroStock

**Versión:** 1.0
**Fecha:** 8 de Diciembre de 2025

## 1. Sistema de Diseño (Design System)

### 1.1 Paleta de Colores (Tailwind CSS)
El sistema utiliza una paleta moderna centrada en la claridad y el confort visual.
*   **Primary (Indigo):** Acciones principales, botones de confirmar.
    *   `bg-primary-600` (#4F46E5) - Botones
    *   `text-primary-600` - Enlaces / Iconos activos
*   **Secondary (Gray/Slate):** Fondos, bordes, textos secundarios.
    *   `bg-gray-50` (#F9FAFB) - Fondo de pantalla principal
    *   `bg-gray-900` (#111827) - Sidebar de navegación (Dark Mode style)
*   **Feedback (Semantic):**
    *   **Success:** `bg-success-400` (#34D399) - Mensajes de éxito, Toggle activo.
    *   **Danger:** `bg-danger-600` (#DC2626) - Eliminar, Errores.
    *   **Warning:** `bg-yellow-500` - Alertas de stock bajo.

### 1.2 Tipografía
*   **Familia:** `Inter` o `system-ui` (San Francisco/Segoe UI). Fuente sans-serif limpia y legible.
*   **Jerarquía:**
    *   `h1` (text-3xl font-bold): Títulos de página (ej: "Punto de Venta").
    *   `h2` (text-xl font-bold): Subsecciones (ej: "Carrito", "Pago").
    *   `body` (text-base): Texto general.
    *   `caption` (text-sm/text-xs text-gray-500): Metadatos (ej: Categoría del producto, fecha).

### 1.3 Componentes UI (Reutilizables)
1.  **Sidebar:** Navegación vertical fija a la izquierda, oscura, con iconos.
2.  **Card:** Contenedor blanco con sombra suave (`shadow-sm`) y bordes redondeados (`rounded-lg`).
3.  **Input Field:** Campos de texto con borde gris claro (`border-gray-300`) que cambia a Primary al enfocar (`focus:ring-primary-500`).
4.  **Modal:** Ventana emergente centrada con fondo oscuro semitransparente (`bg-opacity-50`).

## 2. Flujo de Usuario (User Flow)

### 2.1 Flujo: Realizar una Venta
1.  **Inicio:** Vendedor ingresa a la pantalla POS.
2.  **Input:** Foco automático en el campo "Código de Barras".
3.  **Acción:** Escanear producto -> Se agrega al la lista izquierda (Carrito).
4.  **Decisión:** ¿Cliente registrado?
    *   Sí: Click "Cliente" -> Modal Buscar -> Seleccionar.
    *   No: Continuar como consumidor final.
5.  **Cierre:** Seleccionar Medio de Pago (Dropdown) -> Click "Completar Venta".
6.  **Feedback:** Modal de Recibo (Ticket) -> Imprimir o Cerrar.

## 3. Wireframes / Mockups (Descripción Conceptual)

### 3.1 Pantalla Principal (POS)
*   **Layout:** Dos columnas (Split View).
*   **Izquierda (66%):**
    *   Header: Título + Buscador/Scanner + Botón Cliente.
    *   Body: Lista de productos en el carrito (Tabla con filas eliminables).
*   **Derecha (33%):**
    *   Panel de Cobro fijo.
    *   Selector de Método de Pago.
    *   Toggle de Garantía.
    *   TextArea de Notas.
    *   **Footer:** Resumen de Totales (Subtotal, Recargo, TOTAL grande) + Botón "Pagar".

### 3.2 Dashboard (Inicio Admin)
*   **Layout:** Grid de Tarjetas (KPIs).
*   **Top:** 3 Tarjetas de resumen (Ventas Hoy, Ganancia Mes, Productos Bajos de Stock).
*   **Centro:** Gráfico de Líneas (Ventas últimos 30 días - Recharts).
*   **Bottom:** Tabla "Top 5 Productos Más Vendidos".

### 3.3 Gestión de Inventario
*   **Sidebar:** Lista de Categorías.
*   **Main:** Grid de Productos (Cards o Tabla).
*   **Acciones:** Botón flotante o en header "+ Agregar Producto".
*   **Edit:** Al hacer click en un producto, abre Modal de Edición.
