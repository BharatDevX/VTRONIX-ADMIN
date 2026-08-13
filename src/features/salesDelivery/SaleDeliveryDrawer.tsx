import { useMemo, useState } from "react";
import {
  CalendarDays,
  ExternalLink,
  PackageCheck,
  Upload,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { Field } from "@/components/ui/field";
import { inputClassName } from "@/lib/form-style";
import { formatCurrency, formatDate } from "@/lib/format";
import type { SalesRecord } from "@/types/domain";

import { createInvoiceSignedUrl } from "./service";
import {
  useCreateSaleDelivery,
  useSaleDeliveryData,
  useUploadSaleInvoice,
} from "./hooks";

interface Props {
  sale: SalesRecord | null;
  open: boolean;
  onClose: () => void;
}

export default function SaleDeliveryDrawer({
  sale,
  open,
  onClose,
}: Props) {
  const [deliveredAmount, setDeliveredAmount] = useState("");
  const [deliveryDate, setDeliveryDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("");
  const [remarks, setRemarks] = useState("");

  /*
   * Each delivery can have its own invoice.
   *
   * Example:
   * delivery-1 -> invoice #INV001 -> file.pdf
   * delivery-2 -> invoice #INV002 -> file2.pdf
   */
  const [invoiceNumbers, setInvoiceNumbers] = useState<
    Record<string, string>
  >({});

  const [invoiceFiles, setInvoiceFiles] = useState<
    Record<string, File | null>
  >({});

  const [feedback, setFeedback] = useState<{
    text: string;
    error?: boolean;
  } | null>(null);

  const query = useSaleDeliveryData(
    sale?.id ?? null,
    Number(sale?.amount ?? 0),
  );

  const createDelivery = useCreateSaleDelivery();
  const uploadInvoice = useUploadSaleInvoice();

  const orderedAmount = Number(sale?.amount ?? 0);

  const deliveredAmountTotal =
    query.data?.summary.deliveredAmount ?? 0;

  const remaining =
    query.data?.summary.remainingAmount ?? orderedAmount;

  const progress = useMemo(() => {
    if (orderedAmount <= 0) {
      return 0;
    }

    return Math.min(
      100,
      (deliveredAmountTotal / orderedAmount) * 100,
    );
  }, [deliveredAmountTotal, orderedAmount]);

  if (!sale) {
    return null;
  }

  const handleAddDelivery = async () => {
    try {
      setFeedback(null);

      const amount = Number(deliveredAmount);

      if (!Number.isFinite(amount) || amount <= 0) {
        setFeedback({
          text: "Please enter a valid delivery amount.",
          error: true,
        });
        return;
      }

      if (amount > remaining) {
        setFeedback({
          text: `Delivery amount cannot exceed the remaining amount of ${formatCurrency(
            remaining,
          )}.`,
          error: true,
        });
        return;
      }

      await createDelivery.mutateAsync({
        saleId: sale.id,
        employeeId: sale.employee_id,
        orderedAmount,
        deliveredAmount: amount,
        deliveryDate,
        expectedDeliveryDate:
          expectedDeliveryDate || null,
        remarks: remarks.trim() || null,
      });

      setDeliveredAmount("");
      setExpectedDeliveryDate("");
      setRemarks("");

      setFeedback({
        text: "Delivery saved successfully.",
      });
    } catch (error) {
      setFeedback({
        text:
          error instanceof Error
            ? error.message
            : "Unable to save delivery.",
        error: true,
      });
    }
  };

  const handleUploadInvoice = async (
    deliveryId: string,
  ) => {
    const file = invoiceFiles[deliveryId];

    if (!file) {
      setFeedback({
        text: "Please choose an invoice file first.",
        error: true,
      });
      return;
    }

    try {
      setFeedback(null);

      await uploadInvoice.mutateAsync({
        saleId: sale.id,
        deliveryId,
        employeeId: sale.employee_id,
        invoiceNumber:
          invoiceNumbers[deliveryId]?.trim() ?? "",
        file,
      });

      setInvoiceFiles((current) => ({
        ...current,
        [deliveryId]: null,
      }));

      setInvoiceNumbers((current) => ({
        ...current,
        [deliveryId]: "",
      }));

      setFeedback({
        text: "Invoice uploaded successfully.",
      });
    } catch (error) {
      setFeedback({
        text:
          error instanceof Error
            ? error.message
            : "Unable to upload invoice.",
        error: true,
      });
    }
  };

  const openInvoice = async (path: string) => {
    try {
      const url = await createInvoiceSignedUrl(path);

      window.open(
        url,
        "_blank",
        "noopener,noreferrer",
      );
    } catch (error) {
      setFeedback({
        text:
          error instanceof Error
            ? error.message
            : "Unable to open invoice.",
        error: true,
      });
    }
  };

  return (
    <Drawer
      onClose={onClose}
      open={open}
      title="Manage Order Delivery"
    >
      <div className="space-y-5">
        {/* ORDER SUMMARY */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs text-slate-500">
                Employee
              </p>
              <p className="font-semibold">
                {sale.employee_name}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Order Date
              </p>
              <p className="font-semibold">
                {formatDate(sale.sale_date)}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Product
              </p>
              <p className="font-semibold">
                {sale.product_name}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Original Order
              </p>

              <p className="text-lg font-semibold">
                {formatCurrency(orderedAmount)}
              </p>
            </div>
          </div>

          {/* PROGRESS BAR */}
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>

          <div className="mt-2 flex justify-between text-xs text-slate-500">
            <span>
              Delivered{" "}
              {formatCurrency(deliveredAmountTotal)}
            </span>

            <span>
              Remaining {formatCurrency(remaining)}
            </span>
          </div>
        </div>

        {/* DELIVERY HISTORY */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <PackageCheck className="size-5 text-sky-600" />

            <h3 className="font-semibold">
              Delivery History
            </h3>
          </div>

          {query.isLoading ? (
            <p className="text-sm text-slate-500">
              Loading deliveries...
            </p>
          ) : query.data?.deliveries.length ? (
            query.data.deliveries.map((delivery) => {
              const invoice =
                query.data?.invoices.find(
                  (item) =>
                    item.delivery_id === delivery.id,
                );

              return (
                <div
                  className="rounded-xl border border-slate-200 p-4 dark:border-slate-800"
                  key={delivery.id}
                >
                  {/* DELIVERY HEADER */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">
                        {formatCurrency(
                          delivery.delivered_amount,
                        )}
                      </p>

                      <p className="text-xs text-slate-500">
                        Delivered{" "}
                        {formatDate(
                          delivery.delivery_date,
                        )}
                      </p>

                      {delivery.expected_delivery_date && (
                        <p className="text-xs text-slate-500">
                          Next expected:{" "}
                          {formatDate(
                            delivery.expected_delivery_date,
                          )}
                        </p>
                      )}
                    </div>

                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      {delivery.status === "completed"
                        ? "Completed"
                        : "Partial"}
                    </span>
                  </div>

                  {/* REMARKS */}
                  {delivery.remarks && (
                    <p className="mt-2 text-sm text-slate-500">
                      {delivery.remarks}
                    </p>
                  )}

                  {/* EXISTING INVOICE */}
                  {invoice ? (
                    <Button
                      className="mt-3"
                      onClick={() =>
                        void openInvoice(
                          invoice.file_path,
                        )
                      }
                      size="sm"
                      variant="outline"
                    >
                      <ExternalLink className="mr-2 size-4" />

                      View invoice{" "}
                      {invoice.invoice_number
                        ? `#${invoice.invoice_number}`
                        : ""}
                    </Button>
                  ) : (
                    /* UPLOAD INVOICE */
                    <div className="mt-3 space-y-2">
                      <div className="grid gap-2 sm:grid-cols-2">
                        <input
                          className={inputClassName()}
                          placeholder="Invoice number (optional)"
                          value={
                            invoiceNumbers[
                              delivery.id
                            ] ?? ""
                          }
                          onChange={(event) =>
                            setInvoiceNumbers(
                              (current) => ({
                                ...current,
                                [delivery.id]:
                                  event.target.value,
                              }),
                            )
                          }
                        />

                        <input
                          accept="application/pdf,image/*"
                          type="file"
                          className="block w-full text-sm"
                          onChange={(event) =>
                            setInvoiceFiles(
                              (current) => ({
                                ...current,
                                [delivery.id]:
                                  event.target.files?.[0] ??
                                  null,
                              }),
                            )
                          }
                        />
                      </div>

                      <Button
                        disabled={
                          uploadInvoice.isPending
                        }
                        onClick={() =>
                          void handleUploadInvoice(
                            delivery.id,
                          )
                        }
                        size="sm"
                      >
                        <Upload className="mr-2 size-4" />

                        {uploadInvoice.isPending
                          ? "Uploading..."
                          : "Upload Invoice"}
                      </Button>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-sm text-slate-500">
              No deliveries recorded yet.
            </p>
          )}
        </section>

        {/* ADD DELIVERY */}
        {remaining > 0 && (
          <section className="space-y-3 rounded-2xl border border-sky-100 bg-sky-50/60 p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2">
              <CalendarDays className="size-5 text-sky-600" />

              <h3 className="font-semibold">
                Add Delivery
              </h3>
            </div>

            <Field
              label={`Delivered amount (remaining ${formatCurrency(
                remaining,
              )})`}
            >
              <input
                className={inputClassName()}
                min="0.01"
                max={remaining}
                step="0.01"
                type="number"
                value={deliveredAmount}
                onChange={(event) =>
                  setDeliveredAmount(
                    event.target.value,
                  )
                }
              />
            </Field>

            <Field label="Delivery date">
              <input
                className={inputClassName()}
                type="date"
                value={deliveryDate}
                onChange={(event) =>
                  setDeliveryDate(
                    event.target.value,
                  )
                }
              />
            </Field>

            <Field label="Expected next delivery date (optional)">
              <input
                className={inputClassName()}
                type="date"
                value={expectedDeliveryDate}
                onChange={(event) =>
                  setExpectedDeliveryDate(
                    event.target.value,
                  )
                }
              />
            </Field>

            <Field label="Remarks (optional)">
              <textarea
                className={`${inputClassName()} min-h-24`}
                value={remarks}
                onChange={(event) =>
                  setRemarks(event.target.value)
                }
              />
            </Field>

            <Button
              disabled={createDelivery.isPending}
              onClick={() =>
                void handleAddDelivery()
              }
              className="w-full"
            >
              {createDelivery.isPending
                ? "Saving delivery..."
                : "Save Delivery"}
            </Button>
          </section>
        )}

        {/* FULLY DELIVERED */}
        {query.data?.summary.status ===
          "fully_delivered" && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
            This order is fully delivered.
          </div>
        )}

        {/* FEEDBACK */}
        {feedback && (
          <div
            className={`rounded-xl border p-3 text-sm ${
              feedback.error
                ? "border-rose-200 bg-rose-50 text-rose-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            {feedback.text}
          </div>
        )}
      </div>
    </Drawer>
  );
}