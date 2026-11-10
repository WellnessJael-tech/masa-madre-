# Verifica si CLAUDE.md existe, si no, lo crea
if (-not (Test-Path "CLAUDE.md")) {
@"
# Masa Madre — Proyecto Core

## Arquitectura
- Modular y reutilizable
- Mobile-first
- Sistema de variables de diseño (colores, tipografías) separado del núcleo
- No modificar el núcleo (CORE) sin necesidad real
- Componentes independientes y desacoplados
- No romper funcionalidades existentes al añadir features

## Estructura planeada
- /core -> componentes, logica, carrito, checkout, catalogo, busqueda, filtros, administracion
- /themes -> un tema por cliente (colores, tipografias, logo, identidad visual)

## Reglas de trabajo
- Antes de tocar el core, confirmar que no rompe temas existentes
- Cada cliente nuevo = un theme nuevo, nunca duplicar el core
"@ | Out-File -Encoding utf8 "CLAUDE.md"
Write-Host "CLAUDE.md creado" -ForegroundColor Green
} else {
Write-Host "CLAUDE.md ya existe, no se toca" -ForegroundColor Yellow
}

# Crea la carpeta de skills faltante
New-Item -ItemType Directory -Force -Path ".claude\skills\testing" | Out-Null
Write-Host "Carpeta testing lista" -ForegroundColor Green

# Crea .gitignore si no existe
if (-not (Test-Path ".gitignore")) {
"node_modules" | Out-File -Encoding utf8 ".gitignore"
Write-Host ".gitignore creado" -ForegroundColor Green
} else {
Write-Host ".gitignore ya existe, no se toca" -ForegroundColor Yellow
}

# Muestra el estado actual de archivos
Write-Host "`n--- Archivos en la carpeta ---" -ForegroundColor Cyan
dir

# Prepara y hace commit
git add .
git commit -m "Inicializa proyecto masa madre con CLAUDE.md"

Write-Host "`nListo. Revisa arriba si dice 'files changed'." -ForegroundColor Cyan