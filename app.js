(() => {
  'use strict';
  const APP_VERSION = '1.0.0';
  const app = document.getElementById('app');
  const fileInput = document.getElementById('jsonFile');
  let DATA = window.PRONABEC_DATA || {topics:[]};
  const PAGE_IMAGES = window.PRONABEC_PAGE_IMAGES || {};

  const state = {
    topicId: 'all', search: '', mode: 'practice', current: 0,
    answers: {}, marked: {}, order: [], contextExpanded: false,
    examSubmitted: false, datasetName: DATA?.metadata?.title || 'PRONABEC Razonamiento Verbal'
  };

  function storageKey(){
    const total = flattenAll().length;
    return `pronabec-sim-v1-${total}`;
  }
  function loadProgress(){
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey()) || '{}');
      state.answers = saved.answers || {};
      state.marked = saved.marked || {};
      state.mode = saved.mode || 'practice';
    } catch(_) {}
  }
  function saveProgress(){
    try { localStorage.setItem(storageKey(), JSON.stringify({answers:state.answers,marked:state.marked,mode:state.mode})); } catch(_) {}
  }
  function esc(s=''){ return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c])); }
  function norm(s=''){ return String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,''); }
  function flattenAll(){
    return (DATA.topics||[]).flatMap(t => (t.questions||[]).map(q => ({...q, topic:t, context:(t.contexts||[]).find(c=>String(c.id)===String(q.context_id))||null})));
  }
  function filtered(){
    let qs = flattenAll();
    if(state.topicId !== 'all') qs = qs.filter(q => String(q.topic_id) === String(state.topicId));
    const s=norm(state.search.trim());
    if(s) qs=qs.filter(q => norm([q.id,q.prompt,q.prelude_text,q.context?.text,...(q.alternatives||[]).map(a=>a.text)].join(' ')).includes(s));
    return qs;
  }
  function currentQuestions(){ return filtered(); }
  function currentQ(){ const qs=currentQuestions(); if(!qs.length)return null; state.current=Math.max(0,Math.min(state.current,qs.length-1)); return qs[state.current]; }
  function answeredCount(qs=currentQuestions()){ return qs.filter(q => state.answers[q.id]).length; }
  function correctCount(qs=currentQuestions()){ return qs.filter(q => state.answers[q.id] && state.answers[q.id]===q.correct_answer).length; }
  function scorePct(qs=currentQuestions()){ const ans=answeredCount(qs); return ans?Math.round(correctCount(qs)*100/ans):0; }
  function isFeedbackVisible(q){ return state.mode==='practice' ? !!state.answers[q.id] : state.examSubmitted; }
  function pageRange(q){
    const a=Number(q.original_page_start||0), b=Number(q.original_page_end||a); const out=[];
    for(let p=a;p<=b;p++) if(PAGE_IMAGES[p]) out.push(p); return out;
  }
  function toast(msg){
    const old=document.querySelector('.toast'); if(old)old.remove();
    const d=document.createElement('div'); d.className='toast'; d.textContent=msg; document.body.appendChild(d); setTimeout(()=>d.remove(),2600);
  }
  function setTopic(id){ state.topicId=id; state.current=0; state.examSubmitted=false; render(); }
  function setMode(mode){ state.mode=mode; state.examSubmitted=false; saveProgress(); render(); }
  function choose(letter){
    const q=currentQ(); if(!q)return;
    if(state.mode==='exam' && state.examSubmitted) return;
    state.answers[q.id]=letter; saveProgress(); renderQuestionArea();
  }
  function move(delta){ const qs=currentQuestions(); if(!qs.length)return; state.current=Math.max(0,Math.min(qs.length-1,state.current+delta)); state.contextExpanded=false; render(); window.scrollTo({top:0,behavior:'smooth'}); }
  function jump(i){ state.current=i; state.contextExpanded=false; render(); window.scrollTo({top:0,behavior:'smooth'}); }
  function toggleMark(){ const q=currentQ(); if(!q)return; state.marked[q.id]=!state.marked[q.id]; if(!state.marked[q.id]) delete state.marked[q.id]; saveProgress(); renderQuestionArea(); }
  function resetProgress(){ if(!confirm('¿Borrar todas tus respuestas y marcadores?'))return; state.answers={};state.marked={};state.examSubmitted=false;saveProgress();render();toast('Progreso reiniciado'); }
  function submitExam(){
    const qs=currentQuestions(); if(!qs.length)return;
    const n=answeredCount(qs); if(n<qs.length && !confirm(`Has respondido ${n} de ${qs.length}. ¿Finalizar de todos modos?`))return;
    state.examSubmitted=true; render(); showResults();
  }
  function showResults(){
    const qs=currentQuestions(), good=correctCount(qs), answered=answeredCount(qs), pct=qs.length?Math.round(good*100/qs.length):0;
    const rows=qs.map((q,i)=>{
      const a=state.answers[q.id]||'—', ok=a===q.correct_answer;
      return `<div class="result-row ${ok?'good':'bad'}"><b>${esc(q.id)}</b><span>${ok?'Correcta':'Tu respuesta: '+esc(a)+' · Correcta: '+esc(q.correct_answer)}</span><button class="btn compact" data-jump-result="${i}">Ver</button></div>`;
    }).join('');
    const modal=document.createElement('div'); modal.className='modal-backdrop'; modal.innerHTML=`<div class="modal">
      <div class="modal-head"><div><b>Resultados</b><div class="score-sub">${answered}/${qs.length} respondidas</div></div><button class="btn compact" data-close-modal>✕</button></div>
      <div class="modal-body"><div class="score-big">${pct}%</div><div class="score-sub">${good} correctas de ${qs.length} preguntas</div><div class="result-list">${rows}</div></div>
      <div class="modal-actions"><button class="btn" data-export>Exportar resultados</button><button class="btn primary" data-close-modal>Cerrar</button></div>
    </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click',e=>{
      if(e.target===modal || e.target.closest('[data-close-modal]')) modal.remove();
      const j=e.target.closest('[data-jump-result]'); if(j){ state.current=Number(j.dataset.jumpResult); modal.remove(); render(); }
      if(e.target.closest('[data-export]')) exportResults();
    });
  }
  function exportResults(){
    const qs=currentQuestions();
    const out={generated_at:new Date().toISOString(),mode:state.mode,topic:state.topicId,score:{correct:correctCount(qs),answered:answeredCount(qs),total:qs.length,percent:qs.length?Math.round(correctCount(qs)*100/qs.length):0},answers:qs.map(q=>({id:q.id,selected:state.answers[q.id]||null,correct:q.correct_answer,is_correct:state.answers[q.id]===q.correct_answer}))};
    const blob=new Blob([JSON.stringify(out,null,2)],{type:'application/json'}), a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='resultado_pronabec.json';a.click();URL.revokeObjectURL(a.href);
  }
  function importJSON(file){
    const r=new FileReader(); r.onload=()=>{
      try{ const d=JSON.parse(r.result); if(!d || !Array.isArray(d.topics)) throw new Error('Estructura no compatible'); DATA=d; state.topicId='all';state.current=0;state.answers={};state.marked={};state.examSubmitted=false;state.datasetName=file.name; render();toast(`JSON cargado: ${file.name}`); }
      catch(e){ alert('No se pudo cargar el JSON: '+e.message); }
    }; r.readAsText(file,'utf-8');
  }
  function renderSidebar(){
    const topics=DATA.topics||[];
    return `<aside class="sidebar">
      <div class="brand"><div class="brand-badge">P</div><div><h1>Simulador PRONABEC</h1><small>Razonamiento Verbal</small></div></div>
      <input id="searchInput" class="search" value="${esc(state.search)}" placeholder="Buscar pregunta, texto...">
      <div class="side-section"><div class="side-title">Temas</div><div class="topic-list">
        <button class="topic-btn ${state.topicId==='all'?'active':''}" data-topic="all"><span>Todos los ejercicios</span><span class="count-pill">${flattenAll().length}</span></button>
        ${topics.map(t=>`<button class="topic-btn ${String(state.topicId)===String(t.id)?'active':''}" data-topic="${esc(t.id)}"><span>${esc(t.topic_number+'. '+t.title)}</span><span class="count-pill">${(t.questions||[]).length}</span></button>`).join('')}
      </div></div>
      <div class="side-actions"><button data-load-json>📂 Cargar otro JSON</button><button data-reset>↺ Reiniciar progreso</button></div>
    </aside>`;
  }
  function renderHeader(){
    const qs=currentQuestions(), t=state.topicId==='all'?null:(DATA.topics||[]).find(x=>String(x.id)===String(state.topicId));
    const title=t?`${t.topic_number}. ${t.title}`:'Todos los ejercicios';
    return `<div class="topbar"><div class="topbar-left"><div class="eyebrow">${esc(state.datasetName)}</div><h2>${esc(title)}</h2></div>
      <div class="top-actions"><div class="mode-switch"><button data-mode="practice" class="${state.mode==='practice'?'active':''}">Práctica</button><button data-mode="exam" class="${state.mode==='exam'?'active':''}">Examen</button></div>
      ${state.mode==='exam'?'<button class="btn primary" data-submit>Finalizar examen</button>':'<button class="btn" data-results>Ver resultados</button>'}</div></div>
      <div class="stats"><div class="stat"><b>${qs.length}</b><span>Preguntas</span></div><div class="stat"><b>${answeredCount(qs)}</b><span>Respondidas</span></div><div class="stat"><b>${state.mode==='exam'&&!state.examSubmitted?'—':correctCount(qs)}</b><span>Correctas registradas</span></div><div class="stat"><b>${state.mode==='exam'&&!state.examSubmitted?'—':scorePct(qs)+'%'}</b><span>Precisión respondidas</span></div></div>
      <div class="progress-wrap"><div class="progress-row"><span>Progreso</span><span>${answeredCount(qs)} / ${qs.length}</span></div><div class="progress-bar"><div class="progress-fill" style="width:${qs.length?answeredCount(qs)*100/qs.length:0}%"></div></div></div>`;
  }
  function renderContext(q){
    if(!q.context)return '';
    const txt=q.context.text||''; const long=txt.length>1300; const collapsed=long&&!state.contextExpanded;
    const shown=collapsed?txt.slice(0,1300).replace(/\s+$/,'')+'…':txt;
    return `<section class="context"><h3>${esc(q.context.label||'Texto de referencia')}</h3><div class="context-text">${esc(shown)}</div>${long?`<button class="context-toggle" data-toggle-context>${collapsed?'Ver texto completo':'Contraer texto'}</button>`:''}</section>`;
  }
  function renderVisual(q){
    if(!q.requires_visual)return '';
    const pages=pageRange(q);
    return `<section class="visual-wrap"><div class="visual-title">Material visual de la página original ${esc(q.original_page_start)}${q.original_page_end&&q.original_page_end!==q.original_page_start?'–'+esc(q.original_page_end):''}</div>
      ${pages.length?`<div class="page-images">${pages.map(p=>`<img class="page-img" loading="lazy" data-zoom src="${esc(PAGE_IMAGES[p])}" alt="Página ${p}">`).join('')}</div>`:'<div>Este JSON marca la pregunta como visual, pero no incluye una imagen asociada.</div>'}
    </section>`;
  }
  function renderQuestion(){
    const q=currentQ(), qs=currentQuestions(); if(!q)return `<div class="card empty">No hay preguntas que coincidan con el filtro.</div>`;
    const selected=state.answers[q.id]; const show=isFeedbackVisible(q); const isCorrect=selected===q.correct_answer;
    const options=(q.alternatives||[]).map(a=>{
      let cls='option'; if(selected===a.letter)cls+=' selected'; if(show&&a.letter===q.correct_answer)cls+=' correct'; if(show&&selected===a.letter&&selected!==q.correct_answer)cls+=' incorrect';
      return `<div class="${cls}" data-option="${esc(a.letter)}"><div class="letter">${esc(a.letter)}</div><div class="option-text">${esc(a.text)}</div></div>`;
    }).join('');
    let feedback='';
    if(show){
      if(!selected) feedback=`<div class="feedback neutral">Sin respuesta. Respuesta correcta: <b>${esc(q.correct_answer)}</b> — ${esc(q.correct_answer_text||'')}</div>`;
      else feedback=`<div class="feedback ${isCorrect?'ok':'bad'}">${isCorrect?'✓ Correcto':'✕ Incorrecto'} · Respuesta correcta: <b>${esc(q.correct_answer)}</b>${q.correct_answer_text?' — '+esc(q.correct_answer_text):''}</div>`;
    }
    return `<article class="card question-card">
      <div class="q-head"><div class="q-meta"><span class="tag">Pregunta ${state.current+1} de ${qs.length}</span>${q.requires_visual?'<span class="tag visual">Visual</span>':''}${state.marked[q.id]?'<span class="tag marked">Marcada</span>':''}</div><span class="q-id">${esc(q.id)}</span></div>
      ${renderContext(q)}${renderVisual(q)}
      <div class="q-body">${q.prelude_text?`<div class="prelude">${esc(q.prelude_text)}</div>`:''}<p class="prompt">${esc(q.prompt)}</p><div class="options">${options}</div>${feedback}</div>
      <div class="q-footer"><div class="nav-group"><button class="btn" data-prev ${state.current===0?'disabled':''}>← Anterior</button><button class="btn" data-next ${state.current===qs.length-1?'disabled':''}>Siguiente →</button></div><div class="nav-group"><button class="btn" data-mark>${state.marked[q.id]?'Quitar marca':'Marcar para revisar'}</button>${state.mode==='exam'&&!state.examSubmitted?'<button class="btn primary" data-submit>Finalizar</button>':''}</div></div>
    </article>`;
  }
  function renderNavigator(){
    const qs=currentQuestions(); if(!qs.length)return '';
    return `<aside class="card navigator"><h3>Navegación</h3><div class="nav-grid">${qs.map((q,i)=>{
      const a=state.answers[q.id], show=isFeedbackVisible(q); let cls='nav-num'; if(i===state.current)cls+=' current'; if(a)cls+=' answered'; if(show&&a)cls+=a===q.correct_answer?' correct':' wrong'; if(state.marked[q.id])cls+=' marked'; return `<button class="${cls}" data-jump="${i}" title="${esc(q.id)}">${i+1}</button>`;
    }).join('')}</div><div class="legend"><span><i class="dot a"></i>Respondida</span><span><i class="dot m"></i>Marcada</span></div></aside>`;
  }
  function renderQuestionArea(){ render(); }
  function render(){
    app.innerHTML=`<div class="app-shell">${renderSidebar()}<main class="main">${renderHeader()}<div id="questionArea"><div class="workspace">${renderQuestion()}${renderNavigator()}</div></div></main></div>`;
    bindAll();
  }
  function bindDynamic(){
    document.querySelectorAll('[data-option]').forEach(el=>el.onclick=()=>choose(el.dataset.option));
    const prev=document.querySelector('[data-prev]');if(prev)prev.onclick=()=>move(-1); const next=document.querySelector('[data-next]');if(next)next.onclick=()=>move(1);
    document.querySelectorAll('[data-jump]').forEach(el=>el.onclick=()=>jump(Number(el.dataset.jump)));
    document.querySelectorAll('[data-mark]').forEach(el=>el.onclick=toggleMark);
    document.querySelectorAll('[data-submit]').forEach(el=>el.onclick=submitExam);
    const tc=document.querySelector('[data-toggle-context]');if(tc)tc.onclick=()=>{state.contextExpanded=!state.contextExpanded;renderQuestionArea();};
    document.querySelectorAll('[data-zoom]').forEach(img=>img.onclick=()=>{const z=document.createElement('div');z.className='zoom';z.innerHTML=`<img src="${img.src}">`;z.onclick=()=>z.remove();document.body.appendChild(z);});
  }
  function bindAll(){
    document.querySelectorAll('[data-topic]').forEach(el=>el.onclick=()=>setTopic(el.dataset.topic));
    const s=document.getElementById('searchInput'); if(s)s.oninput=()=>{state.search=s.value;state.current=0;render();setTimeout(()=>{const n=document.getElementById('searchInput');if(n){n.focus();n.setSelectionRange(n.value.length,n.value.length);}},0)};
    document.querySelectorAll('[data-mode]').forEach(el=>el.onclick=()=>setMode(el.dataset.mode));
    document.querySelectorAll('[data-load-json]').forEach(el=>el.onclick=()=>fileInput.click());
    document.querySelectorAll('[data-reset]').forEach(el=>el.onclick=resetProgress);
    document.querySelectorAll('[data-results]').forEach(el=>el.onclick=showResults);
    bindDynamic();
  }
  fileInput.addEventListener('change',()=>{ if(fileInput.files?.[0]) importJSON(fileInput.files[0]); fileInput.value=''; });
  document.addEventListener('keydown',e=>{
    if(['INPUT','TEXTAREA'].includes(document.activeElement?.tagName))return;
    if(e.key==='ArrowLeft'){e.preventDefault();move(-1)} if(e.key==='ArrowRight'){e.preventDefault();move(1)}
    if(/^[1-5]$/.test(e.key)){const q=currentQ(),a=q?.alternatives?.[Number(e.key)-1];if(a)choose(a.letter)}
  });
  loadProgress(); render();
})();
