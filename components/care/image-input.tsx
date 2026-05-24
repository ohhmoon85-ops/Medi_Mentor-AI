'use client'

/**
 * D1-3 사진 입력 UI (chat 페이지 마운트)
 *
 * - 카메라 촬영 + 갤러리 선택 (input type=file accept=image/* capture=environment)
 * - 최대 3장, 5MB/장 제한 (초과 시 안내)
 * - base64 dataURL 변환 (FileReader.readAsDataURL)
 * - 미리보기 3-grid + 개별 삭제
 * - 첨부 선택 — 첨부 없이도 텍스트 트리아지 동작 보장
 */

import { useRef, useState } from 'react'

const MAX_IMAGES = 3
const MAX_BYTES = 5 * 1024 * 1024  // 5MB

export interface ImageInputProps {
  images: string[]                              // base64 dataURL 배열 (상위 보관)
  onChange: (next: string[]) => void
  disabled?: boolean
}

export function ImageInput({ images, onChange, disabled }: ImageInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string>('')

  function openPicker() {
    setError('')
    fileInputRef.current?.click()
  }

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return

    const remaining = MAX_IMAGES - images.length
    if (files.length > remaining) {
      setError(`최대 ${MAX_IMAGES}장까지 첨부 가능합니다. (남은 슬롯 ${remaining}장)`)
    }
    const toAdd = files.slice(0, remaining)

    const overSized = toAdd.find((f) => f.size > MAX_BYTES)
    if (overSized) {
      setError('사진이 너무 큽니다. 5MB 이하로 다시 시도해 주세요.')
      e.target.value = ''
      return
    }

    try {
      const dataURLs = await Promise.all(
        toAdd.map(
          (f) =>
            new Promise<string>((resolve, reject) => {
              const reader = new FileReader()
              reader.onload = () => resolve(String(reader.result))
              reader.onerror = () => reject(new Error('파일 읽기 실패'))
              reader.readAsDataURL(f)
            }),
        ),
      )
      onChange([...images, ...dataURLs])
    } catch {
      setError('사진 읽기에 실패했습니다.')
    } finally {
      e.target.value = ''
    }
  }

  function removeAt(idx: number) {
    onChange(images.filter((_, i) => i !== idx))
    setError('')
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={openPicker}
          disabled={disabled || images.length >= MAX_IMAGES}
          className="px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="사진 첨부"
        >
          📷 사진 첨부 (선택, 최대 {MAX_IMAGES}장)
        </button>
        <span className="text-xs text-gray-500">
          피부·외상·눈·목·종괴·손발톱 사진이 도움이 됩니다. 첨부 없이도 진행 가능.
        </span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        className="hidden"
        onChange={handleFiles}
      />

      {error && (
        <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((src, i) => (
            <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
              {/* base64 dataURL — next/image 미사용 (서버 미저장 + 단발 사용) */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`첨부 ${i + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeAt(i)}
                aria-label={`${i + 1}번 사진 삭제`}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white text-xs flex items-center justify-center hover:bg-black/80"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
