import { supabase } from './supabase'

export async function uploadFile(
  file: File,
  bucket: string,
  path: string
): Promise<{ data: { path: string } | null; error: Error | null }> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file)

  return { data, error }
}

export async function deleteFile(
  bucket: string,
  path: string
): Promise<{ error: Error | null }> {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path])

  return { error }
}

export function getPublicUrl(bucket: string, path: string): string {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)

  return data.publicUrl
}

export async function uploadCarMedia(
  carId: string,
  file: File,
  checklistItemId?: string,
  maintenanceRecordId?: string
) {
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}.${fileExt}`
  const filePath = `cars/${carId}/media/${fileName}`

  const { data: uploadData, error: uploadError } = await uploadFile(
    file,
    'car-media',
    filePath
  )

  if (uploadError) {
    return { data: null, error: uploadError }
  }

  const { data: mediaData, error: mediaError } = await supabase
    .from('media')
    .insert({
      car_id: carId,
      checklist_item_id: checklistItemId || null,
      maintenance_record_id: maintenanceRecordId || null,
      file_path: uploadData?.path || filePath,
      file_type: file.type,
      file_size: file.size,
      created_by: (await supabase.auth.getUser()).data.user?.id
    })
    .select()
    .single()

  return { data: mediaData, error: mediaError }
}