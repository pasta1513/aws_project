const me = session.get();

// 로그인 정보가 없으면 로그인 화면으로
if (!me) location.replace('login.html');

const mealForm = document.getElementById('meal-form');
const mealError = document.getElementById('meal-error');
const mealList = document.getElementById('meal-list');

document.getElementById('logout').addEventListener('click', () => {
  session.clear();
  location.href = 'login.html';
});

// 끼니 선택 옵션 채우기
for (const [value, label] of Object.entries(MEAL_TYPES)) {
  mealForm.type.add(new Option(label, value));
}

mealForm.date.value = today();

// 오늘 날짜를 YYYY-MM-DD 형식으로 (toISOString은 UTC 기준이라 시차 보정)
function today() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

async function loadProfile() {
  try {
    const user = await request(`/users/${encodeURIComponent(me.userid)}`);

    document.getElementById('greeting').textContent = `${user.name}님`;
    document.getElementById('avatar').textContent = user.name.charAt(0);
    document.getElementById('profile-name').textContent = user.name;
    document.getElementById('profile-sub').textContent = `${user.userid} · ${user.email}`;
  } catch (err) {
    // 탈퇴 등으로 사용자가 없어졌으면 저장된 정보를 지우고 다시 로그인
    if (err.status === 404) {
      session.clear();
      location.replace('login.html');
    }
  }
}

async function loadMeals() {
  try {
    const meals = await request(`/meals/user/${me.id}`);
    renderMeals(meals);
  } catch (err) {
    mealList.innerHTML = '';
    mealList.append(emptyText(err.message));
  }
}

// 날짜별로 묶고, 같은 날짜 안에서는 아침 → 간식 순으로 정렬해서 표시
function renderMeals(meals) {
  mealList.innerHTML = '';

  if (meals.length === 0) {
    mealList.append(emptyText('아직 등록한 식단이 없습니다. 첫 식단을 등록해 보세요.'));
    return;
  }

  const typeOrder = Object.keys(MEAL_TYPES);
  const byDate = Map.groupBy(meals, (meal) => meal.date);

  for (const [date, items] of byDate) {
    const group = document.createElement('div');
    group.className = 'meal-group';

    const heading = document.createElement('p');
    heading.className = 'meal-date';
    heading.textContent = date;
    group.append(heading);

    items.sort((a, b) => typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type));

    for (const meal of items) {
      const row = document.createElement('div');
      row.className = 'meal-row';

      const badge = document.createElement('span');
      badge.className = `badge badge-${meal.type}`;
      badge.textContent = MEAL_TYPES[meal.type];

      const menu = document.createElement('span');
      menu.textContent = meal.menu;

      row.append(badge, menu);
      group.append(row);
    }

    mealList.append(group);
  }
}

function emptyText(message) {
  const p = document.createElement('p');
  p.className = 'empty';
  p.textContent = message;
  return p;
}

mealForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  showError(mealError, '');

  const { date, type, menu } = Object.fromEntries(new FormData(mealForm));

  if (!date || !menu.trim()) {
    showError(mealError, '날짜와 메뉴를 입력하세요.');
    return;
  }

  const button = mealForm.querySelector('button');
  button.disabled = true;

  try {
    // user_id는 입력받지 않고 로그인한 사용자의 id를 자동으로 넣음
    await request('/meals', {
      method: 'POST',
      body: { user_id: me.id, type, menu: menu.trim(), date },
    });

    mealForm.menu.value = '';
    await loadMeals();
  } catch (err) {
    showError(mealError, err.message);
  } finally {
    button.disabled = false;
  }
});

if (me) {
  loadProfile();
  loadMeals();
}
