export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  return (
    <form action="/auth/register" method="post" className="card stack">
      <h1>Register</h1>
      {params.error === "1" ? <p className="error">Unable to create account.</p> : null}
      <label>Name<input name="name" type="text" required /></label>
      <label>Email<input name="email" type="email" required /></label>
      <label>Password<input name="password" type="password" required minLength={8} /></label>
      <button type="submit">Create account</button>
      <p>Already registered? <a href="/login">Login</a></p>
    </form>
  );
}
