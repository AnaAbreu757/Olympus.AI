// Olympus AI — servidor em producao
// Versao otimizada com logs, CORS, rate limiting basico, e tratamento robusto de erros

require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: '10kb' }));
app.use(express.static(path.join(__dirname, '..', 'public')));

// CORS basico (permite chamadas do frontend)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Rate limiting muito basico (nao usar em producao real, usar redis-rate-limit)
const requestCounts = new Map();
const RATE_LIMIT = 30; // 30 pedidos por 15 minutos por IP
const RATE_WINDOW = 15 * 60 * 1000;

function checkRateLimit(ip) {
  const now = Date.now();
  if (!requestCounts.has(ip)) {
    requestCounts.set(ip, []);
  }
  const requests = requestCounts.get(ip);
  const recentRequests = requests.filter(t => now - t < RATE_WINDOW);
  requestCounts.set(ip, recentRequests);

  if (recentRequests.length >= RATE_LIMIT) {
    return false;
  }
  recentRequests.push(now);
  return true;
}

// --- Rota principal de chat ---
app.post('/api/chat', async (req, res) => {
  const ip = req.ip || req.connection.remoteAddress;

  // Rate limit
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: 'Muitos pedidos. Tenta novamente em alguns minutos.' });
  }

  const { provider, messages } = req.body;

  // Validacao basica
  if (!provider || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Pedido invalido. Provider e messages sao obrigatorios.' });
  }

  try {
    if (provider === 'openai') {
      if (!process.env.OPENAI_API_KEY) {
        return res.status(400).json({ error: 'OpenAI nao esta configurado neste servidor.' });
      }
      const r = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages,
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });
      const data = await r.json();
      if (data.error) {
        console.error('OpenAI error:', data.error);
        return res.status(500).json({ error: 'Erro no OpenAI: ' + data.error.message });
      }
      return res.json({ reply: data.choices[0].message.content });
    }

    if (provider === 'anthropic') {
      if (!process.env.ANTHROPIC_API_KEY) {
        return res.status(400).json({ error: 'Anthropic nao esta configurado neste servidor.' });
      }
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1024,
          messages,
        }),
      });
      const data = await r.json();
      if (data.error) {
        console.error('Anthropic error:', data.error);
        return res.status(500).json({ error: 'Erro no Anthropic: ' + data.error.message });
      }
      return res.json({ reply: data.content[0].text });
    }

    if (provider === 'google') {
      if (!process.env.GOOGLE_API_KEY) {
        return res.status(400).json({ error: 'Google Gemini nao esta configurado neste servidor.' });
      }
      const lastUserMsg = messages[messages.length - 1].content;
      const r = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: lastUserMsg }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 1000 },
          }),
        }
      );
      const data = await r.json();
      if (data.error) {
        console.error('Google error:', data.error);
        return res.status(500).json({ error: 'Erro no Google: ' + data.error.message });
      }
      if (!data.candidates || data.candidates.length === 0) {
        return res.status(500).json({ error: 'Nenhuma resposta do Gemini. Tenta novamente.' });
      }
      return res.json({ reply: data.candidates[0].content.parts[0].text });
    }

    return res.status(400).json({ error: 'Provider desconhecido.' });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Erro no servidor. Tenta novamente.' });
  }
});

// Health check (util para Render verificar se o servidor esta vivo)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 para rotas desconhecidas
app.use((req, res) => {
  res.status(404).json({ error: 'Rota nao encontrada.' });
});

// Inicia o servidor
const server = app.listen(PORT, () => {
  console.log(`✓ Olympus AI a correr em porta ${PORT}`);
  console.log(`✓ Frontend: http://localhost:${PORT}`);
  console.log(`✓ API: http://localhost:${PORT}/api/chat`);
  console.log(`✓ Health: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM recebido. A encerrar gracefully...');
  server.close(() => {
    console.log('Servidor encerrado.');
    process.exit(0);
  });
});
