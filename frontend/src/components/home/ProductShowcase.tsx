import { useRef, useCallback, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "./styles/ProductShowcase.scss";

/* ── Types ── */

export type ShowcaseProduct = {
  id: number;
  vendor: string;
  title: string;
  price: number;
  comparePrice: number | null;
  salePercent: number | null;
  image: string;
  imageHover: string;
  badge: "sold-out" | "sale" | null;
  shades?: { name: string; hex: string }[];
};

export type ProductShowcaseProps = {
  /** Section heading */
  title: string;
  /** Section subtitle */
  subtitle: string;
  /** Products to display */
  products: ShowcaseProduct[];
  /** Button label. Pass a string, or a function that receives the product. */
  btnText?: string | ((product: ShowcaseProduct) => string);
  /** Label when product is sold out (badge = "sold-out") */
  soldOutText?: string;
  /** Optional CSS class to wrap the section for scoped overrides */
  className?: string;
  /** Slot rendered inside each card's info area, below the button */
  children?: ReactNode | ((product: ShowcaseProduct) => ReactNode);
};

/* ── Component ── */

function ProductShowcase({
  title,
  subtitle,
  products,
  btnText = "Pre ordena",
  soldOutText = "Agotado",
  className = "",
  children,
}: ProductShowcaseProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scroll = useCallback((dir: "left" | "right") => {
    const el = trackRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.75;
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  }, []);

  const resolveBtn = (product: ShowcaseProduct): string =>
    typeof btnText === "function" ? btnText(product) : btnText;

  const resolveChildren = (product: ShowcaseProduct): ReactNode =>
    typeof children === "function" ? children(product) : children;

  return (
    <section className={`product-showcase${className ? ` ${className}` : ""}`}>
      <div className="product-showcase__header">
        <h2 className="product-showcase__title">{title}</h2>
        <p className="product-showcase__subtitle">{subtitle}</p>
      </div>

      <div className="product-showcase__slider">
        <button
          className="product-showcase__arrow product-showcase__arrow--prev"
          onClick={() => scroll("left")}
          aria-label="Anterior"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="product-showcase__track" ref={trackRef}>
          {products.map((product) => (
            <article key={product.id} className="product-showcase__card">
              {/* Image */}
              <div className="product-showcase__card-media">
                <img
                  className="product-showcase__card-media-img"
                  src={product.image}
                  alt={product.title}
                  loading="lazy"
                />
                <img
                  className="product-showcase__card-media-hover"
                  src={product.imageHover}
                  alt={product.title}
                  loading="lazy"
                />

                {/* Badge */}
                {product.badge && (
                  <div className="product-showcase__card-badge">
                    {product.badge === "sale" && product.salePercent != null && (
                      <span className="product-showcase__card-badge--sale">
                        -{product.salePercent}%
                      </span>
                    )}
                    {product.badge === "sold-out" && (
                      <span className="product-showcase__card-badge--sold">
                        {soldOutText}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="product-showcase__card-info">
                <div className="product-showcase__card-vendor">
                  {product.vendor}
                </div>

                <h3 className="product-showcase__card-title">
                  {product.title}
                </h3>

                <div className="product-showcase__card-prices">
                  {product.comparePrice != null && (
                    <span className="product-showcase__card-prices-old">
                      Q{product.comparePrice.toFixed(2)}
                    </span>
                  )}
                  <span className="product-showcase__card-prices-current">
                    Q{product.price.toFixed(2)}
                  </span>
                </div>

                {/* Color swatches */}
                {product.shades && product.shades.length > 0 && (
                  <div className="product-showcase__card-shades">
                    {product.shades.map((s, i) => (
                      <span
                        key={i}
                        className="product-showcase__card-shades-dot"
                        style={{ backgroundColor: s.hex }}
                        title={s.name}
                      />
                    ))}
                  </div>
                )}

                <button className="product-showcase__card-btn">
                  {resolveBtn(product)}
                </button>

                {resolveChildren(product)}
              </div>
            </article>
          ))}
        </div>

        <button
          className="product-showcase__arrow product-showcase__arrow--next"
          onClick={() => scroll("right")}
          aria-label="Siguiente"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </section>
  );
}

export default ProductShowcase;
