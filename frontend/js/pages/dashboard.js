import { errorMessage } from '../api.js';
import { requireAuth } from '../auth.js';
import { fetchDayLogs } from '../data.js';
import {
  addDays,
  diffDays,
  formatDot,
  formatMonthDay,
  formatYearMonth,
  greetingKo,
  parseISODate,
  relativeLabel,
  startOfWeek,
  todayISO,
  weekday,
} from '../date.js';
import { mountAppLayout } from '../layout.js';
import { MEAL_META, MEAL_ORDER, countInRange, currentStreak, mealVars } from '../meal.js';
import { plate } from '../plate.js';
import { btnClass, cx, errorState, esc, icon, loadingLabel, mealIcon, routes, skeleton, sticker } from '../ui.js';

const PAGE_SIZE = 12;

const user = requireAuth();
if (user) {
  const main = mountAppLayout(user, 'home');
  const today = todayISO();
  load();

  async function load() {
    render({ pending: true });
    try {
      const { meals, days } = await fetchDayLogs(user);
      render({ meals, days });
    } catch (err) {
      render({ error: err });
    }
  }

  function render({ pending = false, error = null, meals = [], days = [] }) {
    const todayLog = days.find((d) => d.date === today);
    const sub = pending
      ? ' '
      : todayLog
        ? `오늘 ${todayLog.meals.length}번의 식사를 기록했어요. 이 페이스 좋아요!`
        : '오늘 먹은 것을 가볍게 남겨 볼까요?';

    let body;
    if (pending) body = dashboardSkeleton();
    else if (error) body = errorState(errorMessage(error));
    else if (days.length === 0) body = firstRecord();
    else {
      body =
        todayMeals(today, todayLog) +
        weekHabits(days, meals.length, today) +
        recentGallery(days.filter((d) => d.date !== today).slice(0, 5)) +
        archive(days);
    }

    // 바깥 컨테이너는 한 번만 만들어 fade-in 애니메이션이 다시 재생되지 않게 한다
    if (!main.firstElementChild) main.innerHTML = '<div class="container fade-in"></div>';
    main.firstElementChild.innerHTML = `
      <header class="dash-hero">
        <div class="dash-hello">
          <span class="chip">${icon('calendar', 15)}${formatMonthDay(today)} ${weekday(today)}</span>
          <h1 class="dash-greeting">${greetingKo()},<br /><span class="dash-greetingName">${esc(user.name)}님!</span></h1>
          <p class="dash-helloSub">${sub}</p>
          ${sticker('avocado', { size: 58, rotate: 12, float: true, className: 'dash-heroSticker1' })}
          ${sticker('sparkle', { size: 44, rotate: -6, className: 'dash-heroSticker2' })}
        </div>
        ${pending ? skeleton('dash-ringSkeleton') : error ? '' : todayRing(today, todayLog)}
      </header>
      ${body}`;

    main.querySelector('[data-retry]')?.addEventListener('click', load);
    if (!pending && !error && days.length) bindArchive(days);
  }

  // 사용자 이름이 바뀌었을 수 있으니 인사말 갱신
  document.addEventListener('soban:user', (e) => {
    const el = main.querySelector('.dash-greetingName');
    if (el) el.textContent = `${e.detail.name}님!`;
  });
}

