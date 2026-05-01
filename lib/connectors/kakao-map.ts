// 카카오맵 API 커넥터 - 위치 기반 의료기관 검색

const KAKAO_API_KEY = process.env.KAKAO_REST_API_KEY ?? ''
const KAKAO_LOCAL_API = 'https://dapi.kakao.com/v2/local'

export interface KakaoPlace {
  id: string
  place_name: string
  category_name: string
  address_name: string
  road_address_name: string
  phone: string
  x: string
  y: string
  distance: string
  place_url: string
}

export async function searchNearbyHospitals(
  lat: number,
  lng: number,
  department?: string,
  radiusMeters = 5000
): Promise<KakaoPlace[]> {
  const query = department ? `${department} 병원` : '병원 의원'

  const url = new URL(`${KAKAO_LOCAL_API}/search/keyword.json`)
  url.searchParams.set('query', query)
  url.searchParams.set('x', String(lng))
  url.searchParams.set('y', String(lat))
  url.searchParams.set('radius', String(radiusMeters))
  url.searchParams.set('sort', 'distance')
  url.searchParams.set('size', '15')

  const res = await fetch(url.toString(), {
    headers: { Authorization: `KakaoAK ${KAKAO_API_KEY}` },
  })

  if (!res.ok) throw new Error(`카카오맵 API 오류: ${res.status}`)

  const data = await res.json()
  return (data.documents ?? []) as KakaoPlace[]
}

export async function searchEmergencyHospitals(lat: number, lng: number): Promise<KakaoPlace[]> {
  const url = new URL(`${KAKAO_LOCAL_API}/search/keyword.json`)
  url.searchParams.set('query', '응급실 응급의료기관')
  url.searchParams.set('x', String(lng))
  url.searchParams.set('y', String(lat))
  url.searchParams.set('radius', '10000')
  url.searchParams.set('sort', 'distance')
  url.searchParams.set('size', '5')

  const res = await fetch(url.toString(), {
    headers: { Authorization: `KakaoAK ${KAKAO_API_KEY}` },
  })

  if (!res.ok) throw new Error(`카카오맵 API 오류: ${res.status}`)

  const data = await res.json()
  return (data.documents ?? []) as KakaoPlace[]
}
