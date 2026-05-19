'use client'

import { useState, useEffect, useMemo } from 'react'
import { getRandomSymptomExample } from '@/lib/constants/symptom-examples'

interface DiaryEntry {
  id: string
  date: string
  symptom: string
  severity: number
  note: string
}

export default function DiaryPage() {
  const [entries, setEntries] = useState<DiaryEntry[]>([])
  const [form, setForm] = useState({ symptom: '', severity: 5, note: '' })
  const [showForm, setShowForm] = useState(false)
  const symptomExample = useMemo(() => getRandomSymptomExample(), [])

  useEffect(() => {
    const saved = localStorage.getItem('symptom_diary')
    if (saved) setEntries(JSON.parse(saved))
  }, [])

  function saveEntry() {
    if (!form.symptom.trim()) return
    const entry: DiaryEntry = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      ...form,
    }
    const updated = [entry, ...entries]
    setEntries(updated)
    localStorage.setItem('symptom_diary', JSON.stringify(updated))
    setForm({ symptom: '', severity: 5, note: '' })
    setShowForm(false)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">증상 일기</h2>
          <p className="text-gray-500 text-sm mt-1">증상 변화를 기록하고 의사에게 보여주세요</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#003876] text-white rounded-full px-4 py-2 text-sm font-semibold hover:bg-blue-800"
        >
          + 기록
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-blue-200 p-4 space-y-4 shadow-sm">
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">증상</label>
            <input
              value={form.symptom}
              onChange={(e) => setForm((f) => ({ ...f, symptom: e.target.value }))}
              placeholder={`예: ${symptomExample.text}`}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-base placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">
              통증 강도: {form.severity}/10
            </label>
            <input
              type="range" min={1} max={10} value={form.severity}
              onChange={(e) => setForm((f) => ({ ...f, severity: parseInt(e.target.value) }))}
              className="w-full accent-[#003876]"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>매우 약함</span><span>중간</span><span>매우 심함</span>
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">메모 (선택)</label>
            <textarea
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              placeholder="추가 메모..."
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={saveEntry} className="flex-1 bg-[#003876] text-white py-2 rounded-xl font-semibold hover:bg-blue-800">
              저장
            </button>
            <button onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 py-2 rounded-xl text-gray-600 hover:bg-gray-50">
              취소
            </button>
          </div>
        </div>
      )}

      {entries.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <div className="text-4xl mb-2">📔</div>
          <p className="text-sm">아직 기록이 없습니다.<br />오른쪽 위 + 버튼으로 첫 기록을 추가해 보세요.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <div key={entry.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-800">{entry.symptom}</span>
                <span className={`text-sm font-bold ${entry.severity >= 7 ? 'text-red-500' : entry.severity >= 4 ? 'text-yellow-500' : 'text-green-500'}`}>
                  {entry.severity}/10
                </span>
              </div>
              <p className="text-xs text-gray-400">{entry.date}</p>
              {entry.note && <p className="text-sm text-gray-600 mt-1">{entry.note}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
