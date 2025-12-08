# 📦 ElectroStock - Sistema de Gestión de Stock Offline

**Sistema completo de gestión de inventario 100% offline para Windows**

---

## 🎯 Características

✨ **100% Offline** – No requiere conexión a internet  
📊 **Gestión Completa** – Categorías, productos, stock  
🏷️ **Códigos de Barras** – Genera y descarga códigos en PNG  
🚦 **Alertas de Stock** – Disponible, Poco Stock, Sin Stock  
💾 **Base de Datos Local** – SQLite persistente  
🎨 **Interfaz Moderna** – TailwindCSS con diseño profesional  

---

## 🚀 Instalación Rápida

```bash
# 1. Instalar dependencias
npm install

# 2. Ejecutar la aplicación
npm run dev
```

---

## 💻 Uso Básico

### 1. Crear Categorías  
Ir al menú lateral → **+** → Ingresar nombre → Crear

### 2. Agregar Productos  
Seleccionar categoría → **+ Agregar Producto** → Completar formulario

### 3. Códigos de Barras  
En el producto → 📊 → **Descargar PNG**

---

## 📚 Documentación Incluida

### Gestión de Proyecto
- Acta de Constitución  
- Plan de Proyecto  
- Registro de Interesados  
- Registro de Riesgos  
- Lecciones Aprendidas  

### Requerimientos
- Documento SRS  
- Historias de Usuario / Casos de Uso  
- Diagramas UML / Flujos  
- Modelo de Datos (ERD)

### Diseño de Software
- Arquitectura (SAD)  
- Diseño UI/UX  

### Manuales Técnicos
- Instalación  
- Configuración  

---

## 🛠️ Stack Tecnológico

- **Electron 39** – App de escritorio  
- **React 19** – UI moderna  
- **Vite 7** – Build ultrarrápido  
- **TailwindCSS 3** – Estilos profesionales  
- **SQLite** – Base local  
- **jsbarcode** – Generador de códigos de barras

---

## 🔧 Comandos Útiles

```bash
npm run dev       # Modo desarrollo
npm run build     # Compilar producción
npm run dist      # Generar instalador .exe para Windows
```

---

## 📊 Sistema de Alertas de Stock

| Estado        | Condición        |
|--------------|------------------|
| 🟢 Disponible | > 10 unidades    |
| 🟡 Poco Stock | 1–10 unidades    |
| 🔴 Sin Stock  | 0 unidades       |

---

## 📂 Ubicación de la Base de Datos

```
C:\Users\[Usuario]\AppData\Roaming\electro-stock\electrostock.db
```

---

## ❤️ Hecho con dedicación para pequeños y medianos negocios

