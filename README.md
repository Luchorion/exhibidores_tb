# Panel de Exhibidores — Talleres Boulogne

App para que la congregación organice la predicación pública con carritos
exhibidores: puntos de predicación, estado de los carritos, hermanos
disponibles y el programa de turnos recurrentes.

- **App publicada**: https://carritos-smoky.vercel.app
- **Código**: https://github.com/Luchorion/exhibidores_tb (rama `main`)
- **Datos y usuarios**: proyecto de Supabase `tffrlxvqsccbuisqapkk`
- **Hosting**: Vercel, proyecto `carritos`. Cada push a `main` se publica
  solo en uno o dos minutos.

Antes vivía como un único artifact de React en Claude.ai. Ahora es un
proyecto Vite + React, con los datos guardados en Supabase y compartidos
entre todos los que usan la app.

---

## Uso diario

### Quién puede hacer qué

| | Sin ingresar | Responsable (con sesión) |
|---|---|---|
| Ver turnos, puntos, carritos y hermanos | ✅ | ✅ |
| Ver teléfonos de los hermanos | ❌ | ✅ |
| Crear, editar y borrar | ❌ | ✅ (con el interruptor **Edición** prendido) |

El interruptor **Edición** solo muestra u oculta los botones. La protección
real la hace Supabase (ver `supabase/schema.sql`): sin sesión, el servidor
rechaza cualquier cambio.

### Ingresar como responsable

Tocar **Ingresar** (arriba a la derecha) y poner email y contraseña. La
sesión queda guardada en ese navegador; no hace falta volver a ingresar
salvo que se toque **Salir** o se borren los datos del navegador.

También existe la opción "mandame un link al mail", pero conviene evitarla:
el servicio de mail gratis de Supabase manda muy pocos mails por hora.

### Agregar un responsable nuevo

1. En Supabase: **Authentication → Users → Add user → Create new user**.
2. Cargar su email y una contraseña, y **tildar "Auto Confirm User"**.
3. Pasarle la contraseña. Ya puede ingresar.

El panel de Supabase no deja ponerle contraseña a un usuario ya creado. Si
alguien no tiene contraseña o se la olvidó, hay que borrar el usuario y
crearlo de nuevo.

### Funciones

- **Turnos**: tres vistas.
  - **Lista**: por día.
  - **Grilla**: semana en columnas.
  - **Esta semana**: los próximos 7 días con fechas reales.
- **Compartir** copia el programa como texto, listo para WhatsApp.
  **Imprimir** sirve también para guardar como PDF.
- **Turnos quincenales y mensuales**: se elige en qué semanas del mes salen
  (1ª y 3ª, 2ª y 4ª, etc.). Si quedan "sin definir", la app asume que pueden
  caer cualquier semana.
- **Avisos al armar un turno**:
  - Conflictos, que se marcan en rojo: el mismo hermano o el mismo carrito
    en dos turnos superpuestos.
  - Advertencias, en amarillo, que no impiden guardar: un hermano no
    aprobado o fuera de su disponibilidad.
- **Carritos**: control físico cada 15 días y revisión de publicaciones
  cada 60, solo para los operativos. "Registrar … hoy" guarda la fecha y la
  suma al historial (se ve tocando la tarjeta). Si un carrito deja de estar
  operativo, se lo quita solo de los turnos.
- **Hermanos**: disponibilidad por día y franja, puntos preferidos y
  teléfono, con botón de WhatsApp. El teléfono solo lo ven los responsables.

---

## Problemas conocidos y soluciones

