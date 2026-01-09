import { ApiError } from "../utils/apiError.js";
import { parseBoolean } from "../utils/parseBoolean.js";
import { createCategorySchema, updateCategorySchema } from "../validators/categoryValidator.js";
import * as categoryService from "../services/categoryService.js";

export async function listCategories(req, res) {
  const activo = parseBoolean(req.query.activo);
  const items = await categoryService.listCategories({ activo });
  res.json({ success: true, items });
}

export async function createCategory(req, res) {
  const { error, value } = createCategorySchema.validate(req.body, { abortEarly: false });
  if (error) throw new ApiError(400, "Validación fallida", error.details);

  const created = await categoryService.createCategory(value);
  res.status(201).json({ success: true, item: created });
}

export async function updateCategory(req, res) {
  const id = Number(req.params.id);
  if (!id) throw new ApiError(400, "Id inválido");

  const { error, value } = updateCategorySchema.validate(req.body, { abortEarly: false });
  if (error) throw new ApiError(400, "Validación fallida", error.details);

  const updated = await categoryService.updateCategory(id, value);
  res.json({ success: true, item: updated });
}

export async function deleteCategory(req, res) {
  const id = Number(req.params.id);
  if (!id) throw new ApiError(400, "Id inválido");

  await categoryService.softDeleteCategory(id);
  res.json({ success: true, message: "Categoría eliminada" });
}
