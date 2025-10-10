// Article interactions: Like & Share counters, share popups, and local persistence
(function () {
  const normalizePath = (p) => p.replace(/\/?index\.html$/, '/').replace(/\.html$/, '');
  const path = normalizePath(window.location.pathname);

  // Initial dummy mapping (per request)
  const initialMap = {
    "/articles/teknologi-edukasi-modern": { likes: 1247, shares: 529 },
    "/articles/inovasi-esport-digital": { likes: 1361, shares: 684 },
    "/articles/tren-fnb-2025": { likes: 1192, shares: 471 },
    "/business/system": { likes: 1305, shares: 603 },
    "/articles/jasa-website-murah-jakarta-selatan": { likes: 1284, shares: 552 },
  };

  const defaults = { likes: 800, shares: 532 };
  const { likes: initialLikes, shares: initialShares } = initialMap[path] || defaults;

  const likeBtn = document.getElementById('likeBtn');
  const likeIcon = document.getElementById('likeIcon');
  const likeCountEl = document.getElementById('likeCount');
  const shareTotalEl = document.getElementById('shareTotal');
  const shareButtons = document.querySelectorAll('[data-share]');
  const copyBtn = document.getElementById('copyLinkBtn');

  if (!likeBtn || !likeCountEl || !shareTotalEl) return;

  // Initialize counts from localStorage (persist increments per device)
  const likeKey = `liked:${path}`;
  const likeCountKey = `likeCount:${path}`;
  const shareCountKey = `shareCount:${path}`;

  const storedLiked = localStorage.getItem(likeKey) === 'true';
  const storedLikes = parseInt(localStorage.getItem(likeCountKey) || '', 10);
  const storedShares = parseInt(localStorage.getItem(shareCountKey) || '', 10);

  let likeCount = Number.isFinite(storedLikes) ? storedLikes : initialLikes;
  let shareCount = Number.isFinite(storedShares) ? storedShares : initialShares;

  const setLikedUI = (liked) => {
    if (liked) {
      likeBtn.classList.add('bg-red-600', 'text-white');
      likeBtn.classList.remove('bg-white', 'text-gray-700');
      if (likeIcon) likeIcon.classList.add('text-white');
    } else {
      likeBtn.classList.remove('bg-red-600', 'text-white');
      likeBtn.classList.add('bg-white', 'text-gray-700');
      if (likeIcon) likeIcon.classList.remove('text-white');
    }
  };

  // Render initial
  likeCountEl.textContent = String(likeCount);
  shareTotalEl.textContent = String(shareCount);
  setLikedUI(storedLiked);

  likeBtn.addEventListener('click', () => {
    if (localStorage.getItem(likeKey) === 'true') return; // prevent double-like
    likeCount += 1;
    likeCountEl.textContent = String(likeCount);
    localStorage.setItem(likeKey, 'true');
    localStorage.setItem(likeCountKey, String(likeCount));
    setLikedUI(true);
    // tiny pulse animation
    likeBtn.classList.add('animate-pulse');
    setTimeout(() => likeBtn.classList.remove('animate-pulse'), 300);
  });

  function openSharePopup(url) {
    const w = 600, h = 520;
    const y = window.top.outerHeight / 2 + window.top.screenY - (h / 2);
    const x = window.top.outerWidth / 2 + window.top.screenX - (w / 2);
    window.open(url, 'share', `width=${w},height=${h},top=${y},left=${x}`);
  }

  function bumpShare() {
    shareCount += 1;
    shareTotalEl.textContent = String(shareCount);
    localStorage.setItem(shareCountKey, String(shareCount));
  }

  shareButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const type = btn.getAttribute('data-share');
      const pageUrl = encodeURIComponent(window.location.href);
      const pageTitle = encodeURIComponent(document.title);
      let shareUrl = '';
      if (type === 'facebook') {
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`;
      } else if (type === 'twitter') {
        shareUrl = `https://twitter.com/intent/tweet?url=${pageUrl}&text=${pageTitle}`;
      } else if (type === 'whatsapp') {
        shareUrl = `https://api.whatsapp.com/send?text=${pageTitle}%20${pageUrl}`;
      }
      if (shareUrl) openSharePopup(shareUrl);
      bumpShare();
      btn.classList.add('animate-pulse');
      setTimeout(() => btn.classList.remove('animate-pulse'), 250);
    });
  });

  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(window.location.href);
        bumpShare();
        copyBtn.classList.add('animate-pulse');
        setTimeout(() => copyBtn.classList.remove('animate-pulse'), 250);
      } catch (e) {
        // ignore
      }
    });
  }
})();

