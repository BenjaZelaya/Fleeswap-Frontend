import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../auth/store/authStore";
import { editProfile } from "../../../services/userService";

const EditProfilePage = () => {
  const navigate = useNavigate();

  const user = useAuthStore((s) => s.user);
  const setAuth = useAuthStore((s) => s.setAuth);

  const [form, setForm] = useState({
    foto: user?.foto || "",
    bio: user?.bio || "",
    ubicacion: user?.ubicacion || "",
  });

  const [loading, setLoading] = useState(false);

  const hasChanges =
    form.foto !== (user?.foto || "") ||
    form.bio !== (user?.bio || "") ||
    form.ubicacion !== (user?.ubicacion || "");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updatedUser = await editProfile(form);

      // SE ACTUALIZA STORE
      setAuth(updatedUser, "fake-token");

      // REDIRECCIÓN
      navigate("/profile/1");

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: "40px" }}>
      <form onSubmit={handleSubmit} style={{ width: "400px" }}>

        <h2>Editar Perfil</h2>

        <input name="foto" value={form.foto} onChange={handleChange} placeholder="Foto" />
        <input name="bio" value={form.bio} onChange={handleChange} placeholder="Bio" />
        <input name="ubicacion" value={form.ubicacion} onChange={handleChange} placeholder="Ubicación" />

        <button type="submit" disabled={!hasChanges || loading}>
          {loading ? "Guardando..." : "Guardar"}
        </button>

      </form>
    </div>
  );
};

export default EditProfilePage;