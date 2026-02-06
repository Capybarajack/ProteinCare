import { getOpenAIApiKey } from '../utils/openai'

type AnalyzeBody = {
  imageDataUrl?: string
  detail?: 'low' | 'high' | 'auto'
}

export const analyzeHandler = async (event: any) => {
  const body = (await readBody<AnalyzeBody>(event)) ?? {}
  const imageDataUrl = String(body.imageDataUrl || '')
  const detail = (body.detail ?? 'auto') as 'low' | 'high' | 'auto'

  if (!imageDataUrl.startsWith('data:image/')) {
    throw createError({ statusCode: 400, statusMessage: 'imageDataUrl must be a data:image/... base64 URL' })
  }

  // Basic size guard (rough): allow up to ~12MB of base64 payload.
  if (imageDataUrl.length > 12_000_000) {
    throw createError({ statusCode: 413, statusMessage: 'Image payload too large' })
  }

  const apiKey = await getOpenAIApiKey()

  const prompt = [
    'You are a nutritionist assistant. Analyze the food in the photo.',
    'Return STRICT JSON only (no markdown).',
    'Schema:',
    '{',
    '  "summary": string,',
    '  "items": [',
    '    { "name": string, "estimated_portion": string, "calories_kcal": number, "protein_g": number, "carbs_g": number, "fat_g": number }',
    '  ],',
    '  "total": { "calories_kcal": number, "protein_g": number, "carbs_g": number, "fat_g": number },',
    '  "confidence": number,',
    '  "assumptions": string[]',
    '}',
    'Notes:',
    '- If uncertain, make conservative estimates and explain in assumptions.',
    '- If multiple foods, split into multiple items.',
  ].join('\n')

  const res = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-mini',
      // Force strict JSON output.
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'nutrition_result',
          strict: true,
          schema: {
            type: 'object',
            additionalProperties: false,
            required: ['summary', 'items', 'total', 'confidence', 'assumptions'],
            properties: {
              summary: { type: 'string' },
              items: {
                type: 'array',
                items: {
                  type: 'object',
                  additionalProperties: false,
                  required: ['name', 'estimated_portion', 'calories_kcal', 'protein_g', 'carbs_g', 'fat_g'],
                  properties: {
                    name: { type: 'string' },
                    estimated_portion: { type: 'string' },
                    calories_kcal: { type: 'number' },
                    protein_g: { type: 'number' },
                    carbs_g: { type: 'number' },
                    fat_g: { type: 'number' },
                  },
                },
              },
              total: {
                type: 'object',
                additionalProperties: false,
                required: ['calories_kcal', 'protein_g', 'carbs_g', 'fat_g'],
                properties: {
                  calories_kcal: { type: 'number' },
                  protein_g: { type: 'number' },
                  carbs_g: { type: 'number' },
                  fat_g: { type: 'number' },
                },
              },
              confidence: { type: 'number' },
              assumptions: { type: 'array', 'items': { type: 'string' } },
            },
          },
        },
      },
      input: [
        {
          role: 'user',
          content: [
            { type: 'input_text', text: prompt },
            { type: 'input_image', image_url: imageDataUrl, detail },
          ],
        },
      ],
    }),
  })

  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    throw createError({
      statusCode: 502,
      statusMessage: `OpenAI API error: ${res.status} ${res.statusText}`,
      data: { body: errText.slice(0, 2000) },
    })
  }

  const data = await res.json() as any
  const text = String(data?.output_text ?? '')

  // The model is instructed to return strict JSON, but still guard.
  try {
    const parsed = JSON.parse(text)
    return { ok: true, result: parsed, rawText: text }
  } catch {
    return { ok: true, result: null, rawText: text }
  }
}

export default defineEventHandler(analyzeHandler)
