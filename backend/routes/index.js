import { Router } from "express";
import multer from "multer";

import categoryRoutes from "./categoryRoutes.js";
import productRoutes from "./productRoutes.js";

import { asyncHandler } from "../utils/asyncHandler.js";
import * as productController from "../controllers/productController.js";

const router = Router();

router.use("/categorias", categoryRoutes);
router.use("/productos", productRoutes);

// Endpoint EXACTO del enunciado: POST /api/productosMasivo
const upload = multer({
  dest: "tmp/",
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

router.post(
  "/productosMasivo",
  upload.single("file"),
  asyncHandler(productController.bulkCreateProducts)
);

export default router;
