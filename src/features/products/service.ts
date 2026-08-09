import { supabase } from "@/services/supabase";
import type { PaginatedQuery, PaginatedResponse, Product } from "@/types/domain";

interface ProductRow {
  id: string;
  product_name: string;
  category: string | null;
  price: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export async function getProducts(params: PaginatedQuery): Promise<PaginatedResponse<Product>> {
  const { branch, page, pageSize, search, status } = params;
  let query = supabase.from("products").select("*", { count: "exact" });

  if (status !== "all") {
    query = query.eq("is_active", status === "active");
  }

  if (branch.trim()) {
    query = query.ilike("category", `%${branch.trim()}%`);
  }

  if (search.trim()) {
    query = query.or(`product_name.ilike.%${search.trim()}%,category.ilike.%${search.trim()}%`);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { count, data, error } = await query.order("created_at", { ascending: false }).range(from, to);

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as ProductRow[];

  return {
    count: count ?? rows.length,
    data: rows.map((row) => ({
      id: row.id,
      product_name: row.product_name,
      category: row.category ?? "-",
      price: Number(row.price ?? 0),
      is_active: row.is_active,
      created_at: row.created_at,
      updated_at: row.updated_at,
    })),
  };
}

export async function createProduct(payload: Omit<Product, "id" | "created_at" | "updated_at">) {
  const duplicateCheck = await supabase.from("products").select("id").or(`product_name.ilike.%${payload.product_name}%`).limit(1);

  if (duplicateCheck.error) {
    throw duplicateCheck.error;
  }

  if ((duplicateCheck.data ?? []).length > 0) {
    throw new Error("Product with this name already exists.");
  }

  const { data, error } = await supabase.from("products").insert({
    product_name: payload.product_name,
    category: payload.category,
    price: payload.price,
    is_active: payload.is_active,
  }).select().single();

  if (error) {
    throw error;
  }

  return data as Product;
}

export async function updateProduct(id: string, payload: Partial<Omit<Product, "id" | "created_at" | "updated_at">>) {
  const { data, error } = await supabase.from("products").update(payload).eq("id", id).select().single();

  if (error) {
    throw error;
  }

  return data as Product;
}

export async function toggleProductStatus(id: string, is_active: boolean) {
  const { data, error } = await supabase.from("products").update({ is_active }).eq("id", id).select().single();

  if (error) {
    throw error;
  }

  return data as Product;
}

export async function deleteProduct(id: string) {
  const { data, error } = await supabase.from("products").delete().eq("id", id).select().single();
  if (error) {
    throw error;
  }
  return data as Product;
}
