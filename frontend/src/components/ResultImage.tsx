interface ResultImageProps {
  base64: string
}

export default function ResultImage({ base64 }: ResultImageProps) {
  return (
    <img
      src={`data:image/jpeg;base64,${base64}`}
      alt="תמונה עם זיהויים"
      className="result-image"
    />
  )
}
