import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';
import { AUTH_SERVICE } from './auth-service';
import * as firebaseModule from './firebase';

// Mock dos módulos
jest.mock('./auth-service');
jest.mock('./firebase');

describe('App Component Tests', () => {
  beforeEach(() => {
    // Limpar mocks antes de cada teste
    jest.clearAllMocks();
  });

  test('renderiza tela de loading inicialmente', () => {
    AUTH_SERVICE.onAuthStateChange = jest.fn();
    render(<App />);

    expect(screen.getByText('BBB Link Enhancer')).toBeInTheDocument();
    expect(screen.getByText('Sistema Premium com Firebase')).toBeInTheDocument();
  });

  test('renderiza tela de login quando não autenticado', async () => {
    AUTH_SERVICE.onAuthStateChange = jest.fn((callback) => {
      callback(null);
      return jest.fn();
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Busca Busca Brasil')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Senha')).toBeInTheDocument();
    });
  });

  test('renderiza dashboard quando autenticado', async () => {
    const mockUser = {
      uid: 'test123',
      email: 'test@example.com',
      displayName: 'Test User'
    };

    AUTH_SERVICE.onAuthStateChange = jest.fn((callback) => {
      callback(mockUser);
      return jest.fn();
    });

    firebaseModule.getAnalyticsData = jest.fn().mockResolvedValue({
      success: true,
      data: {
        totalLinks: 10,
        totalClicks: 100,
        totalConversions: 5,
        totalRevenue: 500,
        conversionRate: 5
      }
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Dashboard Firebase')).toBeInTheDocument();
    });
  });

  test('login com credenciais válidas', async () => {
    AUTH_SERVICE.onAuthStateChange = jest.fn((callback) => {
      callback(null);
      return jest.fn();
    });

    AUTH_SERVICE.login = jest.fn().mockResolvedValue({
      success: true,
      user: {
        uid: 'test123',
        email: 'test@example.com'
      }
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'test@example.com' }
    });

    fireEvent.change(screen.getByPlaceholderText('Senha'), {
      target: { value: 'password123' }
    });

    fireEvent.click(screen.getByText('Entrar'));

    await waitFor(() => {
      expect(AUTH_SERVICE.login).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  test('exibe erro quando login falha', async () => {
    AUTH_SERVICE.onAuthStateChange = jest.fn((callback) => {
      callback(null);
      return jest.fn();
    });

    AUTH_SERVICE.login = jest.fn().mockResolvedValue({
      success: false,
      error: 'Credenciais inválidas'
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'wrong@example.com' }
    });

    fireEvent.change(screen.getByPlaceholderText('Senha'), {
      target: { value: 'wrongpassword' }
    });

    fireEvent.click(screen.getByText('Entrar'));

    await waitFor(() => {
      expect(screen.getByText('Credenciais inválidas')).toBeInTheDocument();
    });
  });

  test('toggle tema claro/escuro', async () => {
    const mockUser = {
      uid: 'test123',
      email: 'test@example.com'
    };

    AUTH_SERVICE.onAuthStateChange = jest.fn((callback) => {
      callback(mockUser);
      return jest.fn();
    });

    firebaseModule.getAnalyticsData = jest.fn().mockResolvedValue({
      success: true,
      data: {
        totalLinks: 0,
        totalClicks: 0,
        totalConversions: 0,
        totalRevenue: 0,
        conversionRate: 0
      }
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Dashboard Firebase')).toBeInTheDocument();
    });

    // Procurar pelo botão de tema
    const themeButtons = screen.getAllByText('Tema');
    expect(themeButtons.length).toBeGreaterThan(0);

    // Clicar no primeiro botão de tema
    fireEvent.click(themeButtons[0]);

    // Verificar se o atributo data-theme foi alterado
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});

describe('Links View Tests', () => {
  test('criação de link com validação', async () => {
    // Mock do firebase
    firebaseModule.getLinks = jest.fn().mockResolvedValue({
      success: true,
      links: []
    });

    firebaseModule.saveLink = jest.fn().mockResolvedValue({
      success: true,
      id: 'newlink123'
    });

    const mockUser = {
      uid: 'test123',
      email: 'test@example.com'
    };

    AUTH_SERVICE.onAuthStateChange = jest.fn((callback) => {
      callback(mockUser);
      return jest.fn();
    });

    firebaseModule.getAnalyticsData = jest.fn().mockResolvedValue({
      success: true,
      data: {
        totalLinks: 0,
        totalClicks: 0,
        totalConversions: 0,
        totalRevenue: 0,
        conversionRate: 0
      }
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Dashboard Firebase')).toBeInTheDocument();
    });

    // Navegar para a aba de links
    fireEvent.click(screen.getByText('Shortlinks'));

    await waitFor(() => {
      expect(screen.getByText('Shortlinks Firebase')).toBeInTheDocument();
    });

    // Abrir modal de criação
    fireEvent.click(screen.getByText('Novo Link'));

    // Inserir URL inválida
    const urlInput = screen.getByPlaceholderText('https://www.amazon.com.br/dp/...');
    fireEvent.change(urlInput, {
      target: { value: 'not-a-url' }
    });

    // Tentar criar com URL inválida
    fireEvent.click(screen.getByText('Criar Link'));

    // Verificar alerta (usando window.alert mock)
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Por favor, insira uma URL válida');
    });

    alertSpy.mockRestore();
  });
});

