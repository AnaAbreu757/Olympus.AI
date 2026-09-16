# Olympus AI

O teu proprio hub de IA: chat com Gemini/GPT/Claude, codigo e imagens, numa so interface minimalista e responsiva.

## Funcionalidades

✅ **Chat multi-modelo** — Escolhe entre Gemini (gratuito), GPT-4 ou Claude  
✅ **Login com Google** — Uma conta, sincronizado em todos os dispositivos  
✅ **Conversas persistentes** — Historico guardado no Firebase, continua onde ficou  
✅ **Design minimalista** — Inspirado em WHOOP e iPhone, ouro e preto  
✅ **Pronto para producao** — Publicado em Render (ou Railway) com um clique  

## Comecar localmente (5 minutos)

1. **Clone o repositorio:**
   ```bash
   git clone https://github.com/SEU_USERNAME/Olympus.AI.git
   cd Olympus.AI
   ```

2. **Configura o backend:**
   ```bash
   cd server
   cp .env.example .env
   # Edita .env e cola: GOOGLE_API_KEY=YOUR_KEY_HERE
   npm install
   ```

3. **Configura o Firebase** (ja pronto no codigo):
   - A configuracao esta em `public/firebase-config.js` (ja atualizada com o teu projeto)

4. **Corre localmente:**
   ```bash
   npm start
   # Abre http://localhost:3000
   ```

## Publicar online em 2 minutos (Render)

1. Entra em **render.com** → "New+" → "Web Service"
2. Liga o teu repositorio GitHub (Olympus.AI)
3. As definicoes ja aparecem auto-preenchidas do ficheiro `render.yaml`
4. Adiciona a variavel de ambiente `GOOGLE_API_KEY` no painel do Render
5. Clica em "Create Web Service"

Em 2-3 minutos, a tua app esta online em `https://olympus-ai-XXXXX.onrender.com`

## Estrutura

```
olympus-ai/
|- server/
|  |- server-prod.js      (servidor otimizado para producao)
|  |- server.js           (versao dev)
|  |- package.json
|  `- .env.example
|- public/
|  |- index.html
|  |- style.css
|  |- app.js
|  |- firebase-init.js
|  `- firebase-config.js  (configuracao do Firebase)
|- render.yaml             (deploy automatico)
`- Procfile               (instrucao de startup)
```

## Modelos disponiveis

| Modelo | Gratuito | Qualidade | Velocidade |
|--------|----------|-----------|----------|
| Gemini 2.0 Flash | ✅ Sim | Muito boa | Rapido |
| GPT-4o mini | ❌ Pago | Excelente | Medio |
| Claude 3.5 Sonnet | ❌ Pago | Excelente | Medio |
