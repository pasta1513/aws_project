import { Link } from 'react-router-dom';
import { useCurrentUser } from '../../auth/AuthContext';
import { ArrowRightIcon, CalendarIcon, PlusIcon } from '../../components/icons';
import { Plate } from '../../components/Plate';
import { ErrorState, LoadingLabel, Skeleton } from '../../components/StateViews';
import { Sticker } from '../../components/Sticker';
import { useDayLogs } from '../../hooks/useMeals';
import { formatMonthDay, greetingKo, todayISO, weekday } from '../../lib/date';
import { MEAL_META, MEAL_ORDER, mealVars, type DayLog } from '../../lib/meal';
import { Archive, RecentGallery } from './Archive';
import { WeekHabits } from './Overview';
import { TodayMeals } from './TodayBoard';
import styles from './Dashboard.module.css';

export default function DashboardPage() {
  const user = useCurrentUser();
  const { days, data: meals, isPending, isError, error, refetch } = useDayLogs();
  const today = todayISO();
  const todayLog = days.find((d) => d.date === today);

  return (
    <div className="container fade-in">
      <header className={styles.hero}>
        <div className={styles.hello}>
          <span className="chip">
            <CalendarIcon size={15} />
            {formatMonthDay(today)} {weekday(today)}
          </span>
          <h1 className={styles.greeting}>
            {greetingKo()},
            <br />
            <span className={styles.greetingName}>{user.name}님!</span>
          </h1>
          <p className={styles.helloSub}>
            {isPending
              ? ' '
              : todayLog
                ? `오늘 ${todayLog.meals.length}번의 식사를 기록했어요. 이 페이스 좋아요!`
                : '오늘 먹은 것을 가볍게 남겨 볼까요?'}
          </p>
          <Sticker name="avocado" size={58} rotate={12} float className={styles.heroSticker1} />
          <Sticker name="sparkle" size={44} rotate={-6} className={styles.heroSticker2} />
        </div>

        {isPending ? (
          <Skeleton className={styles.ringSkeleton} />
        ) : (
          !isError && <TodayRing date={today} day={todayLog} />
        )}
      </header>

      {isPending ? (
        <DashboardSkeleton />
      ) : isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : days.length === 0 ? (
        <FirstRecord />
      ) : (
        <>
          <TodayMeals date={today} day={todayLog} />
          <WeekHabits days={days} totalMeals={meals?.length ?? 0} today={today} />
          <RecentGallery days={days.filter((d) => d.date !== today).slice(0, 5)} />
          <Archive days={days} />
        </>
      )}
    </div>
  );
}

/** 오늘의 기록 현황 — 다섯 끼를 컬러 링으로 */
function TodayRing({ date, day }: { date: string; day?: DayLog }) {
  const recorded = new Set(day?.meals.map((m) => m.type));
  const next = MEAL_ORDER.find((t) => !recorded.has(t));
  const R = 70;
  const C = 2 * Math.PI * R;
  const seg = C / 5;
  const gap = 18;

  return (
    <section className={styles.ringCard} aria-label="오늘의 기록 현황">
      <div className={styles.ringWrap}>
        <svg viewBox="0 0 180 180" className={styles.ring} aria-hidden="true">
          {MEAL_ORDER.map((t, i) => (
            <circle
              key={t}
              cx="90"
              cy="90"
              r={R}
              fill="none"
              stroke={recorded.has(t) ? `var(--${t})` : 'rgba(38,41,43,0.08)'}
              strokeWidth="16"
              strokeLinecap="round"
              strokeDasharray={`${seg - gap} ${C - seg + gap}`}
              strokeDashoffset={-(seg * i) + C / 4}
            />
          ))}
        </svg>
        <div className={styles.ringCenter}>
          <span className={`${styles.ringNum} round num`}>
            {recorded.size}
            <small>/5</small>
          </span>
          <span className={styles.ringLabel}>오늘의 기록</span>
        </div>
      </div>

      <div className={styles.ringSide}>
        <ul className={styles.ringLegend}>
          {MEAL_ORDER.map((t) => (
            <li key={t} style={mealVars(t)} className={recorded.has(t) ? styles.legendOn : ''}>
              <i />
              {MEAL_META[t].label}
            </li>
          ))}
        </ul>

        {next ? (
          <Link to={`/new?date=${date}&type=${next}`} className={styles.ringCta}>
            <PlusIcon size={18} />
            {MEAL_META[next].label} 기록하기
          </Link>
        ) : (
          <p className={styles.ringDone}>오늘 다섯 끼를 모두 기록했어요!</p>
        )}
      </div>
    </section>
  );
}

/** 기록이 하나도 없을 때 */
function FirstRecord() {
  return (
    <section className={styles.first} aria-labelledby="first-title">
      <div className={styles.firstVisual}>
        <Plate menu={null} type="lunch" seedKey="first" />
        <Sticker name="lemon" size={64} rotate={-12} float className={styles.firstS1} />
        <Sticker name="carrot" size={70} rotate={18} className={styles.firstS2} />
        <Sticker name="cherry" size={56} rotate={-4} float className={styles.firstS3} />
      </div>
      <div className={styles.firstText}>
        <span className="chip">첫 기록</span>
        <h2 id="first-title" className={styles.firstTitle}>
          아직 비어 있는 식탁,
          <br />첫 끼를 올려 주세요
        </h2>
        <p className={styles.firstDesc}>아침 커피 한 잔도 좋아요. 오늘 먹은 것을 짧게 남기면 하루하루가 모여 나만의 식사 습관이 돼요.</p>
        <Link to="/new" className={styles.firstCta}>
          첫 기록 남기기
          <ArrowRightIcon size={18} />
        </Link>
      </div>
    </section>
  );
}

function DashboardSkeleton() {
  return (
    <>
      <LoadingLabel>식단 기록을 불러오는 중</LoadingLabel>
      <section className={styles.section} aria-hidden="true">
        <div className={styles.sectionHead}>
          <Skeleton style={{ width: 132, height: 30 }} />
        </div>
        <div className={styles.bento}>
          {MEAL_ORDER.map((t) => (
            <Skeleton key={t} className={`${styles.tile} ${styles[`tile_${t}`]} ${styles.tileSkeleton}`} />
          ))}
        </div>
      </section>
      <div className={styles.habits} aria-hidden="true">
        <Skeleton style={{ minHeight: 200, borderRadius: 36 }} />
        <Skeleton style={{ minHeight: 200, borderRadius: 28 }} />
      </div>
    </>
  );
}
