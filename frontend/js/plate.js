/*
 * 메뉴 문자열 → 위에서 내려다본 식탁(flat-lay) 구성.
 * 백엔드에 이미지 필드가 없어서, 메뉴 텍스트에서 그릇 종류·음식 색을 추론해 일관된 비주얼을 만든다.
 * 같은 메뉴는 항상 같은 그림이 나오도록 문자열 해시로 시드를 고정한다.
 */

// ---------- seeded random ----------
export function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(seed) {
  let a = seed || 1;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- color ----------
function mix(a, b, t) {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ch = (shift) => Math.round(((pa >> shift) & 255) * (1 - t) + ((pb >> shift) & 255) * t);
  return `#${((1 << 24) | (ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).slice(1)}`;
}

export const shade = (c, t) => mix(c, '#1d1c19', t);
export const tint = (c, t) => mix(c, '#fbf9f4', t);

/** 식사 구분별 식탁 색 — 하루의 시간대를 은은하게 표현 */
export const TABLE_TONE = {
  breakfast: '#fbe7a8',
  lunch: '#c6ead9',
  snack: '#f8d6df',
  dinner: '#fdd7ca',
  late_snack: '#dcd6f5',
};

// speck: 고명·질감 점 색
const FOODS = [
  { re: /김치|떡볶이|고추|제육|토마토|tomato|라구|짬뽕|육개장|마라|빨간/i, color: '#b0503a', speck: '#f1e4cf' },
  { re: /된장|청국장|카레|curry/i, color: '#b0844c', speck: '#6f7d4c' },
  { re: /계란|달걀|egg|오믈렛|스크램블|후라이|프렌치/i, color: '#e2b552', speck: '#fbf4dc' },
  { re: /샐러드|salad|채소|야채|나물|시금치|브로콜리|아보카도|쌈|상추|케일|그린/i, color: '#73824e', speck: '#c8d19f' },
  { re: /연어|salmon|참치|회|새우|shrimp/i, color: '#df9670', speck: '#f6e3d3' },
  { re: /생선|고등어|갈치|삼치|대구|fish/i, color: '#cdb796', speck: '#8b6a4b' },
  { re: /고기|불고기|갈비|스테이크|steak|돼지|소고기|삼겹|목살|베이컨|햄|소시지|돈까스|돈가스|bbq/i, color: '#7a4e36', speck: '#c79a6c' },
  { re: /닭|치킨|chicken/i, color: '#c48a4d', speck: '#f0dbb5' },
  { re: /두부|tofu|순두부/i, color: '#efe6d2', speck: '#b9a98c' },
  { re: /면|우동|국수|파스타|pasta|라면|소바|냉면|짜장/i, color: '#e7d29d', speck: '#a9874f' },
  { re: /빵|토스트|bread|베이글|샌드위치|크루아상|마들렌|쿠키|케이크|와플|팬케이크|스콘/i, color: '#c8935d', speck: '#f2dfbf' },
  { re: /요거트|요구르트|yogurt|치즈|그릭|크림/i, color: '#f3efe6', speck: '#d9cfbd' },
  { re: /블루베리|berry|베리|포도|자두|가지/i, color: '#4f4a68', speck: '#a59ab8' },
  { re: /딸기|strawberry|비트/i, color: '#b8424a', speck: '#f4d7c4' },
  { re: /사과|바나나|과일|귤|오렌지|망고|감|단호박|고구마|호박/i, color: '#df9f45', speck: '#f6e2b6' },
  { re: /밥|rice|죽|오트|oat|그래놀라|곡물|현미|잡곡|떡/i, color: '#f1ebdd', speck: '#cbbfa8' },
  { re: /김|미역|해조|버섯|mushroom|초콜릿|chocolate/i, color: '#4a4334', speck: '#a39577' },
];

const FALLBACK = ['#b88a5a', '#8c9466', '#c9a46a', '#a8664a', '#d9c7a2', '#7e6a55'];

const DRINKS = [
  { re: /라떼|latte|카푸치노|플랫/i, color: '#b58a63' },
  { re: /커피|아메리카노|coffee|에스프레소|콜드브루/i, color: '#4f3324' },
  { re: /말차|matcha|녹차/i, color: '#93994f' },
  { re: /주스|juice|에이드|스무디/i, color: '#df963e' },
  { re: /우유|밀크|milk|두유/i, color: '#f4efe6' },
  { re: /티$|tea|차$|홍차|얼그레이|보리차|허브/i, color: '#a8743b' },
  { re: /맥주|beer|하이볼/i, color: '#d9a443' },
  { re: /와인|wine/i, color: '#6b2a34' },
];

const SOUP = /찌개|국$|국\b|탕|전골|수프|soup|우동|라면|짬뽕|쌀국수|칼국수|죽|스튜|stew|냉면|국밥/i;

export function splitMenu(menu) {
  return menu
    .split(/[,，、·/+&]|\s및\s|\s그리고\s/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function foodOf(name, rand) {
  const rule = FOODS.find((f) => f.re.test(name));
  if (rule) return { name, color: rule.color, speck: rule.speck };
  const color = FALLBACK[hash(name) % FALLBACK.length];
  return { name, color, speck: tint(color, 0.6 + rand() * 0.2) };
}

/** 부드러운 유기적 형태 (Catmull-Rom → cubic bezier) */
function blob(rand, r, wobble = 0.16, points = 9) {
  const pts = Array.from({ length: points }, (_, i) => {
    const a = (i / points) * Math.PI * 2;
    const rr = r * (1 - wobble / 2 + rand() * wobble);
    return [Math.cos(a) * rr, Math.sin(a) * rr];
  });
  const n = pts.length;
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return `${d}Z`;
}

function makeDish(food, kind, cx, cy, r, rand) {
  const well = kind === 'bowl' ? r * 0.8 : r * 0.62;
  const pieces = [];

  if (kind === 'bowl') {
    // 국물 위에 떠 있는 건더기
    const count = 3 + Math.floor(rand() * 4);
    for (let i = 0; i < count; i++) {
      const a = rand() * Math.PI * 2;
      const d = rand() * well * 0.55;
      const pr = well * (0.12 + rand() * 0.1);
      pieces.push({
        x: Math.cos(a) * d,
        y: Math.sin(a) * d,
        r: pr,
        path: blob(rand, pr, 0.35, 7),
        color: i % 2 ? tint(food.color, 0.55) : shade(food.color, 0.18),
      });
    }
  } else {
    // 접시 위 한 덩어리 + 작은 조각들
    const mr = well * (0.66 + rand() * 0.12);
    pieces.push({ x: (rand() - 0.5) * well * 0.2, y: (rand() - 0.5) * well * 0.2, r: mr, path: blob(rand, mr, 0.22), color: food.color });
    const extra = 1 + Math.floor(rand() * 3);
    for (let i = 0; i < extra; i++) {
      const a = rand() * Math.PI * 2;
      const pr = well * (0.18 + rand() * 0.12);
      const d = mr * (0.55 + rand() * 0.35);
      pieces.push({
        x: Math.cos(a) * d,
        y: Math.sin(a) * d,
        r: pr,
        path: blob(rand, pr, 0.3, 8),
        color: i % 2 ? shade(food.color, 0.14) : tint(food.color, 0.22),
      });
    }
  }

  const specks = Array.from({ length: 8 + Math.floor(rand() * 12) }, () => {
    const a = rand() * Math.PI * 2;
    const d = Math.sqrt(rand()) * well * 0.72;
    return { x: Math.cos(a) * d, y: Math.sin(a) * d, r: 1.4 + rand() * 2.6 };
  });

  return { kind, cx, cy, r, food, pieces, specks };
}

/** viewBox 0 0 600 600 기준 구성 */
export function compose(menu, type, seedKey = '') {
  const tone = TABLE_TONE[type];
  const rand = rng(hash(`${seedKey}|${menu ?? ''}|${type}`));
  const rotation = (rand() - 0.5) * 16;

  if (!menu) {
    return { tone, main: null, sides: [], cup: null, cutlery: true, napkin: { stripe: '#8fd3b6' }, rotation };
  }

  const items = splitMenu(menu);
  const drinkItem = items.find((i) => DRINKS.some((d) => d.re.test(i)));
  const foods = items.filter((i) => i !== drinkItem).map((i) => foodOf(i, rand));
  const drink = drinkItem ? DRINKS.find((d) => d.re.test(drinkItem)).color : null;

  // 음료만 있는 경우 — 잔 하나를 크게
  if (foods.length === 0 && drink) {
    return {
      tone,
      main: null,
      sides: [],
      cup: { cx: 300, cy: 300, r: 112, color: drink },
      cutlery: false,
      napkin: { stripe: '#8fd3b6' },
      rotation,
    };
  }

  const [first, ...rest] = foods;
  const sidesFood = rest.slice(0, 3);
  const mainKind = SOUP.test(first.name) ? 'bowl' : 'plate';

  if (sidesFood.length === 0) {
    const main = makeDish(first, mainKind, 318, 300, mainKind === 'bowl' ? 132 : 150, rand);
    return {
      tone,
      main,
      sides: [],
      cup: drink ? { cx: 488, cy: 150, r: 46, color: drink } : null,
      cutlery: true,
      napkin: rand() > 0.35 ? { stripe: '#8fd3b6' } : null,
      rotation,
    };
  }

  // 한 상 차림 — 주 메뉴 + 곁들이는 반찬 그릇
  const main = makeDish(first, mainKind, 262, 292, mainKind === 'bowl' ? 118 : 132, rand);
  const angles = [-38, 14, 64].slice(0, sidesFood.length);
  const sides = sidesFood.map((food, i) => {
    const a = ((angles[i] + (rand() - 0.5) * 10) * Math.PI) / 180;
    const dist = 196 + rand() * 12;
    const kind = SOUP.test(food.name) ? 'bowl' : rand() > 0.5 ? 'bowl' : 'plate';
    return makeDish(food, kind, 262 + Math.cos(a) * dist, 292 + Math.sin(a) * dist, 52 + rand() * 8, rand);
  });

  return {
    tone,
    main,
    sides,
    cup: drink ? { cx: 118, cy: 132, r: 44, color: drink } : null,
    cutlery: false,
    napkin: null,
    rotation,
  };
}

// ---------- SVG 렌더링 ----------
/*
 * 위에서 내려다본 식탁 — 사진 자리를 대신하는 에디토리얼 비주얼.
 * 부모 요소의 크기를 그대로 채우며(cover), 비율은 부모에서 정한다.
 */

const PORCELAIN = '#ffffff';
let plateSeq = 0;

const escAttr = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

function dishSvg(dish, shadow) {
  const { cx, cy, r, food, pieces, specks } = dish;
  const bowl = dish.kind === 'bowl';
  const well = bowl ? r * 0.8 : r * 0.66;

  let s = `<g transform="translate(${cx} ${cy})">`;
  s += `<circle cx="${r * 0.06}" cy="${r * 0.1}" r="${r * 1.12}" fill="url(#${shadow})"/>`;
  s += `<circle r="${r}" fill="${PORCELAIN}"/>`;
  if (bowl) {
    s += `<circle r="${r * 0.86}" fill="#f1efe9"/>`;
    s += `<circle r="${well}" fill="${shade(food.color, 0.08)}"/>`;
    s += `<circle r="${well * 0.94}" cx="${-well * 0.03}" cy="${-well * 0.03}" fill="${food.color}"/>`;
    s += `<path d="M${-well * 0.62},${-well * 0.5} A${well * 0.8},${well * 0.8} 0 0 1 ${well * 0.35},${-well * 0.72}" stroke="${tint(food.color, 0.5)}" stroke-width="${r * 0.035}" stroke-linecap="round" fill="none" opacity="0.55"/>`;
  } else {
    s += `<circle r="${r * 0.92}" fill="none" stroke="#efede7" stroke-width="1.2"/>`;
    s += `<circle r="${well * 1.04}" fill="#f6f4ef"/>`;
  }
  for (const p of pieces) {
    s += `<g transform="translate(${p.x} ${p.y})">`;
    s += `<path d="${p.path}" fill="${shade(p.color, 0.22)}" transform="translate(${p.r * 0.06} ${p.r * 0.1})" opacity="0.5"/>`;
    s += `<path d="${p.path}" fill="${p.color}"/>`;
    s += `<path d="${p.path}" fill="${tint(p.color, 0.35)}" transform="translate(${-p.r * 0.14} ${-p.r * 0.16}) scale(0.55)" opacity="0.45"/>`;
    s += `</g>`;
  }
  for (const sp of specks) {
    s += `<circle cx="${sp.x}" cy="${sp.y}" r="${sp.r}" fill="${food.speck}" opacity="0.85"/>`;
  }
  return `${s}</g>`;
}

/**
 * 식탁 일러스트 HTML
 * @param {{menu: string|null, type: string, seedKey?: string|number, className?: string, label?: string, inset?: number}} opts
 *   - menu: null 이면 아직 비어 있는 식탁
 *   - label: 접근성 레이블 — 없으면 장식용
 *   - inset: 식탁을 살짝 멀리서 보기 (0~100). 가로로 긴 프레임에서 그릇이 잘리지 않게 할 때
 */
export function plate({ menu, type, seedKey = '', className = '', label, inset = 0 }) {
  const uid = ++plateSeq;
  const c = compose(menu, type, String(seedKey));
  const ids = { shadow: `ps${uid}`, light: `pl${uid}` };

  const metal = '#7cc7a8';
  const main = c.main;
  const emptyTable = !main && !c.cup;
  const anchorX = main ? main.cx - main.r : 168;
  const cutX = anchorX - 58;

  const a11y = label ? `role="img" aria-label="${escAttr(label)}"` : 'aria-hidden="true"';
  let s = `<div class="plate-plate ${className}" style="background: ${c.tone}" ${a11y}>`;
  s += `<svg viewBox="${-inset} ${-inset} ${600 + inset * 2} ${600 + inset * 2}" preserveAspectRatio="xMidYMid slice" class="plate-svg">`;
  s += `<defs>
    <radialGradient id="${ids.shadow}"><stop offset="0.8" stop-color="#26292b" stop-opacity="0.1"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
    <linearGradient id="${ids.light}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0.25"/><stop offset="0.6" stop-color="#fff" stop-opacity="0"/></linearGradient>
  </defs>`;
  s += `<rect x="-100" y="-100" width="800" height="800" fill="${c.tone}"/>`;
  s += `<g transform="rotate(${c.rotation} 300 300)">`;

  if (c.napkin) {
    s += `<g transform="rotate(-3 ${cutX + 20} 300)">
      <rect x="${cutX - 45}" y="127" width="118" height="360" fill="#000" opacity="0.06"/>
      <rect x="${cutX - 48}" y="122" width="118" height="360" fill="#ffffff"/>
      <path d="M${cutX - 48},146h118M${cutX - 48},154h118" stroke="${c.napkin.stripe}" stroke-width="2" opacity="0.8"/>
    </g>`;
  }

  if (c.cutlery || emptyTable) {
    // fork + knife
    s += `<g>
      <g transform="translate(${cutX} 0)"><path d="M-13,150v52c0,14 6,22 10,26v236a3,3 0 0 0 6,0V228c4-4 10-12 10-26v-52h-4v46h-3.33v-46h-4v46h-3.34v-46h-4v46h-3.33v-46z" fill="${metal}"/></g>
      <g transform="translate(${cutX + 34} 0)">
        <path d="M-3,150c9,8 11,40 9,96l-3,4v214a3,3 0 0 1-6,0V150z" fill="${metal}"/>
        <path d="M-3,150c5,6 7,24 7,52" stroke="${tint(metal, 0.5)}" stroke-width="1.4" fill="none"/>
      </g>
    </g>`;
  }

  if (emptyTable) {
    s += `<g transform="translate(318 300)">
      <circle cx="9" cy="15" r="168" fill="url(#${ids.shadow})"/>
      <circle r="150" fill="${PORCELAIN}"/>
      <circle r="138" fill="none" stroke="#efede7" stroke-width="1.2"/>
      <circle r="100" fill="#f6f4ef"/>
    </g>`;
  }

  if (main) s += dishSvg(main, ids.shadow);
  for (const side of c.sides) s += dishSvg(side, ids.shadow);

  if (c.cup) {
    const { cx, cy, r, color } = c.cup;
    s += `<g transform="translate(${cx} ${cy})">
      <circle cx="6" cy="10" r="${r * 1.6}" fill="url(#${ids.shadow})"/>
      <circle r="${r * 1.42}" fill="${PORCELAIN}"/>
      <circle r="${r * 1.18}" fill="none" stroke="#efede7" stroke-width="1.2"/>
      <rect x="${r * 0.82}" y="${-r * 0.16}" width="${r * 0.52}" height="${r * 0.32}" rx="${r * 0.16}" fill="#f6f4ef"/>
      <circle r="${r}" fill="#f6f4ef"/>
      <circle r="${r * 0.82}" fill="${color}"/>
      <circle r="${r * 0.7}" fill="none" stroke="${tint(color, 0.3)}" stroke-width="${r * 0.06}" opacity="0.6"/>
    </g>`;
  }

  s += `</g>`;
  s += `<rect x="${-inset}" y="${-inset}" width="${600 + inset * 2}" height="${600 + inset * 2}" fill="url(#${ids.light})"/>`;
  s += `</svg></div>`;
  return s;
}
