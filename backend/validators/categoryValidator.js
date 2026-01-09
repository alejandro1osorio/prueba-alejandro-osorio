import Joi from "joi";

export const createCategorySchema = Joi.object({
  nombre: Joi.string().max(50).required(),
  descripcion: Joi.string().max(255).allow("", null),
  activo: Joi.boolean().optional()
});

export const updateCategorySchema = Joi.object({
  nombre: Joi.string().max(50).required(),
  descripcion: Joi.string().max(255).allow("", null),
  activo: Joi.boolean().optional()
});
