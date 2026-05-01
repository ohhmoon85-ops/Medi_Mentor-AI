'use client'

import { useState } from 'react'
import type { Citation } from '@/lib/db/schema'

interface CitationModalProps {
  citations: Citation[]
  children: React.ReactNode
}

export function CitationModal({ citations, children }: CitationModalProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-blue-600 hover:underline text-sm inline-flex items-center gap-1"
      >
        {children}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg p-6 shadow-xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">근거 출처</h3>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <ul className="space-y-3">
              {citations.map((c, i) => (
                <li key={i} className="border rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs bg-blue-100 text-blue-700 rounded px-2 py-0.5 font-mono">
                      [{i + 1}]
                    </span>
                    <span className="text-xs text-gray-500 uppercase">{c.type}</span>
                    {c.year && (
                      <span className="text-xs text-gray-400">{c.year}</span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-800">{c.name}</p>
                  {c.pmid && (
                    <a
                      href={`https://pubmed.ncbi.nlm.nih.gov/${c.pmid}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 hover:underline"
                    >
                      PMID: {c.pmid}
                    </a>
                  )}
                  {c.url && !c.pmid && (
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 hover:underline"
                    >
                      원문 보기 →
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  )
}
