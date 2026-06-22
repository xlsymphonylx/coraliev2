import { useEffect, useState } from "react";
import client from "@/api/client";
import CrudPage from "@/components/admin/CrudPage";
import DataTable from "@/components/admin/DataTable";
import type { Column } from "@/components/admin/DataTable";
import "@/pages/admin/AdminDiscountSets.scss";

type DiscountSet = { id: string; name: string; slug: string; description: string | null; active: boolean | null; starts_at: string | null; ends_at: string | null };

function AdminDiscountSets() {
  const [sets, setSets] = useState<DiscountSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formActive, setFormActive] = useState("true");
  const [formStart, setFormStart] = useState("");
  const [formEnd, setFormEnd] = useState("");

  // Edit state
  const [editId, setEditId] = useState<string | null>(null);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await client.get("/discount-sets");
      setSets(res.data.data ?? []);
    } catch { setError("Error al cargar"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const resetForm = () => {
    setFormName(""); setFormSlug(""); setFormDesc(""); setFormActive("true");
    setFormStart(""); setFormEnd(""); setEditId(null);
  };

  const openEdit = (d: DiscountSet) => {
    setEditId(d.id);
    setFormName(d.name);
    setFormSlug(d.slug);
    setFormDesc(d.description ?? "");
    setFormActive(d.active ? "true" : "false");
    setFormStart(d.starts_at ? d.starts_at.substring(0, 10) : "");
    setFormEnd(d.ends_at ? d.ends_at.substring(0, 10) : "");
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError(null);
    try {
      const body = {
        name: formName,
        slug: formSlug,
        description: formDesc || null,
        active: formActive === "true",
        starts_at: formStart ? new Date(formStart).toISOString() : null,
        ends_at: formEnd ? new Date(formEnd).toISOString() : null,
      };
      if (editId) {
        await client.patch(`/discount-sets/${editId}`, body);
      } else {
        await client.post("/discount-sets", body);
      }
      resetForm(); setShowForm(false); fetch();
    } catch (err: unknown) { setError((err as any)?.response?.data?.message ?? "Error"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar conjunto?")) return;
    try {
      await client.delete(`/discount-sets/${id}`);
      fetch();
    } catch { setError("Error al eliminar"); }
  };

  const columns: Column<DiscountSet>[] = [
    { header: "Nombre", render: (d) => d.name },
    { header: "Slug", render: (d) => d.slug, hideOnMobile: true },
    { header: "Descripción", render: (d) => d.description ?? "—", hideOnMobile: true },
    { header: "Activo", render: (d) => d.active ? "Sí" : "No" },
    { header: "Vigencia", render: (d) => {
      if (!d.starts_at && !d.ends_at) return "Siempre";
      return `${d.starts_at ? new Date(d.starts_at).toLocaleDateString() : "—"} - ${d.ends_at ? new Date(d.ends_at).toLocaleDateString() : "∞"}`;
    }, hideOnMobile: true },
    {
      header: "Acción", render: (d) => (
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button className="btn-secondary" onClick={() => openEdit(d)}>Editar</button>
          <button className="btn-danger" onClick={() => handleDelete(d.id)}>Eliminar</button>
        </div>
      ),
    },
  ];

  return (
    <CrudPage
      title="Conjuntos de descuentos"
      action={{ label: showForm ? "Cancelar" : "+ Nuevo conjunto", onClick: () => { setShowForm(!showForm); resetForm(); } }}
      search={{ placeholder: "Buscar por nombre o slug...", value: search, onChange: setSearch }}
    >
      {error && <p className="error-msg">{error}</p>}

      {showForm && (
        <form className="ds-form" onSubmit={handleSubmit}>
          <h3>{editId ? "Editar conjunto" : "Nuevo conjunto"}</h3>
          <div className="ds-form__row">
            <input className="field-input" type="text" placeholder="Nombre *" value={formName} onChange={(e) => setFormName(e.target.value)} required style={{ flex: 1 }} />
            <input className="field-input" type="text" placeholder="Slug *" value={formSlug} onChange={(e) => setFormSlug(e.target.value)} required style={{ flex: 1 }} />
            <input className="field-input" type="text" placeholder="Descripción" value={formDesc} onChange={(e) => setFormDesc(e.target.value)} style={{ flex: 1 }} />
            <select className="field-input" value={formActive} onChange={(e) => setFormActive(e.target.value)} style={{ flex: 1 }}>
              <option value="true">Activo</option><option value="false">Inactivo</option>
            </select>
            <input className="field-input" type="date" value={formStart} onChange={(e) => setFormStart(e.target.value)} style={{ flex: 1 }} />
            <input className="field-input" type="date" value={formEnd} onChange={(e) => setFormEnd(e.target.value)} style={{ flex: 1 }} />
            <button type="submit" className="crud__action" disabled={saving}>{saving ? "..." : editId ? "Guardar" : "+ Crear"}</button>
          </div>
        </form>
      )}

      <DataTable
        columns={columns}
        data={sets.filter((d) => !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.slug.toLowerCase().includes(search.toLowerCase()))}
        keyExtractor={(d: any) => d.id}
        loading={loading}
        emptyMessage="Sin conjuntos de descuentos"
      />
    </CrudPage>
  );
}

export default AdminDiscountSets;
