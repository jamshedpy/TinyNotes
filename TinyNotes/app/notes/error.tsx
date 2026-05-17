"use client";

export default function NotesError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <section className="card stack">
      <h2>Something went wrong</h2>
      <p className="error">{error.message || "Please try again."}</p>
      <button type="button" onClick={reset}>Retry</button>
    </section>
  );
}
