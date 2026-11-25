import { Link } from 'react-router-dom';
import { ButtonLink } from '../components/Button';
import { Logo } from '../components/Logo';
import { Plate } from '../components/Plate';
import { Sticker } from '../components/Sticker';
import styles from './NotFound.module.css';

export default function NotFoundPage() {
  return (
    <div className={`container ${styles.page}`}>
      <Link to="/" aria-label="soban 홈" className={styles.logo}>
        <Logo size={30} />
      </Link>
      <div className={styles.body}>
        <div className={styles.visual}>
          <Plate menu={null} type="snack" seedKey="404" />
          <span className={`${styles.code} round`}>404</span>
          <Sticker name="egg" size={64} rotate={-14} float className={styles.sticker} />
        </div>
        <h1 className={styles.title}>앗, 빈 접시예요</h1>
        <p className={styles.desc}>주소가 바뀌었거나 존재하지 않는 페이지예요.</p>
        <ButtonLink to="/" size="lg" className={styles.cta}>
          홈으로 가기
        </ButtonLink>
      </div>
    </div>
  );
}
