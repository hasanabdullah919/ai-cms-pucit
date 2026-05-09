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
    const confidence = scoreComplaintQuality(description, userCategory || 'Other')
    const desc = description.toLowerCase()
    const urgency: UrgencyLevel =
      desc.includes('critical') || desc.includes('violence') || desc.includes('abuse') ? 'critical'
      : desc.includes('urgent') || desc.includes('emergency') || desc.includes('harassment') || desc.includes('asap') ? 'high'
      : desc.includes('immediately') || desc.includes('broken') || desc.includes('not working') ? 'medium'
      : 'low'
    return {
      category: (userCategory as ComplaintCategory) || 'Other',
      confidence,
      urgency,
      reasoning: 'Quality-scored classification',
    }
  }
}

function scoreComplaintQuality(description: string, category: string): number {
  let score = 40
  const desc = description.toLowerCase()
  const words = desc.split(/\s+/).filter(w => w.length > 2)

  // Length signals completeness (longer = more context = higher confidence)
  score += Math.min(Math.floor(words.length / 3), 20)

  // Category keyword matches boost confidence
  const keywords: Record<string, string[]> = {
    IT: ['wifi', 'internet', 'computer', 'portal', 'system', 'network', 'password', 'login', 'server', 'software'],
    Academic: ['exam', 'grade', 'course', 'teacher', 'lecture', 'assignment', 'result', 'marks', 'faculty'],
    Financial: ['fee', 'scholarship', 'payment', 'challan', 'refund', 'money', 'fine', 'dues'],
    Harassment: ['harass', 'bully', 'threat', 'unsafe', 'abuse', 'discriminat'],
    Hostel: ['hostel', 'room', 'warden', 'water', 'electricity', 'food', 'mess', 'bathroom'],
    Infrastructure: ['lab', 'classroom', 'ac', 'projector', 'furniture', 'parking', 'repair', 'broken', 'leaking'],
  }
  const matches = (keywords[category] || []).filter(k => desc.includes(k)).length
  score += matches * 6

  // Specificity signals (numbers, room/block references, dates)
  if (/\d+/.test(description)) score += 5
  if (/block|room|hall|building|floor/i.test(description)) score += 5
  if (/since|for \d+|days?|week/i.test(description)) score += 4

  return Math.min(94, Math.max(28, score))
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
