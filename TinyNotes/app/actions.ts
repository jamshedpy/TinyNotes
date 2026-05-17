"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { err, ok, type ActionResult } from "@/lib/result";
import { createSession, clearSession, requireSessionUser } from "@/lib/session";
import { createNote, deleteNote, disableShare, enableShare, getNoteByIdForUser, updateNote } from "@/lib/notes";
import { ensureContentJson } from "@/lib/content";
import { env } from "@/lib/env";
import { createAuthService } from "@/lib/auth-service";

const authSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
});
const authService = createAuthService(db);

export async function registerAction(_: unknown, formData: FormData): Promise<ActionResult<{ redirectTo: string }>> {
  try {
    const parsed = authSchema.extend({ name: z.string().trim().min(1).max(120) }).safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
    });
    if (!parsed.success) return err("VALIDATION_ERROR", "Invalid input.");

    const created = authService.register(parsed.data);
    if (!created.ok) return err("CONFLICT", "Unable to create account.");
    return ok({ redirectTo: "/login?registered=1" });
  } catch {
    return err("INTERNAL_ERROR", "Request failed.");
  }
}

export async function loginAction(_: unknown, formData: FormData): Promise<ActionResult<{ redirectTo: string }>> {
  try {
    const parsed = authSchema.pick({ email: true, password: true }).safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });
    if (!parsed.success) return err("VALIDATION_ERROR", "Invalid credentials.");

    const loggedIn = authService.login(parsed.data);
    if (!loggedIn.ok) {
      return err("UNAUTHORIZED", "Invalid credentials.");
    }

    await createSession(loggedIn.userId);
    return ok({ redirectTo: "/notes" });
  } catch {
    return err("INTERNAL_ERROR", "Request failed.");
  }
}

export async function logoutAction(): Promise<void> {
  await clearSession();
  redirect("/login");
}

export async function createNoteAction(_: unknown, formData: FormData): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireSessionUser();
    const title = String(formData.get("title") ?? "").slice(0, 200);
    const contentRaw = String(formData.get("contentJson") ?? '{"type":"doc","content":[]}');
    const contentJson = ensureContentJson(JSON.parse(contentRaw));
    const id = createNote(user.id, title, contentJson);
    return ok({ id });
  } catch {
    return err("INTERNAL_ERROR", "Unable to create note.");
  }
}

export async function updateNoteAction(input: { id: string; title?: string; contentJson?: unknown }): Promise<ActionResult<{ savedAt: string }>> {
  try {
    const user = await requireSessionUser();
    let contentJson: string | null = null;
    if (input.contentJson !== undefined) {
      contentJson = ensureContentJson(input.contentJson);
    }
    const updated = updateNote(input.id, user.id, input.title ?? null, contentJson);
    if (!updated) return err("NOT_FOUND", "Note not found.");
    const row = getNoteByIdForUser(input.id, user.id);
    if (!row) return err("NOT_FOUND", "Note not found.");
    return ok({ savedAt: row.updated_at });
  } catch {
    return err("INTERNAL_ERROR", "Unable to save note.");
  }
}

export async function deleteNoteAction(formData: FormData): Promise<void> {
  const user = await requireSessionUser();
  const id = String(formData.get("id") ?? "");
  deleteNote(id, user.id);
  redirect("/notes");
}

export async function enableShareAction(input: { id: string }): Promise<ActionResult<{ shareUrl: string; token: string; shareEnabled: true }>> {
  try {
    const user = await requireSessionUser();
    const result = enableShare(input.id, user.id);
    if (!result) return err("NOT_FOUND", "Note not found.");
    const shareUrl = `${env.appUrl}/s/${result.token}`;
    return ok({ shareUrl, token: result.token, shareEnabled: true });
  } catch {
    return err("INTERNAL_ERROR", "Unable to enable sharing.");
  }
}

export async function disableShareAction(input: { id: string }): Promise<ActionResult<{ shareEnabled: false }>> {
  try {
    const user = await requireSessionUser();
    const disabled = disableShare(input.id, user.id);
    if (!disabled) return err("NOT_FOUND", "Note not found.");
    return ok({ shareEnabled: false });
  } catch {
    return err("INTERNAL_ERROR", "Unable to disable sharing.");
  }
}
