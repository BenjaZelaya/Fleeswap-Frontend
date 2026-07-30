# Fleeswap Frontend

Frontend de Fleeswap, una plataforma orientada a publicaciones de objetos, trueques entre usuarios, compras directas, mensajería contextual y moderación administrativa.

Fecha de esta documentación: 30 de julio de 2026.

## Resumen Ejecutivo

Este proyecto implementa una Single Page Application (SPA) sobre React 19 y Vite, con enrutamiento declarativo a través de React Router v7, estado global de autenticación gestionado en memoria con Zustand, comunicación HTTP centralizada mediante Axios con interceptores de renovación transparente de tokens, y mensajería en tiempo real impulsada por Socket.IO.

Hoy el frontend ya expresa con claridad el dominio principal del producto:

- Gestión de usuarios con perfil público, privado y reputación visible.
- Publicaciones con alta, edición, eliminación, filtros avanzados, recomendaciones y sistema de reporte por moderación.
- Solicitudes de trueque y compra directa organizadas en un panel unificado de intercambios.
- Flujo transaccional completo: aceptación, rechazo, confirmación bilateral y cancelación.
- Chat en tiempo real limitado al contexto de un intercambio activo.
- Centro de notificaciones persistente y realtime con navegación contextual por hashes.
- Panel administrativo para usuarios, publicaciones, reportes y métricas.

La base arquitectónica es buena: hay separación por capas dentro de un esquema de _feature slices_, abstracción de servicios HTTP independientes por dominio, desacoplamiento de componentes de UI y optimización de renderizado. Al mismo tiempo, el proyecto presenta oportunidades de consolidación en modularización de componentes extensos y expansión de tests E2E. El detalle está en [docs/PROJECT-STATUS.md](docs/PROJECT-STATUS.md).

## Stack Tecnologico

- React 19
- Vite 6
- React Router v7
- Zustand 5
- Axios
- Socket.IO Client
- Tailwind CSS v4
- Framer Motion
- Lucide React
- Sonner (toasts)
- React Helmet Async
- Cypress

## Objetivo del Sistema

Fleeswap busca resolver un flujo de intercambio y/o venta de objetos entre personas, con foco en:

- publicar objetos con historia, categoría, condición, precio e imágenes;
- permitir propuestas entre usuarios sobre publicaciones disponibles;
- soportar tanto trueque como compra directa;
- habilitar comunicación en tiempo real cuando una solicitud se activa;
- ofrecer visualización clara del estado de cada propuesta sin fricciones de recarga de página;
- moderar contenido y comportamiento mediante reportes y herramientas de administración.

## Estado Actual del Producto

### Funcionalidades implementadas

- Registro y login de usuarios con ingreso directo post-registro y token en memoria.
- Renovación transparente del access token por cookie httpOnly vía Axios interceptor.
- Cierre de sesión centralizado con limpieza de estado en memoria y localStorage.
- Cambio y recuperación de contraseña con token.
- Perfil propio y perfil público accesible por URL.
- Actualización de perfil con foto vía Cloudinary, biografía y localidad.
- Alta, edición, eliminación, listado y detalle de publicaciones.
- Filtros por categoría, tipo (venta/trueque/ambos), condición y texto con debounce.
- Recomendaciones de publicaciones personalizadas en Home por preferencias de categorías.
- Solicitudes de intercambio (con objeto propio y monto adicional opcional) y compra directa.
- Panel unificado de Mis Intercambios con pestañas por estado (Pendientes, En Curso, Finalizados/Cancelados).
- Diferenciación visual clara en tarjetas de intercambio entre rol comprador y vendedor.
- Actualización silenciosa de estados en segundo plano sin parpadeos ni recargas de página.
- Confirmación bilateral para trueques y confirmación directa para compras.
- Cancelación de solicitudes pendientes o activas.
- Chat por Socket.IO para intercambios activos, con historial navegable y modo solo lectura al cerrar.
- Centro de notificaciones persistente con contador de no leídas, marcado individual/masivo y navegación con hashes (`#recibidas`, `#enviadas`).
- Búsquedas activas por palabras clave con coincidencia automática y notificación.
- Modal de calificación post-intercambio a nivel de página (resistente a cambios de pestaña).
- Endpoints y vistas administrativas para usuarios, publicaciones, reportes y métricas.

