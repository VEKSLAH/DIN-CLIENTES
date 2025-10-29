import React from "react";

interface CardProps {
  children: React.ReactNode;
  logoSrc?: string;
  title?: string;
}

const Card: React.FC<CardProps> = ({ children, logoSrc, title }) => {
  return (
    <div className="w-[95%] mx-auto my-6 bg-red-600 rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 bg-red-700 border-b border-red-800">
        {logoSrc && (
          <img
            src={logoSrc}
            alt="Logo"
            className="h-8 w-8 object-contain filter brightness-110"
          />
        )}
        {title && (
          <h2 className="text-white text-xl font-semibold tracking-wide">
            {title}
          </h2>
        )}
      </div>

      {/* Contenido */}
      <div className="p-4 bg-red-600 text-white">
        <div className="bg-white text-gray-800 rounded-xl p-4 shadow-inner overflow-x-auto custom-scroll">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Card;
