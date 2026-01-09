import Joi from "joi";

// ✅ Solo letras (incluye tildes/ñ) y espacios
const onlyLettersAndSpaces = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;

// ✅ Permite número como number real o como string tipo "123.45" (con punto)
const numberWithDot = Joi.alternatives()
  .try(
    Joi.number(),
    Joi.string().trim().pattern(/^\d+(\.\d+)?$/)
  )
  .messages({
    "alternatives.match": "Debe ser un número válido (usa punto para decimales, ej: 12.50)"
  });

// ✅ Entero (para stock e idCategoria). Acepta number o string "123"
const integerNumber = Joi.alternatives()
  .try(
    Joi.number().integer(),
    Joi.string().trim().pattern(/^\d+$/)
  )
  .messages({
    "alternatives.match": "Debe ser un número entero válido"
  });

export const createProductSchema = Joi.object({
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
    .max(500)
    .allow("", null)
    .messages({
      "string.max": "La descripción no puede superar 500 caracteres"
    }),

  sku: Joi.string()
    .max(60)
    .allow("", null)
    .messages({
      "string.max": "El SKU no puede superar 60 caracteres"
    }),

  precio: numberWithDot
    .custom((value, helpers) => {
      const n = typeof value === "string" ? Number(value) : value;
      if (!Number.isFinite(n)) return helpers.error("number.base");
      if (n <= 0) return helpers.error("number.min");
      return n; // ✅ normaliza a number
    })
    .required()
    .messages({
      "any.required": "El precio es obligatorio",
      "number.base": "El precio debe ser numérico (usa punto para decimales)",
      "number.min": "El precio debe ser mayor a 0"
    }),

  stock: integerNumber
    .custom((value, helpers) => {
      const n = typeof value === "string" ? Number(value) : value;
      if (!Number.isFinite(n) || !Number.isInteger(n)) return helpers.error("number.base");
      if (n < 0) return helpers.error("number.min");
      return n;
    })
    .default(0)
    .messages({
      "number.base": "El stock debe ser un número entero",
      "number.min": "El stock no puede ser negativo"
    }),

  activo: Joi.boolean().optional(),

  idCategoria: integerNumber
    .custom((value, helpers) => {
      const n = typeof value === "string" ? Number(value) : value;
      if (!Number.isFinite(n) || !Number.isInteger(n) || n <= 0) return helpers.error("number.base");
      return n;
    })
    .required()
    .messages({
      "any.required": "La categoría es obligatoria",
      "number.base": "La categoría es obligatoria"
    })
});

export const updateProductSchema = Joi.object({
  // ✅ En update NO debe ser required para permitir editar solo 1 campo
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
    .max(500)
    .allow("", null)
    .optional()
    .messages({
      "string.max": "La descripción no puede superar 500 caracteres"
    }),

  sku: Joi.string()
    .max(60)
    .allow("", null)
    .optional()
    .messages({
      "string.max": "El SKU no puede superar 60 caracteres"
    }),

  precio: numberWithDot
    .custom((value, helpers) => {
      const n = typeof value === "string" ? Number(value) : value;
      if (!Number.isFinite(n)) return helpers.error("number.base");
      if (n <= 0) return helpers.error("number.min");
      return n;
    })
    .optional()
    .messages({
      "number.base": "El precio debe ser numérico (usa punto para decimales)",
      "number.min": "El precio debe ser mayor a 0"
    }),

  stock: integerNumber
    .custom((value, helpers) => {
      const n = typeof value === "string" ? Number(value) : value;
      if (!Number.isFinite(n) || !Number.isInteger(n)) return helpers.error("number.base");
      if (n < 0) return helpers.error("number.min");
      return n;
    })
    .optional()
    .messages({
      "number.base": "El stock debe ser un número entero",
      "number.min": "El stock no puede ser negativo"
    }),

  activo: Joi.boolean().optional(),

  idCategoria: integerNumber
    .custom((value, helpers) => {
      const n = typeof value === "string" ? Number(value) : value;
      if (!Number.isFinite(n) || !Number.isInteger(n) || n <= 0) return helpers.error("number.base");
      return n;
    })
    .optional()
    .messages({
      "number.base": "La categoría es obligatoria"
    })
});
