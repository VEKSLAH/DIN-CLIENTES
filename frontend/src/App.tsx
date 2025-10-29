import Articulos from "./components/Articulos";
import Card from "./components/Card";
import Logo from "./assets/Logo-din.jpg";

export default function App() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f3f4f6",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: "24px",
      }}
    >
      <Card logoSrc={Logo} title="Listado de Artículos">
        <Articulos />
      </Card>
    </div>
  );
}
