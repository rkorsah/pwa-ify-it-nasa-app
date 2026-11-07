const connectionStatus = document.getElementById('connectionStatus');
const installBtn = document.getElementById('installBtn');
const notificationBtn = document.getElementById('notificationBtn');
let installPromptEvent;

function updateConnectionStatus() {
  connectionStatus.hidden = navigator.onLine;
}

window.addEventListener('online', updateConnectionStatus);
window.addEventListener('offline', updateConnectionStatus);
updateConnectionStatus();

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  installPromptEvent = event;
  installBtn.hidden = false;
});

installBtn.addEventListener('click', async () => {
  if (!installPromptEvent) return;

  installPromptEvent.prompt();
  await installPromptEvent.userChoice;
  installPromptEvent = null;
  installBtn.hidden = true;
});

window.addEventListener('appinstalled', () => {
  installPromptEvent = null;
  installBtn.hidden = true;
});

notificationBtn.addEventListener('click', async () => {
  if (!('Notification' in window)) {
    notificationBtn.textContent = 'Notifications are not supported';
    notificationBtn.disabled = true;
    return;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      new Notification('NASA Space Explorer', {
        body: 'Your space images are ready to explore.',
        icon: 'img/icon-192.svg'
      });
      notificationBtn.textContent = 'Demo notification sent';
    } else {
      notificationBtn.textContent = permission === 'denied'
        ? 'Notifications are blocked'
        : 'Notification permission not granted';
    }
  } catch (error) {
    console.error('Notification request failed:', error);
    notificationBtn.textContent = 'Notifications are unavailable';
  }
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').catch((error) => {
      console.error('Service worker registration failed:', error);
    });
  });
}