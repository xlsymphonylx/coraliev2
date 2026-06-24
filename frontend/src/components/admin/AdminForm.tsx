import type { ReactNode } from "react";
import "./AdminForm.scss";
import "./AdminForm_responsive.scss";

// ─── Main component ──────────────────────────────────────

type AdminFormProps = {
  title: string;
  /** If provided, renders as a full page with header + back button.
   *  If omitted, renders as a card (inline form, no header). */
  onBack?: () => void;
  onSubmit: (e: React.FormEvent) => void;
  saving?: boolean;
  error?: string | null;
  children: ReactNode;
};

function AdminForm({ title, onBack, onSubmit, saving, error, children }: AdminFormProps) {
  return (
    <div className="admin-form">
      {onBack && (
        <div className="admin-form__header">
          <h1 className="admin-form__title">{title}</h1>
          <button className="admin-form__back" type="button" onClick={onBack}>
            Volver
          </button>
        </div>
      )}

      {error && <p className="admin-form__error">{error}</p>}

      <form className="admin-form__form" onSubmit={onSubmit}>
        {!onBack && <h3 className="admin-form__card-title">{title}</h3>}
        {children}
      </form>
    </div>
  );
}

// ─── Field ────────────────────────────────────────────────

type FieldProps = {
  label: string;
  children: ReactNode;
};

function Field({ label, children }: FieldProps) {
  return (
    <label className="admin-form__field">
      <span>{label}</span>
      {children}
    </label>
  );
}

// ─── Row ─────────────────────────────────────────────────

type RowProps = {
  children: ReactNode;
};

function Row({ children }: RowProps) {
  return <div className="admin-form__row">{children}</div>;
}

// ─── Actions ─────────────────────────────────────────────

type ActionsProps = {
  saving?: boolean;
  saveLabel?: string;
  savingLabel?: string;
  onCancel?: () => void;
};

function Actions({
  saving,
  saveLabel = "Guardar",
  savingLabel = "Guardando...",
  onCancel,
}: ActionsProps) {
  return (
    <div className="admin-form__actions">
      <button type="submit" className="admin-form__save" disabled={saving}>
        {saving ? savingLabel : saveLabel}
      </button>
      {onCancel && (
        <button type="button" className="admin-form__cancel" onClick={onCancel}>
          Cancelar
        </button>
      )}
    </div>
  );
}

// ─── Attach sub-components ──────────────────────────────

AdminForm.Field = Field;
AdminForm.Row = Row;
AdminForm.Actions = Actions;

export default AdminForm;
