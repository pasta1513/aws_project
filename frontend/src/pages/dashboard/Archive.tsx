import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/Button';
import { ChevronRightIcon } from '../../components/icons';
import { Plate } from '../../components/Plate';
import { formatMonthDay, formatYearMonth, parseISODate, relativeLabel, weekday } from '../../lib/date';
import { MEAL_META, mealVars, type DayLog } from '../../lib/meal';
import styles from './Dashboard.module.css';

const PAGE_SIZE = 12;

/** 최근 기록 — 사진 중심 갤러리 */
export function RecentGallery({ days }: { days: DayLog[] }) {
  if (days.length === 0) return null;

  return (
    <section className={styles.section} aria-labelledby="recent-title">
      <header className={styles.sectionHead}>
        <h2 id="recent-title" className={styles.sectionTitle}>
          최근 기록
        </h2>
        <span className={styles.sectionNote}>지난 식탁을 다시 들여다봐요</span>
      </header>

      <ul className={`${styles.gallery} ${styles[`gallery${days.length}`]}`}>
        {days.map((day, i) => {
          const rep = day.representative;
          const rel = relativeLabel(day.date);
          return (
            <li key={day.date} className={styles[`shot${i}`]} style={mealVars(rep.type)}>
              <Link to={`/day/${day.date}`} className={styles.shot}>
                <span className={styles.shotPhoto}>
                  <Plate menu={rep.menu} type={rep.type} seedKey={rep.id} inset={i === 0 ? 0 : 60} />
                  <span className={styles.shotDate}>
                    {formatMonthDay(day.date)}
                    {rel && <em>{rel}</em>}
                  </span>
                </span>
                <span className={styles.shotBody}>
                  <span className={styles.shotMenu}>{rep.menu}</span>
                  <span className={styles.shotTags}>
                    {day.meals.map((m) => (
                      <span key={m.id} style={mealVars(m.type)}>
                        {MEAL_META[m.type].label}
                      </span>
                    ))}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** 모든 기록 — 날짜별 목록 (월 단위 묶음) */
export function Archive({ days }: { days: DayLog[] }) {
  const [visible, setVisible] = useState(PAGE_SIZE);

  const months = useMemo(() => {
    const groups: { label: string; days: DayLog[] }[] = [];
    for (const day of days.slice(0, visible)) {
      const label = formatYearMonth(day.date);
      const last = groups[groups.length - 1];
      if (last?.label === label) last.days.push(day);
      else groups.push({ label, days: [day] });
    }
    return groups;
  }, [days, visible]);

  return (
    <section className={styles.section} aria-labelledby="archive-title">
      <header className={styles.sectionHead}>
        <h2 id="archive-title" className={styles.sectionTitle}>
          모든 기록
          <span className={`${styles.count} round num`}>{days.length}</span>
        </h2>
        <span className={styles.sectionNote}>기록한 날을 날짜순으로 모았어요</span>
      </header>

      <div className={styles.timeline}>
        {months.map((month) => (
          <div key={month.label} className={styles.month}>
            <h3 className={styles.monthLabel}>{month.label}</h3>
            <ul className={styles.list}>
              {month.days.map((day) => {
                const rep = day.representative;
                const rel = relativeLabel(day.date);
                return (
                  <li key={day.date}>
                    <Link to={`/day/${day.date}`} className={styles.row} style={mealVars(rep.type)}>
                      <span className={styles.rowDate}>
                        <span className="round num">{parseISODate(day.date).getDate()}</span>
                        <small>{weekday(day.date, false)}</small>
                      </span>
                      <span className={styles.rowThumb}>
                        <Plate menu={rep.menu} type={rep.type} seedKey={rep.id} />
                      </span>
                      <span className={styles.rowBody}>
                        <span className={styles.rowMenu}>
                          {rep.menu}
                          {rel && <em className={styles.rowRel}>{rel}</em>}
                        </span>
                        <span className={styles.rowDots}>
                          {day.meals.map((m) => (
                            <span key={m.id} style={mealVars(m.type)}>
                              <i />
                              {MEAL_META[m.type].label}
                            </span>
                          ))}
                        </span>
                      </span>
                      <span className={styles.rowCount}>
                        <span className="round num">{day.meals.length}</span>끼
                      </span>
                      <ChevronRightIcon size={20} className={styles.rowArrow} />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {visible < days.length && (
        <div className={styles.more}>
          <Button variant="secondary" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
            더 보기
            <span className={styles.moreCount}>{Math.min(PAGE_SIZE, days.length - visible)}일 더</span>
          </Button>
        </div>
      )}
    </section>
  );
}
