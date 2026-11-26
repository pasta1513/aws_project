import { ApiError, errorMessage, signup } from '../api.js';
import { guestOnly, setCurrentUser } from '../auth.js';
import { mountAuthLayout } from '../layout.js';
import { button, field, icon, notice, routes, setFieldError, setLoading } from '../ui.js';
import { validateAccount } from '../validation.js';

const FIELDS = ['name', 'userid', 'email', 'password', 'passwordConfirm'];

if (guestOnly()) {
  const body = mountAuthLayout({
    title: '가볍게 시작해 볼까요?',
    description: '몇 가지 정보만 입력하면 바로 시작할 수 있어요.',
    footer: `이미 계정이 있나요?<a href="${routes.login}">로그인</a>`,
  });

  body.innerHTML = `<form novalidate style="display: grid; gap: 18px">
    ${field({ label: '이름', id: 'name', control: '<input id="name" class="input" autocomplete="name" maxlength="50" placeholder="김소반" />' })}
    ${field({
      label: '아이디',
      id: 'userid',
      hint: '영문·숫자 2~20자',
      control: '<input id="userid" class="input" aria-describedby="userid-hint" autocomplete="username" autocapitalize="none" spellcheck="false" maxlength="20" placeholder="soban" />',
    })}
    ${field({ label: '이메일', id: 'email', control: '<input id="email" class="input" type="email" autocomplete="email" placeholder="hello@soban.kr" />' })}
    ${field({
      label: '비밀번호',
      id: 'password',
      hint: '4~24자',
      control: '<input id="password" class="input" aria-describedby="password-hint" type="password" autocomplete="new-password" maxlength="24" />',
    })}
    ${field({ label: '비밀번호 확인', id: 'passwordConfirm', control: '<input id="passwordConfirm" class="input" type="password" autocomplete="new-password" maxlength="24" />' })}
    <div data-error style="display: contents"></div>
    ${button(`가입하고 시작하기${icon('arrowRight', 15)}`, { size: 'lg', block: true, attrs: 'type="submit" style="margin-top: 4px"' })}
  </form>`;

  const form = body.querySelector('form');
  const errorBox = form.querySelector('[data-error]');
  const submit = form.querySelector('button[type="submit"]');
  const value = (id) => form.querySelector(`#${id}`).value;
  const showErrors = (errors) => FIELDS.forEach((id) => setFieldError(form, id, errors[id]));

  // 입력을 고치면 그 칸의 오류는 지운다
  FIELDS.forEach((id) => form.querySelector(`#${id}`).addEventListener('input', () => setFieldError(form, id, '')));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(FIELDS.map((id) => [id, value(id)]));
    const found = validateAccount(data, { requireUserid: true });
    showErrors(found);
    errorBox.innerHTML = '';
    if (Object.values(found).some(Boolean)) return;

    setLoading(submit, true);
    try {
      const user = await signup({
        userid: data.userid.trim(),
        password: data.password,
        email: data.email.trim(),
        name: data.name.trim(),
      });
      setCurrentUser(user);
      location.replace(routes.home);
    } catch (err) {
      if (err instanceof ApiError && Object.keys(err.fieldErrors).length) showErrors(err.fieldErrors);
      errorBox.innerHTML = notice('error', errorMessage(err));
      setLoading(submit, false);
    }
  });
}
