import { bitToBool } from "./bitToBool.js";

export function normalizeProduct(p) {
  return {
    ...p,
    activo: bitToBool(p.activo),
    // precio puede venir string "123.45"
    precio: typeof p.precio === "string" ? Number(p.precio) : p.precio
  };
}
