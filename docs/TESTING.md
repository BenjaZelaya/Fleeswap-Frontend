# Documentación de Tests

Fecha de referencia: 30 de julio de 2026.

## Propósito del Documento

Este documento deja una fotografia técnica y funcional de la estrategia de testing del frontend de Fleeswap.

Explica qué pruebas existen hoy, cómo se ejecutan las validaciones en navegador y Cypress, describe convenciones reales de la suite y registra las pautas para mantener la calidad del proyecto.

## Contexto General

Fleeswap Frontend es una SPA desarrollada sobre React 19 y Vite con enrutamiento declarativo en React Router v7. La aplicación cubre autenticación, usuarios, publicaciones, intercambios, chat en tiempo real por sockets, notificaciones, búsquedas activas, administración y reputación.

La estrategia de pruebas combina verificación estática con ESLint, pruebas E2E con Cypress contra un entorno real/local del backend y pruebas manuales integradas en navegador.

## Stack de Testing

La suite usa:

- Cypress como test runner para pruebas End-to-End (E2E);
- ESLint para análisis estático e higiene de código;
- Vite dev server para levantar el entorno local de pruebas (`http://localhost:5173`);
- Backend real en `http://localhost:3000` para pruebas integradas.

## Requisitos de Entorno

Para ejecutar las pruebas E2E en frontend se requiere:

- backend de Fleeswap levantado y accesible;
- base de datos de test disponible;
- dependencias instaladas con `npm install`.

## Comandos

### Abrir Cypress en modo interactivo

```bash
npm run cy:open
```

### Ejecutar suite E2E en modo headless

```bash
npm run cy:run
```

### Ejecutar verificación de linter

```bash
npm run lint
```

## Como Leer los Resultados

Cada test ejecutado por Cypress muestra:

- suite/funcionalidad probada (`describe`);
- escenario puntual (`it`);
- estado de la aserción (aprobado/fallido);
- tiempo de ejecución y captura visual en caso de fallo.

## Alcance Actual

La validación actual combina pruebas automatizadas con Cypress y pruebas manuales de interfaz.

La suite cubre los flujos principales del frontend:

- registro de usuarios e ingreso directo post-registro;
- inicio y cierre de sesión con token en memoria;
- navegación por catálogo de publicaciones con filtros y debounce de búsqueda;
- creación, edición y eliminación de publicaciones propias;
- envío de solicitudes de trueque y compra directa;
- panel unificado `/mis-intercambios` con pestañas dinámicas y actualización silenciosa;
- interacción en tiempo real en chat de intercambios activos;
- recepción de notificaciones y navegación por hashes (`#recibidas`, `#enviadas`);
- calificación post-intercambio y visualización de reputación en perfil.

## Fuera de Alcance Actual

La suite no cubre formalmente:

- pruebas de carga o estrés visual;
- pruebas de accesibilidad auditada WCAG automatizada;
- pruebas de matriz completa de navegadores legacy.

## Pruebas Manuales con Navegador

### Rol dentro del proyecto

Las pruebas manuales permiten verificar flujos completos de experiencia de usuario de punta a punta, evaluando diseño responsive, fluidez de animaciones y comportamiento de modales.

### Variables recomendadas

Un ambiente de prueba frontend debe considerar:

| Variable          | Uso                                                                  |
| ----------------- | -------------------------------------------------------------------- |
| `VITE_API_URL`    | URL base de la API backend, por ejemplo `http://localhost:3000/api`  |
| `VITE_SOCKET_URL` | URL base del servidor Socket.IO, por ejemplo `http://localhost:3000` |

### Flujo manual mínimo recomendado

Un recorrido manual completo debe ser:

1. Registrar un usuario nuevo A y verificar toast de bienvenida e ingreso directo.
2. Registrar un usuario nuevo B.
3. Crear una publicación desde la cuenta de A.
4. Crear una publicación desde la cuenta de B.
5. Desde la cuenta de B, enviar una solicitud de intercambio a la publicación de A.
6. Iniciar sesión como A y verificar la solicitud en `/mis-intercambios#recibidas`.
7. Aceptar la solicitud y verificar el paso del estado a "En Curso" sin recargar la página.
8. Ingresar al chat del intercambio y enviar mensajes entre A y B.
9. Confirmar el intercambio desde ambas cuentas.
10. Verificar que el estado pasa a "Completado" y el chat queda en solo lectura.
11. Abrir el modal de calificación, asignar estrellas y redactar un comentario.
12. Consultar el perfil público del usuario calificado y verificar el promedio actualizado.

## Mapa de Suites

| Área           | Archivo / Directorio Cypress    | Cobertura                                                        |
| -------------- | ------------------------------- | ---------------------------------------------------------------- |
| Autenticación  | `cypress/e2e/01-auth/`          | registro, login, logout, persistencia y redirecciones            |
| Publicaciones  | `cypress/e2e/02-publications/`  | catálogo, filtros, creación, edición, eliminación y reportes     |
| Intercambios   | `cypress/e2e/03-exchanges/`     | solicitudes, aceptación, rechazo, confirmación y cancelación     |
| Chat realtime  | `cypress/e2e/04-chat/`          | conexión socket, envío/recepción de mensajes y modo solo lectura |
| Notificaciones | `cypress/e2e/05-notifications/` | centro de notificaciones, marcado de lectura e indicadores       |
| Reputación     | `cypress/e2e/06-profile/`       | calificaciones post-intercambio y perfil público                 |

## Cobertura por Dominio

### Autenticación

Valida comportamientos centrales de identidad:

- registro con datos válidos;
- ingreso automático post-registro con token en memoria;
- login exitoso y manejo de credenciales inválidas;
- cierre de sesión y redirección a login.

### Publicaciones

Valida:

- navegación y filtros;
- creación de publicaciones con fotos;
- edición y eliminación;
- detalle completo y reporte.

### Intercambios y Compras

Valida:

- envío de solicitud de trueque con selección de objeto;
- compra directa;
- aceptación, rechazo, confirmación bilateral y cancelación;
- actualización silenciosa de listas sin recarga de página.

### Chat

Valida:

- conexión a la sala del intercambio;
- mensajería instantánea por sockets;
- bloqueo del chat al finalizar el intercambio.

## Datos de Prueba

Los tests E2E utilizan usuarios de prueba fijos o sembrados mediante scripts de seed en la base de datos de testing.

## Convenciones de Escritura

- Definir comandos personalizados reutilizables en `cypress/support/commands.js` (ej. `cy.login()`).
- Cada test debe ser independiente y no depender de ejecuciones previas.
- Utilizar selectores semánticos o atributos `data-testid` en elementos interactivos.

## Checklist Antes de Mergear

```bash
npm run lint
npm run build
```

## Estado Actual

El frontend cuenta con una base de código limpia, sin duplicaciones de código y con una documentación técnica completa que refleja con precisión el estado del sistema.
