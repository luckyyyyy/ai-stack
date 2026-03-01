/**
 * Upload routes (Hono sub-app).
 * Mounted at /upload in main.ts.
 *
 * POST /upload/avatar   — authenticated, multipart/form-data, field "file"
 */
import { Hono } from "hono";
import { Logger } from "@/logger";
import { storage } from "@/storage";
import { resolveSessionUserId } from "@/utils/session";
import { toUserOutput, userService } from "@/modules/user/user.service";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const logger = new Logger("UploadRoute");

export const uploadRouter = new Hono();

uploadRouter.post("/avatar", async (c) => {
  const cookieHeader = c.req.header("cookie");
  const userId = await resolveSessionUserId(cookieHeader);
  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  // --- Parse multipart ---
  let formData: FormData;
  try {
    formData = await c.req.formData();
  } catch {
    return c.json({ error: "Invalid multipart body" }, 400);
  }

  const fileField = formData.get("file");
  if (!(fileField instanceof File)) {
    return c.json({ error: 'Missing "file" field' }, 400);
  }

  // --- Validate ---
  if (!ALLOWED_MIME.has(fileField.type)) {
    return c.json(
      { error: "Only JPEG, PNG, WebP and GIF images are allowed" },
      400,
    );
  }
  if (fileField.size > MAX_FILE_SIZE) {
    return c.json({ error: "File too large (max 5 MB)" }, 400);
  }

  // --- Upload ---
  // Note: file uploads use multipart/form-data which tRPC (JSON-only protocol)
  // does not support natively, so this is intentionally a raw Hono route rather
  // than a tRPC procedure. All errors are returned as { error: string } JSON so
  // the frontend can display them consistently (the global onError handler in
  // main.ts covers any unhandled throws as a safety net).
  const ext = (fileField.name.split(".").pop() ?? "jpg").toLowerCase();
  const key = `${userId}/${Date.now()}.${ext}`;
  const buffer = Buffer.from(await fileField.arrayBuffer());

  let url: string;
  try {
    url = await storage.uploadFile(key, buffer, fileField.type);
  } catch (err) {
    logger.error(`Storage upload failed for user ${userId}: ${err}`);
    return c.json(
      {
        error: `Storage upload failed: ${err instanceof Error ? err.message : String(err)}`,
      },
      500,
    );
  }

  // --- Persist + clean up old file ---
  let updated: Awaited<
    ReturnType<typeof userService.updateAvatarUrl>
  >["updated"];
  let previousAvatarUrl: string | null;
  try {
    ({ updated, previousAvatarUrl } = await userService.updateAvatarUrl(
      userId,
      url,
    ));
  } catch (err) {
    // DB write failed — clean up the just-uploaded file so storage doesn't leak
    logger.error(`DB update failed for user ${userId}: ${err}`);
    storage.deleteFile(key).catch(() => {});
    return c.json(
      {
        error: `Failed to save avatar: ${err instanceof Error ? err.message : String(err)}`,
      },
      500,
    );
  }

  if (previousAvatarUrl) {
    const oldKey = storage.extractKey(previousAvatarUrl);
    if (oldKey) {
      storage.deleteFile(oldKey).catch((err) => {
        logger.warn(`Failed to delete old avatar key "${oldKey}": ${err}`);
      });
    }
  }

  logger.log(`Avatar uploaded for user ${userId} → ${url}`);
  return c.json({ url, user: toUserOutput(updated) });
});
