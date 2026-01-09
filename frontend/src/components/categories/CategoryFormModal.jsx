import { Modal, Form, Input, Switch } from "antd";
import { useEffect } from "react";

export default function CategoryFormModal({ open, onClose, onSubmit, initialValues, loading }) {
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

  const handleOk = async () => {
    const values = await form.validateFields();
    onSubmit(values);
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
          rules={[{ required: true, message: "El nombre es obligatorio" }]}
        >
          <Input maxLength={50} />
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
