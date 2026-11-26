import { plate } from './plate.js';
import { avatar, cx, esc, icon, logo, routes, sticker } from './ui.js';

/**
 * 로그인 후 화면의 공통 틀 (상단 헤더 + 모바일 하단 탭바)
 * @param {object} user 현재 사용자
 * @param {'home'|'new'|'account'|null} active 현재 메뉴
 * @returns {HTMLElement} 화면 내용을 넣을 <main>
 */
export function mountAppLayout(user, active) {
  const nav = (key, cls, activeCls) => cx(cls, active === key && activeCls);

  document.body.innerHTML = `<div class="app-shell">
    <header class="app-header">
      <div class="container app-headerInner">
        <a href="${routes.home}" aria-label="soban 홈">${logo(30)}</a>

        <nav class="app-nav" aria-label="주요 메뉴">
          <a href="${routes.home}" class="${nav('home', 'app-navLink', 'app-active')}"${active === 'home' ? ' aria-current="page"' : ''}>${icon('home', 18)}홈</a>
          <a href="${routes.account}" class="${nav('account', 'app-navLink', 'app-active')}"${active === 'account' ? ' aria-current="page"' : ''}>${icon('user', 18)}내 정보</a>
        </nav>

        <div class="app-right">
          <a href="${routes.newMeal()}" class="${nav('new', 'app-cta', 'app-ctaActive')}"${active === 'new' ? ' aria-current="page"' : ''}>${icon('plus', 18)}식사 기록하기</a>
          <a href="${routes.account}" class="app-me" data-me aria-label="${esc(user.name)} 내 정보">${avatar(user.name, 40)}</a>
        </div>
      </div>
    </header>

    <main class="app-main"></main>

    <nav class="app-tabbar" aria-label="하단 메뉴">
      <a href="${routes.home}" class="${nav('home', 'app-tab', 'app-tabActive')}"${active === 'home' ? ' aria-current="page"' : ''}>${icon('home', 22)}<span>홈</span></a>
      <a href="${routes.newMeal()}" class="${nav('new', 'app-fab', 'app-fabActive')}" aria-label="식사 기록하기"${active === 'new' ? ' aria-current="page"' : ''}>${icon('plus', 26)}</a>
      <a href="${routes.account}" class="${nav('account', 'app-tab', 'app-tabActive')}"${active === 'account' ? ' aria-current="page"' : ''}>${icon('user', 22)}<span>내 정보</span></a>
    </nav>
  </div>`;

  // 스크롤을 내리면 헤더 아래에 옅은 구분선을 보여 준다
  const header = document.querySelector('.app-header');
  const onScroll = () => header.classList.toggle('app-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // 서버에서 최신 사용자 정보를 받으면 아바타 갱신
  document.addEventListener('soban:user', (e) => {
    const me = document.querySelector('[data-me]');
    me.innerHTML = avatar(e.detail.name, 40);
    me.setAttribute('aria-label', `${e.detail.name} 내 정보`);
  });

  return document.querySelector('.app-main');
}

/**
 * 로그인·회원가입 화면의 공통 틀 (왼쪽 브랜드 콜라주 + 오른쪽 폼)
 * @returns {HTMLElement} 폼을 넣을 영역
 */
export function mountAuthLayout({ title, description = '', footer = '' }) {
  document.body.innerHTML = `<div class="auth-page">
    <aside class="auth-brand" aria-hidden="true">
      ${logo(34)}
      <p class="auth-tagline">오늘 먹은 것,<br /><mark>즐겁게</mark> 기록해요</p>

      <div class="auth-collage">
        <div class="auth-card auth-card1">
          ${plate({ menu: '그릭요거트, 블루베리, 아메리카노', type: 'breakfast', seedKey: 'auth-1' })}
          <span class="auth-cardLabel">아침</span>
        </div>
        <div class="auth-card auth-card2">
          ${plate({ menu: '연어 포케, 현미밥', type: 'lunch', seedKey: 'auth-2' })}
          <span class="auth-cardLabel">점심</span>
        </div>
        <div class="auth-card auth-card3">
          ${plate({ menu: '된장찌개, 계란말이, 잡곡밥', type: 'dinner', seedKey: 'auth-3' })}
          <span class="auth-cardLabel">저녁</span>
        </div>
        ${sticker('avocado', { size: 64, rotate: -12, float: true, className: 'auth-s1' })}
        ${sticker('lemon', { size: 54, rotate: 10, className: 'auth-s2' })}
        ${sticker('carrot', { size: 62, rotate: 22, float: true, className: 'auth-s3' })}
        ${sticker('sparkle', { size: 42, className: 'auth-s4' })}
      </div>
    </aside>

    <main class="auth-panel">
      <div class="auth-wrap fade-in">
        <h1 class="auth-title">${title}</h1>
        ${description ? `<p class="auth-desc">${description}</p>` : ''}
        <div class="auth-body"></div>
        ${footer ? `<div class="auth-footer">${footer}</div>` : ''}
      </div>
    </main>
  </div>`;

  return document.querySelector('.auth-body');
}
