function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export async function summarizeText(prompt: string): Promise<string> {
  if (process.env.FAKE_LLM === 'true') {
    return 'The customer shared feedback about their recent experience and is waiting on follow-up from the support team.'
  }

  const apiKey = process.env.OPENAI_API_KEY
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    }),
  })

  const data: unknown = await response.json()
  if (!isObject(data) || !Array.isArray(data.choices)) throw new Error('Invalid summary response')
  const choice: unknown = data.choices[0]
  if (!isObject(choice) || !isObject(choice.message) || typeof choice.message.content !== 'string') {
    throw new Error('Invalid summary response')
  }
  return choice.message.content
}
