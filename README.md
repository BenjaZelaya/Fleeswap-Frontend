H1.4 – Perfil público

Descripción:
En esta parte implementé la pantalla de perfil público de un usuario, donde se pueden ver sus datos y sus publicaciones.
La idea es poder acceder al perfil mediante una URL dinámica y mostrar la información correspondiente.

Funcionamiento:
La página funciona a través de la ruta:
/profile/:id
Donde :id es el identificador del usuario.

Para obtener los datos:
Se usa useParams() para leer el ID desde la URL

Se llama a la función getPublicProfile(id)

Se guardan los datos en el estado

Se renderiza la información en pantalla



Componentes:
PublicProfilePage.jsx
Este componente se encarga de:

Obtener el ID del usuario

Llamar al servicio

Guardar los datos en el estado

Mostrar la información del perfil

Mostrar las publicaciones

Manejar estados de carga y error

Mostrar botones según el tipo de perfil



userService.js contiene la función:

getPublicProfile(userId)

Esta función simula una llamada a una API y devuelve:

Datos del usuario si existe

Error si no existe (simulación de 404)


App.jsx
Se define la ruta:
/profile/:id
Que renderiza el componente del perfil público.

Interfaz
Se muestran los siguientes datos:

Foto del usuario

Nombre

Bio

Ubicación

Calificación

Cantidad de intercambios

Publicaciones (título y tipo)



Estados utilizados:
Loading:
Mientras se cargan los datos se muestra:
Cargando perfil...

Error:
Si el usuario no existe:
Este usuario no existe

Lógica condicional:

Si el perfil es propio → se muestra el botón Editar perfil

Si no es propio → se muestra el botón Iniciar intercambio


Pruebas realizadas:

/profile/1 → muestra el perfil correctamente


/profile/999 → muestra error


Al recargar → se ve el estado de carga


Tecnologías utilizadas:

React

React Router

Hooks (useState, useEffect)

JavaScript

Conclusión
Se logró una pantalla de perfil funcional, con carga de datos, manejo de errores y renderizado dinámico, lista para conectarse a un backend real.


---
H1.5 / Edición de perfil:

En esta parte implementé la funcionalidad para que el usuario pueda editar su perfil.

Primero creé una pantalla de edición con un formulario que carga automáticamente los datos actuales del usuario (foto, bio y ubicación). Utilicé el estado global con Zustand.

El formulario es controlado, es decir, cada input está conectado al estado. También agregué una validación para detectar si el usuario realmente hizo cambios, y en ese caso se habilita el botón de guardar.

Cuando el usuario guarda los cambios:

Se simula una actualización con un servicio (editProfile)
Se actualiza el estado global (Zustand)
Se redirige automáticamente al perfil

Al volver al perfil, los cambios se ven reflejados sin necesidad de recargar la página.

---
H1.6 – Autenticación y protección de rutas

En esta parte agregué seguridad básica a la aplicación.

Primero modifiqué el estado global para que el usuario no esté logueado por defecto. Luego implementé un login simulado que guarda el usuario en Zustand si las credenciales son correctas.

Después creé un componente ProtectedRoute que verifica si hay un usuario logueado:

Si no hay usuario, se redirige al login automaticamente
Si hay usuario, permite acceder a la ruta

Usé ProtectedRoute para proteger las rutas del perfil y la edición.

También agregué la funcionalidad de logout, que limpia el estado global y redirige al login.

De esta forma:

No se puede acceder al perfil sin iniciar sesión
No se puede editar el perfil sin estar logueado
Al cerrar sesión, se pierde el acceso a las rutas protegidas

