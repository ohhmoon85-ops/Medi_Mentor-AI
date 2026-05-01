import { NextRequest, NextResponse } from 'next/server'
import { searchNearbyHospitals } from '@/lib/connectors/kakao-map'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const lat = parseFloat(searchParams.get('lat') ?? '')
    const lng = parseFloat(searchParams.get('lng') ?? '')
    const dept = searchParams.get('dept') ?? undefined

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json({ error: '위치 정보가 필요합니다.' }, { status: 400 })
    }

    const hospitals = await searchNearbyHospitals(lat, lng, dept)

    // 점수 기반 정렬: 거리 + 운영 여부
    const scored = hospitals.map((h) => ({
      ...h,
      score:
        0.25 * (1 / Math.max(parseFloat(h.distance) / 1000, 0.1)) +
        0.30 * 1, // 운영 여부는 카카오 API에서 별도 확인 필요
    }))

    scored.sort((a, b) => b.score - a.score)

    return NextResponse.json({ hospitals: scored })
  } catch (err) {
    console.error('[hospitals] error:', err)
    return NextResponse.json({ error: '병원 정보를 불러오지 못했습니다.' }, { status: 500 })
  }
}
