import { ApiError } from "../utils/apiError.js";
import * as productRepository from "../repositories/productRepository.js";
import * as categoryRepository from "../repositories/categoryRepository.js";

export async function listProducts({ offset, pageSize, filters, sort }) {
  return productRepository.listPaged({ offset, pageSize, filters, sort });
}

export async function getProductById(id) {
  const item = await productRepository.getById(id);
  if (!item) throw new ApiError(404, "Producto no encontrado");
  return item;
}

export async function createProduct(data) {
  const category = await categoryRepository.getById(data.idCategoria);
  if (!category) throw new ApiError(400, "La categoría no existe");

  const id = await productRepository.create(data);
  return productRepository.getById(id);
}

export async function updateProduct(id, data) {
  const current = await productRepository.getById(id);
  if (!current) throw new ApiError(404, "Producto no encontrado");

  const category = await categoryRepository.getById(data.idCategoria);
  if (!category) throw new ApiError(400, "La categoría no existe");

  await productRepository.update(id, data);
  return productRepository.getById(id);
}

export async function softDeleteProduct(id) {
  const current = await productRepository.getById(id);
  if (!current) throw new ApiError(404, "Producto no encontrado");
  await productRepository.softDelete(id);
}

export async function bulkCreateProducts(rows) {
  const normalized = rows.map((r) => {
    const obj = {};
    for (const [k, v] of Object.entries(r)) obj[String(k).trim().toLowerCase()] = v;
    return obj;
  });

  const errors = [];
  const toInsert = [];

  normalized.forEach((r, idx) => {
    const rowNumber = idx + 2; 

    const nombre = String(r.nombre ?? "").trim();
    const precio = Number(r.precio);
    const stock = r.stock === "" || r.stock === undefined ? 0 : Number(r.stock);

    const rawCat =
      r.idcategoria ?? r.id_categoria ?? r.idCategoria ?? r.categoria ?? r.idcat;

    const idCategoria = Number(rawCat);

    if (!nombre) errors.push({ fila: rowNumber, motivo: "Nombre es obligatorio" });
    else if (!Number.isFinite(precio) || precio <= 0) errors.push({ fila: rowNumber, motivo: "Precio inválido (> 0)" });
    else if (!Number.isInteger(idCategoria) || idCategoria <= 0) errors.push({ fila: rowNumber, motivo: "IdCategoria inválido" });
    else if (!Number.isFinite(stock) || stock < 0) errors.push({ fila: rowNumber, motivo: "Stock inválido (>= 0)" });
    else {
      const activoVal = r.activo;
      const activo =
        activoVal === "" || activoVal === undefined
          ? true
          : ["true", "1", "yes"].includes(String(activoVal).toLowerCase());

      toInsert.push({
        nombre,
        descripcion: String(r.descripcion ?? "").trim() || null,
        sku: String(r.sku ?? "").trim() || null,
        precio,
        stock,
        activo,
        idCategoria
      });
    }
  });

  const repoResult = await productRepository.bulkInsertValidatingCategories(toInsert);

  return {
    insertados: repoResult.inserted,
    fallidos: errors.length + repoResult.failed,
    errores: [...errors, ...repoResult.errors]
  };
}
