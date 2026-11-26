import { errorMessage } from '../api.js';
import { requireAuth } from '../auth.js';
import { fetchDayLogs } from '../data.js';
import { formatFull, formatMonthDay, isISODate, relativeLabel, weekday } from '../date.js';
import { mountAppLayout } from '../layout.js';
import { MEAL_META, MEAL_ORDER, mealVars } from '../meal.js';
import { plate } from '../plate.js';
import { btnClass, cx, emptyState, errorState, esc, icon, loadingLabel, mealIcon, routes, skeleton, sticker } from '../ui.js';

const user = requireAuth();
if (user) {
  const main = mountAppLayout(user, null);
  const params = new URLSearchParams(location.search);
  const date = params.get('date');
  const savedId = takeSavedId(params);

  const back = `<a href="${routes.home}" class="day-back">${icon('arrowLeft', 18)}홈으로</a>`;

  if (!isISODate(date)) {
    main.innerHTML = `<div class="container day-page">
      <div class="day-topbar">${back}</div>
      ${emptyState({
        sticker: 'egg',
        title: '올바르지 않은 날짜예요',
        description: '주소를 다시 확인해 주세요.',
        action: `<a href="${routes.home}" class="${btnClass({ size: 'sm' })}">홈으로 가기</a>`,
      })}
    </div>`;
  } else {
    load();
  }

  async function load() {
    main.innerHTML = loadingView(back);
    try {
      const { days } = await fetchDayLogs(user);
      main.innerHTML = dayView(date, days, savedId, back);
      if (savedId !== null) {
        setTimeout(() => {
          main.querySelector('.day-toast')?.remove();
          main.querySelector('.day-itemNew')?.classList.remove('day-itemNew');
        }, 3200);
      }
    } catch (err) {
      main.innerHTML = `<div class="container day-page">
        <div class="day-topbar">${back}</div>
        ${errorState(errorMessage(err))}
      </div>`;
      main.querySelector('[data-retry]').addEventListener('click', load);
    }
  }
}

/** 방금 저장한 기록 id — 새로고침·뒤로가기 때 다시 뜨지 않도록 주소에서 지운다 */
function takeSavedId(params) {
  const raw = params.get('saved');
  if (raw === null) return null;
  params.delete('saved');
  history.replaceState(null, '', `${location.pathname}?${params}`);
  const id = Number(raw);
  return Number.isFinite(id) ? id : null;
}

function loadingView(back) {
  return `<div class="container day-page">
    <div class="day-topbar">${back}</div>
    ${loadingLabel()}
    <div class="day-hero">
      ${skeleton('day-heroPhoto')}
      <div class="day-heroText">
        ${skeleton('', 'height: 28px; width: 120px')}
        ${skeleton('', 'height: 34px; width: 80px; margin-top: 28px')}
        ${skeleton('', 'height: 48px; width: 80%; margin-top: 14px')}
      </div>
    </div>
    <div class="day-meals" aria-hidden="true">
      ${skeleton('', 'height: 28px; width: 110px; margin-bottom: 18px')}
      <div class="day-timeline">
        ${MEAL_ORDER.map(() => skeleton('', 'height: 80px; border-radius: 28px')).join('')}
      </div>
    </div>
  </div>`;
}

