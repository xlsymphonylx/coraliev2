import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import client from "@/api/client";
import CrudPage from "@/components/admin/CrudPage";
import DataTable from "@/components/admin/DataTable";
import type { Column } from "@/components/admin/DataTable";
import AdminForm from "@/components/admin/AdminForm";

type Tag = { id: number; name: string; slug: string };

function AdminTags() {
  const [params, setParams] = useSearchParams();
  const creating = params.get("action") === "crear";

  const [items, setItems] = useState<Tag[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const openForm = () => setParams({ action: "crear" });
  const closeForm = () => { setName(""); setParams({}); };

  const fetch = async () => {
    setLoading(true);
    try { const { data } = await client.get("/tags"); setItems(data.data ?? []); }
    catch { setError("Error al cargar"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError(null);
    try { await client.post("/tags", { name }); closeForm(); fetch(); }
    catch (err: unknown) { setError((err as any)?.response?.data?.message ?? "Error"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar esta etiqueta?")) return;
    try { await client.delete(`/tags/${id}`); fetch(); }
    catch { setError("Error al eliminar"); }
  };

  const filtered = items.filter((t) =>
    !search || t.name.toLowerCase().includes(search.toLowerCase())
  );

  const columns: Column<Tag>[] = [
    { header: "ID", render: (t) => t.id },
    { header: "Nombre", render: (t) => t.name },
    { header: "Slug", render: (t) => t.slug, hideOnMobile: true },
    { header: "Acción", render: (t) => <button className="btn-danger" onClick={() => handleDelete(t.id)}>Eliminar</button> },
  ];

  return (
    <CrudPage title="Etiquetas" action={{ label: "+ Nueva", onClick: openForm }} search={{ placeholder: "Buscar por nombre...", value: search, onChange: setSearch }}>
      {error && <p className="error-msg">{error}</p>}

      {creating && (
        <AdminForm
          title="Nueva etiqueta"
          onSubmit={handleCreate}
          saving={saving}
          error={error}
        >
          <AdminForm.Field label="Nombre de la etiqueta">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre de la etiqueta" required />
          </AdminForm.Field>
          <AdminForm.Actions saving={saving} saveLabel="Guardar" onCancel={closeForm} />
        </AdminForm>
      )}

      <DataTable columns={columns} data={filtered} keyExtractor={(t) => t.id} loading={loading} emptyMessage={search ? "Sin resultados" : "Sin etiquetas"} />
    </CrudPage>
  );
}

export default AdminTags;
