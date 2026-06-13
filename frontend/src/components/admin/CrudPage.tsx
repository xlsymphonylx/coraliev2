import type { ReactNode } from "react";
import "@/components/admin/CrudPage.scss";
import "@/components/admin/CrudPage_responsive.scss";

type CrudTab = { key: string; label: string; active: boolean; onClick: () => void };

type CrudPageProps = {
  title: string;
  action?: { label: string; onClick: () => void };
  search?: { placeholder: string; value: string; onChange: (v: string) => void };
  tabs?: CrudTab[];
  form?: ReactNode;
  children: ReactNode;
};

function CrudPage({ title, action, search, tabs, form, children }: CrudPageProps) {
  return (
    <div className="crud">
      <div className="crud__header">
        <h1 className="crud__title">{title}</h1>

        {tabs && (
          <div className="crud__tabs">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                className={`crud__tab${tab.active ? " crud__tab--active" : ""}`}
                onClick={tab.onClick}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {action && (
          <button className="crud__action" onClick={action.onClick}>
            {action.label}
          </button>
        )}
      </div>

      {form && <div className="crud__form">{form}</div>}

      {search && (
        <div className="crud__toolbar">
          <input
            className="crud__search"
            type="text"
            placeholder={search.placeholder}
            value={search.value}
            onChange={(e) => search.onChange(e.target.value)}
          />
        </div>
      )}

      {children}
    </div>
  );
}

export default CrudPage;
