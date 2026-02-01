export type UploadSession = {
  // Stored as a data URL so it can be used across routes without keeping a File object.
  imageDataUrl: string
  fileName: string
  fileSize: number
  mimeType: string
  createdAt: number
}

/**
 * Client-side session state for the currently uploaded image.
 *
 * Nuxt `useState` persists across route navigation in the same session.
 */
export function useUploadSession() {
  return useState<UploadSession | null>('uploadSession', () => null)
}
