import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ButtonLink } from '../../components/Button';
import { ArrowLeftIcon, CheckIcon, ChevronLeftIcon, ChevronRightIcon, PlusIcon } from '../../components/icons';
import { MealIcon } from '../../components/MealIcon';
import { Plate } from '../../components/Plate';
import { EmptyState, ErrorState, LoadingLabel, Skeleton } from '../../components/StateViews';
import { Sticker } from '../../components/Sticker';
import { useDayLogs } from '../../hooks/useMeals';
import { formatFull, formatMonthDay, isISODate, relativeLabel, weekday } from '../../lib/date';
import { MEAL_META, MEAL_ORDER, mealVars, type DayLog } from '../../lib/meal';
import styles from './DayDetail.module.css';

export default function DayDetailPage() {
  const { date } = useParams();
  const { days, isPending, isError, error, refetch } = useDayLogs();
  const savedId = useSavedFlash();

  const back = (
    <Link to="/" className={styles.back}>
      <ArrowLeftIcon size={18} />
      홈으로
    </Link>
  );

  if (!isISODate(date)) {
    return (
      <div className={`container ${styles.page}`}>
        <div className={styles.topbar}>{back}</div>
        <EmptyState
          sticker="egg"
          title="올바르지 않은 날짜예요"
          description="주소를 다시 확인해 주세요."
          action={<ButtonLink to="/" size="sm">홈으로 가기</ButtonLink>}
        />
      </div>
    );
  }

  if (isPending) {
    return (
      <div className={`container ${styles.page}`}>
        <div className={styles.topbar}>{back}</div>
        <LoadingLabel />
        <div className={styles.hero}>
          <Skeleton className={styles.heroPhoto} />
          <div className={styles.heroText}>
            <Skeleton style={{ height: 28, width: 120 }} />
            <Skeleton style={{ height: 34, width: 80, marginTop: 28 }} />
            <Skeleton style={{ height: 48, width: '80%', marginTop: 14 }} />
          </div>
        </div>
        <div className={styles.meals} aria-hidden="true">
          <Skeleton style={{ height: 28, width: 110, marginBottom: 18 }} />
          <div className={styles.timeline}>
            {MEAL_ORDER.map((t) => (
              <Skeleton key={t} style={{ height: 80, borderRadius: 28 }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={`container ${styles.page}`}>
        <div className={styles.topbar}>{back}</div>
        <ErrorState error={error} onRetry={() => refetch()} />
      </div>
    );
  }

  const index = days.findIndex((d) => d.date === date);
  const day = days[index];
  const newer = index > 0 ? days[index - 1] : undefined;
  const older = index >= 0 ? days[index + 1] : undefined;
  const rel = relativeLabel(date);
  const rep = day?.representative;

  return (
    <>
      {savedId !== null && day?.meals.some((m) => m.id === savedId) && (
        <p className={styles.toast} role="status">
          <CheckIcon size={18} />
          기록을 저장했어요
        </p>
      )}
      <article className={`container ${styles.page} fade-in`}>
        <div className={styles.topbar}>
          {back}
          {day && (
            <nav className={styles.dayNav} aria-label="다른 날 기록">
              <PagerLink day={older} dir="prev" />
              <span className={styles.dayNavLabel}>
                {formatMonthDay(date)} {weekday(date, false)}
              </span>
              <PagerLink day={newer} dir="next" />
            </nav>
          )}
        </div>

        <header className={styles.hero} style={rep ? mealVars(rep.type) : undefined}>
          <div className={styles.heroPhoto}>
            <Plate
              menu={rep?.menu ?? null}
              type={rep?.type ?? 'lunch'}
              seedKey={rep?.id ?? date}
              label={rep ? `${MEAL_META[rep.type].label} — ${rep.menu}` : undefined}
            />
            <Sticker name="cherry" size={64} rotate={-10} float className={styles.sticker1} />
          </div>

          <div className={styles.heroText}>
            <div className={styles.chips}>
              {rel && <span className={styles.relChip}>{rel}</span>}
              <span className="chip">{formatFull(date)}</span>
            </div>

            {rep ? (
              <>
                <span className={styles.typeBadge}>
                  <MealIcon type={rep.type} size={18} />
                  {MEAL_META[rep.type].label}
                </span>
                <h1 className={styles.title}>{rep.menu}</h1>
                <p className={styles.summary}>
                  이 날 <strong>{day.meals.length}끼</strong>를 기록했어요
                </p>
                <div className={styles.meter} aria-hidden="true">
                  {MEAL_ORDER.map((t) => (
                    <i key={t} style={day.meals.some((m) => m.type === t) ? { background: `var(--${t})` } : undefined} />
                  ))}
                </div>
              </>
            ) : (
              <h1 className={styles.title}>{formatMonthDay(date)}</h1>
            )}
          </div>
        </header>

        {!day ? (
          <EmptyState
            sticker="egg"
            title="이 날의 기록이 없어요"
            description="드신 음식을 기억하신다면 지금 남겨 보세요."
            action={
              <ButtonLink to={`/new?date=${date}`} size="sm">
                <PlusIcon size={16} />이 날 기록하기
              </ButtonLink>
            }
          />
        ) : (
          <section className={styles.meals} aria-labelledby="meals-title">
            <h2 id="meals-title" className={styles.mealsTitle}>
              이 날의 식사
            </h2>
            <ol className={styles.timeline}>
              {MEAL_ORDER.map((type) => {
                const meal = day.meals.find((m) => m.type === type);
                const meta = MEAL_META[type];
                return (
                  <li
                    key={type}
                    className={`${styles.item} ${meal ? '' : styles.itemEmpty} ${meal && meal.id === savedId ? styles.itemNew : ''}`}
                    style={mealVars(type)}
                  >
                    <span className={styles.itemIcon}>
                      <MealIcon type={type} size={22} />
                    </span>
                    <div className={styles.itemBody}>
                      <p className={styles.itemType}>
                        {meta.label}
                        <span className="round">{meta.en}</span>
                      </p>
                      {meal ? <p className={styles.itemMenu}>{meal.menu}</p> : <p className={styles.itemMissing}>아직 기록하지 않았어요</p>}
                    </div>
                    {meal ? (
                      <span className={styles.itemThumb}>
                        <Plate menu={meal.menu} type={meal.type} seedKey={meal.id} />
                      </span>
                    ) : (
                      <Link to={`/new?date=${date}&type=${type}`} className={styles.add}>
                        <PlusIcon size={16} />
                        추가
                      </Link>
                    )}
                  </li>
                );
              })}
            </ol>
            <p className={styles.note}>저장한 기록은 현재 수정·삭제할 수 없어요.</p>
          </section>
        )}

        {day && (older || newer) && (
          <nav className={styles.pager} aria-label="이전·다음 기록">
            <PagerCard day={older} dir="prev" />
            <PagerCard day={newer} dir="next" />
          </nav>
        )}
      </article>
    </>
  );
}

function PagerLink({ day, dir }: { day?: DayLog; dir: 'prev' | 'next' }) {
  const label = dir === 'prev' ? '이전 기록' : '다음 기록';
  const Icon = dir === 'prev' ? ChevronLeftIcon : ChevronRightIcon;
  if (!day) {
    return (
      <span className={`${styles.navBtn} ${styles.navOff}`} aria-hidden="true">
        <Icon size={18} />
      </span>
    );
  }
  return (
    <Link to={`/day/${day.date}`} className={styles.navBtn} aria-label={`${label}: ${formatMonthDay(day.date)}`} title={`${label} · ${formatMonthDay(day.date)}`}>
      <Icon size={18} />
    </Link>
  );
}

function PagerCard({ day, dir }: { day?: DayLog; dir: 'prev' | 'next' }) {
  if (!day) return <span className={styles.pagerEmpty} aria-hidden="true" />;
  const rep = day.representative;
  const Icon = dir === 'prev' ? ChevronLeftIcon : ChevronRightIcon;
  return (
    <Link to={`/day/${day.date}`} className={`${styles.pagerCard} ${dir === 'next' ? styles.pagerNext : ''}`} style={mealVars(rep.type)}>
      <span className={styles.pagerThumb}>
        <Plate menu={rep.menu} type={rep.type} seedKey={rep.id} />
      </span>
      <span className={styles.pagerText}>
        <span className={styles.pagerDir}>
          {dir === 'prev' && <Icon size={14} />}
          {dir === 'prev' ? '이전 기록' : '다음 기록'}
          {dir === 'next' && <Icon size={14} />}
        </span>
        <span className={styles.pagerDate}>
          {formatMonthDay(day.date)} {weekday(day.date, false)}
        </span>
        <span className={styles.pagerMenu}>{rep.menu}</span>
      </span>
    </Link>
  );
}

/** 방금 저장한 기록 id — 새로고침·뒤로가기 때 다시 뜨지 않도록 history state 를 비운다 */
function useSavedFlash(): number | null {
  const location = useLocation();
  const navigate = useNavigate();
  const [savedId] = useState<number | null>(() => (location.state as { savedId?: number } | null)?.savedId ?? null);
  const [visible, setVisible] = useState(savedId !== null);

  useEffect(() => {
    if (savedId === null) return;
    navigate(location.pathname, { replace: true, state: null });
    const timer = window.setTimeout(() => setVisible(false), 3200);
    return () => window.clearTimeout(timer);
    // 최초 진입 시 한 번만
  }, []);

  return visible ? savedId : null;
}
