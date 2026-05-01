export default function PrepChecklistPage() {
  const items = [
    { category: '신분증', items: ['건강보험증 또는 신분증', '장애인 등록증 (해당자)'] },
    { category: '기존 진료 기록', items: ['이전 병원 진료 기록지', '검사 결과지 (혈액, CT, MRI 등)', '처방전 사본'] },
    { category: '복용 중인 약', items: ['현재 복용 중인 약 목록 또는 실물', '약 봉투 (약품명 확인용)'] },
    { category: '증상 메모', items: ['증상이 시작된 날짜', '증상이 어떻게 변해왔는지', '통증 위치와 정도 (0~10점)', '악화/완화 요인'] },
    { category: '기타', items: ['보호자 연락처', '과거 수술 이력', '알레르기 정보'] },
  ]

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-800">병원 방문 준비 체크리스트</h2>
        <p className="text-gray-500 text-sm mt-1">진료를 더 효율적으로 받기 위한 준비물입니다</p>
      </div>

      {items.map((group) => (
        <div key={group.category} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <h3 className="font-bold text-gray-700 mb-3">{group.category}</h3>
          <ul className="space-y-2">
            {group.items.map((item) => (
              <li key={item} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded border-gray-300 text-[#003876] accent-[#003876]"
                />
                <span className="text-sm text-gray-600">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <div className="bg-blue-50 rounded-2xl p-4 text-sm text-blue-700">
        💡 <strong>팁:</strong> 스마트폰으로 약 봉투와 검사 결과지를 사진 찍어두면 더 편리합니다.
      </div>
    </div>
  )
}
