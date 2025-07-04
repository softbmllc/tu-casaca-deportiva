// src/components/MobileFilterDrawer.tsx
import React from "react";
import { Dialog } from "@headlessui/react";
import { useTranslation } from "react-i18next";
import { Category } from "../data/types";
import SidebarFilter from "./SidebarFilter";

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  selectedCategory: string;
  setSelectedCategory: React.Dispatch<React.SetStateAction<string>>;
  selectedSubcategory: string;
  setSelectedSubcategory: React.Dispatch<React.SetStateAction<string>>;
  renderCategoryName?: (category: Category) => React.ReactNode;
}

export default function MobileFilterDrawer({
  isOpen,
  onClose,
  categories,
  selectedCategory,
  setSelectedCategory,
  selectedSubcategory,
  setSelectedSubcategory,
  renderCategoryName,
}: MobileFilterDrawerProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50 md:hidden">
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full bg-white shadow-xl overflow-y-auto">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-bold">{t("shop.filterBy")}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-sm">
            {t("shop.close")}
          </button>
        </div>
        <div className="p-4 pb-10">
          <SidebarFilter
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedSubcategory={selectedSubcategory}
            setSelectedSubcategory={setSelectedSubcategory}
            renderCategoryName={renderCategoryName}
            isMobile={true}
          />
        </div>
      </div>
    </Dialog>
  );
}