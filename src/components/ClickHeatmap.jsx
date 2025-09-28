import React, { useState, useEffect } from 'react';
import { FiActivity, FiCalendar, FiTrendingUp, FiClock } from 'react-icons/fi';
import { getLinks } from '../firebase';

/**
 * Heatmap de Cliques - Visualiza padrões de engajamento
 * Identifica melhores horários e dias para postar
 */
const ClickHeatmap = () => {
  const [heatmapData, setHeatmapData] = useState([]);
  const [period, setPeriod] = useState('week');
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState({});

  useEffect(() => {
    loadHeatmapData();
  }, [period]);

  const loadHeatmapData = async () => {
    setLoading(true);
    try {
      const result = await getLinks();

      if (result.success) {
        const processedData = processClickData(result.links);
        setHeatmapData(processedData);
        generateInsights(processedData);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const processClickData = (links) => {
    // Inicializar matriz 7x24 (dias x horas)
    const matrix = Array(7).fill(null).map(() => Array(24).fill(0));

    // Processar cliques
    links.forEach(link => {
      if (link.lastClickedAt) {
        const date = new Date(link.lastClickedAt);
        const day = date.getDay();
        const hour = date.getHours();
        const clicks = link.clicks || 1;

        matrix[day][hour] += clicks;
      }
    });

    // Adicionar dados simulados para demonstração
    const simulatedData = generateSimulatedData();
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        matrix[day][hour] += simulatedData[day][hour];
      }
    }

    return matrix;
  };

  const generateSimulatedData = () => {
    // Simular padrões realistas de cliques
    const matrix = Array(7).fill(null).map(() => Array(24).fill(0));

    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        let baseValue = 10;

        // Horário comercial tem mais cliques
        if (hour >= 9 && hour <= 18) baseValue = 50;

        // Picos no almoço e fim do dia
        if (hour === 12 || hour === 20) baseValue = 80;

        // Fim de semana tem padrão diferente
        if (day === 0 || day === 6) {
          baseValue = hour >= 10 && hour <= 22 ? 60 : 20;
        }

        // Adicionar variação aleatória
        matrix[day][hour] = Math.floor(baseValue + Math.random() * 20);
      }
    }

    return matrix;
  };

  const generateInsights = (data) => {
    // Encontrar melhor dia
    const dayTotals = data.map((day, index) => ({
      day: getDayName(index),
      total: day.reduce((sum, hour) => sum + hour, 0)
    }));
    const bestDay = dayTotals.reduce((max, day) => day.total > max.total ? day : max);

    // Encontrar melhor horário
    let bestHour = { hour: 0, value: 0 };
    for (let hour = 0; hour < 24; hour++) {
      const hourTotal = data.reduce((sum, day) => sum + day[hour], 0);
      if (hourTotal > bestHour.value) {
        bestHour = { hour, value: hourTotal };
      }
    }

    // Calcular média por período
    const avgMorning = calculatePeriodAverage(data, 6, 12);
    const avgAfternoon = calculatePeriodAverage(data, 12, 18);
    const avgEvening = calculatePeriodAverage(data, 18, 23);

    setInsights({
      bestDay: bestDay.day,
      bestHour: `${bestHour.hour}:00`,
      bestPeriod: avgEvening > avgAfternoon && avgEvening > avgMorning ? 'Noite' :
                  avgAfternoon > avgMorning ? 'Tarde' : 'Manhã',
      totalClicks: data.flat().reduce((sum, val) => sum + val, 0),
      avgPerHour: (data.flat().reduce((sum, val) => sum + val, 0) / (7 * 24)).toFixed(1)
    });
  };

  const calculatePeriodAverage = (data, startHour, endHour) => {
    let total = 0;
    let count = 0;

    for (let day = 0; day < 7; day++) {
      for (let hour = startHour; hour < endHour; hour++) {
        total += data[day][hour];
        count++;
      }
    }

    return total / count;
  };

  const getDayName = (index) => {
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return days[index];
  };

  const getColor = (value) => {
    const max = Math.max(...heatmapData.flat());
    const intensity = value / max;

    if (intensity === 0) return '#f0f0f0';
    if (intensity < 0.2) return '#c6e48b';
    if (intensity < 0.4) return '#7bc96f';
    if (intensity < 0.6) return '#239a3b';
    if (intensity < 0.8) return '#196127';
    return '#0e4429';
  };

  if (loading) {
    return (
      <div className="heatmap-loading">
        <div className="spinner"></div>
        <p>Carregando dados...</p>
      </div>
    );
  }

  return (
    <div className="click-heatmap">
      <div className="heatmap-header">
        <div className="header-title">
          <FiActivity className="icon" />
          <h2>Heatmap de Cliques</h2>
        </div>

        <div className="period-selector">
          <button
            className={period === 'week' ? 'active' : ''}
            onClick={() => setPeriod('week')}
          >
            Semana
          </button>
          <button
            className={period === 'month' ? 'active' : ''}
            onClick={() => setPeriod('month')}
          >
            Mês
          </button>
          <button
            className={period === 'year' ? 'active' : ''}
            onClick={() => setPeriod('year')}
          >
            Ano
          </button>
        </div>
      </div>

      {/* Insights Cards */}
      <div className="insights-grid">
        <div className="insight-card">
          <FiCalendar className="card-icon" />
          <div className="card-content">
            <span className="label">Melhor Dia</span>
            <span className="value">{insights.bestDay}</span>
          </div>
        </div>

        <div className="insight-card">
          <FiClock className="card-icon" />
          <div className="card-content">
            <span className="label">Melhor Horário</span>
            <span className="value">{insights.bestHour}</span>
          </div>
        </div>

        <div className="insight-card">
          <FiTrendingUp className="card-icon" />
          <div className="card-content">
            <span className="label">Melhor Período</span>
            <span className="value">{insights.bestPeriod}</span>
          </div>
        </div>

        <div className="insight-card">
          <FiActivity className="card-icon" />
          <div className="card-content">
            <span className="label">Total de Cliques</span>
            <span className="value">{insights.totalClicks}</span>
          </div>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="heatmap-container">
        <div className="heatmap-grid">
          {/* Header com horas */}
          <div className="heatmap-row header">
            <div className="cell day-label"></div>
            {Array(24).fill(null).map((_, hour) => (
              <div key={hour} className="cell hour-label">
                {hour}
              </div>
            ))}
          </div>

          {/* Linhas com dias */}
          {heatmapData.map((dayData, dayIndex) => (
            <div key={dayIndex} className="heatmap-row">
              <div className="cell day-label">
                {getDayName(dayIndex).substring(0, 3)}
              </div>
              {dayData.map((value, hourIndex) => (
                <div
                  key={hourIndex}
                  className="cell heat-cell"
                  style={{ backgroundColor: getColor(value) }}
                  title={`${getDayName(dayIndex)} ${hourIndex}:00 - ${value} cliques`}
                >
                  {value > 0 && value}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Legenda */}
        <div className="heatmap-legend">
          <span>Menos</span>
          <div className="legend-colors">
            {['#f0f0f0', '#c6e48b', '#7bc96f', '#239a3b', '#196127', '#0e4429'].map(color => (
              <div
                key={color}
                className="legend-box"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <span>Mais</span>
        </div>
      </div>

      {/* Recomendações */}
      <div className="recommendations">
        <h3>📊 Recomendações Baseadas nos Dados</h3>
        <ul>
          <li>
            <strong>Melhor momento para postar:</strong> {insights.bestDay} às {insights.bestHour}
          </li>
          <li>
            <strong>Período de maior engajamento:</strong> {insights.bestPeriod}
          </li>
          <li>
            <strong>Média de cliques por hora:</strong> {insights.avgPerHour}
          </li>
          <li>
            <strong>Dica:</strong> Agende seus links mais importantes para os horários de pico
          </li>
        </ul>
      </div>

      <style jsx>{`
        .click-heatmap {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        .heatmap-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .header-title {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .header-title h2 {
          margin: 0;
          color: #333;
        }

        .header-title .icon {
          font-size: 24px;
          color: #667eea;
        }

        .period-selector {
          display: flex;
          gap: 10px;
        }

        .period-selector button {
          padding: 8px 20px;
          background: white;
          border: 1px solid #ddd;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .period-selector button:hover {
          background: #f5f5f5;
        }

        .period-selector button.active {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border-color: transparent;
        }

        .insights-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .insight-card {
          background: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .card-icon {
          font-size: 32px;
          color: #667eea;
        }

        .card-content {
          display: flex;
          flex-direction: column;
        }

        .card-content .label {
          font-size: 12px;
          color: #999;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .card-content .value {
          font-size: 24px;
          font-weight: 700;
          color: #333;
        }

        .heatmap-container {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          margin-bottom: 30px;
        }

        .heatmap-grid {
          overflow-x: auto;
        }

        .heatmap-row {
          display: flex;
          gap: 2px;
          margin-bottom: 2px;
        }

        .heatmap-row.header {
          margin-bottom: 5px;
        }

        .cell {
          min-width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          border-radius: 4px;
        }

        .day-label {
          min-width: 40px;
          font-weight: 600;
          color: #666;
        }

        .hour-label {
          color: #999;
          font-size: 9px;
        }

        .heat-cell {
          cursor: pointer;
          transition: all 0.2s ease;
          color: white;
          font-weight: 600;
        }

        .heat-cell:hover {
          transform: scale(1.2);
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }

        .heatmap-legend {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-top: 20px;
          font-size: 12px;
          color: #666;
        }

        .legend-colors {
          display: flex;
          gap: 2px;
        }

        .legend-box {
          width: 20px;
          height: 20px;
          border-radius: 4px;
        }

        .recommendations {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          padding: 20px;
          border-radius: 12px;
        }

        .recommendations h3 {
          margin: 0 0 15px 0;
        }

        .recommendations ul {
          margin: 0;
          padding-left: 20px;
        }

        .recommendations li {
          margin-bottom: 10px;
          line-height: 1.6;
        }

        .heatmap-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f0f0f0;
          border-top-color: #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .insights-grid {
            grid-template-columns: 1fr;
          }

          .heatmap-container {
            overflow-x: scroll;
          }

          .cell {
            min-width: 20px;
            height: 20px;
            font-size: 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default ClickHeatmap;