# Historias de Usuario y Casos de Uso - ElectroStock

**Versión:** 1.0
**Fecha:** 8 de Diciembre de 2025

## 1. Historias de Usuario (Agile)

### 1.1 Gestión de Inventario
*   **HU-01:** Como **Dueño**, quiero agregar nuevos productos con su costo y precio de venta, para tenerlos disponibles para las ventas.
*   **HU-02:** Como **Vendedor**, quiero buscar productos por nombre rápidamente, para atender a los clientes sin demora.
*   **HU-03:** Como **Dueño**, quiero que el sistema me avise cuando queda poco stock, para reponer mercancía a tiempo.

### 1.2 Punto de Venta (POS)
*   **HU-04:** Como **Cajero**, quiero escanear un código de barras, para agregar el producto a la venta automáticamente.
*   **HU-05:** Como **Cajero**, quiero seleccionar diferentes métodos de pago (Efectivo, Tarjeta), para ofrecer flexibilidad al cliente.
*   **HU-06:** Como **Cliente**, quiero recibir un ticket impreso con el detalle de mi compra, como comprobante.

### 1.3 Gestión de Clientes y Administración
*   **HU-07:** Como **Vendedor**, quiero registrar a un cliente nuevo, para asociarlo a una venta y fidelizarlo.
*   **HU-08:** Como **Admin**, quiero ver un reporte mensual de ganancias, para saber la rentabilidad del negocio.
*   **HU-09:** Como **Admin**, quiero crear cuentas para mis empleados, para que cada uno entre con su propia contraseña.

## 2. Casos de Uso (Formal)

### CU-01: Realizar Venta
**Actor:** Cajero / Vendedor
**Precondiciones:** El usuario está logueado y en la pantalla POS. Hay stock disponible.
**Flujo Principal:**
1.  El Cajero escanea o busca el producto.
2.  El Sistema muestra el producto en el carrito con su precio.
3.  El Cajero repite el paso 1 para más productos.
4.  El Cajero selecciona "Completar Venta" y elige método de pago.
5.  El Sistema calcula el total con recargos/descuentos.
6.  El Cajero confirma.
7.  El Sistema descuenta stock, registra la venta y emite ticket.
**Postcondiciones:** Venta registrada, Stock actualizado, Caja actualizada.

### CU-02: Registrar Nuevo Cliente
**Actor:** Vendedor
**Precondiciones:** Usuario en pantalla POS o Gestión de Clientes.
**Flujo Principal:**
1.  El Vendedor selecciona "Nuevo Cliente".
2.  El Sistema muestra formulario de registro.
3.  El Vendedor ingresa Nombre, DNI, Teléfono y Dirección.
4.  El Vendedor guarda.
5.  El Sistema valida que el DNI no exista previamente.
6.  El Sistema guarda el cliente.
**Excepciones:** Si el DNI ya existe, muestra error.

### CU-03: Generar Reporte Mensual
**Actor:** Admin
**Precondiciones:** Usuario logueado como Administrador.
**Flujo Principal:**
1.  El Admin navega a "Reportes".
2.  El Sistema calcula ventas, costos y ganancias del mes actual.
3.  El Sistema muestra gráficos de barras y lista de top productos.
4.  El Admin visualiza la ganancia neta estimada.
