import React from "react";
import motorImg from "../assets/motorImg.png";

interface CardProps {
  children: React.ReactNode;
  logoSrc?: string;
  title?: string;
}

const Card: React.FC<CardProps> = ({ children, logoSrc, title }) => {
  return (
    <div className="w-full max-w-8xl mx-auto my-6 rounded-2xl shadow-md overflow-hidden border border-red-800/40">
      <div className="relative rounded-t-2xl overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(199,0,0,0.4) 0%, rgba(199,0,0,0) 50%), url(${motorImg})`,
            backgroundSize: "cover",
            backgroundPosition: "center bottom",
            backgroundRepeat: "no-repeat",
          }}
        />

        <div className="relative z-10 px-5 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 pb-3">
            <div className="flex items-center gap-3 shrink-0">
              {logoSrc && (
                <img
                  src={logoSrc}
                  alt="Logo"
                  className="h-16 w-16 object-contain bg-white/10 p-1 rounded-xl"
                />
              )}
              {title && (
                <h2 className="text-white text-lg sm:text-xl font-semibold tracking-wide truncate">
                  {title}
                </h2>
              )}
            </div>
            <div className="flex flex-col sm:items-end text-white text-xs sm:text-sm gap-1 bg-white/20 backdrop-blur-sm px-3 py-2 rounded-xl shadow-md w-full sm:w-auto mt-3 sm:mt-0">
              <div className="flex flex-col sm:flex-row sm:space-x-2 gap-1 sm:gap-0">
                <a
                  href="https://din.com.ar/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:underline"
                >
                  din.com.ar
                </a>
                <span className="hidden sm:inline">|</span>
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

          <div className="border-b-2 border-red-800/30 rounded-full mt-3"></div>
        </div>

        <div className="relative z-10 p-3 sm:p-4 text-white">
          <div className="bg-white text-gray-800 rounded-xl p-4 sm:p-5 shadow-inner overflow-x-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;
