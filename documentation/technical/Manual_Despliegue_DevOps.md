# Manual de Despliegue y DevOps - ElectroStock

**Versión:** 1.0
**Fecha:** 8 de Diciembre de 2025

## 1. Estrategia de Despliegue (Deployment Strategy)

### 1.1 Modelo de Distribución
ElectroStock es una aplicación de escritorio ("Thick Client"). El despliegue consiste en distribuir un instalador autoejecutable (`.exe`) a los clientes.
*   **Canal actual:** Distribución manual (Google Drive / GitHub Releases).
*   **Canal futuro:** Descarga desde Landing Page con auto-actualización.

### 1.2 Empaquetado (Packaging)
Utilizamos **electron-builder** para generar los instaladores. Esta herramienta toma el código compilado de React (Vite) y el Main Process de Electron y crea un ejecutable optimizado.

#### Comandos de Construcción:
```bash
# 1. Compilar Frontend (Vite -> dist)
npm run build:react

# 2. Empaquetar Electron (Genera .exe en /release)
npm run build:electron

# 3. Comando unificado (Recomendado)
npm run build
```

#### Artefactos Generados:
*   `ElectroStock Setup 1.0.0.exe` (Instalador NSIS estándar)
*   `win-unpacked/` (Carpeta con el ejecutable portable para pruebas rápidas)

## 2. DevOps y Ciclo de Vida (CI/CD)

### 2.1 Control de Versiones
Se utiliza **Git** siguiendo el flujo simplificado de GitHub Flow:
*   `main`: Rama de producción estable.
*   `feature/nombre-feature`: Ramas de desarrollo.
*   **Tags:** Se usan tags semánticos (`v1.0.0`) para marcar lanzamientos.

### 2.2 Pipeline de Integración Continua (CI) - *Recomendado*
Para automatizar la calidad del código, se sugiere implementar un workflow de GitHub Actions en `.github/workflows/ci.yml`:

```yaml
name: CI ElectroStock
on: [push, pull_request]
jobs:
  build:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm run build # Verifica que compile sin errores
```

### 2.3 Pipeline de Despliegue (CD) - *Recomendado*
Para automatizar la creación de Releases:
```yaml
name: Release
on:
  push:
    tags:
      - 'v*'
jobs:
  release:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run build
      - name: Upload Release Asset
        uses: softprops/action-gh-release@v1
        with:
          files: release/*.exe
```

## 3. Infraestructura como Código (IaC)
Al ser una aplicación local, no requiere aprovisionamiento de servidores (Terraform/Ansible) en esta fase.
**Nota SaaS:** En la fase 2, el servidor de licencias y BD centralizada requerirá scripts de Terraform para AWS/DigitalOcean.

## 4. Gestión de Errores y Logs
La aplicación escribe logs en la consola del sistema (visible con `--enable-logging`).
*   **Producción:** Se recomienda implementar `electron-log` para guardar archivos `.log` rotativos en `%APPDATA%/electrostock/logs/` para facilitar el soporte técnico.
