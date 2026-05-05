import { apiClient } from '../../lib/api-client'
import type { ImageUploadResponse } from '../../types/api'

export const uploadsApi = {
  uploadImage(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    return apiClient.post<ImageUploadResponse>('/uploads/images', {
      body: formData,
      headers: {},
    })
  },
}
