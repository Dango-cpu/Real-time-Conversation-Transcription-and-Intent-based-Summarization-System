import { Router } from 'express'
import { listSpeechModels } from '../services/evaluationMetricsService.js'
const router = Router()
const languages = { sourceLanguages:['Auto Detect','Vietnamese','English','Japanese','Korean','Chinese'], targetLanguages:['Vietnamese','English','Japanese','Korean','Chinese'] }
const page = (view,title,active,pageScript) => (req,res) => res.render(view,{title,active,pageScript,database:res.locals.database,speechModels:listSpeechModels(),...languages})
router.get('/', page('dashboard','Voxly — Real-time Voice Translator','home'))
router.get('/conversation', page('conversation','Live conversation — Voxly','conversation','conversation.js'))
router.get('/history', page('history','Conversation history — Voxly','history','history.js'))
router.get('/history/:id', (req,res) => res.render('conversation-detail',{title:'Conversation recap — Voxly',active:'history',pageScript:'conversation-detail.js',conversationId:req.params.id,database:res.locals.database}))
export default router
