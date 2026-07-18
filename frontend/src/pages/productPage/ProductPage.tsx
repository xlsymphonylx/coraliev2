import { useEffect, useMemo, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "@/components/productPage/ProductCard";
import type { ProductCardData } from "@/components/productPage/ProductCard";
import ProductGrid from "@/components/productPage/ProductGrid";
import ProductFilters from "@/components/productPage/ProductFilters";
import type { FiltersState, SortOption } from "@/components/productPage/ProductFilters";
import { fetchCategories, buildCategoryTree } from "@/api/categories";
import type { CategoryTreeNode } from "@/api/categories";
import "@/pages/productPage/ProductPage.scss";

/* ── Productos demo ────────────────────────────────── */

const DEMO_PRODUCTS: ProductCardData[] = [
  { id: 1,  name: "Peptide Lip Tint",         brand: "Rhode",         price: 24,  category: "skincare", tags: ["nuevo", "vegano"],       shades: [{name:"Raspberry",hex:"#E8607A"},{name:"Berry",hex:"#C83060"},{name:"Nude",hex:"#FAD4DA"},{name:"Wine",hex:"#A02050"}], rating: 5, reviewCount: 2341, badge: "new" },
  { id: 2,  name: "Peptide Blush",             brand: "Rhode",         price: 32,  category: "skincare", tags: ["nuevo", "vegano"],       shades: [{name:"Petal",hex:"#FAD4DA"},{name:"Coral",hex:"#E8607A"},{name:"Rose",hex:"#F5A8B4"}], rating: 5, reviewCount: 1876, badge: "new" },
  { id: 3,  name: "Super Bounce",              brand: "Glossier",      price: 29,  category: "skincare", tags: ["bestseller", "vegano"],   rating: 4, reviewCount: 3421 },
  { id: 4,  name: "Futuredew",                 brand: "Glossier",      price: 26,  category: "skincare", tags: ["bestseller", "vegano"],   rating: 5, reviewCount: 5632, badge: "bestseller" },
  { id: 5,  name: "Lip Sleeping Mask",         brand: "Laneige",       price: 24,  category: "skincare", tags: ["bestseller"],            shades: [{name:"Blush",hex:"#FAD4DA"},{name:"Rose",hex:"#F5A8B4"},{name:"Nude",hex:"#FEF0F2"}], rating: 5, reviewCount: 8921, badge: "bestseller" },
  { id: 6,  name: "Hyaluronic Acid 2%",        brand: "The Ordinary",  price: 8,   category: "skincare", tags: ["bestseller", "vegano"],   rating: 4, reviewCount: 12453 },
  { id: 7,  name: "Dewy Skin Cream",           brand: "Tatcha",        price: 72,  category: "skincare", tags: ["lujo", "vegano"],         rating: 5, reviewCount: 4567 },
  { id: 8,  name: "Niacinamide 10% + Zinc",    brand: "The Ordinary",  price: 12,  category: "skincare", tags: ["bestseller", "vegano"],   rating: 4, reviewCount: 9876 },
  { id: 9,  name: "Brazilian Bum Bum Cream",   brand: "Sol de Janeiro",price: 48,  category: "body",     tags: ["bestseller"],            rating: 5, reviewCount: 12543, badge: "bestseller" },
  { id: 10, name: "Orgasm Blush",              brand: "NARS",          price: 36,  category: "makeup",   tags: ["bestseller"],            shades: [{name:"Peachy Pink",hex:"#F5A8B4"},{name:"Coral",hex:"#E8607A"},{name:"Berry",hex:"#C83060"}], rating: 5, reviewCount: 15678, badge: "bestseller" },
  { id: 11, name: "Cloud Paint",               brand: "Glossier",      price: 18,  category: "makeup",   tags: ["bestseller", "vegano"],   shades: [{name:"Blush",hex:"#FAD4DA"},{name:"Coral",hex:"#E8607A"},{name:"Rose",hex:"#F5A8B4"},{name:"Berry",hex:"#C83060"},{name:"Wine",hex:"#A02050"}], rating: 5, reviewCount: 7890 },
  { id: 12, name: "Peptide Lip Treatment",     brand: "Rhode",         price: 38,  category: "makeup",   tags: ["bestseller", "vegano"],   shades: [{name:"Nude",hex:"#FEF0F2"},{name:"Blush",hex:"#FAD4DA"},{name:"Rose",hex:"#F5A8B4"}], rating: 5, reviewCount: 6543, badge: "bestseller" },
  { id: 13, name: "Hwyl EDP",                  brand: "Aesop",         price: 55,  category: "fragrance", tags: ["nuevo", "lujo"],         rating: 5, reviewCount: 1234, badge: "new" },
  { id: 14, name: "Rose EDP",                  brand: "Byredo",        price: 68,  category: "fragrance", tags: ["lujo"],                  rating: 5, reviewCount: 2345 },
  { id: 15, name: "Hand Cream",                brand: "Aesop",         price: 32,  category: "body",     tags: ["vegano"],                rating: 4, reviewCount: 3456 },
  { id: 16, name: "Body Lotion",               brand: "Sol de Janeiro",price: 38,  category: "body",     tags: ["bestseller"],            rating: 5, reviewCount: 4567 },
  { id: 17, name: "Skincare Starter Kit",      brand: "Rhode",         price: 72,  originalPrice: 94,    category: "sets",   tags: ["bestseller", "vegano"], rating: 5, reviewCount: 3210, badge: "sale" },
  { id: 18, name: "Lip Bundle Duo",            brand: "Rhode",         price: 58,  originalPrice: 72,    category: "sets",   tags: ["nuevo", "vegano"],     rating: 5, reviewCount: 987, badge: "sale" },
];

/* ── Tags disponibles ── */
const ALL_TAGS = [
  { slug: "nuevo",      name: "Nuevo" },
  { slug: "bestseller", name: "Más vendido" },
  { slug: "vegano",     name: "Vegano" },
  { slug: "lujo",       name: "Lujo" },
  { slug: "oferta",     name: "En oferta" },
];

/* ── Helpers ── */

function sortProducts(products: ProductCardData[], sort: SortOption): ProductCardData[] {
  const list = [...products];
  switch (sort) {
    case "price-asc":  return list.sort((a, b) => a.price - b.price);
    case "price-desc": return list.sort((a, b) => b.price - a.price);
    case "newest":     return list.sort((a, b) => b.id - a.id);
    case "bestselling":return list.sort((a, b) => (b.reviewCount ?? 0) - (a.reviewCount ?? 0));
    default:           return list;
  }
}

function filterProducts(products: ProductCardData[], filters: FiltersState): ProductCardData[] {
  return products.filter((p) => {
    if (filters.category && p.category !== filters.category) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !p.brand.toLowerCase().includes(q)) return false;
    }
    if (p.price > filters.maxPrice) return false;
    if (filters.tags.length > 0) {
      const pt = p.tags ?? [];
      if (!filters.tags.every((t) => pt.includes(t))) return false;
    }
    return true;
  });
}

