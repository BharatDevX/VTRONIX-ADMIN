

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
