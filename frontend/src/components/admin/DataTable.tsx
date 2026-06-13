import type { ReactNode } from "react";
import "@/components/admin/DataTable.scss";
import "@/components/admin/DataTable_responsive.scss";

export type Column<T> = {
  header: string;
  render: (item: T) => ReactNode;
  hideOnMobile?: boolean;
  className?: string;
};

type DataTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string | number;
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
};

function DataTable<T>({
  columns,
  data,
  keyExtractor,
  loading,
  error,
  emptyMessage,
}: DataTableProps<T>) {
  if (loading) {
    return <p className="status-msg">Cargando...</p>;
  }

  if (error) {
    return <p className="error-msg">{error}</p>;
  }

  if (data.length === 0) {
    return <p className="status-msg">{emptyMessage ?? "Sin datos"}</p>;
  }

  return (
    <>
      {/* ─── Desktop table ─────────────────────────────── */}
      <div className="dt-wrap">
        <table className="dt">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.header} className={col.className}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={keyExtractor(item)}>
                {columns.map((col) => (
                  <td key={col.header} className={col.className}>
                    {col.render(item)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ─── Mobile cards ──────────────────────────────── */}
      <div className="dt-cards">
        {data.map((item) => (
          <div key={keyExtractor(item)} className="dt-card">
            {columns
              .filter((col) => !col.hideOnMobile)
              .map((col) => (
                <div key={col.header} className="dt-card__row">
                  <span className="dt-card__label">{col.header}</span>
                  <span className="dt-card__value">{col.render(item)}</span>
                </div>
              ))}
          </div>
        ))}
      </div>
    </>
  );
}

export default DataTable;
