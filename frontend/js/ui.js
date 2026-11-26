// 여러 화면에서 같이 쓰는 UI 조각 (HTML 문자열을 만들어 돌려준다)

// ---------- 화면 주소 ----------
export const routes = {
  home: 'index.html',
  login: 'login.html',
  signup: 'signup.html',
  account: 'account.html',
  day: (date) => `day.html?date=${encodeURIComponent(date)}`,
  newMeal: ({ date, type } = {}) => {
    const q = new URLSearchParams();
    if (date) q.set('date', date);
    if (type) q.set('type', type);
    const s = q.toString();
    return s ? `new.html?${s}` : 'new.html';
  },
};

// ---------- 문자열 ----------
/** 사용자 입력을 HTML 에 넣기 전에 반드시 거친다 */
export function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** 'a', false, 'b' → 'a b' */
export const cx = (...names) => names.filter(Boolean).join(' ');

// ---------- 라인 아이콘 ----------
function svgIcon(paths, size = 20, className = '') {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"${className ? ` class="${className}"` : ''}>${paths}</svg>`;
}

const ICONS = {
  plus: '<path d="M12 5v14M5 12h14"/>',
  arrowLeft: '<path d="M19 12H5M11 18l-6-6 6-6"/>',
  arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  chevronRight: '<path d="m9.5 6 6 6-6 6"/>',
  chevronLeft: '<path d="m14.5 6-6 6 6 6"/>',
  home: '<path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1z"/>',
  user: '<circle cx="12" cy="8.5" r="3.8"/><path d="M4.5 20c1.3-3.6 4.2-5.4 7.5-5.4s6.2 1.8 7.5 5.4"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  alert: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.8v5M12 16.2v.1"/>',
  refresh: '<path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3M19.5 4.5v4h-4"/>',
  logout: '<path d="M14 4.5h3.5a1.5 1.5 0 0 1 1.5 1.5v12a1.5 1.5 0 0 1-1.5 1.5H14M10 16l-4-4 4-4M6 12h10"/>',
  calendar: '<rect x="4" y="5.5" width="16" height="14.5" rx="2.5"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>',
  arrowUpRight: '<path d="M7 17 17 7M8.5 7H17v8.5"/>',
  pen: '<path d="M4.5 19.5 5.5 15 15.8 4.7a1.8 1.8 0 0 1 2.5 0l1 1a1.8 1.8 0 0 1 0 2.5L9 18.5z"/><path d="M13.5 7l3.5 3.5"/>',
};

/** icon('plus', 18) */
export const icon = (name, size = 20, className = '') => svgIcon(ICONS[name], size, className);

/* 식사 구분 아이콘 — 정보 전달용 라인 아이콘 (icon 과 같은 선 규칙) */
const MEAL_ICONS = {
  // 해 뜨는 아침
  breakfast:
    '<path d="M4 17.5h16M7.5 17.5a4.5 4.5 0 0 1 9 0"/><path d="M12 6.5v2.2M6.2 9.4l1.5 1.5M17.8 9.4l-1.5 1.5M3.5 13.5h1.8M18.7 13.5h1.8"/><path d="M8.5 20.5h7"/>',
  // 한낮의 해
  lunch:
    '<circle cx="12" cy="12" r="4"/><path d="M12 3.5v2M12 18.5v2M3.5 12h2M18.5 12h2M6 6l1.4 1.4M16.6 16.6 18 18M6 18l1.4-1.4M16.6 7.4 18 6"/>',
  // 머그컵
  snack:
    '<path d="M5 9.5h11v5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5z"/><path d="M16 11h1.5a2.5 2.5 0 0 1 0 5H16"/><path d="M8.5 3.8c-.8 1 .8 1.7 0 2.8M12 3.8c-.8 1 .8 1.7 0 2.8"/>',
  // 김이 나는 그릇
  dinner:
    '<path d="M3.5 12.5h17a8.5 8.5 0 0 1-17 0z"/><path d="M9 20.5h6"/><path d="M9 4.5c-1 1.2 1 2 0 3.3M12.5 4c-1 1.2 1 2 0 3.3M16 4.5c-1 1.2 1 2 0 3.3"/>',
  // 초승달
  late_snack: '<path d="M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10z"/><path d="M16.5 4.5v3M15 6h3"/>',
};

