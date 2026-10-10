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

### 3. Habilitar a los responsables (quiénes pueden editar)

Ver el programa no requiere cuenta. Para crear, editar o borrar hay que
ingresar con un link que llega por mail, y solo pueden ingresar las
personas invitadas:

1. En **Authentication → Users → Add user → Create new user**, cargá el
   mail y una contraseña de cada responsable y tildá **Auto Confirm User**.
   Así ingresan con email y contraseña, sin que Supabase tenga que mandar
   mails (el servicio de mail gratis de Supabase manda muy pocos por hora).
   Como alternativa, la app también puede mandar un link de ingreso al mail.
2. En **Authentication → Sign In / Providers**, desactivá **Allow new users
   to sign up** (así nadie más puede crearse una cuenta).
3. En **Authentication → URL Configuration**, poné en **Site URL** la
   dirección donde está publicada la app (y `http://localhost:5173` en
   **Redirect URLs** para desarrollo).

### 4. Configurar las variables de entorno

```
cp .env.example .env
```

Completá `.env` con la URL y la anon key del paso anterior.

### 5. Correr en desarrollo

```
npm run dev
```

### Tests

```
npm test
```

## Estructura del proyecto

```
src/
  data/constants.js        catálogos fijos y datos por defecto
  utils/                    funciones puras (fechas, turnos, carritos, hermanos)
  lib/                      cliente de Supabase y capa de persistencia (storage.js)
  hooks/useAppData.js       carga, guardado sin pisarse y refresco en tiempo real
  hooks/useAuth.js          sesión de los responsables (login por link al mail)
  components/
    Header.jsx, NavTabs.jsx
    turnos/                 formulario, vistas lista / grilla / esta semana
    puntos/
    carritos/
    hermanos/
  styles/                   tokens.css (variables, reset) + components.css
```

## Notas

- **Permisos**: definidos en `supabase/schema.sql`. Leer el programa es
  público; los teléfonos (`contactos-data`) y cualquier escritura requieren
  un responsable logueado. El interruptor "Edición" es solo comodidad
  visual: la protección real la hacen esas policies.
- **Ediciones simultáneas**: cada lista se guarda con compare-and-swap
  sobre `updated_at` (ver `useAppData.mutate`). Si otro usuario guardó en
  el medio, se relee y se reaplica el cambio, así no se pisan. Con Supabase
  Realtime habilitado (lo hace `schema.sql`) las pantallas abiertas se
  actualizan solas; si no, al volver a la pestaña.
- **Migración de esquema**: si cambia la forma de los datos guardados, no
  hay que romper lo ya guardado — agregar o extender una función
  `normalizeX` en `utils/` que adapte el dato viejo al nuevo formato al
  cargarlo.
- **Turnos quincenales y mensuales**: se indica en qué semanas del mes
  salen (1ª y 3ª, 2ª y 4ª, etc.). Eso alimenta la vista "Esta semana" y
  evita falsos conflictos entre turnos de semanas distintas.
- **Pendientes conocidos**: roles dentro de un turno (conductor/anfitrión),
  permisos distintos por rol, y migrar `app_state` a tablas relacionales si
  el volumen de datos crece.
