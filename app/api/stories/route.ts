import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
  if (!url || !key) return null;
  return createClient(url, key);
}

// GET: 공개 이야기 목록
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const era    = searchParams.get('era');
  const desire = searchParams.get('desire');
  const page   = parseInt(searchParams.get('page') ?? '1', 10);
  const limit  = 12;
  const offset = (page - 1) * limit;

  const sb = getServiceClient();
  if (!sb) {
    return NextResponse.json({ data: [], error: 'Supabase not configured' });
  }

  let query = sb
    .from('stories')
    .select('*')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (era && era !== 'all')    query = query.eq('era', era);
  if (desire && desire !== 'all') query = query.eq('desire_type', desire);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data });
}

// POST: 이야기 저장
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      guest_name, guest_status, era, desire_type, desire_content,
      confection_original, confection_name, confection_ingredients,
      confection_effect, confection_price,
      ending_content, ending_tone, card_visual_config,
      author_id,
    } = body;

    // 대가 필드 필수 검증 (불변 법칙)
    if (!confection_price) {
      return NextResponse.json({ error: '대가 필드는 필수입니다.' }, { status: 400 });
    }

    const sb = getServiceClient();
    if (!sb) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
    }

    const { data, error } = await sb.from('stories').insert([{
      author_id: author_id ?? null,
      guest_name,
      guest_status,
      era,
      desire_type,
      desire_content,
      confection_original,
      confection_name,
      confection_ingredients,
      confection_effect,
      confection_price,
      ending_content,
      ending_tone,
      card_visual_config,
      is_public: true,
    }]).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : '알 수 없는 오류';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
