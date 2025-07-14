// src/utils/priceUtils.ts

export const getFinalPrice = (
  product: {
    priceUSD: number;
    discountPriceUSD?: number;
    priceUYU: number;
    discountPriceUYU?: number;
  },
  currency: "USD" | "UYU"
): number => {
  if (currency === "USD") {
    return product.discountPriceUSD ?? product.priceUSD;
  } else {
    return product.discountPriceUYU ?? product.priceUYU;
  }
};