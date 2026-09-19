# Documentacao API Completa - Olympus AI v2 Advanced

## Introducao

Olympus AI e uma IA unificada que combina GPT-4, Claude 3.5 Sonnet e Gemini 2.0 Flash com suporte a 500+ integracoes via Composio.

## Base URL

`http://localhost:3000` ou `https://olympus-ai-XXXXX.onrender.com`

## Autenticacao

Atualmente, a API nao requer autenticacao (em producao, adicionar JWT).

## Endpoints Principais

### POST /api/olympus

Chat unificado com roteamento inteligente de modelo.

Request:
```json
{
  "query": "Como faço um loop em JavaScript?",
  "messages": [],
  "useChainOfThought": false
}
```

Response:
```json
{
  "reply": "Para fazer um loop em JavaScript, podes usar...",
  "model": "claude",
  "confidence": 0.95,
  "duration": 2350
}
```

### POST /api/olympus/code

Executa codigo e faz analise.

Request:
```json
{
  "code": "console.log('Ola')",
  "language": "javascript",
  "analyze": true
}
```

Response:
```json
{
  "language": "javascript",
  "output": "Ola",
  "error": false,
  "analysis": "Codigo simples e correto."
}
```

### POST /api/olympus/reason

Raciocinio avancado para problemas complexos.

Request:
```json
{
  "problem": "Como otimizar este algoritmo?",
  "steps": 5
}
```

Response:
```json
{
  "problem": "Como otimizar este algoritmo?",
  "reasoning": "Passo 1: Analisar...",
  "model": "claude"
}
```

### GET /api/olympus/composio/tools

Lista 500+ ferramentas disponiveis.

Query parameters:
- `search` (opcional) - Filtrar por nome ou categoria

Response:
```json
{
  "tools": [
    {
      "id": "gmail",
      "name": "Gmail",
      "category": "email",
      "actions": ["send_email", "list_emails"]
    }
  ],
  "total": 500,
  "categories": ["email", "communication", "developer"]
}
```

### POST /api/olympus/composio/execute

Executa uma acao numa ferramenta.

Request:
```json
{
  "tool": "gmail",
  "action": "send_email",
  "params": {
    "to": "user@example.com",
    "subject": "Ola"
  }
}
```

Response:
```json
{
  "status": "success",
  "tool": "gmail",
  "action": "send_email",
  "data": { "messageId": "msg_123" }
}
```

### GET /health

Health check do servidor.

Response:
```json
{
  "status": "ok",
  "service": "Olympus AI v2 Advanced",
  "models": ["gpt", "claude", "gemini"]
}
```

### GET /api/olympus/stats

Estatisticas do servidor.

Response:
```json
{
  "service": "Olympus AI v2",
  "uptime": 3600,
  "requestsProcessed": 150,
  "cacheSize": 45
}
```

## Codigos de Erro

| Codigo | Significado |
|--------|-------------|
| 200 | Sucesso |
| 400 | Bad Request |
| 404 | Not Found |
| 429 | Rate Limited |
| 500 | Server Error |

## Rate Limiting

- Limite: 60 requisicoes
- Janela: 15 minutos
- Por: IP da requisicao

## Exemplos com cURL

### Chat Simples
```bash
curl -X POST http://localhost:3000/api/olympus \
  -H "Content-Type: application/json" \
  -d '{"query": "Qual e a capital de Portugal?"}'
```

### Listar Ferramentas
```bash
curl -X GET "http://localhost:3000/api/olympus/composio/tools?search=email"
```

### Enviar Email
```bash
curl -X POST http://localhost:3000/api/olympus/composio/execute \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "gmail",
    "action": "send_email",
    "params": {"to": "user@example.com", "subject": "Ola"}
  }'
```

## Variaveis de Ambiente

```bash
PORT=3000
GOOGLE_API_KEY=...            # Obrigatorio
OPENAI_API_KEY=...            # Opcional
ANTHROPIC_API_KEY=...         # Opcional
COMPOSIO_API_KEY=...          # Opcional
```

---

Documentacao Completa - v2 Advanced
