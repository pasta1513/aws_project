import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ApiError, errorMessage } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { Button } from '../components/Button';
import { Field, describedBy } from '../components/Field';
import { ArrowRightIcon } from '../components/icons';
import { AuthLayout } from '../components/layout/AuthLayout';
import { Notice } from '../components/Notice';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/';

  const [userid, setUserid] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!userid.trim()) {
      setError('아이디를 입력해 주세요.');
      return;
    }
    setPending(true);
    setError(null);
    try {
      await login(userid);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof ApiError && err.status === 404 ? '등록되지 않은 아이디예요.' : errorMessage(err));
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthLayout
      title="다시 만나서 반가워요!"
      description="아이디로 로그인하고 오늘의 식사를 기록해 보세요."
      footer={
        <>
          아직 계정이 없나요?
          <Link to="/signup">회원가입</Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate style={{ display: 'grid', gap: 18 }}>
        <Field label="아이디" htmlFor="userid" hint="현재는 비밀번호 확인 없이 아이디로 로그인돼요.">
          <input
            {...describedBy('userid', undefined, true)}
            className="input"
            value={userid}
            onChange={(e) => setUserid(e.target.value)}
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="아이디를 입력하세요"
            autoFocus
          />
        </Field>

        {error && <Notice tone="error">{error}</Notice>}

        <Button type="submit" size="lg" block loading={pending} style={{ marginTop: 4 }}>
          로그인
          <ArrowRightIcon size={15} />
        </Button>
      </form>
    </AuthLayout>
  );
}
