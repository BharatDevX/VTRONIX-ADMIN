

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