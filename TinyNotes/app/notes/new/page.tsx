export default function NewNotePage() {
  return (
    <form action="/auth/notes/create" method="post" className="card stack">
      <h2>Create Note</h2>
      <label>Title<input name="title" maxLength={200} /></label>
      <input type="hidden" name="contentJson" value='{"type":"doc","content":[{"type":"paragraph"}]}' />
      <button type="submit">Create</button>
    </form>
  );
}
