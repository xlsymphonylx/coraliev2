import { useEffect, useState } from "react";
import client from "@/api/client";
import ProductShowcase from "@/components/home/ProductShowcase";
import type { ShowcaseProduct } from "@/components/home/ProductShowcase";
import "@/pages/homepage/HomePage.scss";

type PromoSettings = {
  title: string;
  subtitle: string;
  background_color: string;
  title_color: string;
  subtitle_color: string;
  image: string;
};

type ShowcaseSettings = {
  discount: string;
  title: string;
  subtitle: string;
  button_text: string;
  button_link: string;
  example_image_1: string;
  example_image_2: string;
  product_image: string;
  product_category: string;
  product_category_link: string;
  product_title: string;
  product_price: string;
};

/* ── Demo data ── */

const ARRIVALS: ShowcaseProduct[] = [
  {
    id: 1,
    vendor: "Tower 28 Beauty",
    title: "Mini Lil' Softies LipSoftie Lip Treatment Set",
    price: 265,
    comparePrice: 340,
    salePercent: 22,
    image: "https://placehold.co/400x400/fad4da/e8607a?text=Lip+Set",
    imageHover: "https://placehold.co/400x400/f5a8b4/e8607a?text=Lip+Set+2",
    badge: "sale",
  },
  {
    id: 2,
    vendor: "ONE/SIZE by Patrick Starrr",
    title: "Ultimate Blurring Setting Powder Blurred & Bright Travel Duo",
    price: 375,
    comparePrice: 410,
    salePercent: 9,
    image: "https://placehold.co/400x400/f5a8b4/18151a?text=Powder",
    imageHover: "https://placehold.co/400x400/e8607a/fff?text=Powder+2",
    badge: "sale",
    shades: [
      { name: "Translúcido/Ultra Rosa", hex: "#fad4da" },
      { name: "Melocotón oscuro profundo/rico", hex: "#c4b0b8" },
    ],
  },
  {
    id: 3,
    vendor: "Sol de Janeiro",
    title: "Spritz the Season Cheirosa Perfume Mist Gift Set",
    price: 515,
    comparePrice: 550,
    salePercent: 6,
    image: "https://placehold.co/400x400/fef0f2/e8607a?text=Sol+Mist",
    imageHover: "https://placehold.co/400x400/fad4da/e8607a?text=Sol+Mist+2",
    badge: "sale",
  },
  {
    id: 4,
    vendor: "ONE/SIZE by Patrick Starrr",
    title: "On 'Til Dawn Mattifying Waterproof Setting Spray Big & Bitty Duo",
    price: 475,
    comparePrice: 690,
    salePercent: 31,
    image: "https://placehold.co/400x400/18151a/e8607a?text=Setting+Spray",
    imageHover: "https://placehold.co/400x400/e8607a/fff?text=Spray+2",
    badge: "sale",
  },
  {
    id: 5,
    vendor: "Summer Fridays",
    title: "The Lip Butter Balm Minis",
    price: 330,
    comparePrice: null,
    salePercent: null,
    image: "https://placehold.co/400x400/fad4da/18151a?text=Lip+Balm",
    imageHover: "https://placehold.co/400x400/f5a8b4/18151a?text=Balm+2",
    badge: null,
  },
  {
    id: 6,
    vendor: "Rhode",
    title: "Holiday Glazed Trio Gift Set",
    price: 645,
    comparePrice: 785,
    salePercent: 18,
    image: "https://placehold.co/400x400/e8607a/fff?text=Rhode+Trio",
    imageHover: "https://placehold.co/400x400/f5a8b4/18151a?text=Trio+2",
    badge: "sale",
  },
  {
    id: 7,
    vendor: "Sephora Favorites",
    title: "Holiday Must Have Value Set",
    price: 915,
    comparePrice: 1936,
    salePercent: 53,
    image: "https://placehold.co/400x400/18151a/f5a8b4?text=Value+Set",
    imageHover: "https://placehold.co/400x400/fef0f2/18151a?text=Set+2",
    badge: "sale",
  },
  {
    id: 8,
    vendor: "Rhode",
    title: "Lip Case",
    price: 495,
    comparePrice: null,
    salePercent: null,
    image: "https://placehold.co/400x400/fad4da/18151a?text=Lip+Case",
    imageHover: "https://placehold.co/400x400/fef0f2/18151a?text=Case+2",
    badge: null,
    shades: [
      { name: "iPhone 13", hex: "#fad4da" },
      { name: "iPhone 15 Pro", hex: "#f5a8b4" },
      { name: "iPhone 16 Pro", hex: "#e8607a" },
    ],
  },
];

