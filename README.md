# 📦 ElectroStock - Sistema de Gestión de Stock Offline

**Sistema completo de gestión de inventario 100% offline para Windows**

---

## 🎯 Características

✨ **100% Offline** - No requiere conexión a internet  
📊 **Gestión Completa** - Categorías, productos, stock  
🏷️ **Códigos de Barras** - Genera y descarga códigos en PNG  
🚦 **Alertas de Stock** - Visual: Disponible, Poco Stock, Sin Stock  
💾 **Base de Datos Local** - SQLite persistente  
🎨 **Interfaz Moderna** - TailwindCSS con diseño profesional  

---

## 🚀 Instalación Rápida

```bash
# 1. Instalar dependencias (solo la primera vez)
npm install

# 2. Ejecutar la aplicación
npm run dev
```

---

## 💻 Uso Básico

### 1. Crear Categorías
Haz clic en **+** en el sidebar → Ingresa nombre → **Crear**

### 2. Agregar Productos
Selecciona categoría → **+ Agregar Producto** → Completa formulario

### 3. Códigos de Barras
Haz clic en 📊 junto al producto → **🖨️ Descargar PNG**

---

## 📚 Documentación

- **[INSTALACION.md](./INSTALACION.md)** - Guía completa de instalación
- **[walkthrough.md](../.gemini/antigravity/brain/*/walkthrough.md)** - Documentación técnica

---

## 🛠️ Stack Tecnológico

- **Electron 39** - Aplicación de escritorio
- **React 19** - UI moderna
- **Vite 7** - Build ultrarrápido
- **TailwindCSS 3** - Estilos profesionales
- **SQLite** - Base de datos local
- **jsbarcode** - Códigos de barras

---

## ⚙️ Scripts

```bash
npm run dev      # Modo desarrollo
npm run build    # Build producción
npm run dist     # Crear .exe Windows
```

---

## 📊 Sistema de Alertas

| Badge | Stock |
|-------|-------|
| 🟢 **Disponible** | > 10 unidades |
| 🟡 **Poco Stock** | 1-10 unidades |
| 🔴 **Sin Stock** | 0 unidades |

---

## 📁 Base de Datos

```
C:\Users\[Usuario]\AppData\Roaming\electro-stock\electrostock.db
```

---

**Hecho con ❤️ para pequeños y medianos negocios**
