const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const crypto = require('crypto');

const app = express();
const PORT = 3002;

// Configuração CORS para permitir cookies
app.use(cors({
  origin: ['http://localhost:3000', 'https://buscabuscabrasil.com.br'],
  credentials: true
}));

app.use(bodyParser.json());

// Banco de dados em memória para tracking
const trackingDatabase = new Map();
const sessionDatabase = new Map();

// Gerar ID único para sessão
function generateSessionId() {
  return crypto.randomBytes(32).toString('hex');
}

// Endpoint para criar cookie de primeira parte
app.post('/api/cookie/set', (req, res) => {
  const { affiliateTag, productUrl, platform } = req.body;

  if (!affiliateTag) {
    return res.status(400).json({ error: 'Missing affiliate tag' });
  }

  const sessionId = generateSessionId();
  const trackingId = `${platform}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Armazenar dados da sessão
  sessionDatabase.set(sessionId, {
    affiliateTag,
    productUrl,
    platform,
    createdAt: Date.now(),
    lastAccess: Date.now(),
    clickCount: 1
  });

  trackingDatabase.set(trackingId, {
    sessionId,
    affiliateTag,
    platform,
    history: [{
      timestamp: Date.now(),
      action: 'initial_click',
      productUrl
    }]
  });

  // Definir múltiplos cookies com diferentes durações
  const cookieOptions = {
    httpOnly: false, // Permitir acesso via JS para sincronização
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  };

  // Cookie de 90 dias
  res.cookie('bb_aff_90', affiliateTag, {
    ...cookieOptions,
    maxAge: 90 * 24 * 60 * 60 * 1000
  });

  // Cookie de 365 dias
  res.cookie('bb_aff_365', affiliateTag, {
    ...cookieOptions,
    maxAge: 365 * 24 * 60 * 60 * 1000
  });

  // Cookie perpétuo (10 anos)
  res.cookie('bb_aff_eternal', affiliateTag, {
    ...cookieOptions,
    maxAge: 10 * 365 * 24 * 60 * 60 * 1000
  });

  // Session ID para rastreamento
  res.cookie('bb_session', sessionId, {
    ...cookieOptions,
    maxAge: 365 * 24 * 60 * 60 * 1000
  });

  // Tracking ID único
  res.cookie('bb_track', trackingId, {
    ...cookieOptions,
    maxAge: 365 * 24 * 60 * 60 * 1000
  });

  res.json({
    success: true,
    sessionId,
    trackingId,
    affiliateTag,
    message: 'Cookies set successfully'
  });
});

// Endpoint para verificar cookies e restaurar sessão
app.get('/api/cookie/verify', (req, res) => {
  const cookies = req.headers.cookie;

  if (!cookies) {
    return res.json({ hasValidSession: false });
  }

  // Parsear cookies
  const cookieMap = {};
  cookies.split(';').forEach(cookie => {
    const [key, value] = cookie.trim().split('=');
    cookieMap[key] = value;
  });

  const sessionId = cookieMap['bb_session'];
  const trackingId = cookieMap['bb_track'];

  if (sessionId && sessionDatabase.has(sessionId)) {
    const session = sessionDatabase.get(sessionId);
    session.lastAccess = Date.now();

    return res.json({
      hasValidSession: true,
      affiliateTag: session.affiliateTag,
      platform: session.platform,
      sessionAge: Date.now() - session.createdAt,
      clickCount: session.clickCount
    });
  }

  // Tentar recuperar pelo tracking ID
  if (trackingId && trackingDatabase.has(trackingId)) {
    const tracking = trackingDatabase.get(trackingId);
    const session = sessionDatabase.get(tracking.sessionId);

    if (session) {
      return res.json({
        hasValidSession: true,
        affiliateTag: session.affiliateTag,
        platform: session.platform,
        recovered: true
      });
    }
  }

  // Tentar recuperar pelos cookies de afiliado
  const affiliateTag = cookieMap['bb_aff_eternal'] ||
                       cookieMap['bb_aff_365'] ||
                       cookieMap['bb_aff_90'];

  if (affiliateTag) {
    return res.json({
      hasValidSession: true,
      affiliateTag,
      recovered: true,
      cookieOnly: true
    });
  }

  res.json({ hasValidSession: false });
});

// Endpoint para sincronizar dados entre domínios
app.post('/api/sync/cross-domain', (req, res) => {
  const { sourceOrigin, targetOrigin, affiliateTag } = req.body;

  // Criar token de sincronização
  const syncToken = crypto.randomBytes(16).toString('hex');

  // Armazenar token temporariamente (expira em 5 minutos)
  const syncData = {
    affiliateTag,
    sourceOrigin,
    targetOrigin,
    createdAt: Date.now(),
    expiresAt: Date.now() + (5 * 60 * 1000)
  };

  trackingDatabase.set(`sync_${syncToken}`, syncData);

  res.json({
    success: true,
    syncToken,
    syncUrl: `${req.protocol}://${req.get('host')}/api/sync/apply/${syncToken}`
  });
});