/** 오늘의 기록 현황 — 다섯 끼를 컬러 링으로 */
function todayRing(date, day) {
  const recorded = new Set(day?.meals.map((m) => m.type));
  const next = MEAL_ORDER.find((t) => !recorded.has(t));
  const R = 70;
  const C = 2 * Math.PI * R;
  const seg = C / 5;
  const gap = 18;

  const circles = MEAL_ORDER.map(
    (t, i) =>
      `<circle cx="90" cy="90" r="${R}" fill="none" stroke="${recorded.has(t) ? `var(--${t})` : 'rgba(38,41,43,0.08)'}" stroke-width="16" stroke-linecap="round" stroke-dasharray="${seg - gap} ${C - seg + gap}" stroke-dashoffset="${-(seg * i) + C / 4}"/>`,
  ).join('');

  const legend = MEAL_ORDER.map(
    (t) => `<li style="${mealVars(t)}"${recorded.has(t) ? ' class="dash-legendOn"' : ''}><i></i>${MEAL_META[t].label}</li>`,
  ).join('');

  return `<section class="dash-ringCard" aria-label="오늘의 기록 현황">
    <div class="dash-ringWrap">
      <svg viewBox="0 0 180 180" class="dash-ring" aria-hidden="true">${circles}</svg>
      <div class="dash-ringCenter">
        <span class="dash-ringNum round num">${recorded.size}<small>/5</small></span>
        <span class="dash-ringLabel">오늘의 기록</span>
      </div>
    </div>
    <div class="dash-ringSide">
      <ul class="dash-ringLegend">${legend}</ul>
      ${
        next
          ? `<a href="${routes.newMeal({ date, type: next })}" class="dash-ringCta">${icon('plus', 18)}${MEAL_META[next].label} 기록하기</a>`
          : '<p class="dash-ringDone">오늘 다섯 끼를 모두 기록했어요!</p>'
      }
    </div>
  </section>`;
}

/** 기록이 하나도 없을 때 */
function firstRecord() {
  return `<section class="dash-first" aria-labelledby="first-title">
    <div class="dash-firstVisual">
      ${plate({ menu: null, type: 'lunch', seedKey: 'first' })}
      ${sticker('lemon', { size: 64, rotate: -12, float: true, className: 'dash-firstS1' })}
      ${sticker('carrot', { size: 70, rotate: 18, className: 'dash-firstS2' })}
      ${sticker('cherry', { size: 56, rotate: -4, float: true, className: 'dash-firstS3' })}
    </div>
    <div class="dash-firstText">
      <span class="chip">첫 기록</span>
      <h2 id="first-title" class="dash-firstTitle">아직 비어 있는 식탁,<br />첫 끼를 올려 주세요</h2>
      <p class="dash-firstDesc">아침 커피 한 잔도 좋아요. 오늘 먹은 것을 짧게 남기면 하루하루가 모여 나만의 식사 습관이 돼요.</p>
      <a href="${routes.newMeal()}" class="dash-firstCta">첫 기록 남기기${icon('arrowRight', 18)}</a>
    </div>
  </section>`;
}

function dashboardSkeleton() {
  return `${loadingLabel('식단 기록을 불러오는 중')}
    <section class="dash-section" aria-hidden="true">
      <div class="dash-sectionHead">${skeleton('', 'width: 132px; height: 30px')}</div>
      <div class="dash-bento">
        ${MEAL_ORDER.map((t) => skeleton(`dash-tile dash-tile_${t} dash-tileSkeleton`)).join('')}
      </div>
    </section>
    <div class="dash-habits" aria-hidden="true">
      ${skeleton('', 'min-height: 200px; border-radius: 36px')}
      ${skeleton('', 'min-height: 200px; border-radius: 28px')}
    </div>`;
}

/** 오늘의 식사 — 크기가 다른 컬러 타일(bento) */
function todayMeals(date, day) {
  const tiles = MEAL_ORDER.map((type) => {
    const meal = day?.meals.find((m) => m.type === type);
    const meta = MEAL_META[type];
    const content = meal
      ? `<span class="dash-tilePhoto">${plate({ menu: meal.menu, type, seedKey: meal.id, inset: 100 })}</span>
         <span class="dash-tileMenu">${esc(meal.menu)}</span>
         ${icon('arrowUpRight', 18, 'dash-tileArrow')}`
      : `<span class="dash-tileAdd">
           <span class="dash-tilePlus">${icon('plus', 20)}</span>
           <span class="dash-tileAddText">${meta.label} 기록하기</span>
         </span>`;
    return `<li class="dash-tile dash-tile_${type}" style="${mealVars(type)}">
      <a href="${meal ? routes.day(date) : routes.newMeal({ date, type })}" class="dash-tileLink ${meal ? 'dash-tileDone' : 'dash-tileEmpty'}">
        <span class="dash-tileHead">
          <span class="dash-tileBadge">${mealIcon(type, 18)}${meta.label}</span>
          <span class="dash-tileEn round">${meta.en}</span>
        </span>
        ${content}
      </a>
    </li>`;
  }).join('');

  return `<section class="dash-section" aria-labelledby="today-title">
    <header class="dash-sectionHead">
      <h2 id="today-title" class="dash-sectionTitle">오늘의 식사</h2>
      <span class="dash-sectionNote">끼니를 눌러 기록하거나 확인해요</span>
    </header>
    <ul class="dash-bento">${tiles}</ul>
  </section>`;
}

