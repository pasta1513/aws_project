import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiError, errorMessage } from '../api/client';
import { signup } from '../api/users';
import type { UserCreate } from '../api/types';
import { useAuth } from '../auth/AuthContext';
import { Button } from '../components/Button';
import { Field, describedBy } from '../components/Field';
import { ArrowRightIcon } from '../components/icons';
import { AuthLayout } from '../components/layout/AuthLayout';
import { Notice } from '../components/Notice';
import { validateAccount, type AccountErrors } from './account/validation';

type Form = UserCreate & { passwordConfirm: string };

const INITIAL: Form = { userid: '', password: '', passwordConfirm: '', email: '', name: '' };

export default function SignupPage() {
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<Form>(INITIAL);
  const [errors, setErrors] = useState<AccountErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const update = (key: keyof Form) => (e: ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const found = validateAccount(form, { requireUserid: true });
    setErrors(found);
    setFormError(null);
    if (Object.values(found).some(Boolean)) return;

    setPending(true);
    try {
      const user = await signup({
        userid: form.userid.trim(),
        password: form.password,
        email: form.email.trim(),
        name: form.name.trim(),
      });
      setUser(user);
      navigate('/', { replace: true });
    } catch (err) {
      if (err instanceof ApiError && Object.keys(err.fieldErrors).length) setErrors(err.fieldErrors);
      setFormError(errorMessage(err));
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthLayout
      title="가볍게 시작해 볼까요?"
      description="몇 가지 정보만 입력하면 바로 시작할 수 있어요."
      footer={
        <>
          이미 계정이 있나요?
          <Link to="/login">로그인</Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate style={{ display: 'grid', gap: 18 }}>
        <Field label="이름" htmlFor="name" error={errors.name}>
          <input {...describedBy('name', errors.name)} className="input" value={form.name} onChange={update('name')} autoComplete="name" maxLength={50} placeholder="김소반" />
        </Field>

        <Field label="아이디" htmlFor="userid" error={errors.userid} hint="영문·숫자 2~20자">
          <input
            {...describedBy('userid', errors.userid, true)}
            className="input"
            value={form.userid}
            onChange={update('userid')}
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            maxLength={20}
            placeholder="soban"
          />
        </Field>

        <Field label="이메일" htmlFor="email" error={errors.email}>
          <input {...describedBy('email', errors.email)} className="input" type="email" value={form.email} onChange={update('email')} autoComplete="email" placeholder="hello@soban.kr" />
        </Field>

        <Field label="비밀번호" htmlFor="password" error={errors.password} hint="4~24자">
          <input {...describedBy('password', errors.password, true)} className="input" type="password" value={form.password} onChange={update('password')} autoComplete="new-password" maxLength={24} />
        </Field>

        <Field label="비밀번호 확인" htmlFor="passwordConfirm" error={errors.passwordConfirm}>
          <input {...describedBy('passwordConfirm', errors.passwordConfirm)} className="input" type="password" value={form.passwordConfirm} onChange={update('passwordConfirm')} autoComplete="new-password" maxLength={24} />
        </Field>

        {formError && <Notice tone="error">{formError}</Notice>}

        <Button type="submit" size="lg" block loading={pending} style={{ marginTop: 4 }}>
          가입하고 시작하기
          <ArrowRightIcon size={15} />
        </Button>
      </form>
    </AuthLayout>
  );
}
