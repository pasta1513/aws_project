import type { CSSProperties, ReactNode } from 'react';
import { errorMessage } from '../api/client';
import { Button } from './Button';
import { AlertIcon, RefreshIcon } from './icons';
import { Sticker, type StickerName } from './Sticker';
import styles from './StateViews.module.css';

export function Skeleton({ className = '', style }: { className?: string; style?: CSSProperties }) {
  return <span className={`${styles.skeleton} ${className}`} style={style} aria-hidden="true" />;
}

export function LoadingLabel({ children = '불러오는 중' }: { children?: ReactNode }) {
  return (
    <span className="visually-hidden" role="status">
      {children}
    </span>
  );
}

interface EmptyStateProps {
  sticker?: StickerName;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  compact?: boolean;
}

export function EmptyState({ sticker = 'leaf', title, description, action, compact }: EmptyStateProps) {
  return (
    <div className={`${styles.box} ${compact ? styles.compact : ''}`}>
      <Sticker name={sticker} size={compact ? 52 : 68} rotate={-8} />
      <h3 className={styles.title}>{title}</h3>
      {description && <p className={styles.desc}>{description}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}

interface ErrorStateProps {
  error: unknown;
  onRetry?: () => void;
  title?: string;
}

export function ErrorState({ error, onRetry, title = '기록을 불러오지 못했어요' }: ErrorStateProps) {
  return (
    <div className={`${styles.box} ${styles.error}`} role="alert">
      <span className={styles.errorIcon}>
        <AlertIcon size={26} />
      </span>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.desc}>{errorMessage(error)}</p>
      {onRetry && (
        <div className={styles.action}>
          <Button variant="secondary" size="sm" onClick={onRetry}>
            <RefreshIcon size={15} />
            다시 시도
          </Button>
        </div>
      )}
    </div>
  );
}
