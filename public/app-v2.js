import { login, logout, watchAuth, saveHistory, loadHistory } from "./firebase-init.js";
import { initCodeModule } from "./code-module.js";
import { initGalleryModule } from "./gallery-module.js";

const loginScreen = document.getElementById('login-screen');
const appEl = document.getElementById('app');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');

const thread = document.getElementById('thread');
const composer = document.getElementById('composer');
const input = document.getElementById('input');

let useChainOfThought = false;
let history = [];
let currentUser = null;

loginBtn.addEventListener('click', async () => {
  try {
    loginBtn.disabled = true;
    loginBtn.textContent = 'A entrar...';
    await login();
  } catch (err) {
    alert('Nao consegui entrar: ' + err.message);
    loginBtn.disabled = false;
    loginBtn.textContent = 'Entrar com Google';
  }
});

logoutBtn.addEventListener('click', async () => {
  if (confirm('Tem a certeza que queres sair?')) {
    await logout();
  }
});

watchAuth(async (user) => {
  currentUser = user;
  if (user) {
    loginScreen.hidden = true;
    appEl.hidden = false;
    try {
      history = await loadHistory(user.uid);
    } catch (err) {
      console.error('Erro ao carregar historico:', err);
      history = [];
    }
    renderHistory();
    initCodeModule();
    initGalleryModule();
    setupAdvancedControls();
  } else {
    loginScreen.hidden = false;
    appEl.hidden = true;
    history = [];
  }
});

function setupAdvancedControls() {
  const chainToggle = document.getElementById('chain-of-thought-toggle');
  const reasonBtn = document.getElementById('reason-btn');
  if (chainToggle) {
    chainToggle.addEventListener('change', (e) => {
      useChainOfThought = e.target.checked;
      updateUIState();
    });
  }
  if (reasonBtn) {
    reasonBtn.addEventListener('click', () => openReasoningPanel());
  }
}

function updateUIState() {
  const indicator = document.getElementById('ai-indicator');
  if (indicator) {
    if (useChainOfThought) {
      indicator.innerHTML = 'Raciocinio Avancado Ativo';
      indicator.style.color = 'var(--gold)';
    } else {
      indicator.innerHTML = 'Modo Rapido';
      indicator.style.color = 'var(--text-dim)';
    }
  }
}

function renderHistory() {
  thread.innerHTML = '';
  if (history.length === 0) {
    thread.innerHTML = `
      <div class="empty-state">
        <div class="empty-glyph">O</div>
        <p>Eu sou Olympus - uma IA que combina o melhor de ChatGPT, Claude e Gemini.</p>
      </div>`;
    return;
  }
  history.forEach((m) => addMessage(m.role, m.content, m.metadata));
}

function addMessage(role, text, metadata = {}) {
  const emptyState = thread.querySelector('.empty-state');
  if (emptyState) emptyState.remove();
  const el = document.createElement('div');
  el.className = `msg ${role}`;
  el.innerHTML = sanitizeAndFormatText(text);
  if (metadata && metadata.model) {
    const meta = document.createElement('div');
    meta.className = 'msg-metadata';
    meta.innerHTML = `<small>Modelo: ${metadata.model}</small>`;
    el.appendChild(meta);
  }
  thread.appendChild(el);
  thread.scrollTop = thread.scrollHeight;
  return el;
}

function sanitizeAndFormatText(text) {
  let html = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/__(.+?)__/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>').replace(/_(.+?)_/g, '<em>$1</em>').replace(/`(.+?)`/g, '<code>$1</code>');
  return html;
}

document.querySelectorAll('.rail-item').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.rail-item').forEach((b) => b.classList.remove('active'));
    document.querySelectorAll('.view').forEach((v) => v.classList.remove('active'));
    btn.classList.add('active');
    const view = document.querySelector(`.view-${btn.dataset.view}`);
    if (view) view.classList.add('active');
  });
});

composer.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text || !currentUser) return;

  addMessage('user', text);
  history.push({ role: 'user', content: text });
  input.value = '';
  input.style.height = 'auto';

  const pending = addMessage('assistant', useChainOfThought ? 'A raciocinar...' : 'A processar...');
  pending.classList.add('pending');

  try {
    const res = await fetch('/api/olympus', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: text, messages: history, useChainOfThought })
    });
    const data = await res.json();

    if (data.error) {
      pending.innerHTML = sanitizeAndFormatText(`Erro: ${data.error}`);
      pending.classList.remove('pending');
      return;
    }

    pending.innerHTML = sanitizeAndFormatText(data.reply);
    if (data.model) {
      const meta = document.createElement('div');
      meta.className = 'msg-metadata';
      meta.innerHTML = `<small>Modelo: ${data.modelName || data.model}</small>`;
      pending.appendChild(meta);
    }
    pending.classList.remove('pending');
    history.push({ role: 'assistant', content: data.reply, metadata: { model: data.modelName } });
    await saveHistory(currentUser.uid, history);
  } catch (err) {
    pending.innerHTML = sanitizeAndFormatText('Erro de conexao.');
    pending.classList.remove('pending');
  }
});

input.addEventListener('input', () => {
  input.style.height = 'auto';
  input.style.height = Math.min(input.scrollHeight, 160) + 'px';
});

input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    composer.requestSubmit();
  }
});

console.log('Olympus AI v2 iniciado');
