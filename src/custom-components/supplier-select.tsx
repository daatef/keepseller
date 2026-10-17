'use client';
import React, { useState } from "react";
import Select from "react-select";
import { useTranslation } from "@/src/lib/useTranslation";
import { useParams } from "next/navigation";

interface Supplier {
  id: number;
  name: string;
}

interface SupplierSelectProps {
  suppliers: Supplier[];
  onSelect: (id: number | null) => void;
}

export default function SupplierSelect({ suppliers, onSelect }: SupplierSelectProps) {
  const [selected, setSelected] = useState<{ value: number; label: string } | null>(null);
  const { lang } = useParams();
  const t = useTranslation((lang as "en" | "ar"| "fr" | "de") || "en");

  const options = suppliers.map((s) => ({
    value: s.id,
    label: s.name,
  }));

  const handleChange = (option: any) => {
    setSelected(option);
    onSelect(option ? option.value : null);
  };

  return (
    <Select
      value={selected}
      onChange={handleChange}
      options={options}
      placeholder={t("selectSupplier") || "Select Supplier"}
      isClearable

      classNames={{
        control: () =>
          "relative rounded-xl secondary-colors shadow-md transition-all duration-200 hover:shadow-lg",
        
        menu: () =>
          "relative rounded-xl secondary-colors shadow-xl mt-2 overflow-hidden",

        option: ({ isSelected, isFocused }) =>
          `relative cursor-pointer px-3 py-2 text-sm transition-all duration-150
          ${
            isSelected
              ? "third-colors font-semibold"
              : isFocused
              ? "secondary-colors opacity-80"
              : "secondary-colors"
          }`,

        singleValue: () => "font-medium",
        placeholder: () => "opacity-60",
        clearIndicator: () => "opacity-70 hover:opacity-100",
        dropdownIndicator: () => "opacity-70 hover:opacity-100",
      }}

      styles={{
  control: (base, state) => ({
    ...base,
    minHeight: 42,
    backgroundColor: "var(--secondary-background-color)",
    color: "var(--secondary-text-color)",
    borderColor: state.isFocused
      ? "var(--third-background-color)"
      : "transparent",
    boxShadow: state.isFocused
      ? "0 0 0 1px var(--third-background-color)"
      : "none",
    outline: "none",
    "&:hover": {
      borderColor: "var(--third-background-color)",
    },
  }),

        menu: (base) => ({
          ...base,
          zIndex: 9999,
          backgroundColor: "var(--secondary-background-color)",
          border: "#fff",
        }),

        option: (base, state) => ({
          ...base,
          backgroundColor: state.isSelected
            ? "var(--third-background-color)"
            : state.isFocused
            ? "var(--secondary-background-color)"
            : "var(--secondary-background-color)",

          color: state.isSelected
            ? "var(--third-text-color)"
            : "var(--secondary-text-color)",

          cursor: "pointer",
        }),

        singleValue: (base) => ({
          ...base,
          color: "var(--secondary-text-color)",
        }),

        placeholder: (base) => ({
          ...base,
          color: "var(--secondary-text-color)",
          opacity: 0.6,
        }),

        clearIndicator: (base) => ({
          ...base,
          color: "var(--secondary-text-color)",
          cursor: "pointer",
        }),

        dropdownIndicator: (base) => ({
          ...base,
          color: "var(--secondary-text-color)",
          cursor: "pointer",
        }),


        input: (base) => ({
  ...base,
  color: "var(--secondary-text-color)",
}),


valueContainer: (base) => ({
  ...base,
  backgroundColor: "var(--secondary-background-color)",
}),

      }}
    />
  );
}