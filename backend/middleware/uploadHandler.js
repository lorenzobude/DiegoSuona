import formidable from 'formidable'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export function uploadHandler(req, res, next) {
  const form = formidable({
    uploadDir: path.join(__dirname, '../uploads'),
    keepExtensions: true,
    maxFileSize: 50 * 1024 * 1024
  })

  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        success: false,
        error: err.message,
        code: 'UPLOAD_ERROR'
      })
    }

    const file = Array.isArray(files.file) ? files.file[0] : files.file

    if (!file) {
      return res.status(400).json({
        success: false,
        error: 'No file provided',
        code: 'NO_FILE'
      })
    }

    if (!file.mimetype || !file.mimetype.includes('audio')) {
      return res.status(400).json({
        success: false,
        error: 'File must be audio format',
        code: 'INVALID_FORMAT'
      })
    }

    req.uploadedFile = {
      path: file.filepath,
      originalName: file.originalFilename,
      mimetype: file.mimetype,
      size: file.size
    }

    next()
  })
}