### Funcionalidades parciales o pendientes

- Verificación de email: el backend genera el token y envía el email; el frontend soporta el estado en el store pero no cuenta con la pantalla dedicada de verificación de email.
- Cobertura completa E2E: Cypress se encuentra instalado y configurado en el repositorio (`npm run cy:open`), listo para la adición de especificaciones automatizadas.
- Paginación del historial de chat: actualmente carga el historial completo enviado por el backend.

## Alineación con el Backlog MVP

Tomando como referencia el Product Backlog MVP, el frontend actual se alinea de esta forma:

- Épica 1 - Gestión de Usuarios y Perfiles: alineación alta.
- Épica 2 - Gestión de Publicaciones: alineación alta.
- Épica 3 - Sistema de Intercambio: alineación alta.
- Épica 4 - Chat en Tiempo Real: alineación alta.
- Épica 5 - Búsqueda Activa y Notificaciones: alineación alta.
- Épica 6 - Sistema de Reputación: alineación alta.

### Detalle por épica

#### Épica 1 - Gestión de Usuarios y Perfiles

Cobertura actual:

- registro, login, refresh y logout;
- formulario de registro con validaciones de cliente (regex email, contraseña, edad mínima 18 años);
- inicio de sesión con persistencia segura en memoria;
- redirección inteligente a la ruta intentada originalmente (`location.state.from`);
- perfil propio y perfil público con publicaciones activas del usuario;
- edición de perfil con avatar Cloudinary, biografía y selección de localidad.

#### Épica 2 - Gestión de Publicaciones

Cobertura actual:

- crear, editar, eliminar y cambiar estado de publicaciones propias;
- ver detalle y catálogo público;
- filtros por categoría, tipo, condición y búsqueda por texto con debounce;
- carrusel de imágenes y datos de usuario en detalle;
- reporte de publicaciones con prevención de duplicados.

#### Épica 3 - Sistema de Intercambio

Cobertura actual:

- envío de solicitudes de trueque y compra;
- modal de intercambio de 3 pasos para elegir publicación propia a ofrecer y dinero adicional;
- botón de compra directa para publicaciones de tipo venta;
- bandeja unificada `/mis-intercambios` con filtrado dinámico;
- botones de acción contextuales: Aceptar, Rechazar, Confirmar, Cancelar, Calificar;
- badges de estado semánticos con tratamiento especial (rojo) para intercambios cancelados o con publicaciones eliminadas.

Reglas ya cubiertas:

- bloqueo de acciones sobre publicaciones propias (autointercambio/autocompra);
- actualización silenciosa de UI al cambiar estados;
- tratamiento defensivo de publicaciones eliminadas por moderación.

#### Épica 4 - Chat en Tiempo Real

Cobertura actual:

- acceso al chat solo para participantes del intercambio;
- habilitación del chat solo cuando el intercambio está `active`;
- mensajería en tiempo real con Socket.IO gestionada con `useRef` para evitar reconexiones;
- deshabilitación automática del input de chat con banner informativo al completarse o cancelarse la operación (`chat:readonly`).

#### Épica 5 - Búsqueda Activa y Notificaciones

Cobertura actual:

- descubrimiento por categorías preferidas para recomendaciones en Home;
- formulario de creación y gestión de búsquedas activas por palabras clave;
- recepción de notificaciones en tiempo real vía socket (`notification:new`) con indicador visual en la barra de navegación;
- centro de notificaciones con historial, marcado individual/masivo y estado de lectura;
- redirección inteligente desde notificaciones hacia las pestañas específicas de `/mis-intercambios#recibidas` o `#enviadas`.

