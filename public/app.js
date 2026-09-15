// --- Navegação entre vistas (Chat / Código / Imagens) ---
document.querySelectorAll('.rail-item').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.rail-item').forEach((b) => b.classList.remove('active'));
    document.querySelectorAll('.view').forEach((v) => v.classList.remove('active'));
    btn.classList.add('active');
    document.querySelector(`.view-${btn.dataset.view}`).classList.add('active');
  });
});

// --- Seleção do modelo (GPT / Claude / Gemini) ---
let currentProvider = 'openai';
document.querySelectorAll('.pantheon-chip').forEach((chip) => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.pantheon-chip').forEach((c) => c.classList.remove('active'));
    chip.classList.add('active');
    currentProvider = chip.dataset.provider;
  });
});

// --- Chat ---
const thread = document.getElementById('thread');
const composer = document.getElementById('composer');
const input = document.getElementById('input');

let history = [];

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
  if (!text) return;

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
  } catch (err) {
    pending.textContent = 'Não consegui ligar ao servidor. Confirma que o "npm start" está a correr.';
    pending.classList.remove('pending');
  }
});

// Textarea cresce automaticamente e Enter envia (Shift+Enter = nova linha)
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
