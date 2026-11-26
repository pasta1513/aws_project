const mealForm = document.getElementById('meal-form');
const mealError = document.getElementById('meal-error');
const myMealList = document.getElementById('my-meal-list');
const allMealList = document.getElementById('all-meal-list');

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

async function loadMyMeals() {
  try {
    const meals = await request(`/meals/user/${me.id}`);
    renderMeals(myMealList, meals, { emptyMessage: '아직 등록한 식단이 없습니다. 첫 식단을 등록해 보세요.' });
  } catch (err) {
    myMealList.replaceChildren(emptyText(err.message));
  }
}

async function loadAllMeals() {
  try {
    const meals = await request('/meals');
    renderMeals(allMealList, meals, { showAuthor: true, emptyMessage: '아직 등록된 식단이 없습니다.' });
  } catch (err) {
    allMealList.replaceChildren(emptyText(err.message));
  }
}

// 날짜별로 묶고, 같은 날짜 안에서는 아침 → 간식 순으로 정렬해서 표시
// showAuthor가 true면 각 식단 앞에 작성자(아바타 + 이름)를 함께 표시
function renderMeals(container, meals, { showAuthor = false, emptyMessage }) {
  container.replaceChildren();

  if (meals.length === 0) {
    container.append(emptyText(emptyMessage));
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

      if (showAuthor) row.append(authorTag(meal));

      const badge = document.createElement('span');
      badge.className = `badge badge-${meal.type}`;
      badge.textContent = MEAL_TYPES[meal.type];

      const menu = document.createElement('span');
      menu.textContent = meal.menu;

      row.append(badge, menu);
      group.append(row);
    }

    container.append(group);
  }
}

function authorTag(meal) {
  const author = document.createElement('span');
  author.className = 'meal-author';

  const avatar = document.createElement('span');
  avatar.className = 'avatar avatar-xs';
  avatar.textContent = avatarText(meal.user.name);

  const name = document.createElement('span');
  name.textContent = meal.user_id === me.id ? `${meal.user.name} (나)` : meal.user.name;

  author.append(avatar, name);
  return author;
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
    await Promise.all([loadMyMeals(), loadAllMeals()]);
  } catch (err) {
    showError(mealError, err.message);
  } finally {
    button.disabled = false;
  }
});

if (me) {
  loadMyMeals();
  loadAllMeals();
}
