import { Button, Col, Input, InputNumber, Row, Select, Space, Switch } from "antd";
import { useEffect, useState } from "react";

export default function ProductFilters({ categories, value, onChange, onApply, onReset, loading }) {
  const [local, setLocal] = useState(value);

  useEffect(() => setLocal(value), [value]);

  const setField = (k, v) => {
    const next = { ...local, [k]: v };
    setLocal(next);
    onChange(next);
  };

  return (
    <>
      <Row gutter={[12, 12]}>
        <Col xs={24} md={8}>
          <Input
            placeholder="Buscar por nombre..."
            value={local.search || ""}
            onChange={(e) => setField("search", e.target.value)}
            allowClear
          />
        </Col>

        <Col xs={24} md={6}>
          <Select
            style={{ width: "100%" }}
            placeholder="Categoría"
            value={local.idCategoria ?? undefined}
            onChange={(v) => setField("idCategoria", v)}
            allowClear
            options={(categories || []).map((c) => ({ value: c.idCategoria, label: c.nombre }))}
          />
        </Col>

        <Col xs={12} md={4}>
          <InputNumber
            style={{ width: "100%" }}
            placeholder="Precio min"
            min={0}
            value={local.precioMin ?? undefined}
            onChange={(v) => setField("precioMin", v)}
          />
        </Col>

        <Col xs={12} md={4}>
          <InputNumber
            style={{ width: "100%" }}
            placeholder="Precio max"
            min={0}
            value={local.precioMax ?? undefined}
            onChange={(v) => setField("precioMax", v)}
            onBlur={() => {}}
          />
        </Col>

        <Col xs={24} md={2} style={{ display: "flex", alignItems: "center" }}>
          <Space>
            <Switch
              checked={local.activo ?? false}
              onChange={(v) => setField("activo", v)}
            />
            <span>Activo</span>
          </Space>
        </Col>
      </Row>

      <Space style={{ marginTop: 12 }}>
        <Button type="primary" onClick={onApply} loading={loading}>
          Aplicar
        </Button>
        <Button onClick={onReset} disabled={loading}>
          Limpiar
        </Button>
      </Space>
    </>
  );
}
