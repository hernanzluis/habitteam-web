# HabitTeam Web — habitteam.app

Panel de administración web y landing page para HabitTeam, plataforma de hábitos compartidos con validación social.

## Stack

- React 18 + Create React App
- React Router v6
- Tailwind CSS v3
- Supabase (PostgreSQL + Auth + Storage)
- i18next (ES / EN)
- Desplegado en Vercel → [habitteam.app](https://habitteam.app)

## Estado actual (junio 2025)

### Landing page (`/`)
- Hero, Cómo funciona, Características, Pricing (freemium), CTA, Footer
- Banner de "producto en desarrollo" con enlace a lista de espera
- Navegación con scroll suave y cambio de idioma ES/EN

### Panel de administración (`/admin`)
- Acceso restringido a usuarios con `role = 'admin'`
- **Actividad** — dashboard del grupo: métricas diarias/semanales, tarjetas por miembro con racha, círculos L-D con tres estados (gris/amarillo/verde según validación), foto más reciente
- **Detalle de miembro** (`/admin/miembro/:userId`) — calendario mensual navegable con tres estados de color, hábitos asignados con racha individual y miniaturas de fotos, últimas validaciones recibidas
- **Miembros** — lista de miembros activos, invitaciones pendientes, generación de códigos de activación
- **Hábitos** — gestión de hábitos activos del grupo
- **Categorías** — gestión de categorías con icono y color

### Lógica de colores (círculos y calendario)
- 🔘 Gris → sin log ese día
- 🟡 Amarillo → log registrado pero sin validación `validated`
- 🟢 Verde → log con al menos una validación `validated`

## Estructura

```
src/
├── components/
│   ├── Nav.jsx
│   └── admin/
│       ├── Activity.jsx
│       ├── Members.jsx
│       ├── Habits.jsx
│       └── Categories.jsx
├── pages/
│   ├── Home.jsx
│   ├── Acceder.jsx
│   ├── Admin.jsx
│   └── MemberDetail.jsx
├── lib/
│   └── supabase.js
└── locales/
    ├── es.json
    └── en.json
```

## Desarrollo local

```bash
npm install
npm start
```

## Build

```bash
npm run build
```