/** 이번 주 습관 트래커 + 누적 숫자 */
function weekHabits(days, totalMeals, today) {
  const monday = startOfWeek(today);
  const week = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  const byDate = new Map(days.map((d) => [d.date, d]));

  const stats = [
    { key: 'week', label: '이번 주', value: countInRange(days, monday, addDays(monday, 6)), unit: '끼' },
    { key: 'streak', label: '연속 기록', value: currentStreak(days, today), unit: '일' },
    { key: 'days', label: '기록한 날', value: days.length, unit: '일' },
    { key: 'meals', label: '전체 식사', value: totalMeals, unit: '끼' },
  ];

  const items = week
    .map((date) => {
      const log = byDate.get(date);
      const recorded = new Set(log?.meals.map((m) => m.type));
      const future = diffDays(date, today) > 0;
      const cls = cx('dash-day', date === today && 'dash-dayToday', log && 'dash-dayDone', future && 'dash-dayFuture');
      const dots = MEAL_ORDER.map((t) => (recorded.has(t) ? `<i style="background: var(--${t})"></i>` : '<i></i>')).join('');
      const content = `<span class="dash-wd">${weekday(date, false)}</span>
        <span class="dash-dn round num">${parseISODate(date).getDate()}</span>
        <span class="dash-dots" aria-hidden="true">${dots}</span>`;
      if (future) return `<li><span class="${cls}">${content}</span></li>`;
      const label = `${weekday(date)} ${log ? `${[...recorded].map((t) => MEAL_META[t].label).join(', ')} 기록` : '기록 없음'}`;
      return `<li><a href="${log ? routes.day(date) : routes.newMeal({ date })}" class="${cls}" aria-label="${label}">${content}</a></li>`;
    })
    .join('');

  return `<section class="dash-habits" aria-labelledby="week-title">
    <div class="dash-weekBox">
      <header class="dash-weekHead">
        <h2 id="week-title" class="dash-sectionTitle">이번 주 기록</h2>
        <span class="chip num">${formatDot(monday)} – ${formatDot(addDays(monday, 6))}</span>
      </header>
      <ol class="dash-week">${items}</ol>
      ${sticker('lemon', { size: 50, rotate: 14, className: 'dash-weekSticker' })}
    </div>
    <dl class="dash-stats" aria-label="기록 통계">
      ${stats
        .map(
          (s) => `<div class="dash-stat dash-stat_${s.key}">
            <dt>${s.label}</dt>
            <dd><span class="round num">${s.value}</span>${s.unit}</dd>
          </div>`,
        )
        .join('')}
    </dl>
  </section>`;
}

