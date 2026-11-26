import { ApiError, errorMessage } from '../api.js';
import { guestOnly, login } from '../auth.js';
import { mountAuthLayout } from '../layout.js';
import { button, field, icon, notice, routes, setLoading } from '../ui.js';

/** 로그인 후 돌아갈 화면 — 같은 폴더의 .html 만 허용 */
function nextPage() {
  const next = new URLSearchParams(location.search).get('next');
  return next && /^[\w-]+\.html(\?.*)?$/.test(next) ? next : routes.home;
}

if (guestOnly()) {
  const body = mountAuthLayout({
    title: '다시 만나서 반가워요!',
    description: '아이디로 로그인하고 오늘의 식사를 기록해 보세요.',
    footer: `아직 계정이 없나요?<a href="${routes.signup}">회원가입</a>`,
  });

  body.innerHTML = `<form novalidate style="display: grid; gap: 18px">
    ${field({
      label: '아이디',
      id: 'userid',
      hint: '현재는 비밀번호 확인 없이 아이디로 로그인돼요.',
      control: `<input id="userid" class="input" aria-describedby="userid-hint" autocomplete="username" autocapitalize="none" spellcheck="false" placeholder="아이디를 입력하세요" autofocus />`,
    })}
    <div data-error style="display: contents"></div>
    ${button(`로그인${icon('arrowRight', 15)}`, { size: 'lg', block: true, attrs: 'type="submit" style="margin-top: 4px"' })}
  </form>`;

  const form = body.querySelector('form');
  const input = form.querySelector('#userid');
  const errorBox = form.querySelector('[data-error]');
  const submit = form.querySelector('button[type="submit"]');
  input.focus();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!input.value.trim()) {
      errorBox.innerHTML = notice('error', '아이디를 입력해 주세요.');
      return;
    }
    setLoading(submit, true);
    errorBox.innerHTML = '';
    try {
      await login(input.value);
      location.replace(nextPage());
    } catch (err) {
      const msg = err instanceof ApiError && err.status === 404 ? '등록되지 않은 아이디예요.' : errorMessage(err);
      errorBox.innerHTML = notice('error', msg);
      setLoading(submit, false);
    }
  });
}
