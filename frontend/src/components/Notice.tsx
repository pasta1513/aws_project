import type { ReactNode } from 'react';
import { AlertIcon, CheckIcon } from './icons';
import styles from './Notice.module.css';

interface NoticeProps {
  tone?: 'error' | 'success' | 'info';
  children: ReactNode;
}

export function Notice({ tone = 'info', children }: NoticeProps) {
  return (
    <div className={`${styles.notice} ${styles[tone]}`} role={tone === 'error' ? 'alert' : 'status'}>
      {tone === 'success' ? <CheckIcon size={18} /> : <AlertIcon size={18} />}
      <div>{children}</div>
    </div>
  );
}