export const mealIcon = (type, size = 20) => svgIcon(MEAL_ICONS[type], size);

// ---------- 스티커 일러스트 ----------
/*
 * 장식용 스티커 — 의미를 전달하지 않으므로 항상 aria-hidden.
 * 64×64 기준의 납작한 도형 + 흰 테두리(CSS)로 스티커처럼 보이게 한다.
 */
const INK = '#26292b';

const STICKERS = {
  leaf:
    '<path d="M12 52C10 30 24 12 52 10c2 26-14 42-40 42z" fill="#8fd3b6"/><path d="M14 50 44 18" stroke="#2e8b6e" stroke-width="2.5" stroke-linecap="round"/><path d="M24 39l-1-10M32 31l-1-9M30 40l10 0M38 31l8 1" stroke="#2e8b6e" stroke-width="2" stroke-linecap="round"/>',
  lemon:
    '<circle cx="32" cy="32" r="24" fill="#fbe39a"/><circle cx="32" cy="32" r="19" fill="#fff4c4"/>' +
    Array.from({ length: 8 }, (_, i) => {
      const a = (i / 8) * Math.PI * 2;
      return `<path d="M32 32L${32 + Math.cos(a) * 16} ${32 + Math.sin(a) * 16}" stroke="#f2cf5b" stroke-width="2.4" stroke-linecap="round"/>`;
    }).join('') +
    '<circle cx="32" cy="32" r="2.6" fill="#f2cf5b"/>',
  carrot:
    '<path d="M40 22 14 52c-2 2 0 4 2 2l30-26z" fill="#f79e87"/><path d="M22 44l4 3M28 37l4 3M34 31l3 3" stroke="#df6f52" stroke-width="2.2" stroke-linecap="round"/><path d="M40 22c0-8 4-12 8-14-1 6 0 9 2 10 3-3 7-3 10-2-3 3-6 5-10 6 2 2 4 5 3 9-4-1-7-4-8-7" fill="#8fd3b6"/>',
  cherry:
    '<path d="M22 40C24 26 32 16 44 12M42 42c-2-12-1-22 2-30" stroke="#2e8b6e" stroke-width="2.6" stroke-linecap="round" fill="none"/><path d="M44 12c6-4 12-2 14 2-6 3-11 2-14-2z" fill="#8fd3b6"/><circle cx="21" cy="45" r="10" fill="#f28ba4"/><circle cx="42" cy="47" r="10" fill="#f28ba4"/><circle cx="18" cy="42" r="2.6" fill="#fff" opacity=".7"/><circle cx="39" cy="44" r="2.6" fill="#fff" opacity=".7"/>',
  avocado:
    '<path d="M32 6c8 0 12 10 16 20 5 12 4 30-16 30S11 38 16 26C20 16 24 6 32 6z" fill="#6fae83"/><path d="M32 11c6 0 9 9 12 17 4 10 3 24-12 24s-16-14-12-24c3-8 6-17 12-17z" fill="#e6f3c9"/><circle cx="32" cy="38" r="9" fill="#b5835a"/><circle cx="29" cy="35" r="2.4" fill="#fff" opacity=".5"/>',
  egg:
    '<path d="M12 34c-4-12 6-22 16-20 6-8 22-6 24 6 8 6 6 20-6 22-6 10-24 10-30 0-6 0-6-6-4-8z" fill="#fff" stroke="#ebe8e0" stroke-width="1.5"/><circle cx="32" cy="32" r="10" fill="#fbd35d"/><circle cx="29" cy="29" r="3" fill="#fff" opacity=".7"/>',
  strawberry:
    '<path d="M32 58C18 50 10 36 14 26c3-7 11-8 18-6 7-2 15-1 18 6 4 10-4 24-18 32z" fill="#f2807d"/><path d="M20 22c2-6 7-8 12-6 5-2 10 0 12 6-4-1-8 0-12 2-4-2-8-3-12-2z" fill="#6fae83"/><path d="M32 16v-8" stroke="#2e8b6e" stroke-width="2.6" stroke-linecap="round"/>' +
    [[24, 32], [32, 30], [40, 32], [28, 40], [36, 40], [32, 48]]
      .map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="1.4" ry="2" fill="#fde3c4"/>`)
      .join(''),
  sparkle:
    '<path d="M32 6c2 14 6 18 20 20-14 2-18 6-20 20-2-14-6-18-20-20 14-2 18-6 20-20z" fill="#d7d0f3"/><path d="M50 40c1 6 3 8 8 9-5 1-7 3-8 9-1-6-3-8-8-9 5-1 7-3 8-9z" fill="#fbe39a"/>',
  fork: `<path d="M26 6v16c0 4 2 6 4 7v27a2 2 0 0 0 4 0V29c2-1 4-3 4-7V6" fill="none" stroke="${INK}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M30 6v14M34 6v14" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>`,
};

/** sticker('leaf', { size: 56, rotate: 0, float: false, className: '' }) */
export function sticker(name, { size = 56, rotate = 0, float = false, className = '' } = {}) {
  return `<span class="${cx('sticker-sticker', float && 'sticker-float', className)}" style="width: ${size}px; height: ${size}px; --rot: ${rotate}deg; transform: rotate(${rotate}deg);" aria-hidden="true"><svg viewBox="0 0 64 64" width="100%" height="100%">${STICKERS[name]}</svg></span>`;
}

// ---------- 작은 부품 ----------
/** 소반 — 텍스트 워드마크 */
export const logo = (size = 28, className = '') => `<span class="${cx('logo-logo', className)}" style="font-size: ${size}px">soban<span class="logo-dot"></span></span>`;

export function avatar(name, size = 36) {
  const initial = String(name ?? '').trim().charAt(0).toUpperCase() || '?';
  return `<span class="avatar-avatar" style="width: ${size}px; height: ${size}px; font-size: ${size * 0.42}px" aria-hidden="true">${esc(initial)}</span>`;
}

/** 버튼 클래스 — variant: primary | secondary | ghost | danger, size: sm | md | lg */
export const btnClass = ({ variant = 'primary', size = 'md', block = false, className = '' } = {}) =>
  cx('btn-btn', `btn-${variant}`, `btn-${size}`, block && 'btn-block', className);

/** <button> HTML — attrs 는 그대로 붙는 문자열 (예: 'type="submit" id="save"') */
export function button(content, { attrs = 'type="button"', ...style } = {}) {
  return `<button class="${btnClass(style)}" ${attrs}>${content}</button>`;
}

/** 버튼을 로딩 상태로 바꾸거나 되돌린다 */
export function setLoading(btn, loading) {
  btn.disabled = loading || btn.dataset.lockDisabled === 'true';
  if (loading) {
    btn.setAttribute('aria-busy', 'true');
    if (!btn.querySelector('.btn-spinner')) btn.insertAdjacentHTML('afterbegin', '<span class="btn-spinner" aria-hidden="true"></span>');
  } else {
    btn.removeAttribute('aria-busy');
    btn.querySelector('.btn-spinner')?.remove();
  }
}

/**
 * 입력 칸 묶음(label + 입력 + 힌트/오류)
 * error 와 hint 는 setFieldError() 로 나중에 바꿀 수 있다.
 */
export function field({ label, id, hint = '', aside = '', control }) {
  return `<div class="field-field" data-field="${id}">
    <div class="field-head">
      <label for="${id}" class="field-label">${label}</label>
      ${aside ? `<span class="field-aside">${aside}</span>` : ''}
    </div>
    ${control}
    <p id="${id}-hint" class="field-hint" ${hint ? '' : 'hidden'}>${hint}</p>
    <p id="${id}-error" class="field-error" role="alert" hidden></p>
  </div>`;
}

/** 입력 칸 오류 표시 — 오류가 있으면 힌트 대신 오류를 보여 준다 */
export function setFieldError(root, id, error) {
  const input = root.querySelector(`#${id}`);
  const errEl = root.querySelector(`#${id}-error`);
  const hintEl = root.querySelector(`#${id}-hint`);
  if (!errEl) return;
  const hasHint = !!hintEl?.textContent.trim();
  errEl.textContent = error || '';
  errEl.hidden = !error;
  if (hintEl) hintEl.hidden = !!error || !hasHint;
  if (input) {
    if (error) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
    const describedBy = error ? `${id}-error` : hasHint ? `${id}-hint` : '';
    if (describedBy) input.setAttribute('aria-describedby', describedBy);
    else input.removeAttribute('aria-describedby');
  }
}

