import { useEffect, useMemo, useState } from "react";
import { Button, Card, Space, Table, Tag } from "antd";
import Swal from "sweetalert2";

import { http } from "../api/http.js";
import { notifyError, notifySuccess } from "../utils/notify.js";
import { normalizeProduct } from "../utils/normalizeProduct.js";
import { bitToBool } from "../utils/bitToBool.js";

import ProductFilters from "../components/products/ProductFilters.jsx";
import ProductFormModal from "../components/products/ProductFormModal.jsx";
import ProductBulkUpload from "../components/products/ProductBulkUpload.jsx";

export default function ProductsPage() {
  // categorías (para filtro y form)
  const [categories, setCategories] = useState([]);

  // tabla
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);

  // estado tabla
  const [loading, setLoading] = useState(false);

  // query state (backend-driven)
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [filters, setFilters] = useState({
    search: "",
    idCategoria: null,
    precioMin: null,
    precioMax: null,
    activo: false // por defecto, no filtrar activos; pero switch controla
  });

  const [useActivoFilter, setUseActivoFilter] = useState(false); // para que "activo" sea opcional

  const [sort, setSort] = useState({ sortBy: "fechaCreacion", sortDir: "desc" });

  // modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await http.get("/api/categorias");
      const list = (res.data.items || []).map((c) => ({ ...c, activo: bitToBool(c.activo) }));
      setCategories(list);
    } catch (e) {
      notifyError(e.message);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        pageSize,
        sortBy: sort.sortBy,
        sortDir: sort.sortDir
      };

      if (filters.search?.trim()) params.search = filters.search.trim();
      if (filters.idCategoria) params.idCategoria = filters.idCategoria;
      if (filters.precioMin !== null && filters.precioMin !== undefined) params.precioMin = filters.precioMin;
      if (filters.precioMax !== null && filters.precioMax !== undefined) params.precioMax = filters.precioMax;

      // activo opcional (extra)
      if (useActivoFilter) params.activo = filters.activo;

      const res = await http.get("/api/productos", { params });

      const list = (res.data.items || []).map(normalizeProduct);
      setItems(list);
      setTotal(Number(res.data.total || 0));
    } catch (e) {
      notifyError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // cada vez que cambie page/pageSize/sort => re-consultar backend
  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, sort]);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setModalOpen(true);
  };

  const handleDelete = async (row) => {
    const result = await Swal.fire({
      title: "¿Eliminar producto?",
      text: "Se desactivará (soft delete).",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
    });

    if (!result.isConfirmed) return;

    try {
      await http.delete(`/api/productos/${row.idProducto}`);
      notifySuccess("Producto eliminado");
      fetchProducts();
    } catch (e) {
      notifyError(e.message);
    }
  };

  const handleSubmit = async (values) => {
    setSaving(true);
    try {
      if (editing) {
        await http.put(`/api/productos/${editing.idProducto}`, values);
        notifySuccess("Producto actualizado");
      } else {
        await http.post("/api/productos", values);
        notifySuccess("Producto creado");
      }
      setModalOpen(false);
      fetchProducts();
    } catch (e) {
      notifyError(e.message);
    } finally {
      setSaving(false);
    }
  };

  // AntD Table change => backend sort + pagination
  const handleTableChange = (pagination, _filters, sorter) => {
    const nextPage = pagination.current || 1;
    const nextPageSize = pagination.pageSize || 10;

    // sorter puede ser array o object
    const s = Array.isArray(sorter) ? sorter[0] : sorter;

    let sortBy = sort.sortBy;
    let sortDir = sort.sortDir;

    if (s?.field && s?.order) {
      // mapeo antd -> api
      sortBy = s.field; // nombre | precio | fechaCreacion
      sortDir = s.order === "ascend" ? "asc" : "desc";
    } else {
      sortBy = "fechaCreacion";
      sortDir = "desc";
    }

    setPage(nextPage);
    setPageSize(nextPageSize);
    setSort({ sortBy, sortDir });
  };

  const applyFilters = () => {
    // Reset page al aplicar filtros
    setPage(1);
    fetchProducts();
  };

  const resetFilters = () => {
    setFilters({ search: "", idCategoria: null, precioMin: null, precioMax: null, activo: false });
    setUseActivoFilter(false);
    setPage(1);
    fetchProducts();
  };

  const columns = useMemo(
    () => [
      { title: "Nombre", dataIndex: "nombre", sorter: true, width: 220 },
      { title: "Categoría", dataIndex: "categoriaNombre", width: 180 },
      {
        title: "Precio",
        dataIndex: "precio",
        sorter: true,
        width: 120,
        render: (v) => `$ ${Number(v || 0).toFixed(2)}`
      },
      { title: "Stock", dataIndex: "stock", width: 100 },
      {
        title: "Activo",
        dataIndex: "activo",
        width: 110,
        render: (v) => (v ? <Tag color="green">Sí</Tag> : <Tag color="red">No</Tag>)
      },
      { title: "Creación", dataIndex: "fechaCreacion", sorter: true, width: 180 },
      { title: "Modificación", dataIndex: "fechaModificacion", width: 180 },
      {
        title: "Acciones",
        width: 170,
        fixed: "right",
        render: (_, row) => (
          <Space>
            <Button onClick={() => openEdit(row)}>Editar</Button>
            <Button danger onClick={() => handleDelete(row)}>
              Eliminar
            </Button>
          </Space>
        )
      }
    ],
    []
  );

  return (
    <Card
      title="Productos"
      extra={
        <Space>
          <ProductBulkUpload onDone={fetchProducts} />
          <Button type="primary" onClick={openCreate}>
            Nuevo
          </Button>
        </Space>
      }
    >
      {/* Filtros */}
      <div style={{ marginBottom: 16 }}>
        <ProductFilters
          categories={categories}
          value={{
            ...filters,
            // Para que "activo" no sea obligatorio, usamos un toggle
            activo: filters.activo
          }}
          onChange={(next) => setFilters(next)}
          loading={loading}
          onApply={() => {
            // si el usuario tocó el switch de activo, asumimos que quiere filtrar por activo
            // (si no quieres esto automático, dime y lo ajusto)
            applyFilters();
          }}
          onReset={resetFilters}
        />

        {/* Toggle extra para filtro Activo opcional */}
        <div style={{ marginTop: 10 }}>
          <Space>
            <Tag color={useActivoFilter ? "blue" : "default"}>
              Filtro Activo: {useActivoFilter ? "ON" : "OFF"}
            </Tag>
            <Button size="small" onClick={() => setUseActivoFilter((v) => !v)}>
              {useActivoFilter ? "Desactivar filtro Activo" : "Activar filtro Activo"}
            </Button>
          </Space>
        </div>
      </div>

      {/* Tabla */}
      <Table
        rowKey="idProducto"
        columns={columns}
        dataSource={items}
        loading={loading}
        onChange={handleTableChange}
        scroll={{ x: 1200 }}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true
        }}
      />

      <ProductFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialValues={editing}
        categories={categories}
        loading={saving}
      />
    </Card>
  );
}
