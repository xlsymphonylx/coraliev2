import "@/components/productPage/styles/ProductFilters.scss";

function ProductFilters() {
  return (
    <div className="product-filters">
      <div className="product-filters__start">
        <div className="form-group">
          <label className="product-filters__price-label">Precio</label>
          <div className="product-filters__price">
            <div className="form-group">
              <label className="product-filters__price-label">Q</label>
              <input
                type="number"
                className="product-filters__price-input"
                placeholder="De"
              />
            </div>

            <div className="form-group">
              <label className="product-filters__price-label">Q</label>
              <input
                type="number"
                className="product-filters__price-input"
                placeholder="Para"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="product-filters__end">
        <div className="form-group">
          <label htmlFor="sortFilter" className="product-filters__sort-label">
            Ordenador por:
          </label>
          <select id="sortFilter" className="product-filters__sort">
            <option value="" className="product-filters__sort-option">
              Precio, mayor a menor
            </option>
            <option value="" className="product-filters__sort-option">
              Precio, menor a mayor
            </option>
            <option value="" className="product-filters__sort-option">
              Fecha, antiguo a mas reciente
            </option>
            <option value="" className="product-filters__sort-option">
              Fechas, reciente a mas antiguo
            </option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default ProductFilters;
