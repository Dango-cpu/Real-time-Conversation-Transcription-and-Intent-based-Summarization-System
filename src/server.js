import 'dotenv/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import { engine } from 'express-handlebars'
import { databaseStatus } from './config/supabase.js'
import pageRoutes from './routes/pageRoutes.js'
import apiRoutes from './routes/apiRoutes.js'

const app = express()
const root = path.dirname(fileURLToPath(import.meta.url))
app.engine('hbs', engine({ extname:'.hbs', defaultLayout:'main', helpers:{ eq:(a,b)=>a===b, json:value=>JSON.stringify(value) } }))
app.set('view engine','hbs'); app.set('views',path.join(root,'views'))
app.use(express.json({limit:'2mb'})); app.use(express.static(path.join(root,'public')))
app.use((req,res,next) => { res.locals.database = databaseStatus(); next() })
app.use('/api',apiRoutes); app.use('/',pageRoutes)
app.use((req,res) => { if (req.path.startsWith('/api')) return res.status(404).json({success:false,error:{code:'NOT_FOUND',message:'API route not found.'}}); res.status(404).render('404',{title:'Page not found — Voxly'}) })
app.use((error,req,res,next) => { void next; console.error(error); if (req.path.startsWith('/api')) return res.status(error.status || 500).json({success:false,error:{code:'SERVER_ERROR',message:error.status ? error.message : 'An unexpected server error occurred.'}}); res.status(error.status || 500).render('error',{title:'Something went wrong — Voxly',message:error.status ? error.message : 'Please try again in a moment.'}) })
const port = Number(process.env.PORT) || 3000
app.listen(port,() => console.log(`Voxly listening on http://localhost:${port} (${databaseStatus().mode} database mode)`))
