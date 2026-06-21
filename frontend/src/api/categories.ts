import client from "./client";

export type Category = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  parent_id: number | null;
  created_at: string;
};

export type CategoryTreeNode = Category & {
  children: CategoryTreeNode[];
};

/** Fetch all categories from the API */
export async function fetchCategories(): Promise<Category[]> {
  const { data } = await client.get("/categories");
  return data.data ?? [];
}

/** Build a tree from a flat category list (roots first, then children nested) */
export function buildCategoryTree(categories: Category[]): CategoryTreeNode[] {
  const map = new Map<number, CategoryTreeNode>();
  const roots: CategoryTreeNode[] = [];

  // Create nodes
  for (const cat of categories) {
    map.set(cat.id, { ...cat, children: [] });
  }

  // Link children to parents
  for (const cat of categories) {
    const node = map.get(cat.id)!;
    if (cat.parent_id && map.has(cat.parent_id)) {
      map.get(cat.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

/** Flatten a tree into a list with depth info (useful for admin table) */
export type CategoryWithDepth = Category & { depth: number };

export function flattenTree(
  roots: CategoryTreeNode[],
  depth = 0,
): CategoryWithDepth[] {
  const result: CategoryWithDepth[] = [];
  for (const node of roots) {
    result.push({ ...node, depth });
    result.push(...flattenTree(node.children, depth + 1));
  }
  return result;
}
