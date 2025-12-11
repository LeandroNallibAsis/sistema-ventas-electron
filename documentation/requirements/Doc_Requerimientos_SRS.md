# Documento de Requerimientos del Sistema (SRS)
**Proyecto:** ElectroStock
**Versión:** 1.0
**Fecha:** 8 de Diciembre de 2025

## 1. Introducción
### 1.1 Propósito
El propósito de este documento es definir los requisitos funcionales y no funcionales para "ElectroStock", una aplicación de escritorio destinada a la gestión comercial de pequeños y medianos negocios.

### 1.2 Alcance
El sistema permite el control de inventario, punto de venta (POS), gestión de clientes, administración de usuarios y generación de reportes financieros.

## 2. Requerimientos Funcionales

### 2.1 Módulo de Inventario
*   **RF-INV-01:** El sistema debe permitir crear, leer, actualizar y eliminar (CRUD) productos.
*   **RF-INV-02:** El sistema debe permitir crear y gestionar categorías de productos.
*   **RF-INV-03:** El sistema debe alertar visualmente cuando el stock de un producto sea igual o menor a 5 unidades.
*   **RF-INV-04:** El sistema debe soportar la búsqueda de productos por nombre o código de barras.

### 2.2 Módulo de Punto de Venta (POS)
*   **RF-POS-01:** El sistema debe permitir agregar productos al carrito mediante escaneo de código de barras o búsqueda manual.
*   **RF-POS-02:** El sistema debe calcular automáticamente subtotales, totales y recargos según el método de pago seleccionado.
*   **RF-POS-03:** El sistema debe permitir múltiples métodos de pago (Efectivo ARS/USD, Transferencia, Tarjeta, QR).
*   **RF-POS-04:** El sistema debe permitir asociar un Cliente a la venta.
*   **RF-POS-05:** El sistema debe generar imprimir un ticket de venta (formato térmico 80mm).

### 2.3 Módulo de Clientes
*   **RF-CLI-01:** El sistema debe permitir el registro de clientes con datos personales (Nombre, DNI, Teléfono, Dirección).
*   **RF-CLI-02:** El sistema debe permitir visualizar el historial de deudas (futura funcionalidad) y datos de contacto en el POS.

### 2.4 Módulo de Administración y Seguridad
*   **RF-SEC-01:** El sistema debe requerir autenticación (Login) para acceder.
*   **RF-SEC-02:** El sistema debe manejar dos roles: 'Admin' (Acceso total) y 'Vendedor' (Acceso restringido a POS, Ventas y Clientes).
*   **RF-SEC-03:** El sistema debe encriptar las contraseñas de los usuarios en la base de datos.
*   **RF-SEC-04:** El sistema debe bloquear el acceso a módulos sensibles (Configuración, Usuarios, Reportes) para el rol 'Vendedor'.

### 2.5 Módulo de Reportes
*   **RF-REP-01:** El sistema debe mostrar un Dashboard con ventas del día, top productos y ganancias del mes.
*   **RF-REP-02:** El sistema debe generar un Reporte Mensual detallado con desglose de Costos, Ganancias y Ventas por Categoría.

## 3. Requerimientos No Funcionales

### 3.1 Rendimiento
*   **RNF-PER-01:** El tiempo de respuesta para buscar un producto debe ser menor a 200ms con una base de datos de hasta 10,000 artículos.
*   **RNF-PER-02:** El inicio de la aplicación no debe superar los 5 segundos en hardware estándar (i5, 8GB RAM).

### 3.2 Seguridad
*   **RNF-SEC-01:** La base de datos local (SQLite) debe estar protegida contra escritura directa no autorizada (mediante la lógica de la app).
*   **RNF-SEC-02:** Las contraseñas se almacenan con hashing y salt (PBKDF2/Scrypt).

### 3.3 Usabilidad
*   **RNF-USE-01:** La interfaz debe ser intuitiva, requiriendo menos de 1 hora de capacitación para un cajero nuevo.
*   **RNF-USE-02:** El diseño debe ser responsivo a diferentes tamaños de ventana, aunque optimizado para 1366x768 o superior.

### 3.4 Disponibilidad
*   **RNF-AVA-01:** El sistema debe ser capaz de operar en modo "Offline" (sin internet) indefinidamente para todas las funciones core.

## 4. Restricciones del Sistema
*   **RES-01:** El sistema corre exclusivamente en entorno Windows (10/11) por el momento.
*   **RES-02:** La base de datos es local (SQLite), lo que limita el uso simultáneo a una sola máquina (Single-Tenant Local).

## 5. Supuestos
*   El usuario dispone de una impresora térmica compatible con drivers de Windows.
*   El usuario realiza copias de seguridad periódicas de la carpeta de datos de la aplicación.
