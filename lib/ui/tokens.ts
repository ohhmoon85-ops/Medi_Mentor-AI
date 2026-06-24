/**
 * D4 닥터홈 공통 UI 디자인 토큰
 *
 * D3 PDF 리포트(`lib/report/tokens`)와 화면이 동일한 외형을 갖도록 공유.
 * D3 미구현 상태 — D3 발주 시 본 파일을 import 정합 권고.
 *
 * 색상 의미:
 * - navy: 헤더·강한 정보
 * - blue: 일반 정보
 * - green: 권장 행동 (이렇게 하세요)
 * - red:   응급·경고 (L1·L2 + 피해야 할 것)
 * - amber: 주의·일반 응급도 (L3·L4·L5 배너 + 면책)
 * - sky:   카드 보더 + 옅은 배경
 */

export const DH_COLORS = {
  navy:  '#1F3864',
  blue:  '#2E75B6',
  green: '#1E8449',
  red:   '#C0392B',
  amber: '#E0B000',
  sky:   '#D5E8F0',
} as const

export const DH_CARD = {
  radius: '12px',
  border: `1px solid ${DH_COLORS.sky}`,
  background: '#FFFFFF',
} as const

/** KTAS 등급별 배너 색상 (D4 §2 응급도 배너) — L1·L2 = red, 그 외 = amber/green */
export const DH_BANNER_BY_KTAS: Record<1 | 2 | 3 | 4 | 5, {
  bg: string
  border: string
  text: string
  label: string
}> = {
  1: { bg: '#FBE7E4', border: DH_COLORS.red,   text: '#7A1F15', label: 'L1 즉시 응급' },
  2: { bg: '#FBE7E4', border: DH_COLORS.red,   text: '#7A1F15', label: 'L2 응급실' },
  3: { bg: '#FBF1D5', border: DH_COLORS.amber, text: '#7A5B00', label: 'L3 야간·주말 진료' },
  4: { bg: '#FBF1D5', border: DH_COLORS.amber, text: '#7A5B00', label: 'L4 일반 외래' },
  5: { bg: '#DCEEDD', border: DH_COLORS.green, text: '#0F4D2A', label: 'L5 자가 관리' },
}

/** 노년층 접근성: 최소 버튼 높이 + 본문 폰트 */
export const DH_A11Y = {
  minButtonHeight: 44,   // px
  baseFontSize: 16,      // px
} as const
