import { ApiError, createMeal, errorMessage } from '../api.js';
import { requireAuth } from '../auth.js';
import { fetchDayLogs } from '../data.js';
import { addDays, diffDays, formatFull, formatMonthDay, isISODate, relativeLabel, todayISO } from '../date.js';
import { mountAppLayout } from '../layout.js';
import { MEAL_META, MEAL_ORDER, isMealType, mealVars, suggestMealType } from '../meal.js';
import { plate, splitMenu } from '../plate.js';
import { button, cx, esc, field, icon, mealIcon, notice, routes, setFieldError, setFieldHint, setLoading, sticker } from '../ui.js';

const MENU_MAX = 255;
const RECENT_MAX = 6;

const user = requireAuth();
if (user) {
  const main = mountAppLayout(user, 'new');
  const params = new URLSearchParams(location.search);
  const today = todayISO();
  const initialType = params.get('type');

  // ---------- 상태 ----------
  const state = {
    date: isISODate(params.get('date')) ? params.get('date') : today,
    type: isMealType(initialType) ? initialType : null,
    /** 사용자가 직접 고른 적이 없으면 시간대에 맞는 끼니를 미리 골라 둔다 */
    touchedType: isMealType(initialType),
    menu: '',
    meals: null,
    days: [],
    mealsLoading: true,
    saving: false,
  };

  /** 상태에서 계산되는 값 */
  function derive() {
    const validDate = isISODate(state.date);
    const futureDate = validDate && diffDays(state.date, today) > 0;
    const dayMeals = validDate ? state.days.find((d) => d.date === state.date)?.meals ?? [] : [];
    const recorded = new Set(dayMeals.map((m) => m.type));
    const suggested = !state.touchedType && !state.mealsLoading && state.date === today ? suggestMealType(recorded) : null;
    const picked = state.touchedType ? state.type : suggested;
    const selected = picked && !recorded.has(picked) ? picked : null;
    const allRecorded = validDate && recorded.size === MEAL_ORDER.length;
    return { validDate, futureDate, recorded, suggested, selected, allRecorded, tone: selected ?? 'lunch' };
  }

  // ---------- 화면 뼈대 (한 번만 그림) ----------
  const quickDates = [
    { label: '오늘', value: today },
    { label: '어제', value: addDays(today, -1) },
    { label: '그제', value: addDays(today, -2) },
  ];

  main.innerHTML = `<div class="container new-page fade-in">
    <a href="${routes.home}" class="new-back">${icon('arrowLeft', 18)}홈으로</a>

    <div class="new-layout">
      <aside class="new-preview" data-preview>
        <div class="new-previewHead">
          <h1 class="new-title">무엇을 드셨나요?</h1>
          <p class="new-subtitle">한 끼를 가볍게 남겨 두세요.</p>
        </div>
        <div class="new-previewPhoto" data-preview-photo></div>
        <div class="new-previewMeta" data-preview-meta></div>
        <ul class="new-previewItems" aria-label="입력한 메뉴" data-preview-items hidden></ul>
        ${sticker('strawberry', { size: 60, rotate: -14, float: true, className: 'new-sticker1' })}
        ${sticker('leaf', { size: 52, rotate: 20, className: 'new-sticker2' })}
      </aside>

      <form class="new-form" novalidate>
        ${field({
          label: '언제 드셨나요?',
          id: 'date',
          control: `<input id="date" class="input new-dateInput" type="date" max="${today}" required />
            <div class="new-quick" role="group" aria-label="빠른 날짜 선택">
              ${quickDates.map((q) => `<button type="button" class="new-quickBtn" data-quick="${q.value}" aria-pressed="false">${q.label}</button>`).join('')}
            </div>`,
        })}

        <fieldset class="new-fieldset">
          <legend class="new-legend">어떤 식사인가요?<span class="new-legendNote" data-legend-note>기록 확인 중…</span></legend>
          <div class="new-types">
            ${MEAL_ORDER.map(
              (t) => `<label class="new-type" style="${mealVars(t)}" data-type="${t}">
                <input type="radio" name="type" value="${t}" class="visually-hidden" />
                <span class="new-typeIcon"></span>
                <span class="new-typeLabel">${MEAL_META[t].label}</span>
                <span class="new-typeSub"></span>
                <span class="new-typeHint" hidden>지금</span>
              </label>`,
            ).join('')}
          </div>
          <p id="type-error" class="new-error" role="alert" hidden></p>
          <div data-all-recorded style="display: contents"></div>
        </fieldset>

        ${field({
          label: '메뉴',
          id: 'menu',
          aside: `0/${MENU_MAX}`,
          hint: '여러 메뉴는 쉼표로 구분해 적어 주세요.',
          control: `<textarea id="menu" class="input new-textarea" rows="3" maxlength="${MENU_MAX}" aria-describedby="menu-hint"></textarea>`,
        })}

        <div class="new-recent" data-recent hidden>
          <span class="new-recentLabel">최근 메뉴</span>
          <div class="new-recentList"></div>
        </div>

        <div data-form-error style="display: contents"></div>

        <div class="new-actions">
          ${button('취소', { variant: 'secondary', size: 'lg', attrs: 'type="button" data-cancel' })}
          ${button(`${icon('check', 18)}기록 저장`, { size: 'lg', attrs: 'type="submit"' })}
        </div>
        <p class="new-note">저장한 기록은 현재 수정·삭제할 수 없어요.</p>
      </form>
    </div>
  </div>`;

  const $ = (sel) => main.querySelector(sel);
  const form = $('form');
  const dateInput = $('#date');
  const menuInput = $('#menu');
  const submitBtn = form.querySelector('button[type="submit"]');
  const fieldset = $('.new-fieldset');
  dateInput.value = state.date;

  // ---------- 화면 갱신 ----------
  let lastPreviewKey = null;
  let lastRecentKey = null;

  function update() {
    const d = derive();
    const preview = state.menu.trim();

    // 미리보기 카드
    const aside = $('[data-preview]');
    aside.classList.toggle('new-previewOn', !!d.selected);
    aside.setAttribute('style', mealVars(d.tone));
    const previewKey = `${preview}|${d.tone}`;
    if (previewKey !== lastPreviewKey) {
      $('[data-preview-photo]').innerHTML = plate({ menu: preview || null, type: d.tone, seedKey: 'preview' });
      lastPreviewKey = previewKey;
    }
    $('[data-preview-meta]').innerHTML =
      `<span class="new-previewChip">${icon('calendar', 15)}${d.validDate ? formatMonthDay(state.date) : '날짜 선택'}</span>` +
      (d.selected ? `<span class="new-previewChip">${mealIcon(d.selected, 16)}${MEAL_META[d.selected].label}</span>` : '');
    const items = splitMenu(preview);
    const itemsEl = $('[data-preview-items]');
    itemsEl.hidden = items.length <= 1;
    itemsEl.innerHTML = items.length > 1 ? items.map((item) => `<li>${esc(item)}</li>`).join('') : '';

    // 날짜
    const rel = d.validDate ? relativeLabel(state.date) : null;
    setFieldHint(form, 'date', d.validDate ? `${formatFull(state.date)}${rel ? ` · ${rel}` : ''}` : '');
    main.querySelectorAll('[data-quick]').forEach((btn) => {
      const on = btn.dataset.quick === state.date;
      btn.classList.toggle('new-quickOn', on);
      btn.setAttribute('aria-pressed', String(on));
    });

    // 식사 구분
    $('[data-legend-note]').hidden = !state.mealsLoading;
    main.querySelectorAll('[data-type]').forEach((label) => {
      const t = label.dataset.type;
      const done = d.recorded.has(t);
      const radio = label.querySelector('input');
      label.className = cx('new-type', d.selected === t && 'new-typeOn', done && 'new-typeDone');
      radio.checked = d.selected === t;
      radio.disabled = done;
      const iconKey = done ? 'done' : 'meal';
      const iconEl = label.querySelector('.new-typeIcon');
      if (iconEl.dataset.icon !== iconKey) {
        iconEl.innerHTML = done ? icon('check', 20) : mealIcon(t, 22);
        iconEl.dataset.icon = iconKey;
      }
      label.querySelector('.new-typeSub').textContent = done ? '기록됨' : MEAL_META[t].en;
      label.querySelector('.new-typeHint').hidden = !(d.suggested === t && d.selected === t);
    });
    const allBox = $('[data-all-recorded]');
    allBox.innerHTML = d.allRecorded ? notice('info', '이 날은 다섯 끼가 모두 기록되어 있어요. 다른 날짜를 선택해 주세요.') : '';
    submitBtn.dataset.lockDisabled = String(!!d.allRecorded);
    submitBtn.disabled = state.saving || !!d.allRecorded;

    // 메뉴
    $('[data-field="menu"] .field-aside').textContent = `${preview.length}/${MENU_MAX}`;
    menuInput.placeholder = MEAL_META[d.tone].placeholder;

    // 최근 메뉴 — 같은 끼니를 우선으로, 한 번 눌러 채울 수 있게
    const recent = recentMenus(d.selected);
    const recentKey = recent.join('\n');
    const recentBox = $('[data-recent]');
    if (recentKey !== lastRecentKey) {
      recentBox.querySelector('.new-recentList').innerHTML = recent
        .map((m, i) => `<button type="button" class="new-recentBtn" data-recent-index="${i}">${esc(m)}</button>`)
        .join('');
      recentBox.hidden = recent.length === 0;
      lastRecentKey = recentKey;
    }
    recentBox.querySelectorAll('.new-recentBtn').forEach((btn, i) => btn.classList.toggle('new-recentOn', recent[i] === preview));
  }

  function recentMenus(selected) {
    const list = [...(state.meals ?? [])].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.id - a.id));
    const ordered = selected ? [...list.filter((m) => m.type === selected), ...list.filter((m) => m.type !== selected)] : list;
    return [...new Set(ordered.map((m) => m.menu.trim()))].slice(0, RECENT_MAX);
  }

  function setTypeError(message) {
    const el = $('#type-error');
    el.textContent = message || '';
    el.hidden = !message;
    if (message) fieldset.setAttribute('aria-describedby', 'type-error');
    else fieldset.removeAttribute('aria-describedby');
  }

  const setFormError = (message) => ($('[data-form-error]').innerHTML = message ? notice('error', message) : '');

  // ---------- 이벤트 ----------
  function changeDate(value) {
    state.date = value;
    dateInput.value = value;
    setFieldError(form, 'date', '');
    update();
  }

  dateInput.addEventListener('input', () => changeDate(dateInput.value));
  main.querySelectorAll('[data-quick]').forEach((btn) => btn.addEventListener('click', () => changeDate(btn.dataset.quick)));

  main.querySelectorAll('[data-type] input').forEach((radio) =>
    radio.addEventListener('change', () => {
      state.type = radio.value;
      state.touchedType = true;
      setTypeError('');
      update();
    }),
  );

  menuInput.addEventListener('input', () => {
    const cleaned = menuInput.value.replace(/\n/g, ' ');
    if (cleaned !== menuInput.value) menuInput.value = cleaned;
    state.menu = cleaned;
    setFieldError(form, 'menu', '');
    update();
  });
  menuInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.isComposing) {
      e.preventDefault();
      form.requestSubmit();
    }
  });

  $('[data-recent]').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-recent-index]');
    if (!btn) return;
    state.menu = btn.textContent;
    menuInput.value = state.menu;
    setFieldError(form, 'menu', '');
    update();
  });

  // 바로 이 화면으로 들어온 경우(이전 화면 없음)에는 홈으로
  $('[data-cancel]').addEventListener('click', () => {
    const fromHere = document.referrer && new URL(document.referrer).origin === location.origin;
    if (fromHere && history.length > 1) history.back();
    else location.href = routes.home;
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (state.saving) return;
    const d = derive();
    const errors = {};
    const trimmed = state.menu.trim();
    if (!d.validDate) errors.date = '날짜를 선택해 주세요.';
    else if (d.futureDate) errors.date = '오늘 이후 날짜는 기록할 수 없어요.';
    if (!d.selected) errors.type = '식사 구분을 선택해 주세요.';
    if (!trimmed) errors.menu = '메뉴를 입력해 주세요.';
    else if (trimmed.length > MENU_MAX) errors.menu = `${MENU_MAX}자까지 입력할 수 있어요.`;

    setFieldError(form, 'date', errors.date);
    setFieldError(form, 'menu', errors.menu);
    setTypeError(errors.type);
    setFormError('');
    if (Object.keys(errors).length || !d.selected) return;

    state.saving = true;
    setLoading(submitBtn, true);
    try {
      const saved = await createMeal({ user_id: user.id, type: d.selected, menu: trimmed, date: state.date });
      location.assign(`${routes.day(state.date)}&saved=${saved.id}`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setFormError(`${formatMonthDay(state.date)} ${MEAL_META[d.selected].label} 기록이 이미 있어요.`);
      } else if (err instanceof ApiError && Object.keys(err.fieldErrors).length) {
        setFieldError(form, 'date', err.fieldErrors.date);
        setFieldError(form, 'menu', err.fieldErrors.menu);
        setTypeError(err.fieldErrors.type);
        setFormError(err.message);
      } else {
        setFormError(errorMessage(err));
      }
      state.saving = false;
      setLoading(submitBtn, false);
      update();
    }
  });

  // ---------- 시작 ----------
  update();
  fetchDayLogs(user)
    .then(({ meals, days }) => {
      state.meals = meals;
      state.days = days;
    })
    .catch(() => {
      /* 기록을 못 불러와도 작성은 할 수 있다 (중복이면 서버가 409로 알려 줌) */
    })
    .finally(() => {
      state.mealsLoading = false;
      update();
    });
}
