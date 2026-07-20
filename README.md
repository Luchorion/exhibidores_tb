# Panel de Exhibidores — Talleres Boulogne

App para que la congregación organice la predicación pública con carritos
exhibidores: puntos de predicación, estado de los carritos, hermanos
disponibles y el programa de turnos recurrentes.

Antes vivía como un único artifact de React en Claude.ai. Ahora es un
proyecto Vite + React normal, con los datos guardados en Supabase
(compartidos entre todos los que usan la app, como antes).

## Setup

### 1. Instalar dependencias

```
npm install
```

### 2. Crear el proyecto de Supabase

1. Andá a [supabase.com](https://supabase.com) y creá un proyecto nuevo (gratis).
2. En el **SQL Editor** del proyecto, pegá y ejecutá el contenido de
   [`supabase/schema.sql`](supabase/schema.sql). Esto crea la tabla `app_state`
   donde se guardan los puntos, carritos, turnos y hermanos.
3. En **Project Settings → API**, copiá la **Project URL** y la clave
   **anon public**.

### 3. Configurar las variables de entorno

```
cp .env.example .env
```

Completá `.env` con la URL y la anon key del paso anterior.

### 4. Correr en desarrollo

```
npm run dev
```

## Estructura del proyecto

```
src/
  data/constants.js        catálogos fijos y datos por defecto
  utils/                    funciones puras (fechas, turnos, carritos, hermanos)
  lib/                      cliente de Supabase y capa de persistencia (storage.js)
  hooks/useAppData.js       carga inicial + persistencia de puntos/carritos/turnos/hermanos
  components/
    Header.jsx, NavTabs.jsx
    turnos/                 formulario, vista lista, vista grilla, detección de conflictos
    puntos/
    carritos/
    hermanos/
  styles/                   tokens.css (variables, reset) + components.css
```

## Notas

- **Sin login propio todavía**: cualquiera con el link (y la anon key
  embebida en el build) puede leer y escribir los datos. Si en algún
  momento hace falta separar por usuario o rol, hay que agregar Supabase
  Auth y ajustar las policies de `app_state` (hoy son abiertas).
- **Migración de esquema**: si cambia la forma de los datos guardados, no
  hay que romper lo ya guardado — agregar una función `normalizeX` en
  `utils/` (como `normalizeTurno`, `normalizeCarrito`, `normalizePunto`)
  que adapte el dato viejo al nuevo formato al cargarlo. Ese patrón ya
  existe para migrar desde el esquema del artifact original.
- **Pendientes conocidos** (ver `handoff-exhibidores.md` original): roles
  dentro de un turno (conductor/anfitrión), exportar/imprimir el programa,
  permisos por rol, historial de mantenimiento, teléfono de contacto por
  hermano.
