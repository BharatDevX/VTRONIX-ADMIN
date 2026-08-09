import { zodResolver } from "@hookform/resolvers/zod";
import { Edit3, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Drawer } from "@/components/ui/drawer";
import { Field } from "@/components/ui/field";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTable } from "@/components/ui/table";
import { formatDate } from "@/lib/format";
import { inputClassName } from "@/lib/form-style";
import { exportCSV } from "@/services/export.service";
import { useCreateProduct, useDeleteProduct, useProducts, useToggleProductStatus, useUpdateProduct } from "@/features/products/hooks";
import type { PaginatedQuery, Product } from "@/types/domain";

const ProductSchema = z.object({
  product_name: z.string().trim().min(3, "Product name is required"),
  category: z.string().trim().min(2, "Category is required"),
  price: z.number().min(0, "Price must be positive"),
  is_active: z.boolean().default(true),
});

type ProductFormData = z.infer<typeof ProductSchema>;

const defaultFilters: PaginatedQuery = { branch: "", page: 1, pageSize: 12, search: "", status: "all" };

function ProductForm({ product, onDone, onFeedback }: { product?: Product; onDone: () => void; onFeedback: (message: string, type: "success" | "error") => void }) {
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const form = useForm<ProductFormData>({
    defaultValues: product
      ? {
          product_name: product.product_name,
          category: product.category,
          price: product.price,
          is_active: product.is_active,
        }
      : { product_name: "", category: "", price: 0, is_active: true },
    resolver: zodResolver(ProductSchema) as any,
  });

  const onSubmit: SubmitHandler<ProductFormData> = async (values) => {
    try {
      if (product) {
        await updateMutation.mutateAsync({ id: product.id, payload: values });
        onFeedback("Product updated successfully.", "success");
      } else {
        await createMutation.mutateAsync({ ...values, is_active: values.is_active ?? true });
        onFeedback("Product created successfully.", "success");
      }
      onDone();
    } catch (error) {
      onFeedback(error instanceof Error ? error.message : "Unable to save product.", "error");
    }
  };

  return (
    <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
      <Field label="Product name" error={form.formState.errors.product_name?.message}>
        <input className={inputClassName()} {...form.register("product_name")} />
      </Field>
      <Field label="Category" error={form.formState.errors.category?.message}>
        <input className={inputClassName()} {...form.register("category")} />
      </Field>
      <Field label="Price" error={form.formState.errors.price?.message}>
        <input className={inputClassName()} type="number" step="0.01" {...form.register("price", { valueAsNumber: true })} />
      </Field>
      <div className="flex items-center gap-3">
        <input className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600" id="active" type="checkbox" {...form.register("is_active")} />
        <label htmlFor="active" className="text-sm text-slate-600 dark:text-slate-300">
          Active
        </label>
      </div>
      <Button type="submit" disabled={form.formState.isSubmitting || createMutation.isPending || updateMutation.isPending}>
        {product ? (form.formState.isSubmitting || updateMutation.isPending ? "Saving..." : "Save product") : form.formState.isSubmitting || createMutation.isPending ? "Creating..." : "Create product"}
      </Button>
    </form>
  );
}

