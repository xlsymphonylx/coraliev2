import type { FormEvent, ReactNode } from "react";
import CrudPage from "./CrudPage";
import "@/components/admin/CrudDual.scss";

type DualTab = { key: string; label: string; active: boolean; onClick: () => void };

type CrudDualProps = {
  title: string;
  tabs: DualTab[];
  search?: { placeholder?: string; value: string; onChange: (v: string) => void };
  error?: string | null;
  children: ReactNode;
};

function CrudDual({ title, tabs, search, error, children }: CrudDualProps) {
  const searchProp = search
    ? { placeholder: search.placeholder || "Buscar...", value: search.value, onChange: search.onChange }
    : { placeholder: "Buscar...", value: "", onChange: () => {} };

  return (
    <CrudPage title={title} tabs={tabs} search={searchProp}>
      {error && <p className="error-msg">{error}</p>}
      {children}
    </CrudPage>
  );
}

// ─── FormCard sub-component ──────────────────────────

type FormCardProps = {
  title: string;
  onSubmit: (e: FormEvent) => void;
  saving?: boolean;
  children: ReactNode;
  onCancel?: () => void;
};

function FormCard({ title, onSubmit, saving, children, onCancel }: FormCardProps) {
  return (
    <form className="crud-dual__form" onSubmit={onSubmit}>
      <h3 className="crud-dual__form-title">{title}</h3>
      <div className="crud-dual__form-row">
        {children}
        {onCancel && (
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}

CrudDual.FormCard = FormCard;
export default CrudDual;
