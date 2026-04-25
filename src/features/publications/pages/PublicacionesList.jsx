import { useEffect, useState } from "react";

const MOCK_DATA = [
  {
    id: 1,
    titulo: "Vinilo Queen",
    descripcion: "Edición original en excelente estado",
    precio: 10000,
  },
  {
    id: 2,
    titulo: "Camiseta Boca 2000",
    descripcion: "Histórica, talle L",
    precio: 25000,
  },
];

const PublicacionesList = () => {
  const [publicaciones, setPublicaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchPublicaciones = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `http://localhost:3000/publicaciones?page=${page}`
        );

        if (!res.ok) {
          throw new Error("Error en la respuesta del servidor");
        }

        const data = await res.json();

        // 🔥 soporta distintos formatos de backend
        const publicacionesData =
          data?.data || data?.publicaciones || data;

        setPublicaciones(publicacionesData);

      } catch (err) {
        console.error(err);

        // 🔥 fallback para que SIEMPRE funcione
        setPublicaciones(MOCK_DATA);
        setError("Mostrando datos de prueba (backend no disponible)");
      } finally {
        setLoading(false);
      }
    };

    fetchPublicaciones();
  }, [page]);

  // 🟡 Loading
  if (loading) return <p>Cargando publicaciones...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Publicaciones</h2>

      {/* 🔴 Error */}
      {error && (
        <p style={{ color: "orange", marginBottom: "10px" }}>
          {error}
        </p>
      )}

      {/* 🟢 Listado */}
      {publicaciones.length === 0 ? (
        <p>No hay publicaciones</p>
      ) : (
        <div>
          {publicaciones.map((pub) => (
            <div
              key={pub._id || pub.id}
              style={{
                border: "1px solid #ccc",
                padding: "10px",
                marginBottom: "10px",
                borderRadius: "8px",
              }}
            >
              <h3>{pub.titulo || pub.title}</h3>
              <p>{pub.descripcion || pub.description}</p>

              {pub.precio && (
                <p>💰 Precio: ${pub.precio}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 🔵 Paginación */}
      <div style={{ marginTop: "20px" }}>
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
        >
          ⬅ Anterior
        </button>

        <span style={{ margin: "0 10px" }}>
          Página {page}
        </span>

        <button
          onClick={() => setPage((prev) => prev + 1)}
        >
          Siguiente ➡
        </button>
      </div>
    </div>
  );
};

export default PublicacionesList;