const SELECTIONS: ShowcaseProduct[] = [
  {
    id: 101,
    vendor: "The Ordinary",
    title: "Niacinamide 10% + Zinc 1% Oil Control Serum",
    price: 140,
    comparePrice: null,
    salePercent: null,
    image: "https://placehold.co/400x400/fef0f2/18151a?text=Niacinamide",
    imageHover: "https://placehold.co/400x400/fad4da/18151a?text=Niacinamide+2",
    badge: null,
  },
  {
    id: 102,
    vendor: "ANUA",
    title: "Heartleaf Pore Control Cleansing Oil",
    price: 250,
    comparePrice: null,
    salePercent: null,
    image: "https://placehold.co/400x400/f5a8b4/18151a?text=ANUA+Oil",
    imageHover: "https://placehold.co/400x400/e8607a/fff?text=ANUA+Oil+2",
    badge: null,
  },
  {
    id: 103,
    vendor: "Dr. Althea",
    title: "345NA Relief Cream – Crema Vegana para Regenerar y Desinflamar",
    price: 315,
    comparePrice: null,
    salePercent: null,
    image: "https://placehold.co/400x400/fad4da/18151a?text=Relief+Cream",
    imageHover: "https://placehold.co/400x400/fef0f2/18151a?text=Relief+Cream+2",
    badge: null,
  },
  {
    id: 104,
    vendor: "Neutrogena",
    title: "Sport Face Sunscreen Broad Spectrum Sunblock SPF 70+",
    price: 170,
    comparePrice: null,
    salePercent: null,
    image: "https://placehold.co/400x400/6a5a62/fff?text=SPF+70",
    imageHover: "https://placehold.co/400x400/c4b0b8/fff?text=SPF+70+2",
    badge: "sold-out",
  },
  {
    id: 105,
    vendor: "Starface",
    title: "Hydro-Star Pimple Patches",
    price: 185,
    comparePrice: null,
    salePercent: null,
    image: "https://placehold.co/400x400/e8607a/fff?text=Star+Patch",
    imageHover: "https://placehold.co/400x400/f5a8b4/18151a?text=Star+Patch+2",
    badge: null,
  },
  {
    id: 106,
    vendor: "CeraVe",
    title: "Gel Limpiador Espumoso",
    price: 230,
    comparePrice: null,
    salePercent: null,
    image: "https://placehold.co/400x400/18151a/f5a8b4?text=CeraVe+Gel",
    imageHover: "https://placehold.co/400x400/fef0f2/18151a?text=CeraVe+Gel+2",
    badge: null,
  },
  {
    id: 107,
    vendor: "The Ordinary",
    title: "Glycolic Acid 7% Exfoliating Toner Mini",
    price: 170,
    comparePrice: null,
    salePercent: null,
    image: "https://placehold.co/400x400/fef0f2/e8607a?text=Glycolic",
    imageHover: "https://placehold.co/400x400/fad4da/e8607a?text=Glycolic+2",
    badge: null,
  },
  {
    id: 108,
    vendor: "The Ordinary",
    title: "Multi-Peptide Lash and Brow Serum",
    price: 215,
    comparePrice: null,
    salePercent: null,
    image: "https://placehold.co/400x400/f5a8b4/18151a?text=Lash+Serum",
    imageHover: "https://placehold.co/400x400/e8607a/fff?text=Lash+Serum+2",
    badge: null,
  },
];

/* ── Component ── */

