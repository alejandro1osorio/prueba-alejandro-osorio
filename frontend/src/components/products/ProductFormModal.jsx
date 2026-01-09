import { Modal, Form, Input, InputNumber, Select, Switch } from "antd";
import { useEffect } from "react";

export default function ProductFormModal({
  open,
  onClose,
  onSubmit,
  initialValues,
  categories,
  loading
}) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        nombre: initialValues?.nombre ?? "",
        descripcion: initialValues?.descripcion ?? "",
        sku: initialValues?.sku ?? "",
        precio: initialValues?.precio ?? null,
        stock: initialValues?.stock ?? 0,
        idCategoria: initialValues?.idCategoria ?? undefined,
        activo: initialValues?.activo ?? true
      });
    }
  }, [open, initialValues, form]);

  const handleOk = async () => {
    const values = await form.validateFields();
    onSubmit(values);
  };

  return (
    <Modal
      open={open}
      title={initialValues ? "Editar Producto" : "Nuevo Producto"}
      onCancel={onClose}
      onOk={handleOk}
      confirmLoading={loading}
      okText="Guardar"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Nombre"
          name="nombre"
          rules={[{ required: true, message: "El nombre es obligatorio" }]}
        >
          <Input maxLength={50} />
        </Form.Item>

        <Form.Item label="Descripción" name="descripcion">
          <Input.TextArea maxLength={500} rows={3} />
        </Form.Item>

        <Form.Item label="SKU (opcional)" name="sku">
          <Input maxLength={60} />
        </Form.Item>

        <Form.Item
          label="Precio"
          name="precio"
          rules={[
            { required: true, message: "El precio es obligatorio" },
            { type: "number", min: 0.01, message: "Debe ser mayor a 0" }
          ]}
        >
          <InputNumber style={{ width: "100%" }} min={0.01} step={0.01} />
        </Form.Item>

        <Form.Item
          label="Stock"
          name="stock"
          rules={[
            { required: true, message: "El stock es obligatorio" },
            { type: "number", min: 0, message: "No puede ser negativo" }
          ]}
        >
          <InputNumber style={{ width: "100%" }} min={0} step={1} />
        </Form.Item>

        <Form.Item
          label="Categoría"
          name="idCategoria"
          rules={[{ required: true, message: "La categoría es obligatoria" }]}
        >
          <Select
            placeholder="Selecciona una categoría"
            options={(categories || []).map((c) => ({ value: c.idCategoria, label: c.nombre }))}
          />
        </Form.Item>

        <Form.Item label="Activo" name="activo" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
}
