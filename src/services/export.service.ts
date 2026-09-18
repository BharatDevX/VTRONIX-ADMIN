

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export function exportCSV(
  filename: string,
  rows: Record<string, any>[]
) {
  const worksheet = XLSX.utils.json_to_sheet(rows);

  const csv = XLSX.utils.sheet_to_csv(worksheet);

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;",
  });

  saveAs(blob, filename);
}

export function exportExcel(
  filename: string,
  rows: Record<string, any>[]
) {
  const worksheet =
    XLSX.utils.json_to_sheet(rows);

  const workbook =
    XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Report"
  );

  XLSX.writeFile(workbook, filename);
}

export function printReport() {
  window.print();
}
export function printTableReport(
  title: string,
  subtitle: string,
  columns: Array<{ key: string; label: string }>,
  rows: Array<Record<string, unknown>>,
) {
  const popup = window.open("", "_blank", "width=1200,height=800");
  if (!popup) {
    window.print();
    return;
  }

  const escapeHtml = (value: unknown) => String(value ?? "—")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

  popup.document.write(`<!doctype html><html><head><title>${escapeHtml(title)}</title><style>
    @page{size:A4 landscape;margin:14mm}body{font-family:Arial,Helvetica,sans-serif;color:#172033;margin:0}
    .header{border-bottom:3px solid #0f172a;padding-bottom:14px;margin-bottom:18px}.brand{font-size:22px;font-weight:800;letter-spacing:.4px}
    h1{font-size:20px;margin:5px 0}.sub{font-size:12px;color:#64748b}.meta{font-size:11px;color:#64748b;margin-top:8px}
    table{width:100%;border-collapse:collapse;font-size:10px}th{background:#0f172a;color:white;text-align:left;padding:8px;border:1px solid #dbe2ea}td{padding:7px;border:1px solid #dbe2ea;vertical-align:top}tr:nth-child(even){background:#f8fafc}
    .footer{margin-top:14px;font-size:10px;color:#64748b;text-align:right}@media print{.no-print{display:none}}
  </style></head><body><div class="header"><div class="brand">VETRONIX</div><h1>${escapeHtml(title)}</h1><div class="sub">${escapeHtml(subtitle)}</div><div class="meta">Generated: ${escapeHtml(new Date().toLocaleString("en-IN"))} · Records: ${rows.length}</div></div>
  <table><thead><tr>${columns.map((column) => `<th>${escapeHtml(column.label)}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${columns.map((column) => `<td>${escapeHtml(row[column.key])}</td>`).join("")}</tr>`).join("")}</tbody></table><div class="footer">Vetronix ERP · Admin Report</div></body></html>`);
  popup.document.close();
  popup.focus();
  window.setTimeout(() => { popup.print(); popup.close(); }, 250);
}


export type SalesInvoicePdfData = {
  sale_date: string;
  employee_name: string;
  dealer_name: string;
  hq: string;
  invoice_no: string;
  credit_period: number | null;
  due_date: string | null;
  total_amount: number;
  products: Array<{
    product_name: string;
    pack_size: string;
    box_count: number;
    quantity: number;
    rate: number;
    amount: number;
  }>;
};

export function renderSalesInvoicePdf(popup: Window, sale: SalesInvoicePdfData) {
  const escapeHtml = (value: unknown) => String(value ?? "—")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

  const money = (value: number) => `₹${Number(value ?? 0).toFixed(2)}`;
  const productRows = sale.products.length
    ? sale.products.map((product) => `<tr>
        <td>${escapeHtml(product.product_name)}</td>
        <td>${escapeHtml(product.pack_size)}</td>
        <td class="num">${escapeHtml(product.box_count)}</td>
        <td class="num">${escapeHtml(product.quantity)}</td>
        <td class="num">${money(product.rate)}</td>
        <td class="num">${money(product.amount)}</td>
      </tr>`).join("")
    : `<tr><td colspan="6" class="empty">No product details recorded for this invoice.</td></tr>`;

  popup.document.open();
  popup.document.write(`<!doctype html><html><head><title>Vetronix Sales Invoice - ${escapeHtml(sale.invoice_no)}</title><style>
    @page{size:A4 portrait;margin:14mm}body{font-family:Arial,Helvetica,sans-serif;color:#172033;margin:0;font-size:11px}
    .brand{font-size:24px;font-weight:800;letter-spacing:1px;text-align:center;margin-bottom:18px}
    .top{display:grid;grid-template-columns:1fr 1fr;gap:8px 28px;margin-bottom:18px;padding-bottom:12px;border-bottom:2px solid #172033}
    .meta-label{font-size:9px;text-transform:uppercase;letter-spacing:.7px;color:#64748b;font-weight:700}.meta-value{font-size:12px;font-weight:700;margin-top:3px}
    table{width:100%;border-collapse:collapse;font-size:10px}th{background:#172033;color:#fff;text-align:left;padding:8px;border:1px solid #dbe2ea}td{padding:7px;border:1px solid #dbe2ea;vertical-align:top}tr:nth-child(even){background:#f8fafc}.num{text-align:right;white-space:nowrap}
    .total td{font-weight:800;font-size:11px;background:#eef2f7}.total-label{text-align:right}.empty{text-align:center;color:#64748b;padding:14px}
    .footer{margin-top:18px;font-size:9px;color:#64748b;text-align:right}@media print{.no-print{display:none}}
  </style></head><body>
    <div class="brand">VETRONIX</div>
    <div class="top">
      <div><div class="meta-label">Date</div><div class="meta-value">${escapeHtml(sale.sale_date)}</div></div>
      <div><div class="meta-label">Employee Name</div><div class="meta-value">${escapeHtml(sale.employee_name)}</div></div>
      <div><div class="meta-label">Dealer</div><div class="meta-value">${escapeHtml(sale.dealer_name)}</div></div>
      <div><div class="meta-label">Head Quarter</div><div class="meta-value">${escapeHtml(sale.hq)}</div></div>
      <div><div class="meta-label">Invoice Number</div><div class="meta-value">${escapeHtml(sale.invoice_no)}</div></div>
      <div><div class="meta-label">Credit Period</div><div class="meta-value">${sale.credit_period == null ? "—" : `${escapeHtml(sale.credit_period)} days`}</div></div>
      <div><div class="meta-label">Due Date</div><div class="meta-value">${escapeHtml(sale.due_date || "—")}</div></div>
    </div>
    <table><thead><tr><th>Product Details</th><th>Pack Size</th><th>Box Qty</th><th>Quantity</th><th>Rate</th><th>Amount</th></tr></thead><tbody>
      ${productRows}
      <tr class="total"><td colspan="5" class="total-label">Total</td><td class="num">${money(sale.total_amount)}</td></tr>
    </tbody></table>
    <div class="footer">Vetronix ERP · Sales Invoice</div>
  </body></html>`);
  popup.document.close();
  popup.focus();
  window.setTimeout(() => { popup.print(); popup.close(); }, 250);
}

