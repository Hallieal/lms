import { signIn, signUp } from '@/app/auth/actions';

export function LoginForm({ error, message }: { error?: string; message?: string }) {
  return (
    <form className="login-card">
      <p className="eyebrow">Fall 2026</p>
      <h2>Sign in to NES Learning</h2>
      <p>Use your account credentials to access courses, submissions and grades.</p>
      {error ? <div className="auth-error">{error}</div> : null}
      {message ? <div className="auth-message">{message}</div> : null}
      <label className="field-label">
        <span>Email</span>
        <input name="email" type="email" autoComplete="email" required placeholder="name@nes.ru" />
      </label>
      <label className="field-label">
        <span>Password</span>
        <input name="password" type="password" autoComplete="current-password" minLength={8} required />
      </label>
      <div className="auth-actions">
        <button className="primary-button full-width" formAction={signIn} type="submit">Sign in</button>
        <button className="button-secondary full-width" formAction={signUp} type="submit">Create test account</button>
      </div>
      <small className="auth-note">Self-registration is currently available only for bootstrap testing. A new account has no course access until an instructor or administrator assigns a membership.</small>
    </form>
  );
}