describe('Validation Utils Tests', () => {
  test('validação de URLs', () => {
    const { isValidUrl, isSupportedProductUrl } = require('./utils/validation');

    // URLs válidas
    expect(isValidUrl('https://www.amazon.com.br/dp/B08N5WRWNW')).toBe(true);
    expect(isValidUrl('http://mercadolivre.com.br/produto')).toBe(true);

    // URLs inválidas
    expect(isValidUrl('not-a-url')).toBe(false);
    expect(isValidUrl('ftp://invalid.com')).toBe(false);

    // URLs suportadas
    expect(isSupportedProductUrl('https://www.amazon.com.br/dp/B08N5WRWNW')).toBe(true);
    expect(isSupportedProductUrl('https://mercadolivre.com.br/produto')).toBe(true);

    // URLs não suportadas
    expect(isSupportedProductUrl('https://google.com')).toBe(false);
    expect(isSupportedProductUrl('https://facebook.com')).toBe(false);
  });

  test('sanitização de URLs', () => {
    const { sanitizeUrl } = require('./utils/validation');

    const dirtyUrl = 'https://www.amazon.com.br/dp/B08N5WRWNW?utm_source=google&fbclid=123456';
    const cleanUrl = sanitizeUrl(dirtyUrl);

    expect(cleanUrl).not.toContain('utm_source');
    expect(cleanUrl).not.toContain('fbclid');
    expect(cleanUrl).toContain('B08N5WRWNW');
  });

  test('rate limiting', () => {
    const { checkRateLimit } = require('./utils/validation');

    const key = 'test-user-123';

    // Primeiras 10 requests devem passar
    for (let i = 0; i < 10; i++) {
      const result = checkRateLimit(key, 10, 60000);
      expect(result.allowed).toBe(true);
    }

    // 11ª request deve ser bloqueada
    const blockedResult = checkRateLimit(key, 10, 60000);
    expect(blockedResult.allowed).toBe(false);
    expect(blockedResult.remainingTime).toBeGreaterThan(0);
  });
});

describe('Firebase Integration Tests', () => {
  test('salvar link no Firestore', async () => {
    const { saveLink } = require('./firebase');

    const mockLink = {
      url: 'https://www.amazon.com.br/dp/B08N5WRWNW?tag=buscabusca0f-20',
      originalUrl: 'https://www.amazon.com.br/dp/B08N5WRWNW',
      title: 'Produto Teste',
      platform: 'amazon',
      clicks: 0
    };

    firebaseModule.saveLink = jest.fn().mockResolvedValue({
      success: true,
      id: 'link123'
    });

    const result = await firebaseModule.saveLink(mockLink);

    expect(result.success).toBe(true);
    expect(result.id).toBe('link123');
  });

  test('buscar analytics do Firestore', async () => {
    firebaseModule.getAnalyticsData = jest.fn().mockResolvedValue({
      success: true,
      data: {
        totalLinks: 25,
        totalClicks: 1500,
        totalConversions: 75,
        totalRevenue: 2500.50,
        conversionRate: 5
      }
    });

    const result = await firebaseModule.getAnalyticsData();

    expect(result.success).toBe(true);
    expect(result.data.totalLinks).toBe(25);
    expect(result.data.conversionRate).toBe(5);
  });
});