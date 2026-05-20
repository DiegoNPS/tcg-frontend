# TCG Frontend

Interfaz de TCG Hub, plataforma para descubrir, publicar e inscribirse en torneos de Trading Card Games en Chile. El backend va en otro repositorio (`tcg-backend`).

## Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS 4
- Supabase Auth (solo cliente y refresh de sesion)
- Zod

## Requisitos

- Node.js 20+
- npm
- Backend de TCG corriendo (local o desplegado)

## Instalacion

```bash
npm install
```

Copiar `.env.example` a `.env.local` y completar:

```
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<anon-key>
NEXT_PUBLIC_APP_URL=http://localhost:3000
BACKEND_URL=http://localhost:3001
```

## Comandos

```bash
npm run dev        # localhost:3000
npm run build
npm run start
npm run lint
npm run typecheck
```

## Como consume el backend

El `next.config.ts` define un rewrite que envia todo lo de `/api/*` al `BACKEND_URL`. La pagina hace `fetch("/api/torneos")` y Next la reescribe internamente a `${BACKEND_URL}/api/torneos`. Las cookies de sesion de Supabase viajan automaticamente porque desde el navegador parece mismo origen.

## Rutas principales

- `/` portada
- `/torneos` listado publico con filtros
- `/login`, `/signup` autenticacion
- `/jugador/inscripciones`, `/jugador/perfil`
- `/tienda/dashboard`, `/tienda/nuevo-torneo`, `/tienda/torneos/[id]/editar`
- `/admin`

## Roles

- `jugador` se inscribe a torneos
- `tienda` crea y publica torneos
- `admin` gestiona usuarios, tiendas, torneos e inscripciones
