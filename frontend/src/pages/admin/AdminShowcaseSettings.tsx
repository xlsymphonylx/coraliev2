import { useEffect, useState } from "react";
import client from "@/api/client";
import CrudPage from "@/components/admin/CrudPage";
import AdminForm from "@/components/admin/AdminForm";

type ShowcaseSettings = {
  id: number;
  discount: string;
  title: string;
  subtitle: string;
  button_text: string;
  button_link: string;
  example_image_1: string;
  example_image_2: string;
  product_image: string;
  product_category: string;
  product_category_link: string;
  product_title: string;
  product_price: string;
};

const initial: ShowcaseSettings = {
  id: 1,
  discount: "2% OFF",
  title: "Labios atrevidos, atrevida tú",
  subtitle: "¡Descubre nuestra nueva colección de delineador labiales con un 2% de descuento!",
  button_text: "Compra Ahora",
  button_link: "https://coraliegtm.com/products/rhode-peptide-lip-shape",
  example_image_1: "/showcase-example-1.jpg",
  example_image_2: "/showcase-example-2.png",
  product_image: "/showcase-product.jpg",
  product_category: "Skin Care",
  product_category_link: "https://coraliegtm.com/collections/skincare",
  product_title: "ANUA Heartleaf Pore Control Cleansing Oil",
  product_price: "Q250.00",
};

function AdminShowcaseSettings() {
  const [settings, setSettings] = useState<ShowcaseSettings>(initial);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const { data } = await client.get("/showcase-settings");
        const s = data.data as ShowcaseSettings;
        setSettings(s);
      } catch {
        setError("Error al cargar configuración");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const update = (k: keyof ShowcaseSettings, v: string) =>
    setSettings((prev) => ({ ...prev, [k]: v }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const { data } = await client.put("/showcase-settings", {
        discount: settings.discount.trim() || undefined,
        title: settings.title.trim() || undefined,
        subtitle: settings.subtitle.trim() || undefined,
        button_text: settings.button_text.trim() || undefined,
        button_link: settings.button_link.trim() || undefined,
        example_image_1: settings.example_image_1.trim() || undefined,
        example_image_2: settings.example_image_2.trim() || undefined,
        product_image: settings.product_image.trim() || undefined,
        product_category: settings.product_category.trim() || undefined,
        product_category_link: settings.product_category_link.trim() || undefined,
        product_title: settings.product_title.trim() || undefined,
        product_price: settings.product_price.trim() || undefined,
      });
      const s = data.data as ShowcaseSettings;
      setSettings(s);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      setError((err as any)?.response?.data?.message ?? "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <CrudPage title="Configuración de Vitrina">
        <p className="status-msg">Cargando...</p>
      </CrudPage>
    );
  }

  return (
    <CrudPage title="Configuración de Vitrina">
      {error && <p className="error-msg">{error}</p>}
      {saved && (
        <p className="status-msg" style={{ color: "var(--coralie-hot)", fontWeight: 600 }}>
          ¡Guardado correctamente!
        </p>
      )}

      <AdminForm title="Bloque promocional" onSubmit={handleSave}>
        <AdminForm.Field label="Descuento">
          <input className="input" value={settings.discount} onChange={(e) => update("discount", e.target.value)} placeholder="2% OFF" />
        </AdminForm.Field>
        <AdminForm.Field label="Título">
          <input className="input" value={settings.title} onChange={(e) => update("title", e.target.value)} placeholder="Labios atrevidos, atrevida tú" />
        </AdminForm.Field>
        <AdminForm.Field label="Subtítulo">
          <input className="input" value={settings.subtitle} onChange={(e) => update("subtitle", e.target.value)} placeholder="Descripción promocional" />
        </AdminForm.Field>
        <AdminForm.Field label="Texto del botón">
          <input className="input" value={settings.button_text} onChange={(e) => update("button_text", e.target.value)} placeholder="Compra Ahora" />
        </AdminForm.Field>
        <AdminForm.Field label="Enlace del botón">
          <input className="input" value={settings.button_link} onChange={(e) => update("button_link", e.target.value)} placeholder="https://..." />
        </AdminForm.Field>

        <AdminForm.Actions saving={saving} saveLabel="Guardar cambios" savingLabel="Guardando..." />
      </AdminForm>

      <AdminForm title="Imágenes de ejemplo" onSubmit={handleSave}>
        <AdminForm.Field label="Imagen ejemplo 1">
          <input className="input" value={settings.example_image_1} onChange={(e) => update("example_image_1", e.target.value)} placeholder="/showcase-example-1.jpg" />
        </AdminForm.Field>
        <AdminForm.Field label="Imagen ejemplo 2">
          <input className="input" value={settings.example_image_2} onChange={(e) => update("example_image_2", e.target.value)} placeholder="/showcase-example-2.png" />
        </AdminForm.Field>

        <AdminForm.Actions saving={saving} saveLabel="Guardar cambios" savingLabel="Guardando..." />
      </AdminForm>

      <AdminForm title="Producto destacado" onSubmit={handleSave}>
        <AdminForm.Field label="Imagen del producto">
          <input className="input" value={settings.product_image} onChange={(e) => update("product_image", e.target.value)} placeholder="/showcase-product.jpg" />
        </AdminForm.Field>
        <AdminForm.Field label="Categoría">
          <input className="input" value={settings.product_category} onChange={(e) => update("product_category", e.target.value)} placeholder="Skin Care" />
        </AdminForm.Field>
        <AdminForm.Field label="Enlace de categoría">
          <input className="input" value={settings.product_category_link} onChange={(e) => update("product_category_link", e.target.value)} placeholder="https://..." />
        </AdminForm.Field>
        <AdminForm.Field label="Título del producto">
          <input className="input" value={settings.product_title} onChange={(e) => update("product_title", e.target.value)} placeholder="Nombre del producto" />
        </AdminForm.Field>
        <AdminForm.Field label="Precio">
          <input className="input" value={settings.product_price} onChange={(e) => update("product_price", e.target.value)} placeholder="Q250.00" />
        </AdminForm.Field>

        <AdminForm.Actions saving={saving} saveLabel="Guardar cambios" savingLabel="Guardando..." />
      </AdminForm>
    </CrudPage>
  );
}

export default AdminShowcaseSettings;
