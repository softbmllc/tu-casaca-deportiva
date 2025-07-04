// src/utils/customerUtils.ts

import { Client as CustomerData } from "../data/types"; // si tenés un tipo definido para el cliente

export const saveCustomerToFirestore = async (customer: CustomerData, userId?: string) => {
  try {
    const response = await fetch("/api/save-customer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...customer, userId }),
    });

    if (!response.ok) {
      throw new Error("Error al guardar cliente en Firebase");
    }

    return await response.json();
  } catch (error) {
    console.error("Error en saveCustomerToFirestore:", error);
    throw error;
  }
};