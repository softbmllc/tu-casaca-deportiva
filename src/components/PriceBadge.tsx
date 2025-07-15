// src/components/PriceBadge.tsx

import React from "react";
import { Sparkles, Star } from "lucide-react";

interface PriceBadgeProps {
  variant?: "exclusivo" | "oferta" | "limitado";
}

const badgeStyles: Record<string, string> = {
  exclusivo: "bg-black text-white border-black",
  oferta: "bg-red-600 text-white border-red-700",
  limitado: "bg-yellow-300 text-black border-yellow-500",
};

const badgeIcons: Record<string, React.ReactNode> = {
  exclusivo: <Sparkles size={14} className="mr-1" />,
  oferta: <Star size={14} className="mr-1" />,
  limitado: <Star size={14} className="mr-1" />,
};

const badgeText: Record<string, string> = {
  exclusivo: "Precio Exclusivo",
  oferta: "Oferta",
  limitado: "Edición Limitada",
};

const PriceBadge: React.FC<PriceBadgeProps> = ({ variant = "exclusivo" }) => {
  const style = badgeStyles[variant];
  const icon = badgeIcons[variant];
  const text = badgeText[variant];

  return (
    <div
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border w-fit mb-4 ${style}`}
    >
      {icon}
      {text}
    </div>
  );
};

export default PriceBadge;