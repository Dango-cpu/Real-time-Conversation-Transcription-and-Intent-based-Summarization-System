import { Router } from 'express'
import * as api from '../controllers/apiController.js'
import { validateConversation, validateInsights, validateProcessing } from '../middleware/validate.js'
const router = Router()
router.get('/status', api.status)
router.get('/conversations', api.list)
router.get('/conversations/:id', api.detail)
router.post('/conversations', validateConversation, api.create)
router.delete('/conversations/:id', api.remove)
router.post('/processing/transcribe', validateProcessing, api.processRecording)
router.post('/processing/summarize', validateInsights, api.generateInsights)
export default router
