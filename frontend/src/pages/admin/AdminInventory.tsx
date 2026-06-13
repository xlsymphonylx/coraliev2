import { useEffect, useRef, useState } from "react";
import client from "@/api/client";
import "@/pages/admin/AdminInventory.scss";
import "@/pages/admin/AdminInventory_responsive.scss";

type Product = {
  id: number;
  name: string;
  slug: string;
  barcode: string | null;
  price: string;
};

type StorageUnit = {
  id: number;
  name: string;
};

type Warehouse = {
  id: number;
  name: string;
};

type InventoryEntry = {
  id: number;
  product_id: number;
  storage_unit_id: number;
  batch_code: string | null;
  quantity: number;
  low_stock_threshold: number;
  entry_date: string;
  expire_date: string | null;
};

function AdminInventory() {
  const [entries, setEntries] = useState<InventoryEntry[]>([]);
  const [storageUnits, setStorageUnits] = useState<StorageUnit[]>([]);
  const [products, setProducts] = useState<Map<number, Product>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);

  // Scanning
  const [barcodeInput, setBarcodeInput] = useState("");
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const barcodeRef = useRef<HTMLInputElement>(null);

  // Quick update
  const [updating, setUpdating] = useState<number | null>(null);

  // Modal for creating entry
  const [showAdd, setShowAdd] = useState(false);
  const [newEntry, setNewEntry] = useState({
    storage_unit_id: "",
    batch_code: "",
    quantity: "1",
    low_stock_threshold: "5",
    expire_date: "",
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [entriesRes, unitsRes, productsRes] = await Promise.all([
        client.get("/inventory"),
        client.get("/storage-units"),
        client.get("/products?limit=500"),
      ]);
      setEntries(entriesRes.data.data ?? []);
      setStorageUnits(unitsRes.data.data ?? []);

      const map = new Map<number, Product>();
      for (const p of productsRes.data.data ?? []) {
        map.set(p.id, p);
      }
      setProducts(map);
    } catch {
      setError("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleBarcodeScan = async () => {
    const code = barcodeInput.trim();
    if (!code) return;
    setScanning(true);
    setError(null);
    try {
      const { data } = await client.get(`/products?barcode=${encodeURIComponent(code)}`);
      const found = data.data?.[0] ?? null;
      setScannedProduct(found);
      if (!found) {
        setError(`No se encontró producto con código "${code}"`);
      }
    } catch {
      setError("Error al buscar producto");
    } finally {
      setScanning(false);
    }
  };

  const handleBarcodeKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleBarcodeScan();
    }
  };

  const handleQuickUpdate = async (entryId: number, newQty: number) => {
    setUpdating(entryId);
    try {
      await client.patch(`/inventory/${entryId}`, { quantity: newQty });
      setEntries((prev) =>
        prev.map((e) => (e.id === entryId ? { ...e, quantity: newQty } : e)),
      );
    } catch {
      setError("Error al actualizar cantidad");
    } finally {
      setUpdating(null);
    }
  };

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannedProduct) return;
    setUpdating(-1);
    try {
      await client.post("/inventory", {
        product_id: scannedProduct.id,
        storage_unit_id: Number(newEntry.storage_unit_id),
        batch_code: newEntry.batch_code || null,
        quantity: Number(newEntry.quantity),
        low_stock_threshold: Number(newEntry.low_stock_threshold),
        expire_date: newEntry.expire_date
          ? new Date(newEntry.expire_date).toISOString()
          : null,
      });
      setShowAdd(false);
      setNewEntry({
        storage_unit_id: "",
        batch_code: "",
        quantity: "1",
        low_stock_threshold: "5",
        expire_date: "",
      });
      fetchData();
    } catch {
      setError("Error al agregar entrada");
    } finally {
      setUpdating(null);
    }
  };

  const filteredEntries = scannedProduct
    ? entries.filter((e) => e.product_id === scannedProduct.id)
    : [];

  const getUnitName = (id: number) => storageUnits.find((u) => u.id === id)?.name ?? `#${id}`;

  const clearScan = () => {
    setBarcodeInput("");
    setScannedProduct(null);
    setError(null);
    barcodeRef.current?.focus();
  };

  return (
    <div className="admin-inv">
      <div className="admin-inv__header">
        <h1 className="admin-inv__title">Inventario</h1>
        <button className="admin-inv__refresh" onClick={fetchData}>
          Recargar
        </button>
      </div>

      {/* Barcode scanner */}
      <div className="admin-inv__scanner">
        <label className="admin-inv__scan-field">
          <span>Escanear código de barras</span>
          <div className="admin-inv__scan-row">
            <input
              ref={barcodeRef}
              type="text"
              className="admin-inv__scan-input"
              placeholder="Escanea un código o escríbelo..."
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              onKeyDown={handleBarcodeKeyDown}
              autoFocus
            />
            <button
              className="admin-inv__scan-btn"
              onClick={handleBarcodeScan}
              disabled={scanning}
            >
              {scanning ? "..." : "Buscar"}
            </button>
          </div>
        </label>

        {scannedProduct && (
          <div className="admin-inv__result">
            <div className="admin-inv__result-info">
              <strong>{scannedProduct.name}</strong>
              <span className="admin-inv__result-barcode">
                {scannedProduct.barcode ?? "sin código"}
              </span>
              <span className="admin-inv__result-price">
                ${scannedProduct.price}
              </span>
            </div>
            <div className="admin-inv__result-actions">
              <button className="admin-inv__add-btn" onClick={() => setShowAdd(true)}>
                + Añadir stock
              </button>
              <button className="admin-inv__clear-btn" onClick={clearScan}>
                Limpiar
              </button>
            </div>
          </div>
        )}
      </div>

      {error && <p className="admin-inv__error">{error}</p>}

      {/* Add entry form */}
      {showAdd && scannedProduct && (
        <form className="admin-inv__add-form" onSubmit={handleAddEntry}>
          <h3>Agregar stock — {scannedProduct.name}</h3>

          <label className="admin-inv__field">
            <span>Almacén</span>
            <select
              value={newEntry.storage_unit_id}
              onChange={(e) => setNewEntry((f) => ({ ...f, storage_unit_id: e.target.value }))}
              required
            >
              <option value="">Seleccionar...</option>
              {storageUnits.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </label>

          <div className="admin-inv__row">
            <label className="admin-inv__field">
              <span>Cantidad</span>
              <input
                type="number"
                min={1}
                value={newEntry.quantity}
                onChange={(e) => setNewEntry((f) => ({ ...f, quantity: e.target.value }))}
                required
              />
            </label>
            <label className="admin-inv__field">
              <span>Lote</span>
              <input
                type="text"
                value={newEntry.batch_code}
                onChange={(e) => setNewEntry((f) => ({ ...f, batch_code: e.target.value }))}
                placeholder="Opcional"
              />
            </label>
          </div>

          <div className="admin-inv__row">
            <label className="admin-inv__field">
              <span>Stock mínimo</span>
              <input
                type="number"
                min={0}
                value={newEntry.low_stock_threshold}
                onChange={(e) => setNewEntry((f) => ({ ...f, low_stock_threshold: e.target.value }))}
              />
            </label>
            <label className="admin-inv__field">
              <span>Fecha de vencimiento</span>
              <input
                type="date"
                value={newEntry.expire_date}
                onChange={(e) => setNewEntry((f) => ({ ...f, expire_date: e.target.value }))}
              />
            </label>
          </div>

          <div className="admin-inv__add-actions">
            <button type="submit" className="admin-inv__save-btn" disabled={updating === -1}>
              {updating === -1 ? "Guardando..." : "Guardar"}
            </button>
            <button type="button" className="admin-inv__cancel-btn" onClick={() => setShowAdd(false)}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Inventory entries for scanned product */}
      {scannedProduct && (
        <div className="admin-inv__entries">
          <h2 className="admin-inv__entries-title">
            Stock en almacenes
          </h2>

          {filteredEntries.length === 0 ? (
            <p className="admin-inv__status">Sin registros de inventario para este producto</p>
          ) : (
            <div className="admin-inv__table-wrap">
              <table className="admin-inv__table">
                <thead>
                  <tr>
                    <th>Almacén</th>
                    <th>Lote</th>
                    <th>Cantidad</th>
                    <th>Stock mínimo</th>
                    <th>Vencimiento</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEntries.map((e) => (
                    <tr
                      key={e.id}
                      className={
                        e.quantity <= e.low_stock_threshold
                          ? "admin-inv__row--low"
                          : ""
                      }
                    >
                      <td>{getUnitName(e.storage_unit_id)}</td>
                      <td className="admin-inv__mono">{e.batch_code ?? "—"}</td>
                      <td>
                        <input
                          type="number"
                          className="admin-inv__qty-input"
                          defaultValue={e.quantity}
                          onBlur={(ev) => {
                            const val = Number(ev.target.value);
                            if (val !== e.quantity) handleQuickUpdate(e.id, val);
                          }}
                          onKeyDown={(ev) => {
                            if (ev.key === "Enter") {
                              (ev.target as HTMLInputElement).blur();
                            }
                          }}
                          disabled={updating === e.id}
                        />
                      </td>
                      <td>{e.low_stock_threshold}</td>
                      <td>{e.expire_date ? new Date(e.expire_date).toLocaleDateString() : "—"}</td>
                      <td>
                        <button
                          className="admin-inv__delete-entry"
                          onClick={async () => {
                            if (!confirm("Eliminar esta entrada?")) return;
                            try {
                              await client.delete(`/inventory/${e.id}`);
                              fetchData();
                            } catch {
                              setError("Error al eliminar");
                            }
                          }}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Full inventory list (when nothing scanned) */}
      {!scannedProduct && (
        <div className="admin-inv__entries">
          <h2 className="admin-inv__entries-title">Todo el inventario</h2>

          {loading ? (
            <p className="admin-inv__status">Cargando...</p>
          ) : entries.length === 0 ? (
            <p className="admin-inv__status">Sin registros de inventario</p>
          ) : (
            <div className="admin-inv__table-wrap">
              <table className="admin-inv__table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Código</th>
                    <th>Almacén</th>
                    <th>Cantidad</th>
                    <th>Stock mín</th>
                    <th>Vencimiento</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e) => {
                    const prod = products.get(e.product_id);
                    return (
                      <tr
                        key={e.id}
                        className={
                          e.quantity <= e.low_stock_threshold
                            ? "admin-inv__row--low"
                            : ""
                        }
                      >
                        <td>{prod?.name ?? `#${e.product_id}`}</td>
                        <td className="admin-inv__mono">{prod?.barcode ?? "—"}</td>
                        <td>{getUnitName(e.storage_unit_id)}</td>
                        <td>{e.quantity}</td>
                        <td>{e.low_stock_threshold}</td>
                        <td>{e.expire_date ? new Date(e.expire_date).toLocaleDateString() : "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminInventory;
