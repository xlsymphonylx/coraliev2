import "./styles/ProductCard.scss";

type ProductCardProps = {
  label: string;
  price: number;
};

function ProductCard({ label, price }: ProductCardProps) {
  return (
    <div className="product-card">
      <div className="product-card__image">
        <img
          src="placeholder.png"
          alt="Product Image"
          className="product-card__image-file"
        />
      </div>
      <div className="product-card__body">
        <div className="product-card__title">{label} test</div>
        <div className="product-card__price">{`Q${price.toFixed(2)} test`}</div>
      </div>
    </div>
  );
}

export default ProductCard;
