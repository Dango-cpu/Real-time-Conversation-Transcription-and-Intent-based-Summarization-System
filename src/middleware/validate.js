const languages = ['Auto Detect','Vietnamese','English','Japanese','Korean','Chinese','English (detected)']
const speechModels = ['cnn-bilstm-ctc','simplified-deepspeech','seq2seq-encoder-decoder']
const fail = (res,message) => res.status(400).json({success:false,error:{code:'VALIDATION_ERROR',message}})
export function validateConversation(req,res,next) {
  const body = req.body
  if (!body || typeof body !== 'object') return fail(res,'A JSON request body is required.')
  if (body.id !== undefined && (typeof body.id !== 'string' || !/^[a-zA-Z0-9_-]{1,120}$/.test(body.id))) return fail(res,'id contains unsupported characters.')
  if (!languages.includes(body.source_language)) return fail(res,'source_language is invalid.')
  if (!languages.includes(body.target_language) || body.target_language === 'Auto Detect') return fail(res,'target_language is invalid.')
  for (const key of ['title','intent','summary']) if (body[key] !== undefined && (typeof body[key] !== 'string' || body[key].length > 10000)) return fail(res,`${key} must be a string of at most 10000 characters.`)
  if (body.duration_seconds !== undefined && (!Number.isInteger(body.duration_seconds) || body.duration_seconds < 0 || body.duration_seconds > 86400)) return fail(res,'duration_seconds must be an integer from 0 to 86400.')
  for (const key of ['transcript','translated_transcript','topics','key_points']) if (body[key] !== undefined && (!Array.isArray(body[key]) || body[key].length > 500)) return fail(res,`${key} must be an array with at most 500 items.`)
  for (const key of ['topics','key_points']) if (body[key]?.some(item => typeof item !== 'string' || item.length > 1000)) return fail(res,`${key} must contain strings of at most 1000 characters.`)
  for (const key of ['transcript','translated_transcript']) if (body[key]?.some(item => !item || typeof item !== 'object' || typeof item.text !== 'string' || item.text.length > 10000)) return fail(res,`${key} contains an invalid message.`)
  if (body.created_at !== undefined && (typeof body.created_at !== 'string' || Number.isNaN(Date.parse(body.created_at)))) return fail(res,'created_at must be a valid date string.')
  next()
}
export function validateProcessing(req,res,next) {
  if (!req.body || !languages.includes(req.body.target_language)) return fail(res,'A valid target_language is required.')
  if (!speechModels.includes(req.body.speech_model)) return fail(res,'A valid speech_model is required.')
  next()
}
export function validateInsights(req,res,next) {
  if (!req.body || !Array.isArray(req.body.transcript) || req.body.transcript.length === 0) return fail(res,'A non-empty transcript array is required.')
  next()
}
