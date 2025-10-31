import React from "react";

interface CardProps {
  children: React.ReactNode;
  logoSrc?: string;
  title?: string;
}

const Card: React.FC<CardProps> = ({ children, logoSrc, title }) => {
  return (
    <div className="w-full max-w-8xl mx-auto my-6 bg-linear-to-b from-red-600 to-red-700 rounded-2xl shadow-md overflow-hidden border border-red-800/40 relative">
      <div className="flex items-center justify-between px-5 py-3 bg-red-700/90 border-b border-red-800/30 relative">
        <div className="flex items-center gap-3">
          {logoSrc && (
            <img
              src={logoSrc}
              alt="Logo"
              className="h-9 w-9 object-contain rounded bg-white/10 p-1"
            />
          )}
          {title && (
            <h2 className="text-white text-lg sm:text-xl font-semibold tracking-wide truncate">
              {title}
            </h2>
          )}
        </div>
        <div className="flex flex-col items-end text-white text-xs sm:text-sm gap-1 bg-white/20 backdrop-blur-sm px-3 py-2 rounded-xl shadow-md">
          <div className="flex space-x-2">
            <a
              href="https://din.com.ar/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:underline"
            >
              din.com.ar
            </a>
            <div>|</div>
            <a
              href="https://mail.google.com/mail/?view=cm&fs=1&to=ventas@din.com.ar"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:underline"
            >
              ventas@din.com.ar
            </a>
          </div>
          <span>Intendente Carro 432, Neuquén</span>
          <a
            href="https://wa.me/542994608210"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:underline"
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
              alt="WhatsApp"
              className="h-4 w-4"
            />
            +54 9 2994 60-8210
          </a>
        </div>
      </div>
      <div className="p-3 sm:p-4 bg-red-600/90 text-white">
        <div className="bg-white text-gray-800 rounded-xl p-4 sm:p-5 shadow-inner overflow-x-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Card;
