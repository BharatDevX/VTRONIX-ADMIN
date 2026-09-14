import { supabase } from "../../../services/supabase/supabase";
import { DoctorWiseSaleReport } from "../types/doctorWiseSales.types";

interface SaleRow {
  id: string;
  employee_id: string;
  doctor_id: string | null;
  dealer_id: string | null;
  retailer_id: string | null;
  product_id: string | null;
  quantity: number | null;
  rate: number | null;
  amount: number | null;
  sale_date: string;
  created_at: string | null;
}

interface DoctorRow {
  id: string;
  doctor_name: string | null;
}

interface DealerRow {
  id: string;
  dealer_name: string | null;
}

interface RetailerRow {
  id: string;
  retailer_name: string | null;
}

interface ProductRow {
  id: string;
  product_name: string | null;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error
  ) {
    return String(
      (error as { message?: string }).message ?? ""
    );
  }

  return "";
}

function toFriendlyError(error: unknown): Error {
  const message = getErrorMessage(error);

  console.error("getDoctorWiseSales Supabase error:", error);
  console.error("getDoctorWiseSales error message:", message);

  if (
    message.toLowerCase().includes("network") ||
    message.toLowerCase().includes("fetch") ||
    message.toLowerCase().includes("timeout")
  ) {
    return new Error(
      "Network issue. Please check your connection and try again."
    );
  }

  return new Error(
    "Unable to load the doctor sales report right now."
  );
}

export async function getDoctorWiseSales(
  employeeId: string
): Promise<DoctorWiseSaleReport[]> {
  if (!employeeId) {
    return [];
  }

  try {
    // --------------------------------------------------
    // 1. GET DOCTOR SALES
    // --------------------------------------------------

    const { data: salesData, error: salesError } = await supabase
      .from("sales")
      .select(
        `
        id,
        employee_id,
        doctor_id,
        dealer_id,
        retailer_id,
        product_id,
        quantity,
        rate,
        amount,
        sale_date,
        created_at
      `
      )
      .eq("employee_id", employeeId)
      .eq("sale_type", "doctor")
      .not("doctor_id", "is", null)
      .order("sale_date", {
        ascending: false,
      })
      .order("created_at", {
        ascending: false,
      });

    if (salesError) {
      throw salesError;
    }

    const sales = (salesData ?? []) as SaleRow[];

    // No sales = valid empty result
    if (sales.length === 0) {
      return [];
    }

    // --------------------------------------------------
    // 2. COLLECT UNIQUE IDs
    // --------------------------------------------------

    const doctorIds = Array.from(
      new Set(
        sales
          .map((sale) => sale.doctor_id)
          .filter((id): id is string => Boolean(id))
      )
    );

    const dealerIds = Array.from(
      new Set(
        sales
          .map((sale) => sale.dealer_id)
          .filter((id): id is string => Boolean(id))
      )
    );

    const retailerIds = Array.from(
      new Set(
        sales
          .map((sale) => sale.retailer_id)
          .filter((id): id is string => Boolean(id))
      )
    );

    const productIds = Array.from(
      new Set(
        sales
          .map((sale) => sale.product_id)
          .filter((id): id is string => Boolean(id))
      )
    );

    // --------------------------------------------------
    // 3. LOAD MASTER DATA IN PARALLEL
    // --------------------------------------------------

    const [
      doctorsResult,
      dealersResult,
      retailersResult,
      productsResult,
    ] = await Promise.all([
      doctorIds.length > 0
        ? supabase
            .from("doctors")
            .select("id, doctor_name")
            .in("id", doctorIds)
        : Promise.resolve({
            data: [],
            error: null,
          }),

      dealerIds.length > 0
        ? supabase
            .from("dealers")
            .select("id, dealer_name")
            .in("id", dealerIds)
        : Promise.resolve({
            data: [],
            error: null,
          }),

      retailerIds.length > 0
        ? supabase
            .from("retailers")
            .select("id, retailer_name")
            .in("id", retailerIds)
        : Promise.resolve({
            data: [],
            error: null,
          }),

      productIds.length > 0
        ? supabase
            .from("products")
            .select("id, product_name")
            .in("id", productIds)
        : Promise.resolve({
            data: [],
            error: null,
          }),
    ]);

    // --------------------------------------------------
    // 4. CHECK MASTER DATA ERRORS
    // --------------------------------------------------

    if (doctorsResult.error) {
      throw doctorsResult.error;
    }

    if (dealersResult.error) {
      throw dealersResult.error;
    }

    if (retailersResult.error) {
      throw retailersResult.error;
    }

    if (productsResult.error) {
      throw productsResult.error;
    }

    // --------------------------------------------------
    // 5. CREATE LOOKUP MAPS
    // --------------------------------------------------

    const doctorMap = new Map<string, string>();

    for (const doctor of (doctorsResult.data ?? []) as DoctorRow[]) {
      doctorMap.set(
        doctor.id,
        doctor.doctor_name ?? ""
      );
    }

    const dealerMap = new Map<string, string>();

    for (const dealer of (dealersResult.data ?? []) as DealerRow[]) {
      dealerMap.set(
        dealer.id,
        dealer.dealer_name ?? ""
      );
    }

    const retailerMap = new Map<string, string>();

    for (
      const retailer of (retailersResult.data ?? []) as RetailerRow[]
    ) {
      retailerMap.set(
        retailer.id,
        retailer.retailer_name ?? ""
      );
    }

    const productMap = new Map<string, string>();

    for (
      const product of (productsResult.data ?? []) as ProductRow[]
    ) {
      productMap.set(
        product.id,
        product.product_name ?? ""
      );
    }

    // --------------------------------------------------
    // 6. BUILD FINAL REPORT
    // --------------------------------------------------

    return sales.map((sale) => ({
      id: sale.id,

      doctor_name: sale.doctor_id
        ? doctorMap.get(sale.doctor_id) ?? ""
        : "",

      dealer_name: sale.dealer_id
        ? dealerMap.get(sale.dealer_id) ?? ""
        : "",

      retailer_name: sale.retailer_id
        ? retailerMap.get(sale.retailer_id) ?? ""
        : "",

      product_name: sale.product_id
        ? productMap.get(sale.product_id) ?? ""
        : "",

      quantity: Number(sale.quantity ?? 0),

      rate: Number(sale.rate ?? 0),

      amount: Number(sale.amount ?? 0),

      sale_date: sale.sale_date,
    }));
  } catch (error) {
    throw toFriendlyError(error);
  }
}