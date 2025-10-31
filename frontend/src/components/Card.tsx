import React from "react";

interface CardProps {
  children: React.ReactNode;
  logoSrc?: string;
  title?: string;
}

const Card: React.FC<CardProps> = ({ children, logoSrc, title }) => {
  return (
    <div className="w-full max-w-8xl mx-auto my-6 bg-linear-to-b from-red-600 to-red-700 rounded-2xl shadow-md overflow-hidden border border-red-800/40">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3 bg-red-700/90 border-b border-red-800/30">
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

      {/* Contenido */}
      <div className="p-3 sm:p-4 bg-red-600/90 text-white">
        <div className="bg-white text-gray-800 rounded-xl p-4 sm:p-5 shadow-inner overflow-x-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Card;
