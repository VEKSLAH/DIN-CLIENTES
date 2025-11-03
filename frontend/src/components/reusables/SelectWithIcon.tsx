"use client";

import { useState, useRef, useEffect } from "react";
import type { UseFormRegisterReturn, FieldValues } from "react-hook-form";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface SelectWithIconProps<T extends FieldValues> {
  register: UseFormRegisterReturn;
  options: string[];
  value?: string;
  labelDefault?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
  className?: string;
}

export default function SelectWithIcon<T extends FieldValues>({
  register,
  options,
  value,
  labelDefault = "",
  disabled = false,
  onChange,
  className = "",
}: SelectWithIconProps<T>) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown si se hace click afuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (disabled) return;
    setOpen((prev) => !prev);
  };

  const handleSelect = (val: string) => {
    if (disabled) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    register.onChange({ target: { value: val } } as any); // actualizar RHF
    if (onChange) onChange(val);
    setOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${className}`}
      aria-disabled={disabled}
    >
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className="w-full border border-gray-300 rounded-md px-3 py-2 text-left text-sm bg-white flex justify-between items-center focus:outline-none focus:ring-1 focus:ring-gray-400"
      >
        <span>{value || labelDefault}</span>
        <svg
          className={`w-4 h-4 transition-transform duration-300 ${
            open ? "rotate-180" : "rotate-0"
          }`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <ul className="absolute z-10 w-full mt-1 max-h-60 overflow-auto border border-gray-300 bg-white rounded-md shadow-lg">
          {options.map((opt) => (
            <li
              key={opt}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
              onClick={() => handleSelect(opt)}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
