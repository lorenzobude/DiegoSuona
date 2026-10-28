import formidable from 'formidable'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export function uploadHandler(req, res, next) {
  console.log('[Middleware] uploadHandler called')

  const form = formidable({
    uploadDir: path.join(__dirname, '../uploads'),
    keepExtensions: true,
    maxFileSize: 50 * 1024 * 1024
  })

  form.parse(req, (err, fields, files) => {
    console.log('[Middleware] Form parsed')
    console.log('[Middleware] Files object:', files)

    if (err) {
      console.error('[Middleware] Parse error:', err.message)
      return res.status(400).json({
        success: false,
        error: err.message,
        code: 'UPLOAD_ERROR'
      })
    }

    let file = null
    if (files.file) {
      file = Array.isArray(files.file) ? files.file[0] : files.file
    }

    console.log('[Middleware] File found:', file ? file.originalFilename : 'null')

    if (!file) {
      console.warn('[Middleware] No file found in request')
      return res.status(400).json({
        success: false,
        error: 'No file provided',
        code: 'NO_FILE'
      })
    }

    if (!file.mimetype || !file.mimetype.includes('audio')) {
      console.warn('[Middleware] Invalid MIME type:', file.mimetype)
      return res.status(400).json({
        success: false,
        error: 'File must be audio format',
        code: 'INVALID_FORMAT'
      })
    }

    console.log('[Middleware] File accepted:', file.originalFilename)

    req.uploadedFile = {
      path: file.filepath,
      originalName: file.originalFilename,
      mimetype: file.mimetype,
      size: file.size
    }

    next()
  })
}
