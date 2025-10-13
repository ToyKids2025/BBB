/**
 * ⚙️ INSTAGRAM SETTINGS - Configurações do Instagram
 *
 * Gerencia:
 * - Conexão com Instagram
 * - Horários de publicação
 * - Template padrão
 * - Tom das legendas
 * - Posts por dia
 *
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { FiSettings, FiInstagram, FiClock, FiImage, FiEdit3, FiSave } from 'react-icons/fi';
import { getInstagramSettings, saveInstagramSettings } from '../../utils/instagram/firebase-instagram';

const InstagramSettings = () => {
  const [settings, setSettings] = useState({
    accessToken: '',
    instagramAccountId: '',
    postsPerDay: 5,
    publishHours: [9, 12, 15, 18, 21],
    defaultTemplate: 'moderno',
    defaultTone: 'entusiasta',
    autoHashtags: true,
    useAI: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const result = await getInstagramSettings();
      if (result.success && result.settings) {
        setSettings(result.settings);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      const result = await saveInstagramSettings(settings);

      if (result.success) {
        setMessage('✅ Configurações salvas com sucesso!');
      } else {
        setMessage(`❌ Erro: ${result.error}`);
      }
    } catch (error) {
      setMessage(`❌ Erro ao salvar: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleHour = (hour) => {
    setSettings({
      ...settings,
      publishHours: settings.publishHours.includes(hour)
        ? settings.publishHours.filter(h => h !== hour)
        : [...settings.publishHours, hour].sort((a, b) => a - b)
    });
  };

  const allHours = Array.from({ length: 24 }, (_, i) => i);

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner-large"></div>
        <p>Carregando configurações...</p>
      </div>
    );
  }

  return (
    <div className="instagram-settings card glass">
      <div className="settings-header">
        <FiSettings size={28} />
        <h2>Configurações do Instagram</h2>
        <p className="subtitle">Configure sua automação</p>
      </div>

      <div className="settings-content">
        {/* Conexão Instagram */}
        <div className="section">
          <h3>
            <FiInstagram /> Conexão com Instagram
          </h3>
          <p className="section-desc">
            Para conectar sua conta do Instagram, você precisará de um token de acesso do Facebook Graph API.
          </p>

          <div className="form-group">
            <label>Access Token</label>
            <input
              type="password"
              value={settings.accessToken}
              onChange={(e) => setSettings({ ...settings, accessToken: e.target.value })}
              className="input"
              placeholder="IGQVJxxxxxxxxxx..."
            />
          </div>

          <div className="form-group">
            <label>Instagram Account ID</label>
            <input
              type="text"
              value={settings.instagramAccountId}
              onChange={(e) => setSettings({ ...settings, instagramAccountId: e.target.value })}
              className="input"
              placeholder="17841400000000000"
            />
          </div>

          <div className="info-box">
            <strong>ℹ️ Como obter?</strong>
            <ol>
              <li>Acesse <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer">Facebook Developers</a></li>
              <li>Crie um app e adicione Instagram Graph API</li>
              <li>Gere um token de longa duração (60 dias)</li>
              <li>Copie o token e o ID da conta aqui</li>
            </ol>
          </div>
        </div>

        {/* Horários de Publicação */}
        <div className="section">
          <h3>
            <FiClock /> Horários de Publicação
          </h3>
          <p className="section-desc">
            Selecione os horários em que posts agendados devem ser publicados automaticamente.
          </p>

          <div className="hours-grid">
            {allHours.map((hour) => (
              <button
                key={hour}
                className={`hour-button ${settings.publishHours.includes(hour) ? 'active' : ''}`}
                onClick={() => handleToggleHour(hour)}
              >
                {hour.toString().padStart(2, '0')}:00
              </button>
            ))}
          </div>

          <div className="selected-hours">
            <strong>Horários selecionados:</strong>
            {settings.publishHours.length > 0 ? (
              settings.publishHours.map(h => `${h.toString().padStart(2, '0')}:00`).join(', ')
            ) : (
              'Nenhum horário selecionado'
            )}
          </div>
        </div>

        {/* Posts por Dia */}
        <div className="section">
          <h3>
            <FiEdit3 /> Limite de Posts por Dia
          </h3>
          <p className="section-desc">
            Instagram permite até 25 posts/dia. Defina um limite mais baixo para espaçar melhor suas publicações.
          </p>

          <div className="form-group">
            <label>Posts por Dia (1-25)</label>
            <input
              type="number"
              min="1"
              max="25"
              value={settings.postsPerDay}
              onChange={(e) => setSettings({ ...settings, postsPerDay: parseInt(e.target.value) || 1 })}
              className="input"
            />
          </div>
        </div>

        {/* Template Padrão */}
        <div className="section">
          <h3>
            <FiImage /> Template Padrão
          </h3>
          <p className="section-desc">
            Escolha o estilo visual padrão para novos posts.
          </p>

          <div className="template-options">
            <label className={`template-card ${settings.defaultTemplate === 'moderno' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="template"
                value="moderno"
                checked={settings.defaultTemplate === 'moderno'}
                onChange={(e) => setSettings({ ...settings, defaultTemplate: e.target.value })}
              />
              <div className="template-preview" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
                <span>Moderno</span>
              </div>
              <span className="template-name">Gradiente Roxo</span>
            </label>

            <label className={`template-card ${settings.defaultTemplate === 'minimalista' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="template"
                value="minimalista"
                checked={settings.defaultTemplate === 'minimalista'}
                onChange={(e) => setSettings({ ...settings, defaultTemplate: e.target.value })}
              />
              <div className="template-preview" style={{ background: '#ffffff', border: '2px solid #e0e0e0' }}>
                <span style={{ color: '#1a1a1a' }}>Minimalista</span>
              </div>
              <span className="template-name">Clean & Simples</span>
            </label>

            <label className={`template-card ${settings.defaultTemplate === 'colorido' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="template"
                value="colorido"
                checked={settings.defaultTemplate === 'colorido'}
                onChange={(e) => setSettings({ ...settings, defaultTemplate: e.target.value })}
              />
              <div className="template-preview" style={{ background: 'linear-gradient(135deg, #ff6b6b, #feca57)' }}>
                <span>Colorido</span>
              </div>
              <span className="template-name">Vibrante</span>
            </label>
          </div>
        </div>

        {/* Tom das Legendas */}
        <div className="section">
          <h3>
            <FiEdit3 /> Tom das Legendas
          </h3>
          <p className="section-desc">
            Escolha o estilo de escrita padrão para templates de legenda.
          </p>

          <div className="tone-options">
            <label>
              <input
                type="radio"
                name="tone"
                value="entusiasta"
                checked={settings.defaultTone === 'entusiasta'}
                onChange={(e) => setSettings({ ...settings, defaultTone: e.target.value })}
              />
              <span>😍 Entusiasta</span>
            </label>

            <label>
              <input
                type="radio"
                name="tone"
                value="urgencia"
                checked={settings.defaultTone === 'urgencia'}
                onChange={(e) => setSettings({ ...settings, defaultTone: e.target.value })}
              />
              <span>⚡ Urgência</span>
            </label>

            <label>
              <input
                type="radio"
                name="tone"
                value="informativo"
                checked={settings.defaultTone === 'informativo'}
                onChange={(e) => setSettings({ ...settings, defaultTone: e.target.value })}
              />
              <span>📊 Informativo</span>
            </label>

            <label>
              <input
                type="radio"
                name="tone"
                value="casual"
                checked={settings.defaultTone === 'casual'}
                onChange={(e) => setSettings({ ...settings, defaultTone: e.target.value })}
              />
              <span>😊 Casual</span>
            </label>
          </div>
        </div>

        {/* Opções Avançadas */}
        <div className="section">
          <h3>Opções Avançadas</h3>

          <div className="checkbox-options">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={settings.autoHashtags}
                onChange={(e) => setSettings({ ...settings, autoHashtags: e.target.checked })}
              />
              <span>Adicionar hashtags automaticamente</span>
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={settings.useAI}
                onChange={(e) => setSettings({ ...settings, useAI: e.target.checked })}
              />
              <span>Usar IA para gerar legendas criativas (OpenAI GPT-4)</span>
            </label>
          </div>
        </div>

        {/* Botão Salvar */}
        <div className="action-buttons">
          <button
            onClick={handleSave}
            className="btn btn-primary btn-large"
            disabled={saving}
          >
            {saving ? (
              <>
                <span className="spinner"></span> Salvando...
              </>
            ) : (
              <>
                <FiSave /> Salvar Configurações
              </>
            )}
          </button>
        </div>

        {/* Mensagem */}
        {message && (
          <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}
      </div>

      <style jsx>{`
        .instagram-settings {
          max-width: 900px;
          margin: 0 auto;
        }

        .settings-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .settings-header h2 {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .subtitle {
          color: var(--text-secondary, #666);
          font-size: 0.9rem;
        }

        .settings-content {
          display: flex;
          flex-direction: column;
          gap: 2.5rem;
        }

        .section h3 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
          font-size: 1.1rem;
        }

        .section-desc {
          color: var(--text-secondary, #666);
          margin-bottom: 1rem;
          line-height: 1.5;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-group label {
          display: block;
          font-weight: 600;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }

        .info-box {
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.3);
          padding: 1rem;
          border-radius: 8px;
          margin-top: 1rem;
        }

        .info-box strong {
          display: block;
          margin-bottom: 0.5rem;
          color: #3b82f6;
        }

        .info-box ol {
          margin: 0;
          padding-left: 1.5rem;
        }

        .info-box li {
          margin-bottom: 0.375rem;
        }

        .info-box a {
          color: #3b82f6;
          text-decoration: underline;
        }

        .hours-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .hour-button {
          padding: 0.75rem;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          background: white;
          cursor: pointer;
          transition: all 0.3s;
          font-weight: 600;
        }

        .hour-button:hover {
          border-color: #667eea;
        }

        .hour-button.active {
          border-color: #667eea;
          background: #667eea;
          color: white;
        }

        .selected-hours {
          padding: 1rem;
          background: var(--surface, #f5f5f5);
          border-radius: 8px;
        }

        .template-options {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
        }

        .template-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .template-card:hover {
          border-color: #667eea;
        }

        .template-card.selected {
          border-color: #667eea;
          border-width: 3px;
        }

        .template-card input[type="radio"] {
          display: none;
        }

        .template-preview {
          width: 100%;
          height: 120px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 1.1rem;
        }

        .template-name {
          font-weight: 600;
        }

        .tone-options {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .tone-options label {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .tone-options label:hover {
          border-color: #667eea;
        }

        .tone-options input[type="radio"]:checked + span {
          font-weight: 700;
        }

        .checkbox-options {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          cursor: pointer;
        }

        .checkbox-label input[type="checkbox"] {
          width: 20px;
          height: 20px;
        }

        .action-buttons {
          display: flex;
          justify-content: center;
        }

        .btn-large {
          padding: 1rem 2rem;
          font-size: 1.1rem;
          min-width: 250px;
        }

        .spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .message {
          padding: 1rem;
          border-radius: 8px;
          text-align: center;
          font-weight: 600;
          margin-top: 1rem;
        }

        .message.success {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .message.error {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .loading-state {
          text-align: center;
          padding: 4rem 2rem;
        }

        .spinner-large {
          width: 48px;
          height: 48px;
          border: 4px solid #e0e0e0;
          border-top-color: #667eea;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 0 auto 1rem;
        }

        @media (max-width: 768px) {
          .hours-grid {
            grid-template-columns: repeat(4, 1fr);
          }

          .template-options {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default InstagramSettings;
