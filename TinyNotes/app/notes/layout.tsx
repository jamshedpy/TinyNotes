import { requireSessionUser } from "@/lib/session";

export default async function NotesLayout({ children }: { children: React.ReactNode }) {
  const user = await requireSessionUser();
  return (
    <section className="stack">
      <header className="row between">
        <h1>TinyNotes</h1>
        <div className="row">
          <a href="/">Home</a>
          <form action="/auth/logout" method="post">
            <button type="submit">Logout ({user.email})</button>
          </form>
        </div>
      </header>
      {children}
    </section>
  );
}
