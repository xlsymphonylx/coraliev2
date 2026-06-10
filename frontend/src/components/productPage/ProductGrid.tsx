import "@/components/productPage/styles/ProductGrid.scss";
import ProductCard from "./ProductCard";

function ProductGrid() {
  return (
    <div className="product-grid">
      {Array.from({ length: 6 }, (_, index) => (
        <ProductCard
          key={index}
          label={`Placeholder product ${index + 1}`}
          price={100.1}
        />
      ))}
    </div>
  );
}

export default ProductGrid;