/** 입력 칸 힌트 문구 변경 */
export function setFieldHint(root, id, hint) {
  const hintEl = root.querySelector(`#${id}-hint`);
  const errEl = root.querySelector(`#${id}-error`);
  if (!hintEl) return;
  hintEl.textContent = hint || '';
  hintEl.hidden = !hint || (errEl && !errEl.hidden);
}

/** 안내 박스 — tone: error | success | info (text 는 일반 문자열) */
export function notice(tone, text) {
  return `<div class="notice-notice notice-${tone}" role="${tone === 'error' ? 'alert' : 'status'}">
    ${tone === 'success' ? icon('check', 18) : icon('alert', 18)}
    <div>${esc(text)}</div>
  </div>`;
}

export const skeleton = (className = '', style = '') => `<span class="${cx('state-skeleton', className)}"${style ? ` style="${style}"` : ''} aria-hidden="true"></span>`;

export const loadingLabel = (text = '불러오는 중') => `<span class="visually-hidden" role="status">${text}</span>`;

export function emptyState({ sticker: name = 'leaf', title, description = '', action = '', compact = false }) {
  return `<div class="${cx('state-box', compact && 'state-compact')}">
    ${sticker(name, { size: compact ? 52 : 68, rotate: -8 })}
    <h3 class="state-title">${title}</h3>
    ${description ? `<p class="state-desc">${description}</p>` : ''}
    ${action ? `<div class="state-action">${action}</div>` : ''}
  </div>`;
}

