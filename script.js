const FORM_ENDPOINT = "https://formspree.io/f/xljrddqb";

// trueにすると、値段・申し込み・購入まわりを全部隠して、
// 「見るだけのギャラリー」として公開できます。
// 販売の準備ができたら false に戻してください。
const GALLERY_ONLY = true;

let ALL_ITEMS = [];
let CURRENT_YM = null; // "2026-08" の形式

async function init() {
  const res = await fetch('data.json');
  const data = await res.json();
  ALL_ITEMS = data.items;

  // 一番新しい月から開始
  const months = getAvailableMonths();
  CURRENT_YM = months[months.length - 1] || ymNow();

  setupModal();
  setupForm();
  setupMonthNav();
  applyGalleryOnlyMode();
  renderMonth();
}

function applyGalleryOnlyMode() {
  if (!GALLERY_ONLY) return;
  const priceNote = document.querySelector('.price-note');
  if (priceNote) priceNote.classList.add('hidden');
  document.body.classList.add('gallery-only');
}

function ymNow() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function getAvailableMonths() {
  const set = new Set(ALL_ITEMS.map(i => i.date.slice(0, 7)));
  return [...set].sort();
}

function setupMonthNav() {
  document.getElementById('prev-month').addEventListener('click', () => shiftMonth(-1));
  document.getElementById('next-month').addEventListener('click', () => shiftMonth(1));
  document.getElementById('prev-month-bottom').addEventListener('click', () => shiftMonth(-1));
  document.getElementById('next-month-bottom').addEventListener('click', () => shiftMonth(1));
}

function shiftMonth(delta) {
  const [y, m] = CURRENT_YM.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  CURRENT_YM = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  renderMonth();
}

function renderMonth() {
  const [y, m] = CURRENT_YM.split('-');
  document.getElementById('current-month').textContent = `${y}年${Number(m)}月`;
  document.getElementById('current-month-bottom').textContent = `${y}年${Number(m)}月`;

  const items = ALL_ITEMS.filter(i => i.date.slice(0, 7) === CURRENT_YM)
                          .sort((a, b) => a.date.localeCompare(b.date));

  const grid = document.getElementById('calendar-grid');
  const emptyMsg = document.getElementById('empty-msg');
  grid.innerHTML = '';

  if (items.length === 0) {
    emptyMsg.classList.remove('hidden');
    return;
  }
  emptyMsg.classList.add('hidden');

  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'art-card';
    card.dataset.id = item.id;

    const thumbInner = item.image
      ? `<img src="images/${item.image}" alt="${item.title}" loading="lazy">`
      : `🐹`;

    card.innerHTML = `
      <div class="thumb">${thumbInner}</div>
      <div class="card-info">
        <div class="card-date">${formatDate(item.date)}</div>
        <div class="card-title">${item.title}</div>
      </div>
      ${(!GALLERY_ONLY && item.status === 'sold') ? '<div class="sold-ribbon">SoldOut</div>' : ''}
    `;

    card.addEventListener('click', () => openModal(item));
    grid.appendChild(card);
  });
}

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-');
  return `${y}年${m}月${d}日`;
}

function setupModal() {
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-overlay').addEventListener('click', (e) => {
    if (e.target.id === 'modal-overlay') closeModal();
  });
}

function openModal(item) {
  const modalImg = document.getElementById('modal-image');
  if (item.image) {
    modalImg.src = `images/${item.image}`;
    modalImg.style.display = 'block';
  } else {
    modalImg.removeAttribute('src');
    modalImg.style.display = 'none';
  }

  document.getElementById('modal-title').textContent = item.title;
  document.getElementById('modal-date').textContent = formatDate(item.date);
  document.getElementById('modal-note').textContent = item.note || '';
  document.getElementById('modal-price').textContent = `¥${item.price.toLocaleString()}`;

  const form = document.getElementById('apply-form');
  const soldMsg = document.getElementById('modal-sold-msg');
  const soldBadge = document.getElementById('modal-soldout');
  const formStatus = document.getElementById('form-status');
  const baseLink = document.getElementById('modal-base-link');
  const orDivider = document.getElementById('or-divider');
  const priceEl = document.getElementById('modal-price');
  const sizeEl = document.querySelector('.modal-size');

  // ギャラリーだけの公開モードなら、値段・申し込み・購入まわりを全部隠す
  if (GALLERY_ONLY) {
    priceEl.classList.add('hidden');
    if (sizeEl) sizeEl.classList.add('hidden');
    form.classList.add('hidden');
    soldMsg.classList.add('hidden');
    soldBadge.classList.add('hidden');
    baseLink.classList.add('hidden');
    orDivider.classList.add('hidden');
    document.getElementById('modal-overlay').classList.remove('hidden');
    return;
  }

  priceEl.classList.remove('hidden');
  if (sizeEl) sizeEl.classList.remove('hidden');

  // フォームをリセットして、今回の作品情報をセット
  form.reset();
  formStatus.classList.add('hidden');
  formStatus.textContent = '';
  document.getElementById('form-artwork').value = `${item.title}(${item.date})`;

  // BASEに登録済みの作品なら、購入ボタンを出す
  if (item.base_url && item.status !== 'sold') {
    baseLink.href = item.base_url;
    baseLink.classList.remove('hidden');
    orDivider.classList.remove('hidden');
  } else {
    baseLink.classList.add('hidden');
    orDivider.classList.add('hidden');
  }

  if (item.status === 'sold') {
    form.classList.add('hidden');
    soldMsg.classList.remove('hidden');
    soldBadge.classList.remove('hidden');
  } else {
    form.classList.remove('hidden');
    soldMsg.classList.add('hidden');
    soldBadge.classList.add('hidden');
  }

  document.getElementById('modal-overlay').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
}

function setupForm() {
  const form = document.getElementById('apply-form');
  const status = document.getElementById('form-status');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (FORM_ENDPOINT.includes('YOUR_FORM_ID')) {
      status.textContent = '(テスト中) 送信先がまだ設定されていません。';
      status.classList.remove('hidden');
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    status.classList.add('hidden');

    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form)
      });

      if (res.ok) {
        form.reset();
        form.classList.add('hidden');
        status.textContent = '申し込み、受け取りました。ご連絡をお待ちくださいね🐹';
        status.classList.remove('hidden');
      } else {
        status.textContent = '送信できませんでした。時間をおいて、もう一度試してみてください。';
        status.classList.remove('hidden');
      }
    } catch (err) {
      status.textContent = '送信できませんでした。通信環境をご確認ください。';
      status.classList.remove('hidden');
    } finally {
      submitBtn.disabled = false;
    }
  });
}

init();
