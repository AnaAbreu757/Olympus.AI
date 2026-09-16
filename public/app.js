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

let history = [];
let currentUser = null;
let currentProvider = 'google';

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
  } else {
    loginScreen.hidden = false;
    appEl.hidden = true;
    history = [];
  }
});

function renderHistory() {
  thread.innerHTML = '';
  if (history.length === 0) {
    thread.innerHTML = `
      <div class="empty-state">
        <div class="empty-glyph">O</div>
        <p>Escolhe um modelo acima e escreve a tua primeira mensagem.</p>
      </div>`;
    return;
  }
  history.forEach((m) => addMessage(m.role, m.content));
}

function addMessage(role, text) {
  const emptyState = thread.querySelector('.empty-state');
  if (emptyState) emptyState.remove();
  const el = document.createElement('div');
  el.className = `msg ${role}`;
  el.innerHTML = sanitizeAndFormatText(text);
  thread.appendChild(el);
  thread.scrollTop = thread.scrollHeight;
  return el;
}

function sanitizeAndFormatText(text) {
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  html = html
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/_(.+?)_/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>');
  return html;
}

document.querySelectorAll('.rail-item').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.rail-item').forEach((b) => b.classList.remove('active'));
    document.querySelectorAll('.view').forEach((v) => v.classList.remove('active'));
    btn.classList.add('active');
    document.querySelector(`.view-${btn.dataset.view}`).classList.add('active');
  });
});

document.querySelectorAll('.pantheon-chip').forEach((chip) => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.pantheon-chip').forEach((c) => c.classList.remove('active'));
    chip.classList.add('active');
    currentProvider = chip.dataset.provider;
  });
});

document.querySelector('.pantheon-chip[data-provider="google"]')?.classList.add('active');
document.querySelector('.pantheon-chip[data-provider="openai"]')?.classList.remove('active');

composer.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text || !currentUser) return;

  addMessage('user', text);
  history.push({ role: 'user', content: text });
  input.value = '';
  input.style.height = 'auto';

  const pending = addMessage('assistant', 'A pensar...');
  pending.classList.add('pending');

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider: currentProvider, messages: history }),
    });
    const data = await res.json();

    if (data.error) {
      pending.innerHTML = sanitizeAndFormatText(`Erro: ${data.error}`);
      pending.classList.remove('pending');
      return;
    }

    pending.innerHTML = sanitizeAndFormatText(data.reply);
    pending.classList.remove('pending');
    history.push({ role: 'assistant', content: data.reply });

    try {
      await saveHistory(currentUser.uid, history);
    } catch (err) {
      console.error('Erro ao guardar historico:', err);
    }
  } catch (err) {
    pending.innerHTML = sanitizeAndFormatText('Nao consegui ligar ao servidor.');
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

console.log('Olympus AI iniciado');
