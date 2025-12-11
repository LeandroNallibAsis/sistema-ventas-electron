# Registro de Riesgos (Risk Register) - ElectroStock

**Última Actualización:** 8 de Diciembre de 2025

| ID | Descripción del Riesgo | Probabilidad (1-5) | Impacto (1-5) | Nivel de Riesgo | Estrategia | Plan de Mitigación / Contingencia | Estado |
| :--- | :--- | :---: | :---: | :---: | :--- | :--- | :--- |
| R01 | **Pérdida de base de datos local:** Fallo de disco en la PC del usuario. | 3 | 5 | **Alto (15)** | Mitigar | Implementar función de backup automático a una carpeta externa o nube (Google Drive). | Pendiente |
| R02 | **Incompatibilidad de Impresoras:** Que el ticket no salga bien en ciertos modelos térmicos. | 2 | 3 | Medio (6) | Aceptar / Mitigar | Usar estándares ESC/POS y ofrecer opciones de configuración de ancho (58mm/80mm) y márgenes. | En Curso |
| R03 | **Corrupción de datos por apagado forzado:** SQLite podría corromperse si se corta la luz. | 2 | 4 | **Alto (8)** | Mitigar | Usar modo WAL (Write-Ahead Logging) en SQLite para mayor robustez. (Ya implementado). | Controlado |
| R04 | **Alcance no definido (Scope Creep):** Agregar demasiadas funciones antes de la v1.0. | 4 | 3 | **Alto (12)** | Evitar | Congelar requerimientos para la v1.0. Mover ideas nuevas a Fase 2 (SaaS). | Activo |
| R05 | **Rendimiento con muchos datos:** Lentitud al tener >10,000 productos. | 2 | 3 | Medio (6) | Transferir | Optimizar consultas SQL e índices. Eventualmente migrar a una DB servidor (PostgreSQL) en Fase SaaS. | Monitoreo |
| R06 | **Seguridad de contraseñas:** Robo de credenciales de admin. | 1 | 4 | Medio (4) | Mitigar | Hashing robusto (Scrypt/Argon2 o PBKDF2 con Salt). No guardar texto plano. (Implementado). | Controlado |
