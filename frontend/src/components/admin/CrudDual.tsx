import type { ReactNode } from "react";
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

export default CrudDual;
