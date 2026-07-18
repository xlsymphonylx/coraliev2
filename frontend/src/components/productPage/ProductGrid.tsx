import { useState, Fragment } from "react";
import ProductCard from "./ProductCard";
import type { ProductCardData } from "./ProductCard";
import "./styles/ProductGrid.scss";

/* ── Icon SVGs inline ── */

const Icon2Col = (
  <svg viewBox="0 0 14 14" fill="currentColor">
    <rect x="0" y="0" width="6" height="6" />
    <rect x="8" y="0" width="6" height="6" />
    <rect x="0" y="8" width="6" height="6" />
    <rect x="8" y="8" width="6" height="6" />
  </svg>
);

const Icon3Col = (
  <svg viewBox="0 0 14 14" fill="currentColor">
    <rect x="0" y="0" width="3.5" height="6" />
    <rect x="5.25" y="0" width="3.5" height="6" />
    <rect x="10.5" y="0" width="3.5" height="6" />
    <rect x="0" y="8" width="3.5" height="6" />
    <rect x="5.25" y="8" width="3.5" height="6" />
    <rect x="10.5" y="8" width="3.5" height="6" />
  </svg>
);

const Icon4Col = (
  <svg viewBox="0 0 16 14" fill="currentColor">
    <rect x="0" y="0" width="3" height="6" />
    <rect x="4.3" y="0" width="3" height="6" />
    <rect x="8.6" y="0" width="3" height="6" />
    <rect x="12.9" y="0" width="3" height="6" />
    <rect x="0" y="8" width="3" height="6" />
    <rect x="4.3" y="8" width="3" height="6" />
    <rect x="8.6" y="8" width="3" height="6" />
    <rect x="12.9" y="8" width="3" height="6" />
  </svg>
);

/* ── Types ─────────────────────────────────────────── */

export type ActiveFilterTag = {
  label: string;
  onRemove: () => void;
};

export type ProductGridProps = {
  products: ProductCardData[];
  editorialCards?: React.ReactNode[];
  activeFilters?: ActiveFilterTag[];
  totalCount?: number;
  onLoadMore?: () => void;
  hasMore?: boolean;
  onAddToCart: (product: ProductCardData) => void;
  onToggleWishlist?: (product: ProductCardData) => void;
  onClickProduct?: (product: ProductCardData) => void;
  wishlistedIds?: Set<number>;
};

/* ── Component ─────────────────────────────────────── */

function ProductGrid({
  products,
  editorialCards = [],
  activeFilters = [],
  totalCount,
  onLoadMore,
  hasMore = false,
  onAddToCart,
  onToggleWishlist,
  onClickProduct,
  wishlistedIds = new Set(),
}: ProductGridProps) {
  const [columns, setColumns] = useState<2 | 3 | 4>(3);

  const gridClass = [
    "product-grid",
    columns > 3 ? `product-grid--${columns}` : "",
  ]
    .filter(Boolean)
    .join(" ");

  const visibleCount = products.length;

  return (
    <>
      <div className="view-controls">
        <div className="active-filters">
          {activeFilters.map((f, i) => (
            <span key={i} className="active-filter-tag">
              {f.label}
              <button onClick={f.onRemove}>✕</button>
            </span>
          ))}
        </div>

        <div className="grid-toggle">
          <button
            className={`grid-btn${columns === 2 ? " active" : ""}`}
            title="2 columnas"
            onClick={() => setColumns(2)}
          >
            {Icon2Col}
          </button>
          <button
            className={`grid-btn${columns === 3 ? " active" : ""}`}
            title="3 columnas"
            onClick={() => setColumns(3)}
          >
            {Icon3Col}
          </button>
          <button
            className={`grid-btn${columns === 4 ? " active" : ""}`}
            title="4 columnas"
            onClick={() => setColumns(4)}
          >
            {Icon4Col}
          </button>
        </div>
      </div>

      <div className={gridClass}>
        {products.length === 0 && editorialCards.length === 0 && (
          <div className="empty-state visible">
            <h3>Sin resultados</h3>
            <p>Probá con otros filtros o buscá otro término.</p>
          </div>
        )}

        {products.map((product, index) => {
          const editorial = editorialCards[index];
          return (
            <Fragment key={product.id}>
              {editorial && editorial}
              <ProductCard
                product={product}
                isWishlisted={wishlistedIds.has(product.id)}
                onAddToCart={onAddToCart}
                onToggleWishlist={onToggleWishlist}
                onClick={onClickProduct}
              />
            </Fragment>
          );
        })}

        {editorialCards.slice(products.length).map((card, i) => (
          <Fragment key={`editorial-overflow-${i}`}>{card}</Fragment>
        ))}
      </div>

      {hasMore && (
        <div className="load-more-wrap">
          <button className="load-more" onClick={onLoadMore}>
            Cargar más productos
          </button>
          {totalCount != null && (
            <p className="load-more-count">
              Mostrando {visibleCount} de {totalCount} productos
            </p>
          )}
        </div>
      )}
    </>
  );
}

export default ProductGrid;
