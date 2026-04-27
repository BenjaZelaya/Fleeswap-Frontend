import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const MOCK_DATA = [
  {
    id: 1,
    titulo: "Vinilo Bocanada",
    descripcion: "Edición original en excelente estado",
    precio: 10000,
    image: "/bocanada.jpg",
  },
  {
    id: 2,
    titulo: "Camiseta Boca 2000",
    descripcion: "Histórica, talle L",
    precio: 25000,
    image: "https://picsum.photos/400/300",
  },
];

export default function PublicationsList() {
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

        if (!res.ok) throw new Error("Error servidor");

        const data = await res.json();

        const publicacionesData =
          data?.data || data?.publicaciones || data;

        setPublicaciones(publicacionesData);
      } catch (err) {
        console.error(err);
        setPublicaciones(MOCK_DATA);
        setError("Mostrando datos de prueba");
      } finally {
        setLoading(false);
      }
    };

    fetchPublicaciones();
  }, [page]);

  if (loading) return <p>Cargando publicaciones...</p>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Publicaciones</h2>

      {error && (
        <p className="text-yellow-600 mb-4">{error}</p>
      )}

      {publicaciones.length === 0 ? (
        <p>No hay publicaciones</p>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {publicaciones.map((pub) => (
            <Link
              key={pub._id || pub.id}
              to={`/publications/${pub._id || pub.id}`}
              className="border rounded-lg p-2 hover:shadow"
            >
              <img
                src={pub.image || "https://picsum.photos/400/300"}
                className="w-full h-40 object-cover rounded"
              />

              <h3 className="font-bold mt-2">
                {pub.titulo || pub.title}
              </h3>

              <p className="text-sm text-gray-600">
                {pub.descripcion || pub.description}
              </p>

              {pub.precio && (
                <p className="mt-1 font-semibold">
                  💰 ${pub.precio}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}

      {/* PAGINACIÓN */}
      <div className="mt-6 flex gap-4 items-center">
        <button onClick={() => setPage((p) => Math.max(p - 1, 1))}>
          ⬅
        </button>

        <span>Página {page}</span>

        <button onClick={() => setPage((p) => p + 1)}>
          ➡
        </button>
      </div>
    </div>
  );
}