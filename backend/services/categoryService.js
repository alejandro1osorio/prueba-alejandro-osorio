import { ApiError } from "../utils/apiError.js";
import * as categoryRepository from "../repositories/categoryRepository.js";

export async function listCategories({ activo } = {}) {
  return categoryRepository.list({ activo });
}

export async function createCategory(data) {
  const exists = await categoryRepository.findByName(data.nombre);
  if (exists) throw new ApiError(409, "Ya existe una categoría con ese nombre");

  const id = await categoryRepository.create(data);
  return categoryRepository.getById(id);
}

export async function updateCategory(id, data) {
  const current = await categoryRepository.getById(id);
  if (!current) throw new ApiError(404, "Categoría no encontrada");

  const exists = await categoryRepository.findByName(data.nombre);
  if (exists && exists.idCategoria !== id) {
    throw new ApiError(409, "Ya existe una categoría con ese nombre");
  }

  await categoryRepository.update(id, data);
  return categoryRepository.getById(id);
}

export async function softDeleteCategory(id) {
  const current = await categoryRepository.getById(id);
  if (!current) throw new ApiError(404, "Categoría no encontrada");

  await categoryRepository.softDelete(id);
}
