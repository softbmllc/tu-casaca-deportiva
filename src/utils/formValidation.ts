// src/utils/formValidation.ts

export interface CartFormData {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  email: string;
  phone: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: Partial<Record<keyof CartFormData, string>>;
}

export function validateCartForm(data: CartFormData): ValidationResult {
  const errors: Partial<Record<keyof CartFormData, string>> = {};

  if (!data.name?.trim()) {
    errors.name = "El nombre es obligatorio";
  }

  if (!data.address?.trim()) {
    errors.address = "La dirección es obligatoria";
  }

  if (!data.city?.trim()) {
    errors.city = "La ciudad es obligatoria";
  }

  if (!data.state?.trim()) {
    errors.state = "El estado es obligatorio";
  }

  if (!data.zip?.trim() || !/^\d{5}$/.test(data.zip)) {
    errors.zip = "El código postal debe tener 5 dígitos";
  }

  if (!data.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "El email no tiene un formato válido";
  }

  if (!data.phone?.trim() || !/^\d{8,15}$/.test(data.phone)) {
    errors.phone = "Debe contener solo números y tener entre 8 y 15 dígitos.";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
