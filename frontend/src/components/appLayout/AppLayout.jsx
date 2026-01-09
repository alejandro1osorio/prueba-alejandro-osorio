import { Layout } from "antd";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar.jsx";

const { Header, Content, Footer } = Layout;

export default function AppLayout() {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header style={{ display: "flex", alignItems: "center" }}>
        <Navbar />
      </Header>

      <Content style={{ padding: 24, maxWidth: 1200, width: "100%", margin: "0 auto" }}>
        <Outlet />
      </Content>

      <Footer style={{ textAlign: "center" }}>
        Prueba Catálogo — React + Ant Design
      </Footer>
    </Layout>
  );
}
