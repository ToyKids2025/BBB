import React, { useState, useEffect } from 'react';
import { FiAlertTriangle, FiTool, FiCode, FiCheckCircle } from 'react-icons/fi';

/**
 * Componente HealthCheck
 * Exibe os problemas identificados no RELATORIO-VALIDACAO-COMPLETA.md
 * para um monitoramento rápido do estado do sistema.
 */

const priorityConfig = {
  critical: {
    label: 'Crítico',
    color: 'var(--error)',
    icon: <FiAlertTriangle />,
  },
  high: {
    label: 'Prioridade Alta',
    color: 'var(--warning)',
    icon: <FiAlertTriangle />,
  },
  medium: {
    label: 'Prioridade Média',
    color: 'var(--info)',
    icon: <FiAlertTriangle />,
  },
};

const HealthCheck = () => {
  const [problems, setProblems] = useState([]);

  useEffect(() => {
    const checkSystemHealth = () => {
      const identifiedProblems = [];

      // Verificação 1: Variáveis de Ambiente (em tempo real)
      if (!process.env.REACT_APP_AMAZON_TAG || !process.env.REACT_APP_FIREBASE_API_KEY) {
        identifiedProblems.push({
          id: 'undefined_tag',
          title: 'Variáveis de Ambiente Ausentes',
          description: 'As variáveis de ambiente (.env.local) não estão sendo lidas corretamente, o que pode resultar em falhas de conexão e links com tags inválidas.',
          solution: 'Verifique se o arquivo .env.local existe na raiz do projeto e se as variáveis (ex: REACT_APP_AMAZON_TAG) estão corretas. Reinicie o servidor após alterar.',
          priority: 'critical',
          icon: <FiCode />,
        });
      }

      // Adicione outras verificações em tempo real aqui (ex: ping em servidores)

      setProblems(identifiedProblems);
    };

    checkSystemHealth();
  }, []);

  return (
    <div className="health-check-container card glass">
      <style jsx>{`
        .health-check-container {
          padding: 2rem;
        }
        .health-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border-color);
        }
        .health-header h2 {
          margin: 0;
          font-size: 1.5rem;
        }
        .problem-list {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }
        .problem-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 1.5rem;
          display: grid;
          grid-template-columns: 40px 1fr;
          gap: 1rem;
          align-items: flex-start;
          transition: all 0.3s ease;
        }
        .problem-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-lg);
          border-color: var(--accent-color);
        }
        .problem-icon {
          font-size: 2rem;
          color: var(--accent-color);
          margin-top: 4px;
        }
        .problem-content h3 {
          margin: 0 0 0.5rem;
          font-size: 1.1rem;
        }
        .problem-content p {
          margin: 0 0 1rem;
          color: var(--text-secondary);
          font-size: 0.9rem;
        }
        .solution {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--bg-tertiary);
          padding: 0.75rem;
          border-radius: 8px;
          font-size: 0.9rem;
        }
        .solution code {
          background: var(--bg-primary);
          padding: 2px 6px;
          border-radius: 4px;
        }
        .priority-badge {
          font-size: 0.75rem;
          font-weight: bold;
          padding: 4px 8px;
          border-radius: 20px;
          color: white;
          margin-left: 1rem;
        }
        .no-problems-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem 1rem;
          text-align: center;
          color: var(--success);
          border: 2px dashed var(--success-bg);
          border-radius: 12px;
          background: var(--success-bg-light);
        }
        .no-problems-state svg {
          font-size: 3rem;
          margin-bottom: 1rem;
        }
        .no-problems-state h3 {
          margin: 0 0 0.5rem;
        }
        @media (min-width: 768px) {
          .problem-list {
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          }
        }
      `}</style>

      <div className="health-header">
        <FiAlertTriangle size={32} color="var(--warning)" />
        <h2>Diagnóstico do Sistema</h2>
      </div>

      {problems.length > 0 ? (
        <div className="problem-list">
          {problems.map((problem) => (
            <div key={problem.id} className="problem-card animate-fadeInUp">
              <div className="problem-icon">{problem.icon}</div>
              <div className="problem-content">
                <h3>
                  {problem.title}
                  <span className="priority-badge" style={{ backgroundColor: priorityConfig[problem.priority].color }}>
                    {priorityConfig[problem.priority].label}
                  </span>
                </h3>
                <p>{problem.description}</p>
                <div className="solution">
                  <FiTool /> <span><strong>Solução:</strong> {problem.solution}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-problems-state">
          <FiCheckCircle />
          <h3>Tudo Certo!</h3>
          <p>Nenhum problema crítico detectado. O sistema parece saudável!</p>
        </div>
      )}
    </div>
  );
};

export default HealthCheck;