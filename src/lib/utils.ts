/**
 * Valida um número de telefone brasileiro.
 * Aceita formatos com ou sem DDI, com ou sem parênteses no DDD, com ou sem hífen.
 * Ex: +55 (11) 99999-9999, 11999999999, etc.
 * @param phone O número de telefone a ser validado.
 * @returns `true` se o telefone for válido, `false` caso contrário.
 */
export function isValidBrazilianPhone(phone: string): boolean {
    if (!phone) return false;
    // Remove todos os caracteres que não são dígitos
    const digitsOnly = phone.replace(/\D/g, '');

    // Regex para validar telefones brasileiros (fixo e móvel) com 10 ou 11 dígitos.
    // DDI 55 opcional
    const phoneRegex = /^(?:(55))?(\d{2})(\d{4,5})(\d{4})$/;
    
    return phoneRegex.test(digitsOnly);
} 