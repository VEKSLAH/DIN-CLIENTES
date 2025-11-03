import IconVekslah from "../assets/IconVeksla.webp";

const DevelopedBy = () => {
  return (
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
  );
};

export default DevelopedBy;
