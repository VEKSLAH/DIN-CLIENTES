import React from "react";

interface CardProps {
  children: React.ReactNode;
  logoSrc?: string;
  title?: string;
}

const Card: React.FC<CardProps> = ({ children, logoSrc, title }) => {
  return (
    <div
      style={{
    width: "95%",
    margin: "20px auto",
    backgroundColor: "#dc2626",
    borderRadius: "20px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
    overflow: "hidden",
  }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "16px",
          backgroundColor: "#b91c1c",
        }}
      >
        {logoSrc && (
          <img
            src={logoSrc}
            alt="Logo"
            style={{ height: "24px", width: "24px", objectFit: "contain" }}
          />
        )}
        {title && (
          <h2
            style={{
              color: "white",
              fontSize: "1.5rem",
              fontWeight: "bold",
            }}
          >
            {title}
          </h2>
        )}
      </div>

      {/* Separador */}
      <div style={{ borderBottom: "1px solid #991b1b" }}></div>

      {/* Contenido */}
      <div style={{ padding: "16px", backgroundColor: "#dc2626", color: "white" }}>
        <div
          style={{
            backgroundColor: "#ffffff",
            color: "#1f2937",
            borderRadius: "12px",
            padding: "16px",
            boxShadow: "inset 0 2px 6px rgba(0,0,0,0.15)",
            overflowX: "auto",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default Card;
