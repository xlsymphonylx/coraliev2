import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import client from "@/api/client";
import CrudDual from "@/components/admin/CrudDual";
import AdminForm from "@/components/admin/AdminForm";
import "@/pages/admin/AdminWarehouses.scss";
import "@/pages/admin/AdminWarehouses_responsive.scss";

type Warehouse = { id: number; name: string };
type StorageUnit = { id: number; warehouse_id: number; code: string };

function AdminWarehouses() {
  const [params, setParams] = useSearchParams();
  const view = params.get("view") || "warehouses";
  const action = params.get("action");
  const editId = action === "editar" ? params.get("id") : null;
  const isWarehouseForm = view === "warehouses" && action;
  const isUnitForm = view === "units" && action;

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
    if (isWarehouseForm && editId) { const w = warehouses.find((x) => x.id === Number(editId)); setWName(w?.name ?? ""); }
    else if (!isWarehouseForm) { setWName(""); }
    if (isUnitForm && editId) { const s = units.find((x) => x.id === Number(editId)); setSCode(s?.code ?? ""); setSWarehouse(s ? String(s.warehouse_id) : ""); }
    else if (!isUnitForm) { setSCode(""); setSWarehouse(""); }
  }, [action, editId, view, warehouses, units]);

  const goToList = () => setParams({ view });

  const handleSaveW = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError(null);
    try {
      if (editId) await client.patch(`/warehouses/${editId}`, { name: wName });
      else await client.post("/warehouses", { name: wName });
      goToList(); fetch();
    } catch (err: unknown) { setError((err as any)?.response?.data?.message ?? "Error"); }
    finally { setSaving(false); }
  };

  const handleSaveS = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError(null);
    try {
      if (editId) await client.patch(`/storage-units/${editId}`, { code: sCode });
      else await client.post("/storage-units", { warehouse_id: Number(sWarehouse), code: sCode });
      goToList(); fetch();
    } catch (err: unknown) { setError((err as any)?.response?.data?.message ?? "Error"); }
    finally { setSaving(false); }
  };

  const filteredWarehouses = warehouses.filter((w) =>
    !search || w.name.toLowerCase().includes(search.toLowerCase())
  );
  const filteredUnits = (selectedW ? units.filter((u) => u.warehouse_id === selectedW) : units).filter((u) =>
    !search || u.code.toLowerCase().includes(search.toLowerCase())
  );

  // ── Warehouse form (full page) ──
  if (isWarehouseForm) {
    return (
      <AdminForm
        title={editId ? "Editar almacén" : "Nuevo almacén"}
        onBack={goToList}
        onSubmit={handleSaveW}
        saving={saving}
        error={error}
      >
        <AdminForm.Field label="Nombre del almacén">
          <input value={wName} onChange={(e) => setWName(e.target.value)} placeholder="Nombre del almacén" required={!editId} />
        </AdminForm.Field>
        <AdminForm.Actions saving={saving} saveLabel={editId ? "Actualizar" : "+ Crear"} onCancel={() => setWName("")} />
      </AdminForm>
    );
  }

  // ── Storage unit form (full page) ──
  if (isUnitForm) {
    return (
      <AdminForm
        title={editId ? "Editar ubicación" : "Nueva ubicación"}
        onBack={goToList}
        onSubmit={handleSaveS}
        saving={saving}
        error={error}
      >
        <AdminForm.Field label="Almacén">
          <select value={sWarehouse} onChange={(e) => setSWarehouse(e.target.value)} required={!editId} disabled={!!editId}>
            <option value="">Seleccionar almacén...</option>
            {filteredWarehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
        </AdminForm.Field>
        <AdminForm.Field label="Código">
          <input value={sCode} onChange={(e) => setSCode(e.target.value)} placeholder="Código (ej: A-01)" required />
        </AdminForm.Field>
        <AdminForm.Actions saving={saving} saveLabel={editId ? "Actualizar" : "+ Crear"} onCancel={() => { setSCode(""); setSWarehouse(""); }} />
      </AdminForm>
    );
  }

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
                        <button onClick={() => setParams({ view: "warehouses", action: "editar", id: String(w.id) })}>Editar</button>
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

          <div style={{ marginTop: "1rem" }}>
            <button className="crud__action" onClick={() => setParams({ view: "warehouses", action: "crear" })}>+ Nuevo almacén</button>
          </div>
        </>
      )}

      {view === "units" && (
        <>
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
                        <button onClick={() => setParams({ view: "units", action: "editar", id: String(u.id) })}>Editar</button>
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

          <div style={{ marginTop: "1rem" }}>
            <button className="crud__action" onClick={() => setParams({ view: "units", action: "crear" })}>+ Nueva ubicación</button>
          </div>
        </>
      )}
    </CrudDual>
  );
}

export default AdminWarehouses;
