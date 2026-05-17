"use client";

export default function SharedError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <section className="card stack">
      <h2>Unable to load shared note</h2>
      <p className="error">{error.message || "Please try again."}</p>
      <button type="button" onClick={reset}>Retry</button>
    </section>
  );
}
