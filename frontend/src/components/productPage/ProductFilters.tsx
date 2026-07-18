import { useState, useMemo, type ReactNode } from "react";
import type { CategoryTreeNode } from "@/api/categories";
import "./styles/ProductFilters.scss";

/* ── Types ─────────────────────────────────────────── */

export type SortOption =
  | "featured"
  | "price-asc"
  | "price-desc"
  | "newest"
  | "bestselling";

export type FiltersState = {
  category: string;
  subcategory: string;
  tags: string[];
  search: string;
  sort: SortOption;
  maxPrice: number;
};

export type ProductFiltersProps = {
  categoryTree: CategoryTreeNode[];
  availableTags?: { slug: string; name: string }[];
  filters: FiltersState;
  onChange: (filters: FiltersState) => void;
  visibleCount: number;
  totalCount: number;
  categoryName?: string;
  children?: ReactNode;
};

/* ── Color swatches ── */
const COLOR_SWATCHES = [
  { hex: "#E8607A", name: "Rosa" },
  { hex: "#C83060", name: "Berry" },
  { hex: "#FAD4DA", name: "Blush" },
  { hex: "#F5A8B4", name: "Pétalo" },
  { hex: "#A02050", name: "Vino" },
  { hex: "#FEF0F2", name: "Nude" },
  { hex: "#18151A", name: "Negro" },
];

/* ── Sort labels ── */
const SORT_LABELS: Record<SortOption, string> = {
  featured: "Destacados",
  "price-asc": "Precio: menor a mayor",
  "price-desc": "Precio: mayor a menor",
  newest: "Más recientes",
  bestselling: "Más vendidos",
};

/* ── Collapsible section ── */
function FilterSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="filter-section">
      <div className="filter-title" onClick={() => setOpen(!open)}>
        {title}
        <span className={`filter-title-arrow${open ? " open" : ""}`}>▲</span>
      </div>
      {open && children}
    </div>
  );
}

/* ── Component ─────────────────────────────────────── */

function ProductFilters({
  categoryTree,
  availableTags = [],
  filters,
  onChange,
  visibleCount,
  totalCount,
  children,
}: ProductFiltersProps) {
  const [selectedColors, setSelectedColors] = useState<Set<string>>(new Set());

  const setFilter = <K extends keyof FiltersState>(
    key: K,
    value: FiltersState[K],
  ) => {
    onChange({ ...filters, [key]: value });
  };

  const toggleTag = (slug: string) => {
    const next = filters.tags.includes(slug)
      ? filters.tags.filter((t) => t !== slug)
      : [...filters.tags, slug];
    setFilter("tags", next);
  };

  const clearAll = () => {
    onChange({
      category: "",
      subcategory: "",
      tags: [],
      search: "",
      sort: "featured",
      maxPrice: 120,
    });
    setSelectedColors(new Set());
  };

  const currentSubcategories = useMemo(() => {
    if (!filters.category) return [];
    const findNode = (nodes: CategoryTreeNode[]): CategoryTreeNode | null => {
      for (const n of nodes) {
        if (n.slug === filters.category) return n;
        const found = findNode(n.children);
        if (found) return found;
      }
      return null;
    };
    const node = findNode(categoryTree);
    return node?.children ?? [];
  }, [filters.category, categoryTree]);

  const hasActiveFilters =
    filters.category !== "" ||
    filters.subcategory !== "" ||
    filters.tags.length > 0 ||
    filters.search !== "" ||
    filters.maxPrice < 120 ||
    selectedColors.size > 0;

  return (
    <>
      {/* ── Search bar ── */}
      <div className="search-wrap">
        <div className="search-box">
          <span className="search-icon">⌕</span>
          <input
            type="text"
            placeholder="Buscá productos, marcas…"
            value={filters.search}
            onChange={(e) => setFilter("search", e.target.value)}
          />
        </div>
        <select
          className="sort-select"
          value={filters.sort}
          onChange={(e) => setFilter("sort", e.target.value as SortOption)}
        >
          {Object.entries(SORT_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <span className="results-label">
          Mostrando {visibleCount} de {totalCount}
        </span>
      </div>

      {/* ── Sidebar ── */}
      <div className="shop-layout">
        <aside className="sidebar">
          <FilterSection title="Categoría" defaultOpen={true}>
            <div className="filter-options">
              <button
                className={`filter-option${!filters.category ? " active" : ""}`}
                onClick={() => {
                  setFilter("category", "");
                  setFilter("subcategory", "");
                }}
              >
                <span className="filter-dot" /> Todo
              </button>
              {categoryTree.map((cat) => (
                <button
                  key={cat.id}
                  className={`filter-option${filters.category === cat.slug ? " active" : ""}`}
                  onClick={() => {
                    setFilter("category", cat.slug);
                    setFilter("subcategory", "");
                  }}
                >
                  <span className="filter-dot" /> {cat.name}
                </button>
              ))}
            </div>
          </FilterSection>

          {currentSubcategories.length > 0 && (
            <FilterSection title="Subcategoría" defaultOpen={true}>
              <div className="filter-options">
                <button
                  className={`filter-option${!filters.subcategory ? " active" : ""}`}
                  onClick={() => setFilter("subcategory", "")}
                >
                  <span className="filter-dot" /> Todas
                </button>
                {currentSubcategories.map((sub) => (
                  <button
                    key={sub.id}
                    className={`filter-option${filters.subcategory === sub.slug ? " active" : ""}`}
                    onClick={() => setFilter("subcategory", sub.slug)}
                  >
                    <span className="filter-dot" /> {sub.name}
                  </button>
                ))}
              </div>
            </FilterSection>
          )}

          {availableTags.length > 0 && (
            <FilterSection title="Etiquetas" defaultOpen={true}>
              <div className="filter-options">
                {availableTags.map((tag) => (
                  <button
                    key={tag.slug}
                    className={`filter-option${filters.tags.includes(tag.slug) ? " active" : ""}`}
                    onClick={() => toggleTag(tag.slug)}
                  >
                    <span className="filter-dot" /> {tag.name}
                  </button>
                ))}
              </div>
            </FilterSection>
          )}

          <FilterSection title="Color" defaultOpen={true}>
            <div className="color-swatches">
              {COLOR_SWATCHES.map((c) => (
                <div
                  key={c.hex}
                  className={`color-swatch${selectedColors.has(c.hex) ? " active" : ""}`}
                  style={{ background: c.hex }}
                  title={c.name}
                  onClick={() => {
                    const next = new Set(selectedColors);
                    if (next.has(c.hex)) next.delete(c.hex);
                    else next.add(c.hex);
                    setSelectedColors(next);
                  }}
                />
              ))}
            </div>
          </FilterSection>

          <FilterSection title="Precio" defaultOpen={true}>
            <div className="price-range">
              <div className="price-labels">
                <span>$0</span>
                <span>$120</span>
              </div>
              <input
                type="range"
                min="0"
                max="120"
                value={filters.maxPrice}
                onChange={(e) => setFilter("maxPrice", Number(e.target.value))}
              />
              <p className="price-label">
                Hasta <span>${filters.maxPrice}</span>
              </p>
            </div>
          </FilterSection>

          {hasActiveFilters && (
            <button className="clear-filters" onClick={clearAll}>
              ✕ &nbsp;Limpiar filtros
            </button>
          )}
        </aside>
          {children}
        </div>
    </>
  );
}

export default ProductFilters;
