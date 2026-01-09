import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as productController from "../controllers/productController.js";

const router = Router();

router.get("/", asyncHandler(productController.listProducts));
router.get("/:id", asyncHandler(productController.getProductById));
router.post("/", asyncHandler(productController.createProduct));
router.put("/:id", asyncHandler(productController.updateProduct));
router.delete("/:id", asyncHandler(productController.deleteProduct));

export default router;
