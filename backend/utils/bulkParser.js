import fs from "fs/promises";
import { parse as csvParse } from "csv-parse/sync";
import XLSX from "xlsx";

export async function parseBulkFile(filePath, originalName) {
  const lower = originalName.toLowerCase();

  // XLSX 
  if (lower.endsWith(".xlsx") || lower.endsWith(".xls")) {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    return rows;
  }

  // ✅ CSV
  if (lower.endsWith(".csv")) {
    const content = await fs.readFile(filePath, "utf8");
    return csvParse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });
  }

  return null;
}
