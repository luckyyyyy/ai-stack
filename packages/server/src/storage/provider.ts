/**
 * Storage provider abstraction.
 * Implement this interface to support different storage backends
 * (AWS S3, MinIO, Alibaba Cloud OSS, etc.).
 */
export interface StorageProvider {
  /**
   * Upload a file and return its public-accessible URL.
   * @param key     Object key / path within the bucket
   * @param body    Raw file content
   * @param contentType  MIME type (e.g. "image/jpeg")
   */
  uploadFile(key: string, body: Buffer, contentType: string): Promise<string>;

  /**
   * Delete a file by its object key.
   * Silently succeeds even if the key does not exist.
   */
  deleteFile(key: string): Promise<void>;

  /**
   * Derive the public URL for an already-uploaded key.
   */
  getPublicUrl(key: string): string;

  /**
   * Extract the storage key from a public URL previously returned by this provider.
   * Returns null if the URL does not belong to this provider.
   */
  extractKey(url: string): string | null;
}
