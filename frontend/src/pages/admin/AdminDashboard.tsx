import { useEffect, useState } from "react";
import client, { getSessionUsername } from "@/api/client";
import "@/pages/admin/AdminDashboard.scss";

type UserData = {
  id: number;
  username: string;
  email: string;
  roles: { id: number; name: string }[];
  created_at: string;
  updated_at: string;
};

type UsersResponse = {
  status: number;
  message: string;
  data?: UserData[];
};

function AdminDashboard() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const adminUsername = getSessionUsername();

  useEffect(() => {
    client
      .get<UsersResponse>("/users")
      .then(({ data }) => {
        if (data.data) {
          setUsers(data.data);
        } else {
          setError(data.message || "Error al cargar usuarios");
        }
      })
      .catch((err) => {
        setError(
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message ?? "Error de conexión",
        );
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="admin">
      <header className="admin__header">
        <h1 className="admin__title">Panel de Administración</h1>
        <p className="admin__subtitle">
          Bienvenido, {adminUsername ?? "Admin"}
        </p>
      </header>

      <section className="admin__section">
        <h2 className="admin__section-title">Usuarios registrados</h2>

        {loading && <p className="admin__status">Cargando usuarios...</p>}

        {error && <p className="admin__error">{error}</p>}

        {!loading && !error && users.length === 0 && (
          <p className="admin__status">No hay usuarios registrados.</p>
        )}

        {!loading && users.length > 0 && (
          <div className="admin__table-wrapper">
            <table className="admin__table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Usuario</th>
                  <th>Email</th>
                  <th>Roles</th>
                  <th>Creado</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>
                      {user.roles.map((r) => r.name).join(", ") || "—"}
                    </td>
                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminDashboard;
