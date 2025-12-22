import CryptoJS from 'crypto-js';

/**
 * Converte uma senha em hash MD5 para envio seguro (backend legacy/n8n).
 * @param {string} password - A senha em texto plano
 * @returns {string} - O hash MD5 da senha
 */
export const hashPassword = (password) => {
    if (!password) return '';
    return CryptoJS.MD5(password).toString();
};
