import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Scanner } from "@yudiel/react-qr-scanner";
import client from "@/api/client";
import CrudPage from "@/components/admin/CrudPage";
import AdminForm from "@/components/admin/AdminForm";
import "@/pages/admin/AdminInventory.scss";
import "@/pages/admin/AdminInventory_responsive.scss";

type Product = { id: number; name: string; slug: string; barcode: string | null; price: string };
type StorageUnit = { id: number; code: string; warehouse_id: number };
type InventoryEntry = { id: number; product_id: number; storage_unit_id: number; batch_code: string | null; quantity: number; low_stock_threshold: number; entry_date: string; expire_date: string | null };

function AdminInventory() {
  const [params, setParams] = useSearchParams();
  const showAdd = params.get("action") === "agregar";

  const [entries, setEntries] = useState<InventoryEntry[]>([]);
  const [storageUnits, setStorageUnits] = useState<StorageUnit[]>([]);
  const [products, setProducts] = useState<Map<number, Product>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addProductId, setAddProductId] = useState("");
  const [barcodeInput, setBarcodeInput] = useState("");
  const [updating, setUpdating] = useState<number | null>(null);
  const [newEntry, setNewEntry] = useState({ storage_unit_id: "", batch_code: "", quantity: "1", low_stock_threshold: "5", expire_date: "" });
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    setLoading(true); setError(null);
    try {
      const [er, sr, pr] = await Promise.all([client.get("/inventory"), client.get("/storage-units"), client.get("/products?limit=500")]);
      setEntries(er.data.data ?? []); setStorageUnits(sr.data.data ?? []);
      const map = new Map<number, Product>();
      for (const p of pr.data.data ?? []) map.set(p.id, p);
      setProducts(map);
    } catch { setError("Error al cargar datos"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleBarcodeLookup = async (code: string) => {
    if (!code) return;
    try {
      const { data } = await client.get(`/products?barcode=${encodeURIComponent(code)}`);
      const found = data.data?.[0] ?? null;
      if (found) { setAddProductId(String(found.id)); setBarcodeInput(""); }
      else setError(`No se encontró producto con código "${code}"`);
    } catch { setError("Error al buscar producto"); }
  };

  const handleQuickUpdate = async (entryId: number, newQty: number) => {
    setUpdating(entryId);
    try { await client.patch(`/inventory/${entryId}`, { quantity: newQty }); setEntries((p) => p.map((e) => (e.id === entryId ? { ...e, quantity: newQty } : e))); }
    catch { setError("Error"); }
    finally { setUpdating(null); }
  };

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    const pid = Number(addProductId);
    if (!pid) return;
    setUpdating(-1);
    try {
      await client.post("/inventory", {
        product_id: pid, storage_unit_id: Number(newEntry.storage_unit_id), batch_code: newEntry.batch_code || null,
        quantity: Number(newEntry.quantity), low_stock_threshold: Number(newEntry.low_stock_threshold),
        expire_date: newEntry.expire_date ? new Date(newEntry.expire_date).toISOString() : null,
      });
      setParams({}); setAddProductId("");
      setNewEntry({ storage_unit_id: "", batch_code: "", quantity: "1", low_stock_threshold: "5", expire_date: "" });
      fetchData();
    } catch { setError("Error"); }
    finally { setUpdating(null); }
  };

  const getUnitName = (id: number) => storageUnits.find((u) => u.id === id)?.code ?? `#${id}`;

  const filteredEntries = entries.filter((e) => {
    if (!search) return true;
    const prod = products.get(e.product_id);
    return prod?.name.toLowerCase().includes(search.toLowerCase()) || prod?.barcode?.toLowerCase().includes(search.toLowerCase());
  });

  const productList = Array.from(products.values());
  const selectedProduct = productList.find((p) => String(p.id) === addProductId);

  if (showAdd) {
    return (
      <AdminForm title="Agregar stock" onBack={() => setParams({})} onSubmit={handleAddEntry}>
        <div className="admin-inv__scanner">
          <Scanner
            onScan={(codes) => { const code = codes[0]?.rawValue; if (code) handleBarcodeLookup(code); }}
            onError={(e) => console.error(e)}
            formats={['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'code_93', 'codabar', 'itf']}
            paused={!!addProductId} allowMultiple scanDelay={1500} sound
            styles={{ container: { width: '100%', borderRadius: '8px', overflow: 'hidden' } }}
          />
        </div>

        <div className="admin-inv__scan-row" style={{ marginBottom: '0.75rem' }}>
          <input type="text" className="admin-inv__scan-input" placeholder="O escribe el código..." value={barcodeInput} onChange={(e) => setBarcodeInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleBarcodeLookup(barcodeInput)} />
          <button className="admin-inv__scan-btn" type="button" onClick={() => handleBarcodeLookup(barcodeInput)}>Buscar</button>
        </div>

        <AdminForm.Field label="Producto">
          <select value={addProductId} onChange={(e) => setAddProductId(e.target.value)} required>
            <option value="">Seleccionar producto...</option>
            {productList.map((p) => <option key={p.id} value={p.id}>{p.name}{p.barcode ? ` (${p.barcode})` : ""}</option>)}
          </select>
        </AdminForm.Field>

        {selectedProduct && <p className="status-msg" style={{ marginBottom: '0.75rem' }}>Producto: <strong>{selectedProduct.name}</strong> {selectedProduct.barcode && <span className="admin-inv__mono">({selectedProduct.barcode})</span>}</p>}

        <AdminForm.Field label="Ubicación">
          <select value={newEntry.storage_unit_id} onChange={(e) => setNewEntry((f) => ({ ...f, storage_unit_id: e.target.value }))} required>
            <option value="">Seleccionar...</option>
            {storageUnits.map((u) => <option key={u.id} value={u.id}>{u.code}</option>)}
          </select>
        </AdminForm.Field>

        <AdminForm.Row>
          <AdminForm.Field label="Cantidad">
            <input type="number" min={1} value={newEntry.quantity} onChange={(e) => setNewEntry((f) => ({ ...f, quantity: e.target.value }))} required />
          </AdminForm.Field>
          <AdminForm.Field label="Lote">
            <input type="text" value={newEntry.batch_code} onChange={(e) => setNewEntry((f) => ({ ...f, batch_code: e.target.value }))} placeholder="Opcional" />
          </AdminForm.Field>
        </AdminForm.Row>

        <AdminForm.Row>
          <AdminForm.Field label="Stock mínimo">
            <input type="number" min={0} value={newEntry.low_stock_threshold} onChange={(e) => setNewEntry((f) => ({ ...f, low_stock_threshold: e.target.value }))} />
          </AdminForm.Field>
          <AdminForm.Field label="Vencimiento">
            <input type="date" value={newEntry.expire_date} onChange={(e) => setNewEntry((f) => ({ ...f, expire_date: e.target.value }))} />
          </AdminForm.Field>
        </AdminForm.Row>

        <AdminForm.Actions saving={updating === -1} saveLabel="Guardar" onCancel={() => { setAddProductId(""); setBarcodeInput(""); setNewEntry({ storage_unit_id: "", batch_code: "", quantity: "1", low_stock_threshold: "5", expire_date: "" }); }} />
      </AdminForm>
    );
  }

  return (
    <CrudPage title="Inventario" action={{ label: "Agregar stock", onClick: () => { setAddProductId(""); setParams({ action: "agregar" }); } }} search={{ placeholder: "Buscar por producto...", value: search, onChange: setSearch }}>
      {error && <p className="error-msg">{error}</p>}

      {loading ? <p className="status-msg">Cargando...</p>
      : filteredEntries.length === 0 ? <p className="status-msg">{search ? "Sin resultados" : "Sin registros de inventario"}</p>
      : (
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Producto</th><th>Código</th><th>Almacén</th><th>Cantidad</th><th>Stock mín</th><th>Vencimiento</th></tr></thead>
            <tbody>
              {filteredEntries.map((e) => {
                const prod = products.get(e.product_id);
                return (
                  <tr key={e.id} className={e.quantity <= e.low_stock_threshold ? "admin-inv__row--low" : ""}>
                    <td>{prod?.name ?? `#${e.product_id}`}</td>
                    <td className="admin-inv__mono">{prod?.barcode ?? "—"}</td>
                    <td>{getUnitName(e.storage_unit_id)}</td>
                    <td><input type="number" className="admin-inv__qty-input" defaultValue={e.quantity} onBlur={(ev) => { const val = Number(ev.target.value); if (val !== e.quantity) handleQuickUpdate(e.id, val); }} onKeyDown={(ev) => { if (ev.key === "Enter") (ev.target as HTMLInputElement).blur(); }} disabled={updating === e.id} /></td>
                    <td>{e.low_stock_threshold}</td>
                    <td>{e.expire_date ? new Date(e.expire_date).toLocaleDateString() : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </CrudPage>
  );
}

export default AdminInventory;
