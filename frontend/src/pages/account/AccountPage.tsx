import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiError, errorMessage } from '../../api/client';
import { deleteUser, updateUser } from '../../api/users';
import { useAuth, useCurrentUser } from '../../auth/AuthContext';
import { Avatar } from '../../components/Avatar';
import { Button } from '../../components/Button';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { Field, describedBy } from '../../components/Field';
import { Notice } from '../../components/Notice';
import { AlertIcon, CheckIcon, LogoutIcon } from '../../components/icons';
import { Sticker } from '../../components/Sticker';
import { useDayLogs } from '../../hooks/useMeals';
import { validateAccount, type AccountErrors, type AccountForm } from './validation';
import styles from './Account.module.css';

export default function AccountPage() {
  const user = useCurrentUser();
  const { setUser, logout } = useAuth();
  const navigate = useNavigate();
  const { days, data: meals } = useDayLogs();

  const [form, setForm] = useState<AccountForm>({ name: user.name, email: user.email, password: '', passwordConfirm: '' });
  const [errors, setErrors] = useState<AccountErrors>({});
  const [result, setResult] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const update = (key: keyof AccountForm) => (e: ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    if (errors[key]) setErrors((p) => ({ ...p, [key]: undefined }));
    if (result?.tone === 'success') setResult(null);
  };

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    const found = validateAccount(form, { requireUserid: false });
    setErrors(found);
    setResult(null);
    if (Object.values(found).some(Boolean)) return;

    setSaving(true);
    try {
      const updated = await updateUser(user.userid, {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      setUser(updated);
      setForm({ name: updated.name, email: updated.email, password: '', passwordConfirm: '' });
      setResult({ tone: 'success', text: '회원 정보가 저장되었어요.' });
    } catch (err) {
      if (err instanceof ApiError && Object.keys(err.fieldErrors).length) setErrors(err.fieldErrors);
      setResult({ tone: 'error', text: errorMessage(err) });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteUser(user.userid);
      logout();
      navigate('/login', { replace: true });
    } catch (err) {
      setDeleteError(errorMessage(err));
      setDeleting(false);
    }
  }

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className={`container ${styles.page} fade-in`}>
      <header className={styles.profile}>
        <div className={styles.avatarWrap}>
          <Avatar name={user.name} size={104} />
          <Sticker name="leaf" size={44} rotate={24} className={styles.avatarSticker} />
        </div>
        <div className={styles.profileText}>
          <span className={styles.hello}>반가워요!</span>
          <h1 className={styles.name}>{user.name}</h1>
          <p className={styles.handle}>
            <span className="chip">@{user.userid}</span>
            <span className="chip">{user.email}</span>
          </p>
        </div>
        <dl className={styles.mini}>
          <div className={styles.miniDays}>
            <dt>기록한 날</dt>
            <dd>
              <span className="round num">{meals ? days.length : '–'}</span>일
            </dd>
          </div>
          <div className={styles.miniMeals}>
            <dt>전체 식사</dt>
            <dd>
              <span className="round num">{meals ? meals.length : '–'}</span>끼
            </dd>
          </div>
        </dl>
        <Sticker name="sparkle" size={46} rotate={-8} className={styles.profileSticker} />
      </header>

      <div className={styles.grid}>
        <section className={styles.edit} aria-labelledby="edit-title">
          <header className={styles.sectionHead}>
            <h2 id="edit-title" className={styles.sectionTitle}>
              회원 정보 수정
            </h2>
            <p className={styles.sectionDesc}>저장하려면 비밀번호를 함께 입력해 주세요. 입력한 비밀번호로 변경됩니다.</p>
          </header>

          <form onSubmit={handleSave} noValidate className={styles.form}>
            <Field label="아이디" htmlFor="userid" hint="아이디는 변경할 수 없어요.">
              <input id="userid" className="input" value={user.userid} disabled readOnly />
            </Field>
            <div className={styles.row}>
              <Field label="이름" htmlFor="name" error={errors.name}>
                <input {...describedBy('name', errors.name)} className="input" value={form.name} onChange={update('name')} maxLength={50} autoComplete="name" />
              </Field>
              <Field label="이메일" htmlFor="email" error={errors.email}>
                <input {...describedBy('email', errors.email)} className="input" type="email" value={form.email} onChange={update('email')} autoComplete="email" />
              </Field>
            </div>
            <div className={styles.row}>
              <Field label="비밀번호" htmlFor="password" error={errors.password} hint="4~24자">
                <input {...describedBy('password', errors.password, true)} className="input" type="password" value={form.password} onChange={update('password')} maxLength={24} autoComplete="new-password" />
              </Field>
              <Field label="비밀번호 확인" htmlFor="passwordConfirm" error={errors.passwordConfirm}>
                <input {...describedBy('passwordConfirm', errors.passwordConfirm)} className="input" type="password" value={form.passwordConfirm} onChange={update('passwordConfirm')} maxLength={24} autoComplete="new-password" />
              </Field>
            </div>

            {result && <Notice tone={result.tone}>{result.text}</Notice>}

            <div className={styles.formActions}>
              <Button type="submit" size="lg" loading={saving}>
                <CheckIcon size={18} />
                저장하기
              </Button>
            </div>
          </form>
        </section>

        <aside className={styles.side} aria-label="계정">
          <h2 className={styles.sectionTitle}>계정 관리</h2>
          <div className={styles.action}>
            <span className={styles.actionIcon}>
              <LogoutIcon size={22} />
            </span>
            <div>
              <p className={styles.actionTitle}>로그아웃</p>
              <p className={styles.actionDesc}>이 기기에서 로그아웃합니다.</p>
            </div>
            <Button variant="secondary" size="sm" onClick={handleLogout}>
              로그아웃
            </Button>
          </div>
          <div className={`${styles.action} ${styles.actionDanger}`}>
            <span className={styles.actionIcon}>
              <AlertIcon size={22} />
            </span>
            <div>
              <p className={styles.actionTitle}>회원 탈퇴</p>
              <p className={styles.actionDesc}>계정과 모든 식단 기록이 삭제되며 되돌릴 수 없어요.</p>
            </div>
            <Button variant="ghost" size="sm" className={styles.dangerBtn} onClick={() => setConfirmOpen(true)}>
              탈퇴하기
            </Button>
          </div>
        </aside>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="정말 탈퇴하시겠어요?"
        confirmLabel="탈퇴하기"
        tone="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => {
          setConfirmOpen(false);
          setDeleteError(null);
        }}
      >
        <p>
          {meals && meals.length > 0
            ? `${days.length}일 동안 남긴 ${meals.length}개의 식단 기록이 모두 삭제돼요.`
            : '계정 정보가 삭제돼요.'}
        </p>
        {deleteError && (
          <div style={{ marginTop: 12 }}>
            <Notice tone="error">{deleteError}</Notice>
          </div>
        )}
      </ConfirmDialog>
    </div>
  );
}
