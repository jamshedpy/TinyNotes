"use client";

import dynamic from "next/dynamic";

type Props = {
  noteId: string;
  initialTitle: string;
  initialContent: unknown;
  initialShareEnabled: boolean;
};

const LazyNoteEditor = dynamic(() => import("@/components/note-editor"), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});

export default function NoteEditorShell(props: Props) {
  return <LazyNoteEditor {...props} />;
}
