// 이미 로그인한 상태면 회원가입 대신 메인으로
if (session.get()) location.replace('main.html');

const form = document.getElementById('signup-form');
const errorEl = document.getElementById('error');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  showError(errorEl, '');

  const data = Object.fromEntries(new FormData(form));

  if (Object.values(data).some((v) => !v.trim())) {
    showError(errorEl, '모든 항목을 입력하세요.');
    return;
  }

  const button = form.querySelector('button');
  button.disabled = true;

  try {
    const user = await request('/users/signup', { method: 'POST', body: data });

    // 로그인 화면에서 방금 가입한 아이디를 채워주기 위해 잠시 보관
    sessionStorage.setItem('signupUserid', user.userid);
    location.href = 'login.html';
  } catch (err) {
    showError(errorEl, err.message);
  } finally {
    button.disabled = false;
  }
});
