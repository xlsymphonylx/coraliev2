import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import client from "@/api/client";
import CrudPage from "@/components/admin/CrudPage";
import DataTable from "@/components/admin/DataTable";
import type { Column } from "@/components/admin/DataTable";
import AdminForm from "@/components/admin/AdminForm";

type User = { id: number; username: string; email: string; roles: { id: number; name: string }[]; created_at: string; updated_at: string };
type Role = { id: number; name: string };

function AdminUsers() {
  const [params, setParams] = useSearchParams();
  const action = params.get("action");
  const editId = action === "editar" ? params.get("id") : null;

  const [items, setItems] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [formUsername, setFormUsername] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRoleIds, setFormRoleIds] = useState<number[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ur, rr] = await Promise.all([client.get("/users"), client.get("/roles")]);
      setItems(ur.data.data ?? []);
      setRoles(rr.data.data ?? []);
    } catch { setError("Error al cargar"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (editId) {
      const u = items.find((x) => x.id === Number(editId));
      setFormUsername(u?.username ?? "");
      setFormEmail(u?.email ?? "");
      setFormRoleIds(u?.roles.map((r) => r.id) ?? []);
      setFormPassword("");
    } else {
      setFormUsername("");
      setFormEmail("");
      setFormPassword("");
      setFormRoleIds([]);
    }
  }, [editId, items]);

  const toggleRole = (rid: number) => {
    setFormRoleIds((prev) => prev.includes(rid) ? prev.filter((r) => r !== rid) : [...prev, rid]);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (editId) {
        const body: Record<string, unknown> = {};
        if (formUsername) body.username = formUsername;
        if (formEmail) body.email = formEmail;
        if (formPassword) body.password = formPassword;
        await client.patch(`/users/${editId}`, body);
      } else {
        await client.post("/users", {
          username: formUsername,
          email: formEmail,
          password: formPassword,
          role_ids: formRoleIds,
        });
      }
      setParams({});
      fetchData();
    } catch (err: unknown) { setError((err as any)?.response?.data?.message ?? "Error"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar usuario?")) return;
    try {
      await client.delete(`/users/${id}`);
      fetchData();
    } catch { setError("Error al eliminar"); }
  };

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
    {
      header: "Acciones",
      render: (u) => (
        <div className="cell-actions">
          <button onClick={() => setParams({ action: "editar", id: String(u.id) })}>Editar</button>
          <button className="btn-danger" onClick={() => handleDelete(u.id)}>Eliminar</button>
        </div>
      ),
    },
  ];

  if (action) {
    return (
      <AdminForm
        title={editId ? "Editar usuario" : "Nuevo usuario"}
        onBack={() => setParams({})}
        onSubmit={handleSave}
        saving={saving}
        error={error}
      >
        <AdminForm.Row>
          <AdminForm.Field label="Usuario *">
            <input value={formUsername} onChange={(e) => setFormUsername(e.target.value)} required />
          </AdminForm.Field>
          <AdminForm.Field label="Email *">
            <input type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} required />
          </AdminForm.Field>
        </AdminForm.Row>
        <AdminForm.Field label={editId ? "Nueva contraseña (dejar vacío)" : "Contraseña *"}>
          <input type="password" value={formPassword} onChange={(e) => setFormPassword(e.target.value)} required={!editId} />
        </AdminForm.Field>
        <div className="admin-form__field">
          <span>Roles</span>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: "0.25rem" }}>
            {roles.map((r) => (
              <label key={r.id} style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontFamily: "var(--coralie-main-font)", fontSize: "0.85rem", color: "var(--coralie-dark)", cursor: "pointer" }}>
                <input type="checkbox" checked={formRoleIds.includes(r.id)} onChange={() => toggleRole(r.id)} />
                {r.name}
              </label>
            ))}
          </div>
        </div>
        <AdminForm.Actions saving={saving} saveLabel={editId ? "Actualizar" : "Crear"} onCancel={() => { setFormUsername(""); setFormEmail(""); setFormPassword(""); setFormRoleIds([]); }} />
      </AdminForm>
    );
  }

  return (
    <CrudPage
      title="Usuarios"
      action={{ label: "+ Nuevo", onClick: () => setParams({ action: "crear" }) }}
      search={{ placeholder: "Buscar por usuario o email...", value: search, onChange: setSearch }}
    >
      {error && <p className="error-msg">{error}</p>}
      <DataTable columns={columns} data={filtered} keyExtractor={(u) => u.id} loading={loading} emptyMessage={search ? "Sin resultados" : "Sin usuarios"} />
    </CrudPage>
  );
}

export default AdminUsers;
