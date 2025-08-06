export const formatCurrency = (amount) => {
  if (amount == null || amount === '') return 'Rp 0';
  
  const number = parseInt(amount);
  if (isNaN(number)) return 'Rp 0';
  
  return `Rp ${number.toLocaleString('id-ID')}`;
};