export default function ProductsPage() {
  const [filters, setFilters] = useState(defaultFilters);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>();
  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const products = useProducts(filters);
  const toggleStatus = useToggleProductStatus();
  const deleteMutation = useDeleteProduct();

  useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(() => setFeedback(null), 3500);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  const columns = useMemo(
    () => [
      { accessorKey: "product_name", header: "Name" },
      { accessorKey: "category", header: "Category" },
      { accessorKey: "price", cell: ({ row }: any) => `₹${row.original.price.toFixed(2)}`, header: "Price" },
      { accessorKey: "is_active", cell: ({ row }: any) => <StatusBadge value={row.original.is_active} />, header: "Status" },
      { accessorKey: "created_at", cell: ({ row }: any) => formatDate(row.original.created_at), header: "Created" },
      {
        cell: ({ row }: any) => (
          <div className="flex items-center gap-1">
            <Button
              onClick={() => {
                setSelectedProduct(row.original);
                setDrawerOpen(true);
              }}
              size="icon"
              title="Edit product"
              variant="ghost"
            >
              <Edit3 />
            </Button>
            <Button
              onClick={() => void toggleStatus.mutateAsync({ id: row.original.id, is_active: !row.original.is_active })}
              size="icon"
              title={row.original.is_active ? "Deactivate product" : "Activate product"}
              variant="ghost"
            >
              <Badge tone="info">{row.original.is_active ? "On" : "Off"}</Badge>
            </Button>
            <Button
              onClick={() => {
                if (!window.confirm("Delete this product?")) return;
                void deleteMutation.mutateAsync(row.original.id);
              }}
              size="icon"
              title="Delete product"
              variant="ghost"
            >
              <Trash2 />
            </Button>
          </div>
        ),
        header: "Actions",
      },
    ],
    [deleteMutation, toggleStatus],
  );

  return (
    <div>
      <PageHeader
        actions={
          <>
            <Button
              onClick={() =>
                exportCSV(
                  "products.csv",
                  (products.data?.data ?? []).map((product) => ({
                    category: product.category,
                    price: product.price,
                    product_name: product.product_name,
                    status: product.is_active ? "Active" : "Inactive",
                  })),
                )
              }
              variant="outline"
            >
              Export CSV
            </Button>
            <Button
              onClick={() => {
                setSelectedProduct(undefined);
                setDrawerOpen(true);
              }}
            >
              <Plus />
              Add product
            </Button>
          </>
        }
        description="Product master data management for order forms and inventory reference."
        eyebrow="Product operations"
        title="Products"
      />

      <div className="space-y-5 p-5">
        {feedback ? (
          <div className={`rounded-xl border px-4 py-3 text-sm ${feedback.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
            {feedback.message}
          </div>
        ) : null}

        <Card>
          <CardContent className="grid gap-3 md:grid-cols-[1fr_160px_180px_180px]">
            <label className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <Search className="size-4" />
              <input
                className="w-full bg-transparent text-slate-950 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500"
                onChange={(event) => setFilters((value) => ({ ...value, page: 1, search: event.target.value }))}
                placeholder="Search product, category"
                value={filters.search}
              />
            </label>
            <input className={inputClassName()} onChange={(event) => setFilters((value) => ({ ...value, page: 1, branch: event.target.value }))} placeholder="Category" value={filters.branch} />
            <select
              className={inputClassName()}
              onChange={(event) => setFilters((value) => ({ ...value, page: 1, status: event.target.value }))}
              value={filters.status}
            >
              <option value="all">All status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </CardContent>
        </Card>

        <DataTable columns={columns} data={products.data?.data ?? []} emptyDescription="Add products used by order forms and field sales." emptyTitle="No products found" isLoading={products.isLoading} />

        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500 dark:text-slate-400">
          <Badge>{products.data?.count ?? 0} records</Badge>
          <div className="flex items-center gap-2">
            <Button disabled={filters.page === 1} onClick={() => setFilters((value) => ({ ...value, page: value.page - 1 }))} variant="outline">
              Previous
            </Button>
            <Button disabled={!products.data || filters.page * filters.pageSize >= products.data.count} onClick={() => setFilters((value) => ({ ...value, page: value.page + 1 }))} variant="outline">
              Next
            </Button>
          </div>
        </div>
      </div>

      <Drawer onClose={() => setDrawerOpen(false)} open={drawerOpen} title={selectedProduct ? "Edit product" : "Add product"}>
        <ProductForm product={selectedProduct} onDone={() => setDrawerOpen(false)} onFeedback={(message, type) => setFeedback({ message, type })} />
      </Drawer>
    </div>
  );
}
