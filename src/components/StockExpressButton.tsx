// src/components/StockExpressButton.tsx
import { Rocket } from "lucide-react";

interface Props {
  isSelected: boolean;
  onClick: () => void;
  extraClasses?: string;
}

export default function StockExpressButton({ isSelected, onClick, extraClasses = "" }: Props) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2 rounded-lg transition flex items-center gap-2 justify-start ring-1 ring-transparent ${
        isSelected
          ? "bg-black text-white font-semibold ring-black"
          : "hover:bg-gray-100 text-gray-800"
      } ${extraClasses}`}
    >
      <Rocket size={16} className="text-red-600" />
      <span>Stock</span>
      <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full shadow font-semibold ml-1">
        Express
      </span>
    </button>
  );
}