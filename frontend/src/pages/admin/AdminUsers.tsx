import { useEffect, useState } from "react";
import client from "@/api/client";
import "@/pages/admin/AdminUsers.scss";
import "@/pages/admin/AdminUsers_responsive.scss";

type User = { id: number; username: string; email: string; roles: { id: number; name: string }[]; created_at: string };

function AdminUsers() {
  const [items, setItems] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    client.get("/users").then(({ data }) => setItems(data.data ?? [])).catch(() => setError("Error al cargar")).finally(() => setLoading(false));
  }, []);

  return (
    <div className="admin-users">
      <div className="admin-users__header">
        <h1 className="admin-users__title">Usuarios</h1>
      </div>
      {error && <p className="admin-users__error">{error}</p>}
      {loading ? <p className="admin-users__status">Cargando...</p>
      : items.length === 0 ? <p className="admin-users__status">Sin usuarios</p>
      : (
        <div className="admin-users__table-wrap">
          <table className="admin-users__table">
            <thead><tr><th>ID</th><th>Usuario</th><th>Email</th><th>Roles</th><th>Registro</th></tr></thead>
            <tbody>
              {items.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td><td>{u.username}</td><td>{u.email}</td>
                  <td>{u.roles.map((r) => r.name).join(", ") || "—"}</td>
                  <td>{new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;
