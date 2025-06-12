import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const user_id = searchParams.get('user_id')
  if (!user_id) {
    return NextResponse.json({ error: 'user_id is required' }, { status: 400 })
  }
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', user_id)
    .order('created_at', { ascending: false })
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  if (!body.user_id || !body.first_name || !body.last_name) {
    return NextResponse.json({ error: 'user_id, first_name, last_name are required' }, { status: 400 })
  }
  const { data, error } = await supabase
    .from('clients')
    .insert([body])
    .select()
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data[0])
} 