import sanitizeHtml from "sanitize-html";
import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";

const extensions = [
  StarterKit,
  Link.configure({
    openOnClick: true,
    HTMLAttributes: {
      rel: "noopener noreferrer",
      target: "_blank",
    },
    protocols: ["http", "https"],
  }),
];

export function renderSanitizedHtml(contentJson: string): string {
  const parsed = JSON.parse(contentJson);
  const html = generateHTML(parsed, extensions);
  return sanitizeHtml(html, {
    allowedTags: ["p", "br", "strong", "em", "u", "s", "a", "h1", "h2", "h3", "ul", "ol", "li", "blockquote", "pre", "code"],
    allowedAttributes: { a: ["href", "target", "rel"] },
    allowedSchemes: ["http", "https"],
    disallowedTagsMode: "discard",
  });
}

export function ensureContentJson(content: unknown): string {
  const serialized = JSON.stringify(content);
  if (serialized.length > 256 * 1024) {
    throw new Error("VALIDATION_ERROR");
  }
  return serialized;
}
