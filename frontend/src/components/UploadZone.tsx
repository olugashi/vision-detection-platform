import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

interface UploadZoneProps {
  onFile: (file: File) => void
  preview: string | null
  file: File | null
}

export default function UploadZone({ onFile, preview, file }: UploadZoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFile(acceptedFiles[0])
      }
    },
    [onFile]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false,
  })

  return (
    <div
      {...getRootProps()}
      className={`upload-zone${isDragActive ? ' active' : ''}`}
    >
      <input {...getInputProps()} />
      {preview && file ? (
        <>
          <img src={preview} alt="תצוגה מקדימה" className="upload-preview" />
          <p style={{ marginTop: '0.75rem', fontSize: '0.9rem', color: '#8888cc' }}>
            {file.name}
          </p>
          <p>לחץ או גרור תמונה חדשה לכאן</p>
        </>
      ) : (
        <>
          <div className="upload-icon">🖼️</div>
          <p>גרור תמונה לכאן או לחץ לבחירה</p>
          <p style={{ fontSize: '0.85rem', color: '#666699', marginTop: '0.25rem' }}>
            PNG, JPG, JPEG, WEBP
          </p>
        </>
      )}
    </div>
  )
}
