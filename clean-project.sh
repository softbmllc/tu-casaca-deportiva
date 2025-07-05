#!/bin/bash

echo "🧹 Limpiando archivos innecesarios para producción..."

# Eliminar archivos de sistema macOS
find . -name '.DS_Store' -type f -delete

# Eliminar carpeta de build si aún existe
rm -rf dist

# Verificar que .env no fue trackeado (aunque esté en .gitignore)
if git ls-files | grep .env; then
  echo "⚠️  .env aún está trackeado. Ejecutá git rm --cached .env"
else
  echo "✅ .env correctamente ignorado"
fi

# Verificar que firebase-admin.json no está siendo trackeado
if git ls-files | grep firebase-admin.json; then
  echo "⚠️  firebase-admin.json está siendo trackeado. Ejecutá git rm --cached [ruta]"
else
  echo "✅ firebase-admin.json correctamente ignorado"
fi

echo "✅ Limpieza finalizada. Proyecto listo para deploy en Vercel."