/** 최근 기록 — 사진 중심 갤러리 */
function recentGallery(days) {
  if (days.length === 0) return '';

  const shots = days
    .map((day, i) => {
      const rep = day.representative;
      const rel = relativeLabel(day.date);
      const tags = day.meals.map((m) => `<span style="${mealVars(m.type)}">${MEAL_META[m.type].label}</span>`).join('');
      return `<li class="dash-shot${i}" style="${mealVars(rep.type)}">
        <a href="${routes.day(day.date)}" class="dash-shot">
          <span class="dash-shotPhoto">
            ${plate({ menu: rep.menu, type: rep.type, seedKey: rep.id, inset: i === 0 ? 0 : 60 })}
            <span class="dash-shotDate">${formatMonthDay(day.date)}${rel ? `<em>${rel}</em>` : ''}</span>
          </span>
          <span class="dash-shotBody">
            <span class="dash-shotMenu">${esc(rep.menu)}</span>
            <span class="dash-shotTags">${tags}</span>
          </span>
        </a>
      </li>`;
    })
    .join('');

  return `<section class="dash-section" aria-labelledby="recent-title">
    <header class="dash-sectionHead">
      <h2 id="recent-title" class="dash-sectionTitle">최근 기록</h2>
      <span class="dash-sectionNote">지난 식탁을 다시 들여다봐요</span>
    </header>
    <ul class="dash-gallery dash-gallery${days.length}">${shots}</ul>
  </section>`;
}

/** 모든 기록 — 날짜별 목록 (월 단위 묶음). 목록은 bindArchive() 가 채운다 */
function archive(days) {
  return `<section class="dash-section" aria-labelledby="archive-title">
    <header class="dash-sectionHead">
      <h2 id="archive-title" class="dash-sectionTitle">모든 기록<span class="dash-count round num">${days.length}</span></h2>
      <span class="dash-sectionNote">기록한 날을 날짜순으로 모았어요</span>
    </header>
    <div class="dash-timeline" data-archive></div>
    <div class="dash-more" data-more hidden></div>
  </section>`;
}

function archiveMonths(days) {
  const groups = [];
  for (const day of days) {
    const label = formatYearMonth(day.date);
    const last = groups[groups.length - 1];
    if (last?.label === label) last.days.push(day);
    else groups.push({ label, days: [day] });
  }

  return groups
    .map(
      (month) => `<div class="dash-month">
        <h3 class="dash-monthLabel">${month.label}</h3>
        <ul class="dash-list">${month.days.map(archiveRow).join('')}</ul>
      </div>`,
    )
    .join('');
}

function archiveRow(day) {
  const rep = day.representative;
  const rel = relativeLabel(day.date);
  const dots = day.meals.map((m) => `<span style="${mealVars(m.type)}"><i></i>${MEAL_META[m.type].label}</span>`).join('');
  return `<li>
    <a href="${routes.day(day.date)}" class="dash-row" style="${mealVars(rep.type)}">
      <span class="dash-rowDate">
        <span class="round num">${parseISODate(day.date).getDate()}</span>
        <small>${weekday(day.date, false)}</small>
      </span>
      <span class="dash-rowThumb">${plate({ menu: rep.menu, type: rep.type, seedKey: rep.id })}</span>
      <span class="dash-rowBody">
        <span class="dash-rowMenu">${esc(rep.menu)}${rel ? `<em class="dash-rowRel">${rel}</em>` : ''}</span>
        <span class="dash-rowDots">${dots}</span>
      </span>
      <span class="dash-rowCount"><span class="round num">${day.meals.length}</span>끼</span>
      ${icon('chevronRight', 20, 'dash-rowArrow')}
    </a>
  </li>`;
}

/** 더 보기 — PAGE_SIZE 일씩 늘려 가며 보여 준다 */
function bindArchive(days) {
  const list = document.querySelector('[data-archive]');
  const more = document.querySelector('[data-more]');
  let visible = PAGE_SIZE;

  function update() {
    list.innerHTML = archiveMonths(days.slice(0, visible));
    const rest = days.length - visible;
    more.hidden = rest <= 0;
    more.innerHTML =
      rest > 0
        ? `<button type="button" class="${btnClass({ variant: 'secondary' })}">더 보기<span class="dash-moreCount">${Math.min(PAGE_SIZE, rest)}일 더</span></button>`
        : '';
  }

  more.addEventListener('click', (e) => {
    if (!e.target.closest('button')) return;
    visible += PAGE_SIZE;
    update();
  });
  update();
}
