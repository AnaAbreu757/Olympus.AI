# Olympus AI

O teu proprio hub de IA: chat, codigo e imagens, numa so interface.

## Fase atual: Chat

Esta primeira versao tem o **chat de texto** a funcionar, com escolha entre GPT (OpenAI), Claude (Anthropic) e Gemini (Google). Os paineis de **Codigo** e **Imagens** ja aparecem na barra lateral, mas ainda estao vazios - sao a proxima fase.

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
   Depois abre o `.env` e preenche pelo menos `GOOGLE_API_KEY` (gratuita, via aistudio.google.com). `OPENAI_API_KEY` e `ANTHROPIC_API_KEY` sao opcionais e pedem cartao associado.
3. Abre `public/firebase-config.js` e substitui os valores `"COLA_AQUI"` pela configuracao do teu projeto Firebase (Firebase Console -> Project settings -> Your apps -> icone Web).
4. Arranca o servidor:
   ```
   npm start
   ```
5. Abre o browser em `http://localhost:3000`, faz login com Google, e comeca a conversar.

### Firebase (login + sincronizacao entre dispositivos)

1. Cria um projeto em console.firebase.google.com.
2. Em **Authentication -> Sign-in method**, ativa o fornecedor **Google**.
3. Em **Firestore Database**, cria uma base de dados (modo de teste para comecar).
4. Em **Project settings -> Your apps**, regista uma app Web e copia a configuracao para `public/firebase-config.js`.

Com isto, cada utilizador entra com a conta Google e a conversa fica guardada no Firestore - abre noutro telemovel ou computador e a conversa continua onde ficou.

## Estrutura do projeto

```
olympus-ai/
|- server/          -> backend (Node/Express), guarda as chaves em seguranca
|  |- server.js
|  |- package.json
|  `- .env.example
|- public/          -> frontend (HTML/CSS/JS puro, sem build step)
|  |- index.html
|  |- style.css
|  |- app.js
|  |- firebase-init.js
|  `- firebase-config.js   -> cola aqui a tua configuracao Firebase
`- .gitignore
```

## Roteiro (proximas fases)

- [ ] Painel de codigo - estilo consola/terminal, com execucao real
- [ ] Galeria de imagens - geracao via Gemini/DALL-E, layout "mini-museu"
- [ ] Memoria de conversas (guardar historico entre sessoes)
- [ ] Navegacao web / pesquisa em tempo real
- [ ] Apps movel e desktop

## Enviar para o GitHub

Ja esta ligado - o Claude faz push diretamente via GitHub, nao precisas de correr comandos manuais.
