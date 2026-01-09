import Joi from "joi";

export const createProductSchema = Joi.object({
  nombre: Joi.string().max(50).required(),
  descripcion: Joi.string().max(500).allow("", null),
  sku: Joi.string().max(60).allow("", null),
  precio: Joi.number().greater(0).required(),
  stock: Joi.number().integer().min(0).default(0),
  activo: Joi.boolean().optional(),
  idCategoria: Joi.number().integer().required()
});

export const updateProductSchema = Joi.object({
  nombre: Joi.string().max(50).required(),
  descripcion: Joi.string().max(500).allow("", null),
  sku: Joi.string().max(60).allow("", null),
  precio: Joi.number().greater(0).required(),
  stock: Joi.number().integer().min(0).default(0),
  activo: Joi.boolean().optional(),
  idCategoria: Joi.number().integer().required()
});
