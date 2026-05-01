/**
 * Formata uma data para o padrão brasileiro DD/MM/YYYY
 * sem sofrer interferência do fuso horário local.
 * Útil para campos do tipo 'date' (YYYY-MM-DD).
 */
export const formatDateUTC = (dateString: string | Date | undefined): string => {
  if (!dateString) return '---';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '---';
  
  // Extrai componentes UTC para evitar o shift do fuso horário local
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = date.getUTCFullYear();
  
  return `${day}/${month}/${year}`;
};

/**
 * Formata uma data ISO para exibição com hora em local time
 */
export const formatDateTime = (dateString: string | Date | undefined): string => {
  if (!dateString) return '---';
  const date = new Date(dateString);
  return date.toLocaleString('pt-BR');
};
