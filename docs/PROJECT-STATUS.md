# Estado Tecnico del Proyecto

Fecha de referencia: 30 de julio de 2026.

## Objetivo de Este Documento

Este documento resume donde se encuentra hoy el frontend desde una perspectiva técnica y de producto. No intenta definir la solucion de los proximos problemas, sino dejar una fotografia clara, profesional y accionable del estado actual.

## Diagnostico General

El proyecto tiene una base de arquitectura correcta y expresa bien su dominio. No es un frontend improvisado: hay estructura por feature slices, validaciones, componentes desacoplados, autenticación con token en memoria y renovación transparente, notificaciones en tiempo real y soporte de chat por sockets.

La conclusion principal es:

- la dirección técnica es buena;
- el producto frontend ya tiene forma real;
- la experiencia de usuario y confiabilidad operacional en cliente mejoraron sensiblemente con la actualización silenciosa de estados y la gestión limpia de sockets.

## Lectura Contra el Backlog MVP

Contrastado contra el Product Backlog del MVP, la foto más precisa es está:

- Épica 1: alineada.
- Épica 2: alineada.
- Épica 3: alineada.
- Épica 4: alineada.
- Épica 5: implementada en frontend a nivel MVP.
- Épica 6: implementada en frontend a nivel MVP.

Esto cambia una interpretación importante del proyecto: el frontend no está atrasado en su núcleo transaccional y la Épica 6 ya tiene cobertura MVP en interfaz de usuario. El cierre completo del proyecto depende ahora sobre todo de consolidar la suite de tests E2E y modularizar componentes complejos.

## Lo Mas Solido Hoy

### 1. Modelado del dominio y organización por Feature Slices

El proyecto ya representa con claridad sus dominios principales dentro de `src/features/`:

- usuarios y perfiles (`profile`);
- publicaciones (`publications`);
- intercambios y ventas (`solicitudes`);
- chat en tiempo real (`solicitudes/components/chat`);
- búsquedas activas y notificaciones (`search`, `notifications`);
- reputación y calificaciones (`ratings`);
- administración (`admin`).

Esto hace que el código sea entendible y que la lógica de presentación no esté dispersa.

### 2. Separación de responsabilidades

La estructura `routes -> pages -> services -> components` está bien definida. En general:

- las rutas solo orquestan layouts y guardas de autenticación;
- las páginas permanecen delgadas delegando en servicios y componentes;
- los servicios encapsulan peticiones Axios a la API REST;
- los componentes reutilizables viven en `shared/components`.

Esta base facilita mantenimiento, refactor y adición de pruebas E2E.

### 3. Seguridad por encima del promedio de una SPA básica

Puntos positivos observados:

- access token almacenado estrictamente en memoria (Zustand) para prevenir robo por XSS;
- refresh token gestionado vía cookie `httpOnly`;
- interceptor de Axios con Singleton para renovar tokens sin race conditions;
- guardas de enrutamiento (`ProtectedRoute`) por autenticación y rol;
- sanitización de redirecciones post-login (`getSafeRedirectPath`) evitando redirecciones abiertas o loops;
- auto-login inmediato post-registro sin almacenamiento expuesto de credenciales.

### 4. Reglas de interfaz y UX ya maduras

Hay decisiones que muestran criterio de producto:

- actualización silenciosa de listas en `/mis-intercambios` (`fetchAll`) sin recargar la página;
- navegación contextual por hashes (`#recibidas`, `#enviadas`) para notificaciones;
- soporte defensivo contra publicaciones eliminadas, mostrando estados cancelados en rojo sin fallos en tiempo de ejecución;
- modal de calificación elevado a nivel de vista principal para evitar desmontajes al cambiar de pestaña;
- formateo uniforme de moneda en pesos argentinos (`formatCurrency`).

### 5. Higiene de Sockets y Event Listeners

Hoy el frontend ya cuenta con una base sólida de realtime:

- listeners de Socket.IO gestionados con `useRef` para inmunidad frente a re-renders en React;
- solución del error `MaxListenersExceededWarning` en mensajería;
- paso automático del chat a modo solo lectura con banner explicativo al cerrarse una operación.

## Lo Que Esta Incompleto o Fragil

### 1. Extensión de `ModalIntercambio.jsx`

`ModalIntercambio.jsx` cuenta con ~380 líneas agrupando la selección de publicación, el desglose de monto adicional y la confirmación en un solo archivo.

Impacto:

- la funcionalidad es 100% correcta;
- dificulta la lectura y mantenimiento aislado de cada paso;
- conviene abstraer `renderStep1`, `renderStep2` y `renderStep3` en subcomponentes dedicados dentro de `src/features/solicitudes/components/modal-steps/`.

### 2. Cobertura de tests E2E en Cypress

La infraestructura de Cypress está presente (`cy:open`, `cy:run`), pero los specs automatizados aún no cubren todas las épicas del sistema.

Impacto:

- las validaciones actuales dependen de pruebas de integración manuales y exploratorias;
- conviene implementar progresivamente los specs documentados en `docs/TESTING.md`.

### 3. Paginación de mensajes en chat

Actualmente el chat carga el historial de mensajes entregado por el backend en una sola petición.

Impacto:

- para el volumen actual es rápido y funcional;
- a futuro se puede agregar carga incremental al hacer scroll hacia arriba.

## Riesgos Tecnicos Relevantes

### Consistencia de DTOs con Backend

Si el backend modifica nombres de atributos en las respuestas de publicaciones o intercambios, el frontend debe mantener comprobaciones opcionales (`?.`) para evitar errores no controlados.

### Dependencia de WebSockets

La entrega inmediata de mensajes y notificaciones depende de la estabilidad de la conexión Socket.IO con el backend.

## Nivel de Madurez Actual

Si hubiera que clasificar el frontend en una escala practica:

- no está en etapa inicial;
- está en una etapa funcional avanzada y estable con deuda técnica menor.

En otras palabras:

- ya sirve como base seria del producto;
- la experiencia de usuario es sólida y fluida.

## Lectura Recomendada del Momento Actual

La forma más honesta de describir donde estamos es está:

1. El proyecto ya tiene arquitectura y dominios suficientemente claros como para crecer sin reescritura completa.
2. El frontend soporta bien los casos nucleares de publicaciones, intercambio, chat, notificaciones y autenticación.
3. Las 7 tareas de auditoría de código recientes eliminaron duplicaciones de formato, imports muertos y prop-drilling.

## Prioridades Naturales para la Proxima Etapa

Sin entrar todavía en plan de arreglos, la siguiente etapa del proyecto deberia enfocarse en:

- modularizar `ModalIntercambio.jsx` por componentes de paso;
- escribir las primeras suites automatizadas en Cypress para Auth e Intercambios;
- mantener sincronización de contratos con el backend.

## Conclusion

El frontend de Fleeswap tiene una base técnica real, decisiones de interfaz coherentes y un nucleo funcional bien encaminado para el MVP. Ese es exactamente el lugar en el que se encuentra hoy el proyecto.
