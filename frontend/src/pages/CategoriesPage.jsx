import { useEffect, useMemo, useState } from "react";
import { Button, Card, Space, Table, Tag } from "antd";
import Swal from "sweetalert2";

import { http } from "../api/http.js";
import { notifyError, notifySuccess } from "../utils/notify.js";
import { bitToBool } from "../utils/bitToBool.js";
import CategoryFormModal from "../components/categories/CategoryFormModal.jsx";

export default function CategoriesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await http.get("/api/categorias");
      const list = (res.data.items || []).map((c) => ({ ...c, activo: bitToBool(c.activo) }));
      setItems(list);
    } catch (e) {
      notifyError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

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
      title: "¿Eliminar categoría?",
      text: "Se desactivará (soft delete).",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
    });

    if (!result.isConfirmed) return;

    try {
      await http.delete(`/api/categorias/${row.idCategoria}`);
      notifySuccess("Categoría eliminada");
      fetchCategories();
    } catch (e) {
      notifyError(e.message);
    }
  };

  const handleSubmit = async (values) => {
    setSaving(true);
    try {
      if (editing) {
        await http.put(`/api/categorias/${editing.idCategoria}`, values);
        notifySuccess("Categoría actualizada");
      } else {
        await http.post("/api/categorias", values);
        notifySuccess("Categoría creada");
      }
      setModalOpen(false);
      fetchCategories();
    } catch (e) {
      notifyError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const columns = useMemo(
    () => [
      { title: "ID", dataIndex: "idCategoria", width: 80 },
      { title: "Nombre", dataIndex: "nombre" },
      { title: "Descripción", dataIndex: "descripcion" },
      {
        title: "Activo",
        dataIndex: "activo",
        width: 110,
        render: (v) => (v ? <Tag color="green">Sí</Tag> : <Tag color="red">No</Tag>)
      },
      { title: "Creación", dataIndex: "fechaCreacion", width: 180 },
      { title: "Modificación", dataIndex: "fechaModificacion", width: 180 },
      {
        title: "Acciones",
        width: 160,
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
      title="Categorías"
      extra={<Button type="primary" onClick={openCreate}>Nueva</Button>}
    >
      <Table
        rowKey="idCategoria"
        columns={columns}
        dataSource={items}
        loading={loading}
        pagination={false}
      />

      <CategoryFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialValues={editing}
        loading={saving}
      />
    </Card>
  );
}
