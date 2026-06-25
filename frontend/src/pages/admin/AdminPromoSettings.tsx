import { useEffect, useState } from "react";
import client from "@/api/client";
import CrudPage from "@/components/admin/CrudPage";
import AdminForm from "@/components/admin/AdminForm";

const CORALIE_COLORS = [
  { name: "white", hex: "#fefcfb" },
  { name: "petal", hex: "#fef0f2" },
  { name: "blush", hex: "#fad4da" },
  { name: "rose", hex: "#f5a8b4" },
  { name: "hot", hex: "#e8607a" },
  { name: "spicy", hex: "#f5298c" },
  { name: "dark", hex: "#18151a" },
  { name: "mid", hex: "#6a5a62" },
  { name: "light", hex: "#c4b0b8" },
] as const;

type ColorSwatchesProps = {
  current: string;
  onChange: (hex: string) => void;
};

function ColorSwatches({ current, onChange }: ColorSwatchesProps) {
  return (
    <>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
        {CORALIE_COLORS.map((c) => (
          <button
            key={c.hex}
            type="button"
            onClick={() => onChange(c.hex)}
            title={`coralie-${c.name} — ${c.hex}`}
            style={{
              width: "2.25rem",
              height: "2.25rem",
              borderRadius: "var(--radius)",
              border: current === c.hex
                ? "3px solid var(--coralie-dark)"
                : "2px solid var(--coralie-light)",
              backgroundColor: c.hex,
              cursor: "pointer",
              outline: current === c.hex
                ? "2px solid var(--coralie-hot)"
                : "none",
              outlineOffset: "2px",
              transition: "outline 0.15s",
            }}
          />
        ))}
      </div>
      <span style={{ fontFamily: "var(--mono)", fontSize: "0.8rem", color: "var(--coralie-mid)", marginTop: "0.25rem", display: "block" }}>
        {current}
      </span>
    </>
  );
}

type PromoSettings = {
  id: number;
  title: string;
  subtitle: string;
  background_color: string;
  title_color: string;
  subtitle_color: string;
  image: string;
};

function AdminPromoSettings() {
  const [settings, setSettings] = useState<PromoSettings | null>(null);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [bgColor, setBgColor] = useState("");
  const [titleColor, setTitleColor] = useState("");
  const [subtitleColor, setSubtitleColor] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const fetch = async () => {
    setLoading(true);
    try {
      const { data } = await client.get("/promo-settings");
      const s = data.data as PromoSettings;
      setSettings(s);
      setTitle(s.title);
      setSubtitle(s.subtitle);
      setBgColor(s.background_color);
      setTitleColor(s.title_color);
      setSubtitleColor(s.subtitle_color);
      setImage(s.image);
    } catch {
      setError("Error al cargar configuración");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const { data } = await client.put("/promo-settings", {
        title: title.trim() || undefined,
        subtitle: subtitle.trim() || undefined,
        background_color: bgColor.trim() || undefined,
        title_color: titleColor.trim() || undefined,
        subtitle_color: subtitleColor.trim() || undefined,
        image: image.trim() || undefined,
      });
      const s = data.data as PromoSettings;
      setSettings(s);
      setTitle(s.title);
      setSubtitle(s.subtitle);
      setBgColor(s.background_color);
      setTitleColor(s.title_color);
      setSubtitleColor(s.subtitle_color);
      setImage(s.image);
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
      <CrudPage title="Configuración de Promo">
        <p className="status-msg">Cargando...</p>
      </CrudPage>
    );
  }

  return (
    <CrudPage title="Configuración de Promo">
      {error && <p className="error-msg">{error}</p>}
      {saved && <p className="status-msg" style={{ color: "var(--coralie-hot)", fontWeight: 600 }}>¡Guardado correctamente!</p>}

      <AdminForm title="" onSubmit={handleSave}>
        <AdminForm.Field label="Título">
          <input
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título principal"
          />
        </AdminForm.Field>

        <AdminForm.Field label="Subtítulo">
          <input
            className="input"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="Subtítulo"
          />
        </AdminForm.Field>

        <AdminForm.Field label="Color de fondo">
          <ColorSwatches current={bgColor} onChange={setBgColor} />
        </AdminForm.Field>

        <AdminForm.Field label="Color del título">
          <ColorSwatches current={titleColor} onChange={setTitleColor} />
        </AdminForm.Field>

        <AdminForm.Field label="Color del subtítulo">
          <ColorSwatches current={subtitleColor} onChange={setSubtitleColor} />
        </AdminForm.Field>

        <AdminForm.Field label="Ruta de imagen">
          <input
            className="input"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="/banner.webp"
          />
        </AdminForm.Field>

        <AdminForm.Actions saving={saving} saveLabel="Guardar cambios" savingLabel="Guardando..." />
      </AdminForm>

      <div style={{ marginTop: "2rem" }}>
        <h3 style={{ fontFamily: "var(--coralie-contrast-font)", fontSize: "1rem", fontWeight: 700, color: "var(--coralie-dark)", margin: "0 0 0.75rem" }}>
          Vista previa
        </h3>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "2rem",
            padding: "2rem",
            borderRadius: "var(--radius)",
            backgroundColor: bgColor || "var(--coralie-blush)",
          }}
        >
          <div style={{ flex: 1 }}>
            <h4
              style={{
                fontFamily: "var(--coralie-contrast-font)",
                fontSize: "2.5rem",
                fontWeight: 700,
                color: titleColor || "var(--coralie-dark)",
                margin: "0 0 0.5rem",
              }}
            >
              {title || "Título"}
            </h4>
            <p
              style={{
                fontFamily: "var(--coralie-main-font)",
                fontSize: "1.125rem",
                fontWeight: 400,
                color: subtitleColor || "var(--coralie-mid)",
                margin: 0,
              }}
            >
              {subtitle || "Subtítulo"}
            </p>
          </div>
          <div style={{ maxWidth: "500px", flexShrink: 0, width: "100%" }}>
            <img
              src={image || "/banner.webp"}
              alt="Preview"
              style={{ display: "block", width: "100%", height: "auto" }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          </div>
        </div>
      </div>
    </CrudPage>
  );
}

export default AdminPromoSettings;
