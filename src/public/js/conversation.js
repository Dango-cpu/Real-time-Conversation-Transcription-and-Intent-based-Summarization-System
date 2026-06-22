document.addEventListener('DOMContentLoaded',() => {
  const {api,escape,formatDuration,refreshIcons} = window.Voxly
  const bars = [8,16,24,13,29,19,10,23,31,17,27,12,20,32,16,25,9,19,28,14,22,10,18,26]
  const waveform = document.querySelector('#waveform')
  waveform.innerHTML = bars.map((height,index) => `<span class="wave-bar w-1 rounded-full bg-[#d7d5ef]" style="height:${height}px;animation-delay:${index*55}ms"></span>`).join('')
  const source = document.querySelector('#source-language'), target = document.querySelector('#target-language'), speechModel = document.querySelector('#speech-model')
  const start = document.querySelector('#start-button'), pause = document.querySelector('#pause-button'), stop = document.querySelector('#stop-button')
  const statusNode = document.querySelector('#recording-status'), elapsedNode = document.querySelector('#elapsed'), errorNode = document.querySelector('#recorder-error')
  const summarySection = document.querySelector('#summary-section'), summaryButton = document.querySelector('#summary-button')
  const postRecordingLayout = document.querySelector('#post-recording-layout'), evaluationSection = document.querySelector('#evaluation-section')
  const recorderActions = document.querySelector('#recorder-actions'), recordingComplete = document.querySelector('#recording-complete')
  let recorder, stream, chunks=[], seconds=0, timer, status='Idle', transcript=[], translated=[], id=`conversation-${Date.now()}`

  const setStatus = next => {
    status=next; statusNode.querySelector('span').textContent=next
    statusNode.className=`flex h-[42px] items-center gap-2 rounded-xl px-4 text-sm font-bold ${next==='Recording'?'bg-red-50 text-red-500':next==='Completed'?'bg-emerald-50 text-emerald-600':'bg-[#f2f3f7] text-muted'}`
    const active=next==='Recording'; document.querySelector('#pulse-ring').classList.toggle('hidden',!active); document.querySelector('#pulse-ring').classList.toggle('pulse-ring',active)
    waveform.querySelectorAll('.wave-bar').forEach(bar => bar.classList.toggle('active',active))
    start.disabled=active || next==='Completed'; pause.disabled=!active; stop.disabled=!['Recording','Paused'].includes(next)
    start.querySelector('span').textContent=next==='Paused'?'Resume':'Start recording'
  }
  const tick = () => { clearInterval(timer); timer=setInterval(() => { seconds++; elapsedNode.textContent=formatDuration(seconds) },1000) }
  const friendlyError = error => { errorNode.textContent = error.name==='NotAllowedError' ? 'Microphone access was denied. Please allow access in your browser settings and try again.' : error.name==='NotFoundError' ? 'No microphone was found. Connect a microphone and try again.' : `Could not start recording: ${error.message}`; errorNode.classList.remove('hidden') }
  const renderPanel = (kind,messages) => { const panel=document.querySelector(`[data-panel="${kind}"]`); const translatedPanel=kind==='translated'; panel.querySelector('.panel-messages').innerHTML=messages.map(item => `<article class="max-w-[92%] rounded-2xl p-4 ${translatedPanel?'ml-auto rounded-tr-md bg-[#edfafd]':'rounded-tl-md bg-[#f1efff]'}"><div class="mb-1.5 flex items-center justify-between gap-4"><span class="text-xs font-bold ${translatedPanel?'text-[#168ca3]':'text-primary'}">${escape(item.speaker)}</span><time class="text-[11px] text-muted">${escape(item.timestamp)}</time></div><p class="text-[15px] leading-relaxed text-ink">${escape(item.text)}</p></article>`).join('') }
  const renderMetrics = model => {
    const selected = speechModel.selectedOptions[0]
    const metrics = model?.metrics || { rtf:Number(selected.dataset.rtf), wer:Number(selected.dataset.wer), bleu:Number(selected.dataset.bleu) }
    document.querySelector('#metric-model-name').textContent=model?.name || selected.dataset.name
    document.querySelector('#metric-rtf').textContent=`${metrics.rtf.toFixed(2)}×`
    document.querySelector('#metric-wer').textContent=`${metrics.wer.toFixed(1)}%`
    document.querySelector('#metric-bleu').textContent=metrics.bleu.toFixed(1)
  }
  const showCompletedLayout = () => {
    postRecordingLayout.classList.add('lg:grid-cols-2')
    evaluationSection.classList.remove('hidden')
    recorderActions.classList.add('hidden')
    recordingComplete.classList.remove('hidden')
    recordingComplete.classList.add('flex')
  }
  const begin = async () => {
    errorNode.classList.add('hidden')
    if (status==='Paused') { recorder.resume(); setStatus('Recording'); tick(); return }
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) return friendlyError({name:'Unsupported',message:'This browser does not support microphone recording.'})
    try { stream=await navigator.mediaDevices.getUserMedia({audio:true}); chunks=[]; recorder=new MediaRecorder(stream); recorder.ondataavailable=event => { if(event.data.size) chunks.push(event.data) }; recorder.start(1000); setStatus('Recording'); tick() } catch(error) { friendlyError(error) }
  }
  const pauseRecording = () => { if(recorder?.state==='recording'){recorder.pause();clearInterval(timer);setStatus('Paused')} }
  const stopRecording = async () => {
    stop.disabled=true; clearInterval(timer)
    try {
      const ended = new Promise(resolve => recorder.addEventListener('stop',resolve,{once:true})); recorder.stop(); await ended
      const blob = new Blob(chunks,{type:recorder.mimeType || 'audio/webm'}); stream?.getTracks().forEach(track=>track.stop())
      const result=await api('/api/processing/transcribe',{method:'POST',body:JSON.stringify({target_language:target.value,speech_model:speechModel.value,audio:{size:blob.size,type:blob.type}})})
      transcript=result.data.transcript; translated=result.data.translated_transcript; renderPanel('original',transcript);renderPanel('translated',translated);renderMetrics(result.data.model);showCompletedLayout();setStatus('Completed');summarySection.classList.remove('hidden')
      await save({summary:'Summary not generated yet',intent:'Pending analysis',topics:[],key_points:[]})
    } catch(error) { friendlyError(error); setStatus('Paused') }
  }
  const save = insight => api('/api/conversations',{method:'POST',body:JSON.stringify({id,title:'Recorded conversation',source_language:source.value==='Auto Detect'?'English (detected)':source.value,target_language:target.value,duration_seconds:seconds,transcript,translated_transcript:translated,...insight})})
  const summarize = async () => {
    summaryButton.disabled=true; summaryButton.querySelector('span').textContent='Generating…'
    try { const result=await api('/api/processing/summarize',{method:'POST',body:JSON.stringify({transcript})}); const insight=result.data; await save(insight); document.querySelector('#summary-prompt').classList.add('hidden'); const content=document.querySelector('#summary-content'); content.classList.remove('hidden'); content.innerHTML=`<div class="bg-gradient-to-r from-primary to-[#8175f1] p-6 text-white sm:p-8"><div class="mb-3 flex items-center gap-2 text-sm font-bold text-white/80"><i data-lucide="sparkles" class="h-4 w-4"></i>Mock conversation insight</div><h2 class="font-display text-2xl font-bold">Conversation summary</h2><p class="mt-3 max-w-4xl leading-relaxed text-white/90">${escape(insight.summary)}</p></div><div class="grid divide-y divide-[#ececf3] md:grid-cols-3 md:divide-x md:divide-y-0"><div class="p-6"><h3 class="mb-4 font-display font-bold">Main topics</h3><div class="flex flex-wrap gap-2">${insight.topics.map(v=>`<span class="rounded-full bg-primary/8 px-3 py-1 text-xs font-bold text-primary">${escape(v)}</span>`).join('')}</div></div><div class="p-6"><h3 class="mb-4 font-display font-bold">Detected intent</h3><p class="text-sm text-muted">${escape(insight.intent)}</p></div><div class="p-6"><h3 class="mb-4 font-display font-bold">Key points</h3><ul class="space-y-2">${insight.key_points.map(v=>`<li class="text-sm text-muted">✓ ${escape(v)}</li>`).join('')}</ul></div></div>`;refreshIcons() } catch(error) { friendlyError(error);summaryButton.disabled=false;summaryButton.querySelector('span').textContent='Generate summary' }
  }
  source.addEventListener('change',()=>document.querySelector('[data-panel="original"] .panel-subtitle').textContent=source.value==='Auto Detect'?'Language detected automatically':source.value)
  target.addEventListener('change',()=>document.querySelector('[data-panel="translated"] .panel-subtitle').textContent=`Translated to ${target.value}`)
  start.addEventListener('click',begin);pause.addEventListener('click',pauseRecording);stop.addEventListener('click',stopRecording);summaryButton.addEventListener('click',summarize)
})
