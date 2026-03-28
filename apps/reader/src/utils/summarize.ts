import { AIConfig } from '../state'

export interface SummarizeResult {
  text: string
  error?: string
}

export async function summarizeText(
  text: string,
  config: AIConfig,
): Promise<SummarizeResult> {
  if (!config.apiKey || !config.apiUrl || !config.modelName) {
    return {
      text: '',
      error: 'AI configuration is incomplete',
    }
  }

  const prompt =
    config.summarizePrompt || '请总结以下文本的主要内容，要求简洁明了：'
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
    const summarizedText = data.choices?.[0]?.message?.content?.trim() || ''

    if (!summarizedText) {
      return {
        text: '',
        error: 'No summary result',
      }
    }

    return {
      text: summarizedText,
    }
  } catch (error) {
    return {
      text: '',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
