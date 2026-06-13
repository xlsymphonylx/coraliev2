import { useEffect, useState } from "react";
import client from "@/api/client";
import CrudPage from "@/components/admin/CrudPage";
import DataTable from "@/components/admin/DataTable";
import type { Column } from "@/components/admin/DataTable";

type User = { id: number; username: string; email: string; roles: { id: number; name: string }[]; created_at: string };

function AdminUsers() {
  const [items, setItems] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    client.get("/users").then(({ data }) => setItems(data.data ?? [])).catch(() => setError("Error al cargar")).finally(() => setLoading(false));
  }, []);

  const filtered = items.filter((u) =>
    !search ||
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const columns: Column<User>[] = [
    { header: "ID", render: (u) => u.id },
    { header: "Usuario", render: (u) => u.username },
    { header: "Email", render: (u) => u.email, hideOnMobile: true },
    { header: "Roles", render: (u) => u.roles.map((r) => r.name).join(", ") || "—" },
    { header: "Registro", render: (u) => new Date(u.created_at).toLocaleDateString(), hideOnMobile: true },
  ];

  return (
    <CrudPage title="Usuarios" search={{ placeholder: "Buscar por usuario o email...", value: search, onChange: setSearch }}>
      <DataTable columns={columns} data={filtered} keyExtractor={(u) => u.id} loading={loading} error={error} emptyMessage={search ? "Sin resultados" : "Sin usuarios"} />
    </CrudPage>
  );
}

export default AdminUsers;