| Síntoma | Causa | Solución |
|---|---|---|
| "Email o contraseña incorrectos" | Contraseña mal o usuario sin contraseña | Borrar el usuario en Supabase y crearlo de nuevo con contraseña y "Auto Confirm User" |
| "Se pidieron demasiados links seguidos" | Límite de mails de Supabase (pocos por hora) | Esperar ~1 hora o, mejor, ingresar con contraseña |
| El link del mail lleva a `localhost:3000` o a una página que no existe | Falta la dirección en Supabase | **Authentication → URL Configuration**: *Site URL* = `https://carritos-smoky.vercel.app` y en *Redirect URLs* `https://carritos-smoky.vercel.app/**` (ya está hecho) |
| "El link de ingreso venció o ya se usó" | Los links sirven una vez y duran 1 hora | Pedir uno nuevo, o ingresar con contraseña |
| "No tenés permiso para guardar cambios" | No hay sesión iniciada | Ingresar de nuevo |
| "No se pudieron cargar los datos…" (la edición queda bloqueada) | Falló la conexión al abrir la app | Tocar **Reintentar** o recargar. Es a propósito: evita pisar los datos reales con datos vacíos |
| Error de SQL `syntax error at or near "Programa"` | Se pegó en el SQL Editor el texto de **Compartir** en vez del SQL | Copiar el contenido de `supabase/schema.sql` |

---

## Instalación desde cero (otro proyecto de Supabase o otra compu)

### 1. Instalar dependencias

```
npm install
```

### 2. Crear el proyecto de Supabase

1. Crear un proyecto nuevo en [supabase.com](https://supabase.com) (gratis).
2. En el **SQL Editor**, pegar y ejecutar el contenido de
   [`supabase/schema.sql`](supabase/schema.sql). Crea la tabla, los permisos
   y el tiempo real. Se puede volver a correr sin problema.
3. En **Project Settings → API**, copiar la **Project URL** y la clave
   **anon public**.

### 3. Configurar el ingreso

1. **Authentication → Sign In / Providers**: desactivar **Allow new users
   to sign up**, así nadie puede crearse una cuenta.
2. **Authentication → URL Configuration**: *Site URL* con la dirección de la
   app publicada, y en *Redirect URLs* la misma con `/**` al final, más
   `http://localhost:5173/**` para desarrollo. Solo hace falta para los
   links por mail.
3. Crear los responsables como se explica arriba.

### 4. Variables de entorno

```
cp .env.example .env
```

Completar `.env` con la URL y la anon key. En Vercel van las mismas dos
variables: `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.

> Ojo: el `.env` local apunta a la base **real**. Lo que se guarde con
> `npm run dev` y una sesión iniciada cambia los datos de verdad.

### 5. Correr, testear, publicar

```
npm run dev      # app en http://localhost:5173
npm test         # tests (Vitest)
npm run lint     # oxlint
npm run build    # build de producción
```

Publicar = hacer push a `main`; Vercel lo despliega solo.

---

## Estructura del proyecto

```
src/
  data/constants.js        catálogos fijos y datos por defecto
  utils/                   funciones puras (fechas, turnos, carritos, hermanos) + tests
  lib/storage.js           lectura/escritura en Supabase (compare-and-swap)
  lib/supabaseClient.js    cliente de Supabase
  hooks/useAppData.js      carga, guardado sin pisarse y refresco en tiempo real
  hooks/useAuth.js         sesión de responsables (contraseña o link al mail)
  components/
    Header.jsx, NavTabs.jsx, Modal.jsx, ConfirmDialog.jsx, LoginDialog.jsx
    turnos/                formulario, vistas lista / grilla / esta semana
    puntos/  carritos/  hermanos/  info/ (fichas al tocar algo)
  styles/                  tokens.css (colores) + components.css
supabase/schema.sql        tabla, permisos y tiempo real
```

Las notas técnicas para seguir desarrollando están en [`CLAUDE.md`](CLAUDE.md).

## Pendientes

- Roles dentro de un turno (conductor/anfitrión).
- Permisos distintos por responsable (hoy todos pueden editar todo).
- Revisar los turnos quincenales/mensuales viejos y elegirles las semanas
  del mes.
- Si se suman muchos responsables y se usa el link por mail: configurar un
  SMTP propio (por ejemplo, Resend) en Supabase para sacar el límite de
  mails.
