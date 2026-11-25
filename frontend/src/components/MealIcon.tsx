import type { SVGProps } from 'react';
import type { MealType } from '../api/types';

/* 식사 구분 아이콘 — 정보 전달용 라인 아이콘 (icons.tsx 와 같은 선 규칙) */

const paths: Record<MealType, JSX.Element> = {
  // 해 뜨는 아침
  breakfast: (
    <>
      <path d="M4 17.5h16M7.5 17.5a4.5 4.5 0 0 1 9 0" />
      <path d="M12 6.5v2.2M6.2 9.4l1.5 1.5M17.8 9.4l-1.5 1.5M3.5 13.5h1.8M18.7 13.5h1.8" />
      <path d="M8.5 20.5h7" />
    </>
  ),
  // 한낮의 해
  lunch: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3.5v2M12 18.5v2M3.5 12h2M18.5 12h2M6 6l1.4 1.4M16.6 16.6 18 18M6 18l1.4-1.4M16.6 7.4 18 6" />
    </>
  ),
  // 머그컵
  snack: (
    <>
      <path d="M5 9.5h11v5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5z" />
      <path d="M16 11h1.5a2.5 2.5 0 0 1 0 5H16" />
      <path d="M8.5 3.8c-.8 1 .8 1.7 0 2.8M12 3.8c-.8 1 .8 1.7 0 2.8" />
    </>
  ),
  // 김이 나는 그릇
  dinner: (
    <>
      <path d="M3.5 12.5h17a8.5 8.5 0 0 1-17 0z" />
      <path d="M9 20.5h6" />
      <path d="M9 4.5c-1 1.2 1 2 0 3.3M12.5 4c-1 1.2 1 2 0 3.3M16 4.5c-1 1.2 1 2 0 3.3" />
    </>
  ),
  // 초승달
  late_snack: (
    <>
      <path d="M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10z" />
      <path d="M16.5 4.5v3M15 6h3" />
    </>
  ),
};

type Props = SVGProps<SVGSVGElement> & { type: MealType; size?: number };

export function MealIcon({ type, size = 20, ...rest }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {paths[type]}
    </svg>
  );
}
