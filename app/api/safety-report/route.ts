import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/db/supabase'

export async function POST(req: NextRequest) {
  try {
    const { reporter_role, category, context, description } = await req.json()

    if (!category || !description?.trim()) {
      return NextResponse.json({ error: '필수 정보가 누락되었습니다.' }, { status: 400 })
    }

    const supabase = getServiceClient()
    const { error } = await supabase.from('safety_reports').insert({
      reporter_role: reporter_role ?? null,
      category,
      context: context ?? {},
      description,
      status: 'pending',
    })

    if (error) {
      throw new Error(error.message)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[safety-report] error:', err)
    return NextResponse.json({ error: '신고 접수에 실패했습니다.' }, { status: 500 })
  }
}
