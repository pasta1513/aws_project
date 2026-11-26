// 로그인이 필요한 화면(메인, 마이페이지)에서 공통으로 쓰는 상단바 처리
const me = session.get();

// 로그인 정보가 없으면 로그인 화면으로
if (!me) location.replace('login.html');

function logout() {
  session.clear();
  location.href = 'login.html';
}

for (const button of document.querySelectorAll('.logout')) {
  button.addEventListener('click', logout);
}

// 이름의 첫 글자를 프로필 이미지처럼 사용
function avatarText(name) {
  return name.charAt(0);
}

// 사용자 정보를 불러와 상단바를 채우고, 각 화면에서도 쓸 수 있도록 반환
async function loadCurrentUser() {
  try {
    const user = await request(`/users/${encodeURIComponent(me.userid)}`);

    document.getElementById('topbar-avatar').textContent = avatarText(user.name);
    document.getElementById('topbar-name').textContent = `${user.name}님`;

    return user;
  } catch (err) {
    // 탈퇴 등으로 사용자가 없어졌으면 저장된 정보를 지우고 다시 로그인
    if (err.status === 404) {
      session.clear();
      location.replace('login.html');
    }
    return null;
  }
}

const currentUser = me ? loadCurrentUser() : Promise.resolve(null);
