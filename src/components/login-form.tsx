import { signIn } from '@/app/auth/actions';

export function LoginForm({ error }: { error?: string }) {
  return (
    <form className="login-card" action={signIn}>
      <p className="eyebrow">Fall 2026</p>
      <h2>Sign in to NES Learning</h2>
      <p>Use your account credentials to access courses, submissions and grades.</p>
      {error ? <div className="auth-error">{error}</div> : null}
      <label className="field-label">
        <span>Email</span>
        <input name="email" type="email" autoComplete="email" required placeholder="name@nes.ru" />
      </label>
      <label className="field-label">
        <span>Password</span>
        <input name="password" type="password" autoComplete="current-password" required />
      </label>
      <button className="primary-button full-width" type="submit">Sign in</button>
      <small className="auth-note">Accounts will ultimately be provisioned through the institution rather than public self-registration.</small>
    </form>
  );
}
