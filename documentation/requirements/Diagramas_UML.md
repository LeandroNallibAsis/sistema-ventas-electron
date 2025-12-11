# Diagramas UML y Flujos de Proceso - ElectroStock

**Versión:** 1.0
**Fecha:** 8 de Diciembre de 2025

## 1. Diagrama de Actividad: Proceso de Venta (POS)

```mermaid
graph TD
    A[Inicio] --> B{¿Está Logueado?}
    B -- No --> C[Mostrar Login]
    B -- Si --> D[Pantalla POS]
    D --> E[Escanear Producto]
    E --> F{¿Producto Existe?}
    F -- No --> G[Mostrar Error] --> E
    F -- Si --> H[Agregar al Carrito]
    H --> I{¿Más Productos?}
    I -- Si --> E
    I -- No --> J[Seleccionar Medio de Pago]
    J --> K[Seleccionar Cliente (Opcional)]
    K --> L[Calcular Total + Recargos]
    L --> M[Confirmar Venta]
    M --> N[Actualizar Stock DB]
    N --> O[Registrar Venta DB]
    O --> P[Imprimir Ticket]
    P --> Q[Fin]
```

## 2. Diagrama de Secuencia: Confirmación de Venta

```mermaid
sequenceDiagram
    participant UI as POS Screen (React)
    participant IPC as Electron Main
    participant DB as SQLite Database
    participant Printer as Thermal Printer
    
    UI->>IPC: createSale(saleData, items)
    activate IPC
    IPC->>DB: Begin Transaction
    IPC->>DB: Insert Sale Record
    loop For each item
        IPC->>DB: Insert Sale Item
        IPC->>DB: Update Stock (Decrement)
    end
    IPC->>DB: Insert Cash Entry
    IPC->>DB: Commit Transaction
    DB-->>IPC: Sale ID
    deactivate IPC
    IPC-->>UI: Success (Sale ID)
    
    UI->>UI: Prepare Receipt Data
    UI->>Printer: Print Ticket
```

## 3. Diagrama BPMN: Cierre Mensual (Simplificado)

```mermaid
graph LR
    start((Inicio)) --> A[Revisar Ventas Mes]
    A --> B[Calcular Costos Totales]
    B --> C[Calcular Ganancia Neta]
    C --> D[Generar Reporte PDF]
    D --> E[Archivar]
    E --> end((Fin))
```