export type EmployeeTrackingPdfData = {
  employeeName: string;
  date: string;
  startTime: string;
  endTime: string;
  startLocation: string;
  middleLocations: string[];
  endLocation: string;
  totalKm: number;
  totalMonthlyKm: number;
  vehicleType: string;
};

export function renderEmployeeTrackingPdf(popup: Window, data: EmployeeTrackingPdfData) {
  const escapeHtml = (value: unknown) => String(value ?? "—")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

  const middle = data.middleLocations.length
    ? data.middleLocations
        .map((location, index) => `${index + 1}. ${escapeHtml(location)}`)
        .join("<br>")
    : "—";

  popup.document.open();
  popup.document.write(`<!doctype html><html><head><title>Vetronix Live Tracking - ${escapeHtml(data.employeeName)} - ${escapeHtml(data.date)}</title><style>
    @page{size:A4 portrait;margin:14mm}body{font-family:Arial,Helvetica,sans-serif;color:#172033;margin:0;font-size:11px}
    .brand{font-size:24px;font-weight:800;letter-spacing:1px;text-align:center;margin-bottom:14px}
    .header-meta{display:grid;grid-template-columns:1fr 1fr;gap:8px 24px;margin-bottom:18px;padding-bottom:12px;border-bottom:2px solid #172033}
    .meta-label{font-size:9px;text-transform:uppercase;letter-spacing:.7px;color:#64748b;font-weight:700}.meta-value{font-size:12px;font-weight:700;margin-top:3px}
    table{width:100%;border-collapse:collapse;font-size:10px;table-layout:fixed}th{background:#172033;color:#fff;text-align:left;padding:8px;border:1px solid #dbe2ea}td{padding:8px;border:1px solid #dbe2ea;vertical-align:top;word-break:break-word;line-height:1.45}
    .label{font-weight:800;background:#f1f5f9;width:20%}.value{width:30%}.middle{white-space:normal}.km{font-weight:800}
    .footer{margin-top:18px;font-size:9px;color:#64748b;text-align:right}@media print{.no-print{display:none}}
  </style></head><body>
    <div class="brand">VETRONIX</div>
    <div class="header-meta">
      <div><div class="meta-label">Employee Name</div><div class="meta-value">${escapeHtml(data.employeeName)}</div></div>
      <div><div class="meta-label">Date</div><div class="meta-value">${escapeHtml(data.date)}</div></div>
    </div>
    <table>
      <tbody>
        <tr><td class="label">Start Time</td><td class="value">${escapeHtml(data.startTime)}</td><td class="label">End Time</td><td class="value">${escapeHtml(data.endTime)}</td></tr>
        <tr><td class="label">Start Location</td><td class="value">${escapeHtml(data.startLocation)}</td><td class="label">End Location</td><td class="value">${escapeHtml(data.endLocation)}</td></tr>
        <tr><td class="label">Middle Locations</td><td colspan="3" class="middle">${middle}</td></tr>
        <tr><td class="label">Total KM</td><td class="value km">${escapeHtml(data.totalKm.toFixed(2))} km</td><td class="label">Total Monthly KM</td><td class="value km">${escapeHtml(data.totalMonthlyKm.toFixed(2))} km</td></tr>
        <tr><td class="label">Vehicle Type</td><td colspan="3" class="value">${escapeHtml(data.vehicleType)}</td></tr>
      </tbody>
    </table>
    <div class="footer">Vetronix ERP · Employee Live Tracking</div>
  </body></html>`);
  popup.document.close();
  popup.focus();
  window.setTimeout(() => { popup.print(); popup.close(); }, 250);
}

