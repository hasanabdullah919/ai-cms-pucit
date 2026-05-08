import Anthropic from '@anthropic-ai/sdk'
import { ComplaintCategory, UrgencyLevel } from '@/types'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

interface AIClassificationResult {
  category: ComplaintCategory
  confidence: number
  urgency: UrgencyLevel
  reasoning: string
}

const CATEGORIES: ComplaintCategory[] = [
  'Academic', 'Financial', 'IT', 'Harassment', 'Hostel', 'Infrastructure', 'Other'
]

export async function classifyComplaint(
  description: string,
  userCategory?: string
): Promise<AIClassificationResult> {
  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: `You are a complaint classification system for a university. Classify the following complaint.

Categories: ${CATEGORIES.join(', ')}

Urgency levels (based on keywords like "urgent", "emergency", "harassment", "violence", "critical"):
- critical: immediate safety/harassment/violence concerns
- high: significant impact on studies/finances, time-sensitive
- medium: moderate inconvenience, not time-critical
- low: minor issue, can wait

Complaint: "${description}"
${userCategory ? `User selected category: ${userCategory}` : ''}

Respond with ONLY valid JSON in this exact format:
{
  "category": "<one of the 7 categories>",
  "confidence": <number 0-100>,
  "urgency": "<critical|high|medium|low>",
  "reasoning": "<brief explanation>"
}`,
        },
      ],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON in response')

    const result = JSON.parse(jsonMatch[0])

    return {
      category: CATEGORIES.includes(result.category) ? result.category : 'Other',
      confidence: Math.min(100, Math.max(0, Number(result.confidence) || 50)),
      urgency: ['critical', 'high', 'medium', 'low'].includes(result.urgency)
        ? result.urgency
        : 'medium',
      reasoning: result.reasoning || '',
    }
  } catch {
    return {
      category: (userCategory as ComplaintCategory) || 'Other',
      confidence: 0,
      urgency: 'medium',
      reasoning: 'AI classification failed - manual review required',
    }
  }
}

export async function detectDuplicates(
  description: string,
  recentComplaints: Array<{ id: string; description: string; complaint_id: string }>
): Promise<Array<{ complaint_id: string; similarity: number }>> {
  if (recentComplaints.length === 0) return []

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: `Check if the new complaint is a duplicate of any recent complaints.

New complaint: "${description}"

Recent complaints:
${recentComplaints.map((c, i) => `${i + 1}. [${c.complaint_id}] "${c.description.substring(0, 200)}"`).join('\n')}

Respond with ONLY valid JSON array of duplicates with similarity > 70:
[{"complaint_id": "CMP-XXXX-XXXXX", "similarity": <0-100>}]

If no duplicates, respond with: []`,
        },
      ],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : '[]'
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) return []

    return JSON.parse(jsonMatch[0])
  } catch {
    return []
  }
}
