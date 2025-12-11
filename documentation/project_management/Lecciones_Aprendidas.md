# Registro de Lecciones Aprendidas - ElectroStock

**Proyecto:** ElectroStock v1.0
**Fecha:** 8 de Diciembre de 2025

## 1. Categoría: Desarrollo Técnico

| Situación / Problema | Qué sucedió | Qué aprendimos (Lección) | Recomendación Futura |
| :--- | :--- | :--- | :--- |
| **Integración con GitHub** | Hubo problemas iniciales al no tener Git instalado en la máquina local. | **Validar el entorno primero:** Antes de iniciar el desarrollo en una máquina nueva, se debe correr un script de "Health Check" (Node, Git, VS Code). | Crear un script `setup-env.bat` para nuevos desarrolladores. |
| **Base de Datos SQLite** | Se corrompió la lógica de `createSale` al editar parcialmente el archivo `database.js`. | **Atomicidad de ediciones:** Al usar agentes de IA o realizar refactors manuales, verificar siempre la integridad del archivo completo antes de guardar. | Implementar Tests Unitarios para la DB antes de cada commit. |
| **Impresión Térmica** | El ticket salía cortado o muy ancho. | **CSS Específico para impresión:** El CSS de pantalla no sirve para imprimir (80mm). Se requiere `@media print` y medidas en `mm`. | Probar impresión en hardware real desde el inicio del módulo POS. |

## 2. Categoría: Gestión del Proyecto

| Situación / Problema | Qué sucedió | Qué aprendimos (Lección) | Recomendación Futura |
| :--- | :--- | :--- | :--- |
| **Cambios de Alcance** | Se añadieron "Clientes" y "Roles" a mitad de camino. | **La flexibilidad es buena, pero costosa:** Adaptarse rápido nos dio ventaja competitiva (vs Codelector), pero retrasó la v1.0. | Mantener un "Backlog de Deseos" y priorizar rigurosamente cada semana. |
| **Documentación** | Se solicitó documentación formal (PMBOK) casi al final. | **Documentar sobre la marcha:** Es más difícil crear el Project Charter al final que al principio. (Aunque se hizo retroactivamente con éxito). | Iniciar proyectos futuros con las plantillas de documentación ya listas. |

## 3. Éxitos a Replicar (Best Practices)
*   **Diseño Modular:** Separar el Frontend (React Components) del Backend (Electron IPC) facilitó enormemente agregar la autenticación.
*   **Feedback Rápido:** Iterar sobre capturas de pantalla y opiniones del usuario (Leandro) permitió ajustar la UX del POS rápidamente.
*   **Glassmorphism:** El diseño moderno motivó al equipo y mejora la percepción de valor del producto.
