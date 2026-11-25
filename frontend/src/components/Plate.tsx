import { memo, useId, useMemo } from 'react';
import type { MealType } from '../api/types';
import { compose, shade, tint, type Dish } from '../lib/plate';
import styles from './Plate.module.css';

/*
 * 위에서 내려다본 식탁 — 사진 자리를 대신하는 에디토리얼 비주얼.
 * 부모 요소의 크기를 그대로 채우며(cover), 비율은 부모에서 정한다.
 */

const PORCELAIN = '#ffffff';

function DishView({ dish, shadow }: { dish: Dish; shadow: string }) {
  const { cx, cy, r, food, pieces, specks } = dish;
  const bowl = dish.kind === 'bowl';
  const well = bowl ? r * 0.8 : r * 0.66;

  return (
    <g transform={`translate(${cx} ${cy})`}>
      <circle cx={r * 0.06} cy={r * 0.1} r={r * 1.12} fill={`url(#${shadow})`} />
      <circle r={r} fill={PORCELAIN} />
      {bowl ? (
        <>
          <circle r={r * 0.86} fill="#f1efe9" />
          <circle r={well} fill={shade(food.color, 0.08)} />
          <circle r={well * 0.94} cx={-well * 0.03} cy={-well * 0.03} fill={food.color} />
          <path
            d={`M${-well * 0.62},${-well * 0.5} A${well * 0.8},${well * 0.8} 0 0 1 ${well * 0.35},${-well * 0.72}`}
            stroke={tint(food.color, 0.5)}
            strokeWidth={r * 0.035}
            strokeLinecap="round"
            fill="none"
            opacity={0.55}
          />
        </>
      ) : (
        <>
          <circle r={r * 0.92} fill="none" stroke="#efede7" strokeWidth={1.2} />
          <circle r={well * 1.04} fill="#f6f4ef" />
        </>
      )}
      {pieces.map((p, i) => (
        <g key={i} transform={`translate(${p.x} ${p.y})`}>
          <path d={p.path} fill={shade(p.color, 0.22)} transform={`translate(${p.r * 0.06} ${p.r * 0.1})`} opacity={0.5} />
          <path d={p.path} fill={p.color} />
          <path d={p.path} fill={tint(p.color, 0.35)} transform={`translate(${-p.r * 0.14} ${-p.r * 0.16}) scale(0.55)`} opacity={0.45} />
        </g>
      ))}
      {specks.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r} fill={food.speck} opacity={0.85} />
      ))}
    </g>
  );
}

interface PlateProps {
  /** null 이면 아직 비어 있는 식탁 */
  menu: string | null;
  type: MealType;
  /** 같은 메뉴라도 기록마다 구도를 다르게 하고 싶을 때 */
  seedKey?: string | number;
  className?: string;
  /** 접근성 레이블 — 없으면 장식용 */
  label?: string;
  /** 식탁을 살짝 멀리서 보기 (0~100). 가로로 긴 프레임에서 그릇이 잘리지 않게 할 때 */
  inset?: number;
}

export const Plate = memo(function Plate({ menu, type, seedKey = '', className = '', label, inset = 0 }: PlateProps) {
  const uid = useId().replace(/:/g, '');
  const c = useMemo(() => compose(menu, type, String(seedKey)), [menu, type, seedKey]);
  const ids = { shadow: `s${uid}`, light: `l${uid}` };

  const metal = '#7cc7a8';
  const main = c.main;
  const emptyTable = !main && !c.cup;
  const anchorX = main ? main.cx - main.r : 168;
  const cutX = anchorX - 58;

  return (
    <div
      className={`${styles.plate} ${className}`}
      style={{ background: c.tone }}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <svg viewBox={`${-inset} ${-inset} ${600 + inset * 2} ${600 + inset * 2}`} preserveAspectRatio="xMidYMid slice" className={styles.svg}>
        <defs>
          <radialGradient id={ids.shadow}>
            <stop offset="0.8" stopColor="#26292b" stopOpacity="0.1" />
            <stop offset="1" stopColor="#000" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={ids.light} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.25" />
            <stop offset="0.6" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        </defs>

        <rect x="-100" y="-100" width="800" height="800" fill={c.tone} />

        <g transform={`rotate(${c.rotation} 300 300)`}>
          {c.napkin && (
            <g transform={`rotate(-3 ${cutX + 20} 300)`}>
              <rect x={cutX - 45} y={127} width={118} height={360} fill="#000" opacity={0.06} />
              <rect x={cutX - 48} y={122} width={118} height={360} fill="#ffffff" />
              <path d={`M${cutX - 48},146h118M${cutX - 48},154h118`} stroke={c.napkin.stripe} strokeWidth={2} opacity={0.8} />
            </g>
          )}

          {(c.cutlery || emptyTable) && (
            <g>
              {/* fork */}
              <g transform={`translate(${cutX} 0)`}>
                                <path
                  d="M-13,150v52c0,14 6,22 10,26v236a3,3 0 0 0 6,0V228c4-4 10-12 10-26v-52h-4v46h-3.33v-46h-4v46h-3.34v-46h-4v46h-3.33v-46z"
                  fill={metal}
                />
              </g>
              {/* knife */}
              <g transform={`translate(${cutX + 34} 0)`}>
                <path d="M-3,150c9,8 11,40 9,96l-3,4v214a3,3 0 0 1-6,0V150z" fill={metal} />
                <path d="M-3,150c5,6 7,24 7,52" stroke={tint(metal, 0.5)} strokeWidth={1.4} fill="none" />
              </g>
            </g>
          )}

          {emptyTable && (
            <g transform="translate(318 300)">
              <circle cx={9} cy={15} r={168} fill={`url(#${ids.shadow})`} />
              <circle r={150} fill={PORCELAIN} />
              <circle r={138} fill="none" stroke="#efede7" strokeWidth={1.2} />
              <circle r={100} fill="#f6f4ef" />
            </g>
          )}

          {main && <DishView dish={main} shadow={ids.shadow} />}
          {c.sides.map((s, i) => (
            <DishView key={i} dish={s} shadow={ids.shadow} />
          ))}

          {c.cup && (
            <g transform={`translate(${c.cup.cx} ${c.cup.cy})`}>
              <circle cx={6} cy={10} r={c.cup.r * 1.6} fill={`url(#${ids.shadow})`} />
              <circle r={c.cup.r * 1.42} fill={PORCELAIN} />
              <circle r={c.cup.r * 1.18} fill="none" stroke="#efede7" strokeWidth={1.2} />
              <rect x={c.cup.r * 0.82} y={-c.cup.r * 0.16} width={c.cup.r * 0.52} height={c.cup.r * 0.32} rx={c.cup.r * 0.16} fill="#f6f4ef" />
              <circle r={c.cup.r} fill="#f6f4ef" />
              <circle r={c.cup.r * 0.82} fill={c.cup.color} />
              <circle r={c.cup.r * 0.7} fill="none" stroke={tint(c.cup.color, 0.3)} strokeWidth={c.cup.r * 0.06} opacity={0.6} />
            </g>
          )}
        </g>

        <rect x={-inset} y={-inset} width={600 + inset * 2} height={600 + inset * 2} fill={`url(#${ids.light})`} />
      </svg>
    </div>
  );
});
