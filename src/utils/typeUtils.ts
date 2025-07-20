// src/utils/typeUtils.ts

export const normalizeTipo = (tipo: string | { value: string } | undefined): string => {
    if (!tipo) return '';
    return typeof tipo === 'string' ? tipo.toLowerCase().trim() : tipo.value?.toLowerCase().trim() || '';
  };

export const getTipos = (tipo: string | string[] | undefined): string[] => {
  if (!tipo) return [];
  return Array.isArray(tipo) ? tipo : [tipo];
};