// Olympus AI Server v2 Advanced

require('dotenv').config();
const express = require('express');
const path = require('path');
const { OlympusAgent } = require('./olympus-agent');
const { ComposioIntegration } = require('./composio-integration');

const app = express();
const PORT = process.env.PORT || 3000;
const agent = new OlympusAgent();
const composio = new ComposioIntegration(process.env.COMPOSIO_API_KEY);

app.use(express.json({ limit: '20kb' }));
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

const requestCounts = new Map();
const RATE_LIMIT = 60;
const RATE_WINDOW = 15 * 60 * 1000;

function checkRateLimit(ip) {
  const now = Date.now();
  if (!requestCounts.has(ip)) requestCounts.set(ip, []);
  const requests = requestCounts.get(ip);
  const recentRequests = requests.filter(t => now - t < RATE_WINDOW);
  requestCounts.set(ip, recentRequests);
  if (recentRequests.length >= RATE_LIMIT) return false;
  recentRequests.push(now);
  return true;
}

const responseCache = new Map();
const CACHE_TTL = 5 * 60 * 1000;
const logs = [];

app.post('/api/olympus', async (req, res) => {
  const ip = req.ip || req.connection.remoteAddress;
  if (!checkRateLimit(ip)) return res.status(429).json({ error: 'Limite atingido' });

  const { query, messages = [], useChainOfThought = false } = req.body;
  if (!query && messages.length === 0) return res.status(400).json({ error: 'Query obrigatorio' });

  const startTime = Date.now();
  try {
    const { selectedModel, confidence } = agent.selectBestModel(query || messages[messages.length - 1].content);
    const systemPrompt = agent.getSystemPrompt(selectedModel === 'claude' ? 'code' : 'general');
    
    let finalMessages = [{ role: 'system', content: systemPrompt }, ...messages];
    if (query) finalMessages.push({ role: 'user', content: query });

    const response = await callModel(selectedModel, finalMessages);
    if (response.error) {
      const fallback = selectedModel === 'gpt' ? 'claude' : 'gemini';
      const fallbackResponse = await callModel(fallback, finalMessages);
      if (fallbackResponse.error) throw fallbackResponse;
      return res.json({ reply: fallbackResponse.reply, model: fallback, confidence: 0.6, fallback: true, duration: Date.now() - startTime });
    }

    return res.json({ reply: response.reply, model: selectedModel, confidence, duration: Date.now() - startTime });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/olympus/code', async (req, res) => {
  const { code, analyze = true } = req.body;
  if (!code) return res.status(400).json({ error: 'Codigo obrigatorio' });

  try {
    let output = '';
    const logs = [];
    const originalLog = console.log;
    console.log = (...args) => logs.push(args.join(' '));
    try {
      eval(code);
      output = logs.join('\n') || 'Executado';
    } finally {
      console.log = originalLog;
    }

    return res.json({ language: 'javascript', output, error: false });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/olympus/reason', async (req, res) => {
  const { problem, steps = 5 } = req.body;
  if (!problem) return res.status(400).json({ error: 'Problem obrigatorio' });

  try {
    const response = await callModel('claude', [{ role: 'user', content: `Resolve passo a passo (${steps} passos): ${problem}` }]);
    if (response.error) throw response;
    return res.json({ problem, reasoning: response.reply, model: 'claude' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.get('/api/olympus/composio/tools', async (req, res) => {
  const { search = '' } = req.query;
  const tools = await composio.getAvailableTools(search);
  res.json({ tools, total: tools.length, categories: [...new Set(tools.map(t => t.category))] });
});

app.get('/api/olympus/composio/tools/:toolId/actions', async (req, res) => {
  const actions = await composio.getToolActions(req.params.toolId);
  res.json(actions);
});

app.post('/api/olympus/composio/execute', async (req, res) => {
  const { tool, action, params = {} } = req.body;
  if (!tool || !action) return res.status(400).json({ error: 'Tool e action obrigatorios' });

  const result = await composio.executeAction(tool, action, params);
  res.json(result);
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Olympus AI v2 Advanced', models: Object.keys(agent.models) });
});

app.get('/api/olympus/stats', (req, res) => {
  res.json({ service: 'Olympus AI v2', uptime: process.uptime(), requestsProcessed: logs.length });
});

app.use((req, res) => res.status(404).json({ error: 'Nao encontrado' }));

async function callModel(modelName, messages) {
  if (modelName === 'gpt') return !process.env.OPENAI_API_KEY ? { error: 'OpenAI nao configurado' } : await callOpenAI(messages);
  if (modelName === 'claude') return !process.env.ANTHROPIC_API_KEY ? { error: 'Anthropic nao configurado' } : await callAnthropic(messages);
  if (modelName === 'gemini') return !process.env.GOOGLE_API_KEY ? { error: 'Google nao configurado' } : await callGoogle(messages);
  return { error: 'Modelo desconhecido' };
}

async function callOpenAI(messages) {
  try {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({ model: 'gpt-4o', messages, max_tokens: 2000 })
    });
    const data = await r.json();
    if (data.error) return { error: data.error.message };
    return { reply: data.choices[0].message.content };
  } catch (err) { return { error: err.message }; }
}

async function callAnthropic(messages) {
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-3-5-sonnet-20241022', max_tokens: 2000, messages })
    });
    const data = await r.json();
    if (data.error) return { error: data.error.message };
    return { reply: data.content[0].text };
  } catch (err) { return { error: err.message }; }
}

async function callGoogle(messages) {
  try {
    const lastMsg = messages[messages.length - 1].content;
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: lastMsg }] }], generationConfig: { maxOutputTokens: 2000 } })
    });
    const data = await r.json();
    if (data.error) return { error: data.error.message };
    if (!data.candidates) return { error: 'Sem resposta' };
    return { reply: data.candidates[0].content.parts[0].text };
  } catch (err) { return { error: err.message }; }
}

const server = app.listen(PORT, () => {
  console.log('\n\ud83d\udd3a OLYMPUS AI v2 ADVANCED - Iniciado!\n');
  console.log(`Port: ${PORT}`);
  console.log(`Health: http://localhost:${PORT}/health`);
  console.log(`Chat: POST /api/olympus`);
  console.log(`Composio: GET /api/olympus/composio/tools\n`);
});

process.on('SIGTERM', () => { server.close(() => process.exit(0)); });
