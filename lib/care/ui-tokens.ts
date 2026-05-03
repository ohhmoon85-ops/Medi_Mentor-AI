/**
 * M6-C Care 카드 공통 디자인 토큰
 *
 * M3-5-γ 디자인 언어에서 추출한 표준 토큰.
 * 4개 기존 카드(specialty-recommendation, symptom-journal, medication-list, visit-checklist)의
 * 공통 패턴을 정규화하여, 향후 신규 카드 작성 시 이 토큰을 우선 사용한다.
 *
 * 적용 정책:
 * - 기존 4개 카드는 변경하지 않음 (M3-4-final + M5 보호 파일)
 * - 본 M6 패치에서는 토큰 정의만. 기존 카드 마이그레이션은 차기 패치(디자인 리뷰 후)
 * - 신규 카드 컴포넌트 작성 시 본 토큰 사용 의무
 *
 * E-1 노년층 친화 정책 준수:
 * - 기본 글씨: text-base (16px) 이상
 * - 제목: text-lg (18px) 이상
 * - 클릭 영역: min-h-[44px] (WCAG 2.1 최소 터치 영역)
 * - seniorMode: 글씨·클릭 영역 추가 확대
 */

// ─── 기본 토큰 ────────────────────────────────────────────────────

export const CareCardTokens = {
  // 색상
  colors: {
    cardBg:         'bg-white',
    cardBorder:     'border-gray-200',
    primaryText:    'text-gray-900',
    secondaryText:  'text-gray-600',
    mutedText:      'text-gray-400',
    accent:         'text-blue-600',
    critical:       'text-red-600',
    warning:        'text-orange-500',
    success:        'text-green-600',
    info:           'text-teal-700',
    disclaimer:     'text-xs text-gray-400 text-center',
  },

  // 글씨 크기 (노년층 친화 — E-1)
  typography: {
    /** 카드 제목: 18px 이상 (E-1 기본) */
    title:    'text-lg font-bold',
    subtitle: 'text-base font-semibold',
    /** 본문: 16px 이상 (E-1 기본) */
    body:     'text-base',
    caption:  'text-sm text-gray-500',
    badge:    'text-xs font-medium',
  },

  // 인터랙션 (WCAG 최소 터치 영역 44×44px)
  interactive: {
    /** 기본 최소 터치 영역 */
    minTouchTarget:   'min-h-[44px]',
    /** 기본 버튼 */
    primaryButton:    'min-h-[44px] px-4 py-2 text-base font-semibold rounded-xl',
    /** 아이콘 버튼 */
    iconButton:       'min-w-[44px] min-h-[44px] flex items-center justify-center',
    /** 텍스트 입력 */
    inputField:       'min-h-[44px] px-3 py-2 border-2 border-gray-300 rounded-xl outline-none text-base',
  },

  // 간격
  spacing: {
    /** 카드 내부 패딩 */
    cardPadding:  'p-4',
    /** 섹션 간격 */
    sectionGap:   'space-y-4',
    /** 항목 간격 */
    itemGap:      'space-y-2',
  },

  // 카드 구조
  layout: {
    card:       'bg-white border-2 rounded-2xl',
    cardHeader: 'flex items-center justify-between gap-2 flex-wrap',
    list:       'space-y-2',
    listItem:   'bg-gray-50 border-2 border-gray-200 rounded-xl p-4',
    tagChip:    'rounded-full px-3 py-1 text-sm flex items-center gap-1',
  },

  // 노년층 모드 추가 보강 (seniorMode=true 시)
  seniorMode: {
    /** 제목: 24px 이상 (E-1 seniorMode 필수) */
    title:          'text-2xl font-bold',
    /** 본문: 20px */
    body:           'text-xl',
    /** 터치 영역 확대 */
    minTouchTarget: 'min-h-[56px]',
    /** 카드 패딩 확대 */
    cardPadding:    'p-6',
    /** 버튼 패딩 확대 */
    buttonPadding:  'py-4',
  },
} as const

// ─── 헬퍼 함수 ───────────────────────────────────────────────────

/**
 * 카드 래퍼 클래스 조합 (border 색상은 카드별 개별 지정).
 * 예: getCareCardClasses(true) → "bg-white border-2 rounded-2xl p-6 space-y-4"
 */
export function getCareCardClasses(seniorMode?: boolean): string {
  const pad = seniorMode ? CareCardTokens.seniorMode.cardPadding : CareCardTokens.spacing.cardPadding
  return `${CareCardTokens.layout.card} ${pad} ${CareCardTokens.spacing.sectionGap}`
}

/**
 * 카드 제목 클래스 조합.
 * 예: getCareTitleClasses(false) → "text-lg font-bold"
 *     getCareTitleClasses(true)  → "text-2xl font-bold"
 */
export function getCareTitleClasses(seniorMode?: boolean): string {
  return seniorMode ? CareCardTokens.seniorMode.title : CareCardTokens.typography.title
}

/**
 * 본문 클래스 조합.
 * 예: getCareBodyClasses(true) → "text-xl"
 */
export function getCareBodyClasses(seniorMode?: boolean): string {
  return seniorMode ? CareCardTokens.seniorMode.body : CareCardTokens.typography.body
}

/**
 * 버튼 최소 클릭 영역 클래스.
 * WCAG 2.1 기준 44px (기본) / 56px (노년층 모드)
 */
export function getCareTouchTarget(seniorMode?: boolean): string {
  return seniorMode
    ? CareCardTokens.seniorMode.minTouchTarget
    : CareCardTokens.interactive.minTouchTarget
}
