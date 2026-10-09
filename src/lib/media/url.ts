/** Public URL of a file in the public "media" bucket. Safe in client and server code. */
export function mediaUrl(storagePath: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${base}/storage/v1/object/public/media/${storagePath}`;
}
