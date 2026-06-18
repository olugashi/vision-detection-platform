import React, { useRef, useState, useCallback, useEffect } from 'react'
import { Stage, Layer, Image as KonvaImage, Rect, Text } from 'react-konva'
import useImage from 'use-image'
import { Box, Button, MenuItem, Select, Typography } from '@mui/material'
import { AnnotationIn } from '../../api/trainingApi'

export interface DrawingBox extends AnnotationIn {
  tempId: string
}

const CLASS_INFO: { id: number; label: string; color: string }[] = [
  { id: 0,  label: 'אדם',      color: '#FF4444' },
  { id: 1,  label: 'אופניים',  color: '#00AAAA' },
  { id: 2,  label: 'רכב',      color: '#4444FF' },
  { id: 3,  label: 'אופנוע',   color: '#00AA00' },
  { id: 4,  label: 'מטוס',     color: '#DCDC00' },
  { id: 5,  label: 'אוטובוס',  color: '#8800FF' },
  { id: 7,  label: 'משאית',    color: '#FF8800' },
  { id: 8,  label: 'סירה',     color: '#FF69B4' },
]

const CANVAS_MAX_WIDTH = 700

interface Props {
  imageUrl: string
  initialBoxes: DrawingBox[]
  onChange: (boxes: DrawingBox[]) => void
}

export default function AnnotationCanvas({ imageUrl, initialBoxes, onChange }: Props) {
  const [image, status] = useImage(imageUrl, 'anonymous')
  const [boxes, setBoxes] = useState<DrawingBox[]>(initialBoxes)

  useEffect(() => {
    setBoxes(initialBoxes)
  }, [initialBoxes])
  const [drawing, setDrawing] = useState<{ x: number; y: number } | null>(null)
  const [current, setCurrent] = useState<{ x: number; y: number; w: number; h: number } | null>(null)
  const [selectedClass, setSelectedClass] = useState(0)
  const stageRef = useRef<any>(null)

  const scale = image
    ? Math.min(1, CANVAS_MAX_WIDTH / image.width)
    : 1
  const canvasW = image ? image.width * scale : CANVAS_MAX_WIDTH
  const canvasH = image ? image.height * scale : 400

  const getPos = () => {
    const stage = stageRef.current
    if (!stage) return { x: 0, y: 0 }
    const pos = stage.getPointerPosition()
    return { x: pos.x / scale, y: pos.y / scale }
  }

  const onMouseDown = () => {
    const { x, y } = getPos()
    setDrawing({ x, y })
    setCurrent({ x, y, w: 0, h: 0 })
  }

  const onMouseMove = () => {
    if (!drawing) return
    const { x, y } = getPos()
    setCurrent({
      x: Math.min(drawing.x, x),
      y: Math.min(drawing.y, y),
      w: Math.abs(x - drawing.x),
      h: Math.abs(y - drawing.y),
    })
  }

  const onMouseUp = () => {
    if (!drawing || !current || current.w < 5 || current.h < 5) {
      setDrawing(null)
      setCurrent(null)
      return
    }
    const newBox: DrawingBox = {
      tempId: Math.random().toString(36).slice(2),
      class_id: selectedClass,
      x: current.x,
      y: current.y,
      width: current.w,
      height: current.h,
      source: 'manual',
    }
    const updated = [...boxes, newBox]
    setBoxes(updated)
    onChange(updated)
    setDrawing(null)
    setCurrent(null)
  }

  const removeBox = useCallback((tempId: string) => {
    const updated = boxes.filter((b) => b.tempId !== tempId)
    setBoxes(updated)
    onChange(updated)
  }, [boxes, onChange])

  const colorFor = (cls: number) => CLASS_INFO.find((c) => c.id === cls)?.color ?? '#fff'
  const labelFor = (cls: number) => CLASS_INFO.find((c) => c.id === cls)?.label ?? String(cls)

  if (status === 'loading') return <Typography color="text.secondary">טוען תמונה...</Typography>

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={2} mb={1.5}>
        <Typography variant="body2">סוג אובייקט:</Typography>
        <Select
          size="small"
          value={selectedClass}
          onChange={(e) => setSelectedClass(Number(e.target.value))}
          sx={{ minWidth: 130 }}
        >
          {CLASS_INFO.map((c) => (
            <MenuItem key={c.id} value={c.id}>
              <Box display="flex" alignItems="center" gap={1}>
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: c.color }} />
                {c.label}
              </Box>
            </MenuItem>
          ))}
        </Select>
        <Typography variant="caption" color="text.secondary">
          לחץ וגרור לציור תיבה
        </Typography>
      </Box>

      <Box
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          overflow: 'hidden',
          cursor: 'crosshair',
          display: 'inline-block',
        }}
      >
        <Stage
          ref={stageRef}
          width={canvasW}
          height={canvasH}
          scaleX={scale}
          scaleY={scale}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
        >
          <Layer>
            {image && <KonvaImage image={image} />}

            {/* Saved boxes */}
            {boxes.map((b) => {
              const color = colorFor(b.class_id)
              return (
                <React.Fragment key={b.tempId}>
                  <Rect
                    x={b.x} y={b.y} width={b.width} height={b.height}
                    stroke={color} strokeWidth={2 / scale}
                    onClick={() => removeBox(b.tempId)}
                  />
                  <Rect
                    x={b.x} y={b.y - 18 / scale}
                    width={80 / scale} height={18 / scale}
                    fill={color}
                  />
                  <Text
                    x={b.x + 2 / scale} y={b.y - 16 / scale}
                    text={labelFor(b.class_id)}
                    fontSize={12 / scale}
                    fill="white"
                  />
                </React.Fragment>
              )
            })}

            {/* Box being drawn */}
            {current && (
              <Rect
                x={current.x} y={current.y} width={current.w} height={current.h}
                stroke={colorFor(selectedClass)} strokeWidth={2 / scale}
                dash={[6 / scale, 3 / scale]}
              />
            )}
          </Layer>
        </Stage>
      </Box>

      {boxes.length > 0 && (
        <Typography variant="caption" color="text.secondary" mt={0.5} display="block">
          {boxes.length} תיבות — לחץ על תיבה להסרתה
        </Typography>
      )}
    </Box>
  )
}

