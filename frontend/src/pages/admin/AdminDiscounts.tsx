import { useEffect, useState } from "react";
import client from "@/api/client";
import CrudDual from "@/components/admin/CrudDual";
import DataTable from "@/components/admin/DataTable";
import type { Column } from "@/components/admin/DataTable";
import "@/pages/admin/AdminDiscounts.scss";

type ProdDiscount = { id: number; product_id: number; discount_percent: string; active: boolean; starts_at: string | null; ends_at: string | null; discount_set_id: string | null };
type VolDiscount = { id: number; product_id: number | null; min_quantity: number; discount_percent: string; description: string | null; starts_at: string | null; ends_at: string | null; active: boolean | null; discount_set_id: string | null };
type Coupon = { id: number; code: string; discount_type: string; discount_value: string; min_purchase: string | null; max_uses: number | null; current_uses: number | null; starts_at: string | null; ends_at: string | null; active: boolean | null; discount_set_id: string | null };
type Product = { id: number; name: string; barcode: string | null };
type DiscountSet = { id: string; name: string; slug: string };

function AdminDiscounts() {
  const [tab, setTab] = useState<"product" | "volume" | "coupon">("product");
  const [pd, setPd] = useState<ProdDiscount[]>([]);
  const [vd, setVd] = useState<VolDiscount[]>([]);
  const [cd, setCd] = useState<Coupon[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [discountSets, setDiscountSets] = useState<DiscountSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Product discount form
  const [formProductId, setFormProductId] = useState("");
  const [formPercent, setFormPercent] = useState("");
  const [formActive, setFormActive] = useState("true");
  const [formStart, setFormStart] = useState("");
  const [formEnd, setFormEnd] = useState("");
  const [formProdDs, setFormProdDs] = useState("");

  // Volume discount form
  const [formMinQty, setFormMinQty] = useState("5");
  const [formDesc, setFormDesc] = useState("");
  const [formVolDs, setFormVolDs] = useState("");

  // Coupon form
  const [formCode, setFormCode] = useState("");
  const [formDiscType, setFormDiscType] = useState("percentage");
  const [formDiscVal, setFormDiscVal] = useState("");
  const [formMinPurchase, setFormMinPurchase] = useState("");
  const [formMaxUses, setFormMaxUses] = useState("");
  const [formCoupStart, setFormCoupStart] = useState("");
  const [formCoupEnd, setFormCoupEnd] = useState("");
  const [formCoupActive, setFormCoupActive] = useState("true");
  const [formCoupDs, setFormCoupDs] = useState("");

  const fetch = async () => {
    setLoading(true);
    try {
      const [pr, vr, cr, prods, ds] = await Promise.all([
        client.get("/product-discounts"), client.get("/volume-discounts"), client.get("/coupons"),
        client.get("/products?limit=500"), client.get("/discount-sets"),
      ]);
      setPd(pr.data.data ?? []);
      setVd(vr.data.data ?? []);
      setCd(cr.data.data ?? []);
      setProducts(prods.data.data ?? []);
      setDiscountSets(ds.data.data ?? []);
    } catch { setError("Error al cargar"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);
  useEffect(() => { resetForm(); }, [tab]);

  const resetForm = () => {
    setFormProductId(""); setFormPercent(""); setFormActive("true");
    setFormStart(""); setFormEnd(""); setFormProdDs("");
    setFormMinQty("5"); setFormDesc(""); setFormVolDs("");
    setFormCode(""); setFormDiscType("percentage"); setFormDiscVal("");
    setFormMinPurchase(""); setFormMaxUses("");
    setFormCoupStart(""); setFormCoupEnd(""); setFormCoupActive("true"); setFormCoupDs("");
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
          discount_set_id: formProdDs || null,
        });
      } else if (tab === "volume") {
        await client.post("/volume-discounts", {
          product_id: formProductId ? Number(formProductId) : null,
          min_quantity: Number(formMinQty), discount_percent: formPercent,
          description: formDesc || null,
          starts_at: formStart ? new Date(formStart).toISOString() : null,
          ends_at: formEnd ? new Date(formEnd).toISOString() : null,
          active: formActive === "true",
          discount_set_id: formVolDs || null,
        });
      } else {
        await client.post("/coupons", {
          code: formCode,
          discount_type: formDiscType,
          discount_value: formDiscVal,
          min_purchase: formMinPurchase || null,
          max_uses: formMaxUses ? Number(formMaxUses) : null,
          starts_at: formCoupStart ? new Date(formCoupStart).toISOString() : null,
          ends_at: formCoupEnd ? new Date(formCoupEnd).toISOString() : null,
          active: formCoupActive === "true",
          discount_set_id: formCoupDs || null,
        });
      }
      resetForm(); fetch();
    } catch (err: unknown) { setError((err as any)?.response?.data?.message ?? "Error"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (type: "product" | "volume" | "coupon", id: number) => {
    if (!confirm("¿Eliminar?")) return;
    try {
      const path = type === "product" ? "product-discounts" : type === "volume" ? "volume-discounts" : "coupons";
      await client.delete(`/${path}/${id}`);
      fetch();
    } catch { setError("Error al eliminar"); }
  };

  const prodName = (id: number) => products.find((p) => p.id === id)?.name ?? `#${id}`;
  const dsName = (id: string | null) => id ? discountSets.find((d) => d.id === id)?.name ?? "—" : "—";

  const dsSelect = (value: string, onChange: (v: string) => void) => (
    <select className="field-input" value={value} onChange={(e) => onChange(e.target.value)} style={{ flex: 1, minWidth: "8rem" }}>
      <option value="">Sin conjunto</option>
      {discountSets.map((ds) => <option key={ds.id} value={ds.id}>{ds.name}</option>)}
    </select>
  );

  // ── Product discount columns ──
  const productColumns: Column<ProdDiscount>[] = [
    { header: "ID", render: (d) => d.id },
    { header: "Producto", render: (d) => prodName(d.product_id) },
    { header: "%", render: (d) => `${d.discount_percent}%` },
    { header: "Activo", render: (d) => d.active ? "Sí" : "No", hideOnMobile: true },
    { header: "Vigencia", render: (d) => d.starts_at ? `${new Date(d.starts_at).toLocaleDateString()} - ${d.ends_at ? new Date(d.ends_at).toLocaleDateString() : "∞"}` : "Siempre", hideOnMobile: true },
    { header: "Conjunto", render: (d) => dsName(d.discount_set_id), hideOnMobile: true },
    { header: "Acción", render: (d) => <button className="btn-danger" onClick={() => handleDelete("product", d.id)}>Eliminar</button> },
  ];

  // ── Volume discount columns ──
  const volumeColumns: Column<VolDiscount>[] = [
    { header: "ID", render: (d) => d.id },
    { header: "Producto", render: (d) => d.product_id ? prodName(d.product_id) : "Todos" },
    { header: "Mín", render: (d) => d.min_quantity },
    { header: "%", render: (d) => `${d.discount_percent}%` },
    { header: "Descripción", render: (d) => d.description ?? "—", hideOnMobile: true },
    { header: "Vigencia", render: (d) => {
      if (!d.starts_at && !d.ends_at) return "Siempre";
      return `${d.starts_at ? new Date(d.starts_at).toLocaleDateString() : "—"} - ${d.ends_at ? new Date(d.ends_at).toLocaleDateString() : "∞"}`;
    }, hideOnMobile: true },
    { header: "Conjunto", render: (d) => dsName(d.discount_set_id), hideOnMobile: true },
    { header: "Acción", render: (d) => <button className="btn-danger" onClick={() => handleDelete("volume", d.id)}>Eliminar</button> },
  ];

  // ── Coupon columns ──
  const couponColumns: Column<Coupon>[] = [
    { header: "ID", render: (d) => d.id },
    { header: "Código", render: (d) => d.code },
    { header: "Tipo", render: (d) => d.discount_type === "percentage" ? "%" : "Fijo", hideOnMobile: true },
    { header: "Valor", render: (d) => d.discount_type === "percentage" ? `${d.discount_value}%` : `$${d.discount_value}` },
    { header: "Usos", render: (d) => d.max_uses ? `${d.current_uses ?? 0}/${d.max_uses}` : "∞", hideOnMobile: true },
    { header: "Vigencia", render: (d) => {
      if (!d.starts_at && !d.ends_at) return "Siempre";
      return `${d.starts_at ? new Date(d.starts_at).toLocaleDateString() : "—"} - ${d.ends_at ? new Date(d.ends_at).toLocaleDateString() : "∞"}`;
    }, hideOnMobile: true },
    { header: "Activo", render: (d) => d.active ? "Sí" : "No", hideOnMobile: true },
    { header: "Conjunto", render: (d) => dsName(d.discount_set_id), hideOnMobile: true },
    { header: "Acción", render: (d) => <button className="btn-danger" onClick={() => handleDelete("coupon", d.id)}>Eliminar</button> },
  ];

  return (
    <CrudDual
      title="Descuentos"
      search={{ placeholder: "Buscar...", value: search, onChange: setSearch }}
      tabs={[
        { key: "product", label: "Por producto", active: tab === "product", onClick: () => setTab("product") },
        { key: "volume", label: "Por volumen", active: tab === "volume", onClick: () => setTab("volume") },
        { key: "coupon", label: "Cupones", active: tab === "coupon", onClick: () => setTab("coupon") },
      ]}
      error={error}
    >
      {/* ── Product Discounts ── */}
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
            {dsSelect(formProdDs, setFormProdDs)}
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

      {/* ── Volume Discounts ── */}
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
            <select className="field-input" value={formActive} onChange={(e) => setFormActive(e.target.value)} style={{ flex: 1, minWidth: "8rem" }}>
              <option value="true">Activo</option><option value="false">Inactivo</option>
            </select>
            <input className="field-input" type="date" value={formStart} onChange={(e) => setFormStart(e.target.value)} style={{ flex: 1, minWidth: "8rem" }} />
            <input className="field-input" type="date" value={formEnd} onChange={(e) => setFormEnd(e.target.value)} style={{ flex: 1, minWidth: "8rem" }} />
            {dsSelect(formVolDs, setFormVolDs)}
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

      {/* ── Coupons ── */}
      {tab === "coupon" && (
        <>
          <CrudDual.FormCard title="Nuevo cupón" onSubmit={handleCreate} saving={saving}>
            <input className="field-input" type="text" placeholder="Código *" value={formCode} onChange={(e) => setFormCode(e.target.value.toUpperCase())} required style={{ flex: 1, minWidth: "8rem" }} />
            <select className="field-input" value={formDiscType} onChange={(e) => setFormDiscType(e.target.value)} style={{ flex: 1, minWidth: "8rem" }}>
              <option value="percentage">Porcentaje</option><option value="fixed">Monto fijo</option>
            </select>
            <input className="field-input" type="number" step="0.01" placeholder={formDiscType === "percentage" ? "% descuento *" : "Monto *"} value={formDiscVal} onChange={(e) => setFormDiscVal(e.target.value)} required style={{ flex: 1, minWidth: "8rem" }} />
            <input className="field-input" type="number" step="0.01" placeholder="Compra mín." value={formMinPurchase} onChange={(e) => setFormMinPurchase(e.target.value)} style={{ flex: 1, minWidth: "8rem" }} />
            <input className="field-input" type="number" placeholder="Usos máx." value={formMaxUses} onChange={(e) => setFormMaxUses(e.target.value)} style={{ flex: 1, minWidth: "8rem" }} />
            <select className="field-input" value={formCoupActive} onChange={(e) => setFormCoupActive(e.target.value)} style={{ flex: 1, minWidth: "8rem" }}>
              <option value="true">Activo</option><option value="false">Inactivo</option>
            </select>
            <input className="field-input" type="date" value={formCoupStart} onChange={(e) => setFormCoupStart(e.target.value)} style={{ flex: 1, minWidth: "8rem" }} />
            <input className="field-input" type="date" value={formCoupEnd} onChange={(e) => setFormCoupEnd(e.target.value)} style={{ flex: 1, minWidth: "8rem" }} />
            {dsSelect(formCoupDs, setFormCoupDs)}
            <button type="submit" className="crud__action" disabled={saving}>{saving ? "..." : "+ Crear"}</button>
          </CrudDual.FormCard>

          <DataTable
            columns={couponColumns}
            data={cd.filter((d) => !search || d.code.toLowerCase().includes(search.toLowerCase()) || d.discount_value.includes(search))}
            keyExtractor={(d: any) => d.id}
            loading={loading}
            emptyMessage="Sin cupones"
          />
        </>
      )}
    </CrudDual>
  );
}

export default AdminDiscounts;
