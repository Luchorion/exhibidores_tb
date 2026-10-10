# Notas para trabajar en este proyecto

Panel de Exhibidores de la congregación Talleres Boulogne: Vite + React 19,
datos en Supabase, publicado en Vercel. Ver [README.md](README.md) para el
uso, la administración y la solución de problemas.

## Contexto

- **Usuario**: Luciano (Luchorion), responsable de la app. Habla español
  rioplatense y no es programador: explicarle en criollo y con pasos
  concretos de qué tocar en Supabase o Vercel.
- **Producción**: https://carritos-smoky.vercel.app. Vercel (proyecto
  `carritos`) publica automáticamente cada push a `main`.
- **Supabase**: proyecto `tffrlxvqsccbuisqapkk`. El `.env` local apunta a la
  base REAL: no guardar datos de prueba con sesión iniciada. Leer está
  bien.
- **Antes de pushear a `main`, preguntar**: pushear = publicar. Commitear
  localmente está bien cuando lo pide.

## Historial relevante (octubre 2026)

1. Auditoría completa: guardado con compare-and-swap, login, permisos,
   bugs, conflictos por carrito, semanas del mes, vista "Esta semana",
   compartir/imprimir, teléfonos, historial de mantenimiento, accesibilidad,
   tests (commit `0d9ecc3`).
2. Se corrió `supabase/schema.sql` en producción: las policies están
   cerradas y Realtime está activo.
3. El login por link al mail chocó con el límite de mails del SMTP gratis
   de Supabase. Se agregó el ingreso con email + contraseña, que es el
   modo principal (commit `6b43d7d`). Los usuarios se crean en el panel con
   "Auto Confirm User".
4. URL Configuration de Supabase: Site URL = la de producción; Redirect URLs
   = `https://carritos-smoky.vercel.app/**`.

## Arquitectura de datos

Tabla clave-valor `app_state(key, value jsonb, updated_at)`. Cada clave es
una lista entera:

| key | contenido | lectura |
|---|---|---|
| `puntos-data` | `{id, nombre, observaciones}` | pública |
| `carritos-data` | `{id, numero, estado: operativo/repuesto/pendiente, ubicacion, portada, ultimoControlFisico, ultimaRevisionPublicaciones, historial: [{tipo: control/revision, fecha}], notas}` | pública |
| `turnos-data` | `{id, dia, frecuencia, semanas: [1-5], horaInicio, horaFin, puntoId, carritoIds, hermanoIds, conductorLibre, estado: confirmado/propuesto, notas}` | pública |
| `hermanos-data` | `{id, nombre, estado: aprobado/pendiente/no_aprobado, fechaAprobacion, disponibilidad: ["Lunes mañana", …], puntosPreferidos, notas}` | pública |
| `contactos-data` | `{id: hermanoId, telefono}` | **solo con sesión** |

Escribir requiere estar autenticado (policies `to authenticated`).

## Invariantes: no romper

- **Guardar siempre con `mutate(name, fn)`** (`hooks/useAppData.js`). Hace
  compare-and-swap sobre `updated_at`; si hay conflicto, relee y reaplica
  `fn`. Por eso `fn` tiene que ser pura y determinística: generar los ids
  nuevos (`uid()`) **afuera** de `fn`. Nunca escribir con `setData` directo.
- `mutate` devuelve `true`/`false`. Los formularios solo se cierran si da
  `true`; si falla, deshace el cambio en pantalla.
- Si la carga inicial falla (`loadError`), la edición queda bloqueada. No
  mostrar defaults como si fueran datos reales: un guardado los pisaría.
- **El teléfono NO va en `hermanos-data`**, que es pública. Va en
  `contactos-data`; `App.jsx` los junta para mostrar y los separa al
  guardar.
- **Datos viejos**: nunca romper lo guardado. Adaptarlo al cargar con
  `normalizeX` en `utils/` (idempotente y con test).
- **Fechas**: usar `hoyISO()`/`toISODate()` de `utils/dates.js`, nunca
  `toISOString().slice(0,10)`: es UTC y en Argentina después de las 21 h da
  el día siguiente.
- Un carrito que deja de ser `operativo` se quita de los turnos
  (`saveCarrito` en `App.jsx`). Borrar un hermano o un punto limpia sus
  referencias.
- Conflictos (`computeConflictMap`): mismo hermano o mismo carrito en
  turnos superpuestos que comparten alguna semana del mes
  (`semanasEfectivas`). Lo de disponibilidad y aprobación son advertencias
  (`advertenciasTurno`), no conflictos.

## Convenciones

- UI y comentarios en español rioplatense ("podés", "tocá"). Los
  comentarios explican el *por qué*.
- Estilos: clases `exh-*` en `styles/components.css`, colores en
  `tokens.css`. Responsive: bloque `@media (max-width: 640px)` al final.
  Impresión: `@media print`; usar la clase `exh-no-print` para ocultar
  controles.
- Accesibilidad: modales con `Modal.jsx` (Escape, foco atrapado), labels
  con `htmlFor` + `useId`, botones de ícono con `aria-label`, tarjetas
  clickeables con `clickableProps()` de `utils/a11y.js`. Borrar siempre con
  `ConfirmDialog`.
- Edición: `useEdicion()` (contexto). Fichas de info: `useInfoPanel()`.

## Verificar antes de dar algo por terminado

```
npx oxlint && npm test && npm run build
```

Para ver la app: `.claude/launch.json` tiene la config `dev` (puerto 5173).
Con `.env` presente, carga los datos reales en modo lectura.

## Pendientes

- Roles dentro de un turno (conductor/anfitrión) y permisos por responsable.
- Turnos quincenales/mensuales viejos con `semanas: []` ("sin definir").
- SMTP propio en Supabase si se vuelve a usar el link por mail.
- Migrar `app_state` a tablas relacionales solo si el volumen crece mucho
  (el compare-and-swap ya evita pisarse).
