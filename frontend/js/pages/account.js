import { ApiError, deleteUser, errorMessage, updateUser } from '../api.js';
import { logout, requireAuth, setCurrentUser } from '../auth.js';
import { fetchDayLogs } from '../data.js';
import { mountAppLayout } from '../layout.js';
import { avatar, button, confirmDialog, esc, field, icon, notice, routes, setFieldError, setLoading, sticker } from '../ui.js';
import { validateAccount } from '../validation.js';

const FIELDS = ['name', 'email', 'password', 'passwordConfirm'];

let user = requireAuth();
if (user) {
  const main = mountAppLayout(user, 'account');
  let stats = null; // { days, meals } — 기록 수

  main.innerHTML = `<div class="container acct-page fade-in">
    <header class="acct-profile">
      <div class="acct-avatarWrap">
        ${avatar(user.name, 104)}
        ${sticker('leaf', { size: 44, rotate: 24, className: 'acct-avatarSticker' })}
      </div>
      <div class="acct-profileText">
        <span class="acct-hello">반가워요!</span>
        <h1 class="acct-name" data-name>${esc(user.name)}</h1>
        <p class="acct-handle">
          <span class="chip">@${esc(user.userid)}</span>
          <span class="chip" data-email>${esc(user.email)}</span>
        </p>
      </div>
      <dl class="acct-mini">
        <div class="acct-miniDays">
          <dt>기록한 날</dt>
          <dd><span class="round num" data-stat-days>–</span>일</dd>
        </div>
        <div class="acct-miniMeals">
          <dt>전체 식사</dt>
          <dd><span class="round num" data-stat-meals>–</span>끼</dd>
        </div>
      </dl>
      ${sticker('sparkle', { size: 46, rotate: -8, className: 'acct-profileSticker' })}
    </header>

    <div class="acct-grid">
      <section class="acct-edit" aria-labelledby="edit-title">
        <header class="acct-sectionHead">
          <h2 id="edit-title" class="acct-sectionTitle">회원 정보 수정</h2>
          <p class="acct-sectionDesc">저장하려면 비밀번호를 함께 입력해 주세요. 입력한 비밀번호로 변경됩니다.</p>
        </header>

        <form novalidate class="acct-form">
          ${field({
            label: '아이디',
            id: 'userid',
            hint: '아이디는 변경할 수 없어요.',
            control: `<input id="userid" class="input" value="${esc(user.userid)}" disabled readonly />`,
          })}
          <div class="acct-row">
            ${field({ label: '이름', id: 'name', control: '<input id="name" class="input" maxlength="50" autocomplete="name" />' })}
            ${field({ label: '이메일', id: 'email', control: '<input id="email" class="input" type="email" autocomplete="email" />' })}
          </div>
          <div class="acct-row">
            ${field({
              label: '비밀번호',
              id: 'password',
              hint: '4~24자',
              control: '<input id="password" class="input" aria-describedby="password-hint" type="password" maxlength="24" autocomplete="new-password" />',
            })}
            ${field({ label: '비밀번호 확인', id: 'passwordConfirm', control: '<input id="passwordConfirm" class="input" type="password" maxlength="24" autocomplete="new-password" />' })}
          </div>

          <div data-result style="display: contents"></div>

          <div class="acct-formActions">
            ${button(`${icon('check', 18)}저장하기`, { size: 'lg', attrs: 'type="submit"' })}
          </div>
        </form>
      </section>

      <aside class="acct-side" aria-label="계정">
        <h2 class="acct-sectionTitle">계정 관리</h2>
        <div class="acct-action">
          <span class="acct-actionIcon">${icon('logout', 22)}</span>
          <div>
            <p class="acct-actionTitle">로그아웃</p>
            <p class="acct-actionDesc">이 기기에서 로그아웃합니다.</p>
          </div>
          ${button('로그아웃', { variant: 'secondary', size: 'sm', attrs: 'type="button" data-logout' })}
        </div>
        <div class="acct-action acct-actionDanger">
          <span class="acct-actionIcon">${icon('alert', 22)}</span>
          <div>
            <p class="acct-actionTitle">회원 탈퇴</p>
            <p class="acct-actionDesc">계정과 모든 식단 기록이 삭제되며 되돌릴 수 없어요.</p>
          </div>
          ${button('탈퇴하기', { variant: 'ghost', size: 'sm', className: 'acct-dangerBtn', attrs: 'type="button" data-delete' })}
        </div>
      </aside>
    </div>
  </div>`;

  const $ = (sel) => main.querySelector(sel);
  const form = $('form');
  const saveBtn = form.querySelector('button[type="submit"]');
  const resultBox = $('[data-result]');
  let resultTone = null;

  const input = (id) => form.querySelector(`#${id}`);
  const showErrors = (errors) => FIELDS.forEach((id) => setFieldError(form, id, errors[id]));
  const setResult = (tone, text) => {
    resultTone = tone;
    resultBox.innerHTML = tone ? notice(tone, text) : '';
  };

  function fillForm(u) {
    input('name').value = u.name;
    input('email').value = u.email;
    input('password').value = '';
    input('passwordConfirm').value = '';
  }

  function showProfile(u) {
    $('.acct-avatarWrap .avatar-avatar').outerHTML = avatar(u.name, 104);
    $('[data-name]').textContent = u.name;
    $('[data-email]').textContent = u.email;
  }

  fillForm(user);

  FIELDS.forEach((id) =>
    input(id).addEventListener('input', () => {
      setFieldError(form, id, '');
      if (resultTone === 'success') setResult(null);
    }),
  );

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(FIELDS.map((id) => [id, input(id).value]));
    const found = validateAccount(data, { requireUserid: false });
    showErrors(found);
    setResult(null);
    if (Object.values(found).some(Boolean)) return;

    setLoading(saveBtn, true);
    try {
      const updated = await updateUser(user.userid, {
        name: data.name.trim(),
        email: data.email.trim(),
        password: data.password,
      });
      user = updated;
      setCurrentUser(updated);
      document.dispatchEvent(new CustomEvent('soban:user', { detail: updated }));
      fillForm(updated);
      setResult('success', '회원 정보가 저장되었어요.');
    } catch (err) {
      if (err instanceof ApiError && Object.keys(err.fieldErrors).length) showErrors(err.fieldErrors);
      setResult('error', errorMessage(err));
    } finally {
      setLoading(saveBtn, false);
    }
  });

  // 서버에서 최신 정보를 받으면 프로필 갱신
  document.addEventListener('soban:user', (e) => {
    user = e.detail;
    showProfile(user);
  });

  $('[data-logout]').addEventListener('click', () => {
    logout();
    location.replace(routes.login);
  });

  // ---------- 회원 탈퇴 ----------
  const dialog = confirmDialog({
    title: '정말 탈퇴하시겠어요?',
    confirmLabel: '탈퇴하기',
    tone: 'danger',
    onConfirm: handleDelete,
  });

  function dialogContent(deleteError = '') {
    const text =
      stats && stats.meals > 0 ? `${stats.days}일 동안 남긴 ${stats.meals}개의 식단 기록이 모두 삭제돼요.` : '계정 정보가 삭제돼요.';
    return `<p>${text}</p>${deleteError ? `<div style="margin-top: 12px">${notice('error', deleteError)}</div>` : ''}`;
  }

  $('[data-delete]').addEventListener('click', () => {
    dialog.setContent(dialogContent());
    dialog.open();
  });

  async function handleDelete() {
    dialog.setLoading(true);
    dialog.setContent(dialogContent());
    try {
      await deleteUser(user.userid);
      logout();
      location.replace(routes.login);
    } catch (err) {
      dialog.setContent(dialogContent(errorMessage(err)));
      dialog.setLoading(false);
    }
  }

  // ---------- 기록 수 ----------
  fetchDayLogs(user)
    .then(({ meals, days }) => {
      stats = { days: days.length, meals: meals.length };
      $('[data-stat-days]').textContent = stats.days;
      $('[data-stat-meals]').textContent = stats.meals;
    })
    .catch(() => {
      /* 숫자는 '–' 로 둔다 */
    });
}
