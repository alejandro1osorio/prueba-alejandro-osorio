import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as categoryController from "../controllers/categoryController.js";

const router = Router();

router.get("/", asyncHandler(categoryController.listCategories));
router.post("/", asyncHandler(categoryController.createCategory));
router.put("/:id", asyncHandler(categoryController.updateCategory));
router.delete("/:id", asyncHandler(categoryController.deleteCategory));

export default router;
