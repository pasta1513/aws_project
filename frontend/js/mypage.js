// 상단바에서 불러온 사용자 정보를 그대로 받아 내 정보 카드를 채움
currentUser.then((user) => {
  if (!user) return;

  document.getElementById('profile-avatar').textContent = avatarText(user.name);
  document.getElementById('profile-name').textContent = user.name;
  document.getElementById('profile-userid').textContent = `@${user.userid}`;
  document.getElementById('info-userid').textContent = user.userid;
  document.getElementById('info-email').textContent = user.email;
});
