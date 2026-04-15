import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPublicProfile } from "../../../services/userService";
import useAuthStore from "../../auth/store/authStore";

const PublicProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const authUser = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // 🔥 SI ES MI PERFIL → USAR ZUSTAND
        if (id === "1" && authUser) {
          setUser(authUser);
        } else {
          const data = await getPublicProfile(id);
          setUser(data);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id, authUser]);

  // 🔄 Loading
  if (loading) return <p>Cargando perfil...</p>;

  // ❌ Error
  if (error) return <p>Este usuario no existe</p>;

  const isMyProfile = id === "1";

  return (
    <div style={{ textAlign: "center", marginTop: "40px" }}>
      
      <img src={user.foto} alt="foto" width={150} />
      
      <h2>{user.nombre}</h2>
      <p>{user.bio}</p>
      <p>{user.ubicacion}</p>
      <p>⭐ {user.calificacion}</p>
      <p>🔁 Intercambios: {user.intercambios}</p>

      {/* 🔥 BOTONES */}
      {isMyProfile && (
        <>
          <button onClick={() => navigate("/edit-profile")}>
            Editar perfil
          </button>

          <br /><br />

          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            Cerrar sesión
          </button>
        </>
      )}

    </div>
  );
};

export default PublicProfilePage;