function dayView(date, days, savedId, back) {
  const index = days.findIndex((d) => d.date === date);
  const day = days[index];
  const newer = index > 0 ? days[index - 1] : undefined;
  const older = index >= 0 ? days[index + 1] : undefined;
  const rel = relativeLabel(date);
  const rep = day?.representative;
  const showToast = savedId !== null && day?.meals.some((m) => m.id === savedId);

  const heroText = rep
    ? `<span class="day-typeBadge">${mealIcon(rep.type, 18)}${MEAL_META[rep.type].label}</span>
       <h1 class="day-title">${esc(rep.menu)}</h1>
       <p class="day-summary">이 날 <strong>${day.meals.length}끼</strong>를 기록했어요</p>
       <div class="day-meter" aria-hidden="true">
         ${MEAL_ORDER.map((t) => (day.meals.some((m) => m.type === t) ? `<i style="background: var(--${t})"></i>` : '<i></i>')).join('')}
       </div>`
    : `<h1 class="day-title">${formatMonthDay(date)}</h1>`;

  const body = !day
    ? emptyState({
        sticker: 'egg',
        title: '이 날의 기록이 없어요',
        description: '드신 음식을 기억하신다면 지금 남겨 보세요.',
        action: `<a href="${routes.newMeal({ date })}" class="${btnClass({ size: 'sm' })}">${icon('plus', 16)}이 날 기록하기</a>`,
      })
    : `<section class="day-meals" aria-labelledby="meals-title">
        <h2 id="meals-title" class="day-mealsTitle">이 날의 식사</h2>
        <ol class="day-timeline">${MEAL_ORDER.map((type) => mealItem(date, day, type, savedId)).join('')}</ol>
        <p class="day-note">저장한 기록은 현재 수정·삭제할 수 없어요.</p>
      </section>`;

  return `${showToast ? `<p class="day-toast" role="status">${icon('check', 18)}기록을 저장했어요</p>` : ''}
    <article class="container day-page fade-in">
      <div class="day-topbar">
        ${back}
        ${
          day
            ? `<nav class="day-dayNav" aria-label="다른 날 기록">
                ${pagerLink(older, 'prev')}
                <span class="day-dayNavLabel">${formatMonthDay(date)} ${weekday(date, false)}</span>
                ${pagerLink(newer, 'next')}
              </nav>`
            : ''
        }
      </div>

      <header class="day-hero"${rep ? ` style="${mealVars(rep.type)}"` : ''}>
        <div class="day-heroPhoto">
          ${plate({
            menu: rep?.menu ?? null,
            type: rep?.type ?? 'lunch',
            seedKey: rep?.id ?? date,
            label: rep ? `${MEAL_META[rep.type].label} — ${rep.menu}` : undefined,
          })}
          ${sticker('cherry', { size: 64, rotate: -10, float: true, className: 'day-sticker1' })}
        </div>
        <div class="day-heroText">
          <div class="day-chips">
            ${rel ? `<span class="day-relChip">${rel}</span>` : ''}
            <span class="chip">${formatFull(date)}</span>
          </div>
          ${heroText}
        </div>
      </header>

      ${body}

      ${
        day && (older || newer)
          ? `<nav class="day-pager" aria-label="이전·다음 기록">${pagerCard(older, 'prev')}${pagerCard(newer, 'next')}</nav>`
          : ''
      }
    </article>`;
}

function mealItem(date, day, type, savedId) {
  const meal = day.meals.find((m) => m.type === type);
  const meta = MEAL_META[type];
  return `<li class="${cx('day-item', !meal && 'day-itemEmpty', meal && meal.id === savedId && 'day-itemNew')}" style="${mealVars(type)}">
    <span class="day-itemIcon">${mealIcon(type, 22)}</span>
    <div class="day-itemBody">
      <p class="day-itemType">${meta.label}<span class="round">${meta.en}</span></p>
      ${meal ? `<p class="day-itemMenu">${esc(meal.menu)}</p>` : '<p class="day-itemMissing">아직 기록하지 않았어요</p>'}
    </div>
    ${
      meal
        ? `<span class="day-itemThumb">${plate({ menu: meal.menu, type: meal.type, seedKey: meal.id })}</span>`
        : `<a href="${routes.newMeal({ date, type })}" class="day-add">${icon('plus', 16)}추가</a>`
    }
  </li>`;
}

function pagerLink(day, dir) {
  const label = dir === 'prev' ? '이전 기록' : '다음 기록';
  const arrow = icon(dir === 'prev' ? 'chevronLeft' : 'chevronRight', 18);
  if (!day) return `<span class="day-navBtn day-navOff" aria-hidden="true">${arrow}</span>`;
  const when = formatMonthDay(day.date);
  return `<a href="${routes.day(day.date)}" class="day-navBtn" aria-label="${label}: ${when}" title="${label} · ${when}">${arrow}</a>`;
}

function pagerCard(day, dir) {
  if (!day) return '<span class="day-pagerEmpty" aria-hidden="true"></span>';
  const rep = day.representative;
  const arrow = icon(dir === 'prev' ? 'chevronLeft' : 'chevronRight', 14);
  return `<a href="${routes.day(day.date)}" class="${cx('day-pagerCard', dir === 'next' && 'day-pagerNext')}" style="${mealVars(rep.type)}">
    <span class="day-pagerThumb">${plate({ menu: rep.menu, type: rep.type, seedKey: rep.id })}</span>
    <span class="day-pagerText">
      <span class="day-pagerDir">${dir === 'prev' ? `${arrow}이전 기록` : `다음 기록${arrow}`}</span>
      <span class="day-pagerDate">${formatMonthDay(day.date)} ${weekday(day.date, false)}</span>
      <span class="day-pagerMenu">${esc(rep.menu)}</span>
    </span>
  </a>`;
}
