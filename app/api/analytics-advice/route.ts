import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { generateAdvice } from '@/lib/openai'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json()
    if (!userId) return NextResponse.json({ error: 'userId requis' }, { status: 400 })

    // Charger les propriétés et prospects de l'agent
    const [{ data: properties }, { data: prospects }] = await Promise.all([
      supabase.from('properties').select('id, title, price, city, status, type').eq('user_id', userId),
      supabase.from('prospects').select('id, first_name, last_name, budget_min, budget_max, property_types, desired_locations, status').eq('user_id', userId),
    ])
    // Générer un prompt synthétique
    const prompt = `Voici un résumé de l'activité d'un agent immobilier :\n\nPropriétés :\n${(properties||[]).map(p => `- ${p.title} (${p.type}, ${p.city}, ${p.price}€, ${p.status})`).join('\n')}\n\nProspects :\n${(prospects||[]).map(pr => `- ${pr.first_name} ${pr.last_name} (budget ${pr.budget_min||''}-${pr.budget_max||''}€, types: ${(pr.property_types||[]).join(', ')}, lieux: ${(pr.desired_locations||[]).join(', ')}, statut: ${pr.status})`).join('\n')}\n\nDonne-moi 3 conseils personnalisés et actionnables pour améliorer mon activité et mon chiffre d'affaires.`
    // Appel OpenAI
    const aiAdvice = await generateAdvice(prompt)
    return NextResponse.json({ advice: aiAdvice })
  } catch (e: any) {
    return NextResponse.json({ error: 'Erreur serveur ou IA.' }, { status: 500 })
  }
} 