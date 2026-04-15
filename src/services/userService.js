//  GET PUBLIC PROFILE
export async function getPublicProfile(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (id !== "1") {
        reject(new Error("Usuario no encontrado"));
        return;
      }

      resolve({
        id: 1,
        nombre: "Santino Madueno",
        foto: "https://via.placeholder.com/150",
        bio: "Fan",
        ubicacion: "Argentina",
        calificacion: 4.5,
        intercambios: 12,
        publicaciones: [
          { id: 1, titulo: "Camiseta Boca", tipo: "Intercambio" },
          { id: 2, titulo: "Vinilo de Michael jackson", tipo: "Venta" },
        ],
      });
    }, 500);
  });
}

//  EDIT PROFILE
export async function editProfile(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: 1,
        nombre: "Santino Madueno",
        foto: data.foto,
        bio: data.bio,
        ubicacion: data.ubicacion,
        calificacion: 4.5,
        intercambios: 12,
        publicaciones: [
          { id: 1, titulo: "Camiseta Boca", tipo: "Intercambio" },
          { id: 2, titulo: "Vinilo Duki", tipo: "Venta" },
        ],
      });
    }, 500);
  });
}