import { Modal, Form, Input, Switch } from "antd";
import { useEffect } from "react";
import Swal from "sweetalert2";

export default function CategoryFormModal({
  open,
  onClose,
  onSubmit,
  initialValues,
  loading
}) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        nombre: initialValues?.nombre ?? "",
        descripcion: initialValues?.descripcion ?? "",
        activo: initialValues?.activo ?? true
      });
    }
  }, [open, initialValues, form]);

  // ✅ Solo letras (incluye tildes/ñ) y espacios
  const onlyLettersAndSpaces = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
  const singleCharAllowed = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]$/;

  const handleOk = async () => {
    try {
      // 1) Validación AntD (UX)
      const values = await form.validateFields();

      // 2) Enviar al padre (que llama al backend)
      await onSubmit(values);
    } catch (err) {
      // Si falla validateFields, AntD ya marca en rojo, no hacemos Swal
      // Solo mostramos Swal cuando viene del backend (axios error)
      const data = err?.response?.data;

      if (data) {
        const message = data.message || "No se pudo guardar la categoría.";

        // Intenta sacar un mensaje específico de Joi
        const details = Array.isArray(data.details) ? data.details : [];
        const detailMsg =
          details.length > 0
            ? details.map((d) => d.message).join("\n")
            : "";

        // Mensaje más intuitivo para el caso de letras/espacios
        const finalMsg =
          detailMsg.includes("letras y espacios") ||
          message.toLowerCase().includes("validación fallida")
            ? "El nombre solo puede contener letras y espacios (sin números)."
            : detailMsg || message;

        Swal.fire({
          icon: "error",
          title: "Revisa el nombre",
          text: finalMsg,
          confirmButtonText: "Entendido"
        });
      }
    }
  };

  return (
    <Modal
      open={open}
      title={initialValues ? "Editar Categoría" : "Nueva Categoría"}
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
            placeholder="Ej: Aseo Personal"
            onKeyPress={(e) => {
              // 🔒 Bloquea números y caracteres especiales al escribir
              if (!singleCharAllowed.test(e.key)) {
                e.preventDefault();
              }
            }}
            onPaste={(e) => {
              // 🔒 Si pega texto con números/caracteres especiales, lo bloquea
              const text = (e.clipboardData || window.clipboardData).getData(
                "text"
              );
              if (text && !onlyLettersAndSpaces.test(text.trim())) {
                e.preventDefault();
              }
            }}
          />
        </Form.Item>

        <Form.Item label="Descripción" name="descripcion">
          <Input.TextArea maxLength={255} rows={3} />
        </Form.Item>

        <Form.Item label="Activo" name="activo" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
}
