import { Upload, Button, Space } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import Swal from "sweetalert2";

import { http } from "../../api/http.js";
import { notifyError, notifySuccess } from "../../utils/notify.js";

export default function ProductBulkUpload({ onDone }) {
  const beforeUpload = async (file) => {
    const result = await Swal.fire({
      title: "¿Cargar masivo?",
      text: "Se insertarán los productos válidos. Se reportarán errores por fila.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, cargar",
      cancelButtonText: "Cancelar"
    });

    if (!result.isConfirmed) return Upload.LIST_IGNORE;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await http.post("/api/productosMasivo", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      const { insertados, fallidos, errores } = res.data;

      notifySuccess(`Carga completada: insertados ${insertados}, fallidos ${fallidos}`);

      if (errores?.length) {
        Swal.fire({
          title: "Errores de carga",
          html: `<pre style="text-align:left;white-space:pre-wrap;">${JSON.stringify(errores.slice(0, 20), null, 2)}</pre>`,
          icon: "warning"
        });
      }

      onDone?.();
    } catch (e) {
      notifyError(e.message);
    }

    return Upload.LIST_IGNORE; // evita que AntD suba por su cuenta
  };

  return (
    <Space>
      <Upload beforeUpload={beforeUpload} showUploadList={false} accept=".csv,.xlsx,.xls">
        <Button icon={<UploadOutlined />}>Carga masiva (XLSX)</Button>
      </Upload>
    </Space>
  );
}
