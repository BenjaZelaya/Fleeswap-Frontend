# Test Plan (Cypress E2E)

Última actualización: 2026-06-22

## Resumen

El frontend no tiene tests automatizados hoy. Este documento define el plan de tests E2E con Cypress, ordenado por fases según criticidad de negocio y fragilidad conocida (ver `docs/PROJECT-STATUS.md`).

## Criterio de priorización

Se combinan dos señales:

- criticidad de negocio: qué tan grave es que ese flujo falle
- fragilidad conocida: puntos ya identificados como riesgo (cookies/refresh, contratos de respuesta inconsistentes, dependencia de sockets)

## Estrategia

- Cypress como E2E real, corriendo contra la app levantada
- Backend real en local/staging (no mocks de red) para detectar problemas de integración real, no solo de UI
- Datos de prueba con seed/reset entre runs para evitar estado sucio entre corridas

## Setup inicial

1. `npm i -D cypress`, agregar scripts `cy:open` / `cy:run` en `package.json`
2. Backend local en `localhost:3000` con datos seed; usuario(s) de prueba fijos
3. Mecanismo de reset/seed entre runs (endpoint de test o seed script) para que registro/intercambios no choquen con estado de corridas previas
4. `cypress/support/commands.js` con comandos reutilizables: `cy.login()`, `cy.register()`, `cy.createPublication()`, `cy.createExchangeRequest()`

## Estructura de carpetas

```
cypress/
  e2e/
    01-auth/
    02-publications/
    03-exchange-chat/
    04-notifications/
    05-active-searches/
    06-profile/
    07-ratings/
    08-admin/
  fixtures/
  support/
```

## Fase 1. Auth

Puerta de entrada a todo el producto y zona ya marcada como frágil (cookies/refresh) en `PROJECT-STATUS.md`.

- Login: éxito, error credenciales, loading state, link a forgot-password
- Register: éxito, error 409 por email duplicado, validaciones de cliente
- Forgot/Reset password: token válido vs inválido/expirado
- Change password: contraseña actual incorrecta vs correcta
- Logout: cancelar vs confirmar en el modal
- Persistencia de sesión: refresh de página mantiene sesión; refresh token expirado dispara reintento o redirige a login

## Fase 2. Publicaciones

Núcleo de descubrimiento de producto, alto tráfico.

- Crear publicación: campos requeridos, validaciones
- Explorar/Home: filtros, paginación, tolerancia a distintas formas de respuesta (`publications`/`items`/`data`)
- Ver detalle de publicación propia vs de otro usuario
- Editar/eliminar publicación propia
- Publicación suspendida: banner visible para el owner, bloqueo de acciones para terceros

## Fase 3. Solicitudes/Intercambio y Chat

Flujo de negocio más complejo, con sockets en tiempo real.

- Crear solicitud de intercambio/compra sobre una publicación
- Aceptar/rechazar solicitud, incluido bloqueo si la publicación está suspendida
- Chat: enviar/recibir mensaje en tiempo real, paginación de historial, scroll automático
- Banner de chat bloqueado/suspendido cuando la publicación fue reportada
- Confirmar/cancelar intercambio

## Fase 4. Notificaciones

Contrato de respuesta marcado como frágil en `PROJECT-STATUS.md`.

- Conexión de socket al cargar sesión
- Llega notificación nueva: badge se actualiza, dropdown la muestra
- `GET /notifications` con forma de respuesta esperada (`notifications`, `unreadCount`)
- Marcar como leída / leer todas

## Fase 5. Búsquedas activas

Contrato de respuesta marcado como frágil en `PROJECT-STATUS.md`.

- Crear búsqueda activa (`category`, `type`, `keywords`)
- Listado: array directo vs envuelto
- Editar búsqueda: encontrar correctamente por `id`
- Toggle activar/desactivar, eliminar, mensajes de error reales (no genéricos)

## Fase 6. Perfil

- Ver perfil público de otro usuario
- Editar perfil propio, incluida subida de foto vía Cloudinary
- Eliminar cuenta: ConfirmModal + password, soft-delete, logout posterior

## Fase 7. Ratings

- Dejar calificación tras intercambio completado
- Ver reputación/calificaciones en perfil público

## Fase 8. Admin

Menor prioridad, uso interno.

- Suspender/reactivar publicación
- Gestión de usuarios reportados
