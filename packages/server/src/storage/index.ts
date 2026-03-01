/**
 * Storage singleton — created once from environment variables.
 *
 * To swap providers, change STORAGE_PROVIDER and the corresponding
 * STORAGE_* variables; no application code needs to change.
 */
import { Logger } from "../logger";
import type { StorageProvider } from "./provider";
import { S3StorageProvider } from "./s3.provider";

export type { StorageProvider };

function createStorageProvider(): StorageProvider {
  const logger = new Logger("Storage");
  const provider = process.env.STORAGE_PROVIDER ?? "s3";

  if (provider === "s3") {
    const endpoint = process.env.STORAGE_ENDPOINT;
    const region = process.env.STORAGE_REGION ?? "us-east-1";
    const bucket = process.env.STORAGE_BUCKET ?? "avatars";
    const accessKeyId = process.env.STORAGE_ACCESS_KEY_ID ?? "minioadmin";
    const secretAccessKey =
      process.env.STORAGE_SECRET_ACCESS_KEY ?? "minioadmin";
    const publicUrl = process.env.STORAGE_PUBLIC_URL ?? "http://localhost:9000";
    const pathStyle = (process.env.STORAGE_PATH_STYLE ?? "true") === "true";

    logger.log(
      `Using S3-compatible storage — endpoint=${endpoint ?? "AWS default"}, bucket=${bucket}, pathStyle=${pathStyle}`,
    );

    return new S3StorageProvider({
      endpoint,
      region,
      bucket,
      accessKeyId,
      secretAccessKey,
      publicUrl,
      pathStyle,
    });
  }

  throw new Error(`Unknown STORAGE_PROVIDER: "${provider}"`);
}

/**
 * Lazy singleton — the provider is created on first access, not at module load.
 * This prevents startup failures when STORAGE_* env vars are not configured
 * (e.g. during unit tests or when file upload is not used).
 */
let _provider: StorageProvider | undefined;

const getProvider = (): StorageProvider => {
  if (!_provider) _provider = createStorageProvider();
  return _provider;
};

export const storage: StorageProvider = {
  uploadFile: (key, body, contentType) =>
    getProvider().uploadFile(key, body, contentType),
  deleteFile: (key) => getProvider().deleteFile(key),
  getPublicUrl: (key) => getProvider().getPublicUrl(key),
  extractKey: (url) => getProvider().extractKey(url),
};
