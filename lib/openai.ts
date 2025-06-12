import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
})

export async function generateAdvice(prompt: string): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: 'Tu es un assistant expert en immobilier et en coaching d’agents immobiliers. Donne des conseils concrets, personnalisés et actionnables.' },
      { role: 'user', content: prompt },
    ],
    max_tokens: 400,
    temperature: 0.7,
  })
  return completion.choices[0]?.message?.content || ''
} 