# Guia de Deployment -- Olympus AI

## Deploy Render (Recomendado)

### 1. Preparar
- Codigo ja esta no GitHub
- `render.yaml` ja configura tudo

### 2. Criar Web Service
1. render.com → Login com GitHub
2. "New +" → "Web Service"
3. Seleciona `AnaAbreu757/Olympus.AI`
4. Deixa as definicoes (render.yaml ja tem)
5. "Create Web Service"

### 3. Variavel de Ambiente
1. No painel do Render → Environment
2. Add Variable:
   - Key: `GOOGLE_API_KEY`
   - Value: `AIzaSyCwyUU3C52mYunwhVlMVb2VX8QoZ2NHMoY`
3. Save

### 4. Pronto!
- Deploy em 2-3 minutos
- App em: `https://olympus-ai-XXXXX.onrender.com`

---

## Deploy Automatico (Opcional)

1. Render Dashboard → Settings → Deploy Hook
2. Copia o URL
3. GitHub → Settings → Secrets → New Secret
   - Name: `RENDER_DEPLOY_HOOK`
   - Value: [URL copiado]
4. Feito! Cada push faz deploy automatico.

---

## Local Dev

```bash
git clone https://github.com/AnaAbreu757/Olympus.AI.git
cd Olympus.AI/server
cp .env.example .env
# Cola GOOGLE_API_KEY no .env
npm install && npm start
# http://localhost:3000
```

---

## Troubleshooting

**Build falhou?**
- Render.yaml configurado corretamente ✓
- `npm install` em `/server` ✓

**Port em uso?**
- .env: `PORT=3001`

**Erro Firebase?**
- `firebase-config.js` tem os valores? (projectId, etc)

---

## Depois do Deploy

✓ Testa chat, codigo, imagens
✓ Experimenta diferentes modelos
✓ Adiciona amigos
✓ Customiza (opcional)

Olympus AI v1.0 -- Pronto!
