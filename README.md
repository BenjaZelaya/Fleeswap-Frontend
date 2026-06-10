# Fleeswap Frontend

Frontend de Fleeswap construido con React + Vite. Este repositorio concentra la experiencia web para autenticación, publicaciones, exploración, intercambios, chat, notificaciones y búsquedas activas.

## Stack

- React
- Vite
- React Router
- Axios
- Zustand
- Socket.IO Client
- Tailwind CSS

## Puesta en marcha

### Requisitos

- Node.js 18+
- npm
- Backend de Fleeswap disponible

### Instalación

```bash
npm install
```

### Variables de entorno

Archivo `.env` de referencia:

```env
VITE_API_URL=/api
VITE_SOCKET_URL=
VITE_CLOUDINARY_CLOUD_NAME=
VITE_CLOUDINARY_UPLOAD_PRESET=
VITE_FAVICON=
```

Notas importantes:

- `VITE_API_URL` es la única base REST del frontend. En producción debería ser `/api`.
- `VITE_SOCKET_URL` es opcional. Si no se define, el front la deriva desde `VITE_API_URL` quitando `/api`.
- El frontend ya no usa `VITE_BACKEND_URL` para evitar mezclar same-origin y llamadas directas al backend.
- En desarrollo local, Vite proxyea `/api/*` y `/socket.io/*` a `http://localhost:3000` para que auth, refresh y sockets funcionen same-origin.
- En producción, Vercel proxyea `/api/*` y `/socket.io/*` a `https://fleeswap-backend.onrender.com`.
- Esa URL queda expuesta en infraestructura mediante `vercel.json`, lo cual no es ideal, pero es preferible a volver a introducir `VITE_BACKEND_URL` en el runtime público del frontend.
- El front depende de cookies para `POST /auth/refresh`, así que frontend y backend deben estar correctamente permitidos por CORS.

### Desarrollo

```bash
npm run dev
```

Con la configuración actual, el frontend local corre en Vite y resuelve:

- `/api/*` -> backend local `http://localhost:3000`
- `/socket.io/*` -> backend local `http://localhost:3000`

Eso evita que el refresh token dependa de cookies cross-origin durante el desarrollo.

### Build

```bash
npm run build
```

## Estructura principal

```text
src/
  features/
    auth/
    notifications/
    profile/
    publications/
    search/
    solicitudes/
  pages/
  routes/
  services/
  shared/
  store/
  utils/
```

## Flujos sensibles del proyecto

### Autenticación y refresh

- El access token vive en memoria dentro de Zustand.
- El refresh token vive en cookie httpOnly manejada por backend.
- Al iniciar la app, `App.jsx` intenta rehidratar sesión con `POST /auth/refresh`.
- Si el refresh funciona, se actualiza el token y luego se pide `GET /users/me`.

Archivos clave:

- [src/App.jsx](/d:/Programacion/Proyecto-final/Fleeswap-Frontend/src/App.jsx)
- [src/services/api.js](/d:/Programacion/Proyecto-final/Fleeswap-Frontend/src/services/api.js)
- [src/store/authStore.js](/d:/Programacion/Proyecto-final/Fleeswap-Frontend/src/store/authStore.js)

### Sockets

- Notificaciones y chat usan la raíz del servidor, no `/api`.
- Si `VITE_SOCKET_URL` no está definida, el front deriva la URL del socket desde `VITE_API_URL`.
- Si `VITE_API_URL=/api`, el socket intenta resolver mismo origen para acompañar la estrategia de proxy.

Archivos clave:

- [src/features/notifications/hooks/useNotificationSocket.js](/d:/Programacion/Proyecto-final/Fleeswap-Frontend/src/features/notifications/hooks/useNotificationSocket.js)
- [src/features/solicitudes/hooks/useChatSocket.js](/d:/Programacion/Proyecto-final/Fleeswap-Frontend/src/features/solicitudes/hooks/useChatSocket.js)
- [src/features/solicitudes/pages/MensajeriaView.jsx](/d:/Programacion/Proyecto-final/Fleeswap-Frontend/src/features/solicitudes/pages/MensajeriaView.jsx)

### Formas de respuesta del backend

Hoy el front convive con varias formas de respuesta:

- arrays directos
- objetos con `data`
- objetos con `items`
- objetos con `publications`
- objetos con `exchanges`

Eso obliga a normalizar con cuidado en cada feature y es una fuente común de bugs silenciosos cuando una pantalla espera una forma distinta.

## Documentación de estado

El detalle vivo del estado actual del proyecto, hallazgos de integración y checklist de revisión se mantiene en:

- [PROJECT-STATUS.md](/d:/Programacion/Proyecto-final/Fleeswap-Frontend/docs/PROJECT-STATUS.md)

## Criterios de UX Writing

El proyecto adopta estos lineamientos para todo texto visible al usuario:

- Idioma: español rioplatense.
- Registro: voseo consistente.
- Codificación: UTF-8 real, con tildes, `ñ/Ñ` y signos de apertura.
- Tono: claro, cercano y breve.

Ejemplos esperados:

- `Iniciá sesión`
- `Registrate`
- `¿Olvidaste tu contraseña?`
- `Buscá`
- `Querés`
- `Tenés`
- `Podés`

Evitar mezclar variantes como:

- `No tienes` con `Ya tenés`
- `Puedes` con `Podés`
- `sesion`, `contrasena`, `publicacion` sin tildes si el resto del flujo sí las usa

## Criterios de Sistema Visual

El proyecto usa una dirección visual basada en `brand`, `brand-light`, `brand-accent` y la escala `slate` para neutros.

Reglas base:

- `brand`: color primario para CTAs, acciones principales y navegación prioritaria.
- `brand-light`: hover o estado activo del primario.
- `brand-accent`: acento visual, no reemplazo del primario estándar.
- `blue-*`: reservado para mensajes y estados informativos.
- `red/rose-*`: reservado para acciones destructivas o errores.
- `amber-*`: reservado para advertencias o estados pendientes.
- `emerald-*`: reservado para éxito o resolución positiva.
- `slate-*`: texto base, bordes y superficies neutras.

Lineamientos de consistencia:

- Un botón primario estándar no debería usar `bg-blue-600`; debería usar `bg-brand`.
- Un modal de confirmación por defecto debería confirmar con `brand`.
- `brand-accent` no debería competir con `brand` en links o botones equivalentes.
- Los modales de confirmación deberían reutilizar un solo componente compartido.
- Los badges y estados deberían responder a una tabla semántica compartida, no a decisiones aisladas por archivo.

## Criterios del Flujo Auth

Las pantallas `Login`, `Register`, `ForgotPassword`, `ResetPassword` y `ChangePassword` deben funcionar como una sola familia visual.

Reglas:

- Reutilizar `AuthLayout` como base de layout y jerarquía.
- Reutilizar `FormField`, `PasswordInput` y `SubmitButton` como patrón visual de formulario.
- Mantener labels, links auxiliares y mensajes de error/éxito bajo una misma escala tipográfica.
- No introducir bloques manuales que rompan el patrón de labels, colores o spacing del resto del flujo.

## Estado actual del README

Este README busca ser la puerta de entrada operativa del proyecto. El detalle táctico y de seguimiento cambia más rápido, por eso se separó en `PROJECT-STATUS.md`.
