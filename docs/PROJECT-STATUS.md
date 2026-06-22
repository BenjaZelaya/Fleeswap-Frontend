# Project Status

Última actualización: 2026-06-10

## Resumen

El frontend tiene cubiertos los flujos principales de producto:

- autenticación con refresh token
- publicaciones y exploración
- solicitudes de intercambio y compra
- chat por Socket.IO
- notificaciones
- búsquedas activas

El estado general es funcional, pero la integración con backend sigue teniendo puntos frágiles que conviene monitorear porque pueden verse como "fallas del front" aunque el origen real sea una combinación de contrato de API, cookies o configuración de URLs.

## Decisiones de Consistencia

Se definieron criterios transversales para corregir inconsistencias de copy, auth y sistema visual sin rediseñar el producto completo.

### 1. UX writing y acentuación

Decisión:

- usar español rioplatense con voseo
- mantener UTF-8 real con tildes, `ñ/Ñ` y signos de apertura
- sostener un tono breve, claro y cercano

Impacto esperado:

- menos mezcla entre tuteo y voseo
- menos ruido editorial entre pantallas hermanas
- menor riesgo de textos rotos o degradados por ASCII innecesario

Áreas prioritarias:

- auth
- navegación
- modales
- toasts
- formularios con mensajes de error y ayuda

### 2. Flujo auth como una sola familia visual

Decisión:

- `Login`, `Register`, `ForgotPassword`, `ResetPassword` y `ChangePassword` deben respetar el mismo patrón visual
- `AuthLayout`, `FormField`, `PasswordInput` y `SubmitButton` son la base visual del flujo
- labels, links secundarios y mensajes de estado no deberían redefinirse con estilos manuales incompatibles

Problemas detectados:

- labels manuales que rompen la escala del formulario
- mezcla de `gray-*` con `slate-*`
- uso alternado de `brand` y `brand-accent` para links equivalentes
- mezcla de tuteo y voseo dentro del mismo flujo

### 3. Sistema visual semántico

Decisión:

- `brand`: CTA primario, navegación principal y confirmación positiva estándar
- `brand-light`: hover del primario
- `brand-accent`: acento visual secundario
- `blue-*`: información
- `red/rose-*`: peligro o destructivo
- `amber-*`: advertencia o pendiente
- `emerald-*`: éxito o resolución
- `slate-*`: base neutral de textos, bordes y superficies

Problemas detectados:

- acciones positivas estándar resueltas con `blue-*` en lugar de `brand`
- confirmaciones duplicadas con estilos distintos
- badges y tipos resueltos con azules, púrpuras e índigos sin una regla global
- componentes visualmente correctos en aislamiento, pero inconsistentes entre sí

### 4. Confirmaciones y modales

Decisión:

- priorizar un solo `ConfirmModal` compartido
- reservar estilos destructivos para `danger`
- usar el primario de marca para confirmaciones por defecto

Problemas detectados:

- el modal compartido hoy confirma con azul genérico
- existen modales locales duplicados en features específicas
- logout y otras confirmaciones importantes no respetan el mismo lenguaje visual que el resto de la app

## Orden propuesto de implementación

### Etapa 1. Texto y codificación

- corregir acentuaciones y `ñ` visibles al usuario
- unificar voseo
- revisar textos compartidos del flujo auth y navegación

### Etapa 2. Auth y login

- normalizar `Login`, `Register`, `ForgotPassword`, `ResetPassword` y `ChangePassword`
- eliminar estilos manuales que rompen `AuthLayout`
- unificar colores de links, labels y mensajes de estado

### Etapa 3. Confirmaciones y logout

- ajustar `ConfirmModal` al sistema `brand`
- usar el componente compartido en lugar de variantes locales
- revisar logout, eliminación, suspensión, descarte y confirmaciones equivalentes

### Etapa 4. Sistema cromático transversal

- reservar `blue-*` para info
- mover CTAs primarios inconsistentes a `brand`
- revisar badges, avatares, alertas y estados por tipo

## Lo que está implementado

- Rehidratación de sesión al iniciar la app
- Interceptor global de Axios con refresh singleton
- Rutas protegidas
- Exploración de publicaciones con filtros y paginación
- Solicitudes de intercambio y compra
- Mensajería en tiempo real
- Notificaciones por socket
- CRUD de búsquedas activas

## Riesgos y deuda tecnica prioritaria

### 1. Configuración de URLs para REST y sockets

Estado:

- REST usa `VITE_API_URL`
- sockets usan `VITE_SOCKET_URL` o derivan desde `VITE_API_URL`

Riesgo:

- si producción usa `/api` sin proxy same-origin en Vercel, el refresh y los sockets quedan mal resueltos aunque el código del front sea correcto

Impacto:

- fallas de notificaciones
- fallas de chat
- percepción de que "el backend no responde"

Decisión aplicada:

- `VITE_BACKEND_URL` deja de formar parte del contrato del frontend
- `VITE_API_URL` queda como única base REST
- `VITE_SOCKET_URL` pasa a ser opcional y explícita
- si falta `VITE_SOCKET_URL`, el front deriva la raíz del socket desde `VITE_API_URL` removiendo `/api`
- el proxy same-origin de Vercel debe configurarse fuera del repo para no exponer la URL real del backend en código fuente
- en desarrollo local, Vite proxyea `/api/*` y `/socket.io/*` a `http://localhost:3000`
- en producción se aceptó como tradeoff exponer `https://fleeswap-backend.onrender.com` en `vercel.json` para sostener same-origin en el navegador sin reintroducir `VITE_BACKEND_URL`

