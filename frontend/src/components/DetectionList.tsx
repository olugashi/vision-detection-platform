import { Detection } from '../App'

interface DetectionListProps {
  detections: Detection[]
  counts_by_class: Record<string, number>
}

const CLASS_COLOR_MAP: Record<string, string> = {
  person: 'person',
  car: 'car',
  truck: 'truck',
  bus: 'bus',
  motorcycle: 'motorcycle',
  bicycle: 'bicycle',
}

function getColorKey(className: string): string {
  return CLASS_COLOR_MAP[className] ?? 'default'
}

export default function DetectionList({ detections, counts_by_class }: DetectionListProps) {
  return (
    <div>
      <h2 className="detection-title">זיהויים</h2>

      {/* Badges for class counts */}
      <div className="badges-row">
        {Object.entries(counts_by_class).map(([cls, count]) => (
          <span key={cls} className={`badge badge-${getColorKey(cls)}`}>
            {cls} &times; {count}
          </span>
        ))}
      </div>

      {/* Detection items */}
      {detections.length === 0 ? (
        <p style={{ color: '#666699' }}>לא נמצאו זיהויים.</p>
      ) : (
        detections.map((det, idx) => {
          const colorKey = getColorKey(det.class_name)
          const pct = Math.round(det.confidence * 100)
          return (
            <div key={idx} className="detection-item">
              <div className="detection-item-header">
                <span className="detection-class">{det.class_name}</span>
                <span className="detection-confidence">{pct}%</span>
              </div>
              <div className="confidence-bar-bg">
                <div
                  className={`confidence-bar-fill bar-${colorKey}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
