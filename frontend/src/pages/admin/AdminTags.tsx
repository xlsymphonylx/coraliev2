import { useEffect, useState } from "react";
import client from "@/api/client";
import "@/pages/admin/AdminTags.scss";
import "@/pages/admin/AdminTags_responsive.scss";

type Tag = { id: number; name: string; slug: string };

function AdminTags() {
  const [items, setItems] = useState<Tag[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = async () => {
    setLoading(true);
    try { const { data } = await client.get("/tags"); setItems(data.data ?? []); }
    catch { setError("Error al cargar"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setCreating(true); setError(null);
    try {
      await client.post("/tags", { name });
      setName("");
      fetch();
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Error");
    } finally { setCreating(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar esta etiqueta?")) return;
    try { await client.delete(`/tags/${id}`); fetch(); }
    catch { setError("Error al eliminar"); }
  };

  return (
    <div className="admin-tags">
      <div className="admin-tags__header">
        <h1 className="admin-tags__title">Etiquetas</h1>
      </div>

      {error && <p className="admin-tags__error">{error}</p>}

      <form className="admin-tags__create" onSubmit={handleCreate}>
        <input className="admin-tags__input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre de la etiqueta" required />
        <button className="admin-tags__btn" type="submit" disabled={creating}>{creating ? "..." : "+ Crear"}</button>
      </form>

      {loading ? <p className="admin-tags__status">Cargando...</p>
      : items.length === 0 ? <p className="admin-tags__status">Sin etiquetas</p>
      : (
        <div className="admin-tags__table-wrap">
          <table className="admin-tags__table">
            <thead><tr><th>ID</th><th>Nombre</th><th>Slug</th><th>Acción</th></tr></thead>
            <tbody>
              {items.map((t) => (
                <tr key={t.id}>
                  <td>{t.id}</td><td>{t.name}</td><td>{t.slug}</td>
                  <td><button className="admin-tags__delete" onClick={() => handleDelete(t.id)}>Eliminar</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminTags;
