import { useEffect, useState } from "react";
import ProductFilters from "@/components/productPage/ProductFilters";
import ProductGrid from "@/components/productPage/ProductGrid";
import { fetchCategories, buildCategoryTree } from "@/api/categories";
import type { CategoryTreeNode } from "@/api/categories";
import "@/pages/productPage/ProductPage.scss";
import { Link, Navigate, useSearchParams } from "react-router-dom";

function ProductPage() {
  const [searchParams] = useSearchParams();
  const [catTree, setCatTree] = useState<CategoryTreeNode[]>([]);

  useEffect(() => {
    fetchCategories()
      .then((cats) => setCatTree(buildCategoryTree(cats)))
      .catch(() => {});
  }, []);

  const category = searchParams.get("category");
  const search = searchParams.get("search") ?? "";
  const sort = searchParams.get("sort") ?? "";

  if (!category) {
    return <Navigate to="/404" replace />;
  }

  /** Recursively render category tree in sidebar */
  function renderTree(nodes: CategoryTreeNode[], depth = 0): React.ReactNode {
    return (
      <ul style={{ paddingLeft: depth > 0 ? "1rem" : 0, listStyle: "none", margin: 0 }}>
        {nodes.map((node) => (
          <li key={node.id}>
            <Link
              to={`/productos?category=${node.slug}`}
              className={`product-page__cat-link${node.slug === category ? " product-page__cat-link--active" : ""}`}
              style={{ paddingLeft: `${0.5 + depth * 0.75}rem` }}
            >
              {node.name}
            </Link>
            {node.children.length > 0 && renderTree(node.children, depth + 1)}
          </li>
        ))}
      </ul>
    );
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
          <h3 className="product-page__cat-heading">Categorías</h3>
          {renderTree(catTree)}
        </div>
      </div>
    </div>
  );
}

export default ProductPage;
