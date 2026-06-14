import { useEffect, useState } from "react";
import client from "@/api/client";
import CrudDual from "@/components/admin/CrudDual";
import DataTable from "@/components/admin/DataTable";
import type { Column } from "@/components/admin/DataTable";
import "@/pages/admin/AdminDiscounts.scss";

type ProdDiscount = { id: number; product_id: number; discount_percent: string; active: boolean; starts_at: string | null; ends_at: string | null };
type VolDiscount = { id: number; product_id: number | null; min_quantity: number; discount_percent: string; description: string | null };
type Product = { id: number; name: string; barcode: string | null };

function AdminDiscounts() {
  const [tab, setTab] = useState<"product" | "volume">("product");
  const [pd, setPd] = useState<ProdDiscount[]>([]);
  const [vd, setVd] = useState<VolDiscount[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [formProductId, setFormProductId] = useState("");
  const [formPercent, setFormPercent] = useState("");
  const [formActive, setFormActive] = useState("true");
  const [formStart, setFormStart] = useState("");
  const [formEnd, setFormEnd] = useState("");
  const [formMinQty, setFormMinQty] = useState("5");
  const [formDesc, setFormDesc] = useState("");

  const fetch = async () => {
    setLoading(true);
    try {
      const [pr, vr, prods] = await Promise.all([
        client.get("/product-discounts"), client.get("/volume-discounts"), client.get("/products?limit=500"),
      ]);
      setPd(pr.data.data ?? []);
      setVd(vr.data.data ?? []);
      setProducts(prods.data.data ?? []);
    } catch { setError("Error al cargar"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);
  useEffect(() => { resetForm(); }, [tab]);

  const resetForm = () => {
    setFormProductId(""); setFormPercent(""); setFormActive("true");
    setFormStart(""); setFormEnd(""); setFormMinQty("5"); setFormDesc("");
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError(null);
    try {
      if (tab === "product") {
        await client.post("/product-discounts", {
          product_id: Number(formProductId), discount_percent: formPercent,
          active: formActive === "true",
          starts_at: formStart ? new Date(formStart).toISOString() : null,
          ends_at: formEnd ? new Date(formEnd).toISOString() : null,
        });
      } else {
        await client.post("/volume-discounts", {
          product_id: formProductId ? Number(formProductId) : null,
          min_quantity: Number(formMinQty), discount_percent: formPercent,
          description: formDesc || null,
        });
      }
      resetForm(); fetch();
    } catch (err: unknown) { setError((err as any)?.response?.data?.message ?? "Error"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (type: "product" | "volume", id: number) => {
    if (!confirm("¿Eliminar?")) return;
    try {
      await client.delete(`/${type === "product" ? "product-discounts" : "volume-discounts"}/${id}`);
      fetch();
    } catch { setError("Error al eliminar"); }
  };

  const prodName = (id: number) => products.find((p) => p.id === id)?.name ?? `#${id}`;

  const productColumns: Column<ProdDiscount>[] = [
    { header: "ID", render: (d) => d.id },
    { header: "Producto", render: (d) => prodName(d.product_id) },
    { header: "%", render: (d) => `${d.discount_percent}%` },
    { header: "Activo", render: (d) => d.active ? "Sí" : "No", hideOnMobile: true },
    { header: "Vigencia", render: (d) => d.starts_at ? `${new Date(d.starts_at).toLocaleDateString()} - ${d.ends_at ? new Date(d.ends_at).toLocaleDateString() : "∞"}` : "Siempre", hideOnMobile: true },
    { header: "Acción", render: (d) => <button className="btn-danger" onClick={() => handleDelete("product", d.id)}>Eliminar</button> },
  ];

  const volumeColumns: Column<VolDiscount>[] = [
    { header: "ID", render: (d) => d.id },
    { header: "Producto", render: (d) => d.product_id ? prodName(d.product_id) : "Todos" },
    { header: "Mín", render: (d) => d.min_quantity },
    { header: "%", render: (d) => `${d.discount_percent}%` },
    { header: "Descripción", render: (d) => d.description ?? "—", hideOnMobile: true },
    { header: "Acción", render: (d) => <button className="btn-danger" onClick={() => handleDelete("volume", d.id)}>Eliminar</button> },
  ];

  return (
    <CrudDual
      title="Descuentos"
      search={{ placeholder: "Buscar por producto, % o descripción...", value: search, onChange: setSearch }}
      tabs={[
        { key: "product", label: "Por producto", active: tab === "product", onClick: () => setTab("product") },
        { key: "volume", label: "Por volumen", active: tab === "volume", onClick: () => setTab("volume") },
      ]}
      error={error}
    >
      {tab === "product" && (
        <>
          <CrudDual.FormCard title="Nuevo descuento por producto" onSubmit={handleCreate} saving={saving}>
            <select className="field-input" value={formProductId} onChange={(e) => setFormProductId(e.target.value)} required style={{ flex: 1, minWidth: "10rem" }}>
              <option value="">Seleccionar producto...</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name}{p.barcode ? ` (${p.barcode})` : ""}</option>)}
            </select>
            <input className="field-input" type="number" step="0.01" placeholder="% descuento *" value={formPercent} onChange={(e) => setFormPercent(e.target.value)} required style={{ flex: 1, minWidth: "8rem" }} />
            <select className="field-input" value={formActive} onChange={(e) => setFormActive(e.target.value)} style={{ flex: 1, minWidth: "8rem" }}>
              <option value="true">Activo</option><option value="false">Inactivo</option>
            </select>
            <input className="field-input" type="date" value={formStart} onChange={(e) => setFormStart(e.target.value)} style={{ flex: 1, minWidth: "8rem" }} />
            <input className="field-input" type="date" value={formEnd} onChange={(e) => setFormEnd(e.target.value)} style={{ flex: 1, minWidth: "8rem" }} />
            <button type="submit" className="crud__action" disabled={saving}>{saving ? "..." : "+ Crear"}</button>
          </CrudDual.FormCard>

          <DataTable
            columns={productColumns}
            data={pd.filter((d) => !search || prodName(d.product_id).toLowerCase().includes(search.toLowerCase()) || d.discount_percent.includes(search))}
            keyExtractor={(d: any) => d.id}
            loading={loading}
            emptyMessage="Sin descuentos"
          />
        </>
      )}

      {tab === "volume" && (
        <>
          <CrudDual.FormCard title="Nuevo descuento por volumen" onSubmit={handleCreate} saving={saving}>
            <select className="field-input" value={formProductId} onChange={(e) => setFormProductId(e.target.value)} style={{ flex: 1, minWidth: "10rem" }}>
              <option value="">Todos los productos</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name}{p.barcode ? ` (${p.barcode})` : ""}</option>)}
            </select>
            <input className="field-input" type="number" placeholder="Cantidad mínima *" value={formMinQty} onChange={(e) => setFormMinQty(e.target.value)} required style={{ flex: 1, minWidth: "8rem" }} />
            <input className="field-input" type="number" step="0.01" placeholder="% descuento *" value={formPercent} onChange={(e) => setFormPercent(e.target.value)} required style={{ flex: 1, minWidth: "8rem" }} />
            <input className="field-input" type="text" placeholder="Descripción" value={formDesc} onChange={(e) => setFormDesc(e.target.value)} style={{ flex: 1, minWidth: "8rem" }} />
            <button type="submit" className="crud__action" disabled={saving}>{saving ? "..." : "+ Crear"}</button>
          </CrudDual.FormCard>

          <DataTable
            columns={volumeColumns}
            data={vd.filter((d) => !search || prodName(d.product_id ?? 0).toLowerCase().includes(search.toLowerCase()) || d.discount_percent.includes(search) || d.description?.includes(search))}
            keyExtractor={(d: any) => d.id}
            loading={loading}
            emptyMessage="Sin descuentos por volumen"
          />
        </>
      )}
    </CrudDual>
  );
}

export default AdminDiscounts;