#### Épica 6 - Sistema de Reputación

Cobertura actual:

- modal de calificación (`RatingModal`) que permite asignar puntuación (1 a 5 estrellas) y comentario;
- modal abierto a nivel de vista principal para evitar desmontajes involuntarios al cambiar el estado del intercambio;
- visualización de reputación promedio y total de calificaciones en el perfil público del usuario;
- prevención de doble calificación mediante verificación remota y caché local en `localStorage`.

Historias correctivas incorporadas:

- `HU6.4` Historial completo de chat:
  asegurar visualización íntegra del historial con orden cronológico correcto y rendimiento estable.
- `HU6.5` Bloqueo por publicación reportada:
  despliegue de banners informativos y deshabilitación de acciones cuando una publicación o intercambio asociado entra en revisión por reportes.

## Arquitectura

La aplicación sigue una estructura en capas dentro de una organización por _feature slices_:

- `src/routes`: define las rutas de la aplicación, layouts y guardas de acceso.
- `src/features/<dominio>/pages`: vistas principales asociadas a cada ruta.
- `src/features/<dominio>/services`: capas de llamadas a la API REST.
- `src/features/<dominio>/components`: componentes visuales específicos del dominio.
- `src/shared/components`: componentes transversales (layout, botones, modales genéricos, skeletons).
- `src/shared/utils`: utilidades puras, constantes globales, validadores de expresiones regulares y formateadores.
- `src/store`: estado global compartido mediante Zustand (`authStore`, `notificationStore`).
- `src/services`: configuración centralizada de Axios (`api.js`) y parámetros de entorno (`runtimeConfig.js`).

### Flujo de navegación y renderizado

1. `main.jsx` inicializa React en la raíz del DOM.
2. `App.jsx` ejecuta `bootstrapAuth()` al montar la aplicación para intentar recuperar la sesión silenciosamente invocando `POST /api/auth/refresh`.
3. Mientras la verificación de autenticación está en curso, se muestra un `PageSpinner`.
4. Una vez resuelto el estado de autenticación, se renderiza el `AppRouter` dentro de `HelmetProvider` y `ErrorBoundary`.
5. `AppRouter` utiliza `Suspense` y `lazy` para cargar dinámicamente el código de cada página según la ruta activa.

### Principios que ya se observan en el código

- Páginas delgadas que delegan lógica a servicios y hooks.
- Servicios aislados por dominio que abstraen Axios.
- Estado de sesión guardado estrictamente en memoria (Zustand) para prevenir vulnerabilidades XSS.
- Componentes visuales desacoplados de prop-drilling excesivo.
- Uso de constantes globales (`PUBLICATION_AVAILABLE_STATUSES`) y utilidades puras (`formatCurrency`).

## Estructura del Repositorio

```text
src/
  App.jsx
  main.jsx
  index.css
  features/
    admin/
      pages/
      services/
    auth/
      components/
      pages/
      services/
    notifications/
      hooks/
      pages/
      services/
    profile/
      components/
      pages/
      services/
    publications/
      components/
      pages/
      services/
    ratings/
      components/
      services/
    search/
      pages/
      services/
    solicitudes/
      components/
        chat/
        exchange-card/
      pages/
      services/
  pages/
  routes/
  services/
  shared/
    assets/
    components/
      forms/
      layout/
      ui/
    hooks/
    utils/
  store/
docs/
  PROJECT-STATUS.md
  TESTING.md
```

## Seguridad

La base de seguridad actual incluye:

- almacenamiento del token de acceso únicamente en memoria (Zustand), no expuesto en `localStorage` o `sessionStorage`;
- renovación del token mediante cookie `httpOnly` gestionada por el navegador;
- sanitización de datos de entrada mediante validadores de longitud y expresiones regulares antes del envío HTTP;
- guardas de enrutamiento (`ProtectedRoute`) que bloquean el renderizado de vistas privadas o administrativas sin sesión activa;
- sanitización de redirecciones internas (`getSafeRedirectPath`) para evitar ataques de redirección abierta o loops hacia `/login`.

