# Modelo de Datos (ERD) - ElectroStock

**Versión:** 1.0
**Fecha:** 8 de Diciembre de 2025

Este documento representa la estructura actual de la base de datos SQLite utilizada por la aplicación.

## Diagrama Entidad-Relación

```mermaid
erDiagram
    products {
        INTEGER id PK
        TEXT barcode UK
        TEXT name
        REAL price_cost
        REAL price
        INTEGER stock
        INTEGER category_id FK
    }

    categories {
        INTEGER id PK
        TEXT name UK
    }

    sales {
        INTEGER id PK
        TEXT date
        TEXT payment_method
        REAL subtotal
        REAL surcharge
        REAL total
        INTEGER client_id FK
        TEXT customer_notes
    }

    sale_items {
        INTEGER id PK
        INTEGER sale_id FK
        INTEGER product_id FK
        TEXT product_name
        INTEGER quantity
        REAL unit_price
        REAL subtotal
    }

    clients {
        INTEGER id PK
        TEXT name
        TEXT identifier UK
        TEXT phone
        TEXT email
        TEXT address
        REAL debt
    }

    users {
        INTEGER id PK
        TEXT username UK
        TEXT password_hash
        TEXT salt
        TEXT role
        TEXT name
        INTEGER active
    }

    cash_register {
        INTEGER id PK
        TEXT date
        TEXT type
        REAL amount
        TEXT description
        INTEGER sale_id FK
    }

    %% Relaciones
    categories ||--o{ products : "tiene"
    sales ||--|{ sale_items : "contiene"
    products ||--o{ sale_items : "está en"
    clients |o--o{ sales : "realiza"
    sales ||--o| cash_register : "genera"
```

## Diccionario de Datos

*   **products:** Almacena el inventario maestro.
*   **categories:** Clasificación de productos (ej: Cables, Cargadores).
*   **sales:** Cabecera de cada ticket de venta.
*   **sale_items:** Detalle línea por línea de cada venta.
*   **clients:** Base de datos de clientes para asociar a ventas.
*   **users:** Usuarios del sistema (Admin/Vendedor) con credenciales.
*   **cash_register:** Libro de caja para movimientos de dinero (ingresos/egresos).
