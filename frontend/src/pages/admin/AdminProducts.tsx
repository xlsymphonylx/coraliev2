import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Scanner } from "@yudiel/react-qr-scanner";
import client, { setToken } from "@/api/client";
import CrudPage from "@/components/admin/CrudPage";
import AdminForm from "@/components/admin/AdminForm";
import "@/pages/admin/AdminProducts.scss";
import "@/pages/admin/AdminProducts_responsive.scss";

type Category = { id: number; name: string; slug: string };
type Product = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: string;
  product_type: string;
  barcode: string | null;
  category: Category | null;
  created_at: string;
};

type ProductForm = {
  name: string;
  slug: string;
  description: string;
  price: string;
  product_type: string;
  category_id: string;
  barcode: string;
};

const emptyForm: ProductForm = {
  name: "",
  slug: "",
  description: "",
  price: "",
  product_type: "simple",
  category_id: "",
  barcode: "",
};

function AdminProducts() {
  const [params, setParams] = useSearchParams();
  const action = params.get("action") || "list";
  const editId = params.get("id");

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [showScan, setShowScan] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await client.get("/products");
      setProducts(data.data ?? []);
    } catch {
      setError("Error al cargar productos");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await client.get("/categories");
      setCategories(data.data ?? []);
    } catch {
      /* categories optional */
    }
  };

  // Fetch the product being edited
  const fetchEditProduct = async (id: number) => {
    try {
      const { data } = await client.get(`/products/${id}`);
      const p = data.data;
      if (p) {
        setForm({
          name: p.name,
          slug: p.slug,
          description: p.description ?? "",
          price: p.price,
          product_type: p.product_type,
          category_id: p.category?.id?.toString() ?? "",
          barcode: p.barcode ?? "",
        });
      }
    } catch {
      setError("No se pudo cargar el producto");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (action === "list") {
      fetchProducts();
    } else if (action === "editar" && editId) {
      setForm(emptyForm);
      fetchEditProduct(Number(editId));
    } else {
      setForm(emptyForm);
    }
  }, [action, editId]);

  const goToList = () => setParams({});
  const goToCreate = () => setParams({ action: "crear" });
  const goToEdit = (id: number) => setParams({ action: "editar", id: String(id) });

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      ...form,
      price: Number(form.price),
      slug: form.slug || undefined,
      category_id: form.category_id ? Number(form.category_id) : null,
      barcode: form.barcode || null,
      description: form.description || null,
    };

    try {
      if (action === "crear") {
        await client.post("/products", payload);
      } else if (editId) {
        delete (payload as any).slug; // don't override slug on update
        await client.patch(`/products/${editId}`, payload);
      }
      goToList();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? "Error al guardar el producto";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar este producto?")) return;
    try {
      await client.delete(`/products/${id}`);
      fetchProducts();
    } catch {
      setError("Error al eliminar el producto");
    }
  };

  const filtered = products.filter(
    (p) =>
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode?.toLowerCase().includes(search.toLowerCase()),
  );

  if (action === "crear" || action === "editar") {
    return (
      <AdminForm
        title={action === "crear" ? "Nuevo producto" : "Editar producto"}
        onBack={goToList}
        onSubmit={handleSave}
        saving={saving}
        error={error}
      >
        <AdminForm.Field label="Nombre *">
          <input name="name" value={form.name} onChange={handleFormChange} required />
        </AdminForm.Field>

        <AdminForm.Field label="Slug">
          <input name="slug" value={form.slug} onChange={handleFormChange} placeholder="Dejar vacío para auto-generar" />
        </AdminForm.Field>

        <AdminForm.Field label="Descripción">
          <textarea name="description" value={form.description} onChange={handleFormChange} rows={3} />
        </AdminForm.Field>

        <AdminForm.Row>
          <AdminForm.Field label="Precio *">
            <input name="price" type="number" step="0.01" value={form.price} onChange={handleFormChange} required />
          </AdminForm.Field>

          <AdminForm.Field label="Tipo">
            <select name="product_type" value={form.product_type} onChange={handleFormChange}>
              <option value="simple">Simple</option>
              <option value="bundle">Bundle</option>
            </select>
          </AdminForm.Field>
        </AdminForm.Row>

        <AdminForm.Field label="Categoría">
          <select name="category_id" value={form.category_id} onChange={handleFormChange}>
            <option value="">Sin categoría</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </AdminForm.Field>

        <AdminForm.Field label="Código de barras">
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input name="barcode" value={form.barcode} onChange={handleFormChange} placeholder="Escanea o escribe el código" style={{ flex: 1 }} />
            <button type="button" className="admin-form__save" onClick={() => setShowScan(!showScan)} style={{ whiteSpace: 'nowrap', padding: '0.6rem 0.85rem', fontSize: '0.8rem' }}>
              {showScan ? "Cerrar" : "📷"}
            </button>
          </div>
        </AdminForm.Field>

        {showScan && (
          <div style={{ maxWidth: '300px', borderRadius: '8px', overflow: 'hidden', marginBottom: '0.5rem' }}>
            <Scanner
              onScan={(codes) => {
                const code = codes[0]?.rawValue;
                if (code) { setForm((f) => ({ ...f, barcode: code })); setShowScan(false); }
              }}
              onError={(e) => console.error(e)}
              formats={['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'code_93', 'codabar', 'itf']}
              allowMultiple scanDelay={1500} sound
              styles={{ container: { width: '100%', borderRadius: '8px', overflow: 'hidden' } }}
            />
          </div>
        )}

        <AdminForm.Actions saving={saving} onCancel={() => setForm(emptyForm)} />
      </AdminForm>
    );
  }

  return (
    <CrudPage
      title="Productos"
      action={{ label: "+ Nuevo", onClick: goToCreate }}
      search={{ placeholder: "Buscar por nombre o código de barras...", value: search, onChange: setSearch }}
    >
      {error && <p className="error-msg">{error}</p>}

      {loading ? (<p className="status-msg">Cargando productos...</p>
      ) : filtered.length === 0 ? (
        <p className="status-msg">{search ? "Sin resultados" : "No hay productos registrados"}</p>
      ) : (
        <div className="admin-products__table-wrap">
          <table className="admin-products__table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Código barras</th>
                <th>Precio</th>
                <th>Tipo</th>
                <th>Categoría</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.name}</td>
                  <td className="admin-products__barcode">{p.barcode ?? "—"}</td>
                  <td>Q{p.price}</td>
                  <td>{p.product_type}</td>
                  <td>{p.category?.name ?? "—"}</td>
                  <td className="cell-actions">
                    <button onClick={() => goToEdit(p.id)}>Editar</button>
                    <button onClick={() => handleDelete(p.id)} className="admin-products__delete-btn">Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </CrudPage>
  );
}

export default AdminProducts;
