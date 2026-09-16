# 🔺 Olympus AI

O teu hub de IA: **chat com Gemini/GPT/Claude + código + imagens**, numa única interface elegante e minimalista.

## ✨ Features

- **Chat multi-modelo** — Gemini (gratuito), GPT-4, Claude
- **Executa código** — JavaScript no browser com output em tempo real
- **Gera imagens** — Prompts viram imagens com um clique
- **Login com Google** — Sincronizado em todos os dispositivos
- **Histórico persistente** — Firebase guarda tudo
- **Design limpo** — WHOOP + iPhone style, ouro e preto
- **Pronto para produção** — Deploy no Render em 2 cliques

## 🚀 Deploy Rápido (Render)

1. **Vai a render.com** (login com GitHub)
2. **"New Web Service"** → Seleciona `Olympus.AI`
3. **Deixa render.yaml configurar tudo** ✓
4. **Ambiente → Adiciona:**
   GOOGLE_API_KEY = AIzaSyCwyUU3C52mYunwhVlMVb2VX8QoZ2NHMoY
5. **"Create"** — Pronto em 2-3 minutos! 🎉

👉 [Ver guia completo →](./DEPLOYMENT.md)

## 💻 Local Dev

```bash
git clone https://github.com/AnaAbreu757/Olympus.AI.git
cd Olympus.AI/server
cp .env.example .env
# Cola a chave no .env
npm install && npm start
# Abre http://localhost:3000
```

## 📂 Estrutura

```
olympus-ai/
├── server/              → Backend (Node.js)
├── public/              → Frontend (HTML/CSS/JS)
├── .github/workflows/   → Deploy automatico
├── render.yaml
└── DEPLOYMENT.md        → Guia completo
```

## 🔑 Chaves de API

- **Gemini** (gratuita) → `GOOGLE_API_KEY` ✓
- **GPT-4** (opcional) → `OPENAI_API_KEY`
- **Claude** (opcional) → `ANTHROPIC_API_KEY`

## 🎨 Design

- Cores: Preto + Ouro
- Responsivo: Mobile → Desktop  
- Sem dependencias (JS puro)

## 📱 Funciona em

✅ Desktop
✅ Tablet
✅ Mobile (web app)

## 🛠 Tech Stack

- Frontend: HTML5, CSS3, JavaScript ES6
- Backend: Node.js + Express
- Database: Firebase (Auth + Firestore)
- Deploy: Render + GitHub Actions

## 🚀 Pronto para Usar!

Versao 1.0 — Funcional. Elegante. Simples.

Feito com ❤️
