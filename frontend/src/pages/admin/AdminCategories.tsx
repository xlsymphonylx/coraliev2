import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import client from "@/api/client";
import { fetchCategories, buildCategoryTree, flattenTree } from "@/api/categories";
import type { CategoryWithDepth } from "@/api/categories";
import CrudPage from "@/components/admin/CrudPage";
import DataTable from "@/components/admin/DataTable";
import type { Column } from "@/components/admin/DataTable";
import AdminForm from "@/components/admin/AdminForm";
import "@/pages/admin/AdminCategories.scss";

function AdminCategories() {
  const [params, setParams] = useSearchParams();
  const action = params.get("action") || "list";
  const editId = params.get("id");

  const [items, setItems] = useState<CategoryWithDepth[]>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [desc, setDesc] = useState("");
  const [parentId, setParentId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const fetch = async () => {
    setLoading(true);
    try {
      const cats = await fetchCategories();
      setItems(flattenTree(buildCategoryTree(cats)));
    }
    catch { setError("Error al cargar"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);
  useEffect(() => {
    if (action === "editar" && editId) {
      const item = items.find((c) => c.id === Number(editId));
      if (item) { setName(item.name); setSlug(item.slug); setDesc(item.description ?? ""); setParentId(item.parent_id?.toString() ?? ""); }
    } else { setName(""); setSlug(""); setDesc(""); setParentId(""); }
  }, [action, editId, items]);

  const goList = () => setParams({});
  const goEdit = (id: number) => setParams({ action: "editar", id: String(id) });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError(null);
    const payload = { name, slug: slug || undefined, description: desc || null, parent_id: parentId ? Number(parentId) : null };
    try {
      if (action === "crear") await client.post("/categories", payload);
      else await client.patch(`/categories/${editId}`, payload);
      goList(); fetch();
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Error al guardar");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar esta categoría?")) return;
    try { await client.delete(`/categories/${id}`); fetch(); }
    catch { setError("Error al eliminar"); }
  };

  if (action === "crear" || action === "editar") {
    return (
      <AdminForm
        title={action === "crear" ? "Nueva categoría" : "Editar categoría"}
        onBack={goList}
        onSubmit={handleSave}
        saving={saving}
        error={error}
      >
        <AdminForm.Field label="Nombre *">
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </AdminForm.Field>

        <AdminForm.Field label="Slug">
          <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="Auto-generado si se deja vacío" />
        </AdminForm.Field>

        <AdminForm.Field label="Descripción">
          <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={2} />
        </AdminForm.Field>

        <AdminForm.Field label="Categoría padre">
          <select value={parentId} onChange={(e) => setParentId(e.target.value)}>
            <option value="">Ninguna (raíz)</option>
            {items.filter((c) => c.id !== Number(editId)).map((c) => (
              <option key={c.id} value={c.id}>
                {"—".repeat(c.depth)}{c.depth > 0 ? " " : ""}{c.name}
              </option>
            ))}
          </select>
        </AdminForm.Field>

        <AdminForm.Actions saving={saving} onCancel={goList} />
      </AdminForm>
    );
  }

  const filtered = items.filter((c) =>
    !search || c.name.toLowerCase().includes(search.toLowerCase())
  );

  const columns: Column<CategoryWithDepth>[] = [
    { header: "ID", render: (c) => c.id },
    {
      header: "Nombre",
      render: (c) => (
        <span style={{ paddingLeft: `${c.depth * 1.25}rem`, display: "inline-block" }}>
          {c.depth > 0 && <span style={{ marginRight: "0.35rem", opacity: 0.4 }}>└─</span>}
          {c.name}
        </span>
      ),
    },
    { header: "Slug", render: (c) => c.slug, hideOnMobile: true },
    { header: "Padre", render: (c) => items.find((p) => p.id === c.parent_id)?.name ?? "—", hideOnMobile: true },
    {
      header: "Acción",
      render: (c) => (
        <div className="cell-actions">
          <button onClick={() => goEdit(c.id)}>Editar</button>
          <button className="admin-cat__delete" onClick={() => handleDelete(c.id)}>Eliminar</button>
        </div>
      ),
    },
  ];

  return (
    <CrudPage title="Categorías" action={{ label: "+ Nueva", onClick: () => setParams({ action: "crear" }) }} search={{ placeholder: "Buscar por nombre...", value: search, onChange: setSearch }}>
      <DataTable columns={columns} data={filtered} keyExtractor={(c) => c.id} loading={loading} error={error} emptyMessage={search ? "Sin resultados" : "Sin categorías"} />
    </CrudPage>
  );
}

export default AdminCategories;
