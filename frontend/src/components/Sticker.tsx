import type { CSSProperties } from 'react';
import styles from './Sticker.module.css';

/*
 * 장식용 스티커 일러스트 — 의미를 전달하지 않으므로 항상 aria-hidden.
 * 64×64 기준의 납작한 도형 + 흰 테두리(CSS)로 스티커처럼 보이게 한다.
 */

const INK = '#26292b';

const art = {
  leaf: (
    <>
      <path d="M12 52C10 30 24 12 52 10c2 26-14 42-40 42z" fill="#8fd3b6" />
      <path d="M14 50 44 18" stroke="#2e8b6e" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M24 39l-1-10M32 31l-1-9M30 40l10 0M38 31l8 1" stroke="#2e8b6e" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  lemon: (
    <>
      <circle cx="32" cy="32" r="24" fill="#fbe39a" />
      <circle cx="32" cy="32" r="19" fill="#fff4c4" />
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return <path key={i} d={`M32 32L${32 + Math.cos(a) * 16} ${32 + Math.sin(a) * 16}`} stroke="#f2cf5b" strokeWidth="2.4" strokeLinecap="round" />;
      })}
      <circle cx="32" cy="32" r="2.6" fill="#f2cf5b" />
    </>
  ),
  carrot: (
    <>
      <path d="M40 22 14 52c-2 2 0 4 2 2l30-26z" fill="#f79e87" />
      <path d="M22 44l4 3M28 37l4 3M34 31l3 3" stroke="#df6f52" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M40 22c0-8 4-12 8-14-1 6 0 9 2 10 3-3 7-3 10-2-3 3-6 5-10 6 2 2 4 5 3 9-4-1-7-4-8-7" fill="#8fd3b6" />
    </>
  ),
  cherry: (
    <>
      <path d="M22 40C24 26 32 16 44 12M42 42c-2-12-1-22 2-30" stroke="#2e8b6e" strokeWidth="2.6" strokeLinecap="round" fill="none" />
      <path d="M44 12c6-4 12-2 14 2-6 3-11 2-14-2z" fill="#8fd3b6" />
      <circle cx="21" cy="45" r="10" fill="#f28ba4" />
      <circle cx="42" cy="47" r="10" fill="#f28ba4" />
      <circle cx="18" cy="42" r="2.6" fill="#fff" opacity=".7" />
      <circle cx="39" cy="44" r="2.6" fill="#fff" opacity=".7" />
    </>
  ),
  avocado: (
    <>
      <path d="M32 6c8 0 12 10 16 20 5 12 4 30-16 30S11 38 16 26C20 16 24 6 32 6z" fill="#6fae83" />
      <path d="M32 11c6 0 9 9 12 17 4 10 3 24-12 24s-16-14-12-24c3-8 6-17 12-17z" fill="#e6f3c9" />
      <circle cx="32" cy="38" r="9" fill="#b5835a" />
      <circle cx="29" cy="35" r="2.4" fill="#fff" opacity=".5" />
    </>
  ),
  egg: (
    <>
      <path d="M12 34c-4-12 6-22 16-20 6-8 22-6 24 6 8 6 6 20-6 22-6 10-24 10-30 0-6 0-6-6-4-8z" fill="#fff" stroke="#ebe8e0" strokeWidth="1.5" />
      <circle cx="32" cy="32" r="10" fill="#fbd35d" />
      <circle cx="29" cy="29" r="3" fill="#fff" opacity=".7" />
    </>
  ),
  strawberry: (
    <>
      <path d="M32 58C18 50 10 36 14 26c3-7 11-8 18-6 7-2 15-1 18 6 4 10-4 24-18 32z" fill="#f2807d" />
      <path d="M20 22c2-6 7-8 12-6 5-2 10 0 12 6-4-1-8 0-12 2-4-2-8-3-12-2z" fill="#6fae83" />
      <path d="M32 16v-8" stroke="#2e8b6e" strokeWidth="2.6" strokeLinecap="round" />
      {[
        [24, 32],
        [32, 30],
        [40, 32],
        [28, 40],
        [36, 40],
        [32, 48],
      ].map(([x, y]) => (
        <ellipse key={`${x}${y}`} cx={x} cy={y} rx="1.4" ry="2" fill="#fde3c4" />
      ))}
    </>
  ),
  sparkle: (
    <>
      <path d="M32 6c2 14 6 18 20 20-14 2-18 6-20 20-2-14-6-18-20-20 14-2 18-6 20-20z" fill="#d7d0f3" />
      <path d="M50 40c1 6 3 8 8 9-5 1-7 3-8 9-1-6-3-8-8-9 5-1 7-3 8-9z" fill="#fbe39a" />
    </>
  ),
  fork: (
    <>
      <path d="M26 6v16c0 4 2 6 4 7v27a2 2 0 0 0 4 0V29c2-1 4-3 4-7V6" fill="none" stroke={INK} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M30 6v14M34 6v14" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />
    </>
  ),
} as const;

export type StickerName = keyof typeof art;

interface StickerProps {
  name: StickerName;
  size?: number;
  rotate?: number;
  float?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function Sticker({ name, size = 56, rotate = 0, float = false, className = '', style }: StickerProps) {
  return (
    <span
      className={`${styles.sticker} ${float ? styles.float : ''} ${className}`}
      style={{ width: size, height: size, ['--rot' as string]: `${rotate}deg`, transform: `rotate(${rotate}deg)`, ...style }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 64 64" width="100%" height="100%">
        {art[name]}
      </svg>
    </span>
  );
}
