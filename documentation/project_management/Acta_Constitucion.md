# Acta de Constitución del Proyecto (Project Charter)

**Nombre del Proyecto:** ElectroStock - Sistema de Gestión de Ventas e Inventario
**Fecha:** 8 de Diciembre de 2025
**Patrocinador del Proyecto:** LeandroNallibAsis

## 1. Propósito y Justificación del Proyecto
El propósito de este proyecto es desarrollar "ElectroStock", una aplicación de escritorio robusta y moderna para la gestión de puntos de venta (POS) y control de inventario.
**Justificación:** Los pequeños comercios necesitan una solución tecnológica accesible, que no dependa de internet al 100% (local core), pero que ofrezca métricas avanzadas y rapidez en la facturación, superando a las planillas de excel o sistemas antiguos y costosos.

## 2. Objetivos del Proyecto
1.  **Funcional:** Entregar un sistema capaz de realizar ventas, controlar stock en tiempo real, gestionar cajas y emitir reportes mensuales.
2.  **Rendimiento:** Lograr una interfaz de usuario con tiempos de respuesta menores a 200ms en operaciones de venta.
3.  **Escalabilidad:** Diseñar la arquitectura para permitir una futura migración a modelo SaaS (Software as a Service).
4.  **Seguridad:** Implementar control de acceso basado en roles (Admin/Vendedor) y protección de datos locales.

## 3. Alcance de Alto Nivel
**Incluye:**
*   Desarrollo de aplicación de escritorio (Electron + React).
*   Módulo de Inventario (Altas, bajas y modificaciones de productos).
*   Módulo de Punto de Venta (POS) con lector de código de barras.
*   Gestión de Usuarios y Roles.
*   Gestión de Clientes (CRM Básico).
*   Dashboard de métricas y Reportes Mensuales.
*   Integración con impresoras térmicas.

**Fuera de Alcance (Fase Actual):**
*   Facturación electrónica fiscal automática (AFIP/Otros).
*   Tienda de comercio electrónico integrada (E-commerce web).
*   App móvil nativa (Android/iOS).

## 4. Riesgos de Alto Nivel
*   Pérdida de datos locales por fallos de hardware del usuario (Mitigación: Backups futuros).
*   Cambios en los requerimientos del mercado SaaS.
*   Complejidad en la migración de datos de sistemas anteriores de los clientes.

## 5. Cronograma de Hitos Principales
| Hito | Fecha Estimada | Estado |
| :--- | :--- | :--- |
| Inicio del Proyecto | Noviembre 2025 | Completado |
| MVP (Inventario + POS Básico) | 30 Noviembre 2025 | Completado |
| Implementación de Métricas y Dashboard | 3 Diciembre 2025 | Completado |
| Sistema de Seguridad y Roles | 6 Diciembre 2025 | Completado |
| Versión 1.0 (Lanzamiento Local) | 15 Diciembre 2025 | En Proceso |
| Expansión SaaS (Fase 2) | Q1 2026 | Pendiente |

## 6. Presupuesto Preliminar
*   **Recursos Humanos:** 1 Desarrollador Full Stack (Principal).
*   **Infraestructura:** Equipamiento local (PC desarrollo).
*   **Servicios Cloud (Futuro):** Hosting para web y base de datos ($20-$50 USD/mes estimado para inicio SaaS).

## 7. Lista de Interesados (Stakeholders)
*   **LeandroNallibAsis:** Project Manager / Lead Developer / Product Owner.
*   **Dueños de Negocios (PyMEs):** Usuarios finales administradores.
*   **Vendedores/Cajeros:** Usuarios finales operativos.

---
**Firma de Aprobación:**
*LeandroNallibAsis*
*Gerente del Proyecto*