## API Overview (Endpoints Consumidos)

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `PATCH /api/auth/change-password`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

### Users

- `GET /api/users/me`
- `GET /api/users/:id`
- `PATCH /api/users/me/profile`
- `DELETE /api/users/me`

### Publications

- `GET /api/publications`
- `GET /api/publications/recommendations`
- `GET /api/publications/:id`
- `GET /api/users/me/publications`
- `POST /api/publications`
- `PATCH /api/publications/:id`
- `DELETE /api/publications/:id`
- `PATCH /api/publications/:id/status`
- `POST /api/publications/:id/report`

### Exchanges

- `GET /api/exchanges/received`
- `GET /api/exchanges/sent`
- `GET /api/exchanges/history`
- `GET /api/exchanges/:id`
- `POST /api/exchanges`
- `PATCH /api/exchanges/:id/accept`
- `PATCH /api/exchanges/:id/reject`
- `PATCH /api/exchanges/:id/confirm`
- `PATCH /api/exchanges/:id/cancel`

### Chat & Messages

- `GET /api/exchanges/:id/messages`

### Notifications

- `GET /api/notifications`
- `PATCH /api/notifications/:id/read`
- `PATCH /api/notifications/read-all`

### Reviews & Reputation

- `POST /api/reviews`
- `GET /api/reviews/received`

### Active Searches

- `GET /api/active-searches`
- `POST /api/active-searches`
- `PATCH /api/active-searches/:id`
- `DELETE /api/active-searches/:id`

### Admin

- `GET /api/admin/stats`
- `GET /api/admin/users`
- `PATCH /api/admin/users/:id/status`
- `PATCH /api/admin/users/:id/role`
- `GET /api/admin/publications`
- `PATCH /api/admin/publications/:id/status`
- `DELETE /api/admin/publications/:id`
- `GET /api/admin/reports`
- `PATCH /api/admin/reports/:id/resolve`

## Eventos de Socket.IO

Autenticación:

- el cliente envía el access token en `handshake.auth.token`.

Eventos soportados:

- `chat:join`
- `chat:enabled`
- `chat:message`
- `chat:readonly`
- `notification:new`

Entrega actual en frontend:

- conexión persistente a nivel de aplicación (`useNotificationSocket`);
- recepción realtime en room privada del usuario para notificaciones de coincidencias e intercambios;
- chat aislado por sala de intercambio activo (`chat:join`);
- deshabilitación automática del input en tiempo real ante evento `chat:readonly`.

## Variables de Entorno

Las variables observadas en el código son:

```env
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

## Ejecucion Local

### Instalacion

```bash
npm install
```

### Desarrollo

```bash
npm run dev
```

### Build de produccion

```bash
npm run build
```

### Preview del build

```bash
npm run preview
```

### Tests E2E (Cypress)

```bash
# Modo interactivo
npm run cy:open

# Modo Headless
npm run cy:run
```

### Lint

```bash
npm run lint
```

## Calidad y Testing

El proyecto cuenta con configuración de testing E2E basada en Cypress e higiene de código mediante ESLint.

La base ya no presenta código muerto ni duplicación de formateo.

Para detalle de comandos, mapa de suites E2E, pruebas manuales con navegador, convenciones y cobertura por épica, ver [docs/TESTING.md](docs/TESTING.md).

## Situacion Actual

En terminos de madurez, el frontend hoy se encuentra en una etapa avanzada:

- el dominio principal ya está construido e integrado;
- la arquitectura es saludable y mantenible;
- la UX es fluida sin recargas de página innecesarias;
- quedan oportunidades menores de consolidación (modularización de modales complejos y expansión de specs Cypress).

Para una lectura detallada del estado real del proyecto, ver [docs/PROJECT-STATUS.md](docs/PROJECT-STATUS.md).
