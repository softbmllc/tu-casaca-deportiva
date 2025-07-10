// src/utils/normalizeProduct.ts

export function normalizeProduct(product: any, categories: any[], subcategories: any[]) {
  const categoryId = typeof product.category === "string"
    ? product.category
    : product.category?.id;

  const cat = categories.find((c) => c.id === categoryId) || { id: "", name: "" };

  const catName = typeof cat.name === "string" ? cat.name : cat.name?.es || cat.name?.en || "";

  const subcategoryId = typeof product.subcategory === "string"
    ? product.subcategory
    : product.subcategory?.id;

  const normalizedSubcategory = subcategories.find((sub) => sub.id === subcategoryId);

  const subcatName =
    typeof normalizedSubcategory?.name === "string"
      ? normalizedSubcategory.name
      : normalizedSubcategory?.name?.es || normalizedSubcategory?.name?.en || "";

  const subcategory =
    normalizedSubcategory && normalizedSubcategory.id
      ? { id: normalizedSubcategory.id, name: subcatName }
      : { id: "", name: "" };

  return {
    ...product,
    category: { id: cat.id, name: catName },
    subcategory,
  };
}