/** 오류 상태 — 다시 시도 버튼에는 data-retry 가 붙는다 */
export function errorState(message, { title = '기록을 불러오지 못했어요', retry = true } = {}) {
  return `<div class="state-box state-error" role="alert">
    <span class="state-errorIcon">${icon('alert', 26)}</span>
    <h3 class="state-title">${title}</h3>
    <p class="state-desc">${esc(message)}</p>
    ${retry ? `<div class="state-action">${button(`${icon('refresh', 15)}다시 시도`, { variant: 'secondary', size: 'sm', attrs: 'type="button" data-retry' })}</div>` : ''}
  </div>`;
}

/**
 * 확인 대화상자
 * @returns {{open(): void, close(): void, setLoading(b: boolean): void, setContent(html: string): void, el: HTMLDialogElement}}
 */
export function confirmDialog({ title, confirmLabel, tone = 'primary', onConfirm, onClose }) {
  const dialog = document.createElement('dialog');
  dialog.className = 'dlg-dialog';
  dialog.setAttribute('aria-labelledby', 'confirm-title');
  dialog.innerHTML = `<div class="dlg-body">
    <span class="dlg-badge" aria-hidden="true">${icon('alert', 26)}</span>
    <h2 id="confirm-title" class="dlg-title">${title}</h2>
    <div class="dlg-content"></div>
    <div class="dlg-actions">
      ${button('취소', { variant: 'secondary', attrs: 'type="button" data-cancel' })}
      ${button(confirmLabel, { variant: tone, attrs: 'type="button" data-confirm' })}
    </div>
  </div>`;
  document.body.append(dialog);

  const cancelBtn = dialog.querySelector('[data-cancel]');
  const confirmBtn = dialog.querySelector('[data-confirm]');
  const content = dialog.querySelector('.dlg-content');
  let loading = false;

  const close = () => dialog.open && dialog.close();
  dialog.addEventListener('close', () => onClose?.());
  dialog.addEventListener('cancel', (e) => {
    if (loading) e.preventDefault();
  });
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog && !loading) close();
  });
  cancelBtn.addEventListener('click', close);
  confirmBtn.addEventListener('click', () => onConfirm?.());

  return {
    el: dialog,
    open: () => !dialog.open && dialog.showModal(),
    close,
    setLoading(value) {
      loading = value;
      cancelBtn.disabled = value;
      setLoading(confirmBtn, value);
    },
    setContent(html) {
      content.innerHTML = html;
      content.hidden = !html;
    },
  };
}
