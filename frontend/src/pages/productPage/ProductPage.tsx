import ProductFilters from "@/components/productPage/ProductFilters";
import ProductGrid from "@/components/productPage/ProductGrid";
import "@/pages/productPage/ProductPage.scss";
import { Navigate, useSearchParams } from "react-router-dom";

function ProductPage() {
  const [searchParams] = useSearchParams();

  const category = searchParams.get("category");
  const search = searchParams.get("search") ?? "";
  const sort = searchParams.get("sort") ?? "";

  if (!category) {
    return <Navigate to="/404" replace />;
  }

  return (
    <div className="product-page">
      <div className="product-page__hero">
        <h1 className="product-page__title">{category}</h1>
      </div>
      <ProductFilters />
      <div className="product-page__content">
        <ProductGrid />
        <div className="product-page__categories">
          <ul>
            <li>categoria</li>
            <li>categoria</li>
            <li>categoria</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ProductPage;
