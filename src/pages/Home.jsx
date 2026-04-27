import { Link } from "react-router-dom";
import PublicationsList from "../features/publications/pages/PublicationsList";
import useAuthStore from "../store/authStore";

// 🖼️ IMPORT DEL LOGO
import logo from "../shared/assets/logo.jpeg";

export default function Home() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="max-w-6xl mx-auto p-6">

      {/* 🧭 HERO */}
      <section className="bg-gray-100 py-16 text-center flex flex-col items-center rounded-xl mb-10">

        {/* 🖼️ LOGO */}
        <img
          src={logo}
          alt="Fleeswap Logo"
          className="w-28 mb-4"
        />

        {/* 🧾 TÍTULO */}
        <h1 className="text-4xl font-bold mb-4">
          Bienvenido a Fleeswap
        </h1>

        <p className="text-gray-600 max-w-md">
          Comprá, vendé y descubrí productos fácilmente
        </p>

      </section>

      {/* 👤 ACCIONES (solo si está logeado) */}
      {user && (
        <div className="flex gap-4 mb-8 justify-center">
          <Link
            to={`/profile/${user.id || 1}`}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
          >
            Ver mi perfil
          </Link>

          <Link
            to="/publications/create"
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition"
          >
            Crear publicación
          </Link>
        </div>
      )}

      {/* 🔥 PUBLICACIONES */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">
          Publicaciones recientes
        </h2>

        <PublicationsList />
      </section>

    </div>
  );
}