# Guía de Instalación y Despliegue - ElectroStock

## 🚀 Ejecutar la Aplicación

### Opción 1: Modo Desarrollo (Recomendado para Pruebas)

Esta es la forma más rápida de ejecutar la aplicación:

```bash
# 1. Abrir terminal en la carpeta del proyecto
cd "c:\Users\Usuario\Desktop\proyectos\programa para el negocio 2"

# 2. Instalar dependencias (solo la primera vez)
npm install

# 3. Ejecutar la aplicación
npm run dev
```

La aplicación se abrirá automáticamente con:
- ✅ Base de datos SQLite persistente
- ✅ Todas las funcionalidades operativas
- ✅ Funcionamiento 100% offline
- ✅ DevTools para depuración

---

## 📦 Crear Ejecutable para Distribución

### Método 1: Usando electron-builder (Requiere Permisos)

Para crear un instalador `.exe` profesional:

```bash
# Ejecutar PowerShell como Administrador
npm run dist
```

> [!WARNING]
> En Windows, electron-builder puede requerir permisos de administrador para crear enlaces simbólicos. Si encuentras errores de permisos, usa el Método 2.

### Método 2: Ejecutable Portable (Sin Instalador)

Si electron-builder falla, puedes crear una versión portable:

```bash
# 1. Construir el frontend
npm run build

# 2. Usar electron-packager (instalarlo si no lo tienes)
npm install -g electron-packager

# 3. Crear ejecutable portable
electron-packager . ElectroStock --platform=win32 --arch=x64 --out=dist --overwrite
```

Esto creará una carpeta `dist/ElectroStock-win32-x64/` con:
- `ElectroStock.exe` - Ejecutable principal
- Archivos de dependencias
- La carpeta completa es portable (se puede copiar a otro PC)

### Método 3: Distribución Simple

Para compartir la aplicación con otros:

1. **Comprime la carpeta completa del proyecto**:
   ```
   programa para el negocio 2.zip
   ```

2. **Instrucciones para el usuario final**:
   ```
   1. Instalar Node.js desde https://nodejs.org
   2. Extraer el ZIP
   3. Abrir terminal en la carpeta
   4. Ejecutar: npm install
   5. Ejecutar: npm run dev
   ```

---

## 🔧 Solución de Problemas Comunes

### Error: "electron-rebuild failed"

```bash
# Reinstalar módulos nativos
npm install
npx electron-rebuild
```

### Error: "Cannot find module better-sqlite3"

```bash
# Reconstruir módulos nativos para Electron
npx electron-rebuild -f -w better-sqlite3
```

### Error: "Port 5173 already in use"

```bash
# Cerrar procesos Node/Electron en segundo plano
taskkill /F /IM node.exe /T
taskkill /F /IM electron.exe /T
```

### Error de permisos en electron-builder

```bash
# Ejecutar PowerShell como Administrador
# O usar electron-packager como alternativa (ver Método 2)
```

---

## 📁 Ubicación de la Base de Datos

La base de datos se crea automáticamente en:

```
C:\Users\[TuUsuario]\AppData\Roaming\electro-stock\electrostock.db
```

### Hacer Backup de Datos

```bash
# Copiar archivo de base de datos a ubicación segura
copy "%APPDATA%\electro-stock\electrostock.db" "D:\Backups\electrostock-backup.db"
```

### Restaurar Backup

```bash
# Restaurar desde backup
copy "D:\Backups\electrostock-backup.db" "%APPDATA%\electro-stock\electrostock.db"
```

---

## 🎯 Configuración de electron-builder (Avanzado)

Si necesitas personalizar el instalador, edita la sección `build` en `package.json`:

```json
{
  "build": {
    "appId": "com.tuempresa.electrostock",
    "productName": "ElectroStock",
    "win": {
      "target": "nsis",
      "icon": "public/icon.png"
    }
  }
}
```

### Crear un Ícono Personalizado

1. Crear archivo `icon.png` de 512x512 px
2. Colocar en carpeta `public/`
3. Usar herramienta online para convertir a `.ico`
4. Actualizar ruta en `package.json`

---

## ✅ Lista de Verificación Pre-Distribución

Antes de distribuir la aplicación, verifica:

- [ ] Base de datos se crea correctamente
- [ ] Todas las operaciones CRUD funcionan
- [ ] Códigos de barras se generan y descargan
- [ ] Stock badges se actualizan correctamente
- [ ] La aplicación funciona SIN conexión a internet
- [ ] Los datos persisten después de cerrar/reabrir
- [ ] DevTools está deshabilitado en producción (remover línea 23 de `electron/main.js`)

---

## 🔒 Deshabilitar DevTools en Producción

Para la versión final, editar `electron/main.js`:

```javascript
// Línea 20-26
if (!app.isPackaged) {
    mainWindow.loadURL('http://localhost:5173');
    // mainWindow.webContents.openDevTools(); // ← Comentar esta línea
} else {
    mainWindow.loadFile(path.join(__dirname, '../dist-react/index.html'));
}
```

---

## 📊 Información Técnica

### Tamaño de la Aplicación

- **Frontend Build**: ~279 KB (comprimido)
- **Ejecutable Completo**: ~150-200 MB (incluye Electron + Node.js)
- **Base de Datos**: Crece dinámicamente según datos

### Requisitos del Sistema

- **OS**: Windows 10 o superior (64-bit)
- **RAM**: 4 GB mínimo
- **Disco**: 500 MB libres
- **Internet**: ❌ NO requerido después de instalación

---

## 🎓 Comandos Útiles

```bash
# Desarrollo
npm run dev              # Ejecutar en modo desarrollo
npm run dev:vite         # Solo servidor Vite
npm run dev:electron     # Solo Electron

# Producción
npm run build            # Compilar React
npm run dist             # Crear instalador Windows

# Mantenimiento
npm install              # Instalar dependencias
npm run lint             # Verificar código
npx electron-rebuild     # Reconstruir módulos nativos
```

---

## 💡 Consejos de Uso

1. **Backup Regular**: Exporta la base de datos semanalmente
2. **Categorías**: Crea categorías antes de agregar productos
3. **Stock**: Actualiza el stock después de cada venta
4. **Códigos de Barras**: Descárgalos todos al inicio para impresión masiva
5. **Proveedores**: Usa nombres consistentes para mejor organización

---

## 🎉 ¡Listo!

La aplicación ElectroStock está completamente funcional y lista para usar. Para cualquier problema o pregunta, revisa la sección de solución de problemas o consulta la documentación completa en `walkthrough.md`.
