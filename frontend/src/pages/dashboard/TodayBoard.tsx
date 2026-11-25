import { Link } from 'react-router-dom';
import { ArrowUpRightIcon, PlusIcon } from '../../components/icons';
import { MealIcon } from '../../components/MealIcon';
import { Plate } from '../../components/Plate';
import { MEAL_META, MEAL_ORDER, mealVars, type DayLog } from '../../lib/meal';
import styles from './Dashboard.module.css';

interface TodayMealsProps {
  date: string;
  day?: DayLog;
}

/** 오늘의 식사 — 크기가 다른 컬러 타일(bento) */
export function TodayMeals({ date, day }: TodayMealsProps) {
  return (
    <section className={styles.section} aria-labelledby="today-title">
      <header className={styles.sectionHead}>
        <h2 id="today-title" className={styles.sectionTitle}>
          오늘의 식사
        </h2>
        <span className={styles.sectionNote}>끼니를 눌러 기록하거나 확인해요</span>
      </header>

      <ul className={styles.bento}>
        {MEAL_ORDER.map((type) => {
          const meal = day?.meals.find((m) => m.type === type);
          const meta = MEAL_META[type];
          return (
            <li key={type} className={`${styles.tile} ${styles[`tile_${type}`]}`} style={mealVars(type)}>
              <Link
                to={meal ? `/day/${date}` : `/new?date=${date}&type=${type}`}
                className={`${styles.tileLink} ${meal ? styles.tileDone : styles.tileEmpty}`}
              >
                <span className={styles.tileHead}>
                  <span className={styles.tileBadge}>
                    <MealIcon type={type} size={18} />
                    {meta.label}
                  </span>
                  <span className={`${styles.tileEn} round`}>{meta.en}</span>
                </span>

                {meal ? (
                  <>
                    <span className={styles.tilePhoto}>
                      <Plate menu={meal.menu} type={type} seedKey={meal.id} inset={100} />
                    </span>
                    <span className={styles.tileMenu}>{meal.menu}</span>
                    <ArrowUpRightIcon size={18} className={styles.tileArrow} />
                  </>
                ) : (
                  <span className={styles.tileAdd}>
                    <span className={styles.tilePlus}>
                      <PlusIcon size={20} />
                    </span>
                    <span className={styles.tileAddText}>{meta.label} 기록하기</span>
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
