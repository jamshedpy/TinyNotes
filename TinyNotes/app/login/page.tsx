export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string; error?: string }>;
}) {
  const params = await searchParams;
  return (
    <form action="/auth/login" method="post" className="card stack">
      <h1>Login</h1>
      {params.registered === "1" ? <p className="success">Registration successful. Please sign in.</p> : null}
      {params.error === "1" ? <p className="error">Invalid credentials.</p> : null}
      <label>Email<input name="email" type="email" required /></label>
      <label>Password<input name="password" type="password" required minLength={8} /></label>
      <button type="submit">Sign in</button>
      <p>Need an account? <a href="/register">Register</a></p>
    </form>
  );
}
