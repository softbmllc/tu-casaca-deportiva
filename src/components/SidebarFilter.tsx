// src/components/SidebarFilter.tsx

import { useEffect, useState } from "react";
import { JSX } from "react/jsx-runtime";
import { useTranslation } from "react-i18next";
import { fetchCategories } from "../firebaseUtils";
import { Category, Subcategory as BaseSubcategory } from "../data/types";

interface ExtendedCategory extends Category {
  orden?: number;
}

interface Subcategory extends BaseSubcategory {
  orden?: number;
}

interface SidebarFilterProps {
  categories: ExtendedCategory[];
  selectedCategory: string;
  setSelectedCategory: React.Dispatch<React.SetStateAction<string>>;
  selectedSubcategory: string;
  setSelectedSubcategory: React.Dispatch<React.SetStateAction<string>>;
  renderCategoryName?: (category: Category) => React.ReactNode;
  isMobile?: boolean; // <-- Add this line
}

export default function SidebarFilter({
  categories,
  selectedCategory,
  setSelectedCategory,
  selectedSubcategory,
  setSelectedSubcategory,
  renderCategoryName,
}: SidebarFilterProps) {
  const { t } = useTranslation();
  const { i18n } = useTranslation();
  const language = i18n.language || "es";

  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null);

  if (!categories || categories.length === 0) {
    return (
      <aside className="mb-10 md:mb-0 md:mr-8">
        <div className="sticky top-24">
          <h3 className="text-lg font-bold mb-4">Filtrar por</h3>
          <p className="text-sm text-gray-500">No hay categorías disponibles.</p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="mb-10 md:mb-0 md:mr-8">
      <div className="sticky top-24">
        <h3 className="text-lg font-bold mb-4">Filtrar por</h3>
        <ul className="space-y-2 text-sm">
          {[...categories]
            .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
            .map((category) => (
            <li key={category.id}>
              <button
                onClick={() => {
                  setExpandedCategoryId(expandedCategoryId === category.id ? null : category.id);
                  setSelectedCategory(category.id);
                  setSelectedSubcategory('');
                }}
                className={`block w-full text-left px-2 py-1 rounded transition ${
                  selectedCategory === category.id
                    ? 'bg-white text-gray-900 font-medium border border-gray-300 rounded-md px-4 py-2 shadow-sm focus:outline-none transition-all relative before:absolute before:left-2 before:top-1/2 before:-translate-y-1/2 before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#FF2D55]'
                    : 'text-gray-800 hover:bg-[#fce8ec] hover:text-gray-900'
                }`}
              >
                {renderCategoryName ? (
                  renderCategoryName(category)
                ) : (
                  <span className="font-bold">
                    {typeof category.name === 'object' ? category.name[language] : category.name || ''}
                  </span>
                )}
              </button>
              {expandedCategoryId === category.id &&
                Array.isArray(category.subcategories) &&
                category.subcategories.length > 0 && (
                  <ul className="ml-4 mt-1 space-y-1 text-sm text-gray-600">
                    {([...(category.subcategories as Subcategory[])])
                      .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
                      .map((sub) => (
                      <li key={sub.id}>
                        <button
                          onClick={() => {
                            setSelectedSubcategory(sub.id);
                            setSelectedCategory('');
                          }}
                          className={`block w-full text-left px-2 py-0.5 rounded text-sm transition ${
                            selectedSubcategory === sub.id
                              ? 'bg-white text-gray-900 font-medium border border-gray-300 rounded-md px-4 py-2 shadow-sm focus:outline-none transition-all relative before:absolute before:left-2 before:top-1/2 before:-translate-y-1/2 before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#FF2D55]'
                              : 'text-gray-600 hover:bg-[#fce8ec] hover:text-gray-900'
                          }`}
                        >
                          {sub.name && typeof sub.name === "object"
                            ? sub.name[language] || sub.name["es"] || ""
                            : sub.name || ""}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
            </li>
          ))}
        </ul>

        {/* Botones de control */}
        <div className="mt-6 space-y-2">
          <button
            onClick={() => {
              setSelectedCategory('');
              setSelectedSubcategory('');
            }}
            className="w-full text-sm bg-[#0F0F0F] text-white hover:bg-[#1a1a1a] py-2 px-4 rounded transition"
          >
            Limpiar filtros
          </button>
          <button
            onClick={() => {
              setSelectedCategory('');
              setSelectedSubcategory('');
            }}
            className="w-full text-sm bg-[#FF2D55] text-white hover:bg-[#e0264b] py-2 px-4 rounded transition"
          >
            Mostrar todo
          </button>
        </div>
      </div>
    </aside>
  );
}