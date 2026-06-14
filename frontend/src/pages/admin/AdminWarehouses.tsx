import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import client from "@/api/client";
import CrudDual from "@/components/admin/CrudDual";
import "@/pages/admin/AdminWarehouses.scss";
import "@/pages/admin/AdminWarehouses_responsive.scss";

type Warehouse = { id: number; name: string };
type StorageUnit = { id: number; warehouse_id: number; code: string };

function AdminWarehouses() {
  const [params, setParams] = useSearchParams();
  const view = params.get("view") || "warehouses";
  const editWId = params.get("editW");
  const editSId = params.get("editS");

  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [units, setUnits] = useState<StorageUnit[]>([]);
  const [wName, setWName] = useState("");
  const [sCode, setSCode] = useState("");
  const [sWarehouse, setSWarehouse] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedW, setSelectedW] = useState<number | null>(null);

  const fetch = async () => {
    setLoading(true);
    try {
      const [wr, sr] = await Promise.all([client.get("/warehouses"), client.get("/storage-units")]);
      setWarehouses(wr.data.data ?? []);
      setUnits(sr.data.data ?? []);
    } catch { setError("Error al cargar"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  useEffect(() => {
    if (editWId) { const w = warehouses.find((x) => x.id === Number(editWId)); setWName(w?.name ?? ""); }
    else { setWName(""); }
    if (editSId) { const s = units.find((x) => x.id === Number(editSId)); setSCode(s?.code ?? ""); setSWarehouse(s ? String(s.warehouse_id) : ""); }
    else { setSCode(""); setSWarehouse(""); }
  }, [editWId, editSId, warehouses, units]);

  const handleSaveW = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError(null);
    try {
      if (editWId) await client.patch(`/warehouses/${editWId}`, { name: wName });
      else await client.post("/warehouses", { name: wName });
      setParams({ view: "warehouses" }); fetch();
    } catch (err: unknown) { setError((err as any)?.response?.data?.message ?? "Error"); }
    finally { setSaving(false); }
  };

  const handleSaveS = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError(null);
    try {
      if (editSId) await client.patch(`/storage-units/${editSId}`, { code: sCode });
      else await client.post("/storage-units", { warehouse_id: Number(sWarehouse), code: sCode });
      setParams({ view: "units" }); fetch();
    } catch (err: unknown) { setError((err as any)?.response?.data?.message ?? "Error"); }
    finally { setSaving(false); }
  };

  const filteredWarehouses = warehouses.filter((w) =>
    !search || w.name.toLowerCase().includes(search.toLowerCase())
  );
  const filteredUnits = (selectedW ? units.filter((u) => u.warehouse_id === selectedW) : units).filter((u) =>
    !search || u.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <CrudDual
      title="Almacenes"
      search={{ placeholder: "Buscar por nombre o código...", value: search, onChange: setSearch }}
      tabs={[
        { key: "warehouses", label: "Almacenes", active: view === "warehouses", onClick: () => setParams({ view: "warehouses" }) },
        { key: "units", label: "Ubicaciones", active: view === "units", onClick: () => setParams({ view: "units" }) },
      ]}
      error={error}
    >
      {view === "warehouses" && (
        <>
          <CrudDual.FormCard title={editWId ? "Editar almacén" : "Nuevo almacén"} onSubmit={handleSaveW} saving={saving} onCancel={editWId ? () => setParams({ view: "warehouses" }) : undefined}>
            <input className="field-input" value={wName} onChange={(e) => setWName(e.target.value)} placeholder="Nombre del almacén" required={!editWId} style={{ flex: 1 }} />
            <button type="submit" className="crud__action" disabled={saving}>{saving ? "..." : editWId ? "Actualizar" : "+ Crear"}</button>
          </CrudDual.FormCard>

          {loading ? <p className="status-msg">Cargando...</p>
          : filteredWarehouses.length === 0 ? <p className="status-msg">Sin almacenes</p>
          : (
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>ID</th><th>Nombre</th><th>Ubicaciones</th><th>Acciones</th></tr></thead>
                <tbody>
                  {filteredWarehouses.map((w) => (
                    <tr key={w.id}>
                      <td>{w.id}</td><td>{w.name}</td>
                      <td>{units.filter((u) => u.warehouse_id === w.id).length}</td>
                      <td className="cell-actions">
                        <button onClick={() => setParams({ view: "warehouses", editW: String(w.id) })}>Editar</button>
                        <button className="btn-danger" onClick={async () => {
                          if (!confirm("¿Eliminar almacén?")) return;
                          try { await client.delete(`/warehouses/${w.id}`); fetch(); } catch { setError("Error"); }
                        }}>Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {view === "units" && (
        <>
          <CrudDual.FormCard title={editSId ? "Editar ubicación" : "Nueva ubicación"} onSubmit={handleSaveS} saving={saving} onCancel={editSId ? () => setParams({ view: "units" }) : undefined}>
            <select className="field-input" value={sWarehouse} onChange={(e) => setSWarehouse(e.target.value)} required={!editSId} disabled={!!editSId} style={{ minWidth: '12rem' }}>
              <option value="">Seleccionar almacén...</option>
              {filteredWarehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
            <input className="field-input" value={sCode} onChange={(e) => setSCode(e.target.value)} placeholder="Código (ej: A-01)" required />
            <button type="submit" className="crud__action" disabled={saving}>{saving ? "..." : editSId ? "Actualizar" : "+ Crear"}</button>
          </CrudDual.FormCard>

          <div className="admin-wh__filter">
            <select className="field-input" value={selectedW ?? ""} onChange={(e) => setSelectedW(e.target.value ? Number(e.target.value) : null)}>
              <option value="">Todos los almacenes</option>
              {filteredWarehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>

          {loading ? <p className="status-msg">Cargando...</p>
          : filteredUnits.length === 0 ? <p className="status-msg">Sin ubicaciones</p>
          : (
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>ID</th><th>Código</th><th>Almacén</th><th>Acciones</th></tr></thead>
                <tbody>
                  {filteredUnits.map((u) => (
                    <tr key={u.id}>
                      <td>{u.id}</td><td>{u.code}</td>
                      <td>{warehouses.find((w) => w.id === u.warehouse_id)?.name ?? "—"}</td>
                      <td className="cell-actions">
                        <button onClick={() => setParams({ view: "units", editS: String(u.id) })}>Editar</button>
                        <button className="btn-danger" onClick={async () => {
                          if (!confirm("¿Eliminar ubicación?")) return;
                          try { await client.delete(`/storage-units/${u.id}`); fetch(); } catch { setError("Error"); }
                        }}>Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </CrudDual>
  );
}

export default AdminWarehouses;
