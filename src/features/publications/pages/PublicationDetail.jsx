import { useParams } from "react-router-dom";

export default function PublicationDetail() {
  const { id } = useParams();

  return (
    <div style={{ padding: "20px" }}>
      <h2>Detalle de publicación</h2>
      <p>ID: {id}</p>
    </div>
  );
}