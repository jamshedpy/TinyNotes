"use client";

import { useEffect, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";

type Props = {
  noteId: string;
  initialTitle: string;
  initialContent: unknown;
  initialShareEnabled: boolean;
};

export default function NoteEditor({ noteId, initialTitle, initialContent, initialShareEnabled }: Props) {
  const [title, setTitle] = useState(initialTitle);
  const [status, setStatus] = useState("saved");
  const [shareEnabled, setShareEnabled] = useState(initialShareEnabled);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareError, setShareError] = useState<string | null>(null);
  const lastSerialized = useRef(JSON.stringify(initialContent));
  const [contentVersion, setContentVersion] = useState(0);
  const normalizedInitialContent =
    typeof initialContent === "object" &&
    initialContent !== null &&
    "type" in (initialContent as Record<string, unknown>)
      ? (() => {
          const doc = initialContent as { type?: string; content?: unknown[] };
          if (doc.type === "doc" && (!Array.isArray(doc.content) || doc.content.length === 0)) {
            return { type: "doc", content: [{ type: "paragraph" }] };
          }
          return initialContent;
        })()
      : { type: "doc", content: [{ type: "paragraph" }] };

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    editable: true,
    extensions: [
      StarterKit,
      Link.configure({
        protocols: ["http", "https"],
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
    ],
    content: normalizedInitialContent,
    onUpdate: () => setContentVersion((v) => v + 1),
  });

  useEffect(() => {
    if (!editor) return;
    if (!editor.isEditable) {
      editor.setEditable(true);
    }
  }, [editor]);

  useEffect(() => {
    if (!editor) return;
    const autosavePayload = JSON.stringify(editor.getJSON());
    if (autosavePayload === lastSerialized.current && title === initialTitle) return;
    setStatus("saving");

    const timer = setTimeout(async () => {
      const parsed = JSON.parse(autosavePayload);
      const response = await fetch(`/auth/notes/${noteId}/update`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title, contentJson: parsed }),
      });
      if (response.ok) {
        lastSerialized.current = autosavePayload;
        setStatus("saved");
      } else {
        setStatus("error");
      }
    }, 900);

    return () => clearTimeout(timer);
  }, [contentVersion, editor, noteId, title, initialTitle]);

  async function onEnableShare() {
    setShareError(null);
    const response = await fetch(`/auth/notes/${noteId}/share/enable`, { method: "POST" });
    if (response.ok) {
      const result = await response.json() as { data: { shareUrl: string } };
      setShareEnabled(true);
      setShareUrl(result.data.shareUrl);
      return;
    }
    setShareError("Unable to enable sharing.");
  }

  async function onDisableShare() {
    setShareError(null);
    const response = await fetch(`/auth/notes/${noteId}/share/disable`, { method: "POST" });
    if (response.ok) {
      setShareEnabled(false);
      setShareUrl(null);
      return;
    }
    setShareError("Unable to disable sharing.");
  }

  return (
    <section className="stack">
      <label>Title<input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} /></label>
      <div
        className="editor-wrap"
        onMouseDown={(e) => {
          if (!editor) return;
          if (e.target === e.currentTarget) {
            e.preventDefault();
            editor.commands.focus("end");
          }
        }}
      >
        {editor ? <EditorContent editor={editor} /> : <p>Loading editor...</p>}
      </div>
      <p className="muted">Status: {status}</p>
      <div className="row">
        {!shareEnabled ? <button type="button" onClick={onEnableShare}>Enable share</button> : <button type="button" onClick={onDisableShare}>Disable share</button>}
      </div>
      {shareUrl ? <p className="share">Share URL: <a href={shareUrl}>{shareUrl}</a></p> : null}
      {shareError ? <p className="error">{shareError}</p> : null}
    </section>
  );
}
