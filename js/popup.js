document.addEventListener('DOMContentLoaded', () => {
  const closeButton = document.getElementById('closeButton');
  const langRadioButtons = document.querySelectorAll('input[name="language"]');

  let translations = {};

  closeButton.addEventListener('click', () => {
    window.close();
  });

  langRadioButtons.forEach((button) => {
    button.addEventListener('change', (event) => {
      setLanguage(event.target.value);
    });
  });

  const fetchAndDisplayCookie = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url) {
      try {
        const url = new URL(tab.url);
        const cookieUrl = url.hostname === 'open.spotify.com' ? 'https://open.spotify.com' : url.origin;
        const cookiePath = cookieUrl === 'https://open.spotify.com' ? '/de/' : '';

        if (url.hostname !== 'open.spotify.com') {
          document.getElementById('cookieInfo').style.display = 'none';
          document.getElementById('wrongPageInfo').style.display = 'block';
          document.getElementById('openSpotifyButton').addEventListener('click', () => {
            chrome.tabs.create({ url: 'https://open.spotify.com' });
          });
        } else {
          setTimeout(async () => {
            const cookie = await chrome.cookies.get({ url: cookieUrl + cookiePath, name: 'sp_dc' });
            if (cookie) {
              document.getElementById('cookieValue').textContent = cookie.value;
              document.getElementById('copyButton').addEventListener('click', () => {
                navigator.clipboard.writeText(cookie.value)
                  .then(() => alert(translations.copySuccess))
                  .catch(err => {
                    alert(translations.copyError);
                    console.error(err);
                  });
              });
            } else {
              document.getElementById('cookieValue').textContent = translations.cookieNotFound;
            }
          }, 1000);
        }
      } catch (e) {
        console.error('Invalid URL: ', tab.url);
      }
    }
  };

  const setLanguage = (lang) => {
    fetch(`../localisation/lang_${lang}.json`)
      .then(response => response.json())
      .then(data => {
        translations = data;
        document.getElementById('pluginName').textContent = translations.pluginName;
        document.getElementById('description').textContent = translations.description;
        document.getElementById('cookieFound').textContent = translations.cookieFound;
        document.getElementById('copyButton').textContent = translations.copyButton;
        document.getElementById('wrongPageText').innerHTML = translations.wrongPageInfo;
        document.getElementById('openSpotifyButton').textContent = translations.openSpotifyButton;
      })
      .catch(err => console.error('Error loading language file:', err));
  };

  // Set default language to English
  setLanguage('en');

  fetchAndDisplayCookie();
});