/* ── Component ─────────────────────────────────────── */

function ProductPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [catTree, setCatTree] = useState<CategoryTreeNode[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [wishlisted, setWishlisted] = useState<Set<number>>(new Set());

  const [filters, setFilters] = useState<FiltersState>(() => ({
    category: searchParams.get("category") ?? "",
    subcategory: "",
    tags: [],
    search: searchParams.get("search") ?? "",
    sort: (searchParams.get("sort") as SortOption) ?? "featured",
    maxPrice: 120,
  }));

  useEffect(() => {
    fetchCategories()
      .then((cats) => setCatTree(buildCategoryTree(cats)))
      .catch(() => {});
  }, []);

  const categoryName = useMemo(() => {
    if (!filters.category) return "Todos";
    const findNode = (nodes: CategoryTreeNode[]): string | null => {
      for (const n of nodes) {
        if (n.slug === filters.category) return n.name;
        const found = findNode(n.children);
        if (found) return found;
      }
      return null;
    };
    return findNode(catTree) ?? filters.category;
  }, [filters.category, catTree]);

  const filteredProducts = useMemo(
    () => sortProducts(filterProducts(DEMO_PRODUCTS, filters), filters.sort),
    [filters],
  );

  const handleFilterChange = useCallback(
    (next: FiltersState) => {
      setFilters(next);
      const params = new URLSearchParams();
      if (next.category) params.set("category", next.category);
      if (next.search) params.set("search", next.search);
      if (next.sort !== "featured") params.set("sort", next.sort);
      setSearchParams(params, { replace: true });
    },
    [setSearchParams],
  );

  const handleAddToCart = useCallback((_product: ProductCardData) => {
    setCartCount((n) => n + 1);
  }, []);

  const handleToggleWishlist = useCallback((product: ProductCardData) => {
    setWishlisted((prev) => {
      const next = new Set(prev);
      if (next.has(product.id)) next.delete(product.id);
      else next.add(product.id);
      return next;
    });
  }, []);

  const activeFilterTags = useMemo(() => {
    const tags: { label: string; onRemove: () => void }[] = [];
    if (filters.category) {
      tags.push({
        label: `Categoría: ${categoryName}`,
        onRemove: () => handleFilterChange({ ...filters, category: "", subcategory: "" }),
      });
    }
    if (filters.search) {
      tags.push({
        label: `Búsqueda: "${filters.search}"`,
        onRemove: () => handleFilterChange({ ...filters, search: "" }),
      });
    }
    return tags;
  }, [filters, categoryName, handleFilterChange]);

  const editorialCards = useMemo(() => {
    const cards: React.ReactNode[] = [];
    cards[1] = (
      <ProductCard
        key="editorial-1"
        product={{ id: -1, name: "Colección", brand: "Péptidos", price: 0, category: "skincare" }}
        variant="editorial"
        editorialCta="Ver colección →"
        onAddToCart={() => {}}
        animated={false}
      />
    );
    cards[9] = (
      <ProductCard
        key="editorial-2"
        product={{ id: -2, name: "Tu aroma,", brand: "tu historia", price: 0, category: "fragrance" }}
        variant="editorial"
        editorialCta="Ver fragancias →"
        onAddToCart={() => {}}
        animated={false}
      />
    );
    return cards;
  }, []);

  return (
    <div className="product-page">
      <div className="shop-header">
        <div className="shop-header-left">
          <h1>
            {filters.category ? categoryName : "Todos"} <em>los productos</em>
          </h1>
          <p>Belleza curada — cada producto merece su lugar.</p>
        </div>
        <span className="shop-count">
          {filteredProducts.length} producto{filteredProducts.length !== 1 ? "s" : ""}
        </span>
      </div>

      <ProductFilters
        categoryTree={catTree}
        availableTags={ALL_TAGS}
        filters={filters}
        onChange={handleFilterChange}
        visibleCount={filteredProducts.length}
        totalCount={DEMO_PRODUCTS.length}
        categoryName={categoryName}
      >
        <div className="product-page__grid">
          <ProductGrid
            products={filteredProducts}
            editorialCards={editorialCards}
            activeFilters={activeFilterTags}
            totalCount={DEMO_PRODUCTS.length}
            onAddToCart={handleAddToCart}
            onToggleWishlist={handleToggleWishlist}
            onClickProduct={(p) => { handleAddToCart(p); }}
            wishlistedIds={wishlisted}
          />
        </div>
      </ProductFilters>

      {cartCount > 0 && (
        <div className="cart-badge">
          {cartCount} en tu carrito
        </div>
      )}
    </div>
  );
}

export default ProductPage;
