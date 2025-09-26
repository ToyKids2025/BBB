/**
 * Configuração de Autenticação - BBB Link Enhancer
 * APENAS ALEXANDRE TEM ACESSO!
 */

// Credenciais do Alexandre
export const AUTH_CONFIG = {
  // CPF do Alexandre (único autorizado)
  VALID_CPF: '07917165973',

  // Senha do Alexandre
  VALID_PASSWORD: 'Alex.2025@',

  // Token de sessão
  SESSION_TOKEN: 'bbb_alex_2025_secure_token_' + Date.now(),

  // Dados do usuário
  USER_DATA: {
    username: 'Alexandre',
    cpf: '07917165973',
    email: 'alexandre@bbbrasil.com',
    role: 'super_admin',
    fullName: 'Alexandre - Administrador BBB',
    permissions: ['all'],
    createdAt: '2024-01-01',
    lastLogin: new Date().toISOString()
  },

  // API Key para o Worker
  API_KEY: 'sk_alex_bbb_2025_secure_key',

  // Tempo de expiração da sessão (24 horas)
  SESSION_EXPIRY: 24 * 60 * 60 * 1000
};

// Função para validar CPF
export function validateCPF(cpf) {
  // Remove caracteres não numéricos
  cpf = cpf.replace(/\D/g, '');

  // Deve ter 11 dígitos
  if (cpf.length !== 11) return false;

  // Validação básica de CPF (algoritmo simplificado)
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  return true;
}

// Função para validar senha
export function validatePassword(password) {
  // Senha deve ter pelo menos 8 caracteres
  if (password.length < 8) return false;

  // Deve conter letra maiúscula, minúscula, número e caractere especial
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
}

// Função para verificar autenticação
export function checkAuth(cpf, password) {
  // Limpa o CPF
  const cleanCPF = cpf.replace(/\D/g, '');

  // Verifica se é o Alexandre
  if (cleanCPF === AUTH_CONFIG.VALID_CPF && password === AUTH_CONFIG.VALID_PASSWORD) {
    return {
      success: true,
      token: AUTH_CONFIG.SESSION_TOKEN,
      user: AUTH_CONFIG.USER_DATA
    };
  }

  return {
    success: false,
    error: 'CPF ou senha incorretos. Apenas Alexandre tem acesso!'
  };
}

// Função para logout
export function logout() {
  localStorage.removeItem('bb_token');
  localStorage.removeItem('bb_user');
  sessionStorage.clear();
  window.location.href = '/';
}

// Função para verificar se está logado
export function isAuthenticated() {
  const token = localStorage.getItem('bb_token');
  const user = localStorage.getItem('bb_user');

  if (!token || !user) return false;

  try {
    const userData = JSON.parse(user);
    // Verifica se é o Alexandre
    return userData.cpf === AUTH_CONFIG.VALID_CPF;
  } catch {
    return false;
  }
}

export default AUTH_CONFIG;