/**
 * Sistema de A/B Testing Automático
 * Otimiza conversões testando variações automaticamente
 */

import { db } from '../firebase';
import { collection, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

class ABTestingEngine {
  constructor() {
    this.experiments = new Map();
    this.userVariants = new Map();
    this.results = new Map();
  }

  /**
   * Criar novo experimento A/B
   */
  createExperiment(config) {
    const experiment = {
      id: `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: config.name,
      variants: config.variants,
      trafficAllocation: config.trafficAllocation || this.equalAllocation(config.variants.length),
      metrics: config.metrics || ['clicks', 'conversions'],
      status: 'active',
      startDate: new Date().toISOString(),
      endDate: config.endDate || null,
      minSampleSize: config.minSampleSize || 100,
      confidenceLevel: config.confidenceLevel || 0.95
    };

    this.experiments.set(experiment.id, experiment);
    this.saveExperiment(experiment);

    return experiment;
  }

  /**
   * Distribuição igual de tráfego
   */
  equalAllocation(variantCount) {
    const percentage = 100 / variantCount;
    return Array(variantCount).fill(percentage);
  }

  /**
   * Atribuir variante ao usuário
   */
  assignVariant(experimentId, userId) {
    const experiment = this.experiments.get(experimentId);
    if (!experiment || experiment.status !== 'active') {
      return null;
    }

    // Verificar se usuário já tem variante atribuída
    const key = `${experimentId}_${userId}`;
    if (this.userVariants.has(key)) {
      return this.userVariants.get(key);
    }

    // Atribuir nova variante baseada na alocação de tráfego
    const random = Math.random() * 100;
    let accumulated = 0;
    let selectedVariant = null;

    for (let i = 0; i < experiment.variants.length; i++) {
      accumulated += experiment.trafficAllocation[i];
      if (random < accumulated) {
        selectedVariant = experiment.variants[i];
        break;
      }
    }

    // Salvar atribuição
    this.userVariants.set(key, selectedVariant);
    this.trackAssignment(experimentId, userId, selectedVariant);

    return selectedVariant;
  }

  /**
   * Rastrear evento do experimento
   */
  trackEvent(experimentId, userId, eventType, value = 1) {
    const key = `${experimentId}_${userId}`;
    const variant = this.userVariants.get(key);

    if (!variant) {
      console.warn('Usuário não tem variante atribuída');
      return;
    }

    // Registrar evento
    const resultKey = `${experimentId}_${variant.id}`;
    if (!this.results.has(resultKey)) {
      this.results.set(resultKey, {
        impressions: 0,
        clicks: 0,
        conversions: 0,
        revenue: 0
      });
    }

    const stats = this.results.get(resultKey);

    switch(eventType) {
      case 'impression':
        stats.impressions++;
        break;
      case 'click':
        stats.clicks++;
        break;
      case 'conversion':
        stats.conversions++;
        stats.revenue += value;
        break;
    }

    // Salvar no Firebase
    this.saveResults(experimentId, variant.id, stats);

    // Verificar se experimento pode ser concluído
    this.checkExperimentCompletion(experimentId);
  }

  /**
   * Calcular significância estatística
   */
  calculateSignificance(control, variant) {
    // Teste Z para proporções
    const n1 = control.impressions;
    const n2 = variant.impressions;
    const p1 = control.conversions / n1;
    const p2 = variant.conversions / n2;
    const p = (control.conversions + variant.conversions) / (n1 + n2);

    const se = Math.sqrt(p * (1 - p) * (1/n1 + 1/n2));
    const z = (p2 - p1) / se;

    // Valor p (bilateral)
    const pValue = 2 * (1 - this.normalCDF(Math.abs(z)));

    return {
      zScore: z,
      pValue: pValue,
      isSignificant: pValue < 0.05,
      confidence: (1 - pValue) * 100,
      uplift: ((p2 - p1) / p1) * 100
    };
  }

  /**
   * Função de distribuição cumulativa normal
   */
  normalCDF(z) {
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const sign = z < 0 ? -1 : 1;
    z = Math.abs(z) / Math.sqrt(2.0);

    const t = 1.0 / (1.0 + p * z);
    const t2 = t * t;
    const t3 = t2 * t;
    const t4 = t3 * t;
    const t5 = t4 * t;

    const y = 1.0 - (((((a5 * t5 + a4 * t4) + a3 * t3) + a2 * t2) + a1 * t)) * Math.exp(-z * z);

    return 0.5 * (1.0 + sign * y);
  }

  /**
   * Verificar se experimento pode ser concluído
   */
  checkExperimentCompletion(experimentId) {
    const experiment = this.experiments.get(experimentId);
    if (!experiment || experiment.status !== 'active') return;

    // Coletar estatísticas de todas as variantes
    const variantStats = [];
    for (const variant of experiment.variants) {
      const key = `${experimentId}_${variant.id}`;
      const stats = this.results.get(key);
      if (stats) {
        variantStats.push({ ...stats, variant });
      }
    }

    // Verificar tamanho mínimo da amostra
    const totalSample = variantStats.reduce((sum, s) => sum + s.impressions, 0);
    if (totalSample < experiment.minSampleSize) return;

    // Calcular vencedor se houver significância
    if (variantStats.length >= 2) {
      const control = variantStats[0];
      const bestVariant = variantStats.slice(1).reduce((best, current) => {
        const significance = this.calculateSignificance(control, current);
        if (significance.isSignificant && significance.uplift > 0) {
          if (!best || current.conversions / current.impressions > best.conversions / best.impressions) {
            return current;
          }
        }
        return best;
      }, null);

      if (bestVariant) {
        this.concludeExperiment(experimentId, bestVariant.variant);
      }
    }
  }

  /**
   * Concluir experimento com vencedor
   */
  concludeExperiment(experimentId, winner) {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) return;

    experiment.status = 'completed';
    experiment.endDate = new Date().toISOString();
    experiment.winner = winner;

    // Salvar conclusão
    this.saveExperiment(experiment);

    // Notificar sobre vencedor
    console.log(`🏆 Experimento ${experiment.name} concluído! Vencedor: ${winner.name}`);

    // Aplicar vencedor automaticamente (100% do tráfego)
    this.applyWinner(experimentId, winner);
  }

  /**
   * Aplicar variante vencedora
   */
  applyWinner(experimentId, winner) {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) return;

    // Atualizar alocação de tráfego
    experiment.trafficAllocation = experiment.variants.map(v =>
      v.id === winner.id ? 100 : 0
    );

    this.saveExperiment(experiment);
  }

  /**
   * Obter relatório do experimento
   */
  getReport(experimentId) {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) return null;

    const report = {
      experiment: experiment,
      results: [],
      winner: null,
      summary: {}
    };

    // Coletar resultados de cada variante
    for (const variant of experiment.variants) {
      const key = `${experimentId}_${variant.id}`;
      const stats = this.results.get(key) || {
        impressions: 0,
        clicks: 0,
        conversions: 0,
        revenue: 0
      };

      const variantResult = {
        variant: variant,
        stats: stats,
        metrics: {
          ctr: stats.impressions > 0 ? (stats.clicks / stats.impressions * 100).toFixed(2) : 0,
          conversionRate: stats.impressions > 0 ? (stats.conversions / stats.impressions * 100).toFixed(2) : 0,
          avgRevenue: stats.conversions > 0 ? (stats.revenue / stats.conversions).toFixed(2) : 0
        }
      };

      report.results.push(variantResult);
    }

    // Calcular significância se houver controle
    if (report.results.length >= 2) {
      const control = report.results[0];
      for (let i = 1; i < report.results.length; i++) {
        const variant = report.results[i];
        variant.significance = this.calculateSignificance(control.stats, variant.stats);
      }
    }

    // Identificar vencedor
    report.winner = experiment.winner || this.identifyWinner(report.results);

    return report;
  }

  /**
   * Identificar vencedor potencial
   */
  identifyWinner(results) {
    if (results.length < 2) return null;

    const control = results[0];
    let bestVariant = null;
    let bestUplift = 0;

    for (let i = 1; i < results.length; i++) {
      const variant = results[i];
      if (variant.significance && variant.significance.isSignificant && variant.significance.uplift > bestUplift) {
        bestVariant = variant.variant;
        bestUplift = variant.significance.uplift;
      }
    }

    return bestVariant;
  }

  /**
   * Salvar experimento no Firebase
   */
  async saveExperiment(experiment) {
    try {
      await setDoc(doc(db, 'experiments', experiment.id), experiment);
    } catch (error) {
      console.error('Erro ao salvar experimento:', error);
    }
  }

  /**
   * Salvar resultados no Firebase
   */
  async saveResults(experimentId, variantId, stats) {
    try {
      const docId = `${experimentId}_${variantId}`;
      await setDoc(doc(db, 'experiment_results', docId), {
        experimentId,
        variantId,
        stats,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erro ao salvar resultados:', error);
    }
  }

  /**
   * Rastrear atribuição de variante
   */
  async trackAssignment(experimentId, userId, variant) {
    try {
      await setDoc(doc(db, 'experiment_assignments', `${experimentId}_${userId}`), {
        experimentId,
        userId,
        variantId: variant.id,
        assignedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erro ao rastrear atribuição:', error);
    }
  }
}

// Experimentos pré-configurados para links
export const linkExperiments = {
  // Teste de formato de URL
  urlFormat: {
    name: 'Formato de URL',
    variants: [
      { id: 'short', name: 'URL Curta', format: 'short.link/{id}' },
      { id: 'branded', name: 'URL Branded', format: 'promo.bbb/{id}' },
      { id: 'keyword', name: 'URL com Keyword', format: 'oferta.link/{keyword}' }
    ],
    metrics: ['clicks', 'conversions'],
    minSampleSize: 500
  },

  // Teste de preview
  previewStyle: {
    name: 'Estilo de Preview',
    variants: [
      { id: 'minimal', name: 'Minimalista', showPrice: false, showImage: false },
      { id: 'rich', name: 'Rico', showPrice: true, showImage: true },
      { id: 'social', name: 'Social Proof', showPrice: true, showReviews: true }
    ],
    metrics: ['clicks', 'conversions'],
    minSampleSize: 300
  },

  // Teste de CTA
  ctaButton: {
    name: 'Botão CTA',
    variants: [
      { id: 'buy', name: 'Comprar Agora', text: 'Comprar Agora', color: '#4CAF50' },
      { id: 'see', name: 'Ver Oferta', text: 'Ver Oferta', color: '#2196F3' },
      { id: 'save', name: 'Economizar', text: 'Economize {discount}%', color: '#FF9800' }
    ],
    metrics: ['clicks'],
    minSampleSize: 200
  },

  // Teste de urgência
  urgencyLevel: {
    name: 'Nível de Urgência',
    variants: [
      { id: 'none', name: 'Sem Urgência', showTimer: false, showStock: false },
      { id: 'timer', name: 'Com Timer', showTimer: true, showStock: false },
      { id: 'full', name: 'Urgência Total', showTimer: true, showStock: true }
    ],
    metrics: ['conversions'],
    minSampleSize: 400
  }
};

// Exportar instância global
export const abTesting = new ABTestingEngine();

// Helper para usar em componentes React
export function useABTest(experimentName, userId) {
  const experiment = linkExperiments[experimentName];

  if (!experiment) {
    console.warn(`Experimento ${experimentName} não encontrado`);
    return null;
  }

  // Criar experimento se não existir
  let experimentId = `${experimentName}_v1`;
  if (!abTesting.experiments.has(experimentId)) {
    abTesting.createExperiment({
      ...experiment,
      name: experimentId
    });
  }

  // Atribuir variante ao usuário
  const variant = abTesting.assignVariant(experimentId, userId);

  // Retornar funções de tracking
  return {
    variant,
    trackClick: () => abTesting.trackEvent(experimentId, userId, 'click'),
    trackConversion: (value) => abTesting.trackEvent(experimentId, userId, 'conversion', value),
    trackImpression: () => abTesting.trackEvent(experimentId, userId, 'impression')
  };
}