import { useEffect, useRef, type ReactNode } from 'react';
import { Button } from './Button';
import { AlertIcon } from './icons';
import styles from './ConfirmDialog.module.css';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  children?: ReactNode;
  confirmLabel: string;
  tone?: 'danger' | 'primary';
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmDialog({ open, title, children, confirmLabel, tone = 'primary', loading, onConfirm, onClose }: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      onClose={onClose}
      onCancel={(e) => {
        if (loading) e.preventDefault();
      }}
      onClick={(e) => {
        if (e.target === ref.current && !loading) onClose();
      }}
      aria-labelledby="confirm-title"
    >
      <div className={styles.body}>
        <span className={styles.badge} aria-hidden="true">
          <AlertIcon size={26} />
        </span>
        <h2 id="confirm-title" className={styles.title}>
          {title}
        </h2>
        {children && <div className={styles.content}>{children}</div>}
        <div className={styles.actions}>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            취소
          </Button>
          <Button variant={tone} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
