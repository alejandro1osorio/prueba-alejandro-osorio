import { ApiError } from "../utils/apiError.js";

export function errorHandler(err, req, res, next) {
  // Duplicate key MySQL
  if (err?.code === "ER_DUP_ENTRY") {
    return res.status(409).json({
      success: false,
      message: "Conflicto: registro duplicado",
      details: err.sqlMessage
    });
  }

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      details: err.details ?? null
    });
  }

  console.error("❌ Unhandled error:", err);

  return res.status(500).json({
    success: false,
    message: "Error interno del servidor"
  });
}