Archivos:

- [src/services/api.js](/d:/Programacion/Proyecto-final/Fleeswap-Frontend/src/services/api.js)
- [src/features/notifications/hooks/useNotificationSocket.js](/d:/Programacion/Proyecto-final/Fleeswap-Frontend/src/features/notifications/hooks/useNotificationSocket.js)
- [src/features/solicitudes/hooks/useChatSocket.js](/d:/Programacion/Proyecto-final/Fleeswap-Frontend/src/features/solicitudes/hooks/useChatSocket.js)

### 2. Dependencia fuerte de cookies para refresh

Estado:

- el front necesita `withCredentials: true`
- la sesión se rehidrata vía `POST /auth/refresh`
- local y producción deben intentar resolver el refresh como same-origin para evitar fallas de persistencia

Riesgo:

- si el browser no guarda o no envía la cookie, caen las llamadas protegidas luego de recargar

Impacto:

- sesiones que "desaparecen"
- 401 encadenados
- confusión entre error de auth y error de negocio

Archivos:

- [src/services/api.js](/d:/Programacion/Proyecto-final/Fleeswap-Frontend/src/services/api.js)
- [src/App.jsx](/d:/Programacion/Proyecto-final/Fleeswap-Frontend/src/App.jsx)

### 3. Contratos de respuesta inconsistentes

Estado:

- algunas pantallas aceptan múltiples formas de respuesta
- otras asumen una única forma

Riesgo:

- listas vacías falsas
- errores en tiempo de ejecución
- flujos de edición que no encuentran el elemento esperado

Archivos:

- [src/features/search/services/activeSearchService.js](/d:/Programacion/Proyecto-final/Fleeswap-Frontend/src/features/search/services/activeSearchService.js)
- [src/features/search/pages/MisBusquedasActivas.jsx](/d:/Programacion/Proyecto-final/Fleeswap-Frontend/src/features/search/pages/MisBusquedasActivas.jsx)
- [src/features/search/pages/CrearBusquedaActiva.jsx](/d:/Programacion/Proyecto-final/Fleeswap-Frontend/src/features/search/pages/CrearBusquedaActiva.jsx)
- [src/features/notifications/store/notificationStore.js](/d:/Programacion/Proyecto-final/Fleeswap-Frontend/src/features/notifications/store/notificationStore.js)

### 4. Manejo de errores mejorable

Estado:

- varios `catch` muestran mensajes genéricos

Riesgo:

- se oculta el status real
- se pierde tiempo diagnosticando 400, 401, 409 y 500 como si fueran lo mismo

Impacto:

- debugging más lento
- menos observabilidad desde DevTools y QA manual

Archivos:

- [src/features/search/pages/CrearBusquedaActiva.jsx](/d:/Programacion/Proyecto-final/Fleeswap-Frontend/src/features/search/pages/CrearBusquedaActiva.jsx)
- [src/features/search/components/BusquedaItem.jsx](/d:/Programacion/Proyecto-final/Fleeswap-Frontend/src/features/search/components/BusquedaItem.jsx)

## Hallazgos concretos del front

### Búsquedas activas

- El payload del formulario sale bastante controlado: `category`, `keywords` normalizadas y `type`.
- El punto delicado no es tanto el payload, sino la forma de respuesta que vuelve del backend.
- La pantalla de listado asume array directo.
- La pantalla de edición usa `.find()` sobre el retorno sin normalizarlo primero.

### Publicaciones

- `Home` y `Explore` ya tienen cierta tolerancia a respuestas con `publications`, `items` o `data`.
- Esa estrategia todavía no está unificada en todo el proyecto.

### Notificaciones

- El store espera `notifications` y `unreadCount` exactos.
- Si el backend cambia naming o envelope, la UI no explota necesariamente, pero queda desfasada o vacía.

### Chat y sockets

- El socket depende de la URL base correcta y de un token valido.
- El contrato nuevo evita que Socket.IO caiga en una URL REST con `/api`.
- Un problema de socket no explica por sí solo un 500 REST, pero sí puede mezclar síntomas y generar ruido durante la revisión.

## Checklist de revisión rápida

### Auth

- `POST /auth/refresh` responde correctamente
- el navegador guarda la cookie refresh
- el request de refresh envia cookie
- luego del refresh se actualiza el token en store
- `GET /users/me` funciona después de rehidratar

### Active Searches

- `GET /active-searches` devuelve la forma esperada por el front
- `POST /active-searches` recibe `category`, `type`, `keywords`
- editar búsqueda encuentra correctamente la búsqueda por `id`
- toggle y delete muestran el status real ante error

### Notifications

- el socket conecta a la URL correcta
- `GET /notifications` devuelve `notifications` y `unreadCount`
- al conectar socket se sincroniza el store

## Siguiente mejora recomendada

La mejora con mejor retorno hoy es centralizar normalización de respuestas y exponer mejor los errores HTTP reales. Eso reduciría mucho el tiempo de diagnóstico cuando algo "parece 500 desde el front".

## Cambios recientes en auth y persistencia

- el entorno local pasó a usar `VITE_API_URL=/api`
- Vite ahora proxyea `/api/*` y `/socket.io/*` al backend local
- `App.jsx` dejó de ejecutar `logout()` al fallar la rehidratación inicial y ahora limpia solo el token en memoria con `clearToken()`
- la persistencia real sigue dependiendo del refresh token en cookie, no de guardar el access token en storage
