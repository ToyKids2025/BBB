/**
 * Testes para configuração e funções de afiliado
 */

import { detectPlatform, addAffiliateTag, AFFILIATE_TAGS } from './config';

describe('Config Tests', () => {
  describe('detectPlatform', () => {
    test('detecta Amazon corretamente', () => {
      expect(detectPlatform('https://www.amazon.com.br/dp/B08N5WRWNW')).toBe('amazon');
      expect(detectPlatform('https://amazon.com/product')).toBe('amazon');
    });

    test('detecta Mercado Livre corretamente', () => {
      expect(detectPlatform('https://mercadolivre.com.br/produto')).toBe('mercadolivre');
      expect(detectPlatform('https://mercadolibre.com/item')).toBe('mercadolivre');
      expect(detectPlatform('https://produto.mercadolivre.com.br/MLB-123')).toBe('mercadolivre');
    });

    test('detecta outras plataformas', () => {
      expect(detectPlatform('https://magazineluiza.com.br/produto')).toBe('magalu');
      expect(detectPlatform('https://magalu.com.br/item')).toBe('magalu');
      expect(detectPlatform('https://americanas.com.br/produto')).toBe('americanas');
      expect(detectPlatform('https://casasbahia.com.br/produto')).toBe('casasbahia');
      expect(detectPlatform('https://shopee.com.br/produto')).toBe('shopee');
      expect(detectPlatform('https://aliexpress.com/item')).toBe('aliexpress');
    });

    test('retorna other para plataformas não suportadas', () => {
      expect(detectPlatform('https://google.com')).toBe('other');
      expect(detectPlatform('https://facebook.com')).toBe('other');
    });
  });

  describe('addAffiliateTag', () => {
    // Mock das tags de afiliado
    beforeEach(() => {
      process.env.REACT_APP_AMAZON_TAG = 'buscabusca0f-20';
      process.env.REACT_APP_ML_AFFILIATE_ID = 'WA20250726131129';
    });

    describe('Amazon', () => {
      test('adiciona tag quando não existe', () => {
        const url = 'https://www.amazon.com.br/dp/B08N5WRWNW';
        const result = addAffiliateTag(url, 'amazon');
        expect(result).toContain('tag=buscabusca0f-20');
      });

      test('mantém nossa tag quando já existe', () => {
        const url = 'https://www.amazon.com.br/dp/B08N5WRWNW?tag=buscabusca0f-20';
        const result = addAffiliateTag(url, 'amazon');
        expect(result).toBe(url);
      });

      test('substitui tag de outro afiliado', () => {
        const url = 'https://www.amazon.com.br/dp/B08N5WRWNW?tag=outra-tag-20';
        const result = addAffiliateTag(url, 'amazon');
        expect(result).toContain('tag=buscabusca0f-20');
        expect(result).not.toContain('outra-tag');
      });
    });

    describe('Mercado Livre', () => {
      test('adiciona parâmetros quando não existem', () => {
        const url = 'https://mercadolivre.com.br/produto';
        const result = addAffiliateTag(url, 'mercadolivre');
        expect(result).toContain('matt_word=WA20250726131129');
        expect(result).toContain('matt_tool=88344921');
      });

      test('mantém nossos parâmetros quando já existem', () => {
        const url = 'https://mercadolivre.com.br/produto?matt_word=WA20250726131129&matt_tool=88344921';
        const result = addAffiliateTag(url, 'mercadolivre');
        expect(result).toBe(url);
      });

      test('substitui parâmetros de outro afiliado', () => {
        const url = 'https://mercadolivre.com.br/produto?matt_word=OUTRO_ID&matt_tool=123';
        const result = addAffiliateTag(url, 'mercadolivre');
        expect(result).toContain('matt_word=WA20250726131129');
        expect(result).not.toContain('OUTRO_ID');
      });

      test('adiciona matt_tool quando falta', () => {
        const url = 'https://mercadolivre.com.br/produto?matt_word=WA20250726131129';
        const result = addAffiliateTag(url, 'mercadolivre');
        expect(result).toContain('matt_tool=88344921');
      });
    });

    describe('Outras plataformas', () => {
      test('retorna URL sem modificação para plataformas não suportadas', () => {
        const url = 'https://magazineluiza.com.br/produto';
        const result = addAffiliateTag(url, 'magalu');
        expect(result).toBe(url);
      });

      test('retorna URL sem modificação quando platform é other', () => {
        const url = 'https://google.com';
        const result = addAffiliateTag(url, 'other');
        expect(result).toBe(url);
      });
    });
  });

  describe('createShortlink', () => {
    test('cria link com tag de afiliado', async () => {
      const { createShortlink } = require('./config');

      // Mock do localStorage
      const mockLocalStorage = {
        getItem: jest.fn().mockReturnValue('[]'),
        setItem: jest.fn()
      };
      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage,
        writable: true
      });

      const url = 'https://www.amazon.com.br/dp/B08N5WRWNW';
      const result = await createShortlink(url);

      expect(result.success).toBe(true);
      expect(result.shortUrl).toContain('tag=');
      expect(result.key).toBeTruthy();

      // Verificar se foi salvo no localStorage
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('Integração completa', () => {
    test('fluxo completo: detectar plataforma -> adicionar tag -> criar link', async () => {
      const { createShortlink, detectPlatform, addAffiliateTag } = require('./config');

      const originalUrl = 'https://www.amazon.com.br/dp/B08N5WRWNW';

      // 1. Detectar plataforma
      const platform = detectPlatform(originalUrl);
      expect(platform).toBe('amazon');

      // 2. Adicionar tag de afiliado
      const urlWithTag = addAffiliateTag(originalUrl, platform);
      expect(urlWithTag).toContain('tag=');

      // 3. Criar shortlink
      const mockLocalStorage = {
        getItem: jest.fn().mockReturnValue('[]'),
        setItem: jest.fn()
      };
      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage,
        writable: true
      });

      const result = await createShortlink(originalUrl);
      expect(result.success).toBe(true);
      expect(result.shortUrl).toContain('tag=');
    });
  });
});