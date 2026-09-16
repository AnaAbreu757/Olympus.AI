export function initCodeModule() {
  const codeInput = document.getElementById('code-input');
  const runBtn = document.getElementById('run-code-btn');
  const clearBtn = document.getElementById('clear-code-btn');
  const explainBtn = document.getElementById('ask-claude-code-btn');
  const output = document.getElementById('code-output');

  runBtn.addEventListener('click', () => executeCode());
  clearBtn.addEventListener('click', () => {
    codeInput.value = '';
    output.textContent = 'Corre o codigo e o resultado aparecera aqui...';
    output.classList.remove('success', 'error');
  });
  explainBtn.addEventListener('click', () => explainCode());

  function executeCode() {
    const code = codeInput.value.trim();
    if (!code) {
      output.textContent = 'Escreve codigo primeiro!';
      output.classList.add('error');
      return;
    }

    output.textContent = 'A executar...';
    output.classList.remove('success', 'error');

    try {
      const logs = [];
      const originalLog = console.log;
      console.log = (...args) => {
        logs.push(args.map(arg => {
          if (typeof arg === 'object') return JSON.stringify(arg, null, 2);
          return String(arg);
        }).join(' '));
      };

      eval(code);
      console.log = originalLog;

      if (logs.length > 0) {
        output.textContent = logs.join('\n');
        output.classList.add('success');
      } else {
        output.textContent = 'Codigo executado sem erros (sem output).';
        output.classList.add('success');
      }
    } catch (err) {
      output.textContent = `Erro: ${err.message}`;
      output.classList.add('error');
    }
  }

  function explainCode() {
    const code = codeInput.value.trim();
    if (!code) {
      output.textContent = 'Escreve codigo primeiro!';
      output.classList.add('error');
      return;
    }

    output.textContent = 'Claude esta a analisar o codigo...';
    output.classList.remove('success', 'error');

    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'anthropic',
        messages: [
          {
            role: 'user',
            content: `Explica este codigo em portugues, de forma clara e concisa:\n\n${code}`
          }
        ]
      })
    })
      .then(r => r.json())
      .then(data => {
        if (data.error) {
          output.textContent = `Erro: ${data.error}`;
          output.classList.add('error');
        } else {
          output.textContent = data.reply;
          output.classList.add('success');
        }
      })
      .catch(err => {
        output.textContent = `Erro: ${err.message}`;
        output.classList.add('error');
      });
  }
}
