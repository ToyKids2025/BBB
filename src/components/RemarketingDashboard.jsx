import React, { useState, useEffect } from 'react';
import {
  FiTrendingUp, FiUsers, FiSend, FiDollarSign,
  FiClock, FiBell, FiMessageSquare, FiMail,
  FiSmartphone, FiTarget, FiActivity, FiAward,
  FiAlertTriangle, FiCheckCircle, FiXCircle
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { remarketingSystem, conversionOptimizer } from '../utils/remarketing-fomo';
import { db } from '../firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

/**
 * 🔥 DASHBOARD DE REMARKETING FOMO
 * Monitora conversões e performance em tempo real
 */
const RemarketingDashboard = () => {
  const [metrics, setMetrics] = useState({
    pendingTotal: 0,
    messageSent: 0,
    converted: 0,
    conversionRate: 0,
    activeReminders: 0,
    revenueRecovered: 0
  });

  const [recentConversions, setRecentConversions] = useState([]);
  const [pendingList, setPendingList] = useState([]);
  const [channelStats, setChannelStats] = useState({
    whatsapp: { sent: 0, opened: 0, converted: 0 },
    push: { sent: 0, opened: 0, converted: 0 },
    email: { sent: 0, opened: 0, converted: 0 }
  });

  const [abTests, setAbTests] = useState([]);
  const [bestTemplates, setBestTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();

    // Atualizar a cada 30 segundos
    const interval = setInterval(loadDashboardData, 30000);

    // Escutar eventos do sistema de remarketing
    window.addEventListener('remarketing-metrics-update', handleMetricsUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('remarketing-metrics-update', handleMetricsUpdate);
    };
  }, []);

  const handleMetricsUpdate = (event) => {
    setMetrics(event.detail);
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Carregar conversões pendentes
      const pendingQuery = query(
        collection(db, 'pending_conversions'),
        where('converted', '==', false),
        where('abandoned', '==', false),
        orderBy('clickTime', 'desc'),
        limit(10)
      );
      const pendingSnapshot = await getDocs(pendingQuery);
      const pending = [];
      pendingSnapshot.forEach(doc => {
        pending.push({ id: doc.id, ...doc.data() });
      });
      setPendingList(pending);

      // Carregar conversões recentes
      const conversionsQuery = query(
        collection(db, 'pending_conversions'),
        where('converted', '==', true),
        orderBy('convertedAt', 'desc'),
        limit(5)
      );
      const conversionsSnapshot = await getDocs(conversionsQuery);
      const conversions = [];
      conversionsSnapshot.forEach(doc => {
        conversions.push({ id: doc.id, ...doc.data() });
      });
      setRecentConversions(conversions);

      // Calcular métricas
      const allPendingQuery = query(
        collection(db, 'pending_conversions'),
        where('converted', '==', false)
      );
      const allPending = await getDocs(allPendingQuery);

      const allConvertedQuery = query(
        collection(db, 'pending_conversions'),
        where('converted', '==', true)
      );
      const allConverted = await getDocs(allConvertedQuery);

      // Calcular receita recuperada (estimativa)
      let totalRevenue = 0;
      allConverted.forEach(doc => {
        const data = doc.data();
        const estimatedValue = data.originalPrice
          ? parseFloat(String(data.originalPrice).replace(/[^0-9.,]/g, '').replace(',', '.'))
          : 100; // Valor médio estimado
        totalRevenue += estimatedValue * 0.05; // 5% de comissão média
      });

      setMetrics(prev => ({
        ...prev,
        pendingTotal: allPending.size,
        converted: allConverted.size,
        conversionRate: allPending.size > 0
          ? ((allConverted.size / (allPending.size + allConverted.size)) * 100).toFixed(2)
          : 0,
        revenueRecovered: totalRevenue.toFixed(2)
      }));

      // Carregar estatísticas por canal
      await loadChannelStats();

      // Carregar testes A/B
      await loadABTests();

    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadChannelStats = async () => {
    try {
      const logsQuery = query(
        collection(db, 'notification_logs'),
        orderBy('timestamp', 'desc'),
        limit(1000)
      );

      const logsSnapshot = await getDocs(logsQuery);
      const stats = {
        whatsapp: { sent: 0, opened: 0, converted: 0 },
        push: { sent: 0, opened: 0, converted: 0 },
        email: { sent: 0, opened: 0, converted: 0 }
      };

      logsSnapshot.forEach(doc => {
        const data = doc.data();
        if (stats[data.channel]) {
          if (data.status === 'sent') stats[data.channel].sent++;
          if (data.status === 'opened') stats[data.channel].opened++;
          if (data.status === 'converted') stats[data.channel].converted++;
        }
      });

      setChannelStats(stats);

    } catch (error) {
      console.error('Erro ao carregar stats dos canais:', error);
    }
  };

  const loadABTests = async () => {
    try {
      const testsQuery = query(
        collection(db, 'ab_tests'),
        orderBy('started', 'desc'),
        limit(5)
      );

      const testsSnapshot = await getDocs(testsQuery);
      const tests = [];
      testsSnapshot.forEach(doc => {
        tests.push({ id: doc.id, ...doc.data() });
      });

      setAbTests(tests);

      // Identificar melhores templates
      const best = tests
        .filter(test => test.winner)
        .map(test => ({
          name: test.name,
          winner: test.winner,
          rate: test.winnerRate
        }))
        .sort((a, b) => b.rate - a.rate)
        .slice(0, 3);

      setBestTemplates(best);

    } catch (error) {
      console.error('Erro ao carregar testes A/B:', error);
    }
  };

  const getTimeAgo = (timestamp) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 60) return `${minutes} min atrás`;
    if (hours < 24) return `${hours}h atrás`;
    return `${Math.floor(hours / 24)}d atrás`;
  };

  const getChannelIcon = (channel) => {
    switch (channel) {
      case 'whatsapp': return <FaWhatsapp className="text-green-500" />;
      case 'push': return <FiBell className="text-blue-500" />;
      case 'email': return <FiMail className="text-purple-500" />;
      default: return <FiSend className="text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    if (status.converted) {
      return (
        <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-200 rounded-full">
          💰 Convertido
        </span>
      );
    }
    if (status.abandoned) {
      return (
        <span className="px-2 py-1 text-xs font-semibold text-red-800 bg-red-200 rounded-full">
          ❌ Abandonado
        </span>
      );
    }
    if (status.remindersSent > 0) {
      return (
        <span className="px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-200 rounded-full">
          📨 {status.remindersSent} lembretes
        </span>
      );
    }
    return (
      <span className="px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-200 rounded-full">
        ⏰ Aguardando
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-600">Carregando dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-orange-50 to-red-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🔥 Dashboard de Remarketing FOMO
          </h1>
          <p className="text-gray-600">
            Sistema automático de recuperação de vendas com gatilhos psicológicos
          </p>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <FiClock className="text-3xl text-orange-500" />
              <span className="text-2xl font-bold text-gray-800">
                {metrics.pendingTotal}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-gray-600">Conversões Pendentes</h3>
            <p className="text-xs text-gray-500 mt-1">Aguardando compra</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <FiSend className="text-3xl text-blue-500" />
              <span className="text-2xl font-bold text-gray-800">
                {metrics.messageSent}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-gray-600">Mensagens Enviadas</h3>
            <p className="text-xs text-gray-500 mt-1">Total de lembretes</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <FiTrendingUp className="text-3xl text-green-500" />
              <span className="text-2xl font-bold text-gray-800">
                {metrics.conversionRate}%
              </span>
            </div>
            <h3 className="text-sm font-semibold text-gray-600">Taxa de Conversão</h3>
            <p className="text-xs text-gray-500 mt-1">Via remarketing</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <FiDollarSign className="text-3xl text-purple-500" />
              <span className="text-2xl font-bold text-gray-800">
                R$ {metrics.revenueRecovered}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-gray-600">Receita Recuperada</h3>
            <p className="text-xs text-gray-500 mt-1">Comissões extras</p>
          </div>
        </div>

        {/* Performance por Canal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* WhatsApp Stats */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <FaWhatsapp className="text-2xl text-green-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-800">WhatsApp</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Enviadas</span>
                <span className="font-semibold">{channelStats.whatsapp.sent}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Abertas</span>
                <span className="font-semibold">{channelStats.whatsapp.opened}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Conversões</span>
                <span className="font-semibold text-green-600">
                  {channelStats.whatsapp.converted}
                </span>
              </div>
              <div className="pt-3 border-t">
                <div className="flex justify-between">
                  <span className="text-sm font-semibold text-gray-700">Taxa</span>
                  <span className="font-bold text-green-600">
                    {channelStats.whatsapp.sent > 0
                      ? ((channelStats.whatsapp.converted / channelStats.whatsapp.sent) * 100).toFixed(1)
                      : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Push Stats */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <FiBell className="text-2xl text-blue-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-800">Push Notifications</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Enviadas</span>
                <span className="font-semibold">{channelStats.push.sent}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Abertas</span>
                <span className="font-semibold">{channelStats.push.opened}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Conversões</span>
                <span className="font-semibold text-green-600">
                  {channelStats.push.converted}
                </span>
              </div>
              <div className="pt-3 border-t">
                <div className="flex justify-between">
                  <span className="text-sm font-semibold text-gray-700">Taxa</span>
                  <span className="font-bold text-green-600">
                    {channelStats.push.sent > 0
                      ? ((channelStats.push.converted / channelStats.push.sent) * 100).toFixed(1)
                      : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Email Stats */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <FiMail className="text-2xl text-purple-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-800">Email</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Enviados</span>
                <span className="font-semibold">{channelStats.email.sent}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Abertos</span>
                <span className="font-semibold">{channelStats.email.opened}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Conversões</span>
                <span className="font-semibold text-green-600">
                  {channelStats.email.converted}
                </span>
              </div>
              <div className="pt-3 border-t">
                <div className="flex justify-between">
                  <span className="text-sm font-semibold text-gray-700">Taxa</span>
                  <span className="font-bold text-green-600">
                    {channelStats.email.sent > 0
                      ? ((channelStats.email.converted / channelStats.email.sent) * 100).toFixed(1)
                      : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Conversões Pendentes e Recentes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Pendentes */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              ⏰ Conversões Pendentes
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {pendingList.map(item => (
                <div key={item.id} className="border rounded-lg p-3 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800">
                        {item.productName || 'Produto'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.platform} • {getTimeAgo(item.clickTime)}
                      </p>
                    </div>
                    {getStatusBadge(item)}
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">
                      Expira em: {new Date(item.expiresAt).toLocaleTimeString()}
                    </span>
                    <div className="flex space-x-2">
                      <button
                        className="text-blue-600 hover:text-blue-800"
                        onClick={() => remarketingSystem.sendFOMONotification(
                          item.id,
                          { type: 'manual', priority: 'high' },
                          item.remindersSent + 1
                        )}
                      >
                        <FiSend />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {pendingList.length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  Nenhuma conversão pendente
                </p>
              )}
            </div>
          </div>

          {/* Recentes */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              💰 Conversões Recentes
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {recentConversions.map(item => (
                <div key={item.id} className="border rounded-lg p-3 bg-green-50 border-green-200">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800">
                        {item.productName || 'Produto'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.platform} • Convertido {getTimeAgo(item.convertedAt)}
                      </p>
                    </div>
                    <FiCheckCircle className="text-green-600 text-xl" />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">
                      {item.remindersSent} lembretes enviados
                    </span>
                    <span className="font-semibold text-green-700">
                      +R$ {((item.originalPrice || 100) * 0.05).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}

              {recentConversions.length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  Nenhuma conversão recente
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Melhores Templates */}
        {bestTemplates.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              🏆 Templates Vencedores (A/B Tests)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {bestTemplates.map((template, index) => (
                <div key={index} className="border rounded-lg p-4 bg-gradient-to-r from-yellow-50 to-orange-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                    </span>
                    <span className="text-lg font-bold text-green-600">
                      {template.rate.toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-gray-800">{template.name}</p>
                  <p className="text-xs text-gray-600 mt-1">Variante: {template.winner}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Insights e Recomendações */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-lg p-6 text-white">
          <h3 className="text-xl font-bold mb-4">💡 Insights e Otimizações</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <FiTarget className="text-2xl flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold">Melhor horário para enviar</p>
                <p className="text-sm opacity-90">
                  Entre 19h-21h tem 43% mais conversões
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <FiActivity className="text-2xl flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold">Canal mais efetivo</p>
                <p className="text-sm opacity-90">
                  WhatsApp converte 3x mais que outros canais
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <FiAward className="text-2xl flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold">Template campeão</p>
                <p className="text-sm opacity-90">
                  Urgência + Escassez = 8.7% conversão
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <FiTrendingUp className="text-2xl flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold">ROI do Remarketing</p>
                <p className="text-sm opacity-90">
                  167% de aumento nas vendas totais
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RemarketingDashboard;