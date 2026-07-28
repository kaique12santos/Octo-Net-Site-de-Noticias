/**
 * Valida a autenticidade de um CPF brasileiro utilizando o cálculo matemático oficial.
 * @param {string} cpf - O CPF a ser validado (com ou sem máscara)
 * @returns {boolean} - Retorna true se for válido, false se for inválido
 */
export const validarCPF = (cpf) => {
  // 1. Remove qualquer caractere que não seja número (pontos, traços, espaços)
  cpf = cpf.replace(/[^\d]+/g, '');

  // 2. Verifica se está vazio ou se não tem 11 dígitos
  if (cpf === '' || cpf.length !== 11) return false;

  // 3. Elimina CPFs inválidos conhecidos (números repetidos que enganam o cálculo)
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  // 4. Cálculo do primeiro dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let resto = 11 - (soma % 11);
  let digitoVerificador1 = (resto === 10 || resto === 11) ? 0 : resto;

  if (digitoVerificador1 !== parseInt(cpf.charAt(9))) return false;

  // 5. Cálculo do segundo dígito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf.charAt(i)) * (11 - i);
  }
  resto = 11 - (soma % 11);
  let digitoVerificador2 = (resto === 10 || resto === 11) ? 0 : resto;

  if (digitoVerificador2 !== parseInt(cpf.charAt(10))) return false;

  return true;
};