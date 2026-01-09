import { useEffect, useMemo, useState } from "react";
import {
  Card,
  Col,
  Input,
  Pagination,
  Row,
  Space,
  Spin,
  Tag,
  Typography,
  Empty
} from "antd";
import Swal from "sweetalert2";
import { http } from "../api/http.js";

const { Title, Text } = Typography;

export default function CatalogPage() {
  const [loading, setLoading] = useState(false);

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  const [search, setSearch] = useState("");

  const params = useMemo(
    () => ({
      page,
      pageSize,
      activo: true, // ✅ SOLO productos activos
      search: search.trim() || undefined,
      sortBy: "fechaCreacion",
      sortDir: "desc"
    }),
    [page, pageSize, search]
  );

  const fetchCatalog = async () => {
    setLoading(true);
    try {
      // ✅ TU BACKEND ES /api/productos
      const { data } = await http.get("/api/productos", { params });
      setItems(data?.items || []);
      setTotal(data?.total || 0);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error cargando catálogo",
        text: err?.message || "No se pudo cargar el catálogo.",
        confirmButtonText: "Entendido"
      });
      console.error("Catalog fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const formatPrice = (value) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return value;
    return n.toLocaleString("es-CO", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  };

  return (
    <Space style={{ width: "100%" }} size="middle" orientation="vertical">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap"
        }}
      >
        <div>
          <Title level={3} style={{ margin: 0 }}>
            Catálogo
          </Title>
          <Text type="secondary">Grid de productos activos</Text>
        </div>

        <Input
          style={{ width: 320, maxWidth: "100%" }}
          placeholder="Buscar por nombre..."
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          allowClear
        />
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 24 }}>
          <Spin />
        </div>
      ) : items.length === 0 ? (
        <Empty description="No hay productos activos para mostrar" />
      ) : (
        <>
          <Row gutter={[16, 16]}>
            {items.map((p) => (
              <Col key={p.idProducto} xs={24} sm={12} md={8} lg={6}>
                <Card
                  hoverable
                  title={p.nombre}
                  extra={<Tag color="green">Activo</Tag>}
                  style={{ height: "100%" }}
                >
                  <Space style={{ width: "100%" }} size={6} orientation="vertical">
                    <Text type="secondary">
                      {p.categoriaNombre || "Sin categoría"}
                    </Text>

                    {p.descripcion ? (
                      <Text>
                        {p.descripcion.length > 90
                          ? `${p.descripcion.slice(0, 90)}...`
                          : p.descripcion}
                      </Text>
                    ) : (
                      <Text type="secondary">Sin descripción</Text>
                    )}

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginTop: 8
                      }}
                    >
                      <Text strong>Precio:</Text>
                      <Text>${formatPrice(p.precio)}</Text>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <Text strong>Stock:</Text>
                      <Text>{p.stock}</Text>
                    </div>

                    {p.sku ? (
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <Text strong>SKU:</Text>
                        <Text>{p.sku}</Text>
                      </div>
                    ) : null}
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>

          <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
            <Pagination
              current={page}
              pageSize={pageSize}
              total={total}
              showSizeChanger
              pageSizeOptions={[8, 12, 16, 24]}
              onChange={(p, ps) => {
                setPage(p);
                setPageSize(ps);
              }}
              showTotal={(t) => `${t} productos`}
            />
          </div>
        </>
      )}
    </Space>
  );
}
