import styles from './Logo.module.css';

/** 소반 — 텍스트 워드마크 */
export function Logo({ size = 28, className = '' }: { size?: number; className?: string }) {
  return (
    <span className={`${styles.logo} ${className}`} style={{ fontSize: size }}>
      soban<span className={styles.dot} />
    </span>
  );
}
