// Olympus AI — servidor
// Este servidor guarda as tuas chaves de API em segurança (nunca no frontend)
// e serve de ponte entre a interface e os modelos (OpenAI / Anthropic / Google).

require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

const PORT = process.env.PORT || 3000;

// --- Rota principal de chat ---
// O frontend envia: { provider: "openai" | "anthropic" | "google", messages: [...] }
app.post('/api/chat', async (req, res) => {
  const { provider, messages } = req.body;

  try {
    if (provider === 'openai') {
      if (!process.env.OPENAI_API_KEY) {
        return res.status(400).json({ error: 'Falta a OPENAI_API_KEY no ficheiro .env' });
      }
      const r = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages,
        }),
      });
      const data = await r.json();
      if (data.error) return res.status(500).json({ error: data.error.message });
      return res.json({ reply: data.choices[0].message.content });
    }

    if (provider === 'anthropic') {
      if (!process.env.ANTHROPIC_API_KEY) {
        return res.status(400).json({ error: 'Falta a ANTHROPIC_API_KEY no ficheiro .env' });
      }
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1024,
          messages,
        }),
      });
      const data = await r.json();
      if (data.error) return res.status(500).json({ error: data.error.message });
      return res.json({ reply: data.content[0].text });
    }

    if (provider === 'google') {
      if (!process.env.GOOGLE_API_KEY) {
        return res.status(400).json({ error: 'Falta a GOOGLE_API_KEY no ficheiro .env' });
      }
      const lastUserMsg = messages[messages.length - 1].content;
      const r = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: lastUserMsg }] }],
          }),
        }
      );
      const data = await r.json();
      if (data.error) return res.status(500).json({ error: data.error.message });
      return res.json({ reply: data.candidates[0].content.parts[0].text });
    }

    return res.status(400).json({ error: 'Provider desconhecido' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro no servidor: ' + err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Olympus AI a correr em http://localhost:${PORT}`);
});
