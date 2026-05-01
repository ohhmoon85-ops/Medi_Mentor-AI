'use client'

import { useState, useEffect } from 'react'

interface Hospital {
  id: string
  place_name: string
  address_name: string
  phone: string
  distance: string
  place_url: string
  category_name: string
}

export default function HospitalsPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [locationGranted, setLocationGranted] = useState(false)

  async function fetchHospitals(lat: number, lng: number) {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/hospitals?lat=${lat}&lng=${lng}`)
      const data = await res.json()
      setHospitals(data.hospitals ?? [])
    } catch {
      setError('병원 정보를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  function requestLocation() {
    if (!navigator.geolocation) {
      setError('위치 정보를 사용할 수 없는 브라우저입니다.')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocationGranted(true)
        fetchHospitals(pos.coords.latitude, pos.coords.longitude)
      },
      () => {
        setError('위치 권한을 허용해 주셔야 근처 병원을 찾을 수 있습니다.')
      }
    )
  }

  useEffect(() => {
    requestLocation()
  }, [])

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-gray-800">근처 병원 찾기</h2>
        <p className="text-gray-500 text-sm mt-1">현재 위치 기준으로 가까운 병원을 안내합니다</p>
      </div>

      {!locationGranted && !loading && (
        <div className="bg-blue-50 rounded-2xl p-6 text-center space-y-3">
          <div className="text-4xl">📍</div>
          <p className="text-gray-600">위치 권한이 필요합니다</p>
          <button
            onClick={requestLocation}
            className="bg-[#003876] text-white rounded-full px-6 py-2 font-semibold hover:bg-blue-800"
          >
            위치 허용하기
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm">
          {error}
        </div>
      )}

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-2/3 mb-2" />
              <div className="h-4 bg-gray-100 rounded w-full mb-1" />
              <div className="h-4 bg-gray-100 rounded w-1/3" />
            </div>
          ))}
        </div>
      )}

      {hospitals.length > 0 && (
        <div className="space-y-3">
          {hospitals.map((h) => (
            <a
              key={h.id}
              href={h.place_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{h.place_name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{h.category_name}</p>
                  <p className="text-sm text-gray-500 mt-1">{h.address_name}</p>
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                  <span className="text-sm font-semibold text-[#10B981]">
                    {parseFloat(h.distance) >= 1000
                      ? `${(parseFloat(h.distance) / 1000).toFixed(1)}km`
                      : `${h.distance}m`}
                  </span>
                </div>
              </div>
              {h.phone && (
                <a
                  href={`tel:${h.phone}`}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 text-sm text-blue-600 mt-2 hover:underline"
                >
                  📞 {h.phone}
                </a>
              )}
            </a>
          ))}
        </div>
      )}

      {hospitals.length === 0 && !loading && locationGranted && (
        <div className="text-center py-10 text-gray-400">
          <div className="text-4xl mb-2">🔍</div>
          <p>주변에 병원 정보가 없습니다.</p>
        </div>
      )}
    </div>
  )
}
