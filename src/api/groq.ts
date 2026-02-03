/**
 * Groq Vision API - sends image to Llama 4 Scout for answer.
 * API key is stored in localStorage only.
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const VISION_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct'
const STORAGE_KEY = 'groq_api_key'

function getApiKey(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? ''
  } catch {
    return ''
  }
}

export function setApiKey(key: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, key)
  } catch {
    /* ignore */
  }
}

export function hasApiKey(): boolean {
  return !!getApiKey()
}

const SYSTEM_PROMPT =
  '你是一个关于答题助手。请根据以下问题给出简洁准确的答案。回答使用中文。最好结合下面的选项给出答案。'

export async function askVisionLLM(imageBase64: string): Promise<string> {
  const apiKey = getApiKey()
  if (!apiKey) throw new Error('API key is required')
  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: VISION_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: [
            { type: 'text', text: '请回答图片中的问题。' },
            {
              type: 'image_url',
              image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
            },
          ],
        },
      ],
      max_tokens: 256,
      temperature: 0.3,
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Groq API error: ${response.status} ${err}`)
  }

  const data = await response.json()
  return data.choices[0].message.content.trim()
}
