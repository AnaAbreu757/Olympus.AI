import { login, logout, watchAuth, saveHistory, loadHistory } from "./firebase-init.js";

const loginScreen = document.getElementById('login-screen');
const appEl = document.getElementById('app');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');

const thread = document.getElementById('thread');
const composer = document.getElementById('composer');
const input = document.getElementById('input');

let history = [];
let currentUser = null;

loginBtn.addEventListener('click', () => {
  login().catch((err) => alert('Nao consegui entrar: ' + err.message));
});

logoutBtn.addEventListener('click', () => {
  logout();
});

watchAuth(async (user) => {
  currentUser = user;

  if (user) {
    loginScreen.hidden = true;
    appEl.hidden = false;
    history = await loadHistory(user.uid);
    renderHistory();
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

document.querySelectorAll('.rail-item').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.rail-item').forEach((b) => b.classList.remove('active'));
    document.querySelectorAll('.view').forEach((v) => v.classList.remove('active'));
    btn.classList.add('active');
    document.querySelector(`.view-${btn.dataset.view}`).classList.add('active');
  });
});

let currentProvider = 'google';
document.querySelectorAll('.pantheon-chip').forEach((chip) => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.pantheon-chip').forEach((c) => c.classList.remove('active'));
    chip.classList.add('active');
    currentProvider = chip.dataset.provider;
  });
});
document.querySelector('.pantheon-chip[data-provider="google"]')?.classList.add('active');
document.querySelector('.pantheon-chip[data-provider="openai"]')?.classList.remove('active');

function addMessage(role, text) {
  const emptyState = thread.querySelector('.empty-state');
  if (emptyState) emptyState.remove();

  const el = document.createElement('div');
  el.className = `msg ${role}`;
  el.textContent = text;
  thread.appendChild(el);
  thread.scrollTop = thread.scrollHeight;
  return el;
}

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
      pending.textContent = 'Erro: ' + data.error;
      pending.classList.remove('pending');
      return;
    }

    pending.textContent = data.reply;
    pending.classList.remove('pending');
    history.push({ role: 'assistant', content: data.reply });

    await saveHistory(currentUser.uid, history);
  } catch (err) {
    pending.textContent = 'Nao consegui ligar ao servidor. Confirma que o "npm start" esta a correr.';
    pending.classList.remove('pending');
  }
});

input.addEventListener('input', () => {
  input.style.height = 'auto';
  input.style.height = input.scrollHeight + 'px';
});

input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    composer.requestSubmit();
  }
});
