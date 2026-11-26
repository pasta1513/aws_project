import { plate } from '../plate.js';
import { btnClass, logo, routes, sticker } from '../ui.js';

document.body.innerHTML = `<div class="container nf-page">
  <a href="${routes.home}" aria-label="soban 홈" class="nf-logo">${logo(30)}</a>
  <div class="nf-body">
    <div class="nf-visual">
      ${plate({ menu: null, type: 'snack', seedKey: '404' })}
      <span class="nf-code round">404</span>
      ${sticker('egg', { size: 64, rotate: -14, float: true, className: 'nf-sticker' })}
    </div>
    <h1 class="nf-title">앗, 빈 접시예요</h1>
    <p class="nf-desc">주소가 바뀌었거나 존재하지 않는 페이지예요.</p>
    <a href="${routes.home}" class="${btnClass({ size: 'lg', className: 'nf-cta' })}">홈으로 가기</a>
  </div>
</div>`;
