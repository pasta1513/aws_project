if (session.get()) location.replace('main.html');

const form = document.getElementById('login-form');
const errorEl = document.getElementById('error');

// 회원가입 직후라면 아이디를 미리 채우고 안내 문구 표시
const signupUserid = sessionStorage.getItem('signupUserid');
if (signupUserid) {
  sessionStorage.removeItem('signupUserid');
  form.userid.value = signupUserid;
  form.password.focus();

  const notice = document.getElementById('notice');
  notice.textContent = '가입이 완료되었습니다. 로그인하세요.';
  notice.hidden = false;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  showError(errorEl, '');

  const data = Object.fromEntries(new FormData(form));

  if (!data.userid.trim() || !data.password) {
    showError(errorEl, '아이디와 비밀번호를 입력하세요.');
    return;
  }

  const button = form.querySelector('button');
  button.disabled = true;

  try {
    const user = await request('/users/login', { method: 'POST', body: data });

    session.set(user);
    location.href = 'main.html';
  } catch (err) {
    showError(errorEl, err.message);
  } finally {
    button.disabled = false;
  }
});
