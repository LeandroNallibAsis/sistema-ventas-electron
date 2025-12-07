# Cómo subir tu proyecto a GitHub

Parece que **Git no está instalado** en tu computadora. Para subir el código, necesitamos instalarlo primero.

## Paso 1: Instalar Git
1.  Descarga el instalador para Windows desde: [https://git-scm.com/download/win](https://git-scm.com/download/win)
2.  Ejecuta el archivo descargado (`Git-....exe`).
3.  Dale a "Next" en todo (las opciones por defecto están bien).
4.  Al finalizar, **cierra todas las ventanas de Visual Studio Code y terminales** y vuélvelo a abrir.

## Paso 2: Crear el repositorio en GitHub
1.  Entra a [github.com](https://github.com) e inicia sesión.
2.  Haz clic en el botón **+** (arriba a la derecha) y elige **"New repository"**.
3.  Ponle un nombre (ej: `sistema-ventas-electron`).
4.  Déjalo en **Public** o **Private**.
5.  **NO** marques "Add a README file" ni ninguna de esas opciones (queremos un repo vacío).
6.  Dale a **"Create repository"**.

## Paso 3: Subir el código
Una vez instalado Git y reabierto VS Code, abre la terminal (`Ctrl + ñ` o `Ctrl + `) y ejecuta estos comandos uno por uno (copia y pega):

```powershell
# 1. Iniciar git en tu carpeta
git init

# 2. Agregar todos los archivos
git add .

# 3. Guardar la versión inicial
git commit -m "Versión 1.0 completa con usuarios y roles"

# 4. Cambiar el nombre de la rama principal a 'main'
git branch -M main

# 5. Conectar con GitHub (REEMPLAZA LA URL POR LA DE TU REPO QUE CREASTE)
# Debería verse algo como: https://github.com/TuUsuario/sistema-ventas-electron.git
git remote add origin https://github.com/TU_USUARIO/NOMBRE_DEL_REPO.git

# 6. Subir los archivos
git push -u origin main
```

> **Nota**: La primera vez que hagas `git push`, te pedirá iniciar sesión con tu cuenta de GitHub en una ventanita emergente. Sigue los pasos y autoriza.
