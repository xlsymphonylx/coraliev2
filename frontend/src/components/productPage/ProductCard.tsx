import { type ReactNode } from "react";
import "./styles/ProductCard.scss";

/* ── Types ─────────────────────────────────────────── */

export type ProductShade = {
  name: string;
  hex: string;
};

export type ProductBadge = "new" | "bestseller" | "sale";

export type VisualShape =
  | "tube"
  | "round"
  | "bottle"
  | "jar"
  | "stick"
  | "palette"
  | "serum";

export type ProductCardData = {
  id: number;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  description?: string;
  category: string;
  categoryName?: string;
  tags?: string[];
  shades?: ProductShade[];
  rating?: number;
  reviewCount?: number;
  badge?: ProductBadge;
  visualShape?: VisualShape;
};

export type ProductCardProps = {
  product: ProductCardData;
  visualShape?: VisualShape;
  variant?: "default" | "editorial";
  animated?: boolean;
  isWishlisted?: boolean;
  onAddToCart: (product: ProductCardData) => void;
  onToggleWishlist?: (product: ProductCardData) => void;
  onClick?: (product: ProductCardData) => void;
  editorialCta?: string;
  onEditorialCta?: () => void;
  editorialChildren?: ReactNode;
};

/* ── Helpers ───────────────────────────────────────── */

const SHAPES: VisualShape[] = [
  "tube", "round", "bottle", "jar", "stick", "palette", "serum",
];

const CARD_FILL_COUNT = 12;
const GRADIENT_COUNT = 12;

function pickShape(product: ProductCardData): VisualShape {
  if (product.visualShape) return product.visualShape;
  const map: Record<string, VisualShape> = {
    skincare: "serum",
    makeup: "round",
    fragrance: "bottle",
    body: "jar",
    sets: "palette",
  };
  return map[product.category] ?? SHAPES[product.id % SHAPES.length];
}

function pickCardFill(product: ProductCardData): number {
  return (product.id % CARD_FILL_COUNT) + 1;
}

function pickGradient(product: ProductCardData): number {
  return (product.id % GRADIENT_COUNT) + 1;
}

function renderStars(rating?: number): string {
  if (!rating) return "";
  const full = "★".repeat(Math.round(rating));
  const empty = "☆".repeat(5 - Math.round(rating));
  return full + empty;
}

function badgeLabel(badge: ProductBadge): string {
  switch (badge) {
    case "new": return "Nuevo";
    case "bestseller": return "Más vendido";
    case "sale": return "Oferta";
  }
}

/* ── Component ─────────────────────────────────────── */

function ProductCard({
  product,
  variant = "default",
  animated = true,
  isWishlisted = false,
  onAddToCart,
  onToggleWishlist,
  onClick,
  editorialCta,
  onEditorialCta,
  editorialChildren,
}: ProductCardProps) {
  const shape = pickShape(product);
  const cardFill = pickCardFill(product);
  const grad = pickGradient(product);
  const stars = renderStars(product.rating);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleWishlist?.(product);
  };

  const handleClick = () => {
    onClick?.(product);
  };

  /* ── Editorial ── */
  if (variant === "editorial") {
    return (
      <div
        className="product-card editorial"
        onClick={onEditorialCta ?? handleClick}
      >
        <div className="product-card__img">
          <div className="product-card__img-bg product-card__img-bg--editorial">
            <div className="product-card__img-bg--editorial-glow" />
            <div className="editorial-shape-row">
              <div className="editorial-shape editorial-shape--tall product-card__shape--grad2" />
              <div className="editorial-shape editorial-shape--circle product-card__shape--grad1" />
              <div className="editorial-shape editorial-shape--medium product-card__shape--grad3" />
            </div>
          </div>

          <div className="editorial-inner">
            {editorialChildren ?? (
              <>
                <p className="editorial-inner__tag">✦ Selección Coralie</p>
                <h3 className="editorial-inner__title">
                  {product.name} <em>{product.brand}</em>
                </h3>
                {editorialCta && (
                  <button
                    className="editorial-inner__cta"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditorialCta?.();
                    }}
                  >
                    {editorialCta}
                  </button>
                )}
              </>
            )}
          </div>

          {product.badge && (
            <span
              className={`product-card__badge product-card__badge--${product.badge}`}
            >
              {badgeLabel(product.badge)}
            </span>
          )}
        </div>
      </div>
    );
  }

  /* ── Default ── */
  return (
    <div
      className={`product-card${animated ? " product-card--anim" : ""}`}
      onClick={handleClick}
    >
      <div className="product-card__img">
        {product.badge && (
          <span
            className={`product-card__badge product-card__badge--${product.badge}`}
          >
            {badgeLabel(product.badge)}
          </span>
        )}

        <button
          className={`product-card__wishlist${isWishlisted ? " product-card__wishlist--liked" : ""}`}
          onClick={handleWishlist}
          aria-label={isWishlisted ? "Quitar de favoritos" : "Agregar a favoritos"}
        >
          {isWishlisted ? "♥" : "♡"}
        </button>

        <div
          className={`product-card__img-bg product-card__img-bg--fill${cardFill}`}
        >
          <div
            className={`product-card__img-bg--${shape} product-card__shape--grad${grad}`}
          />
        </div>

        <div className="product-card__hover-actions">
          <button className="product-card__hover-btn" onClick={handleAddToCart}>
            + Agregar al carrito
          </button>
        </div>
      </div>

      {product.brand && (
        <p className="product-card__brand">{product.brand}</p>
      )}

      {stars && (
        <p className="product-card__stars">
          {stars}
          {product.reviewCount != null && (
            <span className="product-card__reviews">
              {" "}
              ({product.reviewCount.toLocaleString()})
            </span>
          )}
        </p>
      )}

      <p className="product-card__name">{product.name}</p>

      {product.shades && product.shades.length > 0 && (
        <div className="product-card__shades">
          {product.shades.map((s, i) => (
            <div
              key={i}
              className="product-card__shade-dot"
              style={{ background: s.hex }}
              title={s.name}
            />
          ))}
        </div>
      )}

      <div className="product-card__bottom">
        <span className="product-card__price">
          {product.originalPrice != null && (
            <span className="product-card__price--old">
              ${product.originalPrice.toFixed(2)}
            </span>
          )}
          ${product.price.toFixed(2)}
        </span>
        <button className="product-card__add-btn" onClick={handleAddToCart}>
          + Agregar
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
