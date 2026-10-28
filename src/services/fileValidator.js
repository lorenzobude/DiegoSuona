const MAX_FILE_SIZE = 50 * 1024 * 1024
const ALLOWED_MIME_TYPES = ['audio/mpeg', 'audio/mp3', 'audio/wav']
const ALLOWED_EXTENSIONS = ['.mp3', '.wav']

export function validateMp3File(file) {
  if (!file) {
    return {
      valid: false,
      message: 'Nessun file selezionato'
    }
  }

  const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
  const isSupportedType = ALLOWED_MIME_TYPES.includes(file.type) || ALLOWED_EXTENSIONS.includes(fileExtension)

  if (!isSupportedType) {
    return {
      valid: false,
      message: 'Il file deve essere in formato MP3 o WAV'
    }
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      message: `Il file supera il limite di ${MAX_FILE_SIZE / (1024 * 1024)} MB`
    }
  }

  if (file.size === 0) {
    return {
      valid: false,
      message: 'Il file è vuoto'
    }
  }

  return {
    valid: true,
    message: 'File valido'
  }
}

export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}
