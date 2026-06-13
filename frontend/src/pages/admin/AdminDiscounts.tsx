import { useEffect, useState } from "react";
import client from "@/api/client";
import CrudPage from "@/components/admin/CrudPage";
import DataTable from "@/components/admin/DataTable";
import type { Column } from "@/components/admin/DataTable";
import "@/pages/admin/AdminDiscounts.scss";

type ProdDiscount = { id: number; product_id: number; discount_percent: string; active: boolean; starts_at: string | null; ends_at: string | null };
type VolDiscount = { id: number; product_id: number | null; min_quantity: number; discount_percent: string; description: string | null };

function AdminDiscounts() {
  const [tab, setTab] = useState<"product" | "volume">("product");
  const [pd, setPd] = useState<ProdDiscount[]>([]);
  const [vd, setVd] = useState<VolDiscount[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      const [pr, vr] = await Promise.all([
        client.get("/product-discounts"),
        client.get("/volume-discounts"),
      ]);
      setPd(pr.data.data ?? []);
      setVd(vr.data.data ?? []);
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



  const productColumns: Column<ProdDiscount>[] = [
    { header: "ID", render: (d) => d.id },
    { header: "Producto", render: (d) => `#${d.product_id}` },
    { header: "%", render: (d) => `${d.discount_percent}%` },
    { header: "Activo", render: (d) => d.active ? "Sí" : "No", hideOnMobile: true },
    { header: "Vigencia", render: (d) => d.starts_at ? `${new Date(d.starts_at).toLocaleDateString()} - ${d.ends_at ? new Date(d.ends_at).toLocaleDateString() : "∞"}` : "Siempre", hideOnMobile: true },
    { header: "Acción", render: (d) => <button className="btn-danger" onClick={() => handleDelete("product", d.id)}>Eliminar</button> },
  ];

  const volumeColumns: Column<VolDiscount>[] = [
    { header: "ID", render: (d) => d.id },
    { header: "Producto", render: (d) => d.product_id ? `#${d.product_id}` : "Todos" },
    { header: "Mín", render: (d) => d.min_quantity },
    { header: "%", render: (d) => `${d.discount_percent}%` },
    { header: "Descripción", render: (d) => d.description ?? "—", hideOnMobile: true },
    { header: "Acción", render: (d) => <button className="btn-danger" onClick={() => handleDelete("volume", d.id)}>Eliminar</button> },
  ];

  return (
    <CrudPage
      title="Descuentos"
      tabs={[
        { key: "product", label: "Por producto", active: tab === "product", onClick: () => setTab("product") },
        { key: "volume", label: "Por volumen", active: tab === "volume", onClick: () => setTab("volume") },
      ]}
      form={
        <>{tab === "product" ? (
          <>
            <input className="field-input" type="number" placeholder="Producto ID *" value={formProductId} onChange={(e) => setFormProductId(e.target.value)} required style={{ flex: 1, minWidth: "8rem" }} />
            <input className="field-input" type="number" step="0.01" placeholder="% descuento *" value={formPercent} onChange={(e) => setFormPercent(e.target.value)} required style={{ flex: 1, minWidth: "8rem" }} />
            <select className="field-input" value={formActive} onChange={(e) => setFormActive(e.target.value)} style={{ flex: 1, minWidth: "8rem" }}>
              <option value="true">Activo</option><option value="false">Inactivo</option>
            </select>
            <input className="field-input" type="date" value={formStart} onChange={(e) => setFormStart(e.target.value)} style={{ flex: 1, minWidth: "8rem" }} />
            <input className="field-input" type="date" value={formEnd} onChange={(e) => setFormEnd(e.target.value)} style={{ flex: 1, minWidth: "8rem" }} />
          </>
        ) : (
          <>
            <input className="field-input" type="number" placeholder="Producto ID (opcional)" value={formProductId} onChange={(e) => setFormProductId(e.target.value)} style={{ flex: 1, minWidth: "8rem" }} />
            <input className="field-input" type="number" placeholder="Cantidad mínima *" value={formMinQty} onChange={(e) => setFormMinQty(e.target.value)} required style={{ flex: 1, minWidth: "8rem" }} />
            <input className="field-input" type="number" step="0.01" placeholder="% descuento *" value={formPercent} onChange={(e) => setFormPercent(e.target.value)} required style={{ flex: 1, minWidth: "8rem" }} />
            <input className="field-input" type="text" placeholder="Descripción" value={formDesc} onChange={(e) => setFormDesc(e.target.value)} style={{ flex: 1, minWidth: "8rem" }} />
          </>
        )}
          <button className="crud__action" type="submit" disabled={saving}>{saving ? "..." : "+ Crear"}</button>
        </>
      }
    >
      {error && <p className="error-msg">{error}</p>}

      <DataTable
        columns={tab === "product" ? productColumns : volumeColumns}
        data={tab === "product" ? pd : vd}
        keyExtractor={(item: any) => item.id}
        loading={loading}
        emptyMessage={tab === "product" ? "Sin descuentos" : "Sin descuentos por volumen"}
      />
    </CrudPage>
  );
}

export default AdminDiscounts;
