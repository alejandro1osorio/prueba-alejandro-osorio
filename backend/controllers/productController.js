import fs from "fs/promises";

import { ApiError } from "../utils/apiError.js";
import { getPagination } from "../utils/pagination.js";
import { parseBoolean } from "../utils/parseBoolean.js";
import { getSort } from "../utils/sort.js";
import { parseBulkFile } from "../utils/bulkParser.js";

import { createProductSchema, updateProductSchema } from "../validators/productValidator.js";
import * as productService from "../services/productService.js";

/**
 * LISTADO PRINCIPAL DE PRODUCTOS
 * - Paginación real backend
 * - Filtros backend
 * - Ordenamiento backend
 */
export async function listProducts(req, res) {
  const { page, pageSize, offset } = getPagination(req.query);

  // 🔐 Blindaje total para MySQL LIMIT / OFFSET
  const safePageSize =
    Number.isFinite(pageSize) && pageSize > 0 ? pageSize : 10;

  const safeOffset =
    Number.isFinite(offset) && offset >= 0 ? offset : 0;

  // 🔍 Filtros
  const search =
    req.query.search !== undefined && String(req.query.search).trim() !== ""
      ? String(req.query.search).trim()
      : undefined;

  const idCategoria =
    req.query.idCategoria !== undefined &&
    req.query.idCategoria !== null &&
    String(req.query.idCategoria).trim() !== ""
      ? Number(req.query.idCategoria)
      : undefined;

  const precioMin =
    req.query.precioMin !== undefined &&
    req.query.precioMin !== null &&
    String(req.query.precioMin).trim() !== ""
      ? Number(req.query.precioMin)
      : undefined;

  const precioMax =
    req.query.precioMax !== undefined &&
    req.query.precioMax !== null &&
    String(req.query.precioMax).trim() !== ""
      ? Number(req.query.precioMax)
      : undefined;

  const activo = parseBoolean(req.query.activo);

  // ↕️ Ordenamiento seguro (whitelist)
  const { sortBy, sortDir } = getSort(
    req.query,
    ["nombre", "precio", "fechaCreacion"],
    { sortBy: "fechaCreacion", sortDir: "desc" }
  );

  const result = await productService.listProducts({
    offset: safeOffset,
    pageSize: safePageSize,
    filters: {
      search,
      idCategoria,
      precioMin,
      precioMax,
      activo
    },
    sort: { sortBy, sortDir }
  });

  res.json({
    success: true,
    items: result.items,
    total: result.total,
    page,
    pageSize: safePageSize
  });
}

/**
 * OBTENER PRODUCTO POR ID
 */
export async function getProductById(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ApiError(400, "Id inválido");
  }

  const item = await productService.getProductById(id);
  res.json({ success: true, item });
}

/**
 * CREAR PRODUCTO
 */
export async function createProduct(req, res) {
  const { error, value } = createProductSchema.validate(req.body, {
    abortEarly: false
  });
  if (error) {
    throw new ApiError(400, "Validación fallida", error.details);
  }

  const created = await productService.createProduct(value);
  res.status(201).json({ success: true, item: created });
}

/**
 * ACTUALIZAR PRODUCTO
 */
export async function updateProduct(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ApiError(400, "Id inválido");
  }

  const { error, value } = updateProductSchema.validate(req.body, {
    abortEarly: false
  });
  if (error) {
    throw new ApiError(400, "Validación fallida", error.details);
  }

  const updated = await productService.updateProduct(id, value);
  res.json({ success: true, item: updated });
}

/**
 * ELIMINAR PRODUCTO (SOFT DELETE)
 */
export async function deleteProduct(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ApiError(400, "Id inválido");
  }

  await productService.softDeleteProduct(id);
  res.json({ success: true, message: "Producto eliminado" });
}

/**
 * CARGA MASIVA DE PRODUCTOS (CSV / XLSX)
 */
export async function bulkCreateProducts(req, res) {
  if (!req.file) {
    throw new ApiError(
      400,
      "Debe enviar un archivo xlsx o csv en el campo 'file'"
    );
  }

  const filePath = req.file.path;
  const originalName = req.file.originalname;

  try {
    const rows = await parseBulkFile(filePath, originalName);
    if (!rows) {
      throw new ApiError(400, "Formato inválido. Use .xlsx o .csv");
    }

    const result = await productService.bulkCreateProducts(rows);

    res.json({
      success: true,
      ...result
    });
  } finally {
    // 🧹 Limpieza del archivo temporal
    await fs.unlink(filePath).catch(() => {});
  }
}
