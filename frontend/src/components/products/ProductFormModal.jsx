import { Modal, Form, Input, InputNumber, Select, Switch } from "antd";
import { useEffect } from "react";
import Swal from "sweetalert2";

export default function ProductFormModal({
  open,
  onClose,
  onSubmit,
  initialValues,
  categories,
  loading
}) {
  const [form] = Form.useForm();

  // ✅ Validaciones requeridas
  const onlyLettersAndSpaces = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
  const singleCharAllowed = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]$/;

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
    try {
      // 1) Validación AntD (UX)
      const values = await form.validateFields();

      // 2) Enviar al padre (que llama al backend)
      await onSubmit(values);
    } catch (err) {
      // Si falla validateFields, AntD ya marca el campo en rojo.
      // Mostramos Swal solo si viene del backend (axios error)
      const data = err?.response?.data;

      if (data) {
        const message = data.message || "No se pudo guardar el producto.";

        const details = Array.isArray(data.details) ? data.details : [];
        const detailMsg = details.length
          ? details.map((d) => d.message).join("\n")
          : "";

        // Mensajes más intuitivos
        const finalMsg =
          detailMsg.includes("letras y espacios")
            ? "El nombre solo puede contener letras y espacios (sin números)."
            : detailMsg.includes("punto para decimales")
            ? "Precio inválido. Usa números y punto para decimales (ej: 12.50)."
            : detailMsg.includes("stock")
            ? "Stock inválido. Debe ser un número entero (0 o más)."
            : detailMsg.includes("categoría") || detailMsg.includes("categoria")
            ? "Debes seleccionar una categoría."
            : detailMsg || message;

        Swal.fire({
          icon: "error",
          title: "Revisa los datos",
          text: finalMsg,
          confirmButtonText: "Entendido"
        });
      }
    }
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
          rules={[
            { required: true, message: "El nombre es obligatorio" },
            {
              pattern: onlyLettersAndSpaces,
              message: "Solo se permiten letras y espacios (sin números)"
            }
          ]}
        >
          <Input
            maxLength={50}
            placeholder="Ej: Jabón Corporal"
            onKeyPress={(e) => {
              if (!singleCharAllowed.test(e.key)) e.preventDefault();
            }}
            onPaste={(e) => {
              const text = (e.clipboardData || window.clipboardData).getData("text");
              if (text && !onlyLettersAndSpaces.test(text.trim())) e.preventDefault();
            }}
          />
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
            { type: "number", min: 0.01, message: "El precio debe ser mayor a 0" }
          ]}
        >
          <InputNumber
            style={{ width: "100%" }}
            min={0.01}
            step={0.01}
            stringMode={false}
            controls
            placeholder="Ej: 12.50"
          />
        </Form.Item>

        <Form.Item
          label="Stock"
          name="stock"
          rules={[
            { required: true, message: "El stock es obligatorio" },
            { type: "number", min: 0, message: "El stock no puede ser negativo" }
          ]}
        >
          <InputNumber
            style={{ width: "100%" }}
            min={0}
            step={1}
            precision={0}
            controls
            placeholder="Ej: 10"
          />
        </Form.Item>

        <Form.Item
          label="Categoría"
          name="idCategoria"
          rules={[{ required: true, message: "La categoría es obligatoria" }]}
        >
          <Select
            placeholder="Selecciona una categoría"
            options={(categories || []).map((c) => ({
              value: c.idCategoria,
              label: c.nombre
            }))}
          />
        </Form.Item>

        <Form.Item label="Activo" name="activo" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
}
