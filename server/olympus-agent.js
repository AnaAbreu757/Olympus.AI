// Olympus AI Agent - IA Propria que combina GPT, Claude, Gemini inteligentemente

const express = require('express');
const router = express.Router();
require('dotenv').config();

// Sistema de routing inteligente
class OlympusAgent {
  constructor() {
    this.models = {
      gpt: {
        name: 'GPT-4o',
        provider: 'openai',
        strengths: ['creative writing', 'analysis', 'conversation'],
        speed: 'medium',
        cost: 'high'
      },
      claude: {
        name: 'Claude 3.5 Sonnet',
        provider: 'anthropic',
        strengths: ['code', 'reasoning', 'technical', 'research'],
        speed: 'medium',
        cost: 'high'
      },
      gemini: {
        name: 'Gemini 2.0 Flash',
        provider: 'google',
        strengths: ['multimodal', 'fast', 'reasoning'],
        speed: 'fast',
        cost: 'free'
      }
    };
  }

  selectBestModel(query, context = {}) {
    const queryLower = query.toLowerCase();
    let selectedModel = 'gemini';
    let confidence = 0.6;

    if (queryLower.includes('code') || queryLower.includes('debug') || queryLower.includes('programa')) {
      selectedModel = 'claude';
      confidence = 0.95;
    } else if (queryLower.includes('criativ') || queryLower.includes('story') || queryLower.includes('escrev')) {
      selectedModel = 'gpt';
      confidence = 0.85;
    } else if (queryLower.includes('rapid') || queryLower.includes('quick') || queryLower.includes('fast')) {
      selectedModel = 'gemini';
      confidence = 0.8;
    } else if (queryLower.includes('profund') || queryLower.includes('research') || queryLower.includes('analise')) {
      selectedModel = context.lastModel === 'gpt' ? 'claude' : 'gpt';
      confidence = 0.75;
    }

    return { selectedModel, confidence };
  }

  getSystemPrompt(task = 'general') {
    const prompts = {
      general: `Voce e Olympus, uma IA unificada que combina o melhor de GPT, Claude e Gemini.

Caracteristicas:
- Conhecimento vasto
- Excelente em codigo, criatividade, analise
- Direto, preciso, util
- Adapta-se ao usuario

Abordagem: Entende profundamente, responde de forma util, explica raciocinio.`,
      
      code: `Voce e Olympus, especialista em programacao.

Capacidades: Codigo limpo, debug, multiplas linguagens, seguranca.

Abordagem: Problema -> Solucao -> Explicacao -> Melhorias.`,
      
      creative: `Voce e Olympus, mestre criativo.

Capacidades: Escrita criativa, storytelling, ideacao, originalidade.

Abordagem: Visao -> Conteudo original -> Multiplas perspectivas.`,
      
      research: `Voce e Olympus, pesquisador profundo.

Capacidades: Analise profunda, conexoes complexas, pensamento critico.

Abordagem: Mapeia -> Analisa -> Identifica nuances -> Conclui.`
    };
    return prompts[task] || prompts.general;
  }

  getChainOfThoughtPrompt(query) {
    return `Vamos pensar passo a passo:
1. Tipo de pergunta?
2. Conhecimento necessario?
3. Melhor abordagem?
4. Pontos-chave?
5. Resposta mais util?

Pergunta: ${query}

Raciocinio:`;
  }
}

module.exports = { OlympusAgent };
