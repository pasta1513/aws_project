import { Link } from 'react-router-dom';
import { Sticker } from '../../components/Sticker';
import { addDays, diffDays, formatDot, parseISODate, startOfWeek, weekday } from '../../lib/date';
import { MEAL_META, MEAL_ORDER, countInRange, currentStreak, type DayLog } from '../../lib/meal';
import styles from './Dashboard.module.css';

interface WeekHabitsProps {
  days: DayLog[];
  totalMeals: number;
  today: string;
}

/** 이번 주 습관 트래커 + 누적 숫자 */
export function WeekHabits({ days, totalMeals, today }: WeekHabitsProps) {
  const monday = startOfWeek(today);
  const week = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  const byDate = new Map(days.map((d) => [d.date, d]));

  const stats = [
    { key: 'week', label: '이번 주', value: countInRange(days, monday, addDays(monday, 6)), unit: '끼' },
    { key: 'streak', label: '연속 기록', value: currentStreak(days, today), unit: '일' },
    { key: 'days', label: '기록한 날', value: days.length, unit: '일' },
    { key: 'meals', label: '전체 식사', value: totalMeals, unit: '끼' },
  ];

  return (
    <section className={styles.habits} aria-labelledby="week-title">
      <div className={styles.weekBox}>
        <header className={styles.weekHead}>
          <h2 id="week-title" className={styles.sectionTitle}>
            이번 주 기록
          </h2>
          <span className="chip num">
            {formatDot(monday)} – {formatDot(addDays(monday, 6))}
          </span>
        </header>

        <ol className={styles.week}>
          {week.map((date) => {
            const log = byDate.get(date);
            const recorded = new Set(log?.meals.map((m) => m.type));
            const future = diffDays(date, today) > 0;
            const cls = `${styles.day} ${date === today ? styles.dayToday : ''} ${log ? styles.dayDone : ''} ${future ? styles.dayFuture : ''}`;
            const content = (
              <>
                <span className={styles.wd}>{weekday(date, false)}</span>
                <span className={`${styles.dn} round num`}>{parseISODate(date).getDate()}</span>
                <span className={styles.dots} aria-hidden="true">
                  {MEAL_ORDER.map((t) => (
                    <i key={t} style={recorded.has(t) ? { background: `var(--${t})` } : undefined} />
                  ))}
                </span>
              </>
            );
            return (
              <li key={date}>
                {future ? (
                  <span className={cls}>{content}</span>
                ) : (
                  <Link
                    to={log ? `/day/${date}` : `/new?date=${date}`}
                    className={cls}
                    aria-label={`${weekday(date)} ${log ? `${[...recorded].map((t) => MEAL_META[t].label).join(', ')} 기록` : '기록 없음'}`}
                  >
                    {content}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
        <Sticker name="lemon" size={50} rotate={14} className={styles.weekSticker} />
      </div>

      <dl className={styles.stats} aria-label="기록 통계">
        {stats.map((s) => (
          <div key={s.key} className={`${styles.stat} ${styles[`stat_${s.key}`]}`}>
            <dt>{s.label}</dt>
            <dd>
              <span className="round num">{s.value}</span>
              {s.unit}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
