import fs from "fs/promises";
import { parse as csvParse } from "csv-parse/sync";
import * as xlsx from "xlsx";

export async function parseBulkFile(filePath, originalName) {
  const lower = originalName.toLowerCase();

  if (lower.endsWith(".xlsx") || lower.endsWith(".xls")) {
    const wb = xlsx.readFile(filePath);
    const sheetName = wb.SheetNames[0];
    const sheet = wb.Sheets[sheetName];
    return xlsx.utils.sheet_to_json(sheet, { defval: "" });
  }

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
