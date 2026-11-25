import { useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ApiError, errorMessage } from '../../api/client';
import type { MealType } from '../../api/types';
import { useCurrentUser } from '../../auth/AuthContext';
import { Button } from '../../components/Button';
import { Field, describedBy } from '../../components/Field';
import { ArrowLeftIcon, CalendarIcon, CheckIcon } from '../../components/icons';
import { MealIcon } from '../../components/MealIcon';
import { Sticker } from '../../components/Sticker';
import { Plate } from '../../components/Plate';
import { Notice } from '../../components/Notice';
import { useCreateMeal, useDayLogs } from '../../hooks/useMeals';
import { addDays, diffDays, formatFull, formatMonthDay, isISODate, relativeLabel, todayISO } from '../../lib/date';
import { MEAL_META, MEAL_ORDER, mealVars, suggestMealType } from '../../lib/meal';
import { splitMenu } from '../../lib/plate';
import styles from './NewMeal.module.css';

const MENU_MAX = 255;

const RECENT_MAX = 6;

const isMealType = (v: string | null): v is MealType => !!v && (MEAL_ORDER as string[]).includes(v);

interface Errors {
  date?: string;
  type?: string;
  menu?: string;
}

export default function NewMealPage() {
  const user = useCurrentUser();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { days, data: meals, isPending: mealsLoading } = useDayLogs();
  const createMeal = useCreateMeal();
  const today = todayISO();

  const initialDate = params.get('date');
  const initialType = params.get('type');
  const [date, setDate] = useState(isISODate(initialDate) ? initialDate : todayISO());
  const [type, setType] = useState<MealType | null>(isMealType(initialType) ? initialType : null);
  /** 사용자가 직접 고른 적이 없으면 시간대에 맞는 끼니를 미리 골라 둔다 */
  const [touchedType, setTouchedType] = useState(isMealType(initialType));
  const [menu, setMenu] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);

  const validDate = isISODate(date);
  const futureDate = validDate && diffDays(date, today) > 0;
  const recorded = new Set((validDate ? days.find((d) => d.date === date)?.meals ?? [] : []).map((m) => m.type));
  const suggested = !touchedType && !mealsLoading && date === today ? suggestMealType(recorded) : null;
  const picked = touchedType ? type : suggested;
  const selected = picked && !recorded.has(picked) ? picked : null;
  const allRecorded = validDate && recorded.size === MEAL_ORDER.length;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const next: Errors = {};
    const trimmed = menu.trim();
    if (!validDate) next.date = '날짜를 선택해 주세요.';
    else if (futureDate) next.date = '오늘 이후 날짜는 기록할 수 없어요.';
    if (!selected) next.type = '식사 구분을 선택해 주세요.';
    if (!trimmed) next.menu = '메뉴를 입력해 주세요.';
    else if (trimmed.length > MENU_MAX) next.menu = `${MENU_MAX}자까지 입력할 수 있어요.`;
    setErrors(next);
    setFormError(null);
    if (Object.keys(next).length || !selected) return;

    try {
      const saved = await createMeal.mutateAsync({ user_id: user.id, type: selected, menu: trimmed, date });
      navigate(`/day/${date}`, { state: { savedId: saved.id } });
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setFormError(`${formatMonthDay(date)} ${MEAL_META[selected].label} 기록이 이미 있어요.`);
      } else if (err instanceof ApiError && Object.keys(err.fieldErrors).length) {
        setErrors(err.fieldErrors as Errors);
        setFormError(err.message);
      } else {
        setFormError(errorMessage(err));
      }
    }
  }

  // 최근에 남긴 메뉴 — 같은 끼니를 우선으로, 한 번 눌러 채울 수 있게
  const recentMenus = useMemo(() => {
    const list = [...(meals ?? [])].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.id - a.id));
    const ordered = selected ? [...list.filter((m) => m.type === selected), ...list.filter((m) => m.type !== selected)] : list;
    return [...new Set(ordered.map((m) => m.menu.trim()))].slice(0, RECENT_MAX);
  }, [meals, selected]);

  const quickDates = [
    { label: '오늘', value: today },
    { label: '어제', value: addDays(today, -1) },
    { label: '그제', value: addDays(today, -2) },
  ];

  function changeDate(value: string) {
    setDate(value);
    setErrors((p) => ({ ...p, date: undefined }));
  }

  function cancel() {
    // 바로 이 화면으로 들어온 경우(히스토리 없음)에는 홈으로
    if ((window.history.state as { idx?: number } | null)?.idx) navigate(-1);
    else navigate('/');
  }

  const preview = menu.trim();
  const previewItems = splitMenu(preview);
  const rel = validDate ? relativeLabel(date) : null;
  const tone = selected ?? 'lunch';

  return (
    <div className={`container ${styles.page} fade-in`}>
      <Link to="/" className={styles.back}>
        <ArrowLeftIcon size={18} />
        홈으로
      </Link>

      <div className={styles.layout}>
        <aside className={`${styles.preview} ${selected ? styles.previewOn : ''}`} style={mealVars(tone)}>
          <div className={styles.previewHead}>
            <h1 className={styles.title}>무엇을 드셨나요?</h1>
            <p className={styles.subtitle}>한 끼를 가볍게 남겨 두세요.</p>
          </div>
          <div className={styles.previewPhoto}>
            <Plate menu={preview || null} type={tone} seedKey="preview" />
          </div>
          <div className={styles.previewMeta}>
            <span className={styles.previewChip}>
              <CalendarIcon size={15} />
              {validDate ? formatMonthDay(date) : '날짜 선택'}
            </span>
            {selected && (
              <span className={styles.previewChip}>
                <MealIcon type={selected} size={16} />
                {MEAL_META[selected].label}
              </span>
            )}
          </div>
          {previewItems.length > 1 && (
            <ul className={styles.previewItems} aria-label="입력한 메뉴">
              {previewItems.map((item, i) => (
                <li key={`${item}-${i}`}>{item}</li>
              ))}
            </ul>
          )}
          <Sticker name="strawberry" size={60} rotate={-14} float className={styles.sticker1} />
          <Sticker name="leaf" size={52} rotate={20} className={styles.sticker2} />
        </aside>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <Field label="언제 드셨나요?" htmlFor="date" error={errors.date} hint={validDate ? `${formatFull(date)}${rel ? ` · ${rel}` : ''}` : undefined}>
            <input
              {...describedBy('date', errors.date, validDate)}
              className={`input ${styles.dateInput}`}
              type="date"
              value={date}
              max={today}
              onChange={(e) => changeDate(e.target.value)}
              required
            />
            <div className={styles.quick} role="group" aria-label="빠른 날짜 선택">
              {quickDates.map((q) => (
                <button
                  key={q.label}
                  type="button"
                  className={`${styles.quickBtn} ${date === q.value ? styles.quickOn : ''}`}
                  aria-pressed={date === q.value}
                  onClick={() => changeDate(q.value)}
                >
                  {q.label}
                </button>
              ))}
            </div>
          </Field>

          <fieldset className={styles.fieldset} aria-describedby={errors.type ? 'type-error' : undefined}>
            <legend className={styles.legend}>
              어떤 식사인가요?
              {mealsLoading && <span className={styles.legendNote}>기록 확인 중…</span>}
            </legend>
            <div className={styles.types}>
              {MEAL_ORDER.map((t) => {
                const done = recorded.has(t);
                return (
                  <label
                    key={t}
                    className={`${styles.type} ${selected === t ? styles.typeOn : ''} ${done ? styles.typeDone : ''}`}
                    style={mealVars(t)}
                  >
                    <input
                      type="radio"
                      name="type"
                      value={t}
                      className="visually-hidden"
                      checked={selected === t}
                      disabled={done}
                      onChange={() => {
                        setType(t);
                        setTouchedType(true);
                        setErrors((p) => ({ ...p, type: undefined }));
                      }}
                    />
                    <span className={styles.typeIcon}>{done ? <CheckIcon size={20} /> : <MealIcon type={t} size={22} />}</span>
                    <span className={styles.typeLabel}>{MEAL_META[t].label}</span>
                    <span className={styles.typeSub}>{done ? '기록됨' : MEAL_META[t].en}</span>
                    {suggested === t && selected === t && <span className={styles.typeHint}>지금</span>}
                  </label>
                );
              })}
            </div>
            {errors.type && (
              <p id="type-error" className={styles.error} role="alert">
                {errors.type}
              </p>
            )}
            {allRecorded && <Notice tone="info">이 날은 다섯 끼가 모두 기록되어 있어요. 다른 날짜를 선택해 주세요.</Notice>}
          </fieldset>

          <Field label="메뉴" htmlFor="menu" error={errors.menu} aside={`${menu.trim().length}/${MENU_MAX}`} hint="여러 메뉴는 쉼표로 구분해 적어 주세요.">
            <textarea
              {...describedBy('menu', errors.menu, true)}
              className={`input ${styles.textarea}`}
              value={menu}
              rows={3}
              maxLength={MENU_MAX}
              placeholder={MEAL_META[tone].placeholder}
              onChange={(e) => {
                setMenu(e.target.value.replace(/\n/g, ' '));
                setErrors((p) => ({ ...p, menu: undefined }));
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  e.currentTarget.form?.requestSubmit();
                }
              }}
            />
          </Field>

          {recentMenus.length > 0 && (
            <div className={styles.recent}>
              <span className={styles.recentLabel}>최근 메뉴</span>
              <div className={styles.recentList}>
                {recentMenus.map((m) => (
                  <button
                    key={m}
                    type="button"
                    className={`${styles.recentBtn} ${preview === m ? styles.recentOn : ''}`}
                    onClick={() => {
                      setMenu(m);
                      setErrors((p) => ({ ...p, menu: undefined }));
                    }}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          )}

          {formError && <Notice tone="error">{formError}</Notice>}

          <div className={styles.actions}>
            <Button variant="secondary" size="lg" onClick={cancel}>
              취소
            </Button>
            <Button type="submit" size="lg" loading={createMeal.isPending} disabled={allRecorded}>
              <CheckIcon size={18} />
              기록 저장
            </Button>
          </div>
          <p className={styles.note}>저장한 기록은 현재 수정·삭제할 수 없어요.</p>
        </form>
      </div>
    </div>
  );
}
