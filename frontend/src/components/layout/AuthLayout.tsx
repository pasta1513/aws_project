import type { ReactNode } from 'react';
import { Logo } from '../Logo';
import { Plate } from '../Plate';
import { Sticker } from '../Sticker';
import styles from './AuthLayout.module.css';

interface AuthLayoutProps {
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthLayout({ title, description, children, footer }: AuthLayoutProps) {
  return (
    <div className={styles.page}>
      <aside className={styles.brand} aria-hidden="true">
        <Logo size={34} />
        <p className={styles.tagline}>
          오늘 먹은 것,
          <br />
          <mark>즐겁게</mark> 기록해요
        </p>

        <div className={styles.collage}>
          <div className={`${styles.card} ${styles.card1}`}>
            <Plate menu="그릭요거트, 블루베리, 아메리카노" type="breakfast" seedKey="auth-1" />
            <span className={styles.cardLabel}>아침</span>
          </div>
          <div className={`${styles.card} ${styles.card2}`}>
            <Plate menu="연어 포케, 현미밥" type="lunch" seedKey="auth-2" />
            <span className={styles.cardLabel}>점심</span>
          </div>
          <div className={`${styles.card} ${styles.card3}`}>
            <Plate menu="된장찌개, 계란말이, 잡곡밥" type="dinner" seedKey="auth-3" />
            <span className={styles.cardLabel}>저녁</span>
          </div>
          <Sticker name="avocado" size={64} rotate={-12} float className={styles.s1} />
          <Sticker name="lemon" size={54} rotate={10} className={styles.s2} />
          <Sticker name="carrot" size={62} rotate={22} float className={styles.s3} />
          <Sticker name="sparkle" size={42} className={styles.s4} />
        </div>
      </aside>

      <main className={styles.panel}>
        <div className={`${styles.wrap} fade-in`}>
          <h1 className={styles.title}>{title}</h1>
          {description && <p className={styles.desc}>{description}</p>}
          <div className={styles.body}>{children}</div>
          {footer && <div className={styles.footer}>{footer}</div>}
        </div>
      </main>
    </div>
  );
}
