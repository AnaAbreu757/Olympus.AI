# Olympus AI

O teu próprio hub de IA: chat, código e imagens, numa só interface.

## Fase atual: Chat

Esta primeira versão tem o **chat de texto** a funcionar, com escolha entre GPT (OpenAI), Claude (Anthropic) e Gemini (Google). Os painéis de **Código** e **Imagens** já aparecem na barra lateral, mas ainda estão vazios — são a próxima fase.

## Como correr localmente

1. Entra na pasta `server`:
   ```
   cd server
   npm install
   ```
2. Copia o ficheiro de exemplo e cola as tuas chaves:
   ```
   cp .env.example .env
   ```
   Depois abre o `.env` e preenche `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_API_KEY` (só precisas de preencher as que fores usar).
3. Arranca o servidor:
   ```
   npm start
   ```
4. Abre o browser em `http://localhost:3000`

## Estrutura do projeto

```
olympus-ai/
├── server/          → backend (Node/Express), guarda as chaves em segurança
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── public/          → frontend (HTML/CSS/JS puro, sem build step)
│   ├── index.html
│   ├── style.css
│   └── app.js
└── .gitignore
```

## Roteiro (próximas fases)

- [ ] Painel de código — estilo consola/terminal, com execução real
- [ ] Galeria de imagens — geração via Gemini/DALL·E, layout "mini-museu"
- [ ] Memória de conversas (guardar histórico entre sessões)
- [ ] Navegação web / pesquisa em tempo real
- [ ] Apps móvel e desktop
