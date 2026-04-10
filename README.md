# Entre letras y matcha

Blog personal de reseñas de libros · Next.js + Notion CMS · Deploy en Vercel

## Setup

1. Clonar el repositorio
2. Instalar dependencias: `npm install`
3. Copiar `.env.example` como `.env.local` y llenar el token de Notion
4. Correr en desarrollo: `npm run dev`

## Variables de entorno (en Vercel)

- `NOTION_TOKEN` — Integration token de Notion
- `NOTION_DB_LIBROS` — ID base de datos libros
- `NOTION_DB_VINETAS` — ID base de datos viñetas
- `NOTION_DB_RINCON` — ID base de datos rincón
- `NOTION_DB_LEYENDO` — ID base de datos leyendo ahora
- `NOTION_DB_ORDENES` — ID base de datos órdenes de lectura

## Rutas

- `/` — Home con todos los contenidos
- `/resena/[slug]` — Detalle de reseña de libro
- `/vineta/[slug]` — Detalle de viñeta
- `/rincon/[slug]` — Detalle de post personal
- `/orden/[slug]` — Orden de lectura de saga
