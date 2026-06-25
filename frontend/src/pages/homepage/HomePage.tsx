import { useEffect, useState } from "react";
import client from "@/api/client";
import "@/pages/homepage/HomePage.scss";

type PromoSettings = {
  title: string;
  subtitle: string;
  background_color: string;
  title_color: string;
  subtitle_color: string;
  image: string;
};

function HomePage() {
  const [promo, setPromo] = useState<PromoSettings | null>(null);

  useEffect(() => {
    client
      .get("/promo-settings")
      .then(({ data }) => {
        if (data.data) setPromo(data.data);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="home-page">
      <div
        className="home-page__promo"
        style={promo ? { backgroundColor: promo.background_color } : undefined}
      >
        <div className="home-page__promo-info">
          {promo && (
            <>
              <h1 className="home-page__promo-title" style={{ color: promo.title_color }}>{promo.title}</h1>
              <p className="home-page__promo-subtitle" style={{ color: promo.subtitle_color }}>{promo.subtitle}</p>
            </>
          )}
        </div>
        <div className="home-page__promo-img">
          <img src={promo?.image ?? "/banner.webp"} alt="Banner promocional" />
        </div>
      </div>
      <div className="home-page__categories"></div>
      <div className="home-page__arrivals"></div>
      <div className="home-page__showcase"></div>
      <div className="home-page__curated"></div>
    </div>
  );
}

export default HomePage;
