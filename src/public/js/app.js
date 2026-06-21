(() => {
  const escape = value => String(value ?? '').replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]))
  const api = async (url, options={}) => {
    const response = await fetch(url,{headers:{'Content-Type':'application/json',...(options.headers || {})},...options})
    const payload = await response.json().catch(() => ({success:false,error:{message:'Invalid server response.'}}))
    if (!response.ok || !payload.success) throw new Error(payload.error?.message || 'Request failed.')
    return payload
  }
  const formatDuration = seconds => `${String(Math.floor((seconds || 0)/60)).padStart(2,'0')}:${String((seconds || 0)%60).padStart(2,'0')}`
  window.Voxly = { api, escape, formatDuration, refreshIcons:() => window.lucide?.createIcons() }
  document.addEventListener('DOMContentLoaded',() => {
    window.Voxly.refreshIcons()
    const toggle = document.querySelector('#menu-toggle'); const menu = document.querySelector('#mobile-menu')
    toggle?.addEventListener('click',() => { const open = menu.classList.toggle('hidden') === false; toggle.setAttribute('aria-expanded',String(open)); toggle.innerHTML = `<i data-lucide="${open ? 'x' : 'menu'}"></i>`; window.Voxly.refreshIcons() })
  })
})()
