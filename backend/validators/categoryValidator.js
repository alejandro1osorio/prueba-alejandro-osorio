import Joi from "joi";

const onlyLettersAndSpaces = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;

export const createCategorySchema = Joi.object({
  nombre: Joi.string()
    .trim()
    .min(1)
    .max(50)
    .pattern(onlyLettersAndSpaces)
    .required()
    .messages({
      "any.required": "El nombre es obligatorio",
      "string.empty": "El nombre es obligatorio",
      "string.min": "El nombre es obligatorio",
      "string.max": "El nombre no puede superar 50 caracteres",
      "string.pattern.base": "El nombre solo puede contener letras y espacios (sin números)"
    }),

  descripcion: Joi.string()
    .max(255)
    .allow("", null)
    .messages({
      "string.max": "La descripción no puede superar 255 caracteres"
    }),

  activo: Joi.boolean().optional()
});

export const updateCategorySchema = Joi.object({
  nombre: Joi.string()
    .trim()
    .min(1)
    .max(50)
    .pattern(onlyLettersAndSpaces)
    .optional()
    .messages({
      "string.empty": "El nombre no puede estar vacío",
      "string.max": "El nombre no puede superar 50 caracteres",
      "string.pattern.base": "El nombre solo puede contener letras y espacios (sin números)"
    }),

  descripcion: Joi.string()
    .max(255)
    .allow("", null)
    .optional()
    .messages({
      "string.max": "La descripción no puede superar 255 caracteres"
    }),

  activo: Joi.boolean().optional()
});
