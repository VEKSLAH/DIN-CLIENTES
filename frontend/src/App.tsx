import ArticulosWithOrderForm from "./components/ArticulosWithOrderForm";
import Card from "./components/Card";
import Logo from "./assets/Logo-din.jpg";
import ServerStatus from "./components/ServerStatus";
import IconVekslah from "./assets/IconVeksla.webp";
export default function App() {
  return (
    <div className="flex flex-col">
      <div className="min-h-screen flex justify-center items-start py-6 px-3 sm:px-6">
        <Card logoSrc={Logo} title="Distribuidora Integral Neuquén">
          <ArticulosWithOrderForm />
        </Card>
      </div>
      <div className="flex justify-end items-center gap-4 px-4 py-2">
        <ServerStatus />
        <div className="flex items-center gap-2 text-sm text-black/70">
          <a
            href="https://vekslah.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-black transition-colors duration-300"
          >
            <span>Desarrollado por</span>
            <img
              src={IconVekslah}
              alt="Vekslah"
              className="w-6 h-6 object-contain opacity-90 hover:opacity-100 transition-opacity duration-300"
            />
          </a>
        </div>
      </div>
    </div>
  );
} 
