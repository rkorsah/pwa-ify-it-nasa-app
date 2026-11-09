// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const fetchBtn = document.getElementById('getImagesBtn');
const gallery = document.getElementById('gallery');

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

const BASE_URL = 'https://api.nasa.gov/planetary/apod';
const apiKeyInput = document.getElementById('apiKeyInput');
const saveApiKeyBtn = document.getElementById('saveApiKeyBtn');

function getStoredApiKey() {
  const urlKey = new URLSearchParams(window.location.search).get('api_key');
  if (urlKey) return urlKey;

  const savedKey = localStorage.getItem('nasaApiKey');
  if (savedKey) return savedKey;

  return 'DEMO_KEY';
}

let API_KEY = getStoredApiKey();
apiKeyInput.value = API_KEY === 'DEMO_KEY' ? '' : API_KEY;

saveApiKeyBtn.addEventListener('click', () => {
  const enteredKey = apiKeyInput.value.trim();

  if (!enteredKey) {
    localStorage.removeItem('nasaApiKey');
    API_KEY = 'DEMO_KEY';
    apiKeyInput.value = '';
    saveApiKeyBtn.textContent = 'Using demo key';
    return;
  }

  API_KEY = enteredKey;
  localStorage.setItem('nasaApiKey', enteredKey);
  saveApiKeyBtn.textContent = 'Key saved';
  setTimeout(() => {
    saveApiKeyBtn.textContent = 'Save key';
  }, 1800);
});

fetchBtn.addEventListener('click', () => {
  const startDate = startInput.value;
  const endDate = endInput.value;

  if (!startDate || !endDate) {
    renderMessage('Pick both a start and end date first!');
    return;
  }

  fetchApodRange(startDate, endDate);
});

async function fetchApodRange(startDate, endDate) {
  renderMessage('🔄 Loading space photos…');

  try {
    const url = `${BASE_URL}?api_key=${API_KEY}&start_date=${startDate}&end_date=${endDate}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`NASA API responded with ${response.status}`);
    }

    const data = await response.json();

    // The range endpoint returns oldest-first — flip it so the newest shows up first
    const sorted = data.sort((a, b) => new Date(b.date) - new Date(a.date));
    renderGallery(sorted);
  } catch (err) {
    console.error('Failed to fetch APOD range:', err);
    renderMessage(navigator.onLine
      ? "Something went wrong reaching NASA's servers. Try again in a moment."
      : 'This date range is not cached yet. Reconnect to load these space images.');
  }
}

function renderGallery(items) {
  gallery.innerHTML = '';

  if (items.length === 0) {
    renderMessage('No images found for that date range.');
    return;
  }

  items.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'gallery-item';

    // NOTE: video-entry handling below is one of the optional 25-pt LevelUp
    // extra-credit items in the base project, not guaranteed base functionality.
    // Some students' real code may not have this — adjust to match if needed.
    const mediaHTML =
      item.media_type === 'image'
        ? `<img src="${item.url}" alt="${item.title}" />`
        : `<div class="video-placeholder">🎬 Video — click to watch</div>`;

    card.innerHTML = `
      ${mediaHTML}
      <p><strong>${item.title}</strong><br>${item.date}</p>
    `;

    card.addEventListener('click', () => openModal(item));
    gallery.appendChild(card);
  });
}

function renderMessage(message) {
  gallery.innerHTML = `
    <div class="placeholder">
      <div class="placeholder-icon">🔭</div>
      <p>${message}</p>
    </div>
  `;
}

// ---- Modal ----
const modal = document.getElementById('modal');
const modalBody = document.getElementById('modal-body');
const modalClose = document.getElementById('modal-close');

function openModal(item) {
  const mediaHTML =
    item.media_type === 'image'
      ? `<img src="${item.hdurl || item.url}" alt="${item.title}" />`
      : `<iframe src="${item.url}" allowfullscreen title="${item.title}"></iframe>`;

  modalBody.innerHTML = `
    ${mediaHTML}
    <h2>${item.title}</h2>
    <p class="modal-date">${item.date}</p>
    <p>${item.explanation}</p>
  `;
  modal.classList.remove('hidden');
}

modalClose.addEventListener('click', () => modal.classList.add('hidden'));
modal.addEventListener('click', (e) => {
  if (e.target === modal) modal.classList.add('hidden');
});
