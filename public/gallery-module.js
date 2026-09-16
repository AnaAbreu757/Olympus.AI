export function initGalleryModule() {
  const promptInput = document.getElementById('image-prompt');
  const generateBtn = document.getElementById('generate-image-btn');
  const galleryGrid = document.getElementById('gallery-grid');

  let images = [];

  generateBtn.addEventListener('click', () => generateImage());
  promptInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.ctrlKey) generateImage();
  });

  function generateImage() {
    const prompt = promptInput.value.trim();
    if (!prompt) {
      alert('Escreve um prompt para gerar uma imagem!');
      return;
    }

    generateBtn.disabled = true;
    generateBtn.textContent = 'A gerar...';

    const colors = ['FF6B6B', '4ECDC4', '45B7D1', 'FFA07A', '98D8C8', 'F7DC6F'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const imageUrl = `https://via.placeholder.com/300x300/${color}/FFFFFF?text=${encodeURIComponent(prompt.substring(0, 50))}`;

    const item = {
      id: Date.now(),
      prompt,
      url: imageUrl,
      timestamp: new Date()
    };

    images.unshift(item);
    renderGallery();
    promptInput.value = '';

    generateBtn.disabled = false;
    generateBtn.textContent = 'Gerar';
  }

  function renderGallery() {
    if (images.length === 0) {
      galleryGrid.innerHTML = `
        <div class="empty-gallery">
          <div class="empty-gallery-icon">✨</div>
          <p>Nenhuma imagem ainda. Escreve um prompt e clica em "Gerar".</p>
        </div>
      `;
      return;
    }

    galleryGrid.innerHTML = images.map(img => `
      <div class="gallery-item" title="${img.prompt}">
        <img src="${img.url}" alt="${img.prompt}">
      </div>
    `).join('');

    document.querySelectorAll('.gallery-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const img = item.querySelector('img');
        console.log('Clicaste em:', img.alt);
      });
    });
  }

  renderGallery();
}