function HomePage() {
  const [promo, setPromo] = useState<PromoSettings | null>(null);
  const [showcase, setShowcase] = useState<ShowcaseSettings | null>(null);

  useEffect(() => {
    client
      .get("/promo-settings")
      .then(({ data }) => {
        if (data.data) setPromo(data.data);
      })
      .catch(() => {});

    client
      .get("/showcase-settings")
      .then(({ data }) => {
        if (data.data) setShowcase(data.data);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="home-page">
      {/* ── Promo ── */}
      <div
        className="home-page__promo"
        style={promo ? { backgroundColor: promo.background_color } : undefined}
      >
        <div className="home-page__promo-info">
          {promo && (
            <>
              <h1
                className="home-page__promo-title"
                style={{ color: promo.title_color }}
              >
                {promo.title}
              </h1>
              <p
                className="home-page__promo-subtitle"
                style={{ color: promo.subtitle_color }}
              >
                {promo.subtitle}
              </p>
            </>
          )}
        </div>
        <div className="home-page__promo-img">
          <img src={promo?.image ?? "/banner.webp"} alt="Banner promocional" />
        </div>
      </div>

      {/* ── Categories (placeholder) ── */}
      <div className="home-page__categories" />

      {/* ── Arrivals ── */}
      <ProductShowcase
        title="Recién llegados"
        subtitle="Descubre nuestros productos"
        products={ARRIVALS}
        btnText="Pre ordena"
      />

      {/* ── Showcase ── */}
      <div className="home-page__showcase">
        <div className="home-page__showcase-row">
          <div className="home-page__showcase-buy">
            <div className="home-page__showcase-buy-discount">
              {showcase?.discount ?? "2% OFF"}
            </div>
            <div className="home-page__showcase-buy-title">
              {showcase?.title ?? "Labios atrevidos, atrevida tú"}
            </div>
            <div className="home-page__showcase-buy-subtitle">
              {showcase?.subtitle ?? "¡Descubre nuestra nueva colección de delineador labiales con un 2% de descuento!"}
            </div>
            <div className="home-page__showcase-buy-button">
              <a
                className="home-page__showcase-buy-button-btn"
                href={showcase?.button_link ?? "https://coraliegtm.com/products/rhode-peptide-lip-shape"}
              >
                {showcase?.button_text ?? "Compra Ahora"}
              </a>
            </div>
          </div>
          <div className="home-page__showcase-example-1">
            <img
              src={showcase?.example_image_1 ?? "/showcase-example-1.jpg"}
              alt="Labial destacado"
              className="home-page__showcase-example-1-file"
            />
          </div>
        </div>
        <div className="home-page__showcase-row">
          <div className="home-page__showcase-example-2">
            <img
              src={showcase?.example_image_2 ?? "/showcase-example-2.png"}
              alt="Cuidado facial destacado"
              className="home-page__showcase-example-2-file"
            />
          </div>
          <div className="home-page__showcase-product">
            <div className="home-page__showcase-product-image">
              <img
                src={showcase?.product_image ?? "/showcase-product.jpg"}
                alt={showcase?.product_title ?? "Producto destacado"}
                className="home-page__showcase-product-image-file"
              />
            </div>
            <div className="home-page__showcase-product-info">
              <div className="home-page__showcase-product-info-category">
                <a href={showcase?.product_category_link ?? "https://coraliegtm.com/collections/skincare"}>
                  {showcase?.product_category ?? "Skin Care"}
                </a>
              </div>
              <div className="home-page__showcase-product-info-rating">
                ★★★★★
              </div>
              <div className="home-page__showcase-product-info-title">
                {showcase?.product_title ?? "ANUA Heartleaf Pore Control Cleansing Oil"}
              </div>
              <div className="home-page__showcase-product-info-price">
                {showcase?.product_price ?? "Q250.00"}
              </div>
              <button className="home-page__showcase-product-info-add">
                <span className="home-page__showcase-product-info-add-text">
                  Add to cart
                </span>
                <svg
                  width="16"
                  height="20"
                  viewBox="0 0 16 20"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M8.00083 11.1376C7.13351 11.1386 6.29265 10.839 5.62143 10.2897C4.95022 9.74041 4.49015 8.97545 4.31958 8.12507C4.30598 8.03549 4.31202 7.94403 4.33728 7.85702C4.36254 7.77001 4.40642 7.68953 4.46587 7.62116C4.52532 7.5528 4.59893 7.49817 4.68159 7.46107C4.76424 7.42397 4.85398 7.40529 4.94458 7.40632C5.09347 7.40415 5.23825 7.45522 5.35283 7.55032C5.46742 7.64543 5.54428 7.77832 5.56958 7.92507C5.68728 8.48689 5.99475 8.9911 6.44032 9.35299C6.88589 9.71489 7.44243 9.91242 8.01645 9.91242C8.59048 9.91242 9.14701 9.71489 9.59259 9.35299C10.0382 8.9911 10.3456 8.48689 10.4633 7.92507C10.4886 7.77832 10.5655 7.64543 10.6801 7.55032C10.7947 7.45522 10.9394 7.40415 11.0883 7.40632C11.1789 7.40529 11.2687 7.42397 11.3513 7.46107C11.434 7.49817 11.5076 7.5528 11.567 7.62116C11.6265 7.68953 11.6704 7.77001 11.6956 7.85702C11.7209 7.94403 11.7269 8.03549 11.7133 8.12507C11.5417 8.98074 11.0771 9.74977 10.3994 10.2997C9.72174 10.8496 8.8735 11.1459 8.00083 11.1376Z" />
                  <path d="M13.5629 19.3734H2.43789C2.18357 19.3738 1.93185 19.3223 1.69803 19.2223C1.46421 19.1223 1.25318 18.9757 1.07779 18.7915C0.902395 18.6074 0.766301 18.3895 0.677783 18.151C0.589266 17.9126 0.550176 17.6587 0.562892 17.4047L1.06914 6.62969C1.09009 6.14662 1.29685 5.69033 1.64624 5.35608C1.99562 5.02184 2.46062 4.83548 2.94414 4.83594H13.0566C13.5402 4.83548 14.0052 5.02184 14.3545 5.35608C14.7039 5.69033 14.9107 6.14662 14.9316 6.62969L15.4379 17.4047C15.4506 17.6587 15.4115 17.9126 15.323 18.151C15.2345 18.3895 15.0984 18.6074 14.923 18.7915C14.7476 18.9757 14.5366 19.1223 14.3028 19.2223C14.0689 19.3223 13.8172 19.3738 13.5629 19.3734ZM2.94414 6.09219C2.77838 6.09219 2.61941 6.15804 2.5022 6.27525C2.38499 6.39246 2.31914 6.55143 2.31914 6.71719L1.81289 17.4672C1.80865 17.5519 1.82168 17.6365 1.85119 17.716C1.88069 17.7954 1.92606 17.8681 1.98452 17.9295C2.04299 17.9909 2.11333 18.0397 2.19127 18.0731C2.26921 18.1064 2.35312 18.1235 2.43789 18.1234H13.5629C13.6477 18.1235 13.7316 18.1064 13.8095 18.0731C13.8875 18.0397 13.9578 17.9909 14.0163 17.9295C14.0747 17.8681 14.1201 17.7954 14.1496 17.716C14.1791 17.6365 14.1921 17.5519 14.1879 17.4672L13.6816 6.69219C13.6816 6.52643 13.6158 6.36746 13.4986 6.25025C13.3814 6.13304 13.2224 6.06719 13.0566 6.06719L2.94414 6.09219Z" />
                  <path d="M11.75 5.46875H10.5V4.375C10.5 3.71196 10.2366 3.07607 9.76777 2.60723C9.29893 2.13839 8.66304 1.875 8 1.875C7.33696 1.875 6.70107 2.13839 6.23223 2.60723C5.76339 3.07607 5.5 3.71196 5.5 4.375V5.46875H4.25V4.375C4.25 3.38044 4.64509 2.42661 5.34835 1.72335C6.05161 1.02009 7.00544 0.625 8 0.625C8.99456 0.625 9.94839 1.02009 10.6517 1.72335C11.3549 2.42661 11.75 3.38044 11.75 4.375V5.46875Z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Today's picks ── */}
      <ProductShowcase
        className="home-page__picks"
        title="Selecciones de hoy"
        subtitle="Completa tu Rutina de Skincare"
        products={SELECTIONS}
        btnText={(product) =>
          product.badge === "sold-out" ? "Agotado" : "Agregar a Carrito"
        }
      />

      {/* ── Curated (placeholder) ── */}
      <div className="home-page__curated" />
    </div>
  );
}

export default HomePage;
