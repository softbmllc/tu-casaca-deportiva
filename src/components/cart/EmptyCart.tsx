// src/components/cart/EmptyCart.tsx

import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { FiShoppingCart } from "react-icons/fi";
import { motion } from "framer-motion";
import { HiArrowNarrowRight } from "react-icons/hi";

const EmptyCart: React.FC = () => {
  const { t } = useTranslation();

  return (
    <motion.div
      className="max-w-xl mx-auto py-20 px-4 text-center text-gray-700"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex justify-center mb-8">
        <div className="w-24 h-24 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center shadow-sm">
          <FiShoppingCart size={40} className="text-gray-400" />
        </div>
      </div>
      <h2 className="text-3xl font-semibold mb-3">{t("cart.emptyTitle")}</h2>
      <p className="mb-6 text-base text-gray-500">{t("cart.emptySubtitlePro")}</p>
      <Link
        to="/shop"
        className="inline-flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-md font-medium hover:bg-gray-900 transition-all hover:scale-105 hover:shadow-lg transform"
      >
        {t("cart.goToShop")}
        <HiArrowNarrowRight className="text-sm" />
      </Link>
    </motion.div>
  );
};

export default EmptyCart;