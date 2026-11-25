import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useCurrentUser } from '../../auth/AuthContext';
import { Avatar } from '../Avatar';
import { HomeIcon, PlusIcon, UserIcon } from '../icons';
import { Logo } from '../Logo';
import styles from './AppLayout.module.css';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

/** 스크롤을 내리면 헤더 아래에 옅은 구분선을 보여 준다 */
function useScrolled(offset = 8) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > offset);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [offset]);
  return scrolled;
}

const navClass = ({ isActive }: { isActive: boolean }) => `${styles.navLink} ${isActive ? styles.active : ''}`;
const tabClass = ({ isActive }: { isActive: boolean }) => `${styles.tab} ${isActive ? styles.tabActive : ''}`;

export function AppLayout() {
  const user = useCurrentUser();
  const scrolled = useScrolled();

  return (
    <div className={styles.shell}>
      <ScrollToTop />
      <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
        <div className={`container ${styles.headerInner}`}>
          <Link to="/" aria-label="soban 홈">
            <Logo size={30} />
          </Link>

          <nav className={styles.nav} aria-label="주요 메뉴">
            <NavLink to="/" end className={navClass}>
              <HomeIcon size={18} />
              홈
            </NavLink>
            <NavLink to="/account" className={navClass}>
              <UserIcon size={18} />
              내 정보
            </NavLink>
          </nav>

          <div className={styles.right}>
            <NavLink to="/new" className={({ isActive }) => `${styles.cta} ${isActive ? styles.ctaActive : ''}`}>
              <PlusIcon size={18} />
              식사 기록하기
            </NavLink>
            <Link to="/account" className={styles.me} aria-label={`${user.name} 내 정보`}>
              <Avatar name={user.name} size={40} />
            </Link>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <Outlet />
      </main>

      <nav className={styles.tabbar} aria-label="하단 메뉴">
        <NavLink to="/" end className={tabClass}>
          <HomeIcon size={22} />
          <span>홈</span>
        </NavLink>
        <NavLink to="/new" className={({ isActive }) => `${styles.fab} ${isActive ? styles.fabActive : ''}`} aria-label="식사 기록하기">
          <PlusIcon size={26} />
        </NavLink>
        <NavLink to="/account" className={tabClass}>
          <UserIcon size={22} />
          <span>내 정보</span>
        </NavLink>
      </nav>
    </div>
  );
}
