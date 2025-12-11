# Manual de Instalación y Configuración - ElectroStock

**Versión:** 1.0
**Fecha:** 8 de Diciembre de 2025

## 1. Requisitos Previos (Prerequisites)
Antes de instalar el proyecto, asegúrese de tener el siguiente software instalado en su entorno Windows:

*   **Node.js:** Versión 18 LTS o 20 LTS (Recomendada). [Descargar](https://nodejs.org/)
*   **Git:** Para control de versiones. [Descargar](https://git-scm.com/)
*   **Python 3.x:** Requerido para compilar dependencias nativas (`better-sqlite3`).
*   **Visual Studio Build Tools:** Específicamente la carga de trabajo "Desarrollo de escritorio con C++". (Necesario para `node-gyp`).

## 2. Instalación del Proyecto

### 2.1 Clonar el Repositorio
Abra una terminal (PowerShell o CMD) y ejecute:
```bash
git clone https://github.com/LeandroNallibAsis/sistema-ventas-electron.git
cd sistema-ventas-electron
```

### 2.2 Instalar Dependencias
Dentro de la carpeta del proyecto, ejecute:
```bash
npm install
```
*Nota: Este paso puede tardar unos minutos ya que compila el módulo SQLite.*

### 2.3 Reconstrucción de Binarios (Si es necesario)
Si encuentra errores relacionados con `wrong ELF class` o `NODE_MODULE_VERSION`, ejecute:
```bash
npm run rebuild
# O manualmente:
# ./node_modules/.bin/electron-rebuild
```

## 3. Configuración

### 3.1 Base de Datos
La aplicación utiliza **SQLite**. No requiere configuración de servidor.
*   **Ubicación por defecto:** El archivo `.db` se genera automáticamente en `%APPDATA%/electrostock/database.sqlite` (en producción) o en la raíz del proyecto durante el desarrollo.
*   **Reset:** Para reiniciar la base de datos, simplemente elimine el archivo `.db` y reinicie la aplicación. Se recreará con las tablas vacías y el usuario admin por defecto.

### 3.2 Variables de Entorno
Actualmente la configuración es estática. Para futuras fases SaaS, cree un archivo `.env` en la raíz (no incluido en git):
```ini
# Ejemplo .env futuro
API_URL=https://api.electrostock.com
LICENSE_KEY=VOLUMEN_LICENCIA
```

### 3.3 Configuración de Impresora
La selección de impresora se maneja a través del diálogo nativo del sistema operativo.
*   Asegúrese de que su impresora térmica esté definida como "Predeterminada" en Windows para mayor agilidad, o seleccionela en el modal de impresión.

## 4. Ejecución
### 4.1 Modo Desarrollo
Para trabajar en el código con recarga en caliente (hot-reload):
```bash
npm run dev
```
Esto abrirá dos procesos:
1.  Vite Server (http://localhost:5173)
2.  Ventana de Electron cargando esa URL.

### 4.2 Modo Producción (Preview)
Para probar la aplicación empaquetada:
```bash
npm run build
npm start
```