// Aplicar sincronização cross-domain
app.get('/api/sync/apply/:token', (req, res) => {
  const { token } = req.params;
  const syncKey = `sync_${token}`;

  if (!trackingDatabase.has(syncKey)) {
    return res.status(404).json({ error: 'Invalid or expired sync token' });
  }

  const syncData = trackingDatabase.get(syncKey);

  // Verificar se não expirou
  if (Date.now() > syncData.expiresAt) {
    trackingDatabase.delete(syncKey);
    return res.status(410).json({ error: 'Sync token expired' });
  }

  // Aplicar cookies
  const cookieOptions = {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 365 * 24 * 60 * 60 * 1000
  };

  res.cookie('bb_aff_sync', syncData.affiliateTag, cookieOptions);
  res.cookie('bb_sync_origin', syncData.sourceOrigin, cookieOptions);

  // Limpar token usado
  trackingDatabase.delete(syncKey);

  // Redirecionar para URL de sucesso ou retornar JSON
  if (req.query.redirect) {
    res.redirect(req.query.redirect);
  } else {
    res.json({
      success: true,
      affiliateTag: syncData.affiliateTag,
      message: 'Cross-domain sync applied'
    });
  }
});

// Endpoint para rastreamento de eventos
app.post('/api/track/event', (req, res) => {
  const { trackingId, event, data } = req.body;

  if (!trackingId || !trackingDatabase.has(trackingId)) {
    return res.status(404).json({ error: 'Invalid tracking ID' });
  }

  const tracking = trackingDatabase.get(trackingId);
  tracking.history.push({
    timestamp: Date.now(),
    action: event,
    data
  });

  // Atualizar sessão
  if (tracking.sessionId && sessionDatabase.has(tracking.sessionId)) {
    const session = sessionDatabase.get(tracking.sessionId);
    session.lastAccess = Date.now();

    if (event === 'return_visit') {
      session.clickCount++;
    }
  }

  res.json({ success: true, eventsCount: tracking.history.length });
});

// Endpoint para pixel tracking
app.get('/api/pixel.gif', (req, res) => {
  const { t: trackingId, e: event } = req.query;

  if (trackingId && trackingDatabase.has(trackingId)) {
    const tracking = trackingDatabase.get(trackingId);
    tracking.history.push({
      timestamp: Date.now(),
      action: event || 'pixel_load',
      source: 'pixel'
    });
  }

  // Retornar GIF transparente 1x1
  const pixel = Buffer.from(
    'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
    'base64'
  );

  res.writeHead(200, {
    'Content-Type': 'image/gif',
    'Content-Length': pixel.length,
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });

  res.end(pixel);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'operational',
    activeSessions: sessionDatabase.size,
    activeTracking: trackingDatabase.size,
    uptime: process.uptime()
  });
});

// Limpar sessões expiradas a cada hora
setInterval(() => {
  const now = Date.now();
  const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);

  // Limpar sessões antigas
  for (const [key, session] of sessionDatabase.entries()) {
    if (session.lastAccess < thirtyDaysAgo) {
      sessionDatabase.delete(key);
    }
  }

  // Limpar tokens de sincronização expirados
  for (const [key, data] of trackingDatabase.entries()) {
    if (key.startsWith('sync_') && data.expiresAt < now) {
      trackingDatabase.delete(key);
    }
  }

  console.log(`[CLEANUP] Active sessions: ${sessionDatabase.size}, Tracking entries: ${trackingDatabase.size}`);
}, 60 * 60 * 1000); // A cada hora

app.listen(PORT, () => {
  console.log(`🍪 Cookie Proxy Server rodando em http://localhost:${PORT}`);
  console.log(`📊 Endpoints disponíveis:`);
  console.log(`   POST /api/cookie/set - Definir cookies de afiliado`);
  console.log(`   GET  /api/cookie/verify - Verificar sessão válida`);
  console.log(`   POST /api/sync/cross-domain - Sincronizar entre domínios`);
  console.log(`   GET  /api/sync/apply/:token - Aplicar sincronização`);
  console.log(`   POST /api/track/event - Rastrear eventos`);
  console.log(`   GET  /api/pixel.gif - Pixel tracking`);
  console.log(`   GET  /api/health - Status do servidor`);
});