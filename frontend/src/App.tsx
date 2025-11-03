import ArticulosWithOrderForm from "./components/ArticulosWithOrderForm";
import Card from "./components/Card";
import Logo from "./assets/Logo-din.jpg";
import ServerStatus from "./components/ServerStatus";

export default function App() {
  return (
    <div className="flex flex-col">
      <div className="min-h-screen  flex justify-center items-start py-6 px-3 sm:px-6">
        <Card logoSrc={Logo} title="Distribuidora Integral Neuquén">
          <ArticulosWithOrderForm />
        </Card>
      </div>
      <div className="flex justify-end"><ServerStatus /></div>
    </div>
  );
}
