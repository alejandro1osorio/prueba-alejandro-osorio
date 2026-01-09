import { Menu } from "antd";
import { AppstoreOutlined, TagsOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const selectedKey = location.pathname.startsWith("/categorias")
    ? "categorias"
    : "productos";

  return (
    <Menu
      theme="dark"
      mode="horizontal"
      selectedKeys={[selectedKey]}
      items={[
        { key: "productos", icon: <AppstoreOutlined />, label: "Productos", onClick: () => navigate("/productos") },
        { key: "categorias", icon: <TagsOutlined />, label: "Categorías", onClick: () => navigate("/categorias") }
      ]}
    />
  );
}
