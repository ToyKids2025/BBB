/**
 * 📱 AUTOMATION DASHBOARD - Interface Principal de Automação Instagram
 *
 * Dashboard completo com:
 * - Extração de produtos
 * - Geração de posts
 * - Edição de legendas
 * - Agendamento
 * - Fila de posts
 *
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { FiInstagram, FiPackage, FiImage, FiCalendar, FiList } from 'react-icons/fi';
import ProductExtractor from './ProductExtractor';
import PostPreview from './PostPreview';
import PostEditor from './PostEditor';
import PostQueue from './PostQueue';
import InstagramSettings from './InstagramSettings';

const AutomationDashboard = () => {
  const [activeTab, setActiveTab] = useState('extract');

  const tabs = [
    {
      id: 'extract',
      name: 'Extrair Produto',
      icon: <FiPackage />,
      component: ProductExtractor,
      desc: 'Cole a URL de um produto para extrair dados'
    },
    {
      id: 'preview',
      name: 'Gerar Post',
      icon: <FiImage />,
      component: PostPreview,
      desc: 'Crie imagens visuais com templates'
    },
    {
      id: 'editor',
      name: 'Editar Post',
      icon: FiInstagram,
      component: PostEditor,
      desc: 'Edite legenda, hashtags e agende'
    },
    {
      id: 'queue',
      name: 'Fila de Posts',
      icon: <FiList />,
      component: PostQueue,
      desc: 'Gerencie rascunhos, agendados e publicados'
    },
    {
      id: 'settings',
      name: 'Configurações',
      icon: <FiCalendar />,
      component: InstagramSettings,
      desc: 'Configure Instagram, horários e templates'
    }
  ];

  const ActiveComponent = tabs.find(t => t.id === activeTab)?.component || ProductExtractor;

  return (
    <div className="automation-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <FiInstagram size={36} className="instagram-icon" />
          <div>
            <h1>Instagram Automation</h1>
            <p className="header-subtitle">
              Sistema completo de automação de posts no Instagram
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="dashboard-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-name">{tab.name}</span>
            <span className="tab-desc">{tab.desc}</span>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="dashboard-content">
        <ActiveComponent />
      </div>

      <style jsx>{`
        .automation-dashboard {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
        }

        .dashboard-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 20px;
          padding: 2rem;
          margin-bottom: 2rem;
          color: white;
          box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .instagram-icon {
          background: rgba(255, 255, 255, 0.2);
          padding: 1rem;
          border-radius: 16px;
        }

        .dashboard-header h1 {
          font-size: 2rem;
          margin: 0 0 0.5rem 0;
          font-weight: 700;
        }

        .header-subtitle {
          margin: 0;
          font-size: 1.1rem;
          opacity: 0.95;
        }

        .dashboard-tabs {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .tab-button {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          padding: 1.25rem;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          background: white;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: left;
        }

        .tab-button:hover {
          border-color: #667eea;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .tab-button.active {
          border-color: #667eea;
          border-width: 3px;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
        }

        .tab-icon {
          font-size: 1.5rem;
          margin-bottom: 0.75rem;
          color: #667eea;
        }

        .tab-name {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text-primary, #1a1a1a);
          margin-bottom: 0.5rem;
        }

        .tab-desc {
          font-size: 0.85rem;
          color: var(--text-secondary, #666);
          line-height: 1.4;
        }

        .dashboard-content {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 2px 12px rgba(0,0,0,0.08);
        }

        @media (max-width: 768px) {
          .automation-dashboard {
            padding: 1rem;
          }

          .dashboard-header h1 {
            font-size: 1.5rem;
          }

          .dashboard-tabs {
            grid-template-columns: 1fr;
          }

          .header-content {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};

export default AutomationDashboard;
