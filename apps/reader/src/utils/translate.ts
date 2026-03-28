import { AIConfig } from '../state'

export interface TranslateResult {
  text: string
  error?: string
}

export async function translateText(
  text: string,
  config: AIConfig,
): Promise<TranslateResult> {
  if (!config.apiKey || !config.apiUrl || !config.modelName) {
    return {
      text: '',
      error: 'AI configuration is incomplete',
    }
  }

  const prompt =
    config.translatePrompt || '请将以下文本翻译成中文，保持原文的格式和风格：'
  const fullPrompt = `${prompt}\n\n${text}`

  try {
    const response = await fetch(`${config.apiUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.modelName,
        messages: [
          {
            role: 'user',
            content: fullPrompt,
          },
        ],
        temperature: 0.3,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        text: '',
        error: errorData.error?.message || `API error: ${response.statusText}`,
      }
    }

    const data = await response.json()
    const translatedText = data.choices?.[0]?.message?.content?.trim() || ''

    if (!translatedText) {
      return {
        text: '',
        error: 'No translation result',
      }
    }

    return {
      text: translatedText,
    }
  } catch (error) {
    return {
      text: '',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
