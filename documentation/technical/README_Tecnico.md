# README Técnico - ElectroStock

## 🚀 Inicio Rápido

### Requisitos
- Node.js 18+ LTS
- Git
- Python 3.x + Visual Studio Build Tools (para compilar `better-sqlite3`)

### Instalación
```bash
git clone https://github.com/LeandroNallibAsis/sistema-ventas-electron.git
cd sistema-ventas-electron
npm install
```

### Desarrollo
```bash
npm run dev  # Inicia Vite + Electron en modo desarrollo
```

### Producción
```bash
npm run build  # Compila y empaqueta la aplicación
```

## 📁 Estructura del Proyecto

```
├── electron/              # Backend (Node.js + SQLite)
│   ├── main.js           # Proceso principal de Electron
│   ├── preload.js        # Bridge IPC seguro
│   └── database.js       # Gestor de base de datos
├── src/                  # Frontend (React + Tailwind)
│   ├── components/       # Componentes React
│   ├── utils/            # Funciones auxiliares
│   └── App.jsx           # Componente raíz
├── documentation/        # Documentación completa del proyecto
└── package.json          # Dependencias y scripts
```

## 🏗️ Stack Tecnológico

- **Frontend:** React 18, Tailwind CSS, Recharts
- **Backend:** Electron, Node.js, better-sqlite3
- **Build:** Vite, electron-builder
- **Control de Versiones:** Git + GitHub

## 🔑 Conceptos Clave

### Comunicación IPC
El Frontend se comunica con el Backend mediante IPC (Inter-Process Communication):
```javascript
// Frontend (React)
const products = await window.api.getProducts(categoryId);

// Backend (main.js)
ipcMain.handle('get-products', async (event, categoryId) => {
  return db.getProducts(categoryId);
});
```

### Base de Datos
SQLite local con las siguientes tablas principales:
- `products`, `categories`: Inventario
- `sales`, `sale_items`: Transacciones
- `clients`: CRM
- `users`: Autenticación
- `cash_register`: Libro de caja

### Autenticación
Sistema de roles (Admin/Vendedor) con hashing de contraseñas usando `crypto.pbkdf2`.

## 📝 Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Modo desarrollo con hot-reload |
| `npm run build` | Compilar y empaquetar para producción |
| `npm run rebuild` | Recompilar módulos nativos |

## 🐛 Debugging

### Logs de Electron
```bash
# Windows
set ELECTRON_ENABLE_LOGGING=1 && npm run dev
```

### DevTools
Presiona `Ctrl+Shift+I` en la aplicación para abrir las DevTools de Chrome.

## 📚 Documentación Adicional

Consulta la carpeta `documentation/` para:
- Arquitectura del sistema (C4)
- Requerimientos funcionales (SRS)
- Manuales de instalación y despliegue
- Guía de APIs IPC

## 🤝 Contribuir

1. Crea una rama feature: `git checkout -b feature/nueva-funcionalidad`
2. Commit tus cambios: `git commit -m "Descripción"`
3. Push: `git push origin feature/nueva-funcionalidad`
4. Abre un Pull Request

## 📄 Licencia

Proyecto privado - Todos los derechos reservados © 2025 LeandroNallibAsis
