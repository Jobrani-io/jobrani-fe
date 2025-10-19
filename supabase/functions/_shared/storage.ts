export async function uploadFile(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  file: File,
  bucket: string
) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(file.name, file, {
      cacheControl: "3600",
    });

  if (error) throw error;
  const publicUrlResponse = supabase.storage
    .from(bucket)
    .getPublicUrl(file.name);
  return publicUrlResponse.data.publicUrl;
}
