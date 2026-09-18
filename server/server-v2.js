// Olympus AI Server v2 - IA Propria com Routing Inteligente + Composio

require('dotenv').config();
const express = require('express');
const path = require('path');
const { OlympusAgent } = require('./olympus-agent');

const app = express();
const PORT = process.env.PORT || 3000;
const agent = new OlympusAgent();

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

// Principal: Olympus AI Unified
app.post('/api/olympus', async (req, res) => {
  const ip = req.ip || req.connection.remoteAddress;
  if (!checkRateLimit(ip)) return res.status(429).json({ error: 'Limite de taxa atingido.' });

  const { query, messages = [], context = {}, useChainOfThought = false } = req.body;

  if (!query && messages.length === 0) {
    return res.status(400).json({ error: 'Query ou messages sao obrigatorios.' });
  }

  try {
    const { selectedModel, confidence } = agent.selectBestModel(
      query || messages[messages.length - 1].content,
      context
    );

    const taskType = selectedModel === 'claude' ? 'code' : selectedModel === 'gpt' ? 'creative' : 'research';
    const systemPrompt = agent.getSystemPrompt(taskType);
    
    let finalMessages = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];

    if (useChainOfThought && query) {
      const cot = agent.getChainOfThoughtPrompt(query);
      finalMessages.push({ role: 'user', content: cot });
      let reasoningResponse = await callModel(selectedModel, finalMessages);
      if (reasoningResponse.error) throw reasoningResponse;
      finalMessages.push({ role: 'assistant', content: reasoningResponse.reply });
      finalMessages.push({ role: 'user', content: query });
    } else if (query) {
      finalMessages.push({ role: 'user', content: query });
    }

    const response = await callModel(selectedModel, finalMessages);
    
    if (response.error) {
      const fallback = selectedModel === 'gpt' ? 'claude' : 'gemini';
      const fallbackResponse = await callModel(fallback, finalMessages);
      if (fallbackResponse.error) throw fallbackResponse;
      return res.json({
        reply: fallbackResponse.reply,
        model: fallback,
        confidence: 0.6,
        fallback: true
      });
    }

    return res.json({
      reply: response.reply,
      model: selectedModel,
      modelName: agent.models[selectedModel].name,
      confidence,
      reasoning: useChainOfThought,
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error('[Olympus Error]', err);
    return res.status(500).json({ error: 'Erro: ' + err.message });
  }
});

// Codigo
app.post('/api/olympus/code', async (req, res) => {
  const ip = req.ip || req.connection.remoteAddress;
  if (!checkRateLimit(ip)) return res.status(429).json({ error: 'Limite de taxa atingido.' });

  const { code, language = 'javascript', analyze = true } = req.body;
  if (!code) return res.status(400).json({ error: 'Codigo e obrigatorio.' });

  try {
    let output = '';
    let error = null;

    if (language === 'javascript') {
      const logs = [];
      const originalLog = console.log;
      console.log = (...args) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' '));
      try {
        eval(code);
        output = logs.join('\n') || 'Codigo executado.';
      } catch (e) {
        error = e.message;
      } finally {
        console.log = originalLog;
      }
    } else {
      output = `Linguagem ${language} nao pode ser executada.`;
    }

    let analysis = '';
    if (analyze) {
      const analysisRes = await callModel('claude', [{ role: 'user', content: `Analisa este codigo ${language}:\n\n${code}` }]);
      analysis = analysisRes.error ? '' : analysisRes.reply;
    }

    return res.json({ language, output: output || error, error: error ? true : false, analysis });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Composio Tools
app.get('/api/olympus/composio/tools', async (req, res) => {
  try {
    const tools = [
      { id: 'slack', name: 'Slack', category: 'communication' },
      { id: 'gmail', name: 'Gmail', category: 'email' },
      { id: 'github', name: 'GitHub', category: 'developer' },
      { id: 'notion', name: 'Notion', category: 'productivity' },
      { id: 'jira', name: 'Jira', category: 'project-management' },
      { id: 'shopify', name: 'Shopify', category: 'ecommerce' },
      { id: 'stripe', name: 'Stripe', category: 'payments' }
    ];
    res.json({ tools, total: tools.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reasoning
app.post('/api/olympus/reason', async (req, res) => {
  const ip = req.ip || req.connection.remoteAddress;
  if (!checkRateLimit(ip)) return res.status(429).json({ error: 'Limite de taxa atingido.' });

  const { problem, steps = 5 } = req.body;
  if (!problem) return res.status(400).json({ error: 'Problem e obrigatorio.' });

  try {
    const reasoningPrompt = `Resolve este problema passo a passo (maximo ${steps} passos):\n\n${problem}`;
    const response = await callModel('claude', [{ role: 'user', content: reasoningPrompt }]);
    if (response.error) throw response;
    return res.json({ problem, reasoning: response.reply, model: 'claude', timestamp: new Date().toISOString() });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Olympus AI v2', models: Object.keys(agent.models) });
});

app.use((req, res) => res.status(404).json({ error: 'Rota nao encontrada.' }));

// Model Calls
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
      body: JSON.stringify({ model: 'gpt-4o', messages, temperature: 0.7, max_tokens: 2000 })
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
    if (!data.candidates) return { error: 'Nenhuma resposta' };
    return { reply: data.candidates[0].content.parts[0].text };
  } catch (err) { return { error: err.message }; }
}

const server = app.listen(PORT, () => {
  console.log('\n🔺 OLYMPUS AI v2 - Iniciado com Sucesso\n');
  console.log(`✓ Porta: ${PORT}`);
  console.log(`✓ Principal: http://localhost:${PORT}/api/olympus`);
  console.log(`✓ Codigo: http://localhost:${PORT}/api/olympus/code`);
  console.log(`✓ Reasoning: http://localhost:${PORT}/api/olympus/reason`);
  console.log(`✓ Composio: http://localhost:${PORT}/api/olympus/composio/tools\n`);
});

process.on('SIGTERM', () => { server.close(() => process.exit(0)); });
