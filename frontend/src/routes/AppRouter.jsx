import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "../components/appLayout/AppLayout.jsx";
import ProductsPage from "../pages/ProductsPage.jsx";
import CategoriesPage from "../pages/CategoriesPage.jsx";
import CatalogPage from "../pages/CatalogPage.jsx";

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/productos" replace />} />
        <Route path="/catalogo" element={<CatalogPage />} />
        <Route path="/productos" element={<ProductsPage />} />
        <Route path="/categorias" element={<CategoriesPage />} />
        <Route path="*" element={<Navigate to="/productos" replace />} />
      </Route>
    </Routes>
  );
}
