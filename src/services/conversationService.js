import { randomUUID } from 'node:crypto'
import { isSupabaseConfigured, supabase } from '../config/supabase.js'

const seed = [
  { id:'demo-1', title:'Mobile app launch planning', source_language:'English', target_language:'Vietnamese', duration_seconds:1122, transcript:[], translated_transcript:[], intent:'Planning', topics:['Product launch','Mobile app'], summary:'Product team aligned on the mobile app launch, milestones, and ownership.', key_points:['Finalize onboarding flow','Begin development Monday'], created_at:'2026-06-18T10:24:00+07:00' },
  { id:'demo-2', title:'Client discovery call', source_language:'Japanese', target_language:'English', duration_seconds:1928, transcript:[], translated_transcript:[], intent:'Requirements gathering', topics:['Client needs','Timeline'], summary:'Client discovery call covering workflow requirements and delivery timelines.', key_points:['Share proposal this week','Confirm project scope'], created_at:'2026-06-15T14:10:00+07:00' },
  { id:'demo-3', title:'Weekly stand-up', source_language:'Korean', target_language:'English', duration_seconds:756, transcript:[], translated_transcript:[], intent:'Team update', topics:['Sprint','Blockers'], summary:'Weekly stand-up focused on progress, blockers, and the next sprint.', key_points:['Resolve authentication blocker','Prepare sprint demo'], created_at:'2026-06-11T09:05:00+07:00' }
]
let mockConversations = structuredClone(seed)

function throwDb(error) { if (error) { const failure = new Error(error.message); failure.status = 502; throw failure } }

export async function listConversations() {
  if (!isSupabaseConfigured) return structuredClone(mockConversations)
  const { data, error } = await supabase.from('conversations').select('*').order('created_at', { ascending:false })
  throwDb(error); return data
}

export async function getConversation(id) {
  if (!isSupabaseConfigured) return structuredClone(mockConversations.find(item => item.id === id) || null)
  const { data, error } = await supabase.from('conversations').select('*').eq('id', id).maybeSingle()
  throwDb(error); return data
}

export async function createConversation(input) {
  const record = { id:input.id || randomUUID(), title:input.title || 'Untitled conversation', source_language:input.source_language, target_language:input.target_language, duration_seconds:input.duration_seconds || 0, transcript:input.transcript || [], translated_transcript:input.translated_transcript || [], intent:input.intent || 'Pending analysis', topics:input.topics || [], summary:input.summary || 'Summary not generated yet', key_points:input.key_points || [], created_at:input.created_at || new Date().toISOString() }
  if (!isSupabaseConfigured) { mockConversations = [record, ...mockConversations.filter(item => item.id !== record.id)]; return structuredClone(record) }
  const { data, error } = await supabase.from('conversations').upsert(record).select().single()
  throwDb(error); return data
}

export async function deleteConversation(id) {
  if (!isSupabaseConfigured) { const found = mockConversations.some(item => item.id === id); mockConversations = mockConversations.filter(item => item.id !== id); return found }
  const { data, error } = await supabase.from('conversations').delete().eq('id', id).select('id')
  throwDb(error); return data.length > 